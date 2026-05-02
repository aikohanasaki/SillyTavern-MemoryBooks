# 🎡 Side Prompts

Side Prompt 是 STMB 里额外运行的聊天维护提示。它们可以分析、追踪、总结、清理或更新辅助笔记，不必让普通角色回复承担所有整理工作。

当聊天需要持续更新的追踪器、关系报告、剧情列表、发明日志、NPC 状态表、时间线或类似辅助文档时，就可以使用它们。角色可以继续角色扮演。Side Prompt 负责处理文书工作。❤️

## 目录

- [什么是 Side Prompt](#什么是-side-prompt)
- [什么时候使用](#什么时候使用)
- [快速设置步骤](#快速设置步骤)
- [运行方式](#运行方式)
- [手动运行](#手动运行)
- [记忆后自动运行](#记忆后自动运行)
- [Side Prompt Set](#side-prompt-set)
- [宏](#宏)
- [消息范围](#消息范围)
- [编写好用的 Side Prompt](#编写好用的-side-prompt)
- [示例](#示例)
- [故障排查](#故障排查)
- [要点](#要点)

---

## 什么是 Side Prompt

Side Prompt 是一个命名提示，会独立于普通角色回复运行。

它可以生成或更新：

- 剧情追踪器
- 关系追踪器
- NPC 或阵营笔记
- 物品栏/资源列表
- 时间线
- 谜团/线索板
- 发明或项目追踪器
- 连续性报告
- 清理笔记
- 类似 lorebook 的辅助条目

Side Prompt 和普通记忆不同。记忆通常按顺序保存场景摘要。Side Prompt 通常维护一个持续更新的状态文档，并对它进行更新或覆盖。

它们也**不必**返回 JSON。除非你的具体提示或保存目标需要更严格的格式，否则纯文本和 Markdown 都可以。

---

## 什么时候使用

Side Prompt 适合结构化的辅助整理工作。

适合的用途：

- **剧情点：**活跃线索、已解决线索、未收束问题
- **关系：**信任、紧张、吸引、边界、目标
- **NPC：**每个 NPC 知道什么、想要什么、最近做了什么、接下来需要什么
- **时间线：**日期、旅行、伤势、截止日期、倒计时
- **世界状态：**地点、物品、阵营、资源的变化
- **谜团：**线索、嫌疑人、矛盾点、未回答的问题
- **项目：**发明、研究、阻碍、范围漂移、下一步
- **连续性：**可能出现幻觉的风险或缺失的上下文

不适合的用途：

- 必须出现在下一条角色回复里的内容
- 模糊的“让故事变好”提示
- 每次运行都会生成长篇文章的大型分析提示
- 没有独立任务、只是重复记忆摘要的提示

Side Prompt 不是魔法。模糊的 Side Prompt 只会把模糊内容整理得更整齐。

---

## 快速设置步骤

需要一步一步点击的版本？请查看[启用 Side Prompt 的 Scribe 演示](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)。

简短路径是：打开 **Extensions**，打开 **Memory Books**，点击 **Side Prompts**，选择你想要的提示，启用它，可选地打开 **Run automatically after memory**，然后点击 **Save** 和 **Close**。

---

## 运行方式

普通的 Side Prompt 运行遵循同一套基本流程：

1. STMB 选择要检查的消息。
2. 准备 Side Prompt。
3. 填入所需宏。
4. 模型生成 Side Prompt 输出。
5. STMB 检查输出。
6. 根据 Side Prompt 设置，结果会被预览、保存、更新或跳过。

手动 Side Prompt、记忆后 Side Prompt 和 Side Prompt Set 中的行都应该像同一套系统。它们在预览、批处理、空白回复检查、保存、停止处理和通知方面共享相同的一般执行行为。

---

## 手动运行

使用 `/sideprompt` 手动运行一个 Side Prompt。

基本形式：

```txt
/sideprompt "Prompt Name"
```

带消息范围：

```txt
/sideprompt "Prompt Name" 10-20
```

带运行时宏：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

如果提示名称包含空格，请使用引号。

手动运行最适合一次性检查、定向更新，以及需要自定义宏值的提示。

---

## 记忆后自动运行

某些 Side Prompt 可以在创建记忆后自动运行。

如果追踪器应该随着聊天发展保持最新，这会很有用。例如，关系追踪器或剧情追踪器可以在每次记忆后更新。

记忆后运行有两种模式：

- **Use individually-enabled side prompts** — 旧行为；任何启用了 **Run automatically after memory** 的 Side Prompt 都可以运行。
- **Use a named Side Prompt Set** — 改为运行选定的集合。

选定的 Side Prompt Set 会替代单独启用的记忆后 Side Prompt。它**不会**叠加运行。这样可以避免用户忘记旧复选框而导致重复运行。

---

## Side Prompt Set

Side Prompt Set 会把多个 Side Prompt 组合成一个有顺序的工作流。

Set 是一个有顺序的运行列表，不只是文件夹。同一个 Side Prompt 可以带着不同宏值出现多次。

示例 Set：

1. Relationship Tracker，`{{npc name}} = Alice`
2. Relationship Tracker，`{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

这允许同一个提示模板为不同 NPC、阵营、地点或项目维护独立条目。

### 管理 Set

打开 **🎡 Trackers & Side Prompts** 来创建、编辑、复制、删除或重新排序 Set。

每一行可以包含：

- 一个 Side Prompt
- 可选的行标签
- 已保存的宏值
- 复制/删除控件
- 上移/下移控件

行会从上到下运行。把基础追踪器放在前面，把清理/报告类提示放在后面。

### 手动运行 Set

用已保存的值运行 Set：

```txt
/sideprompt-set "Set Name"
```

带范围：

```txt
/sideprompt-set "Set Name" 10-20
```

用宏值运行可复用 Set：

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

当 Set 里有仍然需要值的可复用 token 时，请使用 `/sideprompt-macroset`。

### 缺失的 Set 或行

Side Prompt Set 会故意保持严格：

- 如果没有选择 Set，就使用单独启用的记忆后行为。
- 如果选择了 Set，单独启用的记忆后提示会被忽略。
- 如果选定的 Set 已被删除，则不会运行任何内容，STMB 会发出警告。
- 如果某一行指向已删除的提示，该行会被跳过，STMB 会发出警告。
- 如果某一行仍需要宏值，该行会被跳过，STMB 会发出警告。

静默回退更糟。如果选定的工作流坏了，你应该知道。

---

## 宏

Side Prompt 可以使用普通 SillyTavern 宏，例如 `{{user}}` 和 `{{char}}`。

它们也可以使用运行时宏，也就是在 Side Prompt 运行时填入的占位符。

运行时宏示例：

```txt
{{npc name}}
```

手动运行：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

已保存的 Set 值：

```txt
{{npc name}} = Alice
```

可复用的 Set 级值：

```txt
{{npc name}} = {{npc_1}}
```

然后运行：

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### 宏提示

使用普通、乏味的名称：

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

避免这类名称：

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

空格在 UI 中更易读。下划线在斜杠命令里通常不那么烦人。

带自定义运行时宏的 Side Prompt 不应该被单独自动化，除非所需值已经保存在某处，例如 Side Prompt Set 的某一行里。自动运行无法停下来问你 `{{npc name}}` 应该是谁。

---

## 消息范围

Side Prompt 可以针对指定消息范围运行。

```txt
/sideprompt "Plot Points" 50-80
```

如果你提供范围，STMB 就使用该范围。

如果你没有提供范围，STMB 就使用正常的“自上次 Side Prompt 后”行为，并套用现有的上限/检查点逻辑。

日常追踪时，“自上次以来”的行为更省事。调试或定向清理时，显式范围更清楚。

Side Prompt 的范围编译应遵循与记忆相同的隐藏消息偏好，包括全局的记忆前取消隐藏设置。

---

## 编写好用的 Side Prompt

好的 Side Prompt 有明确任务。坏的 Side Prompt 只有感觉。

请明确说明：

- 它应该检查什么
- 它应该更新什么
- 它应该忽略什么
- 它应该输出什么格式
- 输出应该有多长
- 它应该替换、修订还是追加

### 有意限制输出长度

追踪器如果没有限制，就会膨胀。

弱：

```txt
Update the relationship tracker.
```

更好：

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

有用的护栏：

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### 使用稳定标题

稳定标题能让重复更新更干净。

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

### 不要什么都要

要求记录每个细节的 Side Prompt 通常真的会产出每个细节。

只选择重要内容。剧情追踪器通常需要未解决钩子、发生了什么变化、谁知道、需要跟进什么。它不需要场景里的每个表情。

### 让宏用途明显

好名称：

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

不太有用的名称：

```txt
Tracker 3
Update thing
Misc relationship prompt
```

用户不应该必须打开完整提示正文，才明白它为什么在询问某个值。

---

## 示例

### 剧情点追踪器

当聊天里有多条活跃故事线时使用。

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

建议形状：

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

### 带宏的关系追踪器

提示需要：

```txt
{{npc name}}
```

手动运行：

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Set 行：

| 行 | Side Prompt | 已保存的宏 |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

这样就不需要为每个 NPC 单独创建提示定义。

### 发明或项目追踪器

当用户在一段时间内持续发明、研究、建造或改变某个东西时使用。

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

这通常比保存十条“这个项目存在”的记忆更干净。

### 可复用的角色名单处理

使用 Set 级运行时 token 创建一个 Set：

```txt
{{npc_1}}
{{npc_2}}
```

运行它：

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

稍后复用：

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

同一个 Set，不同角色。💡

---

## 故障排查

### 我的 Side Prompt 没有在记忆后运行。

检查：

- 记忆是否真的运行了？
- Side Prompt 是否已启用记忆后运行？
- 该聊天是否使用 **Use individually-enabled side prompts**？
- 该聊天是否改用了 Side Prompt Set？
- 该提示是否需要尚未提供的宏值？
- 该提示是否被删除、重命名或移动？

如果聊天使用 Side Prompt Set，该聊天中单独启用的记忆后复选框会被忽略。

### 我的 Side Prompt Set 没有运行。

检查：

- 这个聊天是否选择了该 Set？
- 该 Set 是否仍然存在？
- 所有行是否都指向现有 Side Prompt？
- 所有必需宏是否都有已保存或已提供的值？

自动运行无法询问缺失值。请把宏值保存在 Set 里，或用 `/sideprompt-macroset` 手动运行。

### 某一行被跳过了。

可能原因：

- 引用的 Side Prompt 被删除了
- 引用的 Side Prompt 被重命名了
- 该行有未解析的宏
- 模型返回了空白或无效回复

STMB 应该发出警告，而不是假装一切正常。

### 输出太长。

添加硬性限制：

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

模型不会自然知道追踪器什么时候已经变得臃肿到没用。直接告诉它。

### 它运行了两次。

检查：

- 手动运行加上自动运行
- Set 里有重复行
- 同一个 Side Prompt 有重复副本
- 多个聊天或标签页在接近的时间触发工作

选定的 Side Prompt Set 应该替代单独启用的记忆后提示，这能避免一种常见的重复运行问题。

### 分析了错误的消息。

使用显式范围：

```txt
/sideprompt "Plot Points" 50-80
```

“自上次以来”的行为很方便。显式范围更适合调试。

### 追踪器一直保留过时信息。

告诉 Side Prompt 删除过时信息。

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

追踪器不会自己意外地保持干净。

---

## 要点

### 给用户

当你想要结构化地维护长聊天时，请使用 Side Prompt。

手动运行最适合一次性分析。记忆后运行或 Side Prompt Set 最适合需要保持最新的追踪器。

### 给 Botmaker

把 Side Prompt 做成维护工具，而不是角色扮演散文。

使用稳定标题、严格输出规则和清晰的更新行为。当一个提示应该适用于多个 NPC、阵营、地点或项目时，请使用宏。

### 给管理员

Side Prompt 会增加更多生成工作。

这意味着它们最好可预测、可检查，并且以最好的方式保持无聊。Set 有帮助，因为它们能让预期工作流变得明确，而不是留在一堆复选框里乱成一团。
