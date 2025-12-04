import fetch from 'node-fetch';

const loraUrls = [
    "https://civitai.com/api/download/models/439481?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439471?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439441?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439432?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439429?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439424?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439407?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439400?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439394?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439392?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439387?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/439381?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/448787?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/491774?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/561089?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/611859?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/639103?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/680657?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/695509?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/710719?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/762356?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/794503?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/834400?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/887199?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/900829?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/905091?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/944761?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/996061?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1003676?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1098402?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1187018?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1232445?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1284944?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1320254?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1320195?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1378005?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1401050?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1487371?type=Model&format=SafeTensor",
    "https://civitai.com/api/download/models/1531958?type=Model&format=SafeTensor"
];

async function resolveName(url) {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            signal: controller.signal
        });
        clearTimeout(timeout);

        const contentDisposition = res.headers.get('content-disposition');
        let filename = null;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        if (!filename) {
            const finalUrl = res.url;
            const parts = finalUrl.split('/');
            filename = parts[parts.length - 1].split('?')[0];
        }

        if (filename) {
            filename = filename.replace(/[^\w\.-]/g, '_');
            if (!filename.endsWith('.safetensors')) filename += '.safetensors';
        }

        return { url, filename };
    } catch (e) {
        return { url, filename: null, error: e.message };
    }
}

async function main() {
    console.log("Resolving filenames...");

    // Process in batches of 5 to avoid rate limits but be faster
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < loraUrls.length; i += batchSize) {
        const batch = loraUrls.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(resolveName));
        results.push(...batchResults);
        console.log(`Processed ${Math.min(i + batchSize, loraUrls.length)}/${loraUrls.length}`);
    }

    const fs = await import('fs');
    const lines = ["#!/bin/bash", "mkdir -p /comfyui/models/loras"];

    results.forEach(r => {
        if (r.filename) {
            lines.push(`wget -O /comfyui/models/loras/${r.filename} "${r.url}"`);
        } else {
            lines.push(`# FAILED to resolve: ${r.url} (${r.error})`);
        }
    });

    fs.writeFileSync('install_loras.sh', lines.join('\n'));
    console.log("Generated install_loras.sh with " + results.filter(r => r.filename).length + " commands.");
}

main();
