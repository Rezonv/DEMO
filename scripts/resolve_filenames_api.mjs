import https from 'https';

const token = "9ef86f83a77a65f9848534919407f164";
const versionIds = [
    439481, 439471, 439441, 439432, 439429, 439424, 439407, 439400,
    439394, 439392, 439387, 439381, 448787, 491774, 561089, 611859,
    639103, 680657, 695509, 710719, 762356, 794503, 834400, 887199,
    900829, 905091, 944761, 996061, 1003676, 1098402, 1187018, 1232445,
    1284944, 1320254, 1320195, 1378005, 1401050, 1487371, 1531958
];

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Status ${res.statusCode}: ${data}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log("Resolving Filenames via API...");

    // Pony Model
    console.log(`PONY_RESULT: https://civitai.com/api/download/models/290640?token=${token} | pony_v6_xl.safetensors`);

    // LoRAs
    for (const id of versionIds) {
        try {
            const data = await fetchJson(`https://civitai.com/api/v1/model-versions/${id}`);
            // Find the SafeTensor file, or the first model file
            const file = data.files.find(f => f.name.endsWith('.safetensors')) || data.files[0];
            const filename = file ? file.name : `model_${id}.safetensors`;
            const downloadUrl = `https://civitai.com/api/download/models/${id}?type=Model&format=SafeTensor&token=${token}`;

            console.log(`LORA_RESULT: ${downloadUrl} | ${filename}`);
        } catch (e) {
            console.error(`Error resolving ${id}: ${e.message}`);
            // Fallback
            console.log(`LORA_RESULT: https://civitai.com/api/download/models/${id}?type=Model&format=SafeTensor&token=${token} | model_${id}.safetensors`);
        }
        // Be nice to the API
        await new Promise(r => setTimeout(r, 200));
    }
}

main();
