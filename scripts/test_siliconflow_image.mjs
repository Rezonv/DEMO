import fetch from 'node-fetch';

const API_KEY = "sk-mghoezswrddllcqoyefsedgqrsmtnjvikqbbklnqculxwpap";
const BASE_URL = "https://api.siliconflow.com/v1";

async function testImageGen() {
    console.log("Testing SiliconFlow Image Generation...");

    const url = `${BASE_URL}/images/generations`;
    const payload = {
        model: "black-forest-labs/FLUX.1-schnell", // Trying Schnell first as it's usually free/cheap and fast
        prompt: "anime style, beautiful girl, white hair, red eyes, detailed face, masterpiece, best quality",
        image_size: "1024x1024",
        num_inference_steps: 20
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error: ${response.status} - ${text}`);
            return;
        }

        const data = await response.json();
        console.log("Success!");
        console.log("Image URL:", data.data[0].url);
    } catch (e) {
        console.error("Exception:", e);
    }
}

testImageGen();
