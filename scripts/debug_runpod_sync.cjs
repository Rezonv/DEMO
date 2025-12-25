
// const fetch = require('node-fetch'); // Native in Node 24

// CONFIG
const ENDPOINT_ID = 'nu12bv9gmixm0v';
const API_KEY = process.env.RUNPOD_API_KEY || 'YOUR_RUNPOD_API_KEY';
const SYNC_URL = `https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`;

const main = async () => {
    console.log(`Testing RunPod Sync Endpoint: ${SYNC_URL}`);

    // Try adapting the OpenAI payload into the 'input' field
    const payload = {
        input: {
            model: "magnum-v4-72b-awq",
            messages: [{ role: "user", content: "Say 'Sync Works' if you hear me." }],
            max_tokens: 50,
            temperature: 0.7
        }
    };

    try {
        const startTime = Date.now();
        const response = await fetch(SYNC_URL, {
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

        const text = await response.text();
        console.log("Response Body:", text.substring(0, 1000));

    } catch (e) {
        console.error("Connection Failed:", e);
    }
};

main();
