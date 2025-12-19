# 📕 Memory Books (SillyTavern 擴充功能)

SillyTavern 的次世代擴充功能，用於自動、結構化且可靠的記憶建立。在聊天中標記場景，使用 AI 生成基於 JSON 的摘要，並將它們作為「[向量化](https://www.google.com/search?q=%23vectorized)」條目儲存在您的世界書（Lorebook）中。支援群組聊天、進階設定檔管理以及穩固的 API/模型處理。

從這裡開始：

* ⚠️‼️請閱讀 [先決條件](https://www.google.com/search?q=%23-%E5%85%88%E6%B1%BA%E6%A2%9D%E4%BB%B6-prerequisites) 以獲取安裝注意事項（特別是如果您運行文字補全 API）
* ❓ [常見問題 (FAQ)](https://www.google.com/search?q=%23%E5%B8%B8%E8%A6%8B%E5%95%8F%E9%A1%8C-faq)
* 🛠️ [疑難排解](https://www.google.com/search?q=%23%E7%96%91%E9%9B%A3%E6%8E%92%E8%A7%A3-troubleshooting)

其他連結：

* 📘 [使用者指南 (英文)](https://www.google.com/search?q=USER_GUIDE.md)
* 📋 [版本歷史與更新日誌](changelog.md)
* 💡 [將 📕 Memory Books 與 📚 Lorebook Ordering 結合使用](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 透過 Lorebook Ordering (STLO) 增強功能

為了進行更進階的記憶組織和更深層的故事整合，我們強烈建議將 STMB 與 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) 一起使用。請參閱指南以了解最佳實踐、設定說明和提示！

> 注意：支援多種語言：請參閱 [`/locales`](https://www.google.com/search?q=locales) 資料夾查看列表。國際化/在地化的 Readme 和使用者指南可以在 [`/userguides`](https://www.google.com/search?q=userguides) 資料夾中找到。
> 世界書轉換器和 Side Prompt 模板庫位於 [`/resources`](https://www.google.com/search?q=resources) 資料夾中。

---

## 📋 先決條件 (Prerequisites)

* **SillyTavern:** 1.13.5+ (建議使用最新版本)
* ⚠️‼️**為所有使用者安裝 (INSTALL FOR ALL USERS)：**‼️⚠️ 因為 STMB 重複使用了許多 ST 基礎程式碼中的功能，請確保為**所有使用者**安裝此擴充功能，使其位置位於 `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`。否則，功能匯入將會失敗。
* **場景選擇:** 必須設定開始和結束標記 (開始 < 結束)。
* **聊天補全支援 (Chat Completion):** 完全支援 OpenAI, Claude, Anthropic, OpenRouter 或其他聊天補全 API。
* **文字補全支援 (Text Completion):** 當透過聊天補全 (OpenAI相容) API 端點連線時，支援文字補全 API (Kobold, TextGen 等)。我建議根據下方的 KoboldCpp 提示設定聊天補全 API 連線 (如果您使用的是 Ollama 或其他軟體，請依需求更改)。之後，設定一個 STMB 設定檔並使用自訂 (建議) 或全手動配置 (僅在自訂失敗或您有多個自訂連線時使用)。

### 使用 📕 ST Memory Books 的 KoboldCpp 提示

在 ST 中這樣設定 (在您讓 STMB 成功運作後，您可以切換回文字補全模式)

* Chat Completion API (聊天補全 API)
* Custom chat completion source (自訂聊天補全來源)
* `http://localhost:5001/v1` 端點 (您也可以使用 `127.0.0.1:5000/v1`)
* 在 "custom API key" 輸入任何內容 (無所謂，但 ST 需要填寫)
* model ID 必須是 `koboldcpp/modelname` (不要在模型名稱中放入 .gguf！)
* 下載一個聊天補全預設檔 (chat completion preset) 並匯入它 (任何一個都可以)，這樣您就**擁有**一個聊天補全預設檔。這可以避免出現 "not supported" (不支援) 的錯誤。

## 💡 建議的全域世界資訊/世界書觸發設定

* **Match Whole Words (全字匹配):** 保持未勾選 (false)
* **Scan Depth (掃描深度):** 越高越好 (我的設定為 8)
* **Max Recursion Steps (最大遞歸步數):** 2 (一般建議，非必須)
* **Context % (上下文 %):** 80% (基於 100,000 token 的上下文視窗) - 假設您沒有超大量的聊天記錄或機器人。

---

## 🚀 入門指南

### 1. **安裝與載入**

* 載入 SillyTavern 並選擇一個角色或群組聊天。
* 等待聊天訊息上出現箭頭按鈕 (► ◄) (可能需要長達 10 秒)。

### 2. **標記場景**

* 點擊場景第一條訊息上的 ►。
* 點擊最後一條訊息上的 ◄。

### 3. **建立記憶**

* 開啟擴充功能選單 (魔術棒 🪄) 並點擊 "Memory Books"，或使用 `/creatememory` 斜線指令。
* 如果出現提示，確認設定 (設定檔、上下文、API/模型)。
* 等待 AI 生成並自動寫入世界書條目。

---

## 🆕 斜線指令捷徑

* `/creatememory` 將使用現有的箭頭開始/結束標記來建立記憶。
* `/scenememory x-y` 將建立一個從訊息 x 開始到訊息 y 結束的記憶。
* `/nextmemory` 將建立包含自上次記憶以來所有訊息的記憶。

## 👥 群組聊天支援

* 所有功能皆適用於群組聊天。
* 場景標記、記憶建立和世界書整合都儲存在群組元數據 (metadata) 中。
* 無需特殊設定——只需選擇群組聊天並照常使用。

---

## 🧭 運作模式

### **自動模式 (預設)**

* **運作方式:** 自動使用綁定到目前聊天的世界書。
* **最適合:** 簡單快速。大多數使用者應從這裡開始。
* **使用方法:** 確保您的角色或群組聊天的 "Chat Lorebooks" 下拉選單中已選擇了一本世界書。

### **自動建立世界書模式** ⭐ *v4.2.0 新增*

* **運作方式:** 當不存在世界書時，使用您的自訂命名模板自動建立並綁定一本新世界書。
* **最適合:** 新使用者和快速設定。非常適合一鍵建立世界書。
* **使用方法:**
1. 在擴充功能設定中啟用 "Auto-create lorebook if none exists" (若無則自動建立世界書)。
2. 設定您的命名模板 (預設: "LTM - {{char}} - {{chat}}")。
3. 當您在沒有綁定世界書的情況下建立記憶時，系統會自動建立並綁定一本。


* **模板佔位符:** {{char}} (角色名稱), {{user}} (您的名稱), {{chat}} (聊天 ID)
* **智慧編號:** 如果存在重複名稱，會自動添加數字 (2, 3, 4...)。
* **注意:** 無法與手動世界書模式同時使用。

### **手動世界書模式**

* **運作方式:** 允許您為每個聊天的記憶選擇不同的世界書，忽略主要綁定的聊天世界書。
* **最適合:** 想要將記憶導向特定、獨立世界書的進階使用者。
* **使用方法:**
1. 在擴充功能設定中啟用 "Enable Manual Lorebook Mode" (啟用手動世界書模式)。
2. 第一次在聊天中建立記憶時，系統會提示您選擇世界書。
3. 該選擇會針對該特定聊天儲存，直到您清除它或切換回自動模式。


* **注意:** 無法與自動建立世界書模式同時使用。

---

## 📝 記憶生成

### **僅限 JSON 輸出**

所有提示詞和預設配置**必須**指示 AI 僅返回有效的 JSON，例如：

```json
{
  "title": "短場景標題",
  "content": "場景的詳細摘要...",
  "keywords": ["關鍵字1", "關鍵字2"]
}

```

**回應中不允許包含其他文字。**

### **內建預設配置**

1. **Summary:** 詳細的按節拍（beat-by-beat）摘要。
2. **Summarize:** 包含時間軸、節拍、互動、結果的 Markdown 標題。
3. **Synopsis:** 全面、結構化的 Markdown。
4. **Sum Up:** 帶有時間軸的簡潔節拍摘要。
5. **Minimal:** 1-2 句的摘要。

### **自訂提示詞**

* 建立您自己的提示詞，但**必須**如上所述返回有效的 JSON。

---

## 📚 世界書整合 (Lorebook Integration)

* **自動條目建立:** 新記憶將作為包含所有元數據的條目儲存。
* **基於標記的檢測:** 只有帶有 `stmemorybooks` 標記的條目才會被識別為記憶。
* **自動編號:** 連續的、補零的編號，支援多種格式 (`[000]`, `(000)`, `{000}`, `#000`)。
* **手動/自動排序:** 每個設定檔的插入順序設定。
* **編輯器重新整理:** 選擇性地在新增記憶後自動重新整理世界書編輯器。

> **現有記憶必須進行轉換！**
> 使用 [Lorebook Converter](https://www.google.com/search?q=/resources/lorebookconverter.html) 添加 `stmemorybooks` 標記和必要欄位。

---

### 🎡 Side Prompts (副提示詞)

Side Prompts 可以像追蹤器一樣使用，並會在您的記憶世界書中建立條目。

* **存取:** 從 Memory Books 設定中，點擊 “🎡 Side Prompt Manager” (副提示詞管理器)。
* **功能:**
* 查看所有 Side Prompts。
* 建立新的或複製提示詞以嘗試不同的提示詞風格。
* 編輯或刪除任何預設配置 (包括內建的)。
* 將預設配置匯出和匯入為 JSON 檔案以進行備份或分享。
* 手動執行它們，或隨記憶建立自動執行。


* **使用技巧:**
* 建立新提示詞時，您可以從內建提示詞複製以獲得最佳相容性。
* 額外的 Side Prompts 模板庫 [JSON 檔案](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - 只需匯入即可使用。



---

### 🧠 Regex 整合 (進階自訂)

* **完全控制文字處理**: Memory Books 現在整合了 SillyTavern 的 **Regex** (正規表達式) 擴充功能，允許您在兩個關鍵階段應用強大的文字轉換：
1. **提示詞生成 (Prompt Generation)**: 透過建立針對 **User Input** 位置的 regex 腳本，自動修改發送給 AI 的提示詞。
2. **回應解析 (Response Parsing)**: 透過針對 **AI Output** 位置，在儲存之前清理、重新格式化或標準化 AI 的原始回應。


* **多選支援**: 您現在可以多選 regex 腳本。所有啟用的腳本將在每個階段（提示詞生成和回應解析）依序應用，允許進階且靈活的轉換。
* **如何運作**: 整合是無縫的。只需在 Regex 擴充功能中建立並啟用（多選）您想要的腳本，Memory Books 將在記憶和 Side Prompt 建立過程中自動應用它們。

---

## 👤 設定檔管理 (Profile Management)

* **設定檔:** 每個設定檔包括 API、模型、溫度、提示詞/預設配置、標題格式和世界書設定。
* **匯入/匯出:** 以 JSON 格式分享設定檔。
* **建立設定檔:** 使用進階選項彈出視窗儲存新設定檔。
* **個別設定檔覆蓋:** 暫時切換用於記憶建立的 API/模型/溫度，然後恢復您的原始設定。

---

## ⚙️ 設定與配置

### **全域設定**

[Youtube 上的簡短概覽影片](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode (手動世界書模式):** 啟用以按聊天選擇世界書。
* **Auto-create lorebook if none exists (若無則自動建立世界書):** ⭐ *v4.2.0 新增* - 使用您的命名模板自動建立並綁定世界書。
* **Lorebook Name Template (世界書命名模板):** ⭐ *v4.2.0 新增* - 自訂自動建立的世界書名稱，使用 {{char}}, {{user}}, {{chat}} 佔位符。
* **Allow Scene Overlap (允許場景重疊):** 允許或阻止重疊的記憶範圍。
* **Always Use Default Profile (始終使用預設設定檔):** 跳過確認彈出視窗。
* **Show memory previews (顯示記憶預覽):** 啟用預覽彈出視窗，以便在加入世界書之前檢視和編輯記憶。
* **Show Notifications (顯示通知):** 切換 Toast 訊息。
* **Refresh Editor (重新整理編輯器):** 記憶建立後自動重新整理世界書編輯器。
* **Token Warning Threshold (Token 警告閾值):** 設定大型場景的警告級別 (預設: 30,000)。
* **Default Previous Memories (預設先前記憶):** 包含作為上下文的先前記憶數量 (0-7)。
* **Auto-create memory summaries (自動建立記憶摘要):** 啟用按間隔自動建立記憶。
* **Auto-Summary Interval (自動摘要間隔):** 自動建立記憶摘要的訊息數量間隔 (10-200, 預設: 100)。
* **Memory Title Format (記憶標題格式):** 選擇或自訂 (見下文)。

### **設定檔欄位**

* **Name (名稱):** 顯示名稱。
* **API/Provider (API/提供者):** openai, claude, custom 等。
* **Model (模型):** 模型名稱 (例如: gpt-4, claude-3-opus)。
* **Temperature (溫度):** 0.0–2.0。
* **Prompt or Preset (提示詞或預設配置):** 自訂或內建。
* **Title Format (標題格式):** 每個設定檔的模板。
* **Activation Mode (觸發模式):** Vectorized (向量化), Constant (常駐), Normal (一般)。
* **Position (位置):** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (及欄位名稱)。
* **Order Mode (排序模式):** Auto (自動)/manual (手動)。
* **Recursion (遞歸):** 阻止/延遲遞歸。

---

## 🏷️ 標題格式化

使用強大的模板系統自訂您的世界書條目標題。

* **佔位符:**
* `{{title}}` - AI 生成的標題 (例如 "命運的相遇")。
* `{{scene}}` - 訊息範圍 (例如 "Scene 15-23")。
* `{{char}}` - 角色名稱。
* `{{user}}` - 您的使用者名稱。
* `{{messages}}` - 場景中的訊息數量。
* `{{profile}}` - 用於生成的設定檔名稱。
* 各種格式的當前日期/時間佔位符 (例如 `August 13, 2025` 表示日期, `11:08 PM` 表示時間)。


* **自動編號:** 使用 `[0]`, `[00]`, `(0)`, `{0}`, `#0`，現在也支援包裹形式如 `#[000]`, `([000])`, `{[000]}` 進行連續、補零的編號。
* **自訂格式:** 您可以建立自己的格式。自 v4.5.1 起，標題中允許所有可列印的 Unicode 字元 (包括表情符號、中日韓文字、重音符號、符號等)；只有 Unicode 控制字元會被阻擋。

---

## 🧵 上下文記憶 (Context Memories)

* **包含最多 7 個先前的記憶**作為上下文，以獲得更好的連續性。
* **Token 估算**包含上下文記憶以確保準確性。

---

## 🎨 視覺回饋與無障礙功能

* **按鈕狀態:**
* Inactive (非活動), active (活動), valid selection (有效選擇), in-scene (場景中), processing (處理中)。


* **無障礙功能:**
* 鍵盤導航, 焦點指示器, ARIA 屬性, 減少動態效果, 行動裝置友善。



---

# 常見問題 (FAQ)

### 我在擴充功能選單中找不到 Memory Books！

設定位於擴充功能選單中 (輸入框左側的魔術棒 🪄)。尋找 "Memory Books"。

### 我需要執行向量 (vectors) 嗎？

世界資訊中的 🔗 條目在 ST 的介面中被命名為 "vectorized" (向量化)。這就是為什麼我使用 vectorized 這個詞。如果您不使用 vectors 擴充功能 (我也不用)，它會透過關鍵字運作。這一切都是自動化的，所以您不必考慮要使用什麼關鍵字。

### 我應該為記憶建立一個單獨的世界書，還是可以使用我已經用於其他事情的同一本世界書？

我建議您的記憶世界書應該是一本單獨的書。這使得組織記憶 (相對於其他條目) 更加容易。例如，將其加入群組聊天、在另一個聊天中使用它，或設定單獨的世界書預算 (使用 STLO)。

### 如果 Memory Books 是唯一的世界書，我應該使用 'Delay until recursion' (延遲直到遞歸) 嗎？

不。如果沒有其他世界資訊或世界書，選擇 'Delay until recursion' 可能會阻止第一個循環觸發，導致沒有任何內容被啟用。如果 Memory Books 是唯一的世界書，請停用 'Delay until recursion'，或確保至少配置了一個額外的世界資訊/世界書。

---

# 疑難排解 (Troubleshooting)

* **沒有可用或選定的世界書:**
* 在手動模式下，提示時選擇一本世界書。
* 在自動模式下，將一本世界書綁定到您的聊天。
* 或者啟用 "Auto-create lorebook if none exists" (若無則自動建立世界書) 以進行自動建立。


* **未選擇場景:**
* 標記開始 (►) 和結束 (◄) 點。


* **場景與現有記憶重疊:**
* 選擇不同的範圍，或在設定中啟用 "Allow scene overlap" (允許場景重疊)。


* **AI 無法生成有效記憶:**
* 使用支援 JSON 輸出的模型。
* 檢查您的提示詞和模型設定。


* **超過 Token 警告閾值:**
* 使用較小的場景，或增加閾值。


* **缺少箭頭按鈕:**
* 等待擴充功能載入，或重新整理。


* **角色資料不可用:**
* 等待聊天/群組完全載入。



---

## 📝 字元策略 (v4.5.1+)

* **標題中允許:** 允許所有可列印的 Unicode 字元，包括重音字母、表情符號、中日韓文字 (CJK) 和符號。
* **阻擋:** 只有 Unicode 控制字元 (U+0000–U+001F, U+007F–U+009F) 會被阻擋；這些會被自動移除。

## 請參閱 [字元策略詳情](https://www.google.com/search?q=charset.md) 以獲取範例和遷移說明。

*用愛開發，使用 VS Code/Cline，經過廣泛測試和社群回饋。* 🤖💕