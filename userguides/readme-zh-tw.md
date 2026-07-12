# 📕 Memory Books (SillyTavern 擴充功能)

這是 SillyTavern 的次世代擴充功能，用於自動、結構化且可靠的記憶創建。在聊天中標記場景，使用 AI 生成基於 JSON 的總結，並將其儲存在你的世界書（Lorebooks）中。支援群組聊天、進階設定檔管理、側邊提示詞/追蹤器，以及多層級記憶整合。

### ❓ 詞彙表
- Scene (場景) → Memory (記憶)
- One saved fact (單一已保存事實) → Clip (剪輯)
- Ongoing tracker (持續追蹤器) → Side Prompt (側邊提示詞/追蹤器)
- Many Memories (多個記憶) → Summary / Consolidation (總結 / 整合)
- One long entry (單一過長條目) → Compaction (壓縮)

### 剪輯 vs Side Prompts

簡單規則：**一個固定事實 = 剪輯；持續追蹤器 = Side Prompt。**

| **剪輯** | **Side Prompts** |
|---|---|
| 把選取的聊天文字保存為記憶書中的筆記。 | 請 AI 閱讀聊天並更新一個追蹤器條目。 |
| 用在您已經知道確切要記住哪個事實的時候。 | 用在資訊會隨時間變化的時候。 |
| 可以理解為：「把這條筆記釘住。」 | 可以理解為：「讓這個區塊保持更新。」 |

