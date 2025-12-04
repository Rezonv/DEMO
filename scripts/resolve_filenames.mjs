import https from 'https';

const token = "9ef86f83a77a65f9848534919407f164";
const ponyModelId = 257749;
const otherUrls = [
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

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

function getFilename(url) {
    return new Promise((resolve, reject) => {
        const urlWithToken = url.includes('?') ? `${url}&token=${token}` : `${url}?token=${token}`;
        const req = https.request(urlWithToken, { method: 'HEAD' }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // For redirects, we might need to pass the token again if the new URL doesn't have it, 
                // but usually Civitai redirects to a signed URL.
                // Let's try following the redirect as is first.
                getFilename(res.headers.location).then(resolve).catch(reject);
                return;
            }
            const contentDisposition = res.headers['content-disposition'];
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    resolve(match[1]);
                    return;
                }
            }
            resolve(null);
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    console.log("Resolving Pony Model...");
    try {
        const ponyData = await fetchJson(`https://civitai.com/api/v1/models/${ponyModelId}`);
        const latestVersion = ponyData.modelVersions[0];
        const downloadUrl = latestVersion.downloadUrl;
        const filename = latestVersion.files.find(f => f.type === "Model SafeTensor")?.name || "pony_v6_xl.safetensors";
        console.log(`PONY_RESULT: ${downloadUrl} | ${filename}`);
    } catch (e) {
        console.error(`Error fetching Pony data: ${e.message}`);
    }

    console.log("Resolving Other URLs...");
    for (const url of otherUrls) {
        try {
            const filename = await getFilename(url);
            console.log(`URL_RESULT: ${url} | ${filename}`);
        } catch (e) {
            console.error(`Error resolving ${url}: ${e.message}`);
        }
    }
}

main();
