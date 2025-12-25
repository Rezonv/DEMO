# 幻夢伴侶 (Dream Companion) - 專案企劃書

## 1. 專案願景 (Vision)
打造一款**「真正懂你」的 AI 互動式戀愛伴侶平台**。
不同於傳統戀愛遊戲 (Galgame) 的固定劇本，本專案利用最新的 **生成式 AI (Generative AI)** 技術，讓每一位角色的對話、反應、甚至外貌都隨著玩家的互動而即時演變。從純純的戀愛到深度的親密交流，提供無邊界的沉浸式體驗。

## 2. 核心特色 (Core Features)

### 2.1 深度靈魂伴侶 (Deep AI Character)
- **驅動核心**：採用 Google Gemini 2.5 Flash / Pro 模型，具備極高的上下文理解能力。
- **動態性格**：角色不僅有預設設定 (如傲嬌、溫柔)，更會根據「好感度 (Affection)」改變說話語氣與行為模式。
- **長期記憶**：系統自動摘要並儲存玩家與角色的關鍵互動，角色會「記得」你們去過哪裡、你喜歡什麼。

### 2.2 極致視覺饗宴 (Dynamic Visuals)
- **即時圖像生成**：整合 **RunPod Serverless (Automatic1111)**，利用 **Pony V6 XL** 模型生成高品質二次元插圖。
- **情境感知**：系統會根據當下的劇情 (地點、時間、動作、服裝) 自動生成對應的畫面，而非調用預設立繪。
- **LoRA 支援**：針對特定角色掛載專屬 LoRA 模型，確保角色外貌的一致性與精緻度。

### 2.3 沉浸式遊戲系統 (Gameplay Systems)
- **好感度與墮落度**：
    - **Stage 1-2 (相識/曖昧)**：正常的日常對話與約會。
    - **Stage 3-4 (熱戀/挑逗)**：解鎖更親密的肢體接觸與專屬語音。
    - **Stage 5+ (靈魂伴侶/完全陷落)**：解鎖無限制的 NSFW 互動與特殊場景 (Corruption Mode)。
- **日記系統**：角色會根據當天的互動，自動生成一篇私密日記，讓玩家窺探她的內心世界。
- **探索與禮物**：派遣角色探索不同地圖 (如雅利洛-VI、羅浮仙舟)，收集素材並贈送禮物以提升數值。

## 3. 技術架構 (Technical Architecture)

### 前端 (Frontend)
- **Framework**: React 18 + TypeScript (Vite)
- **UI Library**: Tailwind CSS (現代化玻璃擬態風格 Glassmorphism)
- **State Management**: React Context API

### 後端與 AI 服務 (Backend & AI)
- **劇情運算 (Story Engine)**: Google Gemini API (透過 `geminiService.ts` 封裝)
- **圖像運算 (Image Engine)**: 
    - **Provider**: RunPod Serverless (Automatic1111 API)
    - **Model**: Pony Diffusion V6 XL (.safetensors)
    - **Storage**: RunPod Network Volume (30GB) 用於存放模型與 LoRA。
- **資料存儲**: LocalStorage (目前) / 規劃遷移至 Supabase 或 Firebase。

## 4. 目前進度與已完成功能 (Current Status)
- [x] **基礎對話系統**：支援多角色切換、串流式文字回應。
- [x] **極速圖像生成 (RunSync)**：已遷移至 `r1jygm0t3ubrw6` 端點，大幅降低延遲並解決 500 錯誤。
- [x] **情境感知繪圖**：系統能讀取對話上下文 (如天氣、情緒) 自動生成環境 Prompt (Context-Aware)。
- [x] **角色關係網 (Relationships)**：實作了角色間的愛恨情仇 (如「摯友」、「勁敵」) 設定。
- [x] **深度世界觀 (World Lore)**：將崩壞：星穹鐵道/原神的世界觀設定 (Lore) 獨立模組化，提升 AI 扮演真實度。
- [x] **嚴格繁中化**：強制修正對話中的簡體用語，確保純正台灣在地化體驗。

## 5. 未來規劃 (Roadmap)

### Phase 1: 基礎架構穩固 (Completed)
- [x] RunPod 圖像生成穩定化 (RunSync Integration)。
- [x] 角色記憶與資料結構重構 (Relationships, Lore)。
- [x] 介面與體驗優化 (Glassmorphism UI, Notification)。

### Phase 2: 沉浸感深化 (Current)
- [ ] **幹員資產修復**：解決「幹員 (Operators)」功能與 Feng Jin 頭像遺失問題。
- [ ] **語音合成 (TTS)**：串接 VITS 或 ElevenLabs，讓角色能發出聲音。
- [ ] **Live2D / 動態立繪**：讓生成的圖片具備簡單的呼吸或眨眼效果。

### Phase 3: 社群與分享 (Future)
- [ ] **角色市集**：允許玩家分享自己創建的角色 Prompt 與設定。
- [ ] **雲端存檔**：建立帳號系統，跨裝置同步老婆們的記憶。

---
*專案負責人: David*
*最後更新: 2025-12-24*
