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
        const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
        const contentDisposition = res.headers.get('content-disposition');
        let filename = null;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) filename = match[1];
        }

        if (!filename) {
            // Fallback: try to guess from final URL
            const finalUrl = res.url;
            const parts = finalUrl.split('/');
            filename = parts[parts.length - 1].split('?')[0];
        }

        // Clean filename
        if (filename) {
            filename = filename.replace(/[^\w\.-]/g, '_'); // Replace special chars
            if (!filename.endsWith('.safetensors')) filename += '.safetensors';
        }

        return { url, filename };
    } catch (e) {
        console.error(`Failed to resolve ${url}:`, e.message);
        return { url, filename: null };
    }
}

async function main() {
    console.log("# Add these lines to your Dockerfile to bake in the LoRAs:");
    console.log("# -------------------------------------------------------");

    for (const url of loraUrls) {
        const { filename } = await resolveName(url);
        if (filename) {
            // Using wget with content-disposition might be safer, but we want explicit filenames
            // Civitai requires an API token sometimes? No, these look like public download links.
            // But we should use the original URL to be safe, or the resolved one?
            // Civitai links redirect to R2/S3. The original link is better for scripts usually.
            console.log(`RUN wget -O /comfyui/models/loras/${filename} "${url}"`);
        }
    }
    console.log("# -------------------------------------------------------");
}

main();
