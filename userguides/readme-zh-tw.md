# 📕 Memory Books (SillyTavern 擴充功能)

這是 SillyTavern 的次世代擴充功能，用於自動、結構化且可靠的記憶創建。在聊天中標記場景，使用 AI 生成基於 JSON 的總結，並將其作為「[向量化](#vectorized)」條目儲存在你的世界書（Lorebooks）中。支援群組聊天、進階設定檔管理以及穩定的 API/模型處理。

### ❓ 詞彙表
- Scene (場景) → Memory (記憶)
- Many Scenes (多個場景) → Arc Summary (篇章總結)
- Always-On (常駐) → Side Prompt (Tracker) (側邊提示詞/追蹤器)

## ❗ 請先閱讀！

從這裡開始：
* ⚠️‼️請閱讀 [前置需求](#-prerequisites) 以獲取安裝注意事項（特別是如果你使用 Text Completion API）。
* ❓ [常見問題 (FAQ)](#FAQ)
* 🛠️ [疑難排解 (Troubleshooting)](#Troubleshooting)

其他連結：
* 📘 [使用者指南 (英文)](USER_GUIDE.md)
* 📋 [版本歷史與更新日誌](changelog.md)
* 💡 [配合 📚 世界書排序 (STLO) 使用 📕 Memory Books](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 透過世界書排序 (STLO) 增強功能

為了實現進階的記憶組織和更深層的故事整合，我們強烈建議將 STMB 與 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) 一起使用。請參閱指南以了解最佳實踐、設定說明和提示！

> 注意：支援多種語言：請參閱 [`/locales`](locales) 資料夾查看列表。國際化/在地化的 Readme 和使用者指南可以在 [`/userguides`](userguides) 資料夾中找到。
> 世界書轉換器和側邊提示詞範本庫位於 [`/resources`](resources) 資料夾中。

---

## 📋 前置需求

- **SillyTavern:** 1.14.0+ (建議使用最新版本)
- **場景選擇:** 必須設定開始和結束標記 (開始 < 結束)。
- **Chat Completion 支援:** 完全支援 OpenAI, Claude, Anthropic, OpenRouter 或其他聊天補全 API。
- **Text Completion 支援:** 當透過 Chat Completion (OpenAI 相容) API 端點連接時，支援文本補全 API (Kobold, TextGen 等)。我建議根據下方的 KoboldCpp 提示設定 Chat Completion API 連接 (如果你使用 Ollama 或其他軟體，請依需求調整)。之後，設定一個 STMB 設定檔並使用 Custom (推薦) 或全手動配置 (僅當 Custom 失敗或你有多個自訂連接時使用)。
**注意**: 請注意，如果你使用 Text Completion，你必須... (原文此處中斷，請接續閱讀下方設定提示)

### 📕 ST Memory Books 的 KoboldCpp 使用提示
在 ST 中進行如下設定 (在確認 STMB 運作正常後，你可以切換回 Text Completion)：
- Chat Completion API
- 來源選擇 Custom chat completion (自訂聊天補全)
- 端點設定為 `http://localhost:5001/v1` (你也可以使用 `127.0.0.1:5000/v1`)
- 在 "custom API key" 輸入任何內容 (無所謂，但 ST 需要填寫)
- model ID 必須是 `koboldcpp/modelname` (模型名稱中不要包含 .gguf！)
- 下載並匯入一個聊天補全預設組 (任何皆可)，這樣你就 *擁有* 一個聊天補全預設組，避免出現「不支援」的錯誤。
- 更改聊天補全預設組的最大回應長度 (max response length)，至少設為 2048；建議設為 4096。(太小意味著你冒著內容被切斷的風險。)

### 📕 ST Memory Books 的 Llama.cpp 使用提示
就像 Kobold 一樣，在 ST 中將以下內容設定為 *Chat Completion API* (確認 STMB 運作正常後，你可以切換回 Text Completion)：
- 為 Chat Completion API 建立一個新的連接設定檔
- Completion Source (補全來源): `Custom (Open-AI Compatible)`
- Endpoint URL (端點網址): 如果在 docker 中運行 ST，使用 `http://host.docker.internal:8080/v1`，否則使用 `http://localhost:8080/v1`
- Custom API key (自訂金鑰): 輸入任何內容 (ST 要求填寫)
- Model ID: `llama2-7b-chat.gguf` (或是你的模型名稱，如果你在 llama.cpp 中只運行一個模型則沒差別)
- Prompt post-processing (提示後處理): 無 (none)

為了啟動 Llama.cpp，我建議將類似以下的內容放入 shell script 或 bat 檔案中，以便更容易啟動：
```sh
llama-server -m <model-path> -c <context-size> --port 8080

```

## 💡 推薦的全域世界設定/世界書 (Lorebook) 觸發設定

* **Match Whole Words (全字匹配):** 保持未選取 (false)
* **Scan Depth (掃描深度):** 越高越好 (我設為 8)
* **Max Recursion Steps (最大遞歸步數):** 2 (一般建議，非必須)
* **Context % (上下文百分比):** 80% (基於 100,000 token 的上下文視窗) - 假設你沒有超大量的聊天記錄或機器人設定。

---

## 🚀 快速開始

### 1. **安裝與載入**

* 載入 SillyTavern 並選擇一個角色或群組聊天。
* 等待聊天訊息上出現箭頭按鈕 (► ◄) (可能需要約 10 秒)。

### 2. **標記場景**

* 在你想標記的場景的第一條訊息上點擊 ►。
* 在最後一條訊息上點擊 ◄。

### 3. **創建記憶**

* 打開擴充功能選單 (魔術棒圖示 🪄) 並點擊 "Memory Books"，或使用 `/creatememory` 斜線指令。
* 如果出現提示，確認設定 (設定檔, 上下文, API/模型)。
* 等待 AI 生成並自動寫入世界書條目。

---

## 🆕 斜線指令快捷鍵

* `/creatememory` 將使用現有的箭頭開始/結束標記來創建記憶。
* `/scenememory x-y` 將創建一個從訊息 x 開始到訊息 y 結束的記憶。
* `/nextmemory` 將創建一個包含自上次記憶以來所有訊息的記憶。

## 👥 群組聊天支援

* 所有功能皆適用於群組聊天。
* 場景標記、記憶創建和世界書整合都儲存在群組元數據 (metadata) 中。
* 無需特殊設定——只需選擇群組聊天並照常使用即可。

---

## 🧭 運作模式

### **自動模式 (預設)**

* **如何運作:** 自動使用綁定到目前聊天的世界書。
* **適用於:** 簡單快速。大多數使用者應該從這裡開始。
* **使用方法:** 確保你的角色或群組聊天的 "Chat Lorebooks" (聊天世界書) 下拉選單中已選取一本世界書。

### **自動創建世界書模式** ⭐ *v4.2.0 新功能*

* **如何運作:** 當沒有世界書存在時，自動使用你的自訂命名範本創建並綁定一本新的世界書。
* **適用於:** 新使用者和快速設定。完美的一鍵式世界書創建。
* **使用方法:**
1. 在擴充功能設定中啟用 "Auto-create lorebook if none exists" (若無則自動創建世界書)。
2. 設定你的命名範本 (預設: "LTM - {{char}} - {{chat}}")。
3. 當你在沒有綁定世界書的情況下創建記憶時，系統會自動創建並綁定一本。


* **範本佔位符:** {{char}} (角色名稱), {{user}} (你的名稱), {{chat}} (聊天 ID)
* **智慧編號:** 如果存在重複名稱，自動添加編號 (2, 3, 4...)。
* **注意:** 不能與手動世界書模式同時使用。

### **手動世界書模式**

* **如何運作:** 允許你為每個聊天單獨選擇用於儲存記憶的世界書，忽略主要綁定的聊天世界書。
* **適用於:** 想要將記憶導向特定、獨立世界書的進階使用者。
* **使用方法:**
1. 在擴充功能設定中啟用 "Enable Manual Lorebook Mode" (啟用手動世界書模式)。
2. 第一次在聊天中創建記憶時，系統會提示你選擇一本世界書。
3. 該選擇將針對該特定聊天儲存，直到你清除它或切換回自動模式。


* **注意:** 不能與自動創建世界書模式同時使用。

---

## 🧩 記憶類型：場景 (Scenes) vs 篇章 (Arcs)

📕 Memory Books 支援 **兩個層級的敘事記憶**，各自為不同類型的連續性而設計。

### 🎬 場景記憶 (預設)

場景記憶捕捉特定訊息範圍內 **發生了什麼**。

* 基於明確的場景選擇 (► ◄)
* 適合用於當下的回憶
* 保留對話、動作和立即的結果
* 最好頻繁使用

這是標準且最常用的記憶類型。

---

### 🧭 篇章總結 (Arc Summaries) *(Beta 測試中)*

篇章總結捕捉跨越多個場景後 **隨時間發生了什麼變化**。

與總結事件不同，篇章總結專注於：

* 角色發展和關係轉變
* 長期目標、緊張局勢和解決方案
* 情感軌跡和敘事方向
* 應該保持穩定的持久狀態變化

篇章總結是 **更高層次、較低頻率的記憶**，旨在防止長期聊天中的角色漂移和敘事遺失。

> 💡 把篇章總結想成是 *季度回顧*，而不是場景日誌。

#### 何時使用篇章總結

* 在重大的關係轉變之後
* 在故事章節或篇章結束時
* 當動機、信任或權力動態改變時
* 在開始故事的新階段之前

#### Beta 測試說明

* 篇章總結對提示詞 (prompt) 敏感且特意設計得較為保守
* 建議在提交到世界書之前進行審閱
* 最好搭配較低優先順序或 meta 風格的世界書條目使用

篇章總結是 **從現有的場景記憶** 生成的，而不是直接從原始聊天記錄生成。

這帶給你：

* 減少 Token 使用量
* AI 能更理解敘事流程

---

## 📝 記憶生成

### **僅限 JSON 輸出**

所有的提示詞和預設組 **必須** 指示 AI 僅返回有效的 JSON，例如：

```json
{
  "title": "簡短的場景標題",
  "content": "場景的詳細總結...",
  "keywords": ["關鍵字1", "關鍵字2"]
}

```

**回應中不允許包含其他文字。**

### **內建預設組**

1. **Summary:** 詳細的逐點總結。
2. **Summarize:** 包含時間線、節點、互動、結果的 Markdown 標題格式。
3. **Synopsis:** 全面、結構化的 Markdown。
4. **Sum Up:** 帶有時間線的簡明節點總結。
5. **Minimal:** 1-2 句話的總結。

### **自訂提示詞**

* 建立你自己的提示詞，但 **必須** 如上所述返回有效的 JSON。

---

## 📚 世界書整合

* **自動條目創建:** 新記憶將作為包含所有元數據的條目儲存。
* **基於標記的檢測:** 只有帶有 `stmemorybooks` 標籤的條目才會被識別為記憶。
* **自動編號:** 支援多種格式的順序、補零編號 (`[000]`, `(000)`, `{000}`, `#000`)。
* **手動/自動排序:** 每個設定檔的插入順序設定。
* **編輯器重新整理:** 選擇性地在添加記憶後自動重新整理世界書編輯器。

> **現有的記憶必須轉換！**
> 使用 [Lorebook Converter (世界書轉換器)](https://www.google.com/search?q=/resources/lorebookconverter.html) 添加 `stmemorybooks` 標籤和所需欄位。

---

### 🎡 追蹤器與側邊提示詞 (Side Prompts)

側邊提示詞可以像追蹤器一樣使用，並會在你的記憶世界書中創建條目。側邊提示詞允許你追蹤 **當前狀態**，而不僅僅是過去的事件。例如：

* 💰 庫存與資源 ("使用者擁有什麼物品？")
* ❤️ 關係狀態 ("X 對 Y 的感覺如何？")
* 📊 角色數值 ("當前健康、技能、聲望")
* 🎯 任務進度 ("哪些目標是活躍的？")
* 🌍 世界狀態 ("設定中有什麼變化？")

#### **存取:** 從 Memory Books 設定中，點擊 “🎡 Side Prompt Manager” (側邊提示詞管理器)。

#### **功能:**

```
- 查看所有側邊提示詞。
- 創建新的或複製提示詞以嘗試不同的提示詞風格。
- 編輯或刪除任何預設組 (包括內建的)。
- 將預設組匯出或匯入為 JSON 檔案以進行備份或分享。
- 手動執行，或隨記憶創建自動執行。

```

#### **使用技巧:**

```
- 創建新提示詞時，你可以複製內建的以獲得最佳相容性。
- 額外的側邊提示詞範本庫 [JSON 檔案](resources/SidePromptTemplateLibrary.json) - 匯入即可使用。

```

---

### 🧠 Regex (正規表達式) 整合與進階自訂

* **完全控制文字處理**: Memory Books 現在與 SillyTavern 的 **Regex** 擴充功能整合，允許你在兩個關鍵階段應用強大的文字轉換：
1. **提示詞生成 (Prompt Generation)**: 透過建立針對 **User Input (使用者輸入)** 位置的 regex 腳本，自動修改發送給 AI 的提示詞。
2. **回應解析 (Response Parsing)**: 透過針對 **AI Output (AI 輸出)** 位置，在儲存之前清理、重新格式化或標準化 AI 的原始回應。


* **支援多重選擇**: 你現在可以多選 regex 腳本。所有啟用的腳本將在每個階段（提示詞生成和回應解析）依序應用，允許進階且靈活的轉換。
* **如何運作**: 整合是無縫的。只需在 Regex 擴充功能中建立並啟用（多選）你想要的腳本，Memory Books 就會在記憶和側邊提示詞創建期間自動應用它們。

---

## 👤 設定檔管理

* **設定檔:** 每個設定檔包含 API、模型、溫度 (temperature)、提示詞/預設組、標題格式和世界書設定。
* **匯入/匯出:** 將設定檔分享為 JSON。
* **設定檔創建:** 使用進階選項彈出視窗儲存新設定檔。
* **個別設定檔覆蓋:** 暫時切換 API/模型/溫度以進行記憶創建，然後恢復原始設定。

---

## ⚙️ 設定與組態

### **全域設定 (Global Settings)**

[Youtube 上的簡短影片概覽](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode (手動世界書模式):** 啟用以每個聊天單獨選擇世界書。
* **Auto-create lorebook if none exists (若無則自動創建世界書):** ⭐ *v4.2.0 新功能* - 使用你的命名範本自動創建並綁定世界書。
* **Lorebook Name Template (世界書命名範本):** ⭐ *v4.2.0 新功能* - 使用 {{char}}, {{user}}, {{chat}} 佔位符自訂自動創建的世界書名稱。
* **Allow Scene Overlap (允許場景重疊):** 允許或防止記憶範圍重疊。
* **Always Use Default Profile (始終使用預設設定檔):** 跳過確認彈出視窗。
* **Show memory previews (顯示記憶預覽):** 啟用預覽彈出視窗，在添加到世界書之前審閱和編輯記憶。
* **Show Notifications (顯示通知):** 切換 Toast 訊息通知。
* **Refresh Editor (重新整理編輯器):** 記憶創建後自動重新整理世界書編輯器。
* **Token Warning Threshold (Token 警告閾值):** 設定大型場景的警告級別（預設：30,000）。
* **Default Previous Memories (預設前序記憶):** 作為上下文包含的先前記憶數量 (0-7)。
* **Auto-create memory summaries (自動創建記憶總結):** 啟用間隔自動創建記憶。
* **Auto-Summary Interval (自動總結間隔):** 自動創建記憶總結的訊息間隔數（10-200，預設：100）。
* **Memory Title Format (記憶標題格式):** 選擇或自訂（見下文）。

### **設定檔欄位 (Profile Fields)**

* **Name (名稱):** 顯示名稱。
* **API/Provider (API/提供者):** openai, claude, custom 等。
* **Model (模型):** 模型名稱 (例如：gpt-4, claude-3-opus)。
* **Temperature (溫度):** 0.0–2.0。
* **Prompt or Preset (提示詞或預設組):** 自訂或內建。
* **Title Format (標題格式):** 每個設定檔的範本。
* **Activation Mode (觸發模式):** Vectorized (向量化), Constant (常數), Normal (一般)。
* **Position (位置):** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (及欄位名稱)。
* **Order Mode (排序模式):** Auto (自動)/manual (手動)。
* **Recursion (遞歸):** 防止/延遲遞歸。

---

## 🏷️ 標題格式化

使用強大的範本系統自訂你的世界書條目標題。

* **佔位符:**
* `{{title}}` - AI 生成的標題 (例如："A Fateful Encounter")。
* `{{scene}}` - 訊息範圍 (例如："Scene 15-23")。
* `{{char}}` - 角色名稱。
* `{{user}}` - 你的使用者名稱。
* `{{messages}}` - 場景中的訊息數量。
* `{{profile}}` - 用於生成的設定檔名稱。
* 各種格式的當前日期/時間佔位符 (例如：`August 13, 2025` 表示日期，`11:08 PM` 表示時間)。


* **自動編號:** 使用 `[0]`, `[00]`, `(0)`, `{0}`, `#0`，現在還支援包裹形式如 `#[000]`, `([000])`, `{[000]}` 以進行順序、補零編號。
* **自訂格式:** 你可以建立自己的格式。自 v4.5.1 起，標題中允許所有可列印的 Unicode 字元（包括表情符號、中日韓文字、重音符號、符號等）；僅封鎖 Unicode 控制字元。

---

## 🧵 上下文記憶 (Context Memories)

* **包含最多 7 個先前的記憶** 作為上下文，以獲得更好的連續性。
* **Token 估算** 包含上下文記憶以確保準確性。

---

## 🎨 視覺回饋與無障礙設計

* **按鈕狀態:**
* Inactive (未啟用), active (啟用), valid selection (有效選擇), in-scene (場景中), processing (處理中)。


* **無障礙設計:**
* 鍵盤導航、焦點指示器、ARIA 屬性、減少動態效果、行動裝置友善。



---

# FAQ (常見問題)

### 我在 Extensions (擴充功能) 選單中找不到 Memory Books！

設定位於 Extensions 選單中（輸入框左側的魔術棒圖示 🪄）。尋找 "Memory Books"。

### 我需要運作 Vectors (向量) 嗎？

在 ST 的介面中，世界資訊 (world info) 中的 🔗 條目被命名為 "vectorized" (向量化)。這就是為什麼我使用向量化這個詞。如果你不使用向量擴充功能（我就沒用），它會透過關鍵字運作。這一切都是自動化的，所以你不必考慮要使用什麼關鍵字。

### 我應該為記憶製作一個單獨的世界書，還是可以使用我已經用於其他事情的同一本世界書？

我建議將你的記憶世界書設為一本單獨的書。這使得組織記憶（相對於其他條目）更容易。例如，將其添加到群組聊天，在另一個聊天中使用它，或設定單獨的世界書預算（使用 STLO）。

### 如果 Memory Books 是唯一的世界書，我應該使用 'Delay until recursion' (延遲直到遞歸) 嗎？

不。如果沒有其他世界資訊或世界書，選擇 'Delay until recursion' 可能會阻止第一個迴圈觸發，導致沒有任何東西被啟動。如果 Memory Books 是唯一的世界書，請停用 'Delay until recursion' 或確保至少配置了一個額外的世界資訊/世界書。

---

# Troubleshooting (疑難排解)

* **沒有可用或選定的世界書:**
* 在 Manual Mode (手動模式) 下，出現提示時選擇一本世界書。
* 在 Automatic Mode (自動模式) 下，將一本世界書綁定到你的聊天。
* 或者啟用 "Auto-create lorebook if none exists" (若無則自動創建世界書) 進行自動創建。


* **未選擇場景:**
* 標記開始 (►) 和結束 (◄) 點。


* **場景與現有記憶重疊:**
* 選擇不同的範圍，或在設定中啟用 "Allow scene overlap" (允許場景重疊)。


* **AI 無法生成有效的記憶:**
* 使用支援 JSON 輸出的模型。
* 檢查你的提示詞和模型設定。


* **超過 Token 警告閾值:**
* 使用較小的場景，或增加閾值。


* **缺少箭頭按鈕:**
* 等待擴充功能載入，或重新整理。


* **角色資料無法使用:**
* 等待聊天/群組完全載入。



---

## 📝 字元政策 (v4.5.1+)

* **標題中允許:** 允許所有可列印的 Unicode 字元，包括重音字母、表情符號、中日韓文字和符號。
* **封鎖:** 僅封鎖 Unicode 控制字元 (U+0000–U+001F, U+007F–U+009F)；這些字元會被自動移除。

## 請參閱 [字元政策詳情](https://www.google.com/search?q=charset.md) 以獲取範例和遷移說明。

*使用 VS Code/Cline 開發，經過廣泛測試和社群回饋，充滿愛心製作。* 🤖💕
