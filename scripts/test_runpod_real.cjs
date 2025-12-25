const https = require('https');

const API_KEY = process.env.RUNPOD_API_KEY || "YOUR_RUNPOD_API_KEY";
const ENDPOINT_ID = "v8jom3acy6vy0s";
const HOSTNAME = "api.runpod.ai";
const PATH = `/v2/${ENDPOINT_ID}/openai/v1/chat/completions`;

const data = JSON.stringify({
    model: "mistralai/Mistral-7B-Instruct-v0.3", // Trying a generic model name often used
    messages: [{ role: "user", content: "Status check." }],
    max_tokens: 10
});

const options = {
    hostname: HOSTNAME,
    path: PATH,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
    },
    timeout: 30000 // 30s timeout (RunPod cold starts can be slow)
};

console.log(`Connecting to RunPod: ${HOSTNAME}${PATH}`);

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${body}`);
    });
});

req.on('error', (e) => {
    console.error(`ERROR: ${e.message}`);
});

req.write(data);
req.end();
