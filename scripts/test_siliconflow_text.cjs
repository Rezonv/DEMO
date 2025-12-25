const fetch = require('node-fetch');

const API_KEY = "sk-mghoezswrddllcqoyefsedgqrsmtnjvikqbbklnqculxwpap";
const BASE_URL = "https://api.siliconflow.com/v1";

async function testTextGen() {
    console.log("Testing SiliconFlow Text Generation...");

    const url = `${BASE_URL}/chat/completions`;
    const payload = {
        model: "Qwen/Qwen2.5-7B-Instruct",
        messages: [{ role: "user", content: "Hello, represent yourself." }],
        max_tokens: 100
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
        console.log("Content:", data.choices[0].message.content);
    } catch (e) {
        console.error("Exception:", e);
    }
}

testTextGen();
