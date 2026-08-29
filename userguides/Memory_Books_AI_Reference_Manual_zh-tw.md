<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books：完整 AI 參考手冊

**產品：** SillyTavern Memory Books (STMB)  
**參考版本：** v8.5.0，2026 年 8 月 1 日  
**用途：** 為教授、解釋和排查 Memory Books 問題的 AI 助手提供單一、密集且權威的事實來源。

---

## 目錄

- [1. AI 助手應如何使用本手冊](#1-ai-助手應如何使用本手冊)
- [2. 產品定義與心智模型](#2-產品定義與心智模型)
- [3. 核心術語與功能選擇](#3-核心術語與功能選擇)
- [4. 要求、安裝與首次驗證](#4-要求安裝與首次驗證)
- [5. 打開 Memory Books 並理解主面板](#5-打開-memory-books-並理解主面板)
- [6. Memory Book 存儲模式](#6-memory-book-存儲模式)
- [7. 設定檔案、連接與生成路由](#7-設定檔案連接與生成路由)
- [8. 場景、手動記憶、自動記憶與 Catch-up](#8-場景手動記憶自動記憶與-catch-up)
- [9. Token 節省、隱藏訊息與記憶邊界](#9-token-節省隱藏訊息與記憶邊界)
- [10. 故事書激活與檢索](#10-故事書激活與檢索)
- [11. 真實群聊模式](#11-真實群聊模式)
- [12. Narrator Mode](#12-narrator-mode)
- [13. 聊天分支](#13-聊天分支)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. 生成上下文](#20-生成上下文)
- [21. Prompt 架構、內置摘要 Prompt 與編寫規則](#21-prompt-架構內置摘要-prompt-與編寫規則)
- [22. Summary Prompt Manager 與 Consolidation Prompt Manager](#22-summary-prompt-manager-與-consolidation-prompt-manager)
- [23. STMB 與其他擴充功能](#23-stmb-與其他擴充功能)
- [24. 故事書條目標題與字元策略](#24-故事書條目標題與字元策略)
- [25. Job Queue 與重試控制](#25-job-queue-與重試控制)
- [26. 視覺反饋與無障礙](#26-視覺反饋與無障礙)
- [27. 設定地圖與當前設定參考](#27-設定地圖與當前設定參考)
- [28. Slash Command 參考](#28-slash-command-參考)
- [29. 按階段排查問題](#29-按階段排查問題)
- [30. FAQ](#30-faq)
- [31. 兼容性、遷移與當前歷史說明](#31-兼容性遷移與當前歷史說明)
- [32. 開發者與許可證說明](#32-開發者與許可證說明)
- [33. 緊湊診斷決策樹](#33-緊湊診斷決策樹)
- [34. 最低推薦教學順序](#34-最低推薦教學順序)
- [35. 最終概念總結](#35-最終概念總結)

---

## 1. AI 助手應如何使用本手冊

將本文檔視為 Memory Books 當前的操作參考。它取代了單獨載入 Start Here 指南、README、User Guide、Side Prompts 指南、How STMB Works 指南以及歷史 changelog 作為獨立知識檔案的需要。

術語：

- STMB = SillyTavern=MemoryBooks（本擴展）
- ST = SillyTavern（STMB 所擴展的基礎代碼）

回答使用者時：

1. 準確保留 Memory Books 的術語。**Memory Book（記憶書）**是 STMB 使用的 SillyTavern 故事書（lorebook），不是一種獨立資料庫格式。
2. 區分當前行為和歷史行為。不要因為某個流程出現在舊 changelog 中，就把已經移除或被替代的流程當作當前流程來教授。
3. 區分 **Group Chat Mode** 與 **Narrator Mode**。它們解決不同的問題。
4. 區分記憶**生成**、故事書**存儲/設定**以及之後由 **SillyTavern 執行的檢索**。激活/檢索屬於基礎 ST 代碼。
5. 不要編造本文未描述的控件、菜單標籤、提供商行為或設定。
6. 使用者提供截圖時，只識別畫面中可見的控件。給出下一步立即可執行的操作，不要假定螢幕外存在某個控件。
7. 排查問題時，先找出第一個失敗的階段並測試它，再建議重寫 Prompt。
8. 在高級路由、多本 Memory Book、自定義 Prompt、Regex 或 Side Prompt 自動化之前，優先建立一個簡單且可工作的設定。
9. 說明角色過濾器和分開的 Memory Book 可以改善路由和相關性；它們不是安全邊界。
10. 當使用者安裝的版本、SillyTavern 版本、提供商或自定義 Prompt 可能不同時，要明確說明不確定性。

### 當前文檔說明

Narrator Mode 已在 v8.5.0 中實現。

一些早期入門文檔曾說，在自動記憶開始前技術上必須先有一條手動記憶。當前 STMB 在沒有 processed-message baseline 時，可以從訊息 0 建立第一條自動記憶。仍然建議先建立一條手動記憶，因為這樣可以在信任自動化之前驗證連接、Memory Book、輸出格式以及期望的起始邊界。

---

## 2. 產品定義與心智模型

Memory Books 是一個 SillyTavern 擴展，它把手動選擇或自動選擇的聊天範圍轉換為結構化記憶條目，並存儲在 SillyTavern 故事書中。

基本流程如下：

```text
聊天訊息
    ↓
STMB 選擇或接收一個訊息範圍
    ↓
STMB 組裝 AI 請求
    ↓
模型返回結構化記憶
    ↓
STMB 儲存一個故事書條目
    ↓
已處理的舊聊天訊息可以從活動上下文中隱藏
    ↓
SillyTavern 之後激活相關的故事書條目
    ↓
聊天模型收到這些條目作為上下文
```

STMB 並不會讓模型獲得永久的內部記憶。它維護的是一個外部參考系統（故事書條目）。當 SillyTavern 把相關故事書條目包含進發送給 AI 的 Prompt 時，聊天模型才表現為“記得”這些內容。

### 三個獨立階段

1. **生成質量** — 記憶生成模型是否產出了準確、有用的結果？
2. **存儲與設定** — 結果是否被儲存到目標 Memory Book，並帶有合適的激活設定？
3. **檢索與模型使用** — SillyTavern 是否激活併發送了該條目，聊天模型又是否正確使用它？

排查時要把這三個階段分開。

### 故事書與 Memory Books

**Lorebook（故事書）**，在 SillyTavern 的部分界面中也稱為 **World Info**，是一組 SillyTavern 可以按條件加入模型請求的條目。一個故事書條目通常包含：

- 標題/注釋；
- 內容；
- 激活關鍵詞或另一種激活模式；
- 插入位置與順序；
- 遞歸和預算控制；
- 可選角色過濾器及其他元資料。

**Memory Book（記憶書）**就是被 STMB 使用的普通 SillyTavern 故事書。可以用普通故事書工具打開、編輯、重新排序、匯出、匯入或刪除它。根據使用的功能，它可能包含：

- 場景 Memories；
- Arc、Chapter、Book、Legend、Series 或 Epic 摘要；
- Clip 與 Topical Clip 條目；
- Side Prompt tracker 條目；
- 其他由 STMB 管理的條目。

### 記憶條目是壓縮後的上下文

場景 Memory 不是原始聊天記錄，而是為保留連續性所需資訊而製作的壓縮表示，例如：

- 事件與後果；
- 決策與計劃；
- 發現與揭示；
- 關係或情緒變化；
- 各角色知道、相信或誤解的內容；
- 重要物件、地點、身份、承諾和限制。

隱藏已處理訊息不會刪除它們。它只是阻止這些訊息繼續被發送給 AI，從而不再持續佔用活動聊天歷史上下文。

---

## 3. 核心術語與功能選擇

| 需求 | 功能 | 含義 |
|---|---|---|
| 總結一個手選或自動選取的聊天範圍 | **Memory** | “記住這個場景發生了甚麼。” |
| 儲存選中的聊天原文或一個事實 | **Clip** | “儲存這條筆記。” |
| 從已儲存 Memories 中收集某個主題的資訊 | **Topical Clip** | “收集我的 Memories 對這個主題所說的一切。” |
| 在多次運行中維護會變化的資訊 | **Side Prompt** | “持續更新這個 tracker。” |
| 合併若干低層級 Memory 或摘要 | **Consolidation** | “把這些條目匯總成更高層級回顧。” |
| 縮短一個現有 STMB 管理條目 | **Compaction** | “在不丟事實的前提下精簡這個條目。” |
| 使用原始來源替換現有條目 | **Regeneration** | “重新構建這個條目，並審核替換內容。” |

### 使用者經常混淆的功能區別

- **Clip vs Topical Clip：** Clip 從當前聊天中高亮的文字開始；Topical Clip 從已經確認的 STMB Memories 開始。
- **Topical Clip vs Side Prompt：** Topical Clip 是手動運行來收集某個主題；Side Prompt 可以反復維護一個會變化的 tracker。
- **Compaction vs Consolidation：** Compaction 重寫一個條目；Consolidation 用多個條目建立新的高層級摘要。
- **Memory vs Side Prompt：** Memories 通常是按順序排列的場景記錄；Side Prompts 通常更新或覆蓋同一份持續維護的支援文檔。
- **生成 vs 檢索：** 建立一個條目並不保證 SillyTavern 之後一定會激活它。

---

## 4. 要求、安裝與首次驗證

### 要求

- SillyTavern 1.18.0 或更高版本；建議使用最新兼容版本。
- 一個正常工作的 AI 連接。
- 一個能遵循指令的模型；對於 Memory 和 Consolidation 工作流，還必須能返回有效 JSON。
- 允許安裝第三方 SillyTavern 擴展。
- 如果通過 OpenAI 兼容的 Chat Completion 端點使用本地或 Text Completion 後端，SillyTavern 中必須有可用的 Chat Completion preset。

### 普通 Chat Completion 使用者

OpenAI、Anthropic/Claude、OpenRouter、Gemini/Google 和其他 Chat Completion 連接通常可以直接使用內置的 **Current SillyTavern Settings** 設定檔案。

### 本地與 Text Completion 使用者

KoboldCpp、llama.cpp、TextGen、Ollama 等後端通常在通過 OpenAI 兼容 Chat Completion 端點暴露時最可靠。即使正常角色扮演使用 Text Completion，SillyTavern 仍必須為 STMB 準備一個 Chat Completion preset。

典型 KoboldCpp 設定：

- API type：Chat Completion；
- source：Custom OpenAI-compatible；
- 端點，例如 `http://localhost:5001/v1` 或 `http://127.0.0.1:5000/v1`；
- 如果 SillyTavern 要求，自定義 API key 只需非空即可；
- model ID 使用端點期望的格式，常見為 `koboldcpp/modelname`，不要無必要地附加 `.gguf`；
- 匯入 Chat Completion preset；
- response length 至少 2048 tokens，4096 通常更穩妥。

典型 llama.cpp 設定：

- API type：Chat Completion；
- source：Custom OpenAI-compatible；
- 端點 `http://localhost:8080/v1`，如果 SillyTavern 運行在 Docker 中，則使用 `http://host.docker.internal:8080/v1`；
- 如 SillyTavern 要求，填入任意非空 API key；
- 使用已提供服務的 model ID；
- 除非端點要求，否則不要使用 prompt post-processing。

示例伺服器命令：

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### 可選 Chat Top Bar

沒有 Chat Top Bar / Chat Top Info Bar，STMB 仍可工作。安裝後會增加 **Memory Books Jobs** 佇列界面，可查看活動、完成、失敗、取消、阻塞及等待審核的任務。

### 安裝

1. 打開 SillyTavern。
2. 打開主 **Extensions** 面板。
3. 選擇 **Install Extension**。
4. 安裝官方 Memory Books 倉庫。
5. 如果提示，重新載入 SillyTavern。
6. 打開一個角色聊天或群聊。
7. 等待幾秒，讓 STMB 控件初始化。

不需要 SillyTavern Extras。

### 確認 STMB 已載入

至少應出現以下一項：

- 聊天輸入框旁魔法棒 Extensions 菜單中的 **Memory Books**；
- 展開的訊息操作中的場景箭頭 **►** 和 **◄**。

如果兩者都沒有：

1. 等待最多十秒；
2. 重新整理頁面；
3. 確認擴展已安裝並啓用；
4. 重新打開一個角色聊天或群聊；
5. 只有在這些基礎檢查失敗後才查看瀏覽器控制台。

---

## 5. 打開 Memory Books 並理解主面板

打開聊天輸入框附近的魔法棒 Extensions 菜單，然後選擇 **Memory Books**。

面板可能包括：

- Current Scene；
- Memory Status / highest processed message；
- Current Lorebook Configuration；
- Memory Profiles；
- Profile Actions；
- Extra Function Buttons；
- Prompt Managers；
- General Settings；
- Automatic Memories；
- Token Saving；
- 在相關聊天中顯示的群聊角色或 Narrator 控件。

第一次建立 Memory 只需要決定三件事：

1. 哪個 Memory Book 接收條目？
2. 哪個設定檔案/連接負責生成？
3. 哪些聊天訊息構成場景？

---

## 6. Memory Book 存儲模式

### 6.1 Automatic Mode：聊天綁定 Memory Book

Automatic Mode 是正常預設方式。STMB 使用 SillyTavern 綁定到當前聊天的故事書。

適合：

- 一個聊天只有一個主要 Memory Book；
- 希望設定最少；
- 群聊角色不需要各自獨立的 Memory Book。

如果沒有綁定故事書，可以在 SillyTavern 中綁定一本，或使用 Auto-Create。

### 6.2 Auto-Create Lorebook Mode

啓用 **Auto-create lorebook if none exists** 後，如果首次儲存 Memory 時沒有故事書，STMB 會建立並綁定一本。

預設命名模板可以使用：

- `{{char}}` — 角色或群組名；
- `{{user}}` — 使用者名；
- `{{chat}}` — 聊天 ID/名稱。

必要時 STMB 會添加數字後綴以避免重名。

Auto-Create 與 Manual Lorebook Mode 互斥。

### 6.3 Manual Lorebook Mode

啓用 **Manual Lorebook Mode** 後，可以獨立於聊天當前綁定的故事書選擇 Memory Book。

適合：

- Memories 必須存放在專用故事書中；
- 多個聊天有意共享同一本 Memory Book；
- 群成員需要各自獨立的書；
- 使用 Narrator Mode；
- 使用者理解之後的激活方案。

主手動 Memory Book 的選擇儲存在當前聊天中，除非兼容的單人聊天里有持久角色鎖覆蓋它。

### 6.4 單獨的 Memory Book 通常更清晰

專用 Memory Book 更容易：

- 將 Memories 與角色定義和世界設定分離；
- 設定獨立的故事書預算和順序；
- 重用或匯出記憶歷史；
- 在沒有無關 lore 的情況下檢查 STMB 管理條目；
- 診斷激活問題。

這是建議，而不是強制要求。

### 6.5 Character Memory Book locks

Character Memory Book lock 是附著在角色卡上的持久 Manual Mode 分配。

單人聊天中：

- 未鎖定的手動書屬於當前聊天；
- 鎖定的書會跟隨角色卡進入兼容的 Manual Mode 聊天；
- 解除鎖定前不能更改手動書。

真實群聊中：

- 未鎖定的每角色分配屬於當前群聊；
- 已鎖定的每角色分配會跟隨角色卡進入兼容的 Manual Mode 群組；
- 如果鎖定的書丟失，會出現 broken-lock 狀態，必須解鎖或修復。

只有在同一角色應當有意跨故事共享同一本持續 Memory Book 時才使用鎖。對於平行世界或互不相關的時間線，這很危險。

### 6.6 推薦起始佈局

- 單人聊天：一本聊天綁定或自動建立的 Memory Book。
- 真實群聊：一本群組 Memory Book。
- Narrator chat：按照 Narrator Mode 要求，一本全知 Memory Book，加上每個聲明角色各一本獨立書。

---

## 7. 設定檔案、連接與生成路由

Memory Books 設定檔案同時控制生成行為和最終故事書條目設定。

### 7.1 推薦的第一個設定檔案

先使用 **Current SillyTavern Settings**。它使用 SillyTavern 當前活動的提供商、模型和 temperature。

不要一開始就重寫 Prompt 或設定 Full Manual endpoint。先證明能夠成功生成並儲存一條 Memory。

### 7.2 為甚麼建立儲存的 STMB 設定檔案

當需要以下情況時再建立獨立設定檔案：

- Memories 使用更便宜或更可靠的模型；
- 使用與角色扮演不同的提供商；
- 綁定一個命名 Custom connection；
- 選擇自定義 summary prompt；
- 使用不同的 temperature 或最大輸出行為；
- 更改標題格式；
- 更改激活、插入、順序或遞歸設定；
- 使用分開的 group/omniscient 與 character-focused prompts。

### 7.3 設定檔案字段

一個設定檔案可能包括：

- 顯示名稱；
- API/provider；
- model ID；
- temperature；
- Summary Prompt preset；
- 可選的獨立多角色 prompts；
- structured-output 行為；
- 可選 SillyTavern ChatCompletionService 路由；
- 可選 Chat Completion preset；
- reverse-proxy 行為；
- title format；
- activation mode：Normal、Constant 或 Vectorized；
- insertion position，包括 character、example-message、author’s-note 與 Outlet 位置；
- 適用時的 Outlet name；
- 自動或手動 order 值；
- Prevent Recursion；
- Delay Until Recursion。

### 7.4 命名 Custom OpenAI-compatible 連接

Custom OpenAI-compatible 設定檔案可以：

- 使用當前活動的 SillyTavern Custom connection；或
- 綁定 SillyTavern Connection Manager 中某個命名 Custom connection。

命名連接提供儲存的 URL 與 secret。STMB 設定檔案中的 model 字段仍是 model override。如果該命名連接被刪除，或不再是 Custom Chat Completion connection，STMB 會阻止請求，而不會靜默路由到別處。

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** 可以阻止 STMB 向拒絕 structured-output schema 的提供商發送 schema。模型仍必須返回所選 Memory 或 Consolidation Prompt 要求的有效 JSON。

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** 會把受支援的設定檔案請求經 SillyTavern 的 request helper 發送，並可應用所選的 SillyTavern Chat Completion preset。OpenRouter 請求還會繼承 SillyTavern 的 provider order、quantization filters、fallback controls 和 middle-out routing 設定。

如果 ChatCompletionService 失敗，而 STMB 通過 fallback request path 重試，這些 OpenRouter 控件仍然有效。如果 fallback 也失敗，STMB 會保留並報告最初的 ChatCompletionService 錯誤與後續 provider 響應。Full Manual 設定檔案不使用此路由。

### 7.7 Reverse proxy 與 Full Manual Configuration

**Use reverse proxy** 會為受支援提供商轉發 SillyTavern 已設定的 reverse-proxy 資訊。

**Full Manual Configuration** 在 STMB 設定檔案內單獨存儲 endpoint 與 key。它屬於特殊路徑。一般情況下應優先使用已經在 SillyTavern 中設定並測試過的 provider 或 Custom connection。

### 7.8 輸出長度

全局 STMB maximum response-token 設定可以覆蓋 Memory Books 工作的正常 Chat Completion 輸出長度。JSON 被截斷是生成失敗的常見原因。先增加輸出長度，再考慮弱化 schema 或 Prompt。

---

## 8. 場景、手動記憶、自動記憶與 Catch-up

### 8.1 甚麼是場景

**Scene（場景）**是 STMB 處理為一條 Memory 的、首尾都包含在內的聊天訊息範圍。

好的邊界通常包含一個完整單元：

- 一項事件；
- 一段對話；
- 一步調查；
- 一次情感或關係發展；
- 一次地點或目標變化；
- 一組相互關聯的行動。

非常小且瑣碎的範圍可能價值很低。非常大的範圍成本更高、難以總結、可能超出上下文，並經常混合互不相關的事件。

### 8.2 手動標記場景

1. 展開訊息操作，通常通過三點或類似控件。
2. 在第一條要包含的訊息上點選 **►**。
3. 在最後一條要包含的訊息上點選 **◄**。
4. 打開 Memory Books，確認顯示的 start、end、speakers、message count 和 token estimate。

兩個邊界訊息都包含在範圍內。

使用 **Clear Scene** 移除選擇，或選擇新的 start/end marker 來替換其中一個邊界。

### 8.3 建立手動 Memory

1. 確認場景。
2. 確認有效 Memory Book。
3. 確認所選設定檔案。
4. 點選 **Create Memory**，或使用 `/creatememory`。
5. 如果出現 confirmation、token warning、participant confirmation 或 preview 窗口，進行審核。
6. 批准結果。
7. 確認故事書中出現新條目，並且 Memory Status 已推進到場景結束訊息。

有效 Memory 通常包含：

- title；
- content；
- keywords；
- STMB 元資料，包括 source range 與 chat identity。

### 8.4 Memory previews

啓用 **Show memory previews** 時，可以審核並按需編輯：

- title；
- memory content；
- keywords。

檢查姓名、歸屬、事實、遺漏後果和無關評論。關閉 preview 時，有效結果會自動儲存。

### 8.5 Automatic Memories

啓用 **Auto-create memory summaries** 並設定：

- **Auto-Summary Interval** — 每條自動 Memory 處理的新訊息數；
- **Auto-Summary Buffer** — 保留在最新端、不立即總結的訊息數，以避免場景尚未結束就被總結。

示例：

```text
Interval: 30
Buffer: 2
```

STMB 會等到 processed boundary 之後至少有 32 條訊息，然後建立一條 Memory，結束點為最新訊息之前 2 條。

如果不存在 processed baseline，當前 STMB 將 baseline 視為 `-1`，可從訊息 0 開始。仍建議第一條 Memory 手動建立，以驗證設定並有意識地選擇起始點。

較低 interval 會生成更聚焦的 Memories，但請求更多。較高 interval 會生成較少但更大的 Memories，也更容易把無關材料混在一起。詳細角色扮演可以從約 20–40 條開始，短而快的交流可從 40–60 條開始。

如果所需 Memory Book 尚未分配，自動生成可能被推遲。

### 8.6 Processed-message baseline

STMB 為每個聊天儲存最高已處理訊息。它決定：

- `/nextmemory` 從哪裡開始；
- 自動 Memories 從哪裡開始；
- memory-boundary indicator；
- 哪些訊息視為已經處理。

使用：

- `/stmb-highest` 顯示；
- `/stmb-set-highest <N>` 手動設定；
- `/stmb-set-highest none` 清除。

手動修改必須謹慎，否則可能跳過或重復範圍。

### 8.7 為已有長聊天進行 Catch-up

使用：

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

示例：

```text
/stmb-catchup interval=40 start=0 end=245
```

範圍首尾都包含。chunk 連續處理；最後一塊可以更小。

Catch-up 被設計為非交互式。運行前：

- 選擇並測試目標設定檔案；
- 啓用 **Always use default profile**；
- 禁用 **Show memory previews**；
- 確認有效 Memory Book 已存在，或在 Automatic Mode 中允許 Auto-Create；
- 修復所有必須的多角色書分配；
- 選擇低於 token-warning threshold 的 chunk size。

STMB 會預檢所有 chunk，按順序處理，並在第一次失敗或 `/stmb-stop` 時停止。此前成功的 chunk 保持已儲存狀態。從第一條未完成訊息恢復，而不是重跑整個範圍。

Catch-up 適合大範圍轉換；如果文學或事件邊界很重要，手動場景邊界仍更好。

---

## 9. Token 節省、隱藏訊息與記憶邊界

### 9.1 隱藏不是刪除

隱藏訊息仍然存在於聊天檔案中，只是在重新顯示前不會進入活動聊天上下文。

### 9.2 Auto-hide 模式

**Auto-hide messages after adding memory** 可以設定為：

- Do not auto-hide；
- Auto-hide all messages up to the last Memory；
- Auto-hide only messages in the last Memory。

**Messages to leave unhidden** 會在邊界附近保留少量最近訊息作為重疊。

> **使用 Presence 擴充功能時：** Presence 與 STMB 都會修改 SillyTavern 共用的訊息可見性狀態，因此 Presence 之後可能會重新顯示被 STMB 隱藏的訊息。設定說明請參閱 [STMB 與其他擴充功能](#23-stmb-與其他擴充功能)。

### 9.3 生成前取消隱藏

**Unhide hidden messages for memory generation** 會在 STMB 編譯選中範圍前把它顯示出來。適用於重新生成或再次處理之前已經隱藏的範圍。成功儲存後，所選 auto-hide 模式決定哪些訊息再次隱藏。

### 9.4 Memory-boundary indicator

該指示器使用 highest processed message 顯示已處理歷史結束與未處理聊天開始的位置。

模式：

- Off；
- Memory boundary divider；
- 可拖動 jump button；
- divider + jump button。

jump button 會滾動到第一條未處理訊息附近，並記住拖動後的螢幕位置。

### 9.5 良好的學習設定

一個實用的初始設定：

- 顯示 boundary divider 與 jump button；
- 保留 2 條訊息不隱藏；
- 啓用 generation 前臨時 unhide；
- 在使用者確認 Memory 正確儲存前先不啓用 auto-hide；
- 之後切換為隱藏全部已處理訊息，以獲得主要 token 節省收益。

---

## 10. 故事書激活與檢索

### 10.1 Keywords

普通 Memories 常通過 keyword 觸發。好的關鍵詞應具體、獨特：

- 角色姓名與別名；
- 命名地點或組織；
- 重要物件；
- 事件名稱；
- 標識符；
- 特定發現或行動。

`important event`、`conversation`、`secret` 等寬泛關鍵詞太模糊。

Memory 內容決定模型學到甚麼；keywords 主要幫助 SillyTavern 決定何時檢索它。

### 10.2 Activation modes

- **Normal：** keyword/rule 驅動激活。
- **Constant：** 始終活動，但仍受適用預算和條目控制約束。
- **Vectorized：** 當使用者設定支援時使用向量相關檢索。

Vectors 是可選項。沒有 Vectors 擴展，STMB 仍可通過 keywords 工作。

### 10.3 推薦全局 World Info 設定

常見起點建議：

- Match Whole Words：off；
- Scan Depth：相對高，例如 8；
- Max Recursion Steps：約 2；
- Context percentage：根據總上下文和其他競爭 Prompt 內容來設定。

這些是建議，不是硬性要求。

### 10.4 Delay Until Recursion

如果 Memory Book 是唯一活動的 lorebook/World Info 來源，請禁用 **Delay Until Recursion**。否則可能沒有條目能啓動第一輪 recursion，Memory 就永遠不會激活。

### 10.5 診斷檢索

當 AI “不記得”時：

1. 確認條目存在。
2. 確認正確的 Memory Book 對當前聊天處於活動狀態。
3. 確認條目已啓用。
4. 確認 keywords 或 activation mode 與當前對話匹配。
5. 確認 lorebook budget 足夠。
6. 確認 recursion 設定。
7. 使用 World Info inspection 工具或 request log，確認條目是否真的被發送。
8. 如果條目已發送但被忽略，剩下的問題是模型行為或競爭上下文，而不是 STMB 存儲。

---

## 11. 真實群聊模式

### 11.1 定義

Group Chat Mode 適用於由兩個或更多獨立角色卡組成的真實 SillyTavern 群組。

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern 會記錄每條訊息由哪張角色卡生成，因此 STMB 能保留說話者歸屬並檢測參與群成員。

不需要單獨開啓 Group Chat Mode 開關。打開群聊後正常使用 STMB 即可。

### 11.2 參與者檢測

檢測到的 participant 通常是選中場景內至少發過一條訊息的角色卡。

STMB 不會從敘述中推斷所有“物理上在場”的人。因此：

- 沈默觀察者可能不會被檢測；
- 僅被提及的角色不是 participant；
- 被大家討論但實際缺席的角色不會被選中；
- 使用者不作為單獨的群組角色 Memory Book 目標；
- 重復或異常 speaker identity 可能需要修正。

如果自動 participant detection 找不到任何群角色，即使啓用了自動接受，STMB 也會打開參與者確認。警告會說明檢測失敗，並要求使用者審核當時在場的群角色。

participant prompt 的含義是：**這條 Memory 應關聯哪些群角色？** 它並不能證明誰知道每一個事實，或誰在物理上在場。

### 11.3 一本群組 Memory Book

這是推薦起始佈局。

使用 Automatic Mode、Auto-Create 或主 Manual Mode book。每個場景在群組 Memory Book 中生成一個 canonical entry。當參與者姓名可用時，該條目可以獲得 inclusive SillyTavern character filter。

Alice 和 Bob 的 inclusive filter 意味著 Alice **或** Bob 活動時該條目都可激活。它不會建立一個虛構的“Alice and Bob”角色，也不會建立一個單獨 subset book。

一本群組書適合：

- 演員陣容大多共享同一故事；
- 一個 omniscient/group-oriented summary 已足夠；
- 希望最少設定與較少重復條目；
- 不需要 STLO。

單條群組 Memory 仍然可以保留不對稱知識：

> Alice 找到了發射器並把它藏了起來。Bob 以為房間里甚麼也沒有。

### 11.4 一本群組書 + 每角色獨立書

高級真實群組佈局使用：

- 一本 canonical group Memory Book；
- 每個群成員各分配一本 character Memory Book。

要求：

- Manual Lorebook Mode；
- 安裝並啓用 SillyTavern-LorebookOrdering (STLO)；
- 每個必需群成員都有有效分配。

canonical group book 不能同時當作 character book。多個角色可以共享同一本 character book；STMB 會向該共享書寫入一個 copy，而不是產生重復項。

儲存 Memory 時：

1. canonical version 寫入 group book；
2. 除非開啓自動接受，否則確認 participants；
3. linked copies 寫入選中參與者的書；
4. 如果某個必要儲存失敗，STMB 會盡可能回滾部分寫入。

真實群組 participant confirmation 中如果不選任何參與者，則這條 Memory 應用於當前所有群成員。

### 11.5 分開的 group 與 character prompts

預設情況下，同一份 group-oriented Memory 會複製到 participant books。

設定檔案可以啓用 **Use separate group and character prompts in group chats**。此時：

- Group Summary Prompt 寫 canonical group version；
- Character Summary Prompt 為每個單角色目標書寫 individualized version。

Character-focused 版本可以保留：

- 私有知識；
- 錯誤認知；
- 個人情緒反應；
- 特定關係優先級；
- 對某個參與者真正重要的內容。

這會需要額外 AI 請求。共享 character book 只收到一個共享 copy，而不是按分配角色各重復一份。

### 11.6 STLO 的職責

Memory Books 決定：

- scene range；
- participants；
- summary content；
- 哪些 books 收到 copies；
- 是否使用 individualized prompts。

STLO 決定：

- 何時激活一本 lorebook；
- 哪個角色可以激活它；
- priority、position、budget 和 ordering。

當 STMB 分配 character book 時，它會將角色 avatar basename 添加到 `stlo.characterOverrides` 並啓用 `stlo.onlyWhenSpeaking`，同時保留已有 STLO priorities、budgets 與 overrides。

STMB 使用 merge-only 行為。清除或更改分配不會自動刪除舊 STLO character override。過時 override 需要在 STLO 中手動移除。

### 11.7 Filters 與 books 不是隱私控制

分開的 books 與 filters 改善相關性，但不保證：

- 一個角色永遠無法接收到另一角色的資訊；
- 模型永遠看不到 canonical group version；
- previous-memory context 完全按知識所有權隔離；
- character book 只代表角色有意識知道的內容。

將它們視為上下文路由工具，而不是安全邊界。

### 11.8 Linked copies 不會實時同步

linked entries 共享元資料，讓 STMB 知道它們來自同一個原始事件，但之後的編輯彼此獨立。

編輯、刪除或 compact 某一 copy 不會自動更改其他 copy。regenerate 一個 character copy 也只改變該 copy。不過，當 regenerate canonical group entry 時，STMB 會詢問是只 regenerate 該條目，還是連同所有 linked character entries 一起 regenerate。每個所選條目都有自己的 generation 和 approval review，因此 character-focused prompts 仍保持角色視角。

### 11.9 添加、移除或重新分配群成員

添加角色：

- 在下一條 distributed Memory 前分配有效 book；
- 舊 Memories 不會追溯複製；
- 舊 filters 不會重寫；
- 如需歷史上下文，應手動提供。

移除角色：

- 已有 entries 保留；
- 舊 filters 與 STLO overrides 保留；
- linked copies 不自動刪除。

更換角色 book：

- 只改變未來路由；
- 不一定從舊 book 的 STLO overrides 中刪除該角色。

### 11.10 群組 Consolidation

canonical group book 使用自動 group-chat consolidation analysis prompt，目標是在區分客觀事件與個人知識的同時構建 omniscient chronology。

character books 使用 popup 中選擇的 consolidation preset。不同 books 的 eligible source 數量可能不同。材料不足的 book 可以被跳過並警告，而準備好的 books 繼續。

character book 缺少某個 scene 只是 chronology gap，不證明該角色缺席、不知情或失去意識。共享 character book 只生成一個 consolidated entry。

---

## 12. Narrator Mode

### 12.1 定義

Narrator Mode 用於普通的一對一 SillyTavern 聊天，其中一張 Narrator 角色卡同時寫多個虛構角色。

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

如果沒有 Narrator Mode，SillyTavern 會把所有 AI 回復都視為 Narrator card 所寫。Narrator Mode 提供一個手動 cast model，使 STMB 能把 Narrator 文本中的虛構角色與場景和 Memory Books 關聯。

Narrator Mode 不能在真實 SillyTavern 群聊中使用。

### 12.2 所需存儲佈局

Narrator Mode 要求：

- Manual Lorebook Mode；
- 一本已選擇的 **omniscient/canonical Memory Book**；
- 每個聲明 cast member 各一本唯一 Memory Book。

規則：

- cast member 不能使用 omniscient book；
- 兩個 cast members 不能共享同一本 book；
- 每個聲明成員都必須有可用 book；
- retired members 會保留身份和保留的 book assignment，直到恢復或由實現用其他方式移除；
- Auto-Create 不兼容，因為 Narrator Mode 依賴 Manual Lorebook Mode。

與高級真實群組佈局不同，Narrator Mode 的 active-character retrieval 不需要 STLO。STMB 會在生成期間把所選 cast members 的 books 注入 active lorebook context。

### 12.3 設定

1. 打開 Narrator card 的普通聊天。
2. 啓用 Manual Lorebook Mode。
3. 選擇 main manual book；它就是 omniscient Memory Book。
4. 啓用 **Narrator Mode**。
5. 打開 **Manage Narrator Cast**。
6. 按名稱添加每個虛構角色，並給每人分配唯一 Memory Book。
7. 使用浮動 **Active Cast** drawer 選擇下一段交流中出現的角色。

必須先關閉 Narrator Mode，才能關閉 Manual Lorebook Mode。

### 12.4 Active Cast drawer 與 timeline metadata

浮動 Active Cast drawer 可以展開、折疊、移動，並用於選擇當前 cast members。

生成時，STMB 會快照 active cast 並寫入訊息元資料：

- 使用者訊息收到 active-cast snapshot；
- Narrator 回復收到 generation snapshot；
- continuation 會把其 cast 與已有 cast metadata 合併；
- swipe metadata 為每個 swipe 單獨儲存；
- 選擇 swipe 可以從該 timeline point 恢復 active cast；
- 刪除最近訊息可以從剩餘最新帶標籤 Narrator message 恢復 cast state。

cast marker 記錄關聯關係，不是對 prose 的語義分析。

### 12.5 正常 Narrator 生成時的檢索

Narrator generation 開始時，STMB 載入 active cast 的 Memory Books，並把其 entries 合併進本次請求使用的 character-lore collection，同時避免重復 world/UID pair。

因此：

- 只有 active-cast books 會由該 Narrator workflow 添加；
- omniscient book 仍遵循正常 Manual Mode activation/configuration；
- Narrator Mode 不要求 per-character STLO filters；
- 如果希望正確的 character books 進入上下文，generation 前 active cast 必須選對。

### 12.6 場景參與者檢測

對於選中場景，帶標籤的 Narrator responses 是權威來源。STMB 會合併 Narrator-authored messages 上記錄的 cast IDs。

如果場景含有未標記的舊 Narrator messages，STMB 會退回使用全部訊息中的 continuity 資訊，並要求使用者確認 scene cast。當前 active cast members 會預選。空選擇表示沒有任何 individual cast members 在場。

該確認專門用於 legacy 或不完整 cast metadata；完全帶標籤的場景不需要。

### 12.7 Memory 分發

Narrator scene Memory 會寫成：

- main Memory Book 中一個 canonical omniscient entry；
- 每個選中 participant 的 unique Memory Book 中一個 linked copy。

Narrator copies 不使用原生 SillyTavern character filters，而是由 STMB 在 entry metadata 中存儲 Narrator participant 與 owner IDs。

若 separate multi-character prompts 關閉，participant books 收到 omniscient summary 的 copies；若開啓，每個 single-character book 可以獲得 character-focused generation。

### 12.8 Narrator consolidation 與 regeneration

Narrator ownership 與 participant metadata 會隨 consolidation sources 傳遞，讓 higher-tier entries 保留哪個 character book 擁有 copy、哪些 cast members 參與了底層材料的資訊。

Regeneration 使用這些 metadata 判斷 replacement prompt target 應為 omniscient/group-oriented 還是 character-focused。

與真實群組 copies 相同，linked Narrator entries 建立後不會實時同步。

### 12.9 Retiring cast members

cast manager 可以把 member 標為 retired，之後再恢復。Retired members：

- 從 active-cast choices 移除；
- 從 active-cast ID set 移除；
- 保留穩定身份/歷史 metadata；
- 保留 book reservation，防止意外復用並合併身份。

用於角色退出當前 cast，但其歷史 Memory identity 必須保留的情況。

---

## 13. 聊天分支

SillyTavern 原生 branch 可以發展成不同 continuity。如果 branch 與 parent 向同一批未鎖定 Memory Books 寫入內容，互相矛盾的時間線就會混在一起。

**Copy Memory Books when branching** 預設啓用。

### 13.1 會複製甚麼

當 STMB 識別到新建的原生 branch：

- Automatic Mode 複製活動 chat-bound Memory Book；
- Manual Mode 複製 main manual Memory Book；
- Manual Mode 真實群組複製每一本唯一且未鎖定的 character Memory Book；
- Narrator Mode 複製 omniscient book 和每一本 declared character book；
- 持久 real-character locks 不複製，而是保留，因為 lock 的含義就是“繼續使用同一本書”。

一次 branch 操作複製出的所有 books 使用同一個可用 lineage number：

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

從已有 branch 再分支會保留原 lineage root，不會產生 `Branch 1 Branch 1` 這樣的名字。

### 13.2 重寫 metadata

在 copies 內部，STMB 會：

- 把匹配 parent chat IDs 改寫為 new branch chat ID；
- 當 linked books 都被複製時，重定向 canonical group/character links；
- 更新 new branch bindings，使其指向 copies。

它克隆已有內容，不重新生成 Memories。

### 13.3 失敗安全

branch copying 進行中不要切換 chats。

如果複製失敗，STMB 會清除 new branch 繼承的 writable bindings，並記錄失敗，防止 branch 靜默寫進 parent originals。

### 13.4 禁用 branch copies

只有在 branch 有意與 parent 共享同一 Memory Books 和持續歷史時才關閉此設定。

---

## 14. Clips

Clip 會把選中的聊天文字直接儲存為 `[STMB Clip]` 故事書條目，不調用 AI 模型。

### 14.1 適合用 Clip 儲存

- 偏好；
- 承諾或秘密；
- 名稱或別名；
- 物件或寵物；
- 簡短關係事實；
- 應當精確或近似精確保留的一句話；
- 不值得生成完整場景 Memory 的快速“note to self”。

### 14.2 工作流

1. 高亮聊天訊息中的文字。
2. 點選浮動剪刀按鈕。
3. 選擇已有 Clip entry 或建立新 entry。
4. 對新 entry 選擇 always-active 或 keyword-triggered 行為。
5. 審核當前 entry 與更新後的 preview。
6. 如有需要重命名。
7. 儲存。

只有選中聊天文字後浮動剪刀按鈕才會出現，也可以在主面板中禁用。

### 14.3 條目格式

標題：

```text
Seraphina Healed Me [STMB Clip]
```

內容：

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

一個 Clip entry 只有一個 section。聚焦的標題有利於聚焦的 activation keywords。

### 14.4 現有條目

給現有 entry 標題末尾添加 `[STMB Clip]`，即可把它作為 Clip entry 使用。較長 Clip entries 可以手動編輯或 compact。

Clip 只儲存選中的文字，不自動添加 source attribution。

---

## 15. Topical Clips

Topical Clip 會讀取已確認的 STMB Memory entries、當前聊天中明確指定的訊息範圍，或兩者同時讀取，然後讓 AI 生成一個聚焦於某一主題的 “about this topic” 條目。可作為 Memory sources 的內容包括 scene Memories 和 consolidated summaries；Clip 與 Side Prompt entries 被排除。

### 15.1 適合使用 Topical Clip 的情況

當一個主題的資訊分散在多個 Memories 中，例如：

- 反復出現的 NPC；
- 一段關係歷史；
- 地點或 faction；
- 調查或 mystery；
- powers、injuries、promises、preferences 或 secrets；
- 重要物件；
- 未解決 plot thread。

Topical Clip 按主題組織，而不是按每個 source Memory 的時間順序組織。

### 15.2 來源限制

Topical Clip 使用：

- 所選 source book 中已經確認的 STMB Memory entries，包括符合條件的 consolidated summaries；
- 當前聊天中明確選擇的 inclusive `X-Y` 範圍內可見 messages。

**Include saved Memories** 和 **Include chat messages** 可以單獨或一起使用。message ranges 遵循全局 unhide-before-memory 設定，並在編譯後恢復之前隱藏的 messages。

它不使用：

- 所選範圍之外的聊天訊息；
- 普通 Clip entries；
- Side Prompt entries；
- 無關普通 lorebook entries。

### 15.3 建立 Topical Clip

1. 打開 Memory Books。
2. 點選 **Topical Clip**。
3. 選擇 source Memory Book。
4. 輸入 topic。
5. 輸入 activation keywords，或留空使用 topic。
6. 選擇新 entry，或已有 `[STMB Clip]` update target。
7. 選擇 saved Memories、chat messages 或兩者作為來源。
8. 可選：只選擇特定 source Memories 和/或輸入精確 message range。
9. 選擇 generation profile。
10. 生成 draft。
11. 審核並編輯。
12. 只有正確後才儲存。

生成 draft 永遠不會自動儲存。

### 15.4 更新已有 Topical Clip

成功運行後，STMB 會記錄使用了哪些 source Memories；如果使用聊天訊息，還會記錄 source chat、message range、message IDs 與 hashes。以後基於 Memory 的更新通常只發送新增或已變化的 source Memories，並帶上現有 Clip 內容。message ranges 始終需要明確選擇。

以下情況使用 **Rebuild from all source memories**：

- 當前 entry 不完整或組織混亂；
- Prompt 發生變化；
- 舊 Memories 被大幅編輯；
- 希望重新考慮整個主題。

### 15.5 手動 source selection 與 token warnings

當 book 很大、主題只涉及某一段故事、姓名有重疊或需要嚴格證據控制時，使用 **Use only selected memories**。

STMB 會估算 request size；超過設定 token threshold 時會警告。減少來源、明確提高 threshold，或選擇本次仍然運行。

### 15.6 審核標準

確認 draft：

- 始終圍繞主題；
- 保留姓名與關係；
- 包含主要相關事實；
- 對矛盾進行標注，而不是悄悄選擇一個版本；
- 不編造 source Memories 不支援的解釋；
- 合併更新而不產生不必要重復。

### 15.7 Prompt placeholders

當選擇 saved Memories 時，自定義 Topical Clip prompt 必須包含 `{{SOURCE_MEMORIES}}`；選擇 chat messages 時必須包含 `{{SOURCE_MESSAGES}}`。

來源 placeholders：

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

支援的 placeholders 包括：

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

如果自定義 prompt 不再產生有用輸出，Reset to Default。

---

## 16. Side Prompts

Side Prompt（側邊提示）是一個獨立於正常角色回復運行的命名 STMB prompt。它通常建立或更新一份持續維護的支援條目，而不是另一條按順序排列的場景 Memory。

在 **Trackers & Side Prompts** 列表中，電源圖標會立即改變 prompt-wide **Enabled** 標誌：綠色表示 enabled，暗色表示 disabled。這個控件不會添加、刪除或更改該 prompt 已設定的 triggers。

### 16.1 合適用途

- plot 和 unresolved-thread trackers；
- relationship state；
- NPC 或 faction status；
- inventory 與 resources；
- injuries、statistics 或 reputation；
- timelines、dates、deadlines 與 travel；
- mystery clues、suspects 與 contradictions；
- inventions、research 與 projects；
- continuity-risk reports；
- world-state summaries。

避免使用模糊的“track everything” prompt、重復的場景摘要，或必須出現在下一條角色扮演回復中的任務。

### 16.2 輸出格式

Side Prompts 通常期望可直接儲存的最終 plain text 或 Markdown，不要求 Memory JSON。只有使用者有意把 JSON 當 tracker text 存儲時才使用 JSON。

### 16.3 運行順序

一次典型運行會組裝：

1. Side Prompt instructions；
2. 先前儲存的 tracker entry（如有）；
3. 可選 previous Memories；
4. 可選 Additional Context；
5. selected 或 since-last scene text；
6. 可選 Response Format instructions。

prior entry 是要修改的現有 state，並不能證明其中每個舊說法都應該保留。Prompt 應明確要求刪除 stale、resolved、contradicted 或 duplicate 資訊。

### 16.4 手動運行

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

含空格的名稱應加引號。提供的 range 首尾都包含。

手動運行最適合 targeted analysis 和需要 runtime macro values 的 prompts。

### 16.5 Memory 後自動運行

Side Prompt 可以啓用 **Run automatically after memory**。

聊天可以使用兩種 automatic selection mode 之一：

- individually enabled Side Prompts；
- 一個選中的 Side Prompt Set。

選中 set 會替代 individually enabled automatic prompts，而不是疊加。

#### Memory Assistance Side Prompt

**Memory Assistance** 是保留的 Side Prompt，有四種獨立模式。無論普通 Side Prompt enablement 或所選 Side Prompt Set 如何，只要 Memory 成功儲存，它都會在後面運行。Memory regeneration 時不運行。

Memory Assistance 會把原始 processed scene 與收到該 Memory 的每本 Memory Book 中的 ordinary 和 Topical Clips 比較。對每個被審核 Clip，它會發送 title/topic、keywords、current content、stable ID 與 type 給 AI。

有 job queue 時，每個 target Memory Book 都會在 Memory 儲存後獲得一個獨立 **Memory Assistance** job。request、response-validation、report-save 或 automatic-application error 會把該 job 標為 **Failed** 並在佇列中顯示錯誤。已儲存 Memory 仍是 **Completed**；重試 Memory Assistance 不會重新生成 Memory。

- **Off**：關閉 Memory Assistance。
- **Update**：五個或更少 Clips 直接審核；多於五個時打開選擇列表。建議變化等待手動批准。
- **Update and Suggest**：先做一次 topic-discovery request，再執行與 Update 相同的 existing-Clip review。
- **Automatic**：按 token-based batches 審核所有 Clips，不詢問要審哪些。有效 ordinary Clip additions 直接應用，而 Topical Clip replacements 仍需在 **Memory Assistance Suggestions** 中批准。

- Update 與 Update and Suggest 模式下，大列表提供 **Query Selected** 和 **Query All**。
- Query All 與 Automatic mode 使用 token-based batches，避免把所有 Clips 強塞進一個過大請求。
- 每個 ordinary Clip 最多獲得一段精確 message excerpt 作為 addition。
- Topical Clips 獲得完整 replacement drafts。
- AI 響應是一個簡單 JSON object，把每個受影響 Clip UID 直接映射到 suggested excerpt 或 replacement。空 object 表示沒有 Clip 需要更新。
- Update 結果寫入 `Memory Assistance (STMB SidePrompt)`，在通過 **Memory Assistance Suggestions** 批准前不會應用。
- Automatic-mode 結果記錄已應用 ordinary Clip additions 數量，並保留 Topical Clip replacements 與任何 application failures 供手動審核。
- 取消選擇會清除舊 suggestions，避免誤以為它們來自最新 scene。

Update and Suggest 在 existing-Clip review batches 前使用獨立 suggestion-only prompt。請求包含 processed scene 與 existing Topical Clip titles、topics、keywords 的輕量列表；discovery 時不發送 ordinary Clips 或 existing Clip bodies。AI 返回 0–5 個新主題，每個為包含 topic 與 activation keywords 的 JSON object；`{"topics":[]}` 是有效結果。

Suggested topics 儲存到 Memory Assistance report。進入 **Memory Assistance Suggestions** 後選擇 **Review Topics**，會以預設勾選且可編輯的 rows 顯示。可以取消不想要的主題、修改 topic 名稱或 keywords，也可以添加額外 topics。確認後的 topics 會依次打開標準 Topical Clip draft workflow。pending topic 只有在對應 Topical Clip 儲存後才移除；關閉 draft 則保留在 **Memory Assistance Suggestions** 中。

可審核 suggestions 準備好後，STMB 會為更新過的 Memory Book 打開 completion popup。**Dismiss** 關閉通知；**Go to Suggestions** 打開 **Memory Assistance Suggestions** 並預選該 Memory Book。從 extension menu 打開 **Memory Assistance Suggestions** 時，會先選擇當前聊天的 effective Memory Book（Automatic Mode 為 chat-bound book，Manual Mode 為 resolved manual book）。

Update 與 Topic Suggestions prompts 以及 connection-profile override 可以分別編輯，但兩個 structured response contracts 是固定的。Memory Assistance 不能刪除、複製、放進 Side Prompt Set，也不能手動運行。

### 16.6 自動 visible-message intervals

Side Prompt 可以啓用 **Run on visible message interval** 並指定距離其 checkpoint 以來需要多少可見 messages。

隱藏和 system messages 不計數。

當 set 活動時，只有該 set 內所引用 prompt 帶有相應 interval trigger 的 rows 才是候選。

### 16.7 Side Prompt Sets

Side Prompt Set 是有順序的 run list，不只是 folder。同一個 template 可以出現多次，並帶不同 macro values。

示例：

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

rows 可以存儲：

- prompt reference；
- 可選 label；
- runtime macro values；
- order；
- duplicate 或 delete actions。

rows 從上到下運行。

手動 set commands：

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 預設 sets 與 per-chat selection

General Settings 可以定義：

- solo chats 預設 set；
- group chats 預設 set。

每個 chat 可以：

1. inherit 適用 default；
2. 明確使用 individually enabled prompts；
3. 選擇 named set。

空 global default 表示 individual mode。

如果選中的 set 被刪除，STMB 會警告，而不是靜默換成另一套 workflow。缺失 row prompt 或 unresolved macro 會讓該 row 被跳過並產生警告。

set 選擇候選 rows。每個被引用 Side Prompt 仍然需要相應 automatic trigger 才能參加 after-Memory 或 interval execution。手動 set commands 不要求這些 trigger checkbox。

### 16.9 Macros

Side Prompts 可以使用普通 SillyTavern macros，例如：

```text
{{user}}
{{char}}
```

非標準 `{{...}}` placeholders 是 runtime macros，必須在手動運行時提供或存入 set row。

示例：

```text
{{npc name}}
{{faction}}
{{project_name}}
```

存在 unresolved runtime macros 的 prompt 無法自動運行。automatic runs 不能暫停等待輸入。

### 16.10 Memory-count macros

STMB 為 effective main Memory Book 注冊整數 macros：

| Macro | 計數 |
|---|---|
| `{{memtier0}}` | scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

effective main book 在 Automatic Mode 中是 chat-bound book，在 Manual Mode 中是 resolved main manual book。多 book group 或 Narrator setup 中，計數不會把所有 character books 相加。

count macro 只提供數字，不提供條目內容。

### 16.11 Message ranges

顯式 range 精確使用該 inclusive range。沒有 range 時，STMB 使用 Side Prompt 的 since-last checkpoint/cap 行為。

顯式 ranges 適合 debugging、targeted cleanup 或重跑已知段落。

### 16.12 Additional Context 與 previous Memories

Side Prompt 可包含最多七條 previous scene Memories。

Additional Context source 可以是：

- none；
- **Follow chat**，使用聊天選中的 Context Setting；
- 一個固定 named Context Setting。

這些是參考材料，Prompt 不應盲目複製進 tracker。

### 16.13 Lorebook targets

Side Prompt 通常儲存到 effective Memory Book，也可以依次使用：

1. per-chat target override；
2. template-level target；
3. effective Memory Book fallback。

有效 per-chat override 優先。

alternate targets 可用於有意共享的 campaign book 或專用 tracker book。沒有檢索方案時不要四處分散 trackers。

### 16.14 Side Prompt entry controls

template 可以設定：

- title override；
- keywords；
- Normal、Constant 或 Vectorized activation；
- insertion position 與 Outlet name；
- order mode/value；
- Prevent Recursion；
- Delay Until Recursion；
- Ignore Budget。

title 與 keyword fields 可以展開適用 macros。**Ignore Budget** 應少用，因為多個 always-included trackers 會消耗大量上下文。

### 16.15 Connection profile override

Side Prompt 可以繼承正常 Memory Books connection resolution，也可以綁定特定 STMB profile。override 可用於更便宜或更擅長 structured maintenance 的模型。過多 profile 組合會增加排查難度。

### 16.16 Side Prompt regeneration

相容的儲存現在會保存 version-2 snapshot，其中包含：

- Side Prompt template key；
- 用於 regeneration 的 prior entry content；
- 本次 run 前 entry 是否存在，以及排除更早 rollback snapshot 後的 exact prior entry state；
- source chat 與 inclusive range；
- runtime macro values；
- STMB 實際寫入的 exact entry state fingerprint。

要 regenerate，打開 lorebook editor 並點選 **Regenerate side prompt**。replacement 使用保存的 snapshot，以及當前 template、profile/context settings。

如果 template 已刪除、source chat/range 不可用，或 target/source 在 generation 期間發生變化，就無法完成 regeneration。只替換 content；現有 title、keywords 與 entry settings 保留。Legacy version-1 snapshots 仍可用於 regeneration，但不能用於 Memory Auto-Rollback。

### 16.17 編寫良好 Side Prompt

良好的 Side Prompt 會定義：

- 精確 maintenance job；
- 要審核哪些 source material；
- 是 revise、replace、merge 還是 append；
- 需要移除的 stale information；
- 穩定 output headings 與 order；
- 嚴格 length limit；
- 僅輸出最終結果。

示例：

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

有用的 guards：

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

穩定 headings 可以減少多次更新後的 drift。

### 16.18 Side Prompt troubleshooting

如果 prompt 沒有運行：

- 確認 Memory 或 interval event 確實發生；
- 檢查 chat 的 individual/set selection；
- 確認被引用 prompt 仍存在；
- 確認相關 automatic trigger 已啓用；
- 確認所有 runtime macros 都有值；
- 檢查 `/stmb-stop` 或 failed job 是否取消了它。

如果運行兩次：

- 檢查 manual + automatic invocation；
- duplicate set rows；
- duplicate prompt copies；
- 多 tabs 或 chats 同時觸發。

如果儲存到錯誤 book，檢查 per-chat 和 template-level target scopes。

如果輸出無限增長，加入明確 replacement、pruning、item-count 與 word-count rules。

---

## 17. Consolidation

Consolidation 會把低層級 STMB Memories 或 summaries 合併為更高層級的 chronological recaps。

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation 從已有 STMB entries 開始，而不是直接處理 raw chat。

### 17.2 用途

適合：

- scene Memories 越積越多；
- 舊材料不再需要完整 scene detail；
- 一段重大關係、plot 或 campaign phase 已完成；
- 希望減少 token 使用同時保留 continuity；
- 需要更乾淨的 higher-level chronology。

Consolidated entries 應強調 lasting changes、turning points、goals、consequences、relationship shifts、unresolved threads 與 stable state。

### 17.3 手動工作流

1. 打開 **Consolidate Memories**。
2. 確認目前顯示的 Source Memory Book。如果已設定的 manual 或 chat-bound book 不是本次要使用的 consolidation source，請選擇其他 book。此選擇只對目前 run 生效，不會改變 chat 設定的 Memory Book。
3. 選擇 target tier。
4. 選擇 eligible source entries。
5. 選擇 consolidation prompt/profile settings。
6. 決定成功 consolidation 後是否停用 source entries。
7. 運行並審核 candidates。
8. 批准需要的 summaries。

### 17.4 Readiness prompts 不是自動 consolidation

**Prompt for consolidation when a tier is ready** 會監控選中的 target tiers。當達到已儲存的 minimum eligible count 時，STMB 顯示 yes/later prompt。選擇 Yes 只是打開 consolidation interface，並不會靜默執行。

### 17.5 Consolidation 輸出 schema

普通 consolidation 期望嚴格 JSON：

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

模型可以返回一個或多個 summaries。`member_ids` 把每個 source 分配給一個 returned summary。outliers 應進入 `unassigned_items`，而不是強行塞進無關 recap。

### 17.6 Previous higher-tier summary

可以把 target tier 中 previous summary 作為 canon context 提供。它不是要重寫的 source material。Consolidation prompts 必須區分它與正在處理的 lower-tier entries。

### 17.7 Previews 與 failed responses

Consolidation previews 可以允許編輯、接受、從同一 sources regenerate 單個 candidate，或 regenerate pending batch。

Malformed 或 failed AI responses 可以檢查；在支援的地方，可以在 commit 前手動修正。

### 17.8 Source disabling

啓用後，成功 consolidation 後 STMB 會禁用 source entries，讓 higher-tier summary 接管 retrieval。可通過 lorebook editing 恢復。

### 17.9 良好 consolidation prompts

應定義：

- compression target；
- 建立一個 recap 還是最少數量的 coherent recaps；
- chronology 與 grouping logic；
- 必須保留的 details；
- outliers 的明確處理方式；
- exact JSON structure。

應保留 major beats、consequences、promises、relationship changes、identifiers、unresolved threads 與 retrieval-friendly keywords，同時移除重復 scene-level detail。

---

## 18. Compaction

Compaction 讓 AI 縮短一個現有 STMB-managed entry，並在替換前同時展示 original 與 draft。

### 18.1 Eligible entries

- `[STMB Clip]` entries；
- Side Prompt entries；
- STMB Memory entries。

普通 non-STMB lorebook entries 不會列出。

### 18.2 工作流

1. 打開 **Compaction**。
2. 選擇 Memory Book。
3. 選擇 Compaction Profile。
4. 可選編輯 Compaction Prompt。
5. 選擇一個 entry。
6. 比較 original 與 compacted token estimates/content。
7. 如需編輯 draft。
8. Replace、copy draft 或 cancel。

只有選擇 **Replace with Compacted Version** 後 original 才會改變。

### 18.3 良好用途

- 很長的 Clip collections；
- 重復或 stale tracker content；
- 囉嗦的 scene Memories；
- 消耗過多上下文的 always-active entries。

Compaction 不用於添加 facts、總結 raw chat、建立新 Memory 或處理普通 lorebook entries。

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Prompt 應保留 facts、names、pronouns、macros、wrapper headings 與 end markers，同時刪除 redundancy 與 low-value wording。

---

## 19. Regeneration（重新生成）

Regeneration 會為現有條目生成一個可審核的替代版本。它不會建立第二個帶編號的條目，也絕不會在未經批准的情況下覆蓋原條目。

### 19.1 Scene Memory 重新生成

- 打開 source chat；
- 在 lorebook editor 中打開 Memory Book；
- 點選 **Regenerate memory**；
- 對於帶有關聯 character entries 的 canonical group entry，選擇只重新生成當前點選的條目，或同時重新生成所有關聯條目；
- 選擇當前 profile、prompt、previous-memory count 和 Additional Context；
- 審核每個所選條目的 title、content 和 keywords。

原始 scene range 與 sequence number 會保留。關聯條目會復用同一組已選擇的 regeneration 設定，但會分別依據各自 Memory Book 的上下文以及 group/character prompt target 生成。STMB 會先收集所有批准結果，再開始儲存直接 regeneration 的結果。如果所有 source messages 都已隱藏，請先顯示它們，或啓用 unhide-before-generation。

### 19.2 Consolidation 重新生成

更高 tier 的 summary 會使用專用 **Regenerate Consolidation** preset，從其精確關聯的 lower-tier sources 重新生成。

完整 source set 必須仍存在於正確 tier 中。當某個 active parent summary 仍依賴一個 lower-tier source 時，該 source 不能被重新生成；如果確實要重建 lower tier，請先刪除 parent。

### 19.3 Side Prompt 重新生成

參見第 16.16 節的 Side Prompt snapshot 規則。

### 19.4 安全檢查

在真正替換之前，STMB 會立即驗證：

- target entry 沒有發生變化；
- source chat range 沒有發生變化；
- 所需 consolidation sources 仍未改變且可用；
- 該 entry 仍符合 regeneration 條件。

任何一項檢查失敗，都不會覆蓋原內容。

關聯的 group、character 與 Narrator copies 始終彼此獨立。

---

## 20. Generation 使用的 Context

一個 STMB request 中可能出現多種 context source。它們的作用並不相同，不能互換。

### 20.1 Current scene

當前正在處理的 message range。對於普通 scene Memory 來說，這是主要目標材料。

### 20.2 Previous Memories

來自 effective Memory Book 的較早 scene Memories，以只讀 continuity context 形式提供。使用者通常可以包含 0–7 個。

不要僅僅因為這些內容位於 current scene 之前，就再次對它們進行總結。

### 20.3 Additional Context

作為穩定參考資料提供的選定 lorebook entries，例如：

- character 或 setting rules；
- canonical names 和 terminology；
- campaign constraints；
- authoritative timeline；
- location references；
- scene 中預設成立但沒有再次說明的 facts。

Additional Context 會出現在 previous Memories 和 scene transcript 之前。它是 reference material，不是另一個 scene。

### 20.4 Context Settings

Context Setting 是一組可復用、帶順序的 Additional Context entries。

Workflow：

1. 打開 **Context Settings**；
2. 建立一個命名 setting；
3. 選擇 lorebook entries；
4. 調整它們的順序；
5. 為當前 chat 選擇該 setting，或明確選擇 No Context。

選擇結果按 chat 儲存，並且既適用於 Current SillyTavern Settings，也適用於已儲存 profiles。

如果某個被引用的 book 或 entry 消失，STMB 會發出警告、跳過失效引用並繼續。如果整個 Context Setting 被刪除，引用它的 chats 會在沒有 Additional Context 的情況下繼續運行，直到使用者選擇另一個 setting。

Context Settings 可以 duplicate、import，並可匯出為 `stmb-context-settings.json`。

### 20.5 Prior Side Prompt entry

當前需要修改的 tracker text。它代表現有狀態，但不意味著舊內容中的每一句話仍然有效。

### 20.6 Consolidation sources

真正被分組和壓縮的 lower-tier entries。

### 20.7 Previous higher-tier summary

在 consolidation 中延續的 canon context。它不是需要重新改寫的 source。

### 20.8 各 workflow 的正確順序

普通 Memory：

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt：

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation：

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompt 應明確區分 target material 與僅供參考的 material。

---

## 21. Prompt 架構、內置 Summary Prompts 與編寫規則

STMB 有三個主要的 structured generation 系統，以及若干用途更集中的輔助 workflow。

### 21.1 普通 Memory generation

STMB 期望收到一個 JSON object：

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

規則：

- 只返回 JSON object；
- 必須使用精確 key：`title`、`content`、`keywords`；
- `keywords` 必須是字元串組成的 JSON array；
- title 應短且易讀；
- 使用具體的 retrieval terms；
- 所需 Markdown 應放在 `content` 字元串內部；
- 正確轉義 quotation marks。

STMB 可以修復部分 code fences、trailing commas、think tags、wrappers 或輕微 malformed output，但 prompt 不應依賴這些修復機制。

一個好的 Memory prompt 應說明：

1. 希望採用的 memory style 與 compression level；
2. 必須保留的 continuity-relevant 資訊；
3. 應省略的 filler、OOC 或無來源支援的內容；
4. 精確 JSON schema。

較差的 prompt 往往只規定 style 而不規定 structure、要求 analysis 而不是最終 object、把 previous context 與 current scene 混為一談，或使用過於抽象的 keywords。

### 21.2 內置 Summary Prompts 以及如何選擇

這些 presets 只用於普通 Memory generation。它們不控制 Consolidation、Side Prompts、Topical Clips 或 Compaction。Profile 會在 **Memory Creation Method** 中選擇一個 preset。如果 profile 沒有指定其他 preset，**Summary** 是普通 fallback/default。Built-in 表示由 STMB 提供，並不表示所有 presets 都會運行，也不表示每個 preset 都適合當前 chat。

沒有一個 prompt 對所有情況都是最佳選擇，因為 detail、readability、retrieval quality 和 token cost 之間存在取捨。實用的簡短答案是：

- **多數使用者最佳起點：Summary。** 平衡、通用，適合測試新 model。
- **重視長期 continuity 的 RP：Comprehensive。** 對 filtering、causality、continuity 和 keyword construction 的要求最強，但對 model 要求更高，也可能生成更大的 structured Memory。
- **最重視節省 context tokens：Minimal。** 有意保持簡短，因此會損失細節。
- **獨立 real-group 或 Narrator character books：Group + Character。** 通過 profile 的 separate group/character prompt setting 搭配使用；這兩個是 target-specific prompts，不是互相競爭的一般 style。

| Built-in prompt | 最適合 | 主要取捨 |
|---|---|---|
| **Summary** | 大多數 solo chats 與初次設定。生成詳細的 chronological narrative prose，並保留重要事件、互動、發展、揭示、結果與具體 retrieval keywords。 | 比極端 token-minimal 方案保留更多細節，但比最結構化的 presets 更簡單、要求更低。 |
| **Comprehensive** | 長期運行、非常重視 continuity 的故事，需要保留 causal chains、character dynamics、established facts、關鍵互動、unresolved threads 與嚴格 keywords。它會明確過濾 incidental detail，並改善 keyword construction。 | 指令最長、要求最高。應使用擅長遵循 instruction 的 model，並提供足夠 response tokens。 |
| **Summarize** | 偏好高度易掃描 Markdown 記錄的使用者，輸出分為 Timeline、Story Beats、Key Interactions、Notable Details 與 Outcome。 | 大量 bullet 的輸出更像 reference notes，而不是自然 memory，並可能在不同 heading 間重復 facts。 |
| **Synopsis** | 需要保留幾乎每個重要 beat、interaction、detail 與 outcome，而 compactness 次要的 scene。 | 有意非常長且全面；當 lorebook/context budget 緊張時，這是最不合適的選擇之一。 |
| **Sum Up** | 需要有清晰 scene heading 和 timeline 的 chronological narrative beat record，但希望比 Summarize 或 Synopsis 少一些 section overhead。 | 對 events、character dynamics、facts 與 continuity state 的區分不那麼明確。 |
| **Minimal** | 高流量 chats、低成本 archival coverage，或 Memories 必須佔用很少 context 的設定。生成約 2–5 句的簡短 Memory。 | 重要 motives、emotional shifts、causality 與較小的 continuity details 可能丟失。 |
| **Northgate** | 想要連貫第三人稱、過去時文學記錄的 creative-writing 使用者，強調 actions、emotional shifts、development 與重要 dialogue。此 community style 歸功於 SillyTavern Discord 的 Northgate。 | 優先 readable narrative，而不是最大壓縮或清晰分開的 reference categories。與多數 general presets 不同，內置文本沒有明確排除 OOC，因此 OOC 較多時要檢查。 |
| **Aelemar** | 重大 plot scenes 與情緒後果重要的 character moments；即使原 scene 不可用，也希望 Memory 能獨立理解。此 community style 歸功於 SillyTavern Discord 的 Aelemar。 | 要求至少 300 words，且有意保持詳細，因此不適合激進 token saving。內置文本同樣沒有明確排除 OOC。 |
| **Group** | real group 中的 shared/omniscient Memory Book，或 multi-book workflow 中的 omniscient target。在保留 group decisions/state 的同時，確保 actions、emotions 與 knowledge 正確歸屬於各成員。 | 不要把它用作 individual character 的 Memory；它有意聚焦 shared group continuity。 |
| **Character** | real-group 或 multi-character workflow 中一個 character-focused Memory Book。記錄該 character 做過甚麼、知道甚麼、感受甚麼、學到甚麼、隱瞞甚麼、誤解甚麼，以及受到甚麼影響。 | 會有意省略與 target character 無關的 scene 內容，並限制沒有依據的 private knowledge。 |

新安裝時，先使用 **Summary**，直到 generation 與 retrieval 穩定工作。之後只改變 prompt，並用相似 scenes 的多條 Memories 做比較。如果問題是遺漏 causality、continuity state 或 keywords 太弱，優先嘗試 **Comprehensive**；如果問題是 Memory 太大，則嘗試 **Minimal**。Prompt 無法彌補 weak model、truncated output、不合適的 scene boundaries 或錯誤的 retrieval settings。

當前 SillyTavern locale 可以重新建立這些內置文本。重新建立 built-ins 會移除對這些 built-ins 的本地編輯，但不應刪除無關 custom presets。修改過 built-in 時，先 duplicate 或 export 再重新建立。

### 21.3 Multi-character prompt targeting

啓用 separate group/character prompts 後，STMB 會把 request target 標記為：

- `group`：canonical real-group 或 omniscient Narrator Memory；
- `character`：單個 individual character-book version。

Prompt 應明確使用對應 target perspective，同時不能編造 scene 與已提供 context 不支援的 knowledge。

### 21.4 Side Prompt 編寫

Side Prompts 通常返回 plain text 或 Markdown。它們應該像 maintenance instructions，而不是 Memory prompts。

好的 Side Prompt：

- 定義一個狹窄且明確的任務；
- 說明如何使用 previous tracker；
- 刪除 stale state；
- 規定穩定 headings 與 length limits；
- 只返回最終 tracker。

### 21.5 Consolidation 編寫

普通 consolidation 必須使用第 17.5 節的 schema。好的 prompt 應：

- 保留 chronology；
- 建立能夠覆蓋材料的最少 coherent summaries；
- 通過 `member_ids` 分配每個已使用 source；
- 通過 `unassigned_items` 標記未歸入 summary 的 sources；
- 保留重大變化與 unresolved continuity；
- 使用具體 keywords。

專用 **Regenerate Consolidation** preset 僅用於一個 replacement summary，不能作為普通 consolidation default。

### 21.6 Topical Clip 編寫

Prompt 必須包含 `{{SOURCE_MEMORIES}}`，聚焦使用者請求的 topic，區分 source evidence 與 inference，將新材料合併進 existing Clip content，並明確指出 contradictions。

### 21.7 Compaction 編寫

Prompt 必須包含 `{{ENTRY_CONTENT}}`，並在不增加無支援 facts 的前提下縮短內容。它應保留 entry 需要的 structural wrappers 與 macros。

### 21.8 Prompt 編寫檢查表

最終確定任何 STMB prompt 前，先回答：

1. 真正要分析的 target material 是甚麼？
2. 哪些材料只是 reference-only？
3. 這個 workflow 需要 strict JSON，還是 final plain text？
4. 哪些資訊必須保留下來，供以後 retrieval？
5. 哪些內容應省略、合併、繼續保留或放入 unassigned？

Return-format correctness 優先於 style。

---

## 22. Summary Prompt Manager 與 Consolidation Prompt Manager

### Summary Prompt Manager

可以 create、edit、duplicate、delete、import 和 export 普通 Memory prompt presets。通過 Memory Books profile 指定 preset。

所有普通 Memory presets 都必須保留要求的 Memory JSON schema。

關於內置 Summary Prompt 的選擇與適用情況，參見第 21.2 節。

### Consolidation Prompt Manager

控制用於把 lower-tier entries 分組成 higher-tier summaries 的 prompts，並選擇普通 default consolidation prompt。

只能用於 regeneration 的 consolidation preset 不能用於普通 consolidation。

### Import 與 localization behavior

Built-in prompts 可以按照當前 app locale 重新建立。重新建立前請備份經過本地修改的 built-ins。

---

## 23. STMB 與其他擴充功能

SillyTavern 擴充功能會同時執行，並且可能讀取或修改相同的 SillyTavern 資料。STMB 不會覆寫或停用其他擴充功能，也不會取得高於其他擴充功能的優先權。當擴充功能的行為重疊時，最終結果取決於所有相關擴充功能的設定和操作時機。

### 23.1 共用的訊息可見性

聊天訊息是否隱藏屬於 SillyTavern 共用的訊息狀態，並不是 STMB 獨占的狀態。

STMB 的 **Token Saving** 設定可以在 Memory 儲存後隱藏已處理的訊息。其他擴充功能之後可以重新顯示這些訊息，STMB 不會阻止這種操作。同樣，**Unhide hidden messages for memory generation** 可能會在 STMB 處理或重新生成所選範圍時顯示訊息。

### 23.2 Presence

Presence 擴充功能和 STMB 都可以變更聊天訊息的隱藏或可見狀態。如果 Presence 重新顯示 STMB 隱藏的訊息，並不表示 STMB 的 Token Saving 設定已被清除或忽略；而是 Presence 後續的操作變更了相同的 SillyTavern 訊息狀態。

如果您使用 Presence，並希望 STMB 隱藏的訊息保持隱藏，請使用 Presence 自身的隱藏訊息鎖定功能。Presence 目前提供 `/presenceLockHiddenMessages` 命令來實現此目的。請針對適用的訊息範圍執行此命令，並在範圍擴大時再次執行。有關命令目前行為的資訊，請參閱 Presence 文件。

STMB 不會自動設定或呼叫 Presence，而且 STMB 的群組聊天參與者管理與 Token Saving 無關。

### 23.3 Regex 集成

STMB 在兩個階段與 SillyTavern 的 Regex extension 集成：

1. **Outgoing/User Input：** 在 assembled prompt 發出之前進行 transform。
2. **Incoming/AI Output：** 在 parse/save 之前清理或標準化 raw response。

啓用 **Use regex (advanced)**，然後打開 **Configure regex**，為兩個方向分別選擇一個或多個 scripts。

重要：STMB 自己的選擇決定是否執行。即使某個 script 在 Regex extension 的普通界面中被禁用，只要被 STMB 選中，它仍可能運行。

只有在理解 transform 效果時才使用 Regex。錯誤的 outgoing rule 可能破壞必須的 schema instructions；錯誤的 incoming rule 可能破壞原本有效的 JSON。

---

## 24. Lorebook Entry 標題與字元規則

### 24.1 Title placeholders

Profile title format 可以使用：

- `{{title}}` — AI 生成的 title；
- `{{scene}}` — source range；
- `{{char}}` — character/group name；
- `{{groupname}}` — 目前 group 的 display name；在 group chat 之外解析為 `Unknown`；
- `{{present}}` — scene 中 present 的 characters，以逗號分隔：group chat 中的 individual speakers、Narrator Mode scene 選取的 Active Cast，或一般 character chat 中的 current character；
- `{{user}}` — user name；
- `{{messages}}` — scene message count；
- `{{profile}}` — profile name；
- 支援的 date/time placeholders。

### 24.2 自動編號

支援的 numbering tokens 包括：

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB 會按照所選格式分配連續的 zero-padded numbers。

### 24.3 可列印 Unicode

標題允許所有 printable Unicode characters，包括 emoji、accented text、CJK 和 symbols。U+0000–U+001F 與 U+007F–U+009F 範圍內的 Unicode control characters 會被移除。

Auto-Create 使用的 lorebook filenames 會另外針對 filesystem-reserved characters 和長度進行 sanitize。

---

## 25. Job Queue 與 Retry Controls

可選 queue 需要 Chat Top Bar / Chat Top Info Bar。Queue 可用時，重新生成 Memory、consolidation 或 Side Prompt 會建立 regeneration job；replacement 會保持在 review 狀態，直到使用者批准。

**Memory Books Jobs** drawer 可以顯示：

- queued；
- active；
- completed；
- failed；
- canceled；
- blocked；
- Needs Review。

處理 chat range 的 jobs 會在 queue row 中顯示開始與結束 message number。Drawer 還可以 cancel active work、重新打開 review jobs、查看 failures、retry work，以及 dismiss terminal history rows。

Retry scopes：

- **Retry：** 重新運行一個非 Memory job，例如 Side Prompt 或 consolidation job。
- **Retry All：** 重新運行/恢復 Memory 以及關聯的 after-Memory Side Prompt work。如果 Memory 已儲存，STMB 可以從該結果恢復，而不是建立重復 Memory。
- **Retry Memory：** 只重新運行/恢復 Memory，並有意跳過 after-Memory Side Prompts。

需要恢復完整組合 workflow 時使用 Retry All；不希望 tracker work 運行時使用 Retry Memory。

沒有 Chat Top Bar 時，STMB 的正常 workflows 仍然可以運行，只是沒有 queue UI。

---

## 26. Visual Feedback 與 Accessibility

STMB 為 scene controls 提供多種視覺狀態，包括 inactive、selected、valid range、in-scene 與 processing。具體顏色取決於 SillyTavern theme。

Accessibility 支援包括：

- keyboard navigation；
- focus indicators；
- ARIA attributes；
- reduced-motion behavior；
- mobile-friendly controls。

根據 screenshot 教使用者操作時，應描述實際可見的 icon 和 label，而不要依賴特定顏色。

---

## 27. Settings Map 與當前設定參考

本節是 settings map：說明每個面向使用者的 STMB configuration control 位於哪裡、控制甚麼，同時列出 specialized interfaces 中重要的 saved controls 和 one-run controls。僅用於建立某個 Clip、Topical Clip、Compaction 或 preview 的一次性內容字段，在各自 workflow 章節中說明，不在此重復。

常用起點：

**聊天輸入框旁的 magic-wand Extensions menu → Memory Books**

除非明確注明 **SillyTavern**，以下所有路徑都從 **Memory Books** main panel 開始。某個 control 在當前 chat、provider、profile 或 storage mode 不適用時，可能隱藏或禁用。

以下 scope 含義：

- **Global：** 在 STMB 中普遍適用，除非更窄的 setting 覆蓋。
- **Per chat：** 儲存到當前 chat 或 group。
- **Per character：** 隨 character card 在兼容 chats 中保持。
- **Per profile/template/setting：** 儲存到對應 reusable object。
- **Per run：** 只影響當前正在準備的 operation。

### 27.1 Main panel：storage、chat mode 與 active profile

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode；book choice 為 per chat | 不再把正常 chat-bound lorebook 作為 STMB 自動 target，並要求為當前 chat 選擇 Memory Book。不能與 Auto-Create Lorebook Mode 同時啓用。 |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**；Manual Mode 下可見 | Per chat | 選擇本 chat 接收 Memories 的 main Memory Book。Narrator Mode 中這是 omniscient book。 |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**；real group + Manual Mode 時可見 | Per chat | 為每個 real-group member 指定獨立 Memory Book。設定這些 assignments 以及對應 character-filtered retrieval behavior 需要 STLO。 |
| **Character Memory Book lock** | character Memory Book assignment 旁的 lock icon | Per character | 讓該 character card 在兼容 Manual Mode chats 中始終使用同一個 Memory Book。更換 assignment 前必須 unlock。 |
| **Narrator Mode** | **Current Lorebook Configuration**；只在普通 non-group chats | Per chat | 把選中的 manual book 作為 omniscient Memory Book，並啓用擁有各自 unique books 的 declared fictional cast。需要 Manual Mode 與 omniscient book。 |
| **Manage Narrator Cast** | **Narrator Mode** 下；Active Cast drawer 中也可進入 | Per chat | 添加、retire、restore Narrator characters，並為其指定 unique Memory Books。 |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Automatic Mode 下，如果 chat 沒有 lorebook，則建立並綁定一個。不能與 Manual Mode 同時啓用。 |
| **Lorebook Name Template** | **Auto-create lorebook if none exists** 下方 | Global | 命名 auto-created books。支援 `{{char}}`、`{{user}}`、`{{chat}}`。只在 Auto-Create Lorebook Mode 啓用時使用。 |
| **Memory profile selection** | **Memory Profiles** selector | Per run | 為下一次 Memory 以及旁邊的 profile actions 選擇 profile。單純選擇並不會改變儲存的 default。 |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | 把所選 profile 設為 automatic Memories 與其他 workflows 預設使用的 profile，除非 confirmation、Side Prompt override 或 workflow-specific choice 選擇了其他 profile。 |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**，或 **Profile Actions → Edit Profile** | Per profile | 格式化新 Memory entry titles，並可使用列出的 title macros 與編號。Main-panel control 編輯 default profile 的格式；**Edit Profile** 直接修改當前 selected profile。 |

### 27.2 General Settings

在 main panel 打開 **Settings → General Settings**。

| Setting | Scope | 作用 |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | 跳過普通 pre-generation confirmation window。非交互 catch-up 必需；獨立 warnings 與已啓用 previews 仍可能出現。 |
| **Automatically accept detected participants in future** | Global | 不再詢問 real-group participant confirmation，而是接受 STMB 之後檢測到的 participant set。 |
| **Show memory previews** | Global | 在儲存 generated Memories 與適用 Side Prompt output 前打開可編輯 review。 |
| **Show consolidation previews** | Global | 在 commit generated consolidation candidates 前打開 review controls。 |
| **Show notifications** | Global | 啓用 STMB toast notifications。 |
| **Show floating Clip button when text is highlighted** | Global | 選擇 chat text 後顯示 floating scissors control。 |
| **Memory boundary indicator** | Global | 可選擇不顯示、顯示 processed-boundary divider、顯示 draggable jump button，或兩者都顯示。 |
| **Allow scene overlap** | Global | 允許 selected scene range 與已由 existing Memory 表示的 message IDs 重疊。 |
| **Refresh lorebook editor after adding memories** | Global | STMB 寫入 entries 後重新整理已打開的 lorebook editor，以立即顯示新內容。 |
| **Copy Memory Books when branching** | Global | native chat branch 獲得當前 active unlocked chat-bound 或 manual Memory Books 的獨立副本。Character-locked books 按設計繼續共享。 |
| **Auto-rollback after message deletion** | Global | 當 message deletion 或 truncation 影響已經 processed 的 chat material 時啓用 coordinated rollback。預設關閉。一般 message edits 與 swipes 不會觸發。 |
| **Update last message ID processed** | Global；Auto-Rollback action | 將 processed checkpoint 移到最新 surviving Memory 的結尾；如果沒有剩餘 Memory，則清除 checkpoint。 |
| **Delete last Memory** | Global；Auto-Rollback action | 刪除 rollback scope 中所有 invalidated Memories 及其 linked copies。Memory 與 consolidation 的刪除不可逆。 |
| **Restore previous Side Prompts** | Global；Auto-Rollback action | 將每個未另行變更的 affected Side Prompt 恢復到最新 exact before-state。只保留一個 rollback level。 |
| **Default for solo chats** | Global | 選擇 solo chats 在 Memory 後繼承的 Side Prompt Set。空選擇使用 individually enabled after-Memory Side Prompts。 |
| **Default for group chats** | Global | 選擇 real group chats 在 Memory 後繼承的 Side Prompt Set。空選擇使用 individually enabled after-Memory Side Prompts。 |
| **Max Response Tokens** | Global | 覆蓋 STMB generation 的最大輸出長度。有效 JSON 被截斷時提高此值；`0` 允許正常 provider/SillyTavern behavior 作為 fallback。 |
| **Token Warning Threshold** | Global | estimated input request 超過 threshold 時顯示 confirmation warning。它不會改變 model context limit。 |
| **Default Previous Memories Count** | Global | 設定新 Memory 預設提供的 0–7 個 prior Memories 作為 continuity context。單次運行可以在 **Advanced Memory Options** 中 override。 |
| **Use regex (advanced)** | Global | 啓用 STMB 自己的 regex-processing selection。這些選擇獨立於底層 SillyTavern regex script 是否在普通界面啓用。 |
| **Configure regex… → Outgoing scripts** | Global | 選擇 STMB 在 generation provider 發送前對 material 運行的 scripts。 |
| **Configure regex… → Incoming scripts** | Global | 選擇 STMB 在 parse/save 返回內容前運行的 scripts。 |

#### General Settings 中的 Memory Auto-Rollback

**Auto-rollback after message deletion** 是 master preference。三個 action checkboxes 可以獨立選擇，預設 enabled；master switch 關閉時它們在界面中會顯示為 disabled。因此，既有安裝不會只因升級就開始刪除內容。

Auto-Rollback 只回應 message deletion 或 truncation，也包括 response regeneration 的 deletion phase。一般 edit 或 swipe 不會觸發。由於 SillyTavern 的 deletion event value 無法可靠識別 middle deletion，STMB 會追蹤每個 chat 中實際的 message identities。

如果是在末尾刪除，任何 stored source range 與 removed suffix 重疊的 Memory 都會受到影響。如果是在 chat 中間刪除，STMB 會提供三個選擇：

- **Full rollback** 刪除受影響的 Memory 以及之後所有較新的 Memories。
- **Affected only** 只刪除 overlapping Memories，保留 newer Memories，並依 deletion count 移動其 stored ranges、相關 Side Prompt checkpoints 與 processed checkpoint。這會刻意留下永久的 Memory coverage gap。
- **Cancel** 不對 Memory Books 做任何變更。

Rollback 會跨 available Memory Books 使用精確的 `STMB_chatId`、source-range 與 canonical/link metadata。canonical group 或 Narrator Memory 與所有可找到的 linked copies 視為一個 deletion unit。缺少 canonical copies、legacy entries 因 chat identity 不足而有歧義、ranges malformed，或 consolidation dependencies 不完整時，整個 rollback 會停止並提供 repair guidance；STMB 不會猜測 ownership。

選擇 **Delete last Memory** 時，STMB 會預先檢查每個 affected Memory Book 中所有 direct 與 transitive consolidation parents。一個 combined confirmation 會列出必須刪除的 consolidations。取消該確認也會取消 checkpoint、Memory 與 Side Prompt 的全部變更。批准後，STMB 會刪除 consolidation ancestors，重新啓用每個因 deleted consolidation 而 disabled 的 existing direct source 並清除其 `disabledBySummaryId` backlink，然後刪除 selected base Memories。使用者自行 disabled 的 entries 不會被重新啓用。

儲存前，STMB 會再次檢查完整 lorebook fingerprints。Lorebooks 會透過正常 serialized write lanes 按排序順序寫入；若後續 book 失敗，會保留未修改的 pre-write clones 用於 compensating saves。只有所有 lorebook writes 都成功後，chat checkpoint metadata 才會修改。chat 的 queued work 會在 preflight 前取消；active non-queued Memory creation 可以先完成再繼續 rollback。

Side Prompt rollback 使用 version-2 regeneration snapshots。每個 snapshot 記錄 entry 原先是否存在、排除更舊 rollback snapshot 後的 exact prior state、source chat/range，以及 STMB 寫入 state 的 fingerprint。如果 rolled-back run 建立了 entry，rollback 會刪除它。如果 current entry 已不再符合 saved fingerprint，STMB 會認為使用者或 later run 已修改它，並保持不動。Version-1 snapshots 仍支援 regeneration，但對 rollback 不夠安全，會在 warning 後略過。成功 restore 會消耗該 snapshot，因此該 Side Prompt 在再次執行前不能進行第二次 rollback。如果一次 rollback 多個 Memories，每個 Side Prompt 只能恢復 latest available before-state；較早 rolled-back runs 引入的資訊可能仍會保留。

#### General Settings 中的 Token Saving

這些 controls 位於同一個 **General Settings** popup 更下方的 **Token Saving (Hide/Unhide Messages)**。

| Setting | Scope | 作用 |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | 選擇不自動隱藏、隱藏到 latest Memory 為止的所有 processed messages，或只隱藏 latest Memory 使用的 range。隱藏可逆，不會刪除 messages。 |
| **Messages to leave unhidden** | Global | auto-hide 時保留這麼多 recent messages 可見，以在 Memory boundary 附近保留 overlap。`0` 會一直隱藏到適用 scene end。 |
| **Unhide hidden messages for memory generation** | Global | 在 STMB 編譯 source range 前執行相當於 `/unhide X-Y` 的操作。成功儲存後，由選定 auto-hide mode 決定哪些內容再次隱藏。 |

### 27.3 Automatic Memories 與 consolidation reminders

在 main panel 打開 **Settings → Automatic Memories**。

| Setting | Scope | 作用 |
|---|---|---|
| **Auto-create memory summaries** | Global | 啓用 automatic `/nextmemory`-style Memory creation。若沒有 processed baseline，當前 STMB 可以從 message 0 開始；仍建議先做一條 manual Memory，以驗證設定並選擇明確 starting boundary。 |
| **Auto-Summary Interval** | Global | 設定 normal automatic cadence 每次包含多少 messages。 |
| **Auto-Summary Buffer** | Global | 從本來已滿足條件的 automatic range 中排除這麼多個最新 messages，使 generation 稍微落後於 live conversation。 |
| **Prompt for consolidation when a tier is ready** | Global | monitored tier 達到已儲存 minimum eligible-source count 時顯示 yes/later prompt。絕不會靜默執行 consolidation。 |
| **Auto-Consolidation Tiers** | Global | 選擇哪些 target tiers 被監控 readiness prompts。每個 tier 的 minimum 在 **Consolidate Memories** 中儲存。 |

### 27.4 Profile editor

在 **Memory Profiles** 中選擇一個 profile，然後打開 **Profile Actions → Edit Profile**。除特別說明外，這些 settings 都是 **per profile**。Built-in **Current SillyTavern Settings** profile 會鎖定由 SillyTavern 控制的字段。

| Setting | 作用 |
|---|---|
| **Profile Name** | 為 reusable STMB profile 命名。Built-in profile name 被鎖定。 |
| **API/Provider** | 選擇 current SillyTavern routing、supported provider、Custom OpenAI-compatible connection 或 Full Manual Configuration。 |
| **Use this connection profile** | 對 **Custom OpenAI-Compatible API**，使用當前 active SillyTavern Custom connection 或一個 named Custom connection。其儲存的 URL/secret 會被使用，而 STMB **Model** 仍是 model override。 |
| **Skip structured output and use plain-text completion** | provider 拒絕 structured-output schema 時，不再發送該 schema。Selected prompt 仍必須讓 model 返回 STMB 要求的 valid JSON。 |
| **Use ST's ChatCompletionService** | 通過 SillyTavern built-in Chat Completion request helper 路由 supported requests。Full Manual profiles 不可用。 |
| **Chat Completion Preset** | 可選擇通過 ChatCompletionService 應用一個 SillyTavern Chat Completion preset。 |
| **Model** | 提供該 profile 的 exact model ID。**Current SillyTavern Settings** 則讀取 SillyTavern 當前 active model。 |
| **Temperature** | 設定該 profile 的 generation randomness。**Current SillyTavern Settings** 則讀取 SillyTavern 當前 temperature。 |
| **Use reverse proxy** | 為 supported providers 傳遞 SillyTavern configured reverse-proxy details；Full Manual Configuration 中 secret field 標記為 proxy password。 |
| **API Endpoint URL / API Key** | 僅為 **Full Manual Configuration** 提供獨立 direct endpoint 與 credential。普通使用優先採用在 SillyTavern 中已設定並測試的 connection。 |
| **Memory Creation Method** | 選擇普通 Memory generation 使用的 Summary Prompt preset。Prompt content 在 **Settings → Summary Prompt Manager** 中管理。 |
| **Use separate group and character prompts in group chats** | 為 group Memory Book 與 character-focused Memory Books 使用不同 prompt presets。 |
| **Group Summary Prompt / Character Summary Prompt** | separate group/character prompting 啓用時選擇對應兩個 presets。 |
| **Memory Title Format** | 控制該 profile 生成 Memories 的 title text、macros 與 automatic numbering。 |
| **Activation Mode** | 新 entries 儲存為 **Normal** keyword activation、**Constant** 或 **Vectorized**。 |
| **Insertion Position** | 選擇 generated entry 相對 Character、Example Messages、Author's Note 或 named Outlet 的 insertion 位置。 |
| **Outlet Name** | 目標 Outlet 名稱；只在 **Insertion Position** 為 **Outlet** 時顯示。 |
| **Insertion Order** | **Auto** 從 Memory number 推導 order；**Manual** 使用 fixed value；**Reverse** 從 starting value 倒數，僅適用於 Outlets。 |
| **Prevent Recursion** | 防止 generated entry 的 content 在 recursive scanning 中觸發其他 lorebook entries。 |
| **Delay Until Recursion** | 防止 generated entry 在第一次 scan pass 激活。如果沒有其他內容可以啓動 recursion，應保持關閉。 |
| **Also include** | 僅用於 legacy-profile compatibility。舊 profiles 可能顯示 ordered lorebook references；當前設定改用 per-chat **Context Settings**。 |

Active SillyTavern provider、model、temperature、connection preset 與 reverse proxy 在 SillyTavern 自己的 connection controls 中設定，而不是 STMB。**Current SillyTavern Settings** profile 會讀取這些 live values。

### 27.5 Context Settings

在 main panel 打開 **Settings → Context Settings**。

| Setting | Scope | 作用 |
|---|---|---|
| **Additional Context for this chat** | Per chat | 選擇一個 named Context Setting、明確儲存 **No Context**，或保持未選擇，以便 migrated context 需要決定時由 STMB 提示。 |
| **Context Setting Name** | Per Context Setting | 為 reusable Additional Context collection 命名。 |
| **Additional Context entries and order** | Per Context Setting | 選擇作為 stable reference material 發送的 lorebook entries，並決定順序。Missing entries 會被警告並跳過。 |

**New**、**Duplicate**、**Delete**、**Import JSON** 與 **Export JSON** 用於管理 Context Settings；只有當某個 setting 被 chat 或 Side Prompt 選中後，才會影響 generation behavior。

### 27.6 Trackers & Side Prompts

在 main panel 打開 **Settings → Trackers & Side Prompts**。

| Setting | Location and scope | 作用 |
|---|---|---|
| **After-memory side prompt mode for this chat** | Manager main screen；per chat | 使用匹配的 solo/group default、明確使用 individually enabled after-Memory prompts，或為本 chat 選擇一個 named Side Prompt Set。 |
| **How many concurrent prompts to run at once** | Manager main screen；global | 把 simultaneous Side Prompt jobs 限制為 1–10。 |
| **Side Prompt Set Name** | **New Set** 或 edit a set；per set | 為 reusable ordered Side Prompt run group 命名。 |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row；per set | 選擇 row template、可選 display/title label、literal 或 set-level runtime macro values，並以 row order 作為 execution order。 |
| **Enabled** | **New** 或 edit ordinary Side Prompt；per template | 當 chat 使用 individually enabled after-Memory prompts 時，使 template 具備候選資格。Trigger settings 仍決定何時運行。 |
| **Run on visible message interval / Interval** | Side Prompt editor；per template | 達到設定的 visible-message 數後運行。當 template 存在 unresolved runtime macros 時，automatic triggers 不可用。 |
| **Run automatically after memory** | Side Prompt editor；per template | successful Memory 後自動運行，受 chat Side Prompt mode 或 selected set 控制。 |
| **Allow manual run via `/sideprompt`** | Side Prompt editor；per template | 允許 explicit manual execution。 |
| **Prompt / Response Format** | Side Prompt editor；per template | 定義 instruction 與可選 output structure。兩個字段都可以使用 supported Side Prompt macros。 |
| **Previous memories for context** | Side Prompt editor；per template | 在 selected source messages 前包含 0–7 個 previous Memory entries。 |
| **Use additional context / Additional Context Source** | Side Prompt editor；per template | 包含 Additional Context，並選擇跟隨當前 chat Context Setting 或始終使用一個 fixed named setting。 |
| **Lorebook Target** | Side Prompt editor；per template 或 per chat | 把 output 儲存到 normal Memory Book 或其他 chosen lorebook。更改時 STMB 會詢問該選擇只適用於當前 chat，還是以後都應用於 template。 |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor；per template | 可選控制 upserted entry title template 與 comma-separated activation keywords。 |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor；per template | 控制 Side Prompt lorebook entry 的 activation 與 placement。 |
| **Insertion Order / Order Value** | Side Prompt editor；per template | 使用 automatic Memory-number ordering 或 fixed manual order value。 |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor；per template | 應用對應的 SillyTavern lorebook-entry recursion 與 budget flags。 |
| **Override default memory profile / Connection Profile** | Side Prompt editor；per template | 通過 selected STMB profile 路由該 Side Prompt，而不是 current default profile。 |
| **Memory Assistance Mode** | 編輯 **Memory Assistance**；global | **Off** 禁用；**Update** 對 existing Clips 提出修改；**Update and Suggest** 還會發現 Topical Clip topics；**Automatic** 直接應用 ordinary Clip additions，同時保留 Topical Clip replacements 等待批准。 |
| **Update Prompt / Topic Suggestions Prompt** | 編輯 **Memory Assistance**；per built-in template | 控制兩個 AI tasks。其 response contracts 保持固定。 |
| **Use a connection profile override** | 編輯 **Memory Assistance**；per built-in template | 讓 Memory Assistance 使用所選 STMB profile，而不是 default。 |

### 27.7 Prompt managers

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** 或 edit | Per preset | 定義 reusable ordinary-Memory prompt。只有 profile 的 **Memory Creation Method** 或 group/character prompt selection 指向該 preset 後才會使用。 |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | 選擇 **Consolidate Memories** 預設預選的普通 prompt。Regeneration-only 與 group-only presets 不能選擇。 |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** 或 edit | Per preset | 定義 reusable consolidation instructions。專用 regeneration/group presets 只能用於對應 workflows。 |

### 27.8 Topical Clip 與 Compaction defaults

在 main panel 打開 **Settings → Topical Clip** 或 **Settings → Compaction**。

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**，或 **Compaction → Compaction Profile** | Global shared default | 選擇 Topical Clip generation 與 Compaction 使用的 STMB profile。在任一界面改變它，都會改變兩個 workflows 共用的 selection。 |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | 儲存 custom Topical Clip prompt template。**Reset to Default** 返回當前 built-in prompt。儲存或 generation 前會驗證 required source macros。 |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | 儲存用於縮短 existing Memory、Clip 與 Side Prompt entries 的 custom prompt template。**Reset to Default** 返回當前 built-in prompt。必須包含 `{{ENTRY_CONTENT}}`。 |

Memory Book、topic、keywords、source inclusion、source selection、message range、draft，以及 Compaction 選中的 entry 都是 per-run workflow choices，而不是 persistent settings。

### 27.9 Consolidate Memories controls

從 main panel 底部按鈕打開 **Consolidate Memories**。該界面混合了 saved defaults 與 one-run choices。

| Setting | Scope | 作用 |
|---|---|---|
| **Source Memory Book** | Per run | 顯示目前正在 consolidate 的 Memory Book，並允許選擇其他 available book。改變選擇會重新載入 eligible-entry list，但不會修改 chat 的 configured manual 或 chat-bound Memory Book。 |
| **Target tier** | Per run | 選擇要建立的 higher tier，因此也確定其正下一級的 eligible source tier。 |
| **Consolidation Prompt** | Per run | 選擇本次 consolidation 的 prompt；初始使用 Consolidation Prompt Manager 的 default。 |
| **Maximum entries per pass** | Per run | 限制一次 analysis pass 發送多少 lower-tier entries。 |
| **Token Budget** | Per run | 設定用於本次 consolidation batching 的 approximate input budget。 |
| **Number of automatic summary attempts** | Per run | 限制為了獲得 usable assignments/summaries 而進行的 repeated analysis passes。 |
| **Saved minimum eligible entries** | Global，每個 target tier 獨立儲存 | 設定 chosen tier 何時被視為 ready，也控制該 tier 的 automatic readiness prompt。 |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | 控制新 consolidated entries 的儲存方式，與普通 Memory profile entry settings 獨立。 |
| **Disable selected source entries after creating summaries** | Per run | commit 成功後禁用已 consolidated sources，讓 higher-tier summaries 在 retrieval 中接替它們。不會刪除 sources。 |
| **Selected source entries** | Per run | 選擇要處理的 eligible lower-tier entries。未勾選 entries 保持不變。 |

### 27.10 相關 SillyTavern World Info settings

這些 controls 位於 STMB 外部的 SillyTavern World Info/lorebook settings，但會影響儲存的 Memories 是否在普通 chat generation 中被 retrieval。

| Setting | 作用 |
|---|---|
| **Match Whole Words** | 控制 keyword boundary matching。Off 是靈活 Memory keywords 的常見起點。 |
| **Scan Depth** | 控制用於 lorebook activation 的 recent text 掃描深度。較高值如 8 是常見起點。 |
| **Max Recursion Steps** | 限制 recursive World Info activation。約 2 是常見起點。 |
| **Context percentage / lorebook budget** | 限制 lorebook entries 可以佔用多少 context。提高時要兼顧 model total context 與其他 prompt material。 |

這些只是建議，不是硬性要求；retrieval diagnosis 參見第 10 節。

---

## 28. Slash Command 參考

### Memory commands

```text
/creatememory
```

從當前已標記 scene 建立 Memory。

```text
/scenememory X-Y
```

設定 inclusive range 並建立 Memory，例如 `/scenememory 10-15`。

```text
/nextmemory
```

從 highest processed boundary 後的第一條 message 到當前 eligible end 建立 Memory。

```text
/stmb-catchup interval=x start=y end=z
```

把現有 long chat 按連續 chunks 處理。

### Side Prompt commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-boundary commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency stop

```text
/stmb-stop
```

停止所有正在進行的 STMB generation，包括 Side Prompts。已經 commit 的 work 仍會保留。

---

## 29. 按階段 Troubleshooting

### 29.1 Extension/UI 沒有載入

症狀：

- magic-wand menu 中沒有 Memory Books；
- chevrons 不見了；
- 選擇文字後沒有 floating Clip button。

檢查：

1. extension 已安裝並 enabled；
2. page 已 reload；
3. 已打開 character/group chat；
4. 最多等待十秒；
5. 展開 message actions；
6. 只有這些基本檢查失敗後再檢查 console。

### 29.2 沒有選擇 scene

標記 scene 時 **►** 與 **◄** 都必須設定。請在 panel 中確認 Current Scene。

如果 range 與 existing Memory 重疊，請選擇其他 range，或啓用 Allow Scene Overlap。

### 29.3 沒有有效 Memory Book

Automatic Mode：

- 給 chat 綁定一個 lorebook；或
- 啓用 Auto-Create。

Manual Mode：

- 選擇 main manual book；
- 修復已被刪除的 selection；
- 更改 broken character lock 前先 unlock。

Real multi-book group：

- STLO 必須可用；
- 每個 required member 都需要有效 assignment；
- group book 不能同時作為 character book。

Narrator Mode：

- Manual Mode 必須 enabled；
- 必須選擇 omniscient book；
- 每個 declared member 都需要一個 unique non-omniscient book。

### 29.4 AI 沒有生成有效 Memory

按以下順序檢查：

1. provider/model/profile 有效；
2. response 沒有被截斷；
3. maximum response tokens 足夠；
4. selected prompt 仍要求 exact JSON；
5. schema 沒有被 Regex 破壞；
6. provider 支援 selected structured-output mode；
7. 只有 provider 拒絕 schema 時才嘗試 Skip Structured Output；
8. 在重寫 prompt 之前先嘗試更擅長 instruction-following 的 model；
9. 點選 persistent error notification 中的 **Raw response from AI** 查看捕獲到的 provider response；如果可用，可使用 manual JSON correction interface。

常見原因包括 code fences、commentary、缺失 key、keywords 不是 array、refusal text 或 cut-off output。

### 29.5 Memory 已儲存，但 messages 消失

它們很可能被 auto-hidden。修改 Token Saving settings。Hidden messages 並沒有刪除。

### 29.6 Automatic Memories 沒有運行

檢查：

- Auto-create memory summaries 已 enabled；
- highest processed boundary 之後有足夠 messages；
- 滿足 interval + buffer requirement；
- 沒有仍 active 的 postpone checkpoint；
- 有有效 Memory Book；
- 沒有其他 Memory job 正在阻塞 trigger；
- work 進行時沒有切換 current chat；
- group generation 已在預計 trigger 之前完成。

當前版本技術上不要求 first manual Memory，但仍建議這樣做。

### 29.7 Memory 存在但沒有 activate

檢查：

- 正確 book active；
- entry enabled；
- keywords 相關；
- activation mode；
- budget；
- recursion 與 Delay Until Recursion；
- 如果使用 STLO，則檢查 routing；
- World Info inspection/logs。

在 retrieval 被測試之前，不要重新生成 Memory。

### 29.8 Entry 已發送但被忽略

這屬於 model-use behavior。可以嘗試：

- 讓 Memory 更短、更明確；
- 改善 insertion position/priority；
- 減少 competing context；
- 使用 OOC reminder；
- 使用更可靠地遵循 supplied context 的 model。

### 29.9 Side Prompt 沒有運行

參見第 16.18 節。尤其注意，selected set 會抑制該 set 之外 individually enabled prompts。

### 29.10 Consolidation 沒有 prompt

確認：

- readiness prompt 已 enabled；
- target tier 已選中進行 monitoring；
- 存在足夠 eligible source entries；
- sources 沒有已經 disabled/ineligible；
- 達到該 tier 儲存的 minimum count。

### 29.11 Regeneration button 被禁用

Hover 或查看界面顯示的 reason。常見原因：

- entry 早於所需 snapshot metadata；
- source chat/range 不可用；
- source entries 缺失或 tier 不正確；
- active parent consolidation 阻止 lower source；
- 無法確定 original sequence number；
- Side Prompt template 已刪除。

### 29.12 Branch 沒有複製 books

檢查：

- 建立 branch 前 **Copy Memory Books when branching** 已 enabled；
- 使用的是 native SillyTavern branch；
- source books 存在且可載入；
- copying 過程中沒有切換 chat；
- branch 沒有以前被標記為 completed/failed；
- locked books 是有意繼續使用，而不是複製。

### 29.13 Narrator Mode cast 不正確

檢查：

- generation 前的 Active Cast selection；
- message 是否是 continuation，並 merge 了 cast metadata；
- swipe 是否恢復了較舊 cast state；
- scene 是否含 legacy untagged messages，需要 confirmation；
- declared character 是否已 retired；
- 每個 character book 是否仍存在。

---

## 30. FAQ

### 我需要 vectors 嗎？

不需要。Keyword activation 已足夠，並會自動生成。Vectors 是可選功能。

### Memories 應該使用獨立 lorebook 嗎？

通常建議這樣做，便於 organization、budgeting、reuse 與 diagnosis，但不是強制要求。

### STMB 會刪除 messages 嗎？

不會。它可以把 processed messages 從 active context 中隱藏。

### 我可以完全手動使用 STMB 嗎？

可以。只在需要時標記 scenes 並建立 Memories。

### Automatic Memories 可以建立第一條 Memory 嗎？

當前 STMB 可以。如果沒有 processed baseline，在 interval + buffer 達到要求後會從 message 0 開始。仍建議先手動運行一次，以驗證 setup 並選擇 desired starting boundary。

### Consolidation 會自動運行嗎？

不會。STMB 可以在 tier ready 時提示，但由使用者確認並 review operation。

### 一個 real group 可以只用一個 Memory Book 嗎？

可以。這是推薦起點，而且不需要 STLO。

### 甚麼時候值得給 real-group characters 使用 separate books？

當 individual continuity、knowledge、speaker-specific retrieval 或 character-focused summaries 帶來的精度足以值得額外 setup 和 AI requests 時。

### Narrator Mode 和 Group Chat Mode 是一回事嗎？

不是。Group Chat Mode 讀取多個獨立 SillyTavern character-card authors。Narrator Mode 則由使用者手動聲明一個 Narrator card 在 prose 中扮演的 fictional characters。

### Narrator Mode 需要 STLO 嗎？

其 Active Cast retrieval path 不需要。但它需要 Manual Lorebook Mode、一個 omniscient book，以及每個 character 獨立的 unique book。

### Linked copies 會同步嗎？

不會。它們只在 origin/consolidation metadata 上關聯，不會持續 mirror。

### 為甚麼 Delay Until Recursion 通常應該關閉？

如果沒有其他 lorebook entry 啓動 recursion，被延遲的 Memory entry 可能永遠不會 activate。

### 第一條 Memory 成功後，使用者應該做甚麼？

先確認 entry 能正確 retrieval，然後啓用 automatic Memories、選擇 interval/buffer、啓用 token hiding，並只在有明確需求時添加 Clips 或一個範圍明確的 Side Prompt。積累足夠 Memories 後再使用 Topical Clip 和 Consolidation。

---

## 31. Compatibility、Migration 與當前歷史說明

本節只保留會影響當前使用方式的歷史資訊。

### 當前 baseline

- 當前文檔版本：v8.5.0，2026 年 8 月 1 日。
- SillyTavern 要求：1.14.0 或更新版本。
- Narrator Mode 在 v8.5.0 加入。
- Branch book copying、Side Prompt regeneration 與 character Memory Book locks 在 v8.4.0 加入。
- Multi-character real-group Memory distribution 在 v8.0.0 加入。
- Additional Context 在 v7.0.0 從 profiles 移到 reusable per-chat Context Settings；舊 profile context 會遷移。
- Topical Clip 在 v6.10.0 加入。
- Compaction 與 Clips 在 v6.6.0 加入。
- Side Prompt Sets 與 per-prompt targets 在 v6.4–v6.5 階段加入。
- Consolidation 在 v6.0.0 變為 Arc 到 Epic 的 multi-tier system；舊 Arc metadata 會遷移。
- Job Queue integration 在 v6.8.0 加入，目前仍為可選。
- 當前 profile defaults 預設禁用 Delay Until Recursion，除非使用者/profile 明確修改。

### 來自舊版本的 Existing Memories

只有帶 `stmemorybooks` flag 與所需 metadata 的 entries 才會被識別為 STMB Memories。對於早於當前 metadata 的舊 entries，請使用提供的 lorebook converter。

### 已移除 functionality

舊 bookmark feature 在 v4.0.0 從 Memory Books 中移除，並從 core extension 拆分出去。不要把 Memory Books bookmark controls 當成當前功能進行教學。

### Localized built-ins

Built-in prompts 可以根據當前 SillyTavern language 重新生成。重新建立前，請備份經過自定義修改的 built-ins。

### Import behavior

Side Prompt import 是 additive。Existing prompts 會保留；imported key conflicts 會被 rename，而不是覆蓋現有 prompt。

---

## 32. Developer 與 License Notes

Memory Books 使用 Bun 進行 bundling/minification。

```sh
bun run build
```

使用以下命令安裝 repository 的 pre-commit build hook：

```sh
bun run install-hooks
```

該 hook 會在 commit 前 build，stage build artifacts，並在 build 失敗時中止 commit。

Memory Books Copyright © 2024–2026 Aiko Hanasaki，並以 GNU Affero General Public License v3.0 授權。修改版本必須保留適用 notices、標明 modifications，並遵守 AGPL source-availability 要求。

---

## 33. 簡明 Diagnostic Decision Tree

```text
使用者說：“Memory Books 不工作。”
│
├─ 菜單/control 可見嗎？
│  ├─ 否 → 檢查 installation/loading/UI。
│  └─ 是
│
├─ 可以選擇 scene 嗎？
│  ├─ 否 → 展開 message actions；設定兩個 chevrons；檢查 overlap。
│  └─ 是
│
├─ 有有效 effective Memory Book 嗎？
│  ├─ 否 → bind、auto-create、選擇 manual，或修復 multi-book bindings。
│  └─ 是
│
├─ Generation 返回 valid complete output 嗎？
│  ├─ 否 → 檢查 profile、provider、output tokens、JSON schema、Regex、model。
│  └─ 是
│
├─ Entry 存在於 intended book 中嗎？
│  ├─ 否 → 檢查 save/rollback/permission/job failure。
│  └─ 是
│
├─ SillyTavern 後續會 activate 併發送它嗎？
│  ├─ 否 → 檢查 keywords、activation mode、book binding、budget、recursion、STLO。
│  └─ 是
│
└─ Model 會使用 supplied entry 嗎？
   ├─ 否 → 檢查 model compliance、placement、competing context、entry clarity。
   └─ 是 → workflow 正常工作。
```

---

## 34. 最低推薦教學順序

對於新使用者，先只教以下步驟：

1. 打開 magic-wand menu，找到 Memory Books。
2. 使用帶有 bound book 的 Automatic Mode，或啓用 Auto-Create。
3. 選擇 Current SillyTavern Settings。
4. 展開 message actions，用 **►** 與 **◄** 標記一個短而完整的 scene。
5. 建立並 preview 一條 Memory。
6. 打開 Memory Book，驗證 saved entry。
7. 驗證 entry 後續可以 activate。
8. 啓用 automatic Memories，並選擇 interval/buffer。
9. 只有在解釋清楚 hidden messages 並未被刪除後，才啓用 auto-hide。
10. 先介紹 Clips，再介紹 Side Prompts；只有當使用者出現明確需求時，才介紹 Topical Clip/Consolidation。

除非使用者的問題確實需要，不要一開始就講 custom prompts、Full Manual endpoints、multiple character books、Regex 或 consolidation。

---

## 35. 最終概念總結

Memory Books 是一個建立在 SillyTavern lorebooks 上的 external continuity pipeline：

```text
選擇或安排 chat material
→ 生成 structured representation
→ 連同 retrieval metadata 一起儲存
→ 可選擇隱藏 processed transcript
→ 之後由 SillyTavern retrieval 相關 entries
```

系統在以下條件下效果最好：

- scenes 保持 coherent；
- prompts 明確區分 target 與 reference context；
- JSON workflows 返回精確 schemas；
- keywords 具體明確；
- Memory Books 被有意識地 assignment 與 activation；
- long-running trackers 會清理 stale state；
- consolidation 減少舊細節但不抹去 continuity；
- 使用者驗證 retrieval，而不是假設 saved 就等於 sent；
- advanced multi-book routing 只在其精度值得額外複雜度時使用。
