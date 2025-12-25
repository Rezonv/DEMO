const https = require('https');

const data = JSON.stringify({
    model: "CED6688/magnum-v4-72b-AWQ",
    messages: [{ role: "user", content: "TEST" }],
    max_tokens: 10
});

const options = {
    hostname: 'api.runpod.ai',
    path: '/v2/0b3urnlem4rv3q/openai/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY || 'YOUR_RUNPOD_API_KEY'}`,
        'Content-Length': data.length
    },
    timeout: 30000 // 30s (72B might take longer to load)
};

console.log(`Sending request to: ${options.hostname}${options.path}`);
console.log(`Model: ${JSON.parse(data).model}`);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let responseBody = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log('Response body:', responseBody);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
