import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 60; // Allow more time for LLM processing

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { designImage, implementationImage, projectName } = body;

        if (!designImage || !implementationImage) {
            return NextResponse.json({ error: 'Missing image paths' }, { status: 400 });
        }

        // 1. Download images from Supabase Storage
        const { data: designData, error: designError } = await supabase.storage
            .from('designs')
            .download(designImage);

        const { data: buildData, error: buildError } = await supabase.storage
            .from('designs')
            .download(implementationImage);

        if (designError || buildError || !designData || !buildData) {
            console.error('Storage Error:', designError || buildError);
            return NextResponse.json({ error: 'Failed to download images' }, { status: 500 });
        }

        const designBuffer = Buffer.from(await designData.arrayBuffer());
        const buildBuffer = Buffer.from(await buildData.arrayBuffer());

        const designBase64 = `data:${designData.type};base64,${designBuffer.toString('base64')}`;
        const buildBase64 = `data:${buildData.type};base64,${buildBuffer.toString('base64')}`;

        // 2. Call Groq Llama 3 Vision
        const prompt = `You are an expert Frontend Quality Assurance Engineer and Designer.
I am providing you with two images:
1. The first image is the original Design Mockup.
2. The second image is the built Implementation.

Compare the Implementation to the Design. Look for differences in:
- Typography (font size, weight, alignment constraints)
- Spacing (margins, padding, gap)
- Colors (backgrounds, text, borders)
- Layout structure and missing/extra elements

Return a strictly valid JSON object with EXACTLY this structure:
{
  "score": <number between 0 and 100 representing how close the implementation matches the design (100 is perfect)>,
  "findings": [
    {
      "id": "<generate a random string id>",
      "category": "<typography|spacing|color|layout|content>",
      "description": "<A short, actionable description of the difference>",
      "severity": "<high|medium|low>",
      "location_hint": "<The general location or name of the UI element>"
    }
  ]
}

No markdown blocks, no other text. Just the JSON.`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.2-90b-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: designBase64 } },
                        { type: "image_url", image_url: { url: buildBase64 } }
                    ],
                }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content || '{}';

        // Ensure parsing works
        let analysis;
        try {
            analysis = JSON.parse(responseContent);
        } catch (e) {
            console.error('Failed to parse Groq response:', responseContent);
            return NextResponse.json({ error: 'Invalid analysis from AI' }, { status: 500 });
        }

        // 3. Save to database
        const { data: dbRecord, error: dbError } = await supabase
            .from('comparisons')
            .insert({
                user_id: user.id,
                project_name: projectName || 'Untitled Project',
                design_image_url: designImage,
                implementation_image_url: implementationImage,
                score: analysis.score || 0,
                findings: analysis.findings || [],
                status: analysis.score === 100 ? 'match' : 'fail'
            })
            .select()
            .single();

        if (dbError) {
            console.error('DB Insert Error:', dbError);
        }

        return NextResponse.json({
            id: dbRecord?.id || 'temp-id',
            score: analysis.score || 0,
            findings: analysis.findings || [],
            diffImageUrl: null
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
