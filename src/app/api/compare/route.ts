import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        // Parse FormData from the client
        const formData = await req.formData();
        const designFile = formData.get('designImage') as File | null;
        const buildFile = formData.get('implementationImage') as File | null;
        const projectName = (formData.get('projectName') as string) || 'Untitled Project';

        if (!designFile || !buildFile) {
            return NextResponse.json({ error: 'Missing image files' }, { status: 400 });
        }

        console.log('[Compare] Received files. Design:', designFile.name, designFile.size, 'Build:', buildFile.name, buildFile.size);

        // 1. Upload to Supabase Storage
        const compId = crypto.randomUUID();
        const extA = designFile.name.split('.').pop() || 'png';
        const extB = buildFile.name.split('.').pop() || 'png';
        const pathA = `${user.id}/${compId}-design.${extA}`;
        const pathB = `${user.id}/${compId}-build.${extB}`;

        const [uploadA, uploadB] = await Promise.all([
            supabase.storage.from('designs').upload(pathA, designFile),
            supabase.storage.from('designs').upload(pathB, buildFile),
        ]);

        if (uploadA.error || uploadB.error) {
            console.error('[Compare] Upload error:', JSON.stringify(uploadA.error || uploadB.error));
            return NextResponse.json({
                error: `Upload failed: ${(uploadA.error || uploadB.error)?.message}`
            }, { status: 500 });
        }

        console.log('[Compare] Images uploaded to storage.');

        // 2. Convert to Base64 for Groq Vision
        const designBuffer = Buffer.from(await designFile.arrayBuffer());
        const buildBuffer = Buffer.from(await buildFile.arrayBuffer());

        const designBase64 = `data:${designFile.type || 'image/png'};base64,${designBuffer.toString('base64')}`;
        const buildBase64 = `data:${buildFile.type || 'image/png'};base64,${buildBuffer.toString('base64')}`;

        // 3. Call Groq Vision with a strict QA prompt
        console.log('[Compare] Calling Groq Vision API...');

        const systemPrompt = `You are an extremely strict and critical Frontend QA Engineer. You NEVER say two images are identical unless they are literally the same pixel-for-pixel screenshot. You are known for being harsh and finding every tiny difference. If the two images show completely different content or different pages, the score must be 0-10. Be brutally honest.`;

        const userPrompt = `Analyze these two UI screenshots for visual differences.

IMAGE 1 = The expected Design / Reference screenshot.
IMAGE 2 = The actual Implementation / Built screenshot.

RULES:
- If the images show COMPLETELY DIFFERENT content (different pages, different apps, different text), the score MUST be between 0 and 10.
- If the images show the SAME page but with differences, score between 11 and 94 based on severity.
- Only score 95-100 if the images are virtually pixel-perfect identical.
- You MUST list at least 1 finding. An empty findings array is NOT allowed.
- Be extremely critical. Even tiny differences in font size, color shade, spacing, or alignment count.

For each difference found, categorize it as: typography, spacing, color, layout, or content.

Return ONLY a valid JSON object (no markdown, no explanation):
{
  "score": <number 0-100>,
  "findings": [
    {
      "id": "<unique-id>",
      "category": "<typography|spacing|color|layout|content>",
      "description": "<specific actionable description>",
      "severity": "<high|medium|low>",
      "location_hint": "<where on the screen>"
    }
  ]
}`;

        const completion = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: userPrompt },
                        { type: "image_url", image_url: { url: designBase64 } },
                        { type: "image_url", image_url: { url: buildBase64 } }
                    ],
                }
            ],
            temperature: 0.2,
        });

        const responseContent = completion.choices[0]?.message?.content || '{}';
        console.log('[Compare] Groq response:', responseContent.substring(0, 500));

        // 4. Parse JSON — handle markdown code fences
        let analysis;
        try {
            let cleaned = responseContent.trim();
            if (cleaned.startsWith('```json')) {
                cleaned = cleaned.slice(7);
            } else if (cleaned.startsWith('```')) {
                cleaned = cleaned.slice(3);
            }
            if (cleaned.endsWith('```')) {
                cleaned = cleaned.slice(0, -3);
            }
            analysis = JSON.parse(cleaned.trim());
        } catch (e) {
            console.error('[Compare] Failed to parse Groq response:', responseContent);
            analysis = {
                score: 50,
                findings: [
                    {
                        id: 'parse-error',
                        category: 'content',
                        severity: 'medium',
                        description: 'AI analysis returned improperly formatted results. Please try again.',
                        location_hint: 'entire page'
                    }
                ]
            };
        }

        // 5. Save to database
        const { data: dbRecord, error: dbError } = await supabase
            .from('comparisons')
            .insert({
                user_id: user.id,
                project_name: projectName,
                design_image_url: pathA,
                implementation_image_url: pathB,
                score: analysis.score || 0,
                findings: analysis.findings || [],
                status: (analysis.score || 0) >= 95 ? 'match' : (analysis.score || 0) >= 70 ? 'partial' : 'fail'
            })
            .select()
            .single();

        if (dbError) {
            console.error('[Compare] DB Insert Error:', JSON.stringify(dbError));
        }

        console.log('[Compare] ✅ Done. Score:', analysis.score, 'Findings:', (analysis.findings || []).length);

        return NextResponse.json({
            id: dbRecord?.id || 'temp-id',
            score: analysis.score || 0,
            findings: analysis.findings || [],
            diffImageUrl: null
        });

    } catch (error: any) {
        console.error('[Compare] ❌ Error:', error?.message || error);
        return NextResponse.json({
            error: error?.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
