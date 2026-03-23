# 📕 ST Memory Books - 你的 AI 聊天记忆助手

**将无尽的聊天对话转化为有序、可搜索的记忆！**

需要机器人记住事情，但聊天记录太长超出了上下文限制？想要自动追踪重要的剧情点，而不需要手动做笔记？ST Memory Books 正是为此而生——它会监控你的聊天记录并创建智能总结，让你不再迷失在故事中。

（想了解幕后技术细节？你可能需要阅读 [STMB 工作原理](howSTMBworks-zh-cn.md)。）

---

## 📑 目录

- [快速入门](#-快速入门5分钟创建你的第一个记忆)
- [ST Memory Books 到底能做什么](#-st-memory-books-到底能做什么)
- [选择你的风格](#-选择你的风格)
- [节省 token](#-节省-token-隐藏--显示)
- [总结整合](#-总结整合)
- [Side Prompts 与模板](#-side-prompts-与模板)
- [Regex](#-regex)
- [重要设置](#-重要设置)
- [疑难解答](#-疑难解答)
- [更多信息](#-更多信息)

---

## 🚀 快速入门（5分钟创建你的第一个记忆！）

1. 打开扩展菜单里的 `Memory Books`。
2. 开启 `Auto-create memory summaries`。
3. 将 `Auto-Summary Interval` 设为大约 `20-30`。
4. 一开始让 `Auto-Summary Buffer` 保持很低，比如 `0-2`。
5. 先手动创建一条记忆，作为“primed” 基础。

---

## 💡 ST Memory Books 到底能做什么

### 自动总结

STMB 会在后台监控聊天，并按设定的间隔自动创建记忆。

### 手动创建记忆

你可以用箭头 (► ◄) 标记重要场景，然后只为那一段创建记忆。

### Side Prompts

Side Prompts 就像追踪器，可用于关系、任务、心情或世界状态。

---

## 🎯 选择你的风格

### 设定后即忘

1. 开启 `Auto-create memory summaries`。
2. 调整 `Auto-Summary Interval`。
3. 需要的话再加一点 `Auto-Summary Buffer`。

### 手动控制

1. 用箭头标记场景开始和结束。
2. 打开 Memory Books。
3. 点击 `Create Memory`。

### Slash 命令

* `/creatememory` - 从标记场景创建记忆
* `/scenememory X-Y` - 根据消息范围创建记忆
* `/nextmemory` - 从上次记忆之后的消息开始
* `/sideprompt "Name" {{macro}}="value" [X-Y]` - 运行 Side Prompt
* `/sideprompt-on "Name"` 或 `/sideprompt-off "Name"` - 手动开启或关闭 Side Prompt
* `/stmb-set-highest <N|none>` - 调整自动总结基线

---

## 🙈 节省 token：隐藏 / 显示

隐藏消息不会删除它们，只是不会再直接送给 AI。

### 什么时候有用

* 聊天记录已经很长
* 这些消息已经做成记忆
* 你想让聊天更干净

### 自动隐藏

* `Do not auto-hide` - 不自动隐藏
* `Auto-hide all messages up to the last memory` - 隐藏已经被记忆覆盖的内容
* `Auto-hide only messages in the last memory` - 只隐藏最后一段处理过的内容

### 生成前重新显示

`Unhide hidden messages for memory generation` 会在生成前临时执行 `/unhide X-Y`。

### 建议设置

* `Auto-hide only messages in the last memory`
* 保留 `2` 条消息可见
* 打开 `Unhide hidden messages for memory generation`

---

## 🌈 总结整合

总结整合可以把较旧的 STMB 记忆压缩成更高层级的摘要，帮助长篇故事保持可控。

### 它是什么？

STMB 可以把现有记忆或总结整合成更紧凑的记录。第一层是 `Arc`，后面还有 `Chapter`、`Book`、`Legend`、`Series` 和 `Epic`。

### 什么时候用？

* 记忆列表太长
* 旧记忆不再需要逐场景细节
* 想减少 token 又不想丢失连贯性

### 会自动运行吗？

不会。整合仍然需要确认。

* 可以手动打开 `Consolidate Memories`
* 到达最小值时，STMB 也可以提示你确认
* 选择 `Yes` 只会打开窗口，不会静默执行

### 什么会被整合？

* 普通 STMB 记忆
* 更高层级的总结
* Side Prompts 不会并入 Arc/Chapter

### 如何使用？

1. 点击 `Consolidate Memories`
2. 选择目标层级
3. 选择来源条目
4. 决定是否停用来源
5. 点击 `Run`

如果 AI 返回了不好的结果，可以先检查再重新保存。

---

## 🎨 Side Prompts 与模板

Side Prompts 是后台追踪器，会在 lorebook 中创建独立条目并与记忆并行运行。

### 工作方式

* `Prompt`、`Response Format` 和 `Title` 支持标准 ST 宏
* 自定义 `{{...}}` 宏会变成手动运行所需的输入
* Side Prompts 可以返回纯文本，不一定要 JSON
* Side Prompts 会更新同一条条目，而不是每次都新建一条记录

### 重点

如果模板含有自定义 runtime 宏，它就会变成只能手动运行。

### `/sideprompt`

* `X-Y` 是可选的
* 如果不提供范围，STMB 会使用该 Side Prompt 上次更新之后的消息

---

## 🧠 Regex

STMB 可以在送给 AI 之前，以及保存结果之前，执行你选定的 Regex 脚本。

### 用途

* 清理重复语句
* 统一名称或术语
* 在 STMB 解析前调整文本

### 怎么用

1. 在 SillyTavern 的 `Regex` 扩展里创建脚本。
2. 在 STMB 里开启 `Use regex (advanced)`。
3. 点击 `📐 Configure regex…`。
4. 选择要在送出前和保存前执行的脚本。

### 重要

* STMB 的 Regex 选择是由 STMB 自己控制的
* 即使脚本在 Regex 里被关闭，只要在 STMB 里选中，它仍可能运行
* STMB 支持入站和出站处理的多选

---

## ⚙️ 重要设置

这不是完整设置表。完整列表请看 [readme.md](readme.md)。

* `Auto-create memory summaries` - 开启自动创建记忆
* `Auto-Summary Interval` 和 `Auto-Summary Buffer` - 控制自动创建时机
* `Show memory previews` - 允许在保存前检查或修改 AI 输出
* `Prompt for consolidation when a tier is ready` 和 `Auto-Consolidation Tiers` - 提示你进行整合，而不是静默执行
* `Manual Lorebook Mode` 和 `Auto-create lorebook if none exists` - 控制记忆保存位置
* `Use regex (advanced)` - 打开由 STMB 管理的 Regex 选择
* `Current SillyTavern Settings` - 直接使用当前 ST 连接

---

## 🔧 疑难解答

这不是完整故障排查表。完整列表请看 [readme.md](readme.md)。

* 确认 STMB 已启用，且 `Memory Books` 出现在扩展菜单里
* 如果自动总结没触发，先确认你已经手动创建过一条记忆，并检查 interval/buffer
* 如果记忆无法保存，确认已经绑定 lorebook，或启用 `Auto-create lorebook if none exists`
* 如果 Regex 行为不对，检查 `📐 Configure regex…`
* 如果整合没有出现，检查 `Prompt for consolidation when a tier is ready` 和 `Auto-Consolidation Tiers`

---

## 🔗 更多信息

* [readme.md](readme.md)
* [changelog.md](changelog.md)
* [STMB 工作原理](howSTMBworks-zh-cn.md)
* STLO guide: [STMB and STLO - English](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)
