import fetch from 'node-fetch';

const API_KEY = "sk-mghoezswrddllcqoyefsedgqrsmtnjvikqbbklnqculxwpap";
const BASE_URL = "https://api.siliconflow.com/v1";

async function listModels() {
    console.log("Fetching SiliconFlow Models...");

    const url = `${BASE_URL}/models`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Error: ${response.status} - ${text}`);
            return;
        }

        const data = await response.json();
        console.log("Success! Found models:");

        // List all text models
        const textModels = data.data.filter(m => m.type === 'text' || m.id.includes('chat') || m.id.includes('instruct'));
        console.log("\n--- TEXT MODELS ---");
        textModels.forEach(model => {
            console.log(`- ${model.id}`);
        });

    } catch (e) {
        console.error("Exception:", e);
    }
}

listModels();
