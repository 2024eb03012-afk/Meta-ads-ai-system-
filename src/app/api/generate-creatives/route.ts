import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productName, productTagline, productCategory, highlightedBenefit, imageBase64 } = body;

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemPrompt = `You are an elite luxury creative director specialized in beauty and skincare marketing visuals.
Your job is to design high-end visual concepts for premium skincare advertising creatives.
Your work combines editorial fashion photography, luxury product styling, and direct-response advertising psychology.
Every concept must feel elegant, minimal, and emotionally compelling.

You must generate exactly three creative concepts.

Creative 1
Instagram Post hero product image

Creative 2
Instagram Story immersive vertical visual

Creative 3
Ad Creative designed to stop scrolling

Each concept must include
assetType
backgroundTone
surfaceType
accentProp
lighting
cameraAngle
overlayText

Rules
Each creative must look different.
Do not repeat props or lighting styles.
Maintain luxury skincare aesthetic.
Keep compositions minimal and premium.

Return output strictly in JSON format.

JSON structure
assets array containing three objects.
Each object must contain
assetType
backgroundTone
surfaceType
accentProp
lighting
cameraAngle
overlayText`;

        const userPrompt = `Product Name: ${productName}
Product Tagline: ${productTagline}
Product Category: ${productCategory}
Highlighted Benefit: ${highlightedBenefit}

Brand Tone:
Luxury minimal skincare aesthetic.

Generate three creative visual concepts following the system instructions.
Return JSON.`;

        let contents = [];
        if (imageBase64 && imageBase64.startsWith('data:image')) {
            const base64Data = imageBase64.split(',')[1];
            const mimeType = imageBase64.split(';')[0].split(':')[1];
            contents = [
                {
                    inlineData: { data: base64Data, mimeType }
                },
                userPrompt
            ];
        } else {
            contents = [userPrompt];
        }

        let response;
        try {
            response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: contents,
                config: { systemInstruction: systemPrompt }
            });
        } catch (e) {
            // fallback to gemini-2.5-flash if gemini-3 fails
            response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contents,
                config: { systemInstruction: systemPrompt }
            });
        }

        const text = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);

        // System prompt for Image Prompt Engineer step internally handled here to assemble prompts
        const nanoBananaPrompts = parsed.assets.map((concept: any, index: number) => {
            let basePrompt = '';
            let aspect = '1:1';
            let purpose = '';

            if (index === 0 || concept.assetType.toLowerCase().includes('post')) {
                purpose = 'Instagram Post';
                aspect = '1:1';
                basePrompt = `Create a photorealistic luxury skincare Instagram product visual.
Product name: ${productName}
Place the product on: ${concept.surfaceType}
Background environment: ${concept.backgroundTone}
Accent prop: ${concept.accentProp}
Lighting style: ${concept.lighting}
Camera angle: ${concept.cameraAngle}
Brand aesthetic: minimal luxury skincare campaign
Overlay text: ${concept.overlayText}
The image must feel editorial, elegant, and premium like a luxury beauty campaign.`;
            } else if (index === 1 || concept.assetType.toLowerCase().includes('story')) {
                purpose = 'Instagram Story';
                aspect = '9:16';
                basePrompt = `Create a vertical Instagram Story product visual.
Product name: ${productName}
Place the product on: ${concept.surfaceType}
Background environment: ${concept.backgroundTone}
Accent prop: ${concept.accentProp}
Lighting style: ${concept.lighting}
Camera angle: ${concept.cameraAngle}
Brand aesthetic: luxury skincare minimal elegance
Overlay text: ${concept.overlayText}
The image should feel immersive and mobile optimized.`;
            } else {
                purpose = 'Ad Creative';
                aspect = '1:1';
                basePrompt = `Create a bold advertising visual for Meta ads.
Product name: ${productName}
Place the product on: ${concept.surfaceType}
Background environment: ${concept.backgroundTone}
Accent prop: ${concept.accentProp}
Lighting style: ${concept.lighting}
Camera angle: ${concept.cameraAngle}
Brand aesthetic: high impact luxury skincare advertisement
Overlay text: ${concept.overlayText}
The image must be scroll stopping and visually striking.`;
            }

            return {
                ...concept,
                generatedPrompt: basePrompt,
                aspectRatio: aspect,
                purpose
            };
        });

        const apiKey = process.env.NANO_BANANA_API_KEY || '';

        // Mocking Nano Banana Image API generate step
        // In reality, this would be a fetch to api.nanobanana.com/generate
        const finalResults = await Promise.all(nanoBananaPrompts.map(async (concept: any, i: number) => {
            // Attempt to fetch from Nano Banana, fallback to placeholders if API throws/fails
            let imageUrl = '';
            try {
                if (apiKey) {
                    const nbResponse = await fetch('https://api.nanobanana.com/v1/generate', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt: concept.generatedPrompt, aspect_ratio: concept.aspectRatio })
                    });
                    if (nbResponse.ok) {
                        const nbData = await nbResponse.json();
                        imageUrl = nbData.image_url;
                    } else {
                        throw new Error('Nano Banana API Failed');
                    }
                } else {
                    throw new Error('No API Key');
                }
            } catch (err) {
                // Fallback dummy images matching the luxury aspect ratio
                const width = concept.aspectRatio === '9:16' ? 576 : 1024;
                const height = concept.aspectRatio === '9:16' ? 1024 : 1024;
                const dummyColor = ['000000', '1A1A1A', '333333'][i];
                imageUrl = `https://placehold.co/${width}x${height}/${dummyColor}/FFFFFF.png?text=Luxury+${concept.purpose.replace(/ /g, '+')}`;
            }

            return {
                ...concept,
                imageUrl
            };
        }));

        return NextResponse.json({ success: true, creatives: finalResults });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
