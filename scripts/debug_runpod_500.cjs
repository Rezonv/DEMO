const https = require('https');

// Configuration from User Context
const API_KEY = process.env.RUNPOD_API_KEY || "YOUR_RUNPOD_API_KEY";
const ENDPOINT_ID = "nu12bv9gmixm0v";
const HOSTNAME = "api.runpod.ai";
const PATH = `/v2/${ENDPOINT_ID}/openai/v1/chat/completions`;

// Payload extracted from User Logs
const payload = JSON.stringify({
    "model": "magnum-v4-72b-awq",
    "messages": [
        {
            "role": "system",
            "content": "You are an AI assistant."
        },
        {
            "role": "user",
            "content": "Hello, are you working?"
        }
    ],
    "max_tokens": 100,
    "temperature": 0.7
});

function testEndpoint() {
    console.log(`Testing RunPod Endpoint: https://${HOSTNAME}${PATH}`);
    console.log("Payload:", payload);

    const options = {
        hostname: HOSTNAME,
        path: PATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Length': payload.length
        }
    };

    const req = https.request(options, (res) => {
        console.log("------------------------------------------------");
        console.log("Status Code:", res.statusCode);
        console.log("Status Message:", res.statusMessage);
        console.log("Headers:", res.headers);
        console.log("------------------------------------------------");

        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log("Raw Response Body:");
            console.log(data);
            console.log("------------------------------------------------");

            try {
                const json = JSON.parse(data);
                console.log("Parsed JSON:", json);
            } catch (e) {
                console.log("Wait... Response is NOT JSON.");
            }
        });
    });

    req.on('error', (error) => {
        console.error("Request Error:", error);
    });

    req.write(payload);
    req.end();
}

testEndpoint();
