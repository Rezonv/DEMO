
// const fetch = require('node-fetch'); // Use global fetch in Node 24

// CONFIG
const ENDPOINT_ID = 'nu12bv9gmixm0v';
const API_KEY = process.env.RUNPOD_API_KEY || 'YOUR_RUNPOD_API_KEY';
const BASE_URL = `https://api.runpod.ai/v2/${ENDPOINT_ID}/openai/v1`;

const main = async () => {
    console.log(`Testing Direct Connection to RunPod: ${ENDPOINT_ID}`);
    console.log(`URL: ${BASE_URL}/chat/completions`);

    const payload = {
        model: "magnum-v4-72b-awq",
        messages: [{ role: "user", content: "Say 'Hello User' if you can hear me." }],
        max_tokens: 50
    };

    const startTime = Date.now();

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Request took: ${duration.toFixed(2)}s`);
        console.log(`Status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            const text = await response.text();
            console.error("Error Body:", text);
        } else {
            const data = await response.json();
            console.log("Success! Response:", JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error("Connection Failed:", e);
    }
};

main();
