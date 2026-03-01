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

        // 3. Call Groq Vision — Senior UI Auditor Prompt
        console.log('[Compare] Calling Groq Vision API...');

        const systemPrompt = `You are a Senior UI Auditor who specializes in design-to-developer handoff quality assurance. Your job is to identify every pixel-level discrepancy between a designer's mockup and a developer's implementation. You are meticulous, harsh, and never give a perfect score unless the screenshots are literally indistinguishable. You express measurements in approximate pixel values and reference specific CSS properties. If the two images show completely different content, the score MUST be 0-10.`;

        const userPrompt = `Perform a thorough UI audit comparing these two screenshots.

IMAGE 1 = The original DESIGN mockup (created by the designer in Figma/Sketch).
IMAGE 2 = The DEVELOPER BUILD (the actual coded implementation in a browser).

Audit the following 6 categories systematically:

1. SPACING: Check padding inside every component, margins between components, gap between elements. Estimate differences in pixels (e.g., "top padding is ~8px too large").

2. TYPOGRAPHY: Check font-size, font-weight (bold vs regular vs semibold), line-height, letter-spacing, text-transform (uppercase vs lowercase), and text alignment for every text element.

3. COLOR: Check exact background colors, text colors, border colors, and shadow colors. Reference approximate hex values when possible (e.g., "background is #1a1a2e in design but appears as #0d0d1a in build").

4. LAYOUT: Check container widths, element positions, flex/grid alignment, vertical/horizontal centering, and overall page structure.

5. COMPONENT: Check border-radius values, box-shadow depth/spread, button heights/widths, input field sizes, icon sizes, and interactive element dimensions.

6. CONTENT: Check for missing text, extra elements, wrong icons, truncated strings, or placeholder content that wasn't replaced.

SCORING RULES:
- 0-10: Images show completely different content or pages.
- 11-50: Same page but with many structural differences.
- 51-80: Same page, mostly correct, but several spacing/typography/color issues.
- 81-94: Very close match with only minor pixel-level discrepancies.
- 95-100: Virtually pixel-perfect. Reserve this ONLY for near-identical screenshots.

You MUST return at least 1 finding. Be extremely thorough.

Return ONLY valid JSON (no markdown fences, no explanation text):
{
  "score": <number 0-100>,
  "findings": [
    {
      "id": "<unique-string>",
      "category": "<spacing|typography|color|layout|component|content>",
      "severity": "<high|medium|low>",
      "description": "<specific actionable description of the discrepancy>",
      "location_hint": "<which part of the screen or which UI element>",
      "expected": "<what the design shows, e.g. 'padding: 16px' or 'font-weight: 600' or '#1a1a2e'>",
      "actual": "<what the build shows, e.g. 'padding: 24px' or 'font-weight: 400' or '#0d0d1a'>"
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
