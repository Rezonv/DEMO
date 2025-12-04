import fetch from 'node-fetch';

const apiKey = "sk-mghoezswrddllcqoyefsedgqrsmtnjvikqbbklnqculxwpap".trim();
const url = "https://api.siliconflow.cn/v1/user/info";

async function test() {
    console.log("Testing API Key:", apiKey);
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });

        console.log("Status:", response.status);
        console.log("Headers:", JSON.stringify([...response.headers.entries()]));
        const text = await response.text();
        console.log("Body:", text);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
