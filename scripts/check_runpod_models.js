import fetch from 'node-fetch';

const ENDPOINT_ID = "qbpqn6s67r2rwi";
const API_KEY = process.env.RUNPOD_API_KEY;

async function checkModels() {
    const url = `https://api.runpod.ai/v2/${ENDPOINT_ID}/runsync`;
    console.log(`Checking models at ${url}...`);

    try {
        // Try Method 1: Standard RunPod A1111 Worker (POST /run with input.method)
        console.log("Attempt 1: GET /sdapi/v1/sd-models via proxy...");
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                input: {
                    method: "GET",
                    endpoint: "/sdapi/v1/sd-models"
                }
            })
        });

        const data = await response.json();
        console.log("Response 1:", JSON.stringify(data, null, 2));

        // Try Method 2: Direct API Name (some workers use this)
        if (data.status === 'FAILED' || !data.output) {
            console.log("Attempt 2: api_name: sd_models...");
            const response2 = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    input: {
                        api_name: "sd_models"
                    }
                })
            });
            const data2 = await response2.json();
            console.log("Response 2:", JSON.stringify(data2, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

checkModels();
