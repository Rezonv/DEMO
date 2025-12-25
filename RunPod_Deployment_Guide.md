# RunPod 萬人級 Serverless vLLM 架設指南

這份指南是專為承受**數千人同時在線**的高流量需求所設計的。
我們使用 **vLLM (Versatile Large Language Model)** 引擎，它是目前業界推論速度最快、吞吐量 (Throughput) 最高的選擇。

---

## 🚀 架構總覽
- **平台**: RunPod Serverless
- **引擎**: vLLM (OpenAI Compatible)
- **模型**: Mistral-7B-Instruct-v0.2-AWQ (速度優化版) 或是 Llama-3-8B-Instruct
- **成本**: 依使用量計費 (閒置時可降為 $0)

---

## 步驟一：設定模板 (Templates)

1. 登入 [RunPod Console](https://www.runpod.io/console/serverless)。
2. 點選左側 **Serverless** -> **My Templates** -> **New Template**。
3. 填寫以下資訊：

| 欄位 | 設定值 | 說明 |
| :--- | :--- | :--- |
| **Template Name** | `Production-vLLM-Engine` | 辨識用的名稱 |
| **Container Image** | `vllm/vllm-openai:latest` | 使用 vLLM 官方映像檔 |
| **Container Disk** | `20 GB` | 存放模型所需的空間 |
| **Exposed Port** | `8000` | 對外開放的 API Port |

4. **環境變數 (Environment Variables)** - **最重要的部分！**
   請點擊 "Add Variable" 新增以下變數：

   - `MODEL`: `TheBloke/Mistral-7B-Instruct-v0.2-AWQ`
     *(這是模型在 HuggingFace 上的 ID，選用 AWQ 量化版可大幅提升速度並降低顯存需求)*
   - `SERVED_MODEL_NAME`: `mistral`
     *(這是之後 API 呼叫時的 "model" 參數名稱，建議簡單好記)*
   - `HF_TOKEN`: `(您的 HuggingFace Token)`
     *(如果您改用 Llama 3 等需要權限的模型，才需要填寫此欄位)*

5. 點擊 **Save Template**。

---

## 步驟二：部署端點 (Deploy Endpoint)

1. 回到 **Serverless** 頁面，點選 **New Endpoint**。
2. 選擇剛剛建立的 `Production-vLLM-Engine` 模板。
3. **GPU 選擇**:
   - 推薦: **RTX 3090** 或 **RTX 4090** (性價比最高，跑 7B 模型綽綽有餘)。
   - 不推薦: A100 (跑 7B 太浪費錢了)。
4. **進階設定 (Configuration)**:
   - **Min Workers**: `0` (省錢模式) 或 `1` (高效能模式，隨時待命)。
   - **Max Workers**: `5` (根據您的用戶數量調整，每增加一個 Worker 就多一個 GPU 幫忙處理)。
   - **Idle Timeout**: `5` (閒置幾秒後關閉 Worker，建議設短一點省錢)。
5. 點擊 **Deploy**。

---

## 步驟三：連接到應用程式

1. 等待 Endpoint 狀態變為 `Running` (第一次需要下載模型，約 3-5 分鐘)。
2. 點進 Endpoint，您會看到：
   - **Endpoint ID**: (例如 `v8jom3acy6vy0s`)
   - **API Key**: 點擊下方的 "Settings" 或是右上角的帳戶設定取得。
3. **API URL 格式**:
   `https://api.runpod.ai/v2/[Endpoint_ID]/openai/v1`

---

## 💡 應用程式設定 (GeminiService.ts)

將取得的資料填入您的 `DEFAULT_TEXT_SETTINGS`：

```typescript
const DEFAULT_TEXT_SETTINGS = {
    provider: 'runpod',
    runpodBaseUrl: 'https://api.runpod.ai/v2/v8jom3acy6vy0s/openai/v1', // 換成您的 ID
    runpodApiKey: 'rpa_xxxxxxxxxxxxxxxxxxxxxxxx', // 換成您的 Key
    runpodModelName: 'mistral' // 必須對應模板中的 SERVED_MODEL_NAME
};
```

---

## ❓ 常見問題 (Troubleshooting)

- **Q: 為什麼一直轉圈圈沒反應？**
  - A: 檢查 RunPod 的 **Logs**。如果是 `OOM (Out Of Memory)`，代表顯存不夠，請換顯存更大的 GPU (如 A6000) 或換小一點的模型 (AWQ)。
- **Q: 費用如何計算？**
  - A: RunPod Serverless 是 "按秒計費"。GPU 只有在處理請求時才收費 (加上冷啟動時間)。如果設 Min Workers > 0，閒置時也會收費。
