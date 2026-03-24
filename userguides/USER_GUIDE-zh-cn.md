# 📕 ST Memory Books - 你的 AI 聊天记忆助手

**把无止境的聊天对话变成有组织、可检索的记忆！**

如果你希望机器人记住重要内容，但聊天太长、上下文装不下；或者你想自动追踪关键剧情点，却不想手动做笔记，ST Memory Books 就是为此而设计的。它会持续观察你的聊天，并生成智能摘要，让你不再丢失故事线。

（想了解幕后技术细节？可以看 [STMB 工作原理](howSTMBworks-zh-cn.md)。）

## 📑 目录

- [快速入门](#-快速入门5分钟创建你的第一个记忆)
- [ST Memory Books 到底能做什么](#-st-memory-books-到底能做什么)
- [选择你的风格](#-选择你的风格)
- [节省 token：隐藏 / 显示消息](#-节省-token隐藏--显示消息)
- [总结整合](#-总结整合)
- [追踪器、Side Prompts 与模板](#-追踪器side-prompts-与模板高级功能)
- [先看这些重要设置](#-先看这些重要设置)
- [疑难解答](#-疑难解答当事情不工作时)
- [ST Memory Books 不做什么](#-st-memory-books-不做什么)
- [获取帮助与更多信息](#-获取帮助与更多信息)
- [用 Lorebook Ordering（STLO）增强功能](#-用-lorebook-orderingstlo-增强功能)

---

## 🚀 快速入门（5分钟创建你的第一个记忆）

**刚接触 ST Memory Books？** 下面几步就能让它开始自动记忆：

### 步骤 1：找到扩展
- 找到聊天输入框旁边的魔法棒图标（🪄）
- 点击它，然后点 **“Memory Books”**
- 你会看到 ST Memory Books 的控制面板

### 步骤 2：开启自动魔法
- 在控制面板里找到 **“自动创建记忆摘要”**
- 把它打开
- 将 **“自动摘要间隔”** 先设为 **20-30 条消息**
- 将 **“自动摘要缓冲区”** 先保持在较低值，`0-2` 是不错的起点
- 先手动创建一条记忆，让当前聊天进入可自动处理的状态
- 就这样！🎉

### 步骤 3：正常聊天
- 继续像平常一样聊天
- 当你又发了 20-30 条消息后，ST Memory Books 会自动：
  - 读取上一个已处理检查点之后的新消息
  - 请求 AI 写一条摘要
  - 把它保存到你的记忆集合中
  - 完成后显示通知

**恭喜！** 你现在已经启用了自动记忆管理，不用再担心忘记几章之前发生了什么。

---

## 💡 ST Memory Books 到底能做什么

把 ST Memory Books 想成你的 **AI 聊天图书管理员**：

### 🤖 **自动摘要**
*“我不想操心，直接让它工作就行”*
- 在后台监控聊天
- 每隔 X 条消息自动创建记忆
- 非常适合长篇角色扮演、创作写作或持续推进的故事

### ✋ **手动创建记忆**
*“我想决定哪些内容被保存”*
- 用简单的箭头按钮（► ◄）标记重要场景
- 需要时按需创建记忆，记录特殊时刻
- 适合捕捉关键剧情点或角色变化

### 📊 **Side Prompts 与智能追踪器**
*“我想追踪关系、剧情线或数值”*
- 可复用的提示片段，用来增强记忆生成
- 带有现成追踪器的模板库
- 可自定义 AI 提示，用来追踪任何你想记录的内容
- 自动更新状态板、关系状态、剧情摘要
- 示例：“谁喜欢谁？”、“当前任务状态”、“角色情绪追踪器”

### 📚 **记忆集合**
*所有记忆存放的地方*
- 自动整理且可检索
- 与 SillyTavern 自带 lorebook 系统协同工作
- 你的 AI 可以在新对话里引用过往记忆

---

## 🎯 选择你的风格

<details>
<summary><strong>🔄 “设好就忘” （推荐给新手）</strong></summary>

**适合你如果：** 想要不费心、能稳定工作的自动化。

**工作方式：**
1. 打开 `自动创建记忆摘要`
2. 把 `自动摘要间隔` 设到适合你聊天速度的数值
3. 如果你想让生成稍微延后，可以再加一点 `自动摘要缓冲区`
4. 先手动创建一条记忆，把当前聊天“点燃”

**你会得到：**
- 不需要手动操作
- 稳定地创建记忆
- 不会错过重要剧情转折
- 单人聊天和群聊都能用

**小建议：** 可以先从 30 条消息开始，再根据你的聊天节奏调整。快节奏聊天可能适合 50+，慢而细的聊天则可能更适合 20。

</details>

<details>
<summary><strong>✋ “手动控制” （适合选择性记忆）</strong></summary>

**适合你如果：** 想精确决定哪些内容会成为记忆。

**工作方式：**
1. 在聊天消息上找到小箭头按钮（► ◄）
2. 在重要场景的第一条消息上点击 ►
3. 在该场景最后一条消息上点击 ◄
4. 打开 Memory Books（🪄）并点击 **“Create Memory”**

**你会得到：**
- 对记忆内容的完全控制
- 很适合捕捉特定时刻
- 对需要明确边界的复杂场景特别有用

**小建议：** 聊天加载后几秒，箭头按钮就会出现。如果看不到，稍等一下或刷新页面。

</details>

<details>
<summary><strong>⚡ “高阶用户” （Slash 命令）</strong></summary>

**适合你如果：** 喜欢键盘快捷方式和高级功能。

**常用命令：**
- `/scenememory 10-25` - 从 10 到 25 的消息创建记忆
- `/creatememory` - 从当前标记场景创建记忆
- `/nextmemory` - 总结自上一次记忆以来的全部内容
- `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - 运行 Side Prompt，可选地提供运行时宏和消息范围
- `/sideprompt-on "Name"` 或 `/sideprompt-off "Name"` - 手动切换 Side Prompt
- `/stmb-set-highest <N|none>` - 调整当前聊天的自动摘要基线

**你会得到：**
- 非常快速的记忆创建
- 批量操作
- 与自定义工作流集成

</details>

---

## 🙈 节省 token：隐藏 / 显示消息

在长聊天里，最简单的减轻负担和省 token 的方法之一，就是在消息已经转成记忆后把它们隐藏起来。

### “隐藏”是什么意思？

隐藏消息 **不会删除** 它们。它只是让 AI 看不到这些消息。你的聊天记录仍然存在，记忆也仍然保留在 lorebook 里，所以重要信息不会丢失，只是不再直接发送给 AI。

### 为什么要用它？

隐藏 / 重新显示 在以下情况非常有用：
- 你的聊天已经很长
- 这些消息已经被写进记忆

### 创建记忆后自动隐藏

STMB 可以在记忆创建后自动隐藏消息。你可以选择：

- **不自动隐藏**：保持全部可见，你可以手动用 `/hide x-y` 隐藏
- **自动隐藏到最后一条记忆为止的所有消息**：隐藏已经被记忆覆盖的内容
- **只自动隐藏最后一条记忆中的消息**：只隐藏最近处理过的范围

你还可以通过 **Messages to leave unhidden** 控制保留多少最近消息可见。

### 生成记忆前重新显示

**Unhide hidden messages for memory generation** 会在生成记忆前，临时对所选范围执行 `/unhide X-Y`。如果你经常重做记忆，这个很有用。

### 新手推荐设置

Aiko 的设置：
- 使用 **Auto-hide messages up to the last memory**
- 保留 **2** 条消息不隐藏
- 打开 **Unhide hidden messages for memory generation**

---

## 🌈 总结整合

总结整合会把较早的 STMB 记忆压缩成更高层级的回顾条目，让长篇故事更容易维护。

### 问：什么是总结整合？

**答：** 它不是一直只做场景级记忆。STMB 可以把现有记忆或摘要合并成更紧凑的回顾。第一层是 **Arc**，更高层级也支持更长篇幅的故事：

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

### 问：为什么要用它？

**答：** 在这些情况下特别有用：

- 记忆列表越来越长
- 老条目不再需要逐场景细节
- 你想降低 token 消耗但保留连续性
- 你想得到更干净、更高层的叙事回顾

### 问：它会自动运行吗？

**答：** 不会。总结整合仍然需要你确认。

- 你可以随时从主面板手动打开 **Consolidate Memories**
- 你也可以启用 **Prompt for consolidation when a tier is ready**
- 当某个目标层级达到其已保存的最小合格数量时，STMB 会显示一个 **yes/later** 确认框
- 选择 **Yes** 只会打开已选中该层级的整合面板，不会悄悄自动执行

### 问：我该怎么用？

**答：** 创建整合摘要的步骤是：

1. 在 STMB 主面板中点击 **Consolidate Memories**
2. 选择目标摘要层级
3. 选择想纳入的来源条目
4. 视需要决定是否在新摘要创建后停用来源条目
5. 点击 **Run**

如果你想预览这些条目，请在偏好设置里启用预览。

---

## 🎨 追踪器、Side Prompts 与模板（高级功能）

**Side Prompts** 是后台追踪器，能帮你维持持续变化的故事信息。它们会在记忆创建之外运行，并随着时间更新独立的 side prompt lorebook 条目。你可以把它们理解成 **一边看着故事、一边帮你把关键细节保持最新的助手**。

### 🚀 **用模板快速开始**

1. 打开 Memory Books 设置
2. 点击 **Side Prompts**
3. 浏览 **template library**，选择适合你故事的模板：

   * **Character Development Tracker** - 追踪人格变化和成长
   * **Relationship Dynamics** - 追踪角色关系
   * **Plot Thread Tracker** - 追踪持续推进的剧情线
   * **Mood & Atmosphere** - 追踪情绪基调
   * **World Building Notes** - 追踪设定细节和世界观
4. 启用你想要的模板（之后还可以继续自定义）
5. 如果模板使用自动触发，STMB 会在记忆创建时一并更新这个 side-prompt 条目

[Scribe 逐步演示如何启用 Memory Books 的 Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)

### ⚙️ **Side Prompt 的工作方式**

* **后台追踪器**：它们静静运行，并随时间更新信息
* **不侵入**：不会改动你的主 AI 设置或角色提示词
* **按聊天控制**：不同聊天可以使用不同追踪器
* **基于模板**：可以用内置模板，也可以自己创建
* **自动或手动**：标准模板可以自动运行；带自定义运行时宏的模板只能手动运行
* **宏支持**：`Prompt`、`Response Format`、`Title` 和关键词字段可以展开标准 ST 宏，例如 `{{user}}` 和 `{{char}}`
* **运行时宏**：非标准的 `{{...}}` token 会变成命令输入，例如 `{{npc name}}="Jane Doe"`
* **允许纯文本**：Side Prompt 不一定要返回 JSON
* **覆盖行为**：Side Prompt 会持续更新自己的追踪条目，而不是每次都新建一条顺序记忆

### 🛠️ **管理 Side Prompts**

* **Side Prompts Manager**：创建、编辑、复制和整理追踪器
* **启用 / 禁用**：随时开关追踪器
* **导入 / 导出**：共享模板或备份
* **状态视图**：查看当前聊天里哪些追踪器在运行，以及它们何时触发
* **安全检查**：如果模板包含自定义运行时宏，STMB 会在保存 / 导入时移除自动触发并显示警告提示

### 💡 **模板示例**

* Side Prompt Template Library（导入这个 JSON）：
  [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)

示例提示想法：

* “追踪重要对话和角色互动”
* “保持当前任务状态最新”
* “记录出现时的新世界观细节”
* “追踪角色 A 和角色 B 之间的关系”

### 🔧 **创建自定义 Side Prompts**

1. 打开 Side Prompts Manager
2. 点击 **Create New**
3. 写一条简短、明确的指令
   （例如：“始终记录每个场景里的天气情况”）
4. 可以选填标准 ST 宏，比如 `{{user}}` 或 `{{char}}`
5. 如果加入自定义运行时宏，例如 `{{location name}}`，就需要用 `/sideprompt "Name" {{location name}}="value"` 手动运行
6. 保存并启用它
7. 如果该追踪器使用自动触发，它就会随着时间自动更新这类信息；否则就在需要时手动运行

### 💬 **小技巧**

Side Prompt 最适合做成 **小而聚焦** 的内容。
与其写“追踪一切”，不如写“追踪主角之间的恋爱张力”。

### ⌨️ **手动 /sideprompt 语法**

使用：
`/sideprompt "Name" {{macro}}="value" [X-Y]`

示例：
- `/sideprompt "Status" 10-20`
- `/sideprompt "NPC Directory" {{npc name}}="Jane Doe" 40-50`
- `/sideprompt "Location Notes" {{place name}}="Black Harbor" 100-120`

注意：

- side prompt 名称必须加引号
- 运行时宏的值也必须加引号
- 选完 side prompt 后，Slash 命令自动补全会提示所需的运行时宏
- 如果模板包含自定义运行时宏，STMB 会把它保留为仅手动运行，并移除自动触发
- `X-Y` 是可选的。如果你不写范围，STMB 会使用自上次该 side prompt 更新以来的消息
- 如果你是手动并分开运行 side prompt，别忘了打开 **Unhide before generation**

---

### 🧠 使用 Regex 扩展进行高级文本控制

**想完全控制 STMB 发送给 AI 的文本和接收回来的文本？** STMB 可以在生成前和保存前运行你选定的 Regex 脚本。

这在以下情况下很有用：
- 清理 AI 回应里的重复废话
- 在生成前统一名称或术语
- 在 STMB 解析或预览前重新格式化文本

#### **现在它是怎么工作的**

1. 在 SillyTavern 的 **Regex** 扩展里创建你想要的脚本
2. 在 STMB 里开启 **Use regex (advanced)**
3. 点击 **📐 Configure regex…**
4. 选择 STMB 应该运行哪些脚本：
   - 在把文本发送给 AI 之前
   - 在把响应加入 lorebook 之前

#### **重要行为**

- STMB 的 Regex 选择由 **STMB 本身**控制，不由 Regex 扩展里脚本的启用 / 禁用状态控制
- 在 STMB 里选中的脚本，即使在 Regex 扩展里被禁用，也仍然可以运行
- STMB 支持出站和入站处理的多选

#### **快速示例**

如果你的模型总是在摘要后面加 `(OOC: I hope this summary is helpful!)`，你可以：

1. 创建一个删除这段文字的 Regex 脚本
2. 在 STMB 里打开 **Use regex (advanced)**
3. 打开 **📐 Configure regex…**
4. 把那个脚本加入 **incoming** 选择

这样 STMB 就会在预览或保存前清理响应内容。

---

## ⚙️ 先看这些重要设置

这不是完整的设置参考。完整的逐项说明请看 [readme-zh-cn.md](readme-zh-cn.md)。

多数用户最先应该了解这些控制项：
- **Current SillyTavern Settings**：直接使用你当前的 ST 连接，不必新建自定义提供者配置
- **Create your own STMB Profile**：让你自定义 STMB，例如为记忆和角色扮演使用不同或更便宜的模型
- **Auto-hide/unhide memories**：你真正省 token 的地方，因为它能在记忆保存后隐藏消息
- **Manual Lorebook Mode** 和 **Auto-create lorebook if none exists**：控制记忆存到哪里
- **Show memory previews**：让你在保存前检查或编辑 AI 输出
- **Auto-create memory summaries**：开启自动记忆生成
- **Auto-Summary Interval** 和 **Auto-Summary Buffer**：控制自动记忆生成何时运行
- **Side Prompts**：启用追踪器
- **Prompt for consolidation when a tier is ready** 与 **Auto-Consolidation Tiers**：在满足条件时提示你进行整合，而不是静默执行

---

## 🔧 疑难解答（当事情不工作时）

这不是完整的排障清单。完整列表请看 [readme-zh-cn.md](readme-zh-cn.md)。

先做这些最常见的检查：

- 确认 STMB 已启用，而且扩展魔杖菜单下出现了 **Memory Books**
- 如果自动摘要没有触发，先确认你已经手动创建过一条记忆，并检查 interval / buffer 是否合理
- 如果记忆无法保存，请确认聊天已经绑定 lorebook，或启用了 **Auto-create lorebook if none exists**
- 如果记忆没有触发，确认 `delay until recursion` 已关闭
- 如果 regex 行为看起来不对，请检查 **📐 Configure regex…** 里的选择，而不只是看 Regex 扩展本身
- 如果整合没有弹出，请确认 **Prompt for consolidation when a tier is ready** 已启用，并且目标层级包含在 **Auto-Consolidation Tiers** 中

---

## 🚫 ST Memory Books 不做什么

- **不是通用 lorebook 编辑器：** 本指南聚焦的是 STMB 创建的条目。通用 lorebook 的编辑请使用 SillyTavern 自带的 lorebook 编辑器。

---

## 💡 获取帮助与更多信息

- **更详细的信息：** [readme-zh-cn.md](readme-zh-cn.md)
- **最新更新：** [changelog.md](../changelog.md)
- **工作原理：** [howSTMBworks-zh-cn.md](howSTMBworks-zh-cn.md)
- **社区支持：** 加入 SillyTavern 社区 Discord！可以找 📕ST Memory Books 线程，或者直接私信 @tokyoapple 寻求帮助。
- **Bug / 功能建议：** 如果你发现 bug，或者有很棒的点子，请在本仓库提交 GitHub issue。

---

### 📚 用 Lorebook Ordering（STLO）增强功能

如果你需要更进阶的记忆组织和更深入的剧情整合，可以把 STMB 和 [SillyTavern-LorebookOrdering（STLO）](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) 一起使用。查看指南可以了解最佳实践、安装说明和技巧！

---

*使用 VS Code/Cline、充分测试和社区反馈，满怀热情地开发。* 🤖💕
