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

const LORA_MAP = {
    "439481": "herta",
    "439471": "ruan_mei",
    "439441": "asta",
    "439432": "topaz",
    "439429": "guinaifen",
    "439424": "huohuo",
    "439407": "jingliu",
    "439400": "lynx",
    "439394": "fu_xuan",
    "439392": "kafka",
    "439387": "blade",
    "439381": "silver_wolf",
    "448787": "seele",
    "491774": "bronya",
    "561089": "tingyun",
    "611859": "qingque",
    "639103": "bailu",
    "680657": "sushang",
    "695509": "yukong",
    "710719": "natasha",
    "762356": "serval",
    "794503": "pela",
    "834400": "clara",
    "887199": "hook",
    "900829": "himeko",
    "905091": "welt",
    "944761": "march_7th",
    "996061": "dan_heng",
    "1003676": "arlan",
    "1098402": "sampo",
    "1187018": "luka",
    "1232445": "gepard",
    "1284944": "yanqing",
    "1320254": "jing_yuan",
    "1320195": "luocha",
    "1378005": "imbibitor_lunae",
    "1401050": "fuxuan",
    "1487371": "lynx_landau",
    "1531958": "xueyi"
};

const API_KEY = "105cb6a0f1ca374757306c1148012022";

function main() {
    console.log("mkdir -p /runpod-volume/models/loras");
    console.log("cd /runpod-volume/models/loras");

    loraUrls.forEach(url => {
        const match = url.match(/models\/(\d+)/);
        if (match) {
            const id = match[1];
            // Use mapped name if available, otherwise lora_{id}
            const name = LORA_MAP[id] ? `${LORA_MAP[id]}.safetensors` : `lora_${id}.safetensors`;
            console.log(`wget -O ${name} "${url}&token=${API_KEY}"`);
        }
    });
}

main();
