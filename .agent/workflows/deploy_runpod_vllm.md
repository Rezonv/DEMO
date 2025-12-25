---
description: 如何建立 RunPod Serverless Endpoint 以應對萬人級高流量 (vLLM)
---

這份教學流程將引導您如何在 RunPod 上使用 vLLM（最快的推論引擎）部署高效能的文字生成端點，適合同時服務數千名使用者。

### 第一步：準備您的 RunPod 帳號
1. 登入 [RunPod 控制台 (Console)](https://www.runpod.io/console/serverless)。
2. 確認您的帳戶中至少有 $10-20 美元的額度。
3. 前往左側選單的 **Serverless** > **My Templates**。

### 第二步：建立 vLLM 模板 (Template)
我們將使用官方的 vLLM Docker 映像檔，它提供了與 OpenAI 相容的 API。

1. 點擊 **New Template**。
2. **Template Name (模板名稱)**: `Text-Gen-vLLM-Production`
3. **Container Image (映像檔)**: `vllm/vllm-openai:latest`
   - *注意：這是目前推論速度最快的選擇。*
4. **Container Disk (磁碟大小)**: `40 GB` (足夠放入大型模型)
5. **Environment Variables (環境變數)**:
   - `MODEL`: `TheBloke/Mistral-7B-Instruct-v0.2-AWQ`
     - *或者，如果您有 HuggingFace Token，可以使用 `meta-llama/Meta-Llama-3-8B-Instruct`。*
   - `Served Model Name`: `mistral` (這個名稱必須與程式碼中的設定一致)
   - `HF_TOKEN`: (選填) 如果您要使用 Llama 3 或其他需要權限的模型，請在此填入 HuggingFace Token。
6. **Exposed Port (連接埠)**: `8000`
7. 點擊 **Save Template** 儲存模板。

### 第三步：部署端點 (Endpoint)
1. 前往 **Serverless** > **New Endpoint**。
2. 選擇剛才建立的模板：`Text-Gen-vLLM-Production`。
3. **GPU Selection (GPU 選擇)**:
   - **7B 模型 (AWQ/量化版)**: 建議使用單張 `RTX 3090` 或 `RTX 4090` (速度快且便宜)。
   - **70B 模型**: 需要 `2x A100` 或 `4x A6000`。
   - *建議*：測試階段先用 **1x RTX 3090** 即可。
4. **Configuration (配置)**:
   - **Min Workers (最小運作數)**: 設定為 `0` (省錢，沒人這時自動關閉) 或 `1` (隨時待命，不需要冷啟動時間，成本約 $0.3/小時)。
   - **Max Workers (最大運作數)**: 設定為 `5` 或更多 (允許同時開啟 5 個 GPU 來處理大量人流)。
5. 點擊 **Deploy** 部署。

### 第四步：取得憑證 (Credentials)
1. 等待初始化完成（第一次下載模型可能需要 5-10 分鐘）。
2. 點擊您新增的 Endpoint。
3. 複製 **Endpoint ID** (例如：`v8jom3acy6vy0s`)。
4. 點擊下方的 **Settings** 找到您的 **API Key**。

### 第五步：更新應用程式設定
將這些資訊填入您的 `services/geminiService.ts` 或遊戲內的設定介面：
- **Provider**: `RunPod`
- **Base URL**: `https://api.runpod.ai/v2/[您的Endpoint_ID]/openai/v1`
- **API Key**: `[您的API_Key]`
- **Model Name**: `mistral` (必須與模板環境變數中的 'Served Model Name' 一致)。

### 疑難排解 (Troubleshooting)
- **Logs (日誌)**: 在 RunPod 的 "Logs" 分頁可以查看模型下載進度。
- **Out of Memory (記憶體不足)**: 如果容器崩潰 (Crash)，請嘗試使用較小的模型 (例如 AWQ 版本) 或更換顯存更大的 GPU (如 A6000)。
