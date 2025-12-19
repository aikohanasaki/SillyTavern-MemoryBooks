# 📕 Memory Books (SillyTavern 扩展)

这是一个下一代 SillyTavern (酒馆) 扩展，用于自动、结构化且可靠的记忆创建。你可以在聊天中标记场景，利用 AI 生成基于 JSON 的总结，并将它们作为“[向量化 (vectorized)](#vectorized)”条目存储在你的 Lorebook（世界书）中。支持群组聊天、高级配置文件管理，以及极其稳健的 API/模型处理机制。

从这里开始：
* ⚠️‼️请阅读 [先决条件](#-先决条件) 以获取安装注意事项（特别是如果你运行文本补全/Text Completion API）
* ❓ [常见问题 (FAQ)](#FAQ)
* 🛠️ [故障排除](#故障排除)

其他链接：
* 📘 [用户指南 (EN)](USER_GUIDE.md)
* 📋 [版本历史 & 更新日志](changelog.md)
* 💡 [结合 📚 Lorebook Ordering 使用 📕 Memory Books](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

---

### 📚 搭配 Lorebook Ordering (STLO) 增强功能

为了实现更高级的记忆组织和更深层次的故事整合，我们强烈建议将 STMB 与 [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md) 一起使用。请参阅指南了解最佳实践、设置说明和技巧！

> 注意：支持多种语言：请查看 [`/locales`](locales) 文件夹获取列表。国际/本地化的自述文件和用户指南可以在 [`/userguides`](userguides) 文件夹中找到。
> Lorebook 转换器和副提示词 (Side Prompt) 模板库位于 [`/resources`](resources) 文件夹中。

---

## 📋 先决条件

- **SillyTavern 版本：** 1.13.5+ (推荐最新版)
- ⚠️‼️**为所有用户安装：**‼️⚠️ 因为 STMB 复用了大量 ST 基础代码，请确保为所有用户安装该扩展，即安装位置应为 `/public/scripts/extensions/third-party/SillyTavern-MemoryBooks`。否则，函数导入将会失败。
- **场景选择：** 必须设置开始和结束标记（开始位置 < 结束位置）。
- **聊天补全 (Chat Completion) 支持：** 全面支持 OpenAI, Claude, Anthropic, OpenRouter 或其他聊天补全 API。
- **文本补全 (Text Completion) 支持：** 当通过聊天补全 (OpenAI 兼容) API 端点连接时，支持文本补全 API（Kobold, TextGen 等）。我建议按照下方的 KoboldCpp 提示设置聊天补全 API 连接（如果你使用 Ollama 或其他软件，请按需更改）。之后，设置一个 STMB 配置文件并使用自定义（推荐）或完全手动配置（仅当自定义失败或你有多个自定义连接时使用）。

### 📕 ST Memory Books 的 KoboldCpp 设置技巧
请在 ST 中按此设置（在成功运行 STMB 后，你可以切回文本补全模式）：
-API 选择 Chat Completion (聊天补全)
- 选择 Custom (自定义) 聊天补全源
- 端点地址设置为 `http://localhost:5001/v1` (也可以使用 `127.0.0.1:5000/v1`)
- 在 "custom API key" 中输入任何内容（这不重要，但 ST 要求必须填写）
- 模型 ID 必须是 `koboldcpp/modelname` (模型名称中不要包含 .gguf！)
- 下载一个聊天补全预设并导入它（任何预设都可以），仅仅是为了让你**拥有**一个聊天补全预设。这可以避免出现“不支持”的错误。

## 💡 推荐的全局世界信息 (World Info)/Lorebook 激活设置

- **Match Whole Words (全词匹配)：** 保持未选中 (false)
- **Scan Depth (扫描深度)：** 越高越好 (我的设置为 8)
- **Max Recursion Steps (最大递归步数)：** 2 (通用建议，非必须)
- **Context % (上下文百分比)：** 80% (基于 100,000 token 的上下文窗口) - 假设你没有超长的聊天记录或机器人。

---

## 🚀 入门指南

### 1. **安装与加载**
- 加载 SillyTavern 并选择一个角色或群组聊天。
- 等待聊天消息上出现箭头按钮 (► ◄)（可能需要长达 10 秒）。

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **标记场景**
- 点击场景第一条消息上的 ►。
- 点击最后一条消息上的 ◄。

![Visual feedback showing scene selection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **创建记忆**
- 打开扩展菜单（魔杖图标 🪄）并点击 "Memory Books"，或使用 `/creatememory` 斜杠命令。
- 如果出现提示，确认识别设置（配置文件、上下文、API/模型）。
- 等待 AI 生成并自动创建 Lorebook 条目。

---

## 🆕 斜杠命令快捷键

- `/creatememory` 使用现有的箭头开始/结束标记来创建记忆。
- `/scenememory x-y` 创建一个从消息 x 开始到消息 y 结束的记忆。
- `/nextmemory` 将所有自上次记忆以来的消息创建为一个新记忆。

## 👥 群聊支持

- 所有功能均适用于群组聊天。
- 场景标记、记忆创建和 Lorebook 集成均存储在群组元数据中。
- 无需特殊设置——只需选择群组聊天并正常使用即可。

---

## 🧭 操作模式

### **自动模式 (默认)**
- **工作原理：** 自动使用当前绑定到你聊天的 Lorebook。
- **适用场景：** 简单快捷。大多数用户应该从这里开始。
- **如何使用：** 确保在你的角色或群组聊天的“聊天 Lorebooks”下拉菜单中选择了一个 Lorebook。

![Chat lorebook binding example](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **自动创建 Lorebook 模式** ⭐ *v4.2.0 新增*
- **工作原理：** 当不存在 Lorebook 时，使用你的自定义命名模板自动创建并绑定一个新的 Lorebook。
- **适用场景：** 新用户和快速设置。非常适合一键创建 Lorebook。
- **如何使用：**
  1. 在扩展设置中启用 "Auto-create lorebook if none exists" (若不存在则自动创建 Lorebook)。
  2. 配置你的命名模板（默认："LTM - {{char}} - {{chat}}"）。
  3. 当你在没有绑定 Lorebook 的情况下创建记忆时，系统会自动创建一个并绑定。
- **模板占位符：** {{char}} (角色名), {{user}} (你的名字), {{chat}} (聊天 ID)
- **智能编号：** 如果存在重复名称，自动添加编号 (2, 3, 4...)。
- **注意：** 不能与手动 Lorebook 模式同时使用。

### **手动 Lorebook 模式**
- **工作原理：** 允许你为每个聊天的记忆选择一个不同的 Lorebook，忽略主要绑定的聊天 Lorebook。
- **适用场景：** 希望将记忆定向到特定、独立 Lorebook 的高级用户。
- **如何使用：**
  1. 在扩展设置中启用 "Enable Manual Lorebook Mode" (启用手动 Lorebook 模式)。
  2. 首次在聊天中创建记忆时，系统会提示你选择一个 Lorebook。
  3. 该选择将针对该特定聊天保存，直到你清除它或切回自动模式。
- **注意：** 不能与自动创建 Lorebook 模式同时使用。

---

## 📝 记忆生成

### **仅限 JSON 输出**
所有提示词和预设**必须**指示 AI 仅返回有效的 JSON，例如：

```json
{
  "title": "简短的场景标题",
  "content": "场景的详细总结...",
  "keywords": ["关键词1", "关键词2"]
}

```

**回复中不允许包含其他文本。**

### **内置预设**

1. **Summary (总结)：** 详细的逐个节拍 (beat-by-beat) 总结。
2. **Summarize (概述)：** 使用 Markdown 标题分为时间线、节拍、互动、结果。
3. **Synopsis (大纲)：** 全面、结构化的 Markdown。
4. **Sum Up (归纳)：** 包含时间线的简洁节拍总结。
5. **Minimal (极简)：** 1-2 句总结。

### **自定义提示词**

* 你可以创建自己的提示词，但**必须**如上所示返回有效的 JSON。

---

## 📚 Lorebook 集成

* **自动条目创建：** 新记忆将作为包含所有元数据的条目存储。
* **基于标记的检测：** 只有带有 `stmemorybooks` 标记的条目才会被识别为记忆。
* **自动编号：** 支持多种格式 (`[000]`, `(000)`, `{000}`, `#000`) 的顺序、补零编号。
* **手动/自动排序：** 每个配置文件的插入顺序设置。
* **编辑器刷新：** 添加记忆后可选择自动刷新 Lorebook 编辑器。

> **现有的记忆必须进行转换！**
> 使用 [Lorebook 转换器](https://www.google.com/search?q=/resources/lorebookconverter.html) 添加 `stmemorybooks` 标记和所需字段。

---

### 🎡 Side Prompts (辅助提示词)

Side Prompts 可以像追踪器一样使用，并将在你的记忆 Lorebook 中创建条目。

* **访问：** 从 Memory Books 设置中，点击 “🎡 Side Prompt Manager”。
* **功能：**
* 查看所有辅助提示词。
* 创建新的或复制提示词以尝试不同的提示词风格。
* 编辑或删除任何预设（包括内置预设）。
* 将预设导出和导入为 JSON 文件以进行备份或分享。
* 手动运行它们，或随记忆创建自动运行。


* **使用技巧：**
* 创建新提示词时，为了获得最佳兼容性，可以从内置提示词复制。
* 额外的辅助提示词模板库 [JSON 文件](https://www.google.com/search?q=resources/SidePromptTemplateLibrary.json) - 导入即可使用



---

### 🧠 用于高级定制的 Regex (正则) 集成

* **完全控制文本处理**：Memory Books 现在集成了 SillyTavern 的 **Regex (正则表达式)** 扩展，允许你在两个关键阶段应用强大的文本转换：
1. **提示词生成 (Prompt Generation)**：通过创建针对 **User Input (用户输入)** 位置的正则脚本，自动修改发送给 AI 的提示词。
2. **响应解析 (Response Parsing)**：通过针对 **AI Output (AI 输出)** 位置，在保存 AI 的原始响应之前对其进行清理、重新格式化或标准化。


* **多选支持**：现在支持多选正则脚本。所有启用的脚本将在每个阶段（提示词生成和响应解析）按顺序应用，允许进行高级且灵活的转换。
* **工作原理**：集成是无缝的。只需在 Regex 扩展中创建并启用（多选）你想要的脚本，Memory Books 将在记忆和辅助提示词创建过程中自动应用它们。

---

## 👤 配置文件管理

* **配置文件：** 每个配置文件包含 API、模型、温度、提示词/预设、标题格式和 Lorebook 设置。
* **导入/导出：** 以 JSON 格式分享配置文件。
* **创建配置：** 使用高级选项弹窗保存新配置文件。
* **按配置覆盖：** 临时切换 API/模型/温度以用于记忆创建，然后恢复原始设置。

---

## ⚙️ 设置与配置

### **全局设置**

[Youtube 上的简短视频概览](https://youtu.be/mG2eRH_EhHs)

* **Manual Lorebook Mode (手动 Lorebook 模式)：** 启用以按聊天选择 Lorebook。
* **Auto-create lorebook if none exists (若无则自动创建 Lorebook)：** ⭐ *v4.2.0 新增* - 使用你的命名模板自动创建并绑定 Lorebook。
* **Lorebook Name Template (Lorebook 命名模板)：** ⭐ *v4.2.0 新增* - 使用 {{char}}, {{user}}, {{chat}} 占位符自定义自动创建的名称。
* **Allow Scene Overlap (允许场景重叠)：** 允许或阻止重叠的记忆范围。
* **Always Use Default Profile (总是使用默认配置)：** 跳过确认弹窗。
* **Show memory previews (显示记忆预览)：** 启用预览弹窗，以便在添加到 Lorebook 之前审查和编辑记忆。
* **Show Notifications (显示通知)：** 切换 Toast 消息提示。
* **Refresh Editor (刷新编辑器)：** 记忆创建后自动刷新 Lorebook 编辑器。
* **Token Warning Threshold (Token 警告阈值)：** 设置大型场景的警告级别（默认：30,000）。
* **Default Previous Memories (默认前序记忆)：** 包含作为上下文的先前记忆数量 (0-7)。
* **Auto-create memory summaries (自动创建记忆总结)：** 启用按间隔自动创建记忆。
* **Auto-Summary Interval (自动总结间隔)：** 多少条消息后自动创建记忆总结（10-200，默认：100）。
* **Memory Title Format (记忆标题格式)：** 选择或自定义（见下文）。

### **配置文件字段**

* **Name (名称)：** 显示名称。
* **API/Provider (API/提供商)：** openai, claude, custom 等。
* **Model (模型)：** 模型名称 (如 gpt-4, claude-3-opus)。
* **Temperature (温度)：** 0.0–2.0。
* **Prompt or Preset (提示词或预设)：** 自定义或内置。
* **Title Format (标题格式)：** 每个配置文件的模板。
* **Activation Mode (激活模式)：** Vectorized (向量化), Constant (常驻), Normal (普通)。
* **Position (位置)：** ↑Char, ↓Cha, ↑EM, ↓EM, ↑AN, Outlet (及字段名)。
* **Order Mode (排序模式)：** 自动/手动。
* **Recursion (递归)：** 阻止/延迟递归。

---

## 🏷️ 标题格式化

使用强大的模板系统自定义你的 Lorebook 条目标题。

* **占位符：**
* `{{title}}` - AI 生成的标题（例如："命运的相遇"）。
* `{{scene}}` - 消息范围（例如："Scene 15-23"）。
* `{{char}}` - 角色名称。
* `{{user}}` - 你的用户名。
* `{{messages}}` - 场景中的消息数量。
* `{{profile}}` - 用于生成的配置文件名称。
* 各种格式的当前日期/时间占位符（例如：`August 13, 2025` 表示日期，`11:08 PM` 表示时间）。


* **自动编号：** 使用 `[0]`, `[00]`, `(0)`, `{0}`, `#0`，以及现在支持的包裹形式如 `#[000]`, `([000])`, `{[000]}` 进行顺序、补零编号。
* **自定义格式：** 你可以创建自己的格式。截至 v4.5.1，标题中允许使用所有可打印的 Unicode 字符（包括表情符号、中日韩字符、重音符号、符号等）；仅阻止 Unicode 控制字符。

---

## 🧵 上下文记忆

* **包含最多 7 个之前的记忆**作为上下文，以获得更好的连续性。
* **Token 估算**包含上下文记忆以确保准确性。

---

## 🎨 视觉反馈 & 辅助功能

* **按钮状态：**
* 未激活、激活、有效选择、场景中、处理中。


* **辅助功能：**
* 键盘导航、焦点指示器、ARIA 属性、减少动画、移动端友好。



---

# FAQ (常见问题)

### 我在扩展菜单里找不到 Memory Books！

设置位于扩展菜单中（输入框左侧的魔杖图标 🪄）。寻找 "Memory Books"。

### 我需要运行向量 (vectors) 吗？

世界信息 (World Info) 中的 🔗 条目在 ST 的界面中被命名为 "vectorized"（向量化）。这就是为什么我使用“vectorized”这个词。如果你不使用 vectors 扩展（我也不用），它是通过关键词工作的。这一切都是自动化的，所以你不必考虑使用什么关键词。

### 我应该为记忆制作一个单独的 Lorebook，还是可以使用我已经用于其他用途的 Lorebook？

我建议你的记忆 Lorebook 应是一本单独的书。这使得组织记忆（相对于其他条目）更容易。例如，将其添加到群聊中、在另一个聊天中使用它，或设置单独的 Lorebook 预算（使用 STLO）。

### 如果 Memory Books 是唯一的 Lorebook，我应该使用 'Delay until recursion' (延迟直到递归) 吗？

不。如果没有其他世界信息或 Lorebook，选择 'Delay until recursion' 可能会阻止第一次循环触发，导致没有任何内容被激活。如果 Memory Books 是唯一的 Lorebook，请禁用 'Delay until recursion' 或确保配置了至少一个额外的世界信息/Lorebook。

---

# 故障排除

* **没有可用或选定的 Lorebook：**
* 在手动模式下，根据提示选择一个 Lorebook。
* 在自动模式下，绑定一个 Lorebook 到你的聊天。
* 或者启用 "Auto-create lorebook if none exists" 进行自动创建。


* **未选择场景：**
* 标记开始 (►) 和结束 (◄) 点。


* **场景与现有记忆重叠：**
* 选择不同的范围，或在设置中启用 "Allow scene overlap" (允许场景重叠)。


* **AI 无法生成有效记忆：**
* 使用支持 JSON 输出的模型。
* 检查你的提示词和模型设置。


* **超过 Token 警告阈值：**
* 使用较小的场景范围，或增加阈值。


* **缺少箭头按钮：**
* 等待扩展加载，或刷新页面。


* **角色数据不可用：**
* 等待聊天/群组完全加载。



---

## 📝 字符策略 (v4.5.1+)

* **标题中允许：** 允许所有可打印的 Unicode 字符，包括重音字母、表情符号、中日韩字符和符号。
* **阻止：** 仅阻止 Unicode 控制字符 (U+0000–U+001F, U+007F–U+009F)；这些会被自动移除。

## 请参阅 [字符策略详情](https://www.google.com/search?q=charset.md) 了解示例和迁移说明。

*用爱开发，使用 VS Code/Cline，经过广泛测试和社区反馈。* 🤖💕
