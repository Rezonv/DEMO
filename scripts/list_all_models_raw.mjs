import fetch from 'node-fetch';

const API_KEY = "sk-mghoezswrddllcqoyefsedgqrsmtnjvikqbbklnqculxwpap";
const BASE_URL = "https://api.siliconflow.com/v1";

async function listModels() {
    console.log("Fetching SiliconFlow Models...");
    const url = `${BASE_URL}/models`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Authorization": `Bearer ${API_KEY}` }
        });
        const data = await response.json();
        data.data.forEach(m => console.log(m.id));
    } catch (e) {
        console.error(e);
    }
}
listModels();
