# 🎡 Side Prompts

Side Prompts 是 STMB 用於聊天維護的額外提示詞執行。它們可以分析、追蹤、摘要、整理，或更新輔助筆記，不必把這些工作全部塞進一般角色回覆裡。

當聊天需要持續維護的追蹤器、關係報告、劇情清單、發明紀錄、NPC 狀態表、時間線，或類似的輔助文件時，就可以使用它們。角色可以繼續角色扮演。Side Prompt 負責文書工作。❤️

## 目錄

- [Side Prompts 是什麼](#side-prompts-是什麼)
- [何時使用](#何時使用)
- [快速設定流程](#快速設定流程)
- [執行流程](#執行流程)
- [手動執行](#手動執行)
- [記憶後自動執行](#記憶後自動執行)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [訊息範圍](#訊息範圍)
- [撰寫好的 Side Prompt](#撰寫好的-side-prompt)
- [範例](#範例)
- [疑難排解](#疑難排解)
- [重點整理](#重點整理)

---

## Side Prompts 是什麼

Side Prompt 是一個具名提示詞，會與一般角色回覆分開執行。

它可以產生或更新：

- 劇情追蹤器
- 關係追蹤器
- NPC 或派系筆記
- 物品欄／資源清單
- 時間線
- 謎團／線索板
- 發明或專案追蹤器
- 連貫性報告
- 整理筆記
- 類似 lorebook 的輔助條目

Side Prompts 與一般記憶不同。記憶通常會依序儲存場景摘要。Side Prompts 通常會維護一份持續更新或覆寫的狀態文件。

它們也**不必**回傳 JSON。除非你的特定提示詞或儲存目標要求更嚴格的格式，否則純文字和 Markdown 都可以。

---

## 何時使用

Side Prompts 適合用於結構化的輔助工作。

適合用途：

- **劇情點：** 進行中的線索、已解決的線索、未收束的伏筆
- **關係：** 信任、緊張、吸引、界線、目標
- **NPC：** 每個 NPC 知道什麼、想要什麼、最近做了什麼，或接下來需要什麼
- **時間線：** 日期、旅行、傷勢、期限、倒數
- **世界狀態：** 已改變的地點、物件、派系、資源
- **謎團：** 線索、嫌疑人、矛盾、未解問題
- **專案：** 發明、研究、阻礙、範圍漂移、下一步
- **連貫性：** 可能的幻覺風險或缺失脈絡

不適合用途：

- 必須出現在下一則角色回覆裡的任何內容
- 模糊的「讓故事變好」提示詞
- 每次執行都產生長篇文章的巨大分析提示詞
- 沒有獨立任務、只是重複記憶摘要的提示詞

Side Prompts 不是魔法。模糊的 Side Prompt 只會得到有條理的模糊內容。

---

## 快速設定流程

需要逐步點擊版本？請使用 [啟用 Side Prompts 的 Scribe 教學](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)。

簡短流程是：開啟 **Extensions**，開啟 **Memory Books**，點選 **Side Prompts**，選擇你要的提示詞，啟用它，可選擇開啟 **Run automatically after memory**，然後按 **Save** 和 **Close**。

---

## 執行流程

一般的 Side Prompt 執行會遵循同樣的基本流程：

1. STMB 選擇要檢查的訊息。
2. Side Prompt 會被準備好。
3. 需要的 macros 會被填入。
4. 模型產生 Side Prompt 輸出。
5. STMB 檢查輸出。
6. 依照 Side Prompt 設定，結果會被預覽、儲存、更新，或略過。

手動 Side Prompts、記憶後 Side Prompts，以及 Side Prompt Set 的列項，應該感覺像同一套系統。它們在預覽、批次處理、空白回覆檢查、儲存、停止處理，以及通知方面，會共享同樣的一般執行行為。

---

## 手動執行

使用 `/sideprompt` 手動執行一個 Side Prompt。

基本形式：

```txt
/sideprompt "Prompt Name"
```

搭配訊息範圍：

```txt
/sideprompt "Prompt Name" 10-20
```

搭配 runtime macro：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

名稱有空格的提示詞請使用引號。

手動執行最適合一次性檢查、目標明確的更新，以及需要自訂 macro 值的提示詞。

---

## 記憶後自動執行

部分 Side Prompts 可以在建立記憶後自動執行。

當追蹤器需要隨著聊天進展保持更新時，這很有用。例如，關係追蹤器或劇情追蹤器可以在每次記憶後更新。

記憶後有兩種模式：

- **Use individually-enabled side prompts** — 舊行為；任何啟用 **Run automatically after memory** 的 Side Prompt 都可以執行。
- **Use a named Side Prompt Set** — 改為執行所選的 set。

已選取的 Side Prompt Set 會取代個別啟用的記憶後 Side Prompts。它**不會**加在它們後面。這可以避免使用者忘記關掉舊核取方塊而造成重複執行。

---

## Side Prompt Sets

Side Prompt Sets 會把多個 Side Prompts 組成一個有順序的工作流程。

Set 是一份有順序的執行清單，不只是資料夾。同一個 Side Prompt 可以用不同的 macro 值出現多次。

範例 set：

1. Relationship Tracker，`{{npc name}} = Alice`
2. Relationship Tracker，`{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

這讓同一個提示詞範本可以為不同 NPC、派系、地點，或專案維護不同條目。

### 管理 Sets

開啟 **🎡 Trackers & Side Prompts**，即可建立、編輯、複製、刪除，或重新排序 sets。

每一列可以包含：

- 一個 Side Prompt
- 選填的列標籤
- 已儲存的 macro 值
- 複製／刪除控制項
- 上移／下移控制項

列會由上到下執行。把基礎追蹤器放前面，整理或報告用的提示詞放後面。

### 手動執行 Set

使用已儲存的值執行 set：

```txt
/sideprompt-set "Set Name"
```

搭配範圍：

```txt
/sideprompt-set "Set Name" 10-20
```

用 macro 值執行可重複使用的 set：

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

當 set 裡有仍需要填值的可重複使用 token 時，請使用 `/sideprompt-macroset`。

### 缺失的 Sets 或列項

Side Prompt Sets 會刻意嚴格處理：

- 如果沒有選取 set，就會使用個別啟用的記憶後行為。
- 如果已選取 set，個別啟用的記憶後提示詞會被忽略。
- 如果所選 set 已被刪除，什麼都不會執行，而且 STMB 會警告你。
- 如果某一列指向已刪除的提示詞，該列會被略過，而且 STMB 會警告你。
- 如果某一列仍需要 macro 值，該列會被略過，而且 STMB 會警告你。

靜默 fallback 會更糟。如果選取的工作流程壞了，你應該知道。

---

## Macros

Side Prompts 可以使用一般 SillyTavern macros，例如 `{{user}}` 和 `{{char}}`。

它們也可以使用 runtime macros，也就是在 Side Prompt 執行時才填入的佔位符。

Runtime macro 範例：

```txt
{{npc name}}
```

手動執行：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

已儲存的 set 值：

```txt
{{npc name}} = Alice
```

可重複使用的 set 層級值：

```txt
{{npc name}} = {{npc_1}}
```

然後執行：

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Macro 提示

使用無聊但清楚的名稱：

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

避免這類名稱：

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

空格在 UI 裡可讀性較高。底線通常在 slash commands 裡比較不麻煩。

具有自訂 runtime macros 的 Side Prompt 不應該個別自動化，除非所需的值已儲存在某處，例如 Side Prompt Set 的列項中。自動執行不能停下來問你 `{{npc name}}` 應該是誰。

---

## 訊息範圍

Side Prompts 可以針對特定訊息範圍執行。

```txt
/sideprompt "Plot Points" 50-80
```

如果你提供範圍，STMB 會使用該範圍。

如果你沒有提供範圍，STMB 會使用一般的自上次 Side Prompt 後行為，並套用既有的上限／檢查點邏輯。

例行追蹤時，自上次行為比較輕鬆。除錯或目標明確的整理時，明確範圍比較清楚。

Side Prompt 的範圍編譯應遵循記憶使用的同一套隱藏訊息偏好，包括全域的記憶前取消隱藏設定。

---

## 撰寫好的 Side Prompt

好的 Side Prompt 有明確任務。差的 Side Prompt 只有氛圍。

請說清楚：

- 它應該檢查什麼
- 它應該更新什麼
- 它應該忽略什麼
- 它應該輸出什麼格式
- 輸出應該多長
- 它應該取代、修訂，還是附加內容

### 刻意保持輸出簡短

追蹤器如果沒有被限制，會自然膨脹。

弱：

```txt
Update the relationship tracker.
```

較好：

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

有用的限制：

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### 使用穩定標題

穩定標題能讓反覆更新更乾淨。

好：

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

差：

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### 不要要求所有東西

要求記下每個細節的 Side Prompt，通常真的會產出每個細節。

選擇重要的東西。劇情追蹤器通常需要未解伏筆、改變了什麼、誰知道，以及需要跟進什麼。它不需要場景裡每一個表情。

### 讓 Macro 用途明顯

好的名稱：

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

較沒用的名稱：

```txt
Tracker 3
Update thing
Misc relationship prompt
```

使用者不應該需要打開完整提示詞內容，才知道它為什麼要求某個值。

---

## 範例

### Plot Points Tracker

當聊天有多條進行中的故事線時使用。

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

建議格式：

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### 使用 Macro 的 Relationship Tracker

提示詞需要：

```txt
{{npc name}}
```

手動執行：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Set 列項：

| 列 | Side Prompt | 已儲存的 Macro |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

這樣就不必為每個 NPC 建立不同的提示詞定義。

### 發明或專案追蹤器

當使用者持續發明、研究、建造，或改變某件事時使用。

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

這通常比儲存十則都在說同一個專案存在的記憶更乾淨。

### 可重複使用的 Cast Pass

建立一個使用 set 層級 runtime tokens 的 set：

```txt
{{npc_1}}
{{npc_2}}
```

執行它：

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

之後重複使用：

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

同一個 set。不同的 cast。💡

---

## 疑難排解

### 我的 Side Prompt 沒有在記憶後執行。

檢查：

- 記憶真的有執行嗎？
- 該 Side Prompt 是否已啟用記憶後執行？
- 這個聊天是否使用 **Use individually-enabled side prompts**？
- 這個聊天是否改用 Side Prompt Set？
- 提示詞是否需要尚未提供的 macro 值？
- 提示詞是否被刪除、重新命名，或移動？

如果聊天使用 Side Prompt Set，該聊天中個別啟用的記憶後核取方塊會被忽略。

### 我的 Side Prompt Set 沒有執行。

檢查：

- 這個聊天是否已選取該 set？
- 該 set 是否仍然存在？
- 所有列項是否都指向存在的 Side Prompts？
- 所有必要 macros 是否都有已儲存或已提供的值？

自動執行不能要求缺失的值。請把 macro 值儲存在 set 裡，或用 `/sideprompt-macroset` 手動執行。

### 某一列被略過了。

可能原因：

- 參照的 Side Prompt 已被刪除
- 參照的 Side Prompt 已被重新命名
- 該列有未解析的 macros
- 模型回傳空白或無效回覆

STMB 應該警告，而不是假裝一切正常。

### 輸出太長。

加入硬性限制：

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

模型不會自然知道追蹤器何時已經大到失去用處。你必須明說。

### 它執行了兩次。

檢查：

- 手動執行加上自動執行
- set 內有重複列項
- 同一個 Side Prompt 有重複副本
- 多個聊天或分頁在接近時間觸發工作

已選取的 Side Prompt Set 應該取代個別啟用的記憶後提示詞，這可以防止一種常見的重複執行問題。

### 分析了錯誤的訊息。

使用明確範圍：

```txt
/sideprompt "Plot Points" 50-80
```

自上次行為很方便。明確範圍更適合除錯。

### 追蹤器一直保留過時資訊。

告訴 Side Prompt 移除過時資訊。

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

追蹤器不會自動保持乾淨。

---

## 重點整理

### 給使用者

當你想要結構化協助來維護長聊天時，請使用 Side Prompts。

手動執行最適合一次性分析。記憶後執行或 Side Prompt Sets 最適合需要持續更新的追蹤器。

### 給 Botmakers

把 Side Prompts 建成維護工具，而不是角色扮演散文。

使用穩定標題、嚴格輸出規則，以及明確的更新行為。當同一個提示詞需要用於多個 NPC、派系、地點，或專案時，請使用 macros。

### 給 Admins

Side Prompts 會增加更多生成工作。

這表示它們應該是可預測、可檢查，而且最好無聊得很清楚。Sets 會有幫助，因為它們能明確呈現預期工作流程，而不是把一切留給一鍋核取方塊湯。
