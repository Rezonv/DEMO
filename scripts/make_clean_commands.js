
const LORA_MAP = {
    "herta": "439481",
    "ruan_mei": "439471",
    "asta": "439441",
    "topaz": "439432",
    "guinaifen": "439429",
    "huohuo": "439424",
    "jingliu": "439407",
    "lynx": "439400",
    "fu_xuan": "439394",
    "kafka": "439392",
    "silver_wolf": "439381",
    "seele": "448787",
    "bronya": "491774",
    "tingyun": "561089",
    "qingque": "611859",
    "bailu": "639103",
    "sushang": "680657",
    "yukong": "695509",
    "natasha": "710719",
    "serval": "762356",
    "pela": "794503",
    "clara": "834400",
    "hook": "887199",
    "himeko": "900829",
    "march_7th": "944761",
    "fuxuan": "1401050",
    "lynx_landau": "1487371",
    "xueyi": "1531958"
};

// Explicitly excluded male IDs to prevent accidental inclusion
const EXCLUDED_IDS = [
    "439387", // Blade
    "905091", // Welt
    "996061", // Dan Heng
    "1003676", // Arlan
    "1098402", // Sampo
    "1187018", // Luka
    "1232445", // Gepard
    "1284944", // Yanqing
    "1320254", // Jing Yuan
    "1320195", // Luocha
    "1378005"  // Imbibitor Lunae
];

const urls = [
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

// Reverse map to find name by ID
const idToName = {};
for (const [name, id] of Object.entries(LORA_MAP)) {
    idToName[id] = name;
}

console.log("mkdir -p /runpod-volume/models/loras");
console.log("cd /runpod-volume/models/loras");
console.log("rm -rf *"); // Clear existing files

urls.forEach(url => {
    const match = url.match(/models\/(\d+)/);
    if (match) {
        const id = match[1];

        // Skip if it's a known male ID
        if (EXCLUDED_IDS.includes(id)) {
            return;
        }

        const name = idToName[id];
        if (name) {
            // Append token
            const token = "105cb6a0f1ca374757306c1148012022";
            const finalUrl = `${url}&token=${token}`;
            console.log(`wget -O ${name}.safetensors "${finalUrl}"`);
        } else {
            // console.log(`# Unknown ID: ${id}`);
        }
    }
});
