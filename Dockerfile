# 使用 RunPod 官方基礎映像檔
FROM runpod/worker-comfyui:5.5.0-base

# 1. 下載 Pony V6 XL 模型
RUN comfy model download --url https://huggingface.co/WhiteAiZ/PonyXL/resolve/main/PonyDiffusionV6XL.safetensors --relative-path models/checkpoints --filename pony_v6_xl.safetensors

# 2. 建立 LoRA 資料夾
RUN mkdir -p /comfyui/models/loras

# 3. 下載 LoRA (使用 lora_{id}.safetensors 格式，對應程式碼)
RUN wget -O /comfyui/models/loras/lora_439481.safetensors "https://civitai.com/api/download/models/439481?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439471.safetensors "https://civitai.com/api/download/models/439471?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439441.safetensors "https://civitai.com/api/download/models/439441?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439432.safetensors "https://civitai.com/api/download/models/439432?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439429.safetensors "https://civitai.com/api/download/models/439429?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439424.safetensors "https://civitai.com/api/download/models/439424?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439407.safetensors "https://civitai.com/api/download/models/439407?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439400.safetensors "https://civitai.com/api/download/models/439400?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439394.safetensors "https://civitai.com/api/download/models/439394?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439392.safetensors "https://civitai.com/api/download/models/439392?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439387.safetensors "https://civitai.com/api/download/models/439387?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_439381.safetensors "https://civitai.com/api/download/models/439381?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_448787.safetensors "https://civitai.com/api/download/models/448787?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_491774.safetensors "https://civitai.com/api/download/models/491774?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_561089.safetensors "https://civitai.com/api/download/models/561089?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_611859.safetensors "https://civitai.com/api/download/models/611859?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_639103.safetensors "https://civitai.com/api/download/models/639103?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_680657.safetensors "https://civitai.com/api/download/models/680657?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_695509.safetensors "https://civitai.com/api/download/models/695509?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_710719.safetensors "https://civitai.com/api/download/models/710719?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_762356.safetensors "https://civitai.com/api/download/models/762356?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_794503.safetensors "https://civitai.com/api/download/models/794503?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_834400.safetensors "https://civitai.com/api/download/models/834400?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_887199.safetensors "https://civitai.com/api/download/models/887199?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_900829.safetensors "https://civitai.com/api/download/models/900829?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_905091.safetensors "https://civitai.com/api/download/models/905091?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_944761.safetensors "https://civitai.com/api/download/models/944761?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_996061.safetensors "https://civitai.com/api/download/models/996061?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1003676.safetensors "https://civitai.com/api/download/models/1003676?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1098402.safetensors "https://civitai.com/api/download/models/1098402?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1187018.safetensors "https://civitai.com/api/download/models/1187018?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1232445.safetensors "https://civitai.com/api/download/models/1232445?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1284944.safetensors "https://civitai.com/api/download/models/1284944?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1320254.safetensors "https://civitai.com/api/download/models/1320254?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1320195.safetensors "https://civitai.com/api/download/models/1320195?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1378005.safetensors "https://civitai.com/api/download/models/1378005?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1401050.safetensors "https://civitai.com/api/download/models/1401050?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1487371.safetensors "https://civitai.com/api/download/models/1487371?type=Model&format=SafeTensor"
RUN wget -O /comfyui/models/loras/lora_1531958.safetensors "https://civitai.com/api/download/models/1531958?type=Model&format=SafeTensor"

# 4. 啟動指令
CMD ["/start.sh"]
