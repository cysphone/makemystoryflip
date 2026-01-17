import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

// Initialize Gemini
// Note: We create a new instance per request to ensure env vars are fresh
function getAI() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from .env file");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export async function POST(req) {
    try {
        console.log("⚡ [API] Request received");

        // 1. Parse Form Data
        const formData = await req.formData();
        const mode = formData.get('mode') || 'couple';
        const name1 = formData.get('name1');
        const name2 = formData.get('name2');
        const file1 = formData.get('img1');
        const file2 = formData.get('img2');
        const genre = formData.get('genre') || 'romantic';
        const style = formData.get('style') || 'comic';
        const plot = formData.get('plot') || '';

        // Validation based on mode
        if (!name1 || (mode !== 'solo' && !name2)) {
            return NextResponse.json({ error: "Missing required names" }, { status: 400 });
        }

        const comicId = uuidv4();
        const ai = getAI();

        // --- Helper: Analyze Image for Character Description ---
        async function analyzeCharacter(file, name) {
            if (!file || typeof file === 'string') return `${name}`;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const base64Data = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = file.type || 'image/jpeg';

                const model = "gemini-1.5-flash";
                const result = await ai.models.generateContent({
                    model: model,
                    contents: [
                        {
                            text: `Analyze this person's face and appearance in extreme detail for a character consistency reference.
                     Focus on:
                     1. Hair (color, exact style, length, texture)
                     2. Eyes (color, shape)
                     3. Skin tone and complexion
                     4. Distinct facial features (beard, glasses, freckles, mole, face shape)
                     5. Age approximation
                     
                     Output format: '[Name] has [detailed description].'
                     Keep it under 50 words but make it very specific.`
                        },
                        { inlineData: { data: base64Data, mimeType: mimeType } }
                    ]
                });
                const desc = result.candidates[0].content.parts[0].text.trim();
                console.log(`👁️ Vision Analysis (${name}): ${desc}`);
                return desc;
            } catch (e) {
                console.error(`Vision Error (${name}):`, e);
                return `${name}`;
            }
        }

        // 2. Perform Vision Analysis
        console.log(`⚡ [${comicId}] Analyzing uploaded photos (Mode: ${mode})...`);
        let desc1, desc2;

        if (mode === 'solo') {
            desc1 = await analyzeCharacter(file1, name1);
            desc2 = null; // No second character
        } else {
            [desc1, desc2] = await Promise.all([
                analyzeCharacter(file1, name1),
                analyzeCharacter(file2, name2)
            ]);
        }

        console.log(`⚡ [${comicId}] Generating Story with gemini-2.0-flash-exp...`);

        // 3. Generate Story
        let storyPromptContext = "";
        let characterNames = "";

        if (mode === 'solo') {
            storyPromptContext = `Create a 6-panel comic script about ${name1}. VISUAL DATA: ${desc1}.`;
            characterNames = name1;
        } else {
            storyPromptContext = `Create a 6-panel comic script for a ${mode === 'friends' ? 'pair of best friends' : 'couple'} named ${name1} and ${name2}. VISUAL DATA 1: ${desc1}. VISUAL DATA 2: ${desc2}.`;
            characterNames = `${name1} and ${name2}`;
        }

        // Inject User Plot
        if (plot) {
            storyPromptContext += `\nSPECIFIC PLOT DETAILS PROVIDED BY USER (MUST FOLLOW): ${plot}`;
        }

        const storySystemInstruction = `
        You are a master comic book writer specializing in ${genre} stories.
        ${storyPromptContext}
        
        Art Style: ${style}
        Tone: ${genre}
        
        Output strict JSON only.
        Format:
        {
          "title": "Story Title",
          "panels": [
            {
               "caption": "Narrative text",
               "dialogue": "Character dialogue",
               "image_prompt": "detailed ${style} style illustration of ${characterNames}, [action], perfect faces, cinematic lighting, ${genre} atmosphere"
            }
          ]
        }
        `;

        let story;
        try {
            const storyResp = await ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: [{ text: storySystemInstruction }],
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.8 // Increased for variety
                }
            });

            let text = storyResp.candidates[0].content.parts[0].text;
            text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
            story = JSON.parse(text);
        } catch (e) {
            console.error("Story Gen Error:", e);
            return NextResponse.json({ error: `Story Model Failed: ${e.message}` }, { status: 500 });
        }

        console.log(`⚡ [${comicId}] Story Generated: "${story.title}". Generating Images...`);

        // 4. Generate Images
        const panelsWithImages = [];

        // Vercel/Serverless: We cannot use local file system persistence
        // We will return Data URIs directly.

        // Sequential generation with delay to avoid rate limits
        for (let i = 0; i < story.panels.length; i++) {
            const panel = story.panels[i];

            // Add slight delay between requests (1s) to help with rate limits
            if (i > 0) await new Promise(r => setTimeout(r, 1000));

            let visualConsistency = `- ${name1}: ${desc1}`;
            if (desc2) visualConsistency += `\n- ${name2}: ${desc2}`;

            const finalPrompt = `
            ${style} style comic panel. ${genre} atmosphere.
            ${panel.image_prompt}
            
            Key Visual Traits to maintain:
            ${visualConsistency}
            
            High quality, masterpiece, detailed textures, expressive faces.
            `;

            try {
                const imgResp = await ai.models.generateContent({
                    model: "gemini-2.0-flash-exp",
                    contents: [{ text: finalPrompt }],
                    generationConfig: { responseModalities: ["Image"] }
                });

                const imgPart = imgResp.candidates[0].content.parts.find(x => x.inlineData);
                if (!imgPart) throw new Error("No image data in response");

                // Create Data URI (Stateless)
                const base64Image = `data:image/png;base64,${imgPart.inlineData.data}`;

                panelsWithImages.push({
                    ...panel,
                    image: base64Image
                });

            } catch (imgErr) {
                console.error(`Image Gen Error (Panel ${i}):`, imgErr);
                console.log(`Falling back to Pollinations for Panel ${i}`);

                // Enhance fallback prompt
                const simplePrompt = `${style} comic panel, ${genre}, ${characterNames}, ${panel.image_prompt}`;
                const promptEncoded = encodeURIComponent(simplePrompt.slice(0, 500));

                panelsWithImages.push({
                    ...panel,
                    image: `https://image.pollinations.ai/prompt/${promptEncoded}?width=1024&height=1024&nologo=true&seed=${Math.random()}`,
                    fallback: true
                });
            }
        }

        return NextResponse.json({
            success: true,
            comicId: comicId,
            title: story.title,
            panels: panelsWithImages
        });

    } catch (err) {
        console.error("Critical API Error:", err);
        return NextResponse.json({
            error: "CRITICAL_FAILURE",
            message: err.message
        }, { status: 500 });
    }
}
