# 📕 ST Memory Books - 您的 AI 聊天記憶助手

**將您無止盡的聊天對話轉化為有條理、可搜尋的記憶！**

需要機器人記住事情，但聊天記錄太長導致上下文超出限制？想要自動追蹤重要的劇情點，而不需要手動做筆記？ST Memory Books 正是為此而生——它會監控您的聊天內容並建立智慧摘要，讓您再也不會迷失在故事中。

(想了解幕後的技術細節？也許您需要的是 [STMB 運作原理](howSTMBworks-zh-tw.md)。)

---

## 📑 目錄

- [快速開始](#-快速開始-5-分鐘建立您的第一個記憶)
- [ST Memory Books 實際上有什麼功能](#-st-memory-books-實際上有什麼功能)
- [選擇您的風格](#-選擇您的風格)
- [節省 token](#-節省-token-隱藏--顯示)
- [總結整合](#-總結整合)
- [Side Prompts 與範本](#-side-prompts-與範本)
- [Regex](#-regex)
- [真正重要的設定](#-真正重要的設定)
- [疑難排解](#-疑難排解)
- [更多資訊](#-更多資訊)

---

## 🚀 快速開始（5 分鐘建立您的第一個記憶！）

1. 在擴充功能選單裡開啟 `Memory Books`。
2. 開啟 `Auto-create memory summaries`。
3. 將 `Auto-Summary Interval` 設為大約 `20-30`。
4. 一開始讓 `Auto-Summary Buffer` 保持很低，例如 `0-2`。
5. 先手動建立一筆記憶，作為啟動基準。

---

## 💡 ST Memory Books 實際上有什麼功能

### 自動摘要

STMB 會在背景監控聊天，並按間隔自動建立記憶。

### 手動建立記憶

您可以用箭頭 (► ◄) 標記重要場景，再只為那一段建立記憶。

### Side Prompts

Side Prompts 就像追蹤器，可用來追蹤關係、任務、情緒或世界狀態。

---

## 🎯 選擇您的風格

### 設定後即忘

1. 開啟 `Auto-create memory summaries`。
2. 調整 `Auto-Summary Interval`。
3. 視需要加入一點 `Auto-Summary Buffer`。

### 手動控制

1. 用箭頭標記場景開始與結束。
2. 打開 Memory Books。
3. 點擊 `Create Memory`。

### Slash 指令

* `/creatememory` - 從標記場景建立記憶
* `/scenememory X-Y` - 根據訊息範圍建立記憶
* `/nextmemory` - 從上次記憶之後開始
* `/sideprompt "Name" {{macro}}="value" [X-Y]` - 執行 Side Prompt
* `/sideprompt-on "Name"` 或 `/sideprompt-off "Name"` - 手動開啟或關閉 Side Prompt
* `/stmb-set-highest <N|none>` - 調整自動摘要基準

---

## 🙈 節省 token：隱藏 / 顯示

隱藏訊息不會刪除它們，只是它們不再直接送給 AI。

### 什麼時候有用

* 聊天記錄已經很長
* 這些訊息已經做成記憶
* 您想讓聊天更乾淨

### 自動隱藏

* `Do not auto-hide` - 不自動隱藏
* `Auto-hide all messages up to the last memory` - 隱藏已被記憶覆蓋的內容
* `Auto-hide only messages in the last memory` - 只隱藏最後一段處理過的內容

### 生成前重新顯示

`Unhide hidden messages for memory generation` 會在生成前暫時執行 `/unhide X-Y`。

### 建議設定

* `Auto-hide only messages in the last memory`
* 保留 `2` 則訊息可見
* 開啟 `Unhide hidden messages for memory generation`

---

## 🌈 總結整合

總結整合可以把較舊的 STMB 記憶壓縮成更高層級的摘要，讓長篇故事更好管理。

### 它是什麼？

STMB 可以把現有記憶或總結整合成更精簡的記錄。第一層是 `Arc`，後面還有 `Chapter`、`Book`、`Legend`、`Series` 和 `Epic`。

### 什麼時候用？

* 記憶列表太長
* 舊記憶不再需要逐場景細節
* 想減少 token 又不想失去連貫性

### 會自動執行嗎？

不會。整合仍然需要確認。

* 可以手動打開 `Consolidate Memories`
* STMB 也可以在某個層級達到最小值時提示您
* 選擇 `Yes` 只會打開視窗，不會靜默執行

### 什麼會被整合？

* 普通 STMB 記憶
* 更高層級的總結
* Side Prompts 不會併入 Arc/Chapter

### 如何使用？

1. 點擊 `Consolidate Memories`
2. 選擇目標層級
3. 選擇來源條目
4. 決定是否停用來源
5. 點擊 `Run`

如果 AI 回傳不好的結果，可以先檢查再重新儲存。

---

## 🎨 Side Prompts 與範本

Side Prompts 是背景追蹤器，會在 lorebook 中建立獨立條目並與記憶並行運行。

### 運作方式

* `Prompt`、`Response Format` 和 `Title` 支援標準 ST 巨集
* 自訂 `{{...}}` 巨集會變成手動執行所需的輸入
* Side Prompts 可以回傳純文字，不一定要 JSON
* Side Prompts 會更新同一筆條目，而不是每次都新建一條記錄

### 重點

如果範本含有自訂 runtime 巨集，它就會變成只能手動執行。

### `/sideprompt`

* `X-Y` 是可選的
* 如果不提供範圍，STMB 會使用該 Side Prompt 上次更新之後的訊息

---

## 🧠 Regex

STMB 可以在送給 AI 之前，以及儲存結果之前，執行您選定的 Regex 腳本。

### 用途

* 清理重複語句
* 統一名稱或術語
* 在 STMB 解析前調整文字

### 怎麼用

1. 在 SillyTavern 的 `Regex` 擴充功能裡建立腳本。
2. 在 STMB 裡開啟 `Use regex (advanced)`。
3. 點擊 `📐 Configure regex…`。
4. 選擇要在送出前與儲存前執行的腳本。

### 重要

* STMB 的 Regex 選擇是由 STMB 自己控制的
* 即使腳本在 Regex 裡被關閉，只要在 STMB 裡選中，它仍可能執行
* STMB 支援入站與出站處理的多選

---

## ⚙️ 真正重要的設定

這不是完整設定表。完整列表請看 [readme.md](readme.md)。

* `Auto-create memory summaries` - 開啟自動建立記憶
* `Auto-Summary Interval` 和 `Auto-Summary Buffer` - 控制自動建立時機
* `Show memory previews` - 允許在儲存前檢查或修改 AI 輸出
* `Prompt for consolidation when a tier is ready` 和 `Auto-Consolidation Tiers` - 提示您進行整合，而不是靜默執行
* `Manual Lorebook Mode` 和 `Auto-create lorebook if none exists` - 控制記憶儲存位置
* `Use regex (advanced)` - 打開由 STMB 管理的 Regex 選擇
* `Current SillyTavern Settings` - 直接使用目前 ST 連線

---

## 🔧 疑難排解

這不是完整故障排查表。完整列表請看 [readme.md](readme.md)。

* 確認 STMB 已啟用，且 `Memory Books` 出現在擴充功能選單裡
* 如果自動總結沒有觸發，先確認您已經手動建立過一筆記憶，並檢查 interval/buffer
* 如果記憶無法儲存，確認已綁定 lorebook，或啟用 `Auto-create lorebook if none exists`
* 如果 Regex 行為不對，檢查 `📐 Configure regex…`
* 如果整合沒有出現，檢查 `Prompt for consolidation when a tier is ready` 和 `Auto-Consolidation Tiers`

---

## 🔗 更多資訊

* [readme.md](readme.md)
* [changelog.md](changelog.md)
* [STMB 運作原理](howSTMBworks-zh-tw.md)
* STLO guide: [STMB and STLO - English](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)
