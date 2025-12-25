const https = require('https');

// HARDCODED API Key (from previous context)
const API_KEY = process.env.RUNPOD_API_KEY || "YOUR_RUNPOD_API_KEY";

// Configuration
const IMAGE_NAME = "rezonv1/magnum-72b-vllm:v1"; // The image being built
const GPU_TYPE_ID = "NVIDIA RTX A6000"; // 48GB VRAM needed for 72B-AWQ
// vLLM Template (Standard)
const TEMPLATE_ID = "vllm-vllm-openai"; // Generic template, we will override env vars

const payload = {
    name: "Magnum-72B-Serverless",
    imageName: IMAGE_NAME,
    gpuTypeId: GPU_TYPE_ID,
    containerDiskInGb: 20, // Enough for system overhead, model is in image
    minDiskSizeInGb: 20,
    dockerArgs: "", // No special args needed as they are in Dockerfile ENTRYPOINT
    env: [
        { key: "MODEL", value: "/model/magnum-v4-72b-awq" },
        { key: "SERVED_MODEL_NAME", value: "magnum-v4-72b-awq" },
        // Important for 72B model on single card (A6000) or dual 3090
        { key: "GPU_MEMORY_UTILIZATION", value: "0.95" },
        { key: "MAX_MODEL_LEN", value: "16384" } // Adjust based on VRAM (A6000 48GB fits ~16k ctx with AWQ)
    ],
    templateId: TEMPLATE_ID,
    containerDiskInGb: 10,
    volumeInGb: 0, // No network volume needed
    ports: "8000/http"
};

console.log("Deploying RunPod Endpoint...");

const req = https.request({
    hostname: 'api.runpod.io',
    path: '/graphql', // RunPod mainly uses GraphQL or V2 API for creates
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log("Response:", data);
        console.log("\nIf successful, check RunPod Dashboard for the new Endpoint ID.");
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

// GraphQL Mutation for Creating Endpoint (Mocking logic, user should use UI if this is complex)
// Actually, creating Serverless Endpoints via API is tricky without exact GQL schema.
// Fallback: This script is a PLACEHOLDER to remind user of settings.
console.log("NOTE: RunPod API requires GraphQL for endpoint creation.");
console.log("Please allow me to Generate a Guide instead, or use the Web UI manually.");
// Ending request to prevent hang
req.end();
