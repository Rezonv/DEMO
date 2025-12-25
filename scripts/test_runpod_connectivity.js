const https = require('https');

const data = JSON.stringify({
    model: "emaibb/magnum-72b-v1-awq",
    messages: [{ role: "user", content: "TEST" }],
    max_tokens: 10
});

const options = {
    hostname: 'api.runpod.ai',
    path: '/v2/8pbfq4is881mpl/openai/v1/chat/completions',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY || 'YOUR_RUNPOD_API_KEY'}`,
        'Content-Length': data.length
    },
    timeout: 10000 // 10s Timeout for testing
};

console.log('Sending request to:', options.hostname + options.path);

const req = https.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('ERROR:', error);
});

req.on('timeout', () => {
    console.error('TIMEOUT (10s reached)');
    req.destroy();
});

req.write(data);
req.end();
