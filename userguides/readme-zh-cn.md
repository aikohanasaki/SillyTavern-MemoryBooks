# 📕 Memory Books（SillyTavern 扩展）

这是下一代 SillyTavern 扩展，用于自动、结构化、可靠地创建记忆。在聊天中标记场景，使用 AI 生成基于 JSON 的总结，并将它们作为条目存入您的世界书（lorebook）。支持群聊、高级配置文件管理、Side Prompt/追踪器，以及多层级记忆整合。

### ❓ 词汇表
- Scene（场景）→ Memory（记忆）  
- Many Memories（多个记忆）→ Summary / Consolidation（总结 / 整合）  
- Always-On（常驻）→ Side Prompt（Tracker / 追踪器）

## ❗ 请先阅读！

从这里开始：
* ⚠️‼️ 请阅读[前置条件](#-前置条件)，了解安装注意事项，特别是使用 Text Completion API 时。
* 📽️ [Quickstart Video](https://youtu.be/mG2eRH_EhHs) — 仅英文。
* ❓ [常见问题](#faq)
* 🛠️ [故障排除](#troubleshooting)

其他链接：
* 📘 [用户指南（简体中文）](USER_GUIDE-zh-cn.md)
* 📋 [版本历史 & 更新日志](../changelog.md)
* 💡 [配合 📕 Memory Books 使用 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Simplified%20Chinese.md)

> 注意：支持多种语言。请参阅 [`/locales`](../locales) 文件夹查看列表。本地化 Readme 和用户指南位于 [`/userguides`](./) 文件夹。  
> 世界书转换器和 Side Prompt 模板库位于 [`/resources`](../resources) 文件夹。

## 📑 目录

- [前置条件](#-前置条件)
  - [KoboldCpp 使用 📕 ST Memory Books 的提示](#koboldcpp-使用--st-memory-books-的提示)
  - [Llama.cpp 使用 📕 ST Memory Books 的提示](#llamacpp-使用--st-memory-books-的提示)
- [推荐的全局 World Info/Lorebook 激活设置](#-推荐的全局-world-infolorebook-激活设置)
- [快速开始](#-快速开始)
  - [1. 安装 & 加载](#1-安装--加载)
  - [2. 标记场景](#2-标记场景)
  - [3. 创建记忆](#3-创建记忆)
- [记忆类型：场景与总结](#-记忆类型场景与总结)
  - [场景记忆（默认）](#-场景记忆默认)
  - [总结整合](#-总结整合)
- [记忆生成](#-记忆生成)
  - [仅 JSON 输出](#仅-json-输出)
  - [内置预设](#内置预设)
  - [自定义提示词](#自定义提示词)
- [世界书集成](#-世界书集成)
- [斜杠命令](#-斜杠命令)
- [群聊支持](#-群聊支持)
- [操作模式](#-操作模式)
  - [自动模式（默认）](#自动模式默认)
  - [自动创建世界书模式](#自动创建世界书模式)
  - [手动世界书模式](#手动世界书模式)
- [追踪器 & Side Prompts](#-追踪器--side-prompts)
- [压缩](#-压缩)
- [Regex 集成：高级自定义](#-regex-集成高级自定义)
- [配置文件管理](#-配置文件管理)
- [设置与配置](#-设置与配置)
  - [全局设置](#全局设置)
  - [配置文件字段](#配置文件字段)
- [标题格式化](#-标题格式化)
- [上下文记忆](#-上下文记忆)
- [视觉反馈与辅助功能](#-视觉反馈与辅助功能)
- [FAQ](#faq)
  - [我应该为记忆单独创建一本世界书，还是可以使用已经用于其他用途的同一本世界书？](#我应该为记忆单独创建一本世界书还是可以使用已经用于其他用途的同一本世界书)
  - [我需要运行 Vectors 吗？](#我需要运行-vectors-吗)
  - [如果 Memory Books 是唯一的世界书，我应该使用 Delay until recursion 吗？](#如果-memory-books-是唯一的世界书我应该使用-delay-until-recursion-吗)
  - [为什么 AI 看不到我的条目？](#为什么-ai-看不到我的条目)
- [Troubleshooting](#troubleshooting)
- [配合 Lorebook Ordering (STLO) 提升体验](#-配合-lorebook-ordering-stlo-提升体验)
- [字符策略](#-字符策略-v451)
- [面向开发者](#-面向开发者)
  - [构建扩展](#构建扩展)
  - [Git hooks](#git-hooks)

---

## 📋 前置条件

- **SillyTavern:** 1.14.0+（建议使用最新版）。
- **场景选择:** 必须设置开始和结束标记（开始 < 结束）。
- **Chat Completion 支持:** 完整支持 OpenAI、Claude、Anthropic、OpenRouter 或其他 Chat Completion API。
- **Text Completion 支持:** Text Completion API（Kobold、TextGen 等）在通过 Chat Completion（OpenAI 兼容）API endpoint 连接时受支持。建议按照下方 KoboldCpp 提示设置 Chat Completion API 连接（如果使用 Ollama 或其他软件，请按需调整）。之后设置一个 STMB 配置文件，并使用 Custom（推荐）或全手动配置（仅当 Custom 失败，或您有多个 custom 连接时使用）。

**注意:** 如果使用 Text Completion，必须拥有一个 Chat Completion Preset。

### KoboldCpp 使用 📕 ST Memory Books 的提示

在 ST 中这样设置。确认 STMB 能正常工作后，可以再切回 Text Completion。

- Chat Completion API
- Custom chat completion source
- endpoint 使用 `http://localhost:5001/v1`（也可以使用 `127.0.0.1:5000/v1`）
- 在 `custom API key` 中输入任意内容（内容无所谓，但 ST 要求填写）
- Model ID 必须是 `koboldcpp/modelname`（不要在模型名中写 `.gguf`）
- 下载并导入一个 Chat Completion Preset，任意一个都可以。这样可以避免 `not supported` 错误。
- 将 Chat Completion Preset 的 max response length 设为至少 2048；推荐 4096。太小可能导致响应被截断。

### Llama.cpp 使用 📕 ST Memory Books 的提示

和 Kobold 一样，在 ST 中将以下内容设置为 _Chat Completion API_。验证 STMB 正常工作后，可以再切回去。

- 为 Chat Completion API 创建一个新的 connection profile。
- Completion Source: `Custom (Open-AI Compatible)`。
- Endpoint URL: 如果 ST 在 Docker 中运行，使用 `http://host.docker.internal:8080/v1`；否则使用 `http://localhost:8080/v1`。
- Custom API key: 输入任意内容（ST 要求填写）。
- Model ID: `llama2-7b-chat.gguf` 或您的模型名；如果 llama.cpp 只运行一个模型，具体名称并不关键。
- Prompt post-processing: none。

为了更方便启动 Llama.cpp，建议把类似下面的内容放进 shell 脚本或 bat 文件：

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

## 💡 推荐的全局 World Info/Lorebook 激活设置

- **Match Whole Words:** 保持未选中（false）。
- **Scan Depth:** 越高越好（我设置为 8）。
- **Max Recursion Steps:** 2（一般建议，不是硬性要求）。
- **Context %:** 80%（基于 100,000 token 的上下文窗口）——假设您没有非常庞大的聊天历史或角色设定。
- 额外说明：如果记忆世界书是您唯一的世界书，请确保 STMB 配置文件中禁用了 `Delay until recursion`，否则记忆不会触发。

---

## 🚀 快速开始

### 1. **安装 & 加载**

- 加载 SillyTavern，并选择一个角色或群聊。
- 等待聊天消息上出现箭头按钮（► ◄）。这可能需要最多 10 秒。

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **标记场景**

- 点击场景第一条消息上的 ►。
- 点击场景最后一条消息上的 ◄。

下面是点击后箭头按钮外观的一些示例。颜色可能会因您的 CSS 主题而不同。

![Visual feedback showing scene selection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **创建记忆**

- 打开 Extensions 菜单（输入框左侧的魔法棒 🪄），点击 `Memory Books`，或使用 `/creatememory` 斜杠命令。
- 如果出现提示，确认配置文件、上下文、API/模型设置。
- 等待 AI 生成，并自动创建世界书条目。

---

## 🧩 记忆类型：场景与总结

📕 Memory Books 支持 **场景记忆** 和 **多层级总结整合**，它们面向不同类型的连续性需求。

### 🎬 场景记忆（默认）

场景记忆捕捉某个消息范围内 **发生了什么**。

- 基于明确的场景选择（► ◄）。
- 适合即时、细节级回忆。
- 保留对话、动作和直接后果。
- 最好频繁使用。

这是标准且最常用的记忆类型。

---

### 🌈 总结整合

总结整合捕捉多个记忆或总结中 **随时间发生的变化**。

它不是总结单一场景，而是关注：

- 角色发展与关系变化；
- 长期目标、紧张关系与解决；
- 情感轨迹和叙事方向；
- 需要保持稳定的持久状态变化。

第一个整合层级是 **Arc**，由场景记忆构成。更长的故事还支持更高层级：

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 可以把它们理解为 *回顾/概述*，不是场景日志。

#### 何时使用整合总结

- 发生重大关系变化之后。
- 故事章节或篇章结束时。
- 动机、信任或权力动态发生变化时。
- 开始故事新阶段之前。

#### 工作方式

- 整合总结从现有 STMB 记忆/总结生成，而不是直接从原始聊天生成。
- **Consolidate Memories** 工具允许您选择目标总结层级和源条目。
- STMB 可以监控选定的总结层级，并在某一层级达到保存的最小合格源条目数时显示 yes/later 确认。
- 如果希望更高层级总结接管，STMB 可以在整合后禁用源条目。
- AI 总结失败时，可以先在 UI 中查看和修正，再重新提交。

这带来的好处：

- 更低的 token 使用量；
- 长聊天中更好的叙事连续性。

---

## 📝 记忆生成

### **仅 JSON 输出**

所有提示词和预设 **必须** 指示 AI 只返回有效 JSON，例如：

```json
{
  "title": "简短场景标题",
  "content": "场景的详细总结...",
  "keywords": ["关键词1", "关键词2"]
}
```

**响应中不允许包含其他文本。**

### **内置预设**

1. **Summary:** 详细的逐节拍总结。
2. **Summarize:** 使用 Markdown 标题组织 timeline、beats、interactions、outcome。
3. **Synopsis:** 全面、结构化的 markdown。
4. **Sum Up:** 带时间线的简明节拍总结。
5. **Minimal:** 1–2 句话总结。
6. **Northgate:** 面向创作写作的文学式总结风格。
7. **Aelemar:** 侧重剧情点和角色记忆。
8. **Comprehensive:** synopsis 风格总结，并改进关键词提取。

### **自定义提示词**

- 可以创建自己的提示词，但 **必须** 如上所示返回有效 JSON。

---

## 📚 世界书集成

- **自动创建条目:** 新记忆会作为包含全部元数据的条目保存。
- **基于标志检测:** 只有带有 `stmemorybooks` 标志的条目会被识别为记忆。
- **自动编号:** 支持顺序、补零编号，以及多种格式（`[000]`、`(000)`、`{000}`、`#000`）。
- **手动/自动排序:** 每个配置文件都有插入顺序设置。
- **编辑器刷新:** 可选择在添加记忆后自动刷新世界书编辑器。

> **现有记忆必须转换！**  
> 使用 [Lorebook Converter](../resources/lorebookconverter.html) 添加 `stmemorybooks` 标志和必填字段。

---

## 🆕 斜杠命令

- `/creatememory` — 从已标记场景创建记忆。
- `/scenememory X-Y` — 设置场景范围并创建记忆，例如 `/scenememory 10-15`。
- `/nextmemory` — 从上一个记忆的结尾到当前消息创建记忆。
- `/stmb-catchup interval:x start:y end:y` — 为已有长聊天创建补录记忆，将所选消息范围按指定间隔分块处理。
- `/sideprompt "Name" {{macro}}="value" [X-Y]` — 运行 Side Prompt（`{{macro}}` 可选）。
- `/sideprompt-set "Set Name" [X-Y]` — 运行已保存的 Side Prompt Set。
- `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` — 运行 Side Prompt Set 并提供可复用的宏值。
- `/sideprompt-on "Name" | all` — 按名称启用某个 Side Prompt，或启用全部。
- `/sideprompt-off "Name" | all` — 按名称禁用某个 Side Prompt，或禁用全部。
- `/stmb-highest` — 返回此聊天中已处理记忆的最高 message id。
- `/stmb-set-highest <N|none>` — 手动设置此聊天的最高已处理 message id。
- `/stmb-stop` — 停止所有正在进行的 STMB 生成。用于紧急中止。

### `/stmb-catchup`

当您需要把已有长聊天转换为 STMB 记忆时，使用 `/stmb-catchup`。

语法：`/stmb-catchup interval:x start:y end:y`

示例：`/stmb-catchup interval:30 start:0 end:300`

---

## 👥 群聊支持

- 所有功能都支持群聊。
- 场景标记、记忆创建和世界书集成会存储在当前聊天元数据中。
- 不需要特殊设置；选择群聊并正常使用即可。

---

## 🧭 操作模式

### **自动模式（默认）**

- **工作方式:** 自动使用绑定到当前聊天的世界书。
- **适合:** 简单快速。大多数用户应从这里开始。
- **使用方法:** 确保在角色或群聊的 `Chat Lorebooks` 下拉菜单中选择了世界书。

![Chat lorebook binding example](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **自动创建世界书模式**

- **工作方式:** 当没有世界书时，使用您的自定义命名模板自动创建并绑定一个新世界书。
- **适合:** 新用户和快速设置。适合一键创建世界书。
- **使用方法:**
  1. 在扩展设置中启用 `Auto-create lorebook if none exists`。
  2. 配置命名模板（默认：`LTM - {{char}} - {{chat}}`）。
  3. 在没有绑定世界书的情况下创建记忆时，系统会自动创建并绑定一本世界书。
- **模板占位符:** `{{char}}`（角色名）、`{{user}}`（您的名字）、`{{chat}}`（聊天 ID）。
- **智能编号:** 如果存在重名，会自动添加数字（2、3、4...）。
- **注意:** 不能与 Manual Lorebook Mode 同时使用。

### **手动世界书模式**

- **工作方式:** 允许您按聊天为记忆选择不同的世界书，忽略主聊天绑定的世界书。
- **适合:** 想把记忆定向到某本独立世界书的高级用户。
- **使用方法:**
  1. 在扩展设置中启用 `Enable Manual Lorebook Mode`。
  2. 第一次在聊天中创建记忆时，系统会提示您选择世界书。
  3. 该选择会针对此聊天保存，直到您清除它或切回 Automatic Mode。
- **注意:** 不能与 Auto-Create Lorebook Mode 同时使用。

---

### 🎡 追踪器 & Side Prompts

> 📘 Side Prompts 有单独指南：[Side Prompts Guide](side-prompts-zh-cn.md)。请参考该指南了解 Sets、宏、示例和故障排除。
> 🎡 需要具体点击路径？请参阅 [启用 Side Prompts 的 Scribe 演示](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)。

Side Prompts 是独立的 STMB 提示词运行，用于维护持续的聊天状态。可将它们用于追踪器和辅助笔记，避免让普通角色回复变臃肿，例如：

- 💰 物品 & 资源：「用户拥有什么物品？」
- ❤️ 关系状态：「X 对 Y 的感觉如何？」
- 📊 角色属性：「当前健康、技能、声望」
- 🎯 任务进度：「哪些目标处于激活状态？」
- 🌍 世界状态：「设定中发生了什么变化？」

#### **访问:** 在 Memory Books 设置中点击 `🎡 Trackers & Side Prompts`。

#### **功能:**

- 查看、创建、复制、编辑、删除、导出和导入 Side Prompts。
- 手动运行 Side Prompts，在记忆创建后运行，或作为 Side Prompt Set 的一部分运行。
- 使用 `{{user}}` 和 `{{char}}` 等标准 SillyTavern 宏。
- 在提示词运行时需要值时，使用 `{{npc name}}` 等运行时宏。
- 将 Side Prompt 输出保存为记忆世界书中的独立 side-prompt 条目。

#### **使用技巧:**

- 创建新提示词时，建议从内置模板复制。
- Side Prompts 不必返回 JSON。普通文本或 Markdown 均可。
- Side Prompts 通常会被更新/覆盖；记忆会按顺序保存。
- 手动语法：`/sideprompt "Name" {{macro}}="value" [X-Y]`。
- 当聊天需要一组有序追踪器时，使用 Side Prompt Sets。
- 选中的“记忆创建后”Side Prompt Set 会替代该聊天中单独启用的“记忆创建后”Side Prompts。
- 额外的 Side Prompt 模板库：[JSON 文件](../resources/SidePromptTemplateLibrary.json)。导入即可使用。

---

### 🧹 压缩

压缩是一种审阅流程，用来让 STMB 管理的 lorebook 条目更节省 token。它会请求 AI 重写一个现有条目，然后在替换任何内容之前，让你先查看原文和压缩草稿。

你可以从 Memory Books 主弹窗点击 **📝 压缩** 打开它。较长的摘录条目也可能在摘录流程中显示 **压缩条目** 按钮。

#### 符合条件的条目

压缩会列出所选记忆书中的符合条件条目：

- 带有 `[STMB Clip]` 标记的摘录条目
- 侧边提示词条目
- 由 Memory Books 标记的 STMB 记忆条目

不由 STMB 管理的普通 lorebook 条目不会显示。

#### 工作方式

1. 打开 Memory Books，然后点击 **📝 压缩**。
2. 选择一个 **记忆书**。如果当前聊天已经有有效的记忆书，STMB 会预先选中它；否则，请从可搜索下拉框中选择。
3. 选择一个 **压缩配置文件**。这会决定压缩请求使用哪个 AI 连接 / 模型。
4. 可选：如果想修改发送给 AI 的指令，请点击 **编辑压缩提示**。
5. 点击要重写条目旁边的 **压缩条目**。
6. 对比 **原始内容** 和 **压缩草稿**。STMB 会显示两者的估算 token 数。
7. 根据需要编辑草稿，然后选择 **替换为压缩版本**、**复制压缩草稿** 或 **取消**。

STMB 不会自动替换原文。只有点击 **替换为压缩版本** 后，lorebook 条目才会被修改。

#### 压缩提示

压缩提示可以编辑。默认提示会要求 AI 保留重要事实、姓名、代词、宏、包装标题和结尾标记，同时移除重复内容和低价值措辞。

支持的提示占位符：

- `{{ENTRY_CONTENT}}` — 当前 lorebook 条目的内容。此占位符是必需的。
- `{{ENTRY_KIND}}` — 条目类型，例如 Clip、SidePrompt 或 Memory。
- `{{ENTRY_TITLE}}` — lorebook 条目的标题。

如果想恢复内置压缩提示，请在提示编辑器中使用 **重置为默认值**。

#### 适合用于

- 较长的摘录条目
- 随时间累积重复内容的侧边提示词追踪条目
- 有用但冗长的 STMB 记忆条目
- 常驻且开始浪费上下文的条目

#### 不适合用于

- 添加新事实
- 总结原始聊天
- 创建新记忆
- 重写不由 STMB 管理的普通 lorebook 条目

---

### 🧠 Regex 集成：高级自定义

- **完全控制文本处理:** Memory Books 现在与 SillyTavern 的 **Regex** 扩展集成，可以在两个关键阶段应用文本转换：
  1. **提示词生成:** 创建针对 **User Input** 位置的 regex 脚本，自动修改发送给 AI 的提示词。
  2. **响应解析:** 创建针对 **AI Output** 位置的 regex 脚本，在保存前清理、重新格式化或标准化 AI 的原始响应。
- **支持多选:** 可以为发送前和接收后处理选择多个脚本。
- **工作方式:** 在 STMB 中启用 `Use regex (advanced)`，点击 `📐 Configure regex…`，选择 STMB 应在发送给 AI 前、以及解析/保存响应前运行哪些脚本。
- **重要:** Regex 选择由 STMB 控制。只要脚本在 STMB 中被选中，即使它在 Regex 扩展本身中处于禁用状态，也仍会运行。

---

## 👤 配置文件管理

- **配置文件:** 每个配置文件包括 API、模型、temperature、提示词/预设、标题格式和世界书设置。
- **导入/导出:** 可以以 JSON 形式分享配置文件。
- **创建配置文件:** 使用高级选项弹窗保存新的配置文件。
- **每配置文件覆盖:** 创建记忆时可以临时切换 API/模型/temperature，然后恢复原设置。
- **内置 Provider/Profile:** STMB 包含必需的 `Current SillyTavern Settings` 选项，直接使用当前 SillyTavern 连接/设置。

---

## ⚙️ 设置与配置

![Main settings panel](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **全局设置**

[YouTube 简短视频概览](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** 启用按聊天选择世界书。
- **Auto-create lorebook if none exists:** 使用命名模板自动创建并绑定世界书。
- **Lorebook Name Template:** 使用 `{{char}}`、`{{user}}`、`{{chat}}` 占位符自定义自动创建的世界书名称。
- **Allow Scene Overlap:** 允许或阻止记忆范围重叠。
- **Always Use Default Profile:** 跳过确认弹窗。
- **Show memory previews:** 启用预览弹窗，在加入世界书前查看和编辑记忆。
- **Show Notifications:** 切换 toast 通知。
- **Refresh Editor:** 创建记忆后自动刷新世界书编辑器。
- **Max Response Tokens:** 设置记忆总结的最大生成长度。
- **Token Warning Threshold:** 设置大场景警告阈值。
- **Default Previous Memories:** 作为上下文包含的先前记忆数量（0–7）。
- **Auto-create memory summaries:** 按间隔启用自动创建记忆。
- **Auto-Summary Interval:** 自动创建记忆总结前等待的消息数。
- **Auto-Summary Buffer:** 将自动总结延迟指定消息数。
- **Prompt for consolidation when a tier is ready:** 当选定总结层级拥有足够合格源条目时，显示 yes/later 确认。
- **Auto-Consolidation Tiers:** 选择一个或多个总结层级，在满足条件时触发确认。目前支持 Arc through Series。
- **Unhide hidden messages before memory generation:** 创建记忆前可运行 `/unhide X-Y`。
- **Auto-hide messages after adding memory:** 可选择隐藏所有已处理消息，或仅隐藏最近的记忆范围。
- **Use regex (advanced):** 启用 STMB 的 Regex 选择弹窗，用于发送前/解析前处理。
- **Memory Title Format:** 选择或自定义标题格式（见下文）。

![Profile configuration](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **配置文件字段**

- **Name:** 显示名称。
- **API/Provider:** `Current SillyTavern Settings`、openai、claude、custom、full manual 及其他支持的 provider。
- **Model:** 模型名称，例如 gpt-4、claude-3-opus。
- **Temperature:** 0.0–2.0。
- **Prompt or Preset:** 自定义或内置。
- **Title Format:** 每个配置文件的模板。
- **Activation Mode:** Vectorized、Constant、Normal。
- **Position:** ↑Char、↓Char、↑EM、↓EM、↑AN、↓AN、Outlet（以及字段名）。
- **Order Mode:** auto/manual。
- **Recursion:** prevent/delay until recursion。

---

## 🏷️ 标题格式化

使用强大的模板系统自定义世界书条目标题。

- **占位符:**
  - `{{title}}` — AI 生成的标题，例如「命运般的相遇」。
  - `{{scene}}` — 消息范围，例如 `Scene 15-23`。
  - `{{char}}` — 角色名。
  - `{{user}}` — 您的用户名。
  - `{{messages}}` — 场景中的消息数量。
  - `{{profile}}` — 用于生成的配置文件名称。
  - 多种格式的当前日期/时间占位符，例如 `August 13, 2025` 表示日期，`11:08 PM` 表示时间。
- **自动编号:** 可使用 `[0]`、`[00]`、`(0)`、`{0}`、`#0`，也支持 `#[000]`、`([000])`、`{[000]}` 等包裹形式，用于顺序补零编号。
- **自定义格式:** 可以创建自己的格式。从 v4.5.1 开始，标题中允许所有可打印 Unicode 字符，包括 emoji、CJK、重音字符、符号等；只会阻止 Unicode 控制字符。

---

## 🧵 上下文记忆

- **最多可包含 7 个先前记忆** 作为上下文，以改善连续性。
- **Token 估算** 会包含上下文记忆，以提高准确性。
- **高级选项** 可让您针对单次记忆生成临时覆盖提示词/配置文件行为。

![Memory generation with context](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 视觉反馈与辅助功能

- **按钮状态:** inactive、active、valid selection、in-scene、processing。

![Complete scene selection showing all visual states](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

- **辅助功能:** 键盘导航、焦点指示器、ARIA 属性、减少动画、移动端友好。

---

# FAQ

### 我应该为记忆单独创建一本世界书，还是可以使用已经用于其他用途的同一本世界书？

我建议让记忆世界书成为单独的一本书。这样更容易把记忆和其他条目分开管理。例如，将它添加到群聊、在另一个聊天中使用，或通过 STLO 设置单独的世界书预算。

### 我需要运行 Vectors 吗？

可以，但不是必需。如果您不使用 vectors 扩展（我也不用），Memory Books 会通过关键词工作。这是自动化的，所以您不需要自己考虑使用哪些关键词。

### 如果 Memory Books 是唯一的世界书，我应该使用 Delay until recursion 吗？

不应该。如果没有其他 World Info 或世界书，`Delay until recursion` 可能会阻止第一次循环触发，导致没有任何内容被激活。如果 Memory Books 是唯一的世界书，请禁用 `Delay until recursion`，或确保至少配置了一个额外的 World Info/世界书。

### 为什么 AI 看不到我的条目？

首先检查这些条目是否确实被发送了。我喜欢使用 [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) 来检查。

如果条目已经触发并发送给 AI，那可能需要在 OOC 中更明确地提醒 AI。例如：`[OOC: WHY are you not using the information you were given? Specifically: (whatever it was)]`

---

# Troubleshooting

- **我在 Extensions 菜单里找不到 Memory Books！**  
  设置位于 Extensions 菜单中（输入框左侧的魔法棒 🪄）。寻找 `Memory Books`。

![Location of STMB settings](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **没有可用或已选择的世界书:**
  - 在 Manual Mode 中，根据提示选择世界书。
  - 在 Automatic Mode 中，将世界书绑定到您的聊天。
  - 或启用 `Auto-create lorebook if none exists` 自动创建。

- **Lorebook Validation Error:**
  - 您很可能删除了之前绑定的世界书。只要绑定一个新的世界书即可；空白世界书也可以。

- **未选择场景:**
  - 同时标记开始（►）和结束（◄）点。

- **场景与现有记忆重叠:**
  - 选择不同范围，或在设置中启用 `Allow scene overlap`。

![Scene overlap warning](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI 未能生成有效记忆:**
  - 使用支持 JSON 输出的模型。
  - 检查提示词和模型设置。

- **超过 Token 警告阈值:**
  - 使用更小的场景，或提高阈值。

- **缺少箭头按钮:**
  - 等待扩展加载，或刷新页面。

- **角色数据不可用:**
  - 等待聊天/群组完全加载。

---

## 📚 配合 Lorebook Ordering (STLO) 提升体验

为了实现更高级的记忆组织和更深入的故事整合，请将 STMB 与 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20Simplified%20Chinese.md) 配合使用。请参阅该指南获取最佳实践、设置说明和技巧。

---

## 📝 字符策略 (v4.5.1+)

- **标题中允许:** 所有可打印 Unicode 字符，包括重音字母、emoji、CJK 和符号。
- **被阻止:** 只有 Unicode 控制字符（U+0000–U+001F、U+007F–U+009F）会被阻止；这些字符会自动移除。

请参阅 [Character Policy Details](../charset.md) 获取示例和迁移说明。

---

## 👨‍💻 面向开发者

### 构建扩展

此扩展使用 Bun 进行构建。构建过程会压缩并打包源文件。

```sh
# 构建扩展
bun run build
```

### Git hooks

项目包含一个 pre-commit hook，会自动构建扩展并把构建产物加入提交。这可以确保构建文件始终与源代码同步。

**安装 git hook:**

```sh
bun run install-hooks
```

该 hook 会：

- 在每次 commit 前运行 `bun run build`；
- 将构建产物加入 commit；
- 如果构建失败，则中止 commit。

---

*使用 VS Code/Cline、广泛测试和社区反馈精心开发。* 🤖💕
