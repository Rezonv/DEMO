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

        // Filter for Flux models to make it easier to read
        const fluxModels = data.data.filter(m => m.id.toLowerCase().includes('flux'));

        fluxModels.forEach(model => {
            console.log(`- ${model.id}`);
        });

        if (fluxModels.length === 0) {
            console.log("No models with 'flux' in the name found. Listing all:");
            data.data.forEach(model => console.log(`- ${model.id}`));
        }

    } catch (e) {
        console.error("Exception:", e);
    }
}

listModels();