更長說明請看[使用者指南](USER_GUIDE-zh-tw.md#clips-vs-side-prompts)。

### 壓縮 vs 總結整合

簡單規則：**一個臃腫條目 = 壓縮；多個記憶 = 總結整合。**

| **壓縮** | **總結整合** |
|---|---|
| 縮短一個既有的 STMB 管理條目。 | 把多個記憶或總結合併成一個更高層級的回顧。 |
| 用在某個剪輯、Side Prompt 或記憶條目仍然有用，但開始太長的時候。 | 用在多個記憶已經適合整理成 Arc、Chapter、Book 或其他更大總結的時候。 |
| 可以理解為：「修剪這一個條目。」 | 可以理解為：「把這些記憶卷成一條回顧。」 |

更長說明請看[使用者指南](USER_GUIDE-zh-tw.md#compaction-vs-consolidation)。

## ❗ 請先閱讀！

從這裡開始：
* ⚠️‼️請閱讀 [前置需求](#-前置需求) 以獲取安裝注意事項（特別是如果你使用 Text Completion API）。
* ❓ [常見問題 (FAQ)](#faq-常見問題)
* 🛠️ [疑難排解 (Troubleshooting)](#troubleshooting-疑難排解)

其他連結：
* 📘 [使用者指南 (繁體中文)](USER_GUIDE-zh-tw.md)
* 💡 [STMB 運作原理 (繁體中文)](howSTMBworks-zh-tw.md)
* 📋 [版本歷史與更新日誌](../changelog.md)
* 💡 [配合 📚 世界書排序 (STLO) 使用 📕 Memory Books](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Traditional%20Chinese.md)

> 注意：支援多種語言：請參閱 [`/locales`](../locales) 資料夾查看列表。國際化/在地化的 Readme 和使用者指南可以在 [`/userguides`](./) 資料夾中找到。
> 世界書轉換器和側邊提示詞範本庫位於 [`/resources`](../resources) 資料夾中。

---

## 📑 目錄

- [前置需求](#-前置需求)
  - [ST Memory Books 的 KoboldCpp 使用提示](#-st-memory-books-的-koboldcpp-使用提示)
  - [ST Memory Books 的 Llama.cpp 使用提示](#-st-memory-books-的-llamacpp-使用提示)
- [推薦的全域世界設定/世界書 (Lorebook) 觸發設定](#-推薦的全域世界設定世界書-lorebook-觸發設定)
- [快速開始](#-快速開始)
  - [1. 安裝與載入](#1-安裝與載入)
  - [2. 標記場景](#2-標記場景)
  - [3. 創建記憶](#3-創建記憶)
- [記憶類型：場景 (Scenes) vs 總結 (Summaries)](#-記憶類型場景-scenes-vs-總結-summaries)
  - [場景記憶 (預設)](#-場景記憶-預設)
  - [總結整合 (Summary Consolidation)](#-總結整合-summary-consolidation)
- [記憶生成](#-記憶生成)
  - [僅限 JSON 輸出](#僅限-json-輸出)
  - [內建預設組](#內建預設組)
  - [自訂提示詞](#自訂提示詞)
- [世界書整合](#-世界書整合)
- [剪輯到 Memory Book](#️-剪輯到-memory-book)
- [主題剪輯](#-主題剪輯)
- [斜線指令快捷鍵](#-斜線指令快捷鍵)
- [群組聊天支援](#-群組聊天支援)
- [運作模式](#-運作模式)
  - [自動模式 (預設)](#自動模式-預設)
  - [自動創建世界書模式](#自動創建世界書模式--v420-新功能)
  - [手動世界書模式](#手動世界書模式)
- [追蹤器與側邊提示詞](#-追蹤器與側邊提示詞)
- [壓縮](#-壓縮)
- [Regex (正規表達式) 整合與進階自訂](#-regex-正規表達式-整合與進階自訂)
- [設定檔管理](#-設定檔管理)
- [設定與組態](#-設定與組態)
  - [全域設定](#全域設定-global-settings)
  - [設定檔欄位](#設定檔欄位-profile-fields)
- [標題格式化](#-標題格式化)
- [上下文記憶](#-上下文記憶-context-memories)
- [選用工作佇列](#-選用工作佇列需要-chat-top-bar)
- [視覺回饋與無障礙設計](#-視覺回饋與無障礙設計)
- [FAQ](#faq-常見問題)
  - [我應該為記憶製作一個單獨的世界書，還是可以使用我已經用於其他事情的同一本世界書？](#我應該為記憶製作一個單獨的世界書還是可以使用我已經用於其他事情的同一本世界書)
  - [我需要運作 Vectors (向量) 嗎？](#我需要運作-vectors-向量-嗎)
  - [如果 Memory Books 是唯一的世界書，我應該使用「延遲直到遞迴」嗎？](#如果-memory-books-是唯一的世界書我應該使用延遲直到遞迴嗎)
  - [為什麼 AI 看不到我的條目？](#為什麼-ai-看不到我的條目)
- [疑難排解](#troubleshooting-疑難排解)
- [透過世界書排序 (STLO) 增強功能](#-透過世界書排序-stlo-增強功能)
- [字元政策](#-字元政策-v451)
- [開發者資訊](#-開發者資訊)
  - [建置擴充功能](#建置擴充功能)
  - [Git Hooks](#git-hooks)

---

## 📋 前置需求

- **SillyTavern:** 1.14.0+ (建議使用最新版本)
- **選用工作佇列:** STMB 不需要工作佇列也能運作。若要使用佇列功能，請安裝並啟用 **Chat Top Bar** / **Chat Top Info Bar**，這是 SillyTavern 官方擴充功能，會在聊天視窗上方加入一條頂部列。STMB 會使用該頂部列顯示 **記憶書任務** 按鈕和抽屜。
- **Chat Completion 支援:** 完全支援 OpenAI, Claude, Anthropic, OpenRouter 或其他聊天補全 API。
- **Text Completion 支援:** 當透過 Chat Completion (OpenAI 相容) API 端點連接時，支援文本補全 API (Kobold, TextGen 等)。我建議根據下方的 KoboldCpp 提示設定 Chat Completion API 連接 (如果你使用 Ollama 或其他軟體，請依需求調整)。之後，設定一個 STMB 設定檔並使用 Custom (推薦) 或全手動配置 (僅當 Custom 失敗或你有多個自訂連接時使用)。
**注意**：如果你使用 Text Completion，必須先有一個 Chat Completion 預設組！

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

- **額外說明：** 如果記憶世界書是你唯一的世界書，請確認 STMB 設定檔中的「延遲直到遞迴」已停用，否則記憶可能不會觸發。
---

## 🚀 快速開始

### 1. **安裝與載入**

![等待這些按鈕出現](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)


* 載入 SillyTavern 並選擇一個角色或群組聊天。
* 等待聊天訊息上出現箭頭按鈕 (► ◄) (可能需要約 10 秒)。

### 2. **標記場景**

![已點擊的開始按鈕](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

![場景中間按鈕](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-middle.png)

![已點擊的結束按鈕](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-end.png)


* 在你想標記的場景的第一條訊息上點擊 ►。
* 在最後一條訊息上點擊 ◄。

### 3. **創建記憶**

* 打開擴充功能選單 (魔術棒圖示 🪄) 並點擊 "Memory Books"，或使用 `/creatememory` 斜線指令。
* 如果出現提示，確認設定 (設定檔, 上下文, API/模型)。
* 等待 AI 生成並自動寫入世界書條目。

---

## 🧩 記憶類型：場景 (Scenes) vs 總結 (Summaries)

📕 Memory Books 支援 **場景記憶** 與 **多層級總結整合**，各自處理不同類型的連續性需求。

### 🎬 場景記憶 (預設)

場景記憶會捕捉特定訊息範圍內 **發生了什麼**。

- 以明確選取的場景範圍為基礎 (► ◄)
- 適合逐段回想當下事件
- 保留對話、動作與直接結果
- 最適合經常使用

這是標準且最常用的記憶類型。

---

### 🌈 總結整合 (Summary Consolidation)

![整合按鈕](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-consolidate.png)

總結整合會捕捉多筆記憶或總結中 **隨時間發生了什麼變化**。

它不會只總結單一場景，而是著重於：

- 角色發展與關係轉變
- 長期目標、緊張局勢與解決結果
- 情緒軌跡與敘事方向
- 應長期保持穩定的狀態變化

第一個整合層級是由場景記憶建立的 **Arc**。較長的故事也支援更高層級：

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 請把它們視為 *回顧總結*，而不是場景日誌。

#### 何時使用總結整合

- 發生重大關係轉變之後
- 故事章節或篇章結束時
- 動機、信任或權力動態改變時
- 開始故事的新階段之前

#### 運作方式

- 整合總結會從既有的 STMB 記憶/總結產生，而不是直接從原始聊天產生。
- **整合記憶** 工具可讓你選擇目標總結層級與來源條目。
- STMB 可選擇監看指定的總結層級，並在某層級達到已儲存的最低合格來源數量時顯示「是/稍後」確認。
- 如果你希望較高層級的總結接手，STMB 可在整合後停用來源條目。
- AI 總結回應失敗時，可以先在 UI 中檢視並修正，再重新嘗試提交。

這能帶來：

- 較低的 token 使用量
- 長篇聊天中更好的敘事連續性

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
6. **Northgate:** 面向創作的文學風格總結。
7. **Aelemar:** 著重情節重點與角色記憶。
8. **Comprehensive:** 更適合關鍵字抽取的 synopsis 風格總結。

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
> 使用 [Lorebook Converter (世界書轉換器)](../resources/lorebookconverter.html) 添加 `stmemorybooks` 標籤和所需欄位。

---

### 🎡 追蹤器與側邊提示詞

![在哪裡找到追蹤器與 Side Prompts](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/sp.png)


> 📘 Side Prompts 有獨立指南：[Side Prompts Guide](side-prompts-zh-tw.md)。請參考該指南了解 Sets、巨集、範例與疑難排解。
> 🎡 需要完整點擊路徑？請參閱 [啟用 Side Prompts 的 Scribe 教學](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)。

Side Prompts 是獨立的 STMB 提示詞執行，用於維護持續的聊天狀態。可將它們用於追蹤器和輔助筆記，避免讓一般角色回覆變得臃腫。如果您只是想保存一條已選取的固定事實，請使用剪輯，而不是 Side Prompt。

例如：

* 💰 庫存與資源（「使用者擁有什麼物品？」）
* ❤️ 關係狀態（「X 對 Y 的感覺如何？」）
* 📊 角色數值（「當前健康、技能、聲望」）
* 🎯 任務進度（「哪些目標是活躍的？」）
* 🌍 世界狀態（「設定中有什麼變化？」）

#### **存取:** 從 Memory Books 設定中，點擊 “🎡 追蹤器與側邊提示詞”。

#### **功能:**

* 查看、建立、複製、編輯、刪除、匯出與匯入 Side Prompts。
* 手動執行 Side Prompts，在記憶建立後執行，或作為 Side Prompt Set 的一部分執行。
* 使用 `{{user}}` 和 `{{char}}` 等標準 SillyTavern 巨集。
* 當提示詞執行時需要提供值，可使用 `{{npc name}}` 等執行階段巨集。
* 將 Side Prompt 輸出儲存為記憶世界書中的獨立 side-prompt 條目。

#### **使用技巧:**

* 建立新提示詞時，建議從內建範本複製。
* Side Prompts 不必返回 JSON。純文字或 Markdown 都可以。
* Side Prompts 通常會被更新/覆寫；記憶會依序儲存。
* 手動語法：`/sideprompt "Name" {{macro}}="value" [X-Y]`。
* 當聊天需要一組有順序的追蹤器時，使用 Side Prompt Sets。
* 選定的「記憶建立後」Side Prompt Set 會取代該聊天中個別啟用的「記憶建立後」Side Prompts。
* 額外的 Side Prompt 範本庫：[JSON 檔案](../resources/SidePromptTemplateLibrary.json)。匯入即可使用。

---

## 🧹 壓縮

![點擊這裡打開壓縮選單](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/compaction.png)


壓縮是一種審閱流程，用來讓 STMB 管理的 lorebook 條目更節省 token。它會請 AI 重寫一個現有條目，然後在替換任何內容之前，先讓您查看原文與壓縮草稿。

這和總結整合不同：壓縮會重寫一個條目；總結整合會把多個記憶合併成更大的回顧。

您可以從 Memory Books 主彈窗點擊 **📝 壓縮** 開啟它。較長的剪輯條目也可能在剪輯流程中顯示 **壓縮條目** 按鈕。

#### 符合條件的條目

壓縮會列出所選記憶書中的符合條件條目：

- 帶有 `[STMB Clip]` 標記的剪輯條目
- 側邊提示詞條目
- 由 Memory Books 標記的 STMB 記憶條目

不由 STMB 管理的一般 lorebook 條目不會顯示。

#### 運作方式

1. 打開 Memory Books，然後點擊 **📝 壓縮**。
2. 選擇一個 **記憶書**。如果目前聊天已經有有效的記憶書，STMB 會預先選取它；否則，請從可搜尋下拉選單中選擇。
3. 選擇一個 **壓縮設定檔**。這會決定壓縮請求使用哪個 AI 連線 / 模型。
4. 選用：如果想修改送給 AI 的指令，請點擊 **編輯壓縮提示**。
5. 點擊要重寫條目旁邊的 **壓縮條目**。
6. 比較 **原始內容** 與 **壓縮草稿**。STMB 會顯示兩者的估算 token 數。
7. 視需要編輯草稿，然後選擇 **替換為壓縮版本**、**複製壓縮草稿** 或 **取消**。

STMB 不會自動替換原文。只有點擊 **替換為壓縮版本** 後，lorebook 條目才會被修改。

#### 壓縮提示

壓縮提示可以編輯。預設提示會要求 AI 保留重要事實、姓名、代名詞、巨集、包裝標題和結尾標記，同時移除重複內容與低價值措辭。

支援的提示佔位符：

- `{{ENTRY_CONTENT}}` — 目前 lorebook 條目的內容。此佔位符是必需的。
- `{{ENTRY_KIND}}` — 條目類型，例如 Clip、SidePrompt 或 Memory。
- `{{ENTRY_TITLE}}` — lorebook 條目的標題。

如果想恢復內建壓縮提示，請在提示編輯器中使用 **重設為預設值**。

#### 適合用於

- 較長的剪輯條目
- 隨時間累積重複內容的側邊提示詞追蹤條目
- 有用但冗長的 STMB 記憶條目
- 常駐且開始浪費上下文的條目

#### 不適合用於

- 添加新事實
- 總結原始聊天
- 建立新記憶
- 重寫不由 STMB 管理的一般 lorebook 條目

---

### 🧠 Regex (正規表達式) 整合與進階自訂

![設定 regex](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/regex.png)


* **完全控制文字處理**: Memory Books 現在與 SillyTavern 的 **Regex** 擴充功能整合，允許你在送出前和解析前兩個關鍵階段應用文字轉換。
1. **提示詞生成 (Prompt Generation)**: 使用針對 **User Input (使用者輸入)** 的腳本，自動修改發送給 AI 的提示詞。
2. **回應解析 (Response Parsing)**: 使用針對 **AI Output (AI 輸出)** 的腳本，在儲存前清理、重新格式化或標準化 AI 的原始回應。


* **支援多重選擇**: 你可以在 STMB 的選擇彈窗中多選腳本。
* **如何運作**: STMB 會管理你選中的腳本，並在送出前和解析前依序套用。即使 Regex 擴充功能中這些腳本已被停用，只要在 STMB 中選中，它們仍會執行。

---

## ✂️ 剪輯到 Memory Book

![剪輯文字](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/clip.png)

剪輯到 Memory Book 適合快速儲存「記住這一點」的筆記。選取重要的聊天文字，點擊浮動的剪刀按鈕，即可把所選文字作為項目符號儲存到 Memory Book 中，不必先開啟世界書編輯器。

如果你需要一個會隨時間更新的持續追蹤器，請改用側邊提示詞。簡單來說：**剪輯 = 儲存一項明確事實；側邊提示詞 = 持續更新的追蹤器。**

#### 運作方式
- 精確選取你想記住的文字。
- 點擊浮動的剪刀按鈕。你可以在 Memory Books 彈出視窗中開啟或關閉此按鈕。
- 選擇一個現有剪輯條目，或創建一個新條目。
- 儲存前檢視目前條目與更新後的預覽。
- 如有需要，可重新命名條目/區段。

剪輯條目是一般世界書條目，標題末尾帶有 `[STMB Clip]` 標記。例如：

```txt
Seraphina Healed Me [STMB Clip]
```

條目內顯示的區段會使用不含 `[STMB Clip]` 的標題：

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.
- Seraphina, guardian of this forest

=== END Seraphina Healed Me ===
```

#### 提示
- 一個剪輯條目只包含一個區段。使用 `{{user}} 喜歡的事物`、`暱稱` 或 `食物偏好` 等聚焦標題，讓關鍵字保持明確。
- 新剪輯條目可以設為永遠啟用，也可以由關鍵字觸發。永遠啟用最簡單；若該條目只應偶爾出現，使用關鍵字會更合適。
- 在既有條目標題末尾加入 `[STMB Clip]`，即可將其變成剪輯條目。
- 較長的剪輯條目可能會顯示提醒，請你檢視或壓縮內容。壓縮可以在替換原始條目前，讓剪輯、側邊提示詞與 STMB 記憶條目更節省 token。
- 剪輯條目不會加入來源歸屬，只會儲存你選擇剪輯的文字。

## 🔎 主題剪輯

主題剪輯會建立或更新一條關於某個主題的聚焦型剪輯式記憶條目。

當你已經保存了一些 STMB 記憶，但想要一條乾淨的「關於這個主題」條目，把這些記憶中的相關細節集中起來時，可以使用它。例如：

- `關於 Seraphina`
- `關於 {{user}} 的魔法`
- `關於 Alex 和 Mira 的關係`
- `關於 Black Harbor 調查`

主題剪輯不同於普通的「剪輯到記憶書」。普通剪輯會直接保存你選取的聊天文字。主題剪輯會讀取既有的 STMB 記憶條目，請 AI 擷取一個主題相關的細節，然後在保存前給你一份可編輯草稿。

#### 運作方式

1. 打開 Memory Books。
2. 點擊 **🔎 主題剪輯**。
3. 選擇**來源記憶書**。
4. 輸入**主題**。
5. 輸入啟用**關鍵字**，或留空以使用主題。
6. 選擇建立新的主題剪輯，或更新既有的 `[STMB Clip]` 條目。
7. 選擇**生成設定檔**。
8. 點擊**生成草稿**。
9. 檢查並編輯草稿。
10. 只有在滿意時才點擊**儲存主題剪輯**。

主題剪輯會保存為普通的剪輯條目，並帶有 `[STMB Clip]` 標記。新條目會使用類似這樣的標題：

```txt
關於 Seraphina [STMB Clip]
```

#### 更新既有主題剪輯

更新既有主題剪輯時，STMB 會記住上一次成功執行使用過哪些來源記憶。下一次更新通常只會使用新的或已變更的來源記憶。

如果你想用所有符合條件的記憶重新建立整條條目，請在生成草稿前啟用**從所有來源記憶重建**。

#### 說明

- 主題剪輯只使用已確認的 STMB 記憶條目作為來源材料。
- 剪輯條目和 Side Prompt 條目不會作為來源記憶使用。
- 更新目標是既有的 `[STMB Clip]` 條目。
- AI 草稿在保存前始終可以檢查和編輯。
- 只有點擊**儲存主題剪輯**後，STMB 才會保存生成的草稿。
- 如果請求較大，STMB 可能會在執行前顯示 token 警告。

---

---

## 🆕 斜線指令快捷鍵

* `/creatememory` — 從已標記的場景建立記憶。
* `/scenememory X-Y` — 設定場景範圍並建立記憶，例如 `/scenememory 10-15`。
* `/nextmemory` — 從上一筆記憶結尾到目前訊息建立記憶。
* `/stmb-catchup interval=x start=y end=y` — 為既有長聊天建立補記憶，透過依照指定間隔大小分段處理所選訊息範圍來產生記憶。
* `/sideprompt "Name" {{macro}}="value" [X-Y]` — 執行 Side Prompt（`{{macro}}` 可選）。
* `/sideprompt-set "Set Name" [X-Y]` — 執行已儲存的 Side Prompt Set。
* `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` — 執行 Side Prompt Set 並提供可重複使用的巨集值。
* `/sideprompt-on "Name" | all` — 依名稱啟用某個 Side Prompt，或啟用全部。
* `/sideprompt-off "Name" | all` — 依名稱停用某個 Side Prompt，或停用全部。
* `/stmb-highest` — 回傳此聊天中已處理記憶的最高 message id。
* `/stmb-set-highest <N|none>` — 手動設定此聊天的最高已處理 message id。
* `/stmb-stop` — 停止所有正在進行的 STMB 生成。用於緊急中止。

### `/stmb-catchup`

當你想把既有的長聊天轉換成 STMB 記憶時，使用 `/stmb-catchup`。

語法：

```txt
/stmb-catchup interval=x start=y end=y
```

範例：

```txt
/stmb-catchup interval=30 start=0 end=300
```

參數：

- `interval=x` - 每筆產生的記憶大約包含的訊息數量。
- `start=y` - 要包含的第一則訊息編號。
- `end=y` - 要包含的最後一則訊息編號。

此指令用於補登轉換，不適合一般持續使用。STMB 追上既有聊天進度後，請使用自動摘要或 `/nextmemory`。

---

## 👥 群組聊天支援

STMB 在群組聊天中可使用與一對一聊天相同的手動、自動及斜線指令記憶工具。你不需要開啟獨立的群組聊天模式：選擇群組後照常使用 STMB 即可。

#### 參與者感知記憶

- STMB 會讀取每則群組聊天訊息所附帶的發言者，並在產生的總結中清楚標示角色歸屬。
- 當 STMB 能識別參與場景的群組成員時，儲存的記憶會獲得一個包含這些成員的 SillyTavern 角色篩選器。這可讓群組記憶與實際參與該場景的角色保持關聯。
- 場景標記、已處理的最高訊息 ID、手動世界書選擇，以及其他依聊天儲存的狀態，都會保存在目前的群組聊天中。切換聊天不會把這些設定移到其他聊天。

#### 自動模式與自動創建模式：一本 Memory Book

自動模式會使用綁定至群組聊天的世界書。若群組尚未擁有世界書，自動創建模式可以建立並綁定一本。在這兩種模式下，記憶都會儲存至該群組的 Memory Book；能識別發言者時，也會自動加入參與者篩選器。

這是最簡單的設定，也足以應付大多數群組聊天。

#### 手動模式：群組與角色 Memory Books

手動世界書模式可以維護一本主要群組 Memory Book，並為每位群組成員指定一本 Memory Book。若要為個別角色指定世界書，必須安裝並啟用 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering)。

1. 開啟群組聊天並啟用 **手動世界書模式**。
2. 選擇主要的手動世界書。它會成為規範的群組 Memory Book。
3. 在 **群組角色世界書** 下，為每位成員選擇一本世界書。你可以把同一本世界書指派給多個角色。
4. 照常創建記憶。
5. 確認哪些角色參與了場景。STMB 會預先選取從訊息中偵測到的成員。若不選擇任何人，該記憶將套用至所有群組成員。

STMB 會把規範記憶儲存至群組 Memory Book，並複製到所選參與者各自指定的 Memory Book。相關條目會在內部建立連結，讓群組整合與角色整合能保持時間線一致。若任何必要的角色世界書遺失或遭刪除，STMB 會停止操作，而不會留下只儲存一部分的記憶集合。

參與者確認視窗包含 **日後自動接受偵測到的參與者** 選項。若你信任訊息發言者偵測，且不想在每次創建記憶時核准清單，可以啟用它。

#### 分別使用群組與角色提示詞（選用）

若要為同一筆記憶創建不同版本：

1. 開啟 **設定檔管理器**，編輯用於創建記憶的設定檔。
2. 啟用 **在群組聊天中分別使用群組與角色提示詞**。
3. 選擇一個 **群組總結提示詞** 與一個 **角色總結提示詞**。

群組提示詞會為主要群組 Memory Book 撰寫共享版本。在搭配 STLO 的手動模式下，角色提示詞可以為個別指派的角色 Memory Book 創建以該角色為重點的版本。這會使用額外的生成請求，但能讓共享記憶描述整個場景，而個別副本則專注於對該角色重要的內容。若多位成員共用同一本指定的 Memory Book，STMB 只會在其中保留一份共享副本。

> 💡 **建議：** 先從一本群組 Memory Book 開始。只有當個別成員需要不同的知識、連續性或上下文時，再加入按角色劃分的 Memory Book。

---

## 🧭 運作模式

### **自動模式 (預設)**

![聊天世界書綁定範例](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)


* **如何運作:** 自動使用綁定到目前聊天的世界書。
* **適用於:** 簡單快速。大多數使用者應該從這裡開始。
* **使用方法:** 確保你的角色或群組聊天的 "Chat Lorebooks" (聊天世界書) 下拉選單中已選取一本世界書。

### **自動創建世界書模式** ⭐ *v4.2.0 新功能*

* **如何運作:** 當沒有世界書存在時，自動使用你的自訂命名範本創建並綁定一本新的世界書。
* **適用於:** 新使用者和快速設定。完美的一鍵式世界書創建。
* **使用方法:**
1. 在擴充功能設定中啟用 "自動建立故事書 (如果不存在)"。
2. 設定你的命名範本 (預設: "LTM - {{char}} - {{chat}}")。
3. 當你在沒有綁定世界書的情況下創建記憶時，系統會自動創建並綁定一本。


* **範本佔位符:** {{char}} (角色名稱), {{user}} (你的名稱), {{chat}} (聊天 ID)
* **智慧編號:** 如果存在重複名稱，自動添加編號 (2, 3, 4...)。
* **注意:** 不能與手動世界書模式同時使用。

### **手動世界書模式**

* **如何運作:** 允許你為每個聊天單獨選擇用於儲存記憶的世界書，忽略主要綁定的聊天世界書。
* **適用於:** 想要將記憶導向特定、獨立世界書的進階使用者。
* **使用方法:**
1. 在擴充功能設定中啟用 "啟用手動故事書模式"。
2. 第一次在聊天中創建記憶時，系統會提示你選擇一本世界書。
3. 該選擇將針對該特定聊天儲存，直到你清除它或切換回自動模式。


* **注意:** 不能與自動創建世界書模式同時使用。

---

## 👤 設定檔管理

![設定檔管理](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profiles.png)


* **設定檔:** 每個設定檔包含 API、模型、溫度 (temperature)、提示詞/預設組、標題格式和世界書設定。
* **匯入/匯出:** 將設定檔分享為 JSON。
* **設定檔創建:** 使用進階選項彈出視窗儲存新設定檔。
* **個別設定檔覆蓋:** 暫時切換 API/模型/溫度以進行記憶創建，然後恢復原始設定。

* **內建提供者/設定檔:** STMB 包含必要的 `Current SillyTavern Settings` 選項，會直接使用你目前啟用的 SillyTavern 連線與設定。

---

## ⚙️ 設定與組態

![主要設定面板 1](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile1.png)
![主要設定面板 2](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile2.png)
![主要設定面板 3](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile3.png)


### **全域設定 (Global Settings)**

[Youtube 上的簡短影片概覽](https://youtu.be/mG2eRH_EhHs)

* **啟用手動故事書模式:** 啟用以每個聊天單獨選擇世界書。
* **自動建立故事書 (如果不存在):** ⭐ *v4.2.0 新功能* - 使用你的命名範本自動創建並綁定世界書。
* **Lorebook Name Template (世界書命名範本):** ⭐ *v4.2.0 新功能* - 使用 {{char}}, {{user}}, {{chat}} 佔位符自訂自動創建的世界書名稱。
* **Allow Scene Overlap (允許場景重疊):** 允許或防止記憶範圍重疊。
![場景重疊警告](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)
![啟用場景重疊](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap2.png)

* **始終使用預設設定檔:** 跳過確認彈出視窗。
* **顯示記憶預覽:** 啟用預覽彈出視窗，在添加到世界書之前審閱和編輯記憶。
* **顯示通知:** 切換 Toast 訊息通知。
* **重新整理編輯器:** 記憶創建後自動重新整理世界書編輯器。
* **最大回應 Token 數:** 設定記憶總結生成時允許的最大輸出長度。
* **Token Warning Threshold (Token 警告閾值):** 設定大型場景的警告級別（預設：30,000）。
* **Default Previous Memories (預設前序記憶):** 作為上下文包含的先前記憶數量 (0-7)。
* **自動建立記憶摘要:** 啟用間隔自動創建記憶。
* **自動摘要間隔:** 自動創建記憶總結的訊息間隔數。
* **自動摘要緩衝區：** 可延後指定訊息數才自動總結。
* **當某個層級準備好時提示合併:** 當所選總結階層達到足夠的有效來源數量時顯示 yes/later 確認。
* **自動合併層級：** 選擇哪些總結階層應在達標時觸發確認提示。目前支援 Arc 到 Series。
* **Unhide hidden messages before memory generation:** 可在建立記憶前執行 `/unhide X-Y`。
* **新增記憶後自動隱藏訊息:** 可選擇隱藏所有已處理訊息，或只隱藏最近的記憶範圍。
* **使用正則表達式（進階）:** 啟用 STMB 的 regex 選擇彈出視窗（送出/解析處理）。
* **記憶標題格式:** 選擇或自訂（見下文）。

### **設定檔欄位 (Profile Fields)**

![設定檔組態](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)


* **Name (名稱):** 顯示名稱。
* **API/Provider (API/提供者):** `目前 SillyTavern 設定`、openai、claude、custom、full manual 等。
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

![標題格式](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformat.png)
![標題格式列表](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformats.png)


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

![帶有上下文的記憶生成](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)


* **包含最多 7 個先前的記憶** 作為上下文，以獲得更好的連續性。
* **Token 估算** 包含上下文記憶以確保準確性。

---

<a id="optional-job-queue-chat-top-bar-required"></a>
## 🧾 選用工作佇列（需要 Chat Top Bar）

![ST Memory Books 工作佇列](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/queue.png)


工作佇列是選用功能，但很強大。你不需要它也能使用 Memory Books。

如果安裝並啟用 **Chat Top Bar** / **Chat Top Info Bar**，STMB 會在聊天頂部列加入 **記憶書任務** 按鈕。它會開啟一個佇列抽屜，讓你查看進行中、已完成、失敗、已取消，或需要審核的 Memory Books 任務。

這在以下情況特別有用：

- 從較長的場景建立記憶
- 執行整合
- 在建立記憶後執行 Side Prompts
- 在長聊天中工作，並希望更清楚地查看進度和審核處理

佇列可以顯示任務狀態、取消進行中的任務、重試失敗的任務，並隱藏已完成的任務。如果佇列中的任務需要使用者審核，STMB 可以將它標記為 **需要審核**，而不是靜默覆寫可能不安全的內容。

如果未安裝或未啟用 Chat Top Bar，STMB 仍會正常運作。你只是無法使用工作佇列 UI。


### 安裝 Chat Top Bar

![如何安裝 Chat Top Bar](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/install.png)

---
## 🎨 視覺回饋與無障礙設計

![顯示所有視覺狀態的完整場景選擇](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)


* **按鈕狀態:**
* Inactive (未啟用), active (啟用), valid selection (有效選擇), in-scene (場景中), processing (處理中)。


* **無障礙設計:**
* 鍵盤導航、焦點指示器、ARIA 屬性、減少動態效果、行動裝置友善。


---

# FAQ (常見問題)

### 我應該為記憶製作一個單獨的世界書，還是可以使用我已經用於其他事情的同一本世界書？

我建議為記憶使用獨立的世界書。這樣更容易將記憶與其他條目分開整理，例如把它加入群組聊天、用於其他聊天，或透過 STLO 為它設定獨立的世界書預算。

### 我需要運作 Vectors (向量) 嗎？

你可以使用，但不是必要條件。如果你不使用 Vectors 擴充功能（我也不用），它會透過關鍵字運作。關鍵字會自動處理，因此你不需要自行考慮該使用哪些關鍵字。

### 如果 Memory Books 是唯一的世界書，我應該使用「延遲直到遞迴」嗎？

不應該。如果沒有其他世界資訊或世界書，選擇「延遲直到遞迴」可能會阻止第一次循環觸發，導致沒有任何內容被啟用。如果 Memory Books 是唯一的世界書，請停用「延遲直到遞迴」，或確保至少另有一個世界資訊/世界書。

### 為什麼 AI 看不到我的條目？

首先，你必須確認條目確實有傳送給 AI。我喜歡使用 [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) 來檢查。

如果條目已被觸發並傳送給 AI，你可能需要在 OOC 中直接要求 AI 使用它們，例如：`[OOC: 為什麼你沒有使用提供給你的資訊？具體來說：（相關內容）]` 😁

---

# Troubleshooting (疑難排解)

- **我在 Extensions (擴充功能) 選單中找不到 Memory Books！**
  設定位於 Extensions 選單中，也就是輸入框左側的魔術棒 🪄。請在其中尋找「Memory Books」。

![STMB 設定位置](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **沒有可用或選定的世界書：**
  - 在手動模式下，出現提示時選擇一本世界書。
  - 在自動模式下，將一本世界書綁定到你的聊天。
  - 或啟用「若不存在則自動創建世界書」進行自動創建。

- **Lorebook Validation Error：**
  - 你可能刪除了先前綁定的世界書。只要綁定一本新的世界書即可；空白世界書也可以。

- **未選擇場景：**
  - 同時標記開始 (►) 與結束 (◄) 點。

- **場景與現有記憶重疊：**
  - 選擇不同範圍，或在設定中啟用「允許場景重疊」。

![場景重疊警告](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)
![啟用場景重疊](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap2.png)

- **AI 無法產生有效的記憶：**
  - 使用支援 JSON 輸出的模型。
  - 檢查你的提示詞與模型設定。

- **超過 Token 警告閾值：**
  - 使用較小的場景，或提高閾值。

- **缺少箭頭按鈕：**
  - 等待擴充功能載入，或重新整理頁面。

- **角色資料無法使用：**
  - 等待聊天/群組完全載入。

---

## 📚 透過世界書排序 (STLO) 增強功能

為了實現進階的記憶組織和更深層的故事整合，我們強烈建議將 STMB 與 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Traditional%20Chinese.md) 一起使用。請參閱指南以了解最佳實踐、設定說明和提示！

---

## 📝 字元政策 (v4.5.1+)

- **標題中允許：** 所有可列印的 Unicode 字元，包括重音字母、emoji、CJK 字元與符號。
- **禁止：** 僅禁止 Unicode 控制字元（U+0000–U+001F、U+007F–U+009F）；系統會自動移除這些字元。

請參閱 [字元政策詳情](../charset.md) 以取得範例與遷移說明。

---

## 👨‍💻 開發者資訊

### 建置擴充功能

本擴充功能使用 Bun 進行建置。建置程序會壓縮並打包原始碼檔案。

```sh
# 建置擴充功能
bun run build
```

### Git Hooks

此專案包含一個 pre-commit hook，會自動建置擴充功能，並把建置產物加入你的 commit。這可確保建置檔案始終與原始碼同步。

**安裝 Git hook：**

```sh
bun run install-hooks
```

此 hook 會：
- 在每次 commit 前執行 `bun run build`
- 把建置產物加入 commit
- 如果建置失敗則中止 commit

---

*使用 VS Code/Cline 開發，經過廣泛測試和社群回饋，充滿愛心製作。* 🤖💕
