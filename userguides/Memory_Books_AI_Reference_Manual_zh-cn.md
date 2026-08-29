<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books：完整 AI 参考手册

**产品：** SillyTavern Memory Books (STMB)  
**参考版本：** v8.5.0，2026 年 8 月 1 日  
**用途：** 为教授、解释和排查 Memory Books 问题的 AI 助手提供单一、密集且权威的事实来源。

---

## 目录

- [1. AI 助手应如何使用本手册](#1-ai-助手应如何使用本手册)
- [2. 产品定义与心智模型](#2-产品定义与心智模型)
- [3. 核心术语与功能选择](#3-核心术语与功能选择)
- [4. 要求、安装与首次验证](#4-要求安装与首次验证)
- [5. 打开 Memory Books 并理解主面板](#5-打开-memory-books-并理解主面板)
- [6. Memory Book 存储模式](#6-memory-book-存储模式)
- [7. 设定档案、连接与生成路由](#7-设定档案连接与生成路由)
- [8. 场景、手动记忆、自动记忆与 Catch-up](#8-场景手动记忆自动记忆与-catch-up)
- [9. Token 节省、隐藏讯息与记忆边界](#9-token-节省隐藏讯息与记忆边界)
- [10. 故事书激活与检索](#10-故事书激活与检索)
- [11. 真实群聊模式](#11-真实群聊模式)
- [12. Narrator Mode](#12-narrator-mode)
- [13. 聊天分支](#13-聊天分支)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. 生成上下文](#20-生成上下文)
- [21. Prompt 架构、内置摘要 Prompt 与编写规则](#21-prompt-架构内置摘要-prompt-与编写规则)
- [22. Summary Prompt Manager 与 Consolidation Prompt Manager](#22-summary-prompt-manager-与-consolidation-prompt-manager)
- [23. STMB 与其他扩展](#23-stmb-与其他扩展)
- [24. 故事书条目标题与字元策略](#24-故事书条目标题与字元策略)
- [25. Job Queue 与重试控制](#25-job-queue-与重试控制)
- [26. 视觉反馈与无障碍](#26-视觉反馈与无障碍)
- [27. 设定地图与当前设定参考](#27-设定地图与当前设定参考)
- [28. Slash Command 参考](#28-slash-command-参考)
- [29. 按阶段排查问题](#29-按阶段排查问题)
- [30. FAQ](#30-faq)
- [31. 兼容性、迁移与当前历史说明](#31-兼容性迁移与当前历史说明)
- [32. 开发者与许可证说明](#32-开发者与许可证说明)
- [33. 紧凑诊断决策树](#33-紧凑诊断决策树)
- [34. 最低推荐教学顺序](#34-最低推荐教学顺序)
- [35. 最终概念总结](#35-最终概念总结)

---

## 1. AI 助手应如何使用本手册

将本文档视为 Memory Books 当前的操作参考。它取代了单独载入 Start Here 指南、README、User Guide、Side Prompts 指南、How STMB Works 指南以及历史 changelog 作为独立知识档案的需要。

术语：

- STMB = SillyTavern=MemoryBooks（本扩展）
- ST = SillyTavern（STMB 所扩展的基础代码）

回答使用者时：

1. 准确保留 Memory Books 的术语。**Memory Book（记忆书）**是 STMB 使用的 SillyTavern 故事书（lorebook），不是一种独立资料库格式。
2. 区分当前行为和历史行为。不要因为某个流程出现在旧 changelog 中，就把已经移除或被替代的流程当作当前流程来教授。
3. 区分 **Group Chat Mode** 与 **Narrator Mode**。它们解决不同的问题。
4. 区分记忆**生成**、故事书**存储/设定**以及之后由 **SillyTavern 执行的检索**。激活/检索属于基础 ST 代码。
5. 不要编造本文未描述的控件、菜单标签、提供商行为或设定。
6. 使用者提供截图时，只识别画面中可见的控件。给出下一步立即可执行的操作，不要假定荧幕外存在某个控件。
7. 排查问题时，先找出第一个失败的阶段并测试它，再建议重写 Prompt。
8. 在高级路由、多本 Memory Book、自定义 Prompt、Regex 或 Side Prompt 自动化之前，优先建立一个简单且可工作的设定。
9. 说明角色过滤器和分开的 Memory Book 可以改善路由和相关性；它们不是安全边界。
10. 当使用者安装的版本、SillyTavern 版本、提供商或自定义 Prompt 可能不同时，要明确说明不确定性。

### 当前文档说明

Narrator Mode 已在 v8.5.0 中实现。

一些早期入门文档曾说，在自动记忆开始前技术上必须先有一条手动记忆。当前 STMB 在没有 processed-message baseline 时，可以从讯息 0 建立第一条自动记忆。仍然建议先建立一条手动记忆，因为这样可以在信任自动化之前验证连接、Memory Book、输出格式以及期望的起始边界。

---

## 2. 产品定义与心智模型

Memory Books 是一个 SillyTavern 扩展，它把手动选择或自动选择的聊天范围转换为结构化记忆条目，并存储在 SillyTavern 故事书中。

基本流程如下：

```text
聊天讯息
    ↓
STMB 选择或接收一个讯息范围
    ↓
STMB 组装 AI 请求
    ↓
模型返回结构化记忆
    ↓
STMB 储存一个故事书条目
    ↓
已处理的旧聊天讯息可以从活动上下文中隐藏
    ↓
SillyTavern 之后激活相关的故事书条目
    ↓
聊天模型收到这些条目作为上下文
```

STMB 并不会让模型获得永久的内部记忆。它维护的是一个外部参考系统（故事书条目）。当 SillyTavern 把相关故事书条目包含进发送给 AI 的 Prompt 时，聊天模型才表现为“记得”这些内容。

### 三个独立阶段

1. **生成质量** — 记忆生成模型是否产出了准确、有用的结果？
2. **存储与设定** — 结果是否被储存到目标 Memory Book，并带有合适的激活设定？
3. **检索与模型使用** — SillyTavern 是否激活并发送了该条目，聊天模型又是否正确使用它？

排查时要把这三个阶段分开。

### 故事书与 Memory Books

**Lorebook（故事书）**，在 SillyTavern 的部分界面中也称为 **World Info**，是一组 SillyTavern 可以按条件加入模型请求的条目。一个故事书条目通常包含：

- 标题/注释；
- 内容；
- 激活关键词或另一种激活模式；
- 插入位置与顺序；
- 递归和预算控制；
- 可选角色过滤器及其他元资料。

**Memory Book（记忆书）**就是被 STMB 使用的普通 SillyTavern 故事书。可以用普通故事书工具打开、编辑、重新排序、汇出、汇入或删除它。根据使用的功能，它可能包含：

- 场景 Memories；
- Arc、Chapter、Book、Legend、Series 或 Epic 摘要；
- Clip 与 Topical Clip 条目；
- Side Prompt tracker 条目；
- 其他由 STMB 管理的条目。

### 记忆条目是压缩后的上下文

场景 Memory 不是原始聊天记录，而是为保留连续性所需资讯而制作的压缩表示，例如：

- 事件与后果；
- 决策与计划；
- 发现与揭示；
- 关系或情绪变化；
- 各角色知道、相信或误解的内容；
- 重要物件、地点、身份、承诺和限制。

隐藏已处理讯息不会删除它们。它只是阻止这些讯息继续被发送给 AI，从而不再持续占用活动聊天历史上下文。

---

## 3. 核心术语与功能选择

| 需求 | 功能 | 含义 |
|---|---|---|
| 总结一个手选或自动选取的聊天范围 | **Memory** | “记住这个场景发生了什么。” |
| 储存选中的聊天原文或一个事实 | **Clip** | “储存这条笔记。” |
| 从已储存 Memories 中收集某个主题的资讯 | **Topical Clip** | “收集我的 Memories 对这个主题所说的一切。” |
| 在多次运行中维护会变化的资讯 | **Side Prompt** | “持续更新这个 tracker。” |
| 合并若干低层级 Memory 或摘要 | **Consolidation** | “把这些条目汇总成更高层级回顾。” |
| 缩短一个现有 STMB 管理条目 | **Compaction** | “在不丢事实的前提下精简这个条目。” |
| 使用原始来源替换现有条目 | **Regeneration** | “重新构建这个条目，并审核替换内容。” |

### 使用者经常混淆的功能区别

- **Clip vs Topical Clip：** Clip 从当前聊天中高亮的文字开始；Topical Clip 从已经确认的 STMB Memories 开始。
- **Topical Clip vs Side Prompt：** Topical Clip 是手动运行来收集某个主题；Side Prompt 可以反复维护一个会变化的 tracker。
- **Compaction vs Consolidation：** Compaction 重写一个条目；Consolidation 用多个条目建立新的高层级摘要。
- **Memory vs Side Prompt：** Memories 通常是按顺序排列的场景记录；Side Prompts 通常更新或覆盖同一份持续维护的支援文档。
- **生成 vs 检索：** 建立一个条目并不保证 SillyTavern 之后一定会激活它。

---

## 4. 要求、安装与首次验证

### 要求

- SillyTavern 1.18.0 或更高版本；建议使用最新兼容版本。
- 一个正常工作的 AI 连接。
- 一个能遵循指令的模型；对于 Memory 和 Consolidation 工作流，还必须能返回有效 JSON。
- 允许安装第三方 SillyTavern 扩展。
- 如果通过 OpenAI 兼容的 Chat Completion 端点使用本地或 Text Completion 后端，SillyTavern 中必须有可用的 Chat Completion preset。

### 普通 Chat Completion 使用者

OpenAI、Anthropic/Claude、OpenRouter、Gemini/Google 和其他 Chat Completion 连接通常可以直接使用内置的 **Current SillyTavern Settings** 设定档案。

### 本地与 Text Completion 使用者

KoboldCpp、llama.cpp、TextGen、Ollama 等后端通常在通过 OpenAI 兼容 Chat Completion 端点暴露时最可靠。即使正常角色扮演使用 Text Completion，SillyTavern 仍必须为 STMB 准备一个 Chat Completion preset。

典型 KoboldCpp 设定：

- API type：Chat Completion；
- source：Custom OpenAI-compatible；
- 端点，例如 `http://localhost:5001/v1` 或 `http://127.0.0.1:5000/v1`；
- 如果 SillyTavern 要求，自定义 API key 只需非空即可；
- model ID 使用端点期望的格式，常见为 `koboldcpp/modelname`，不要无必要地附加 `.gguf`；
- 汇入 Chat Completion preset；
- response length 至少 2048 tokens，4096 通常更稳妥。

典型 llama.cpp 设定：

- API type：Chat Completion；
- source：Custom OpenAI-compatible；
- 端点 `http://localhost:8080/v1`，如果 SillyTavern 运行在 Docker 中，则使用 `http://host.docker.internal:8080/v1`；
- 如 SillyTavern 要求，填入任意非空 API key；
- 使用已提供服务的 model ID；
- 除非端点要求，否则不要使用 prompt post-processing。

示例伺服器命令：

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### 可选 Chat Top Bar

没有 Chat Top Bar / Chat Top Info Bar，STMB 仍可工作。安装后会增加 **Memory Books Jobs** 伫列界面，可查看活动、完成、失败、取消、阻塞及等待审核的任务。

### 安装

1. 打开 SillyTavern。
2. 打开主 **Extensions** 面板。
3. 选择 **Install Extension**。
4. 安装官方 Memory Books 仓库。
5. 如果提示，重新载入 SillyTavern。
6. 打开一个角色聊天或群聊。
7. 等待几秒，让 STMB 控件初始化。

不需要 SillyTavern Extras。

### 确认 STMB 已载入

至少应出现以下一项：

- 聊天输入框旁魔法棒 Extensions 菜单中的 **Memory Books**；
- 展开的讯息操作中的场景箭头 **►** 和 **◄**。

如果两者都没有：

1. 等待最多十秒；
2. 重新整理页面；
3. 确认扩展已安装并启用；
4. 重新打开一个角色聊天或群聊；
5. 只有在这些基础检查失败后才查看浏览器控制台。

---

## 5. 打开 Memory Books 并理解主面板

打开聊天输入框附近的魔法棒 Extensions 菜单，然后选择 **Memory Books**。

面板可能包括：

- Current Scene；
- Memory Status / highest processed message；
- Current Lorebook Configuration；
- Memory Profiles；
- Profile Actions；
- Extra Function Buttons；
- Prompt Managers；
- General Settings；
- Automatic Memories；
- Token Saving；
- 在相关聊天中显示的群聊角色或 Narrator 控件。

第一次建立 Memory 只需要决定三件事：

1. 哪个 Memory Book 接收条目？
2. 哪个设定档案/连接负责生成？
3. 哪些聊天讯息构成场景？

---

## 6. Memory Book 存储模式

### 6.1 Automatic Mode：聊天绑定 Memory Book

Automatic Mode 是正常预设方式。STMB 使用 SillyTavern 绑定到当前聊天的故事书。

适合：

- 一个聊天只有一个主要 Memory Book；
- 希望设定最少；
- 群聊角色不需要各自独立的 Memory Book。

如果没有绑定故事书，可以在 SillyTavern 中绑定一本，或使用 Auto-Create。

### 6.2 Auto-Create Lorebook Mode

启用 **Auto-create lorebook if none exists** 后，如果首次储存 Memory 时没有故事书，STMB 会建立并绑定一本。

预设命名模板可以使用：

- `{{char}}` — 角色或群组名；
- `{{user}}` — 使用者名；
- `{{chat}}` — 聊天 ID/名称。

必要时 STMB 会添加数字后缀以避免重名。

Auto-Create 与 Manual Lorebook Mode 互斥。

### 6.3 Manual Lorebook Mode

启用 **Manual Lorebook Mode** 后，可以独立于聊天当前绑定的故事书选择 Memory Book。

适合：

- Memories 必须存放在专用故事书中；
- 多个聊天有意共享同一本 Memory Book；
- 群成员需要各自独立的书；
- 使用 Narrator Mode；
- 使用者理解之后的激活方案。

主手动 Memory Book 的选择储存在当前聊天中，除非兼容的单人聊天里有持久角色锁覆盖它。

### 6.4 单独的 Memory Book 通常更清晰

专用 Memory Book 更容易：

- 将 Memories 与角色定义和世界设定分离；
- 设定独立的故事书预算和顺序；
- 重用或汇出记忆历史；
- 在没有无关 lore 的情况下检查 STMB 管理条目；
- 诊断激活问题。

这是建议，而不是强制要求。

### 6.5 Character Memory Book locks

Character Memory Book lock 是附着在角色卡上的持久 Manual Mode 分配。

单人聊天中：

- 未锁定的手动书属于当前聊天；
- 锁定的书会跟随角色卡进入兼容的 Manual Mode 聊天；
- 解除锁定前不能更改手动书。

真实群聊中：

- 未锁定的每角色分配属于当前群聊；
- 已锁定的每角色分配会跟随角色卡进入兼容的 Manual Mode 群组；
- 如果锁定的书丢失，会出现 broken-lock 状态，必须解锁或修复。

只有在同一角色应当有意跨故事共享同一本持续 Memory Book 时才使用锁。对于平行世界或互不相关的时间线，这很危险。

### 6.6 推荐起始布局

- 单人聊天：一本聊天绑定或自动建立的 Memory Book。
- 真实群聊：一本群组 Memory Book。
- Narrator chat：按照 Narrator Mode 要求，一本全知 Memory Book，加上每个声明角色各一本独立书。

---

## 7. 设定档案、连接与生成路由

Memory Books 设定档案同时控制生成行为和最终故事书条目设定。

### 7.1 推荐的第一个设定档案

先使用 **Current SillyTavern Settings**。它使用 SillyTavern 当前活动的提供商、模型和 temperature。

不要一开始就重写 Prompt 或设定 Full Manual endpoint。先证明能够成功生成并储存一条 Memory。

### 7.2 为什么建立储存的 STMB 设定档案

当需要以下情况时再建立独立设定档案：

- Memories 使用更便宜或更可靠的模型；
- 使用与角色扮演不同的提供商；
- 绑定一个命名 Custom connection；
- 选择自定义 summary prompt；
- 使用不同的 temperature 或最大输出行为；
- 更改标题格式；
- 更改激活、插入、顺序或递归设定；
- 使用分开的 group/omniscient 与 character-focused prompts。

### 7.3 设定档案字段

一个设定档案可能包括：

- 显示名称；
- API/provider；
- model ID；
- temperature；
- Summary Prompt preset；
- 可选的独立多角色 prompts；
- structured-output 行为；
- 可选 SillyTavern ChatCompletionService 路由；
- 可选 Chat Completion preset；
- reverse-proxy 行为；
- title format；
- activation mode：Normal、Constant 或 Vectorized；
- insertion position，包括 character、example-message、author’s-note 与 Outlet 位置；
- 适用时的 Outlet name；
- 自动或手动 order 值；
- Prevent Recursion；
- Delay Until Recursion。

### 7.4 命名 Custom OpenAI-compatible 连接

Custom OpenAI-compatible 设定档案可以：

- 使用当前活动的 SillyTavern Custom connection；或
- 绑定 SillyTavern Connection Manager 中某个命名 Custom connection。

命名连接提供储存的 URL 与 secret。STMB 设定档案中的 model 字段仍是 model override。如果该命名连接被删除，或不再是 Custom Chat Completion connection，STMB 会阻止请求，而不会静默路由到别处。

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** 可以阻止 STMB 向拒绝 structured-output schema 的提供商发送 schema。模型仍必须返回所选 Memory 或 Consolidation Prompt 要求的有效 JSON。

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** 会把受支援的设定档案请求经 SillyTavern 的 request helper 发送，并可应用所选的 SillyTavern Chat Completion preset。OpenRouter 请求还会继承 SillyTavern 的 provider order、quantization filters、fallback controls 和 middle-out routing 设定。

如果 ChatCompletionService 失败，而 STMB 通过 fallback request path 重试，这些 OpenRouter 控件仍然有效。如果 fallback 也失败，STMB 会保留并报告最初的 ChatCompletionService 错误与后续 provider 响应。Full Manual 设定档案不使用此路由。

### 7.7 Reverse proxy 与 Full Manual Configuration

**Use reverse proxy** 会为受支援提供商转发 SillyTavern 已设定的 reverse-proxy 资讯。

**Full Manual Configuration** 在 STMB 设定档案内单独存储 endpoint 与 key。它属于特殊路径。一般情况下应优先使用已经在 SillyTavern 中设定并测试过的 provider 或 Custom connection。

### 7.8 输出长度

全局 STMB maximum response-token 设定可以覆盖 Memory Books 工作的正常 Chat Completion 输出长度。JSON 被截断是生成失败的常见原因。先增加输出长度，再考虑弱化 schema 或 Prompt。

---

## 8. 场景、手动记忆、自动记忆与 Catch-up

### 8.1 什么是场景

**Scene（场景）**是 STMB 处理为一条 Memory 的、首尾都包含在内的聊天讯息范围。

好的边界通常包含一个完整单元：

- 一项事件；
- 一段对话；
- 一步调查；
- 一次情感或关系发展；
- 一次地点或目标变化；
- 一组相互关联的行动。

非常小且琐碎的范围可能价值很低。非常大的范围成本更高、难以总结、可能超出上下文，并经常混合互不相关的事件。

### 8.2 手动标记场景

1. 展开讯息操作，通常通过三点或类似控件。
2. 在第一条要包含的讯息上点选 **►**。
3. 在最后一条要包含的讯息上点选 **◄**。
4. 打开 Memory Books，确认显示的 start、end、speakers、message count 和 token estimate。

两个边界讯息都包含在范围内。

使用 **Clear Scene** 移除选择，或选择新的 start/end marker 来替换其中一个边界。

### 8.3 建立手动 Memory

1. 确认场景。
2. 确认有效 Memory Book。
3. 确认所选设定档案。
4. 点选 **Create Memory**，或使用 `/creatememory`。
5. 如果出现 confirmation、token warning、participant confirmation 或 preview 窗口，进行审核。
6. 批准结果。
7. 确认故事书中出现新条目，并且 Memory Status 已推进到场景结束讯息。

有效 Memory 通常包含：

- title；
- content；
- keywords；
- STMB 元资料，包括 source range 与 chat identity。

### 8.4 Memory previews

启用 **Show memory previews** 时，可以审核并按需编辑：

- title；
- memory content；
- keywords。

检查姓名、归属、事实、遗漏后果和无关评论。关闭 preview 时，有效结果会自动储存。

### 8.5 Automatic Memories

启用 **Auto-create memory summaries** 并设定：

- **Auto-Summary Interval** — 每条自动 Memory 处理的新讯息数；
- **Auto-Summary Buffer** — 保留在最新端、不立即总结的讯息数，以避免场景尚未结束就被总结。

示例：

```text
Interval: 30
Buffer: 2
```

STMB 会等到 processed boundary 之后至少有 32 条讯息，然后建立一条 Memory，结束点为最新讯息之前 2 条。

如果不存在 processed baseline，当前 STMB 将 baseline 视为 `-1`，可从讯息 0 开始。仍建议第一条 Memory 手动建立，以验证设定并有意识地选择起始点。

较低 interval 会生成更聚焦的 Memories，但请求更多。较高 interval 会生成较少但更大的 Memories，也更容易把无关材料混在一起。详细角色扮演可以从约 20–40 条开始，短而快的交流可从 40–60 条开始。

如果所需 Memory Book 尚未分配，自动生成可能被推迟。

### 8.6 Processed-message baseline

STMB 为每个聊天储存最高已处理讯息。它决定：

- `/nextmemory` 从哪里开始；
- 自动 Memories 从哪里开始；
- memory-boundary indicator；
- 哪些讯息视为已经处理。

使用：

- `/stmb-highest` 显示；
- `/stmb-set-highest <N>` 手动设定；
- `/stmb-set-highest none` 清除。

手动修改必须谨慎，否则可能跳过或重复范围。

### 8.7 为已有长聊天进行 Catch-up

使用：

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

示例：

```text
/stmb-catchup interval=40 start=0 end=245
```

范围首尾都包含。chunk 连续处理；最后一块可以更小。

Catch-up 被设计为非交互式。运行前：

- 选择并测试目标设定档案；
- 启用 **Always use default profile**；
- 禁用 **Show memory previews**；
- 确认有效 Memory Book 已存在，或在 Automatic Mode 中允许 Auto-Create；
- 修复所有必须的多角色书分配；
- 选择低于 token-warning threshold 的 chunk size。

STMB 会预检所有 chunk，按顺序处理，并在第一次失败或 `/stmb-stop` 时停止。此前成功的 chunk 保持已储存状态。从第一条未完成讯息恢复，而不是重跑整个范围。

Catch-up 适合大范围转换；如果文学或事件边界很重要，手动场景边界仍更好。

---

## 9. Token 节省、隐藏讯息与记忆边界

### 9.1 隐藏不是删除

隐藏讯息仍然存在于聊天档案中，只是在重新显示前不会进入活动聊天上下文。

### 9.2 Auto-hide 模式

**Auto-hide messages after adding memory** 可以设定为：

- Do not auto-hide；
- Auto-hide all messages up to the last Memory；
- Auto-hide only messages in the last Memory。

**Messages to leave unhidden** 会在边界附近保留少量最近讯息作为重叠。

> **使用 Presence 扩展时：** Presence 与 STMB 都会修改 SillyTavern 共享的消息可见性状态，因此 Presence 之后可能会重新显示被 STMB 隐藏的消息。配置说明请参阅 [STMB 与其他扩展](#23-stmb-与其他扩展)。

### 9.3 生成前取消隐藏

**Unhide hidden messages for memory generation** 会在 STMB 编译选中范围前把它显示出来。适用于重新生成或再次处理之前已经隐藏的范围。成功储存后，所选 auto-hide 模式决定哪些讯息再次隐藏。

### 9.4 Memory-boundary indicator

该指示器使用 highest processed message 显示已处理历史结束与未处理聊天开始的位置。

模式：

- Off；
- Memory boundary divider；
- 可拖动 jump button；
- divider + jump button。

jump button 会滚动到第一条未处理讯息附近，并记住拖动后的荧幕位置。

### 9.5 良好的学习设定

一个实用的初始设定：

- 显示 boundary divider 与 jump button；
- 保留 2 条讯息不隐藏；
- 启用 generation 前临时 unhide；
- 在使用者确认 Memory 正确储存前先不启用 auto-hide；
- 之后切换为隐藏全部已处理讯息，以获得主要 token 节省收益。

---

## 10. 故事书激活与检索

### 10.1 Keywords

普通 Memories 常通过 keyword 触发。好的关键词应具体、独特：

- 角色姓名与别名；
- 命名地点或组织；
- 重要物件；
- 事件名称；
- 标识符；
- 特定发现或行动。

`important event`、`conversation`、`secret` 等宽泛关键词太模糊。

Memory 内容决定模型学到什么；keywords 主要帮助 SillyTavern 决定何时检索它。

### 10.2 Activation modes

- **Normal：** keyword/rule 驱动激活。
- **Constant：** 始终活动，但仍受适用预算和条目控制约束。
- **Vectorized：** 当使用者设定支援时使用向量相关检索。

Vectors 是可选项。没有 Vectors 扩展，STMB 仍可通过 keywords 工作。

### 10.3 推荐全局 World Info 设定

常见起点建议：

- Match Whole Words：off；
- Scan Depth：相对高，例如 8；
- Max Recursion Steps：约 2；
- Context percentage：根据总上下文和其他竞争 Prompt 内容来设定。

这些是建议，不是硬性要求。

### 10.4 Delay Until Recursion

如果 Memory Book 是唯一活动的 lorebook/World Info 来源，请禁用 **Delay Until Recursion**。否则可能没有条目能启动第一轮 recursion，Memory 就永远不会激活。

### 10.5 诊断检索

当 AI “不记得”时：

1. 确认条目存在。
2. 确认正确的 Memory Book 对当前聊天处于活动状态。
3. 确认条目已启用。
4. 确认 keywords 或 activation mode 与当前对话匹配。
5. 确认 lorebook budget 足够。
6. 确认 recursion 设定。
7. 使用 World Info inspection 工具或 request log，确认条目是否真的被发送。
8. 如果条目已发送但被忽略，剩下的问题是模型行为或竞争上下文，而不是 STMB 存储。

---

## 11. 真实群聊模式

### 11.1 定义

Group Chat Mode 适用于由两个或更多独立角色卡组成的真实 SillyTavern 群组。

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern 会记录每条讯息由哪张角色卡生成，因此 STMB 能保留说话者归属并检测参与群成员。

不需要单独开启 Group Chat Mode 开关。打开群聊后正常使用 STMB 即可。

### 11.2 参与者检测

检测到的 participant 通常是选中场景内至少发过一条讯息的角色卡。

STMB 不会从叙述中推断所有“物理上在场”的人。因此：

- 沉默观察者可能不会被检测；
- 仅被提及的角色不是 participant；
- 被大家讨论但实际缺席的角色不会被选中；
- 使用者不作为单独的群组角色 Memory Book 目标；
- 重复或异常 speaker identity 可能需要修正。

如果自动 participant detection 找不到任何群角色，即使启用了自动接受，STMB 也会打开参与者确认。警告会说明检测失败，并要求使用者审核当时在场的群角色。

participant prompt 的含义是：**这条 Memory 应关联哪些群角色？** 它并不能证明谁知道每一个事实，或谁在物理上在场。

### 11.3 一本群组 Memory Book

这是推荐起始布局。

使用 Automatic Mode、Auto-Create 或主 Manual Mode book。每个场景在群组 Memory Book 中生成一个 canonical entry。当参与者姓名可用时，该条目可以获得 inclusive SillyTavern character filter。

Alice 和 Bob 的 inclusive filter 意味着 Alice **或** Bob 活动时该条目都可激活。它不会建立一个虚构的“Alice and Bob”角色，也不会建立一个单独 subset book。

一本群组书适合：

- 演员阵容大多共享同一故事；
- 一个 omniscient/group-oriented summary 已足够；
- 希望最少设定与较少重复条目；
- 不需要 STLO。

单条群组 Memory 仍然可以保留不对称知识：

> Alice 找到了发射器并把它藏了起来。Bob 以为房间里什么也没有。

### 11.4 一本群组书 + 每角色独立书

高级真实群组布局使用：

- 一本 canonical group Memory Book；
- 每个群成员各分配一本 character Memory Book。

要求：

- Manual Lorebook Mode；
- 安装并启用 SillyTavern-LorebookOrdering (STLO)；
- 每个必需群成员都有有效分配。

canonical group book 不能同时当作 character book。多个角色可以共享同一本 character book；STMB 会向该共享书写入一个 copy，而不是产生重复项。

储存 Memory 时：

1. canonical version 写入 group book；
2. 除非开启自动接受，否则确认 participants；
3. linked copies 写入选中参与者的书；
4. 如果某个必要储存失败，STMB 会尽可能回滚部分写入。

真实群组 participant confirmation 中如果不选任何参与者，则这条 Memory 应用于当前所有群成员。

### 11.5 分开的 group 与 character prompts

预设情况下，同一份 group-oriented Memory 会复制到 participant books。

设定档案可以启用 **Use separate group and character prompts in group chats**。此时：

- Group Summary Prompt 写 canonical group version；
- Character Summary Prompt 为每个单角色目标书写 individualized version。

Character-focused 版本可以保留：

- 私有知识；
- 错误认知；
- 个人情绪反应；
- 特定关系优先级；
- 对某个参与者真正重要的内容。

这会需要额外 AI 请求。共享 character book 只收到一个共享 copy，而不是按分配角色各重复一份。

### 11.6 STLO 的职责

Memory Books 决定：

- scene range；
- participants；
- summary content；
- 哪些 books 收到 copies；
- 是否使用 individualized prompts。

STLO 决定：

- 何时激活一本 lorebook；
- 哪个角色可以激活它；
- priority、position、budget 和 ordering。

当 STMB 分配 character book 时，它会将角色 avatar basename 添加到 `stlo.characterOverrides` 并启用 `stlo.onlyWhenSpeaking`，同时保留已有 STLO priorities、budgets 与 overrides。

STMB 使用 merge-only 行为。清除或更改分配不会自动删除旧 STLO character override。过时 override 需要在 STLO 中手动移除。

### 11.7 Filters 与 books 不是隐私控制

分开的 books 与 filters 改善相关性，但不保证：

- 一个角色永远无法接收到另一角色的资讯；
- 模型永远看不到 canonical group version；
- previous-memory context 完全按知识所有权隔离；
- character book 只代表角色有意识知道的内容。

将它们视为上下文路由工具，而不是安全边界。

### 11.8 Linked copies 不会实时同步

linked entries 共享元资料，让 STMB 知道它们来自同一个原始事件，但之后的编辑彼此独立。

编辑、删除或 compact 某一 copy 不会自动更改其他 copy。regenerate 一个 character copy 也只改变该 copy。不过，当 regenerate canonical group entry 时，STMB 会询问是只 regenerate 该条目，还是连同所有 linked character entries 一起 regenerate。每个所选条目都有自己的 generation 和 approval review，因此 character-focused prompts 仍保持角色视角。

### 11.9 添加、移除或重新分配群成员

添加角色：

- 在下一条 distributed Memory 前分配有效 book；
- 旧 Memories 不会追溯复制；
- 旧 filters 不会重写；
- 如需历史上下文，应手动提供。

移除角色：

- 已有 entries 保留；
- 旧 filters 与 STLO overrides 保留；
- linked copies 不自动删除。

更换角色 book：

- 只改变未来路由；
- 不一定从旧 book 的 STLO overrides 中删除该角色。

### 11.10 群组 Consolidation

canonical group book 使用自动 group-chat consolidation analysis prompt，目标是在区分客观事件与个人知识的同时构建 omniscient chronology。

character books 使用 popup 中选择的 consolidation preset。不同 books 的 eligible source 数量可能不同。材料不足的 book 可以被跳过并警告，而准备好的 books 继续。

character book 缺少某个 scene 只是 chronology gap，不证明该角色缺席、不知情或失去意识。共享 character book 只生成一个 consolidated entry。

---

## 12. Narrator Mode

### 12.1 定义

Narrator Mode 用于普通的一对一 SillyTavern 聊天，其中一张 Narrator 角色卡同时写多个虚构角色。

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

如果没有 Narrator Mode，SillyTavern 会把所有 AI 回复都视为 Narrator card 所写。Narrator Mode 提供一个手动 cast model，使 STMB 能把 Narrator 文本中的虚构角色与场景和 Memory Books 关联。

Narrator Mode 不能在真实 SillyTavern 群聊中使用。

### 12.2 所需存储布局

Narrator Mode 要求：

- Manual Lorebook Mode；
- 一本已选择的 **omniscient/canonical Memory Book**；
- 每个声明 cast member 各一本唯一 Memory Book。

规则：

- cast member 不能使用 omniscient book；
- 两个 cast members 不能共享同一本 book；
- 每个声明成员都必须有可用 book；
- retired members 会保留身份和保留的 book assignment，直到恢复或由实现用其他方式移除；
- Auto-Create 不兼容，因为 Narrator Mode 依赖 Manual Lorebook Mode。

与高级真实群组布局不同，Narrator Mode 的 active-character retrieval 不需要 STLO。STMB 会在生成期间把所选 cast members 的 books 注入 active lorebook context。

### 12.3 设定

1. 打开 Narrator card 的普通聊天。
2. 启用 Manual Lorebook Mode。
3. 选择 main manual book；它就是 omniscient Memory Book。
4. 启用 **Narrator Mode**。
5. 打开 **Manage Narrator Cast**。
6. 按名称添加每个虚构角色，并给每人分配唯一 Memory Book。
7. 使用浮动 **Active Cast** drawer 选择下一段交流中出现的角色。

必须先关闭 Narrator Mode，才能关闭 Manual Lorebook Mode。

### 12.4 Active Cast drawer 与 timeline metadata

浮动 Active Cast drawer 可以展开、折叠、移动，并用于选择当前 cast members。

生成时，STMB 会快照 active cast 并写入讯息元资料：

- 使用者讯息收到 active-cast snapshot；
- Narrator 回复收到 generation snapshot；
- continuation 会把其 cast 与已有 cast metadata 合并；
- swipe metadata 为每个 swipe 单独储存；
- 选择 swipe 可以从该 timeline point 恢复 active cast；
- 删除最近讯息可以从剩余最新带标签 Narrator message 恢复 cast state。

cast marker 记录关联关系，不是对 prose 的语义分析。

### 12.5 正常 Narrator 生成时的检索

Narrator generation 开始时，STMB 载入 active cast 的 Memory Books，并把其 entries 合并进本次请求使用的 character-lore collection，同时避免重复 world/UID pair。

因此：

- 只有 active-cast books 会由该 Narrator workflow 添加；
- omniscient book 仍遵循正常 Manual Mode activation/configuration；
- Narrator Mode 不要求 per-character STLO filters；
- 如果希望正确的 character books 进入上下文，generation 前 active cast 必须选对。

### 12.6 场景参与者检测

对于选中场景，带标签的 Narrator responses 是权威来源。STMB 会合并 Narrator-authored messages 上记录的 cast IDs。

如果场景含有未标记的旧 Narrator messages，STMB 会退回使用全部讯息中的 continuity 资讯，并要求使用者确认 scene cast。当前 active cast members 会预选。空选择表示没有任何 individual cast members 在场。

该确认专门用于 legacy 或不完整 cast metadata；完全带标签的场景不需要。

### 12.7 Memory 分发

Narrator scene Memory 会写成：

- main Memory Book 中一个 canonical omniscient entry；
- 每个选中 participant 的 unique Memory Book 中一个 linked copy。

Narrator copies 不使用原生 SillyTavern character filters，而是由 STMB 在 entry metadata 中存储 Narrator participant 与 owner IDs。

若 separate multi-character prompts 关闭，participant books 收到 omniscient summary 的 copies；若开启，每个 single-character book 可以获得 character-focused generation。

### 12.8 Narrator consolidation 与 regeneration

Narrator ownership 与 participant metadata 会随 consolidation sources 传递，让 higher-tier entries 保留哪个 character book 拥有 copy、哪些 cast members 参与了底层材料的资讯。

Regeneration 使用这些 metadata 判断 replacement prompt target 应为 omniscient/group-oriented 还是 character-focused。

与真实群组 copies 相同，linked Narrator entries 建立后不会实时同步。

### 12.9 Retiring cast members

cast manager 可以把 member 标为 retired，之后再恢复。Retired members：

- 从 active-cast choices 移除；
- 从 active-cast ID set 移除；
- 保留稳定身份/历史 metadata；
- 保留 book reservation，防止意外复用并合并身份。

用于角色退出当前 cast，但其历史 Memory identity 必须保留的情况。

---

## 13. 聊天分支

SillyTavern 原生 branch 可以发展成不同 continuity。如果 branch 与 parent 向同一批未锁定 Memory Books 写入内容，互相矛盾的时间线就会混在一起。

**Copy Memory Books when branching** 预设启用。

### 13.1 会复制什么

当 STMB 识别到新建的原生 branch：

- Automatic Mode 复制活动 chat-bound Memory Book；
- Manual Mode 复制 main manual Memory Book；
- Manual Mode 真实群组复制每一本唯一且未锁定的 character Memory Book；
- Narrator Mode 复制 omniscient book 和每一本 declared character book；
- 持久 real-character locks 不复制，而是保留，因为 lock 的含义就是“继续使用同一本书”。

一次 branch 操作复制出的所有 books 使用同一个可用 lineage number：

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

从已有 branch 再分支会保留原 lineage root，不会产生 `Branch 1 Branch 1` 这样的名字。

### 13.2 重写 metadata

在 copies 内部，STMB 会：

- 把匹配 parent chat IDs 改写为 new branch chat ID；
- 当 linked books 都被复制时，重定向 canonical group/character links；
- 更新 new branch bindings，使其指向 copies。

它克隆已有内容，不重新生成 Memories。

### 13.3 失败安全

branch copying 进行中不要切换 chats。

如果复制失败，STMB 会清除 new branch 继承的 writable bindings，并记录失败，防止 branch 静默写进 parent originals。

### 13.4 禁用 branch copies

只有在 branch 有意与 parent 共享同一 Memory Books 和持续历史时才关闭此设定。

---

## 14. Clips

Clip 会把选中的聊天文字直接储存为 `[STMB Clip]` 故事书条目，不调用 AI 模型。

### 14.1 适合用 Clip 储存

- 偏好；
- 承诺或秘密；
- 名称或别名；
- 物件或宠物；
- 简短关系事实；
- 应当精确或近似精确保留的一句话；
- 不值得生成完整场景 Memory 的快速“note to self”。

### 14.2 工作流

1. 高亮聊天讯息中的文字。
2. 点选浮动剪刀按钮。
3. 选择已有 Clip entry 或建立新 entry。
4. 对新 entry 选择 always-active 或 keyword-triggered 行为。
5. 审核当前 entry 与更新后的 preview。
6. 如有需要重命名。
7. 储存。

只有选中聊天文字后浮动剪刀按钮才会出现，也可以在主面板中禁用。

### 14.3 条目格式

标题：

```text
Seraphina Healed Me [STMB Clip]
```

内容：

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

一个 Clip entry 只有一个 section。聚焦的标题有利于聚焦的 activation keywords。

### 14.4 现有条目

给现有 entry 标题末尾添加 `[STMB Clip]`，即可把它作为 Clip entry 使用。较长 Clip entries 可以手动编辑或 compact。

Clip 只储存选中的文字，不自动添加 source attribution。

---

## 15. Topical Clips

Topical Clip 会读取已确认的 STMB Memory entries、当前聊天中明确指定的讯息范围，或两者同时读取，然后让 AI 生成一个聚焦于某一主题的 “about this topic” 条目。可作为 Memory sources 的内容包括 scene Memories 和 consolidated summaries；Clip 与 Side Prompt entries 被排除。

### 15.1 适合使用 Topical Clip 的情况

当一个主题的资讯分散在多个 Memories 中，例如：

- 反复出现的 NPC；
- 一段关系历史；
- 地点或 faction；
- 调查或 mystery；
- powers、injuries、promises、preferences 或 secrets；
- 重要物件；
- 未解决 plot thread。

Topical Clip 按主题组织，而不是按每个 source Memory 的时间顺序组织。

### 15.2 来源限制

Topical Clip 使用：

- 所选 source book 中已经确认的 STMB Memory entries，包括符合条件的 consolidated summaries；
- 当前聊天中明确选择的 inclusive `X-Y` 范围内可见 messages。

**Include saved Memories** 和 **Include chat messages** 可以单独或一起使用。message ranges 遵循全局 unhide-before-memory 设定，并在编译后恢复之前隐藏的 messages。

它不使用：

- 所选范围之外的聊天讯息；
- 普通 Clip entries；
- Side Prompt entries；
- 无关普通 lorebook entries。

### 15.3 建立 Topical Clip

1. 打开 Memory Books。
2. 点选 **Topical Clip**。
3. 选择 source Memory Book。
4. 输入 topic。
5. 输入 activation keywords，或留空使用 topic。
6. 选择新 entry，或已有 `[STMB Clip]` update target。
7. 选择 saved Memories、chat messages 或两者作为来源。
8. 可选：只选择特定 source Memories 和/或输入精确 message range。
9. 选择 generation profile。
10. 生成 draft。
11. 审核并编辑。
12. 只有正确后才储存。

生成 draft 永远不会自动储存。

### 15.4 更新已有 Topical Clip

成功运行后，STMB 会记录使用了哪些 source Memories；如果使用聊天讯息，还会记录 source chat、message range、message IDs 与 hashes。以后基于 Memory 的更新通常只发送新增或已变化的 source Memories，并带上现有 Clip 内容。message ranges 始终需要明确选择。

以下情况使用 **Rebuild from all source memories**：

- 当前 entry 不完整或组织混乱；
- Prompt 发生变化；
- 旧 Memories 被大幅编辑；
- 希望重新考虑整个主题。

### 15.5 手动 source selection 与 token warnings

当 book 很大、主题只涉及某一段故事、姓名有重叠或需要严格证据控制时，使用 **Use only selected memories**。

STMB 会估算 request size；超过设定 token threshold 时会警告。减少来源、明确提高 threshold，或选择本次仍然运行。

### 15.6 审核标准

确认 draft：

- 始终围绕主题；
- 保留姓名与关系；
- 包含主要相关事实；
- 对矛盾进行标注，而不是悄悄选择一个版本；
- 不编造 source Memories 不支援的解释；
- 合并更新而不产生不必要重复。

### 15.7 Prompt placeholders

当选择 saved Memories 时，自定义 Topical Clip prompt 必须包含 `{{SOURCE_MEMORIES}}`；选择 chat messages 时必须包含 `{{SOURCE_MESSAGES}}`。

来源 placeholders：

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

支援的 placeholders 包括：

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

如果自定义 prompt 不再产生有用输出，Reset to Default。

---

## 16. Side Prompts

Side Prompt（侧边提示）是一个独立于正常角色回复运行的命名 STMB prompt。它通常建立或更新一份持续维护的支援条目，而不是另一条按顺序排列的场景 Memory。

在 **Trackers & Side Prompts** 列表中，电源图标会立即改变 prompt-wide **Enabled** 标志：绿色表示 enabled，暗色表示 disabled。这个控件不会添加、删除或更改该 prompt 已设定的 triggers。

### 16.1 合适用途

- plot 和 unresolved-thread trackers；
- relationship state；
- NPC 或 faction status；
- inventory 与 resources；
- injuries、statistics 或 reputation；
- timelines、dates、deadlines 与 travel；
- mystery clues、suspects 与 contradictions；
- inventions、research 与 projects；
- continuity-risk reports；
- world-state summaries。

避免使用模糊的“track everything” prompt、重复的场景摘要，或必须出现在下一条角色扮演回复中的任务。

### 16.2 输出格式

Side Prompts 通常期望可直接储存的最终 plain text 或 Markdown，不要求 Memory JSON。只有使用者有意把 JSON 当 tracker text 存储时才使用 JSON。

### 16.3 运行顺序

一次典型运行会组装：

1. Side Prompt instructions；
2. 先前储存的 tracker entry（如有）；
3. 可选 previous Memories；
4. 可选 Additional Context；
5. selected 或 since-last scene text；
6. 可选 Response Format instructions。

prior entry 是要修改的现有 state，并不能证明其中每个旧说法都应该保留。Prompt 应明确要求删除 stale、resolved、contradicted 或 duplicate 资讯。

### 16.4 手动运行

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

含空格的名称应加引号。提供的 range 首尾都包含。

手动运行最适合 targeted analysis 和需要 runtime macro values 的 prompts。

### 16.5 Memory 后自动运行

Side Prompt 可以启用 **Run automatically after memory**。

聊天可以使用两种 automatic selection mode 之一：

- individually enabled Side Prompts；
- 一个选中的 Side Prompt Set。

选中 set 会替代 individually enabled automatic prompts，而不是叠加。

#### Memory Assistance Side Prompt

**Memory Assistance** 是保留的 Side Prompt，有四种独立模式。无论普通 Side Prompt enablement 或所选 Side Prompt Set 如何，只要 Memory 成功储存，它都会在后面运行。Memory regeneration 时不运行。

Memory Assistance 会把原始 processed scene 与收到该 Memory 的每本 Memory Book 中的 ordinary 和 Topical Clips 比较。对每个被审核 Clip，它会发送 title/topic、keywords、current content、stable ID 与 type 给 AI。

有 job queue 时，每个 target Memory Book 都会在 Memory 储存后获得一个独立 **Memory Assistance** job。request、response-validation、report-save 或 automatic-application error 会把该 job 标为 **Failed** 并在伫列中显示错误。已储存 Memory 仍是 **Completed**；重试 Memory Assistance 不会重新生成 Memory。

- **Off**：关闭 Memory Assistance。
- **Update**：五个或更少 Clips 直接审核；多于五个时打开选择列表。建议变化等待手动批准。
- **Update and Suggest**：先做一次 topic-discovery request，再执行与 Update 相同的 existing-Clip review。
- **Automatic**：按 token-based batches 审核所有 Clips，不询问要审哪些。有效 ordinary Clip additions 直接应用，而 Topical Clip replacements 仍需在 **Memory Assistance Suggestions** 中批准。

- Update 与 Update and Suggest 模式下，大列表提供 **Query Selected** 和 **Query All**。
- Query All 与 Automatic mode 使用 token-based batches，避免把所有 Clips 强塞进一个过大请求。
- 每个 ordinary Clip 最多获得一段精确 message excerpt 作为 addition。
- Topical Clips 获得完整 replacement drafts。
- AI 响应是一个简单 JSON object，把每个受影响 Clip UID 直接映射到 suggested excerpt 或 replacement。空 object 表示没有 Clip 需要更新。
- Update 结果写入 `Memory Assistance (STMB SidePrompt)`，在通过 **Memory Assistance Suggestions** 批准前不会应用。
- Automatic-mode 结果记录已应用 ordinary Clip additions 数量，并保留 Topical Clip replacements 与任何 application failures 供手动审核。
- 取消选择会清除旧 suggestions，避免误以为它们来自最新 scene。

Update and Suggest 在 existing-Clip review batches 前使用独立 suggestion-only prompt。请求包含 processed scene 与 existing Topical Clip titles、topics、keywords 的轻量列表；discovery 时不发送 ordinary Clips 或 existing Clip bodies。AI 返回 0–5 个新主题，每个为包含 topic 与 activation keywords 的 JSON object；`{"topics":[]}` 是有效结果。

Suggested topics 储存到 Memory Assistance report。进入 **Memory Assistance Suggestions** 后选择 **Review Topics**，会以预设勾选且可编辑的 rows 显示。可以取消不想要的主题、修改 topic 名称或 keywords，也可以添加额外 topics。确认后的 topics 会依次打开标准 Topical Clip draft workflow。pending topic 只有在对应 Topical Clip 储存后才移除；关闭 draft 则保留在 **Memory Assistance Suggestions** 中。

可审核 suggestions 准备好后，STMB 会为更新过的 Memory Book 打开 completion popup。**Dismiss** 关闭通知；**Go to Suggestions** 打开 **Memory Assistance Suggestions** 并预选该 Memory Book。从 extension menu 打开 **Memory Assistance Suggestions** 时，会先选择当前聊天的 effective Memory Book（Automatic Mode 为 chat-bound book，Manual Mode 为 resolved manual book）。

Update 与 Topic Suggestions prompts 以及 connection-profile override 可以分别编辑，但两个 structured response contracts 是固定的。Memory Assistance 不能删除、复制、放进 Side Prompt Set，也不能手动运行。

### 16.6 自动 visible-message intervals

Side Prompt 可以启用 **Run on visible message interval** 并指定距离其 checkpoint 以来需要多少可见 messages。

隐藏和 system messages 不计数。

当 set 活动时，只有该 set 内所引用 prompt 带有相应 interval trigger 的 rows 才是候选。

### 16.7 Side Prompt Sets

Side Prompt Set 是有顺序的 run list，不只是 folder。同一个 template 可以出现多次，并带不同 macro values。

示例：

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

rows 可以存储：

- prompt reference；
- 可选 label；
- runtime macro values；
- order；
- duplicate 或 delete actions。

rows 从上到下运行。

手动 set commands：

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 预设 sets 与 per-chat selection

General Settings 可以定义：

- solo chats 预设 set；
- group chats 预设 set。

每个 chat 可以：

1. inherit 适用 default；
2. 明确使用 individually enabled prompts；
3. 选择 named set。

空 global default 表示 individual mode。

如果选中的 set 被删除，STMB 会警告，而不是静默换成另一套 workflow。缺失 row prompt 或 unresolved macro 会让该 row 被跳过并产生警告。

set 选择候选 rows。每个被引用 Side Prompt 仍然需要相应 automatic trigger 才能参加 after-Memory 或 interval execution。手动 set commands 不要求这些 trigger checkbox。

### 16.9 Macros

Side Prompts 可以使用普通 SillyTavern macros，例如：

```text
{{user}}
{{char}}
```

非标准 `{{...}}` placeholders 是 runtime macros，必须在手动运行时提供或存入 set row。

示例：

```text
{{npc name}}
{{faction}}
{{project_name}}
```

存在 unresolved runtime macros 的 prompt 无法自动运行。automatic runs 不能暂停等待输入。

### 16.10 Memory-count macros

STMB 为 effective main Memory Book 注册整数 macros：

| Macro | 计数 |
|---|---|
| `{{memtier0}}` | scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

effective main book 在 Automatic Mode 中是 chat-bound book，在 Manual Mode 中是 resolved main manual book。多 book group 或 Narrator setup 中，计数不会把所有 character books 相加。

count macro 只提供数字，不提供条目内容。

### 16.11 Message ranges

显式 range 精确使用该 inclusive range。没有 range 时，STMB 使用 Side Prompt 的 since-last checkpoint/cap 行为。

显式 ranges 适合 debugging、targeted cleanup 或重跑已知段落。

### 16.12 Additional Context 与 previous Memories

Side Prompt 可包含最多七条 previous scene Memories。

Additional Context source 可以是：

- none；
- **Follow chat**，使用聊天选中的 Context Setting；
- 一个固定 named Context Setting。

这些是参考材料，Prompt 不应盲目复制进 tracker。

### 16.13 Lorebook targets

Side Prompt 通常储存到 effective Memory Book，也可以依次使用：

1. per-chat target override；
2. template-level target；
3. effective Memory Book fallback。

有效 per-chat override 优先。

alternate targets 可用于有意共享的 campaign book 或专用 tracker book。没有检索方案时不要四处分散 trackers。

### 16.14 Side Prompt entry controls

template 可以设定：

- title override；
- keywords；
- Normal、Constant 或 Vectorized activation；
- insertion position 与 Outlet name；
- order mode/value；
- Prevent Recursion；
- Delay Until Recursion；
- Ignore Budget。

title 与 keyword fields 可以展开适用 macros。**Ignore Budget** 应少用，因为多个 always-included trackers 会消耗大量上下文。

### 16.15 Connection profile override

Side Prompt 可以继承正常 Memory Books connection resolution，也可以绑定特定 STMB profile。override 可用于更便宜或更擅长 structured maintenance 的模型。过多 profile 组合会增加排查难度。

### 16.16 Side Prompt regeneration

兼容的保存现在会存储 version-2 snapshot，其中包含：

- Side Prompt template key；
- 用于 regeneration 的 prior entry content；
- 本次 run 前 entry 是否存在，以及排除更早 rollback snapshot 后的 exact prior entry state；
- source chat 与 inclusive range；
- runtime macro values；
- STMB 实际写入的 exact entry state fingerprint。

要 regenerate，打开 lorebook editor 并点击 **Regenerate side prompt**。replacement 使用保存的 snapshot，以及当前 template、profile/context settings。

如果 template 已删除、source chat/range 不可用，或 target/source 在 generation 期间发生变化，就无法完成 regeneration。只替换 content；现有 title、keywords 与 entry settings 保留。Legacy version-1 snapshots 仍可用于 regeneration，但不能用于 Memory Auto-Rollback。

### 16.17 编写良好 Side Prompt

良好的 Side Prompt 会定义：

- 精确 maintenance job；
- 要审核哪些 source material；
- 是 revise、replace、merge 还是 append；
- 需要移除的 stale information；
- 稳定 output headings 与 order；
- 严格 length limit；
- 仅输出最终结果。

示例：

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

有用的 guards：

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

稳定 headings 可以减少多次更新后的 drift。

### 16.18 Side Prompt troubleshooting

如果 prompt 没有运行：

- 确认 Memory 或 interval event 确实发生；
- 检查 chat 的 individual/set selection；
- 确认被引用 prompt 仍存在；
- 确认相关 automatic trigger 已启用；
- 确认所有 runtime macros 都有值；
- 检查 `/stmb-stop` 或 failed job 是否取消了它。

如果运行两次：

- 检查 manual + automatic invocation；
- duplicate set rows；
- duplicate prompt copies；
- 多 tabs 或 chats 同时触发。

如果储存到错误 book，检查 per-chat 和 template-level target scopes。

如果输出无限增长，加入明确 replacement、pruning、item-count 与 word-count rules。

---

## 17. Consolidation

Consolidation 会把低层级 STMB Memories 或 summaries 合并为更高层级的 chronological recaps。

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation 从已有 STMB entries 开始，而不是直接处理 raw chat。

### 17.2 用途

适合：

- scene Memories 越积越多；
- 旧材料不再需要完整 scene detail；
- 一段重大关系、plot 或 campaign phase 已完成；
- 希望减少 token 使用同时保留 continuity；
- 需要更干净的 higher-level chronology。

Consolidated entries 应强调 lasting changes、turning points、goals、consequences、relationship shifts、unresolved threads 与 stable state。

### 17.3 手动工作流

1. 打开 **Consolidate Memories**。
2. 确认当前显示的 Source Memory Book。如果已配置的 manual 或 chat-bound book 不是本次想要的 consolidation source，请选择其他 book。该选择只对当前 run 生效，不会改变 chat 配置的 Memory Book。
3. 选择 target tier。
4. 选择 eligible source entries。
5. 选择 consolidation prompt/profile settings。
6. 决定成功 consolidation 后是否禁用 source entries。
7. 运行并审核 candidates。
8. 批准需要的 summaries。

### 17.4 Readiness prompts 不是自动 consolidation

**Prompt for consolidation when a tier is ready** 会监控选中的 target tiers。当达到已储存的 minimum eligible count 时，STMB 显示 yes/later prompt。选择 Yes 只是打开 consolidation interface，并不会静默执行。

### 17.5 Consolidation 输出 schema

普通 consolidation 期望严格 JSON：

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

模型可以返回一个或多个 summaries。`member_ids` 把每个 source 分配给一个 returned summary。outliers 应进入 `unassigned_items`，而不是强行塞进无关 recap。

### 17.6 Previous higher-tier summary

可以把 target tier 中 previous summary 作为 canon context 提供。它不是要重写的 source material。Consolidation prompts 必须区分它与正在处理的 lower-tier entries。

### 17.7 Previews 与 failed responses

Consolidation previews 可以允许编辑、接受、从同一 sources regenerate 单个 candidate，或 regenerate pending batch。

Malformed 或 failed AI responses 可以检查；在支援的地方，可以在 commit 前手动修正。

### 17.8 Source disabling

启用后，成功 consolidation 后 STMB 会禁用 source entries，让 higher-tier summary 接管 retrieval。可通过 lorebook editing 恢复。

### 17.9 良好 consolidation prompts

应定义：

- compression target；
- 建立一个 recap 还是最少数量的 coherent recaps；
- chronology 与 grouping logic；
- 必须保留的 details；
- outliers 的明确处理方式；
- exact JSON structure。

应保留 major beats、consequences、promises、relationship changes、identifiers、unresolved threads 与 retrieval-friendly keywords，同时移除重复 scene-level detail。

---

## 18. Compaction

Compaction 让 AI 缩短一个现有 STMB-managed entry，并在替换前同时展示 original 与 draft。

### 18.1 Eligible entries

- `[STMB Clip]` entries；
- Side Prompt entries；
- STMB Memory entries。

普通 non-STMB lorebook entries 不会列出。

### 18.2 工作流

1. 打开 **Compaction**。
2. 选择 Memory Book。
3. 选择 Compaction Profile。
4. 可选编辑 Compaction Prompt。
5. 选择一个 entry。
6. 比较 original 与 compacted token estimates/content。
7. 如需编辑 draft。
8. Replace、copy draft 或 cancel。

只有选择 **Replace with Compacted Version** 后 original 才会改变。

### 18.3 良好用途

- 很长的 Clip collections；
- 重复或 stale tracker content；
- 啰嗦的 scene Memories；
- 消耗过多上下文的 always-active entries。

Compaction 不用于添加 facts、总结 raw chat、建立新 Memory 或处理普通 lorebook entries。

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

Prompt 应保留 facts、names、pronouns、macros、wrapper headings 与 end markers，同时删除 redundancy 与 low-value wording。

---

## 19. Regeneration（重新生成）

Regeneration 会为现有条目生成一个可审核的替代版本。它不会建立第二个带编号的条目，也绝不会在未经批准的情况下覆盖原条目。

### 19.1 Scene Memory 重新生成

- 打开 source chat；
- 在 lorebook editor 中打开 Memory Book；
- 点选 **Regenerate memory**；
- 对于带有关联 character entries 的 canonical group entry，选择只重新生成当前点选的条目，或同时重新生成所有关联条目；
- 选择当前 profile、prompt、previous-memory count 和 Additional Context；
- 审核每个所选条目的 title、content 和 keywords。

原始 scene range 与 sequence number 会保留。关联条目会复用同一组已选择的 regeneration 设定，但会分别依据各自 Memory Book 的上下文以及 group/character prompt target 生成。STMB 会先收集所有批准结果，再开始储存直接 regeneration 的结果。如果所有 source messages 都已隐藏，请先显示它们，或启用 unhide-before-generation。

### 19.2 Consolidation 重新生成

更高 tier 的 summary 会使用专用 **Regenerate Consolidation** preset，从其精确关联的 lower-tier sources 重新生成。

完整 source set 必须仍存在于正确 tier 中。当某个 active parent summary 仍依赖一个 lower-tier source 时，该 source 不能被重新生成；如果确实要重建 lower tier，请先删除 parent。

### 19.3 Side Prompt 重新生成

参见第 16.16 节的 Side Prompt snapshot 规则。

### 19.4 安全检查

在真正替换之前，STMB 会立即验证：

- target entry 没有发生变化；
- source chat range 没有发生变化；
- 所需 consolidation sources 仍未改变且可用；
- 该 entry 仍符合 regeneration 条件。

任何一项检查失败，都不会覆盖原内容。

关联的 group、character 与 Narrator copies 始终彼此独立。

---

## 20. Generation 使用的 Context

一个 STMB request 中可能出现多种 context source。它们的作用并不相同，不能互换。

### 20.1 Current scene

当前正在处理的 message range。对于普通 scene Memory 来说，这是主要目标材料。

### 20.2 Previous Memories

来自 effective Memory Book 的较早 scene Memories，以只读 continuity context 形式提供。使用者通常可以包含 0–7 个。

不要仅仅因为这些内容位于 current scene 之前，就再次对它们进行总结。

### 20.3 Additional Context

作为稳定参考资料提供的选定 lorebook entries，例如：

- character 或 setting rules；
- canonical names 和 terminology；
- campaign constraints；
- authoritative timeline；
- location references；
- scene 中预设成立但没有再次说明的 facts。

Additional Context 会出现在 previous Memories 和 scene transcript 之前。它是 reference material，不是另一个 scene。

### 20.4 Context Settings

Context Setting 是一组可复用、带顺序的 Additional Context entries。

Workflow：

1. 打开 **Context Settings**；
2. 建立一个命名 setting；
3. 选择 lorebook entries；
4. 调整它们的顺序；
5. 为当前 chat 选择该 setting，或明确选择 No Context。

选择结果按 chat 储存，并且既适用于 Current SillyTavern Settings，也适用于已储存 profiles。

如果某个被引用的 book 或 entry 消失，STMB 会发出警告、跳过失效引用并继续。如果整个 Context Setting 被删除，引用它的 chats 会在没有 Additional Context 的情况下继续运行，直到使用者选择另一个 setting。

Context Settings 可以 duplicate、import，并可汇出为 `stmb-context-settings.json`。

### 20.5 Prior Side Prompt entry

当前需要修改的 tracker text。它代表现有状态，但不意味着旧内容中的每一句话仍然有效。

### 20.6 Consolidation sources

真正被分组和压缩的 lower-tier entries。

### 20.7 Previous higher-tier summary

在 consolidation 中延续的 canon context。它不是需要重新改写的 source。

### 20.8 各 workflow 的正确顺序

普通 Memory：

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt：

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation：

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompt 应明确区分 target material 与仅供参考的 material。

---

## 21. Prompt 架构、内置 Summary Prompts 与编写规则

STMB 有三个主要的 structured generation 系统，以及若干用途更集中的辅助 workflow。

### 21.1 普通 Memory generation

STMB 期望收到一个 JSON object：

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

规则：

- 只返回 JSON object；
- 必须使用精确 key：`title`、`content`、`keywords`；
- `keywords` 必须是字元串组成的 JSON array；
- title 应短且易读；
- 使用具体的 retrieval terms；
- 所需 Markdown 应放在 `content` 字元串内部；
- 正确转义 quotation marks。

STMB 可以修复部分 code fences、trailing commas、think tags、wrappers 或轻微 malformed output，但 prompt 不应依赖这些修复机制。

一个好的 Memory prompt 应说明：

1. 希望采用的 memory style 与 compression level；
2. 必须保留的 continuity-relevant 资讯；
3. 应省略的 filler、OOC 或无来源支援的内容；
4. 精确 JSON schema。

较差的 prompt 往往只规定 style 而不规定 structure、要求 analysis 而不是最终 object、把 previous context 与 current scene 混为一谈，或使用过于抽象的 keywords。

### 21.2 内置 Summary Prompts 以及如何选择

这些 presets 只用于普通 Memory generation。它们不控制 Consolidation、Side Prompts、Topical Clips 或 Compaction。Profile 会在 **Memory Creation Method** 中选择一个 preset。如果 profile 没有指定其他 preset，**Summary** 是普通 fallback/default。Built-in 表示由 STMB 提供，并不表示所有 presets 都会运行，也不表示每个 preset 都适合当前 chat。

没有一个 prompt 对所有情况都是最佳选择，因为 detail、readability、retrieval quality 和 token cost 之间存在取舍。实用的简短答案是：

- **多数使用者最佳起点：Summary。** 平衡、通用，适合测试新 model。
- **重视长期 continuity 的 RP：Comprehensive。** 对 filtering、causality、continuity 和 keyword construction 的要求最强，但对 model 要求更高，也可能生成更大的 structured Memory。
- **最重视节省 context tokens：Minimal。** 有意保持简短，因此会损失细节。
- **独立 real-group 或 Narrator character books：Group + Character。** 通过 profile 的 separate group/character prompt setting 搭配使用；这两个是 target-specific prompts，不是互相竞争的一般 style。

| Built-in prompt | 最适合 | 主要取舍 |
|---|---|---|
| **Summary** | 大多数 solo chats 与初次设定。生成详细的 chronological narrative prose，并保留重要事件、互动、发展、揭示、结果与具体 retrieval keywords。 | 比极端 token-minimal 方案保留更多细节，但比最结构化的 presets 更简单、要求更低。 |
| **Comprehensive** | 长期运行、非常重视 continuity 的故事，需要保留 causal chains、character dynamics、established facts、关键互动、unresolved threads 与严格 keywords。它会明确过滤 incidental detail，并改善 keyword construction。 | 指令最长、要求最高。应使用擅长遵循 instruction 的 model，并提供足够 response tokens。 |
| **Summarize** | 偏好高度易扫描 Markdown 记录的使用者，输出分为 Timeline、Story Beats、Key Interactions、Notable Details 与 Outcome。 | 大量 bullet 的输出更像 reference notes，而不是自然 memory，并可能在不同 heading 间重复 facts。 |
| **Synopsis** | 需要保留几乎每个重要 beat、interaction、detail 与 outcome，而 compactness 次要的 scene。 | 有意非常长且全面；当 lorebook/context budget 紧张时，这是最不合适的选择之一。 |
| **Sum Up** | 需要有清晰 scene heading 和 timeline 的 chronological narrative beat record，但希望比 Summarize 或 Synopsis 少一些 section overhead。 | 对 events、character dynamics、facts 与 continuity state 的区分不那么明确。 |
| **Minimal** | 高流量 chats、低成本 archival coverage，或 Memories 必须占用很少 context 的设定。生成约 2–5 句的简短 Memory。 | 重要 motives、emotional shifts、causality 与较小的 continuity details 可能丢失。 |
| **Northgate** | 想要连贯第三人称、过去时文学记录的 creative-writing 使用者，强调 actions、emotional shifts、development 与重要 dialogue。此 community style 归功于 SillyTavern Discord 的 Northgate。 | 优先 readable narrative，而不是最大压缩或清晰分开的 reference categories。与多数 general presets 不同，内置文本没有明确排除 OOC，因此 OOC 较多时要检查。 |
| **Aelemar** | 重大 plot scenes 与情绪后果重要的 character moments；即使原 scene 不可用，也希望 Memory 能独立理解。此 community style 归功于 SillyTavern Discord 的 Aelemar。 | 要求至少 300 words，且有意保持详细，因此不适合激进 token saving。内置文本同样没有明确排除 OOC。 |
| **Group** | real group 中的 shared/omniscient Memory Book，或 multi-book workflow 中的 omniscient target。在保留 group decisions/state 的同时，确保 actions、emotions 与 knowledge 正确归属于各成员。 | 不要把它用作 individual character 的 Memory；它有意聚焦 shared group continuity。 |
| **Character** | real-group 或 multi-character workflow 中一个 character-focused Memory Book。记录该 character 做过什么、知道什么、感受什么、学到什么、隐瞒什么、误解什么，以及受到什么影响。 | 会有意省略与 target character 无关的 scene 内容，并限制没有依据的 private knowledge。 |

新安装时，先使用 **Summary**，直到 generation 与 retrieval 稳定工作。之后只改变 prompt，并用相似 scenes 的多条 Memories 做比较。如果问题是遗漏 causality、continuity state 或 keywords 太弱，优先尝试 **Comprehensive**；如果问题是 Memory 太大，则尝试 **Minimal**。Prompt 无法弥补 weak model、truncated output、不合适的 scene boundaries 或错误的 retrieval settings。

当前 SillyTavern locale 可以重新建立这些内置文本。重新建立 built-ins 会移除对这些 built-ins 的本地编辑，但不应删除无关 custom presets。修改过 built-in 时，先 duplicate 或 export 再重新建立。

### 21.3 Multi-character prompt targeting

启用 separate group/character prompts 后，STMB 会把 request target 标记为：

- `group`：canonical real-group 或 omniscient Narrator Memory；
- `character`：单个 individual character-book version。

Prompt 应明确使用对应 target perspective，同时不能编造 scene 与已提供 context 不支援的 knowledge。

### 21.4 Side Prompt 编写

Side Prompts 通常返回 plain text 或 Markdown。它们应该像 maintenance instructions，而不是 Memory prompts。

好的 Side Prompt：

- 定义一个狭窄且明确的任务；
- 说明如何使用 previous tracker；
- 删除 stale state；
- 规定稳定 headings 与 length limits；
- 只返回最终 tracker。

### 21.5 Consolidation 编写

普通 consolidation 必须使用第 17.5 节的 schema。好的 prompt 应：

- 保留 chronology；
- 建立能够覆盖材料的最少 coherent summaries；
- 通过 `member_ids` 分配每个已使用 source；
- 通过 `unassigned_items` 标记未归入 summary 的 sources；
- 保留重大变化与 unresolved continuity；
- 使用具体 keywords。

专用 **Regenerate Consolidation** preset 仅用于一个 replacement summary，不能作为普通 consolidation default。

### 21.6 Topical Clip 编写

Prompt 必须包含 `{{SOURCE_MEMORIES}}`，聚焦使用者请求的 topic，区分 source evidence 与 inference，将新材料合并进 existing Clip content，并明确指出 contradictions。

### 21.7 Compaction 编写

Prompt 必须包含 `{{ENTRY_CONTENT}}`，并在不增加无支援 facts 的前提下缩短内容。它应保留 entry 需要的 structural wrappers 与 macros。

### 21.8 Prompt 编写检查表

最终确定任何 STMB prompt 前，先回答：

1. 真正要分析的 target material 是什么？
2. 哪些材料只是 reference-only？
3. 这个 workflow 需要 strict JSON，还是 final plain text？
4. 哪些资讯必须保留下来，供以后 retrieval？
5. 哪些内容应省略、合并、继续保留或放入 unassigned？

Return-format correctness 优先于 style。

---

## 22. Summary Prompt Manager 与 Consolidation Prompt Manager

### Summary Prompt Manager

可以 create、edit、duplicate、delete、import 和 export 普通 Memory prompt presets。通过 Memory Books profile 指定 preset。

所有普通 Memory presets 都必须保留要求的 Memory JSON schema。

关于内置 Summary Prompt 的选择与适用情况，参见第 21.2 节。

### Consolidation Prompt Manager

控制用于把 lower-tier entries 分组成 higher-tier summaries 的 prompts，并选择普通 default consolidation prompt。

只能用于 regeneration 的 consolidation preset 不能用于普通 consolidation。

### Import 与 localization behavior

Built-in prompts 可以按照当前 app locale 重新建立。重新建立前请备份经过本地修改的 built-ins。

---

## 23. STMB 与其他扩展

SillyTavern 扩展会同时运行，并且可能读取或修改相同的 SillyTavern 数据。STMB 不会覆盖或停用其他扩展，也不会取得高于其他扩展的优先级。当扩展的行为重叠时，最终结果取决于所有相关扩展的设置和操作时机。

### 23.1 共享的消息可见性

聊天消息是否隐藏属于 SillyTavern 共享的消息状态，并不是 STMB 独占的状态。

STMB 的 **Token Saving** 设置可以在 Memory 保存后隐藏已处理的消息。其他扩展之后可以重新显示这些消息，STMB 不会阻止这种操作。同样，**Unhide hidden messages for memory generation** 可能会在 STMB 处理或重新生成所选范围时显示消息。

### 23.2 Presence

Presence 扩展和 STMB 都可以更改聊天消息的隐藏或可见状态。如果 Presence 重新显示 STMB 隐藏的消息，并不表示 STMB 的 Token Saving 设置已被清除或忽略；而是 Presence 后续的操作更改了相同的 SillyTavern 消息状态。

如果您使用 Presence，并希望 STMB 隐藏的消息保持隐藏，请使用 Presence 自身的隐藏消息锁定功能。Presence 目前提供 `/presenceLockHiddenMessages` 命令来实现此目的。请针对适用的消息范围运行此命令，并在范围扩大时再次运行。有关命令当前行为的信息，请参阅 Presence 文档。

STMB 不会自动配置或调用 Presence，而且 STMB 的群聊参与者管理与 Token Saving 无关。

### 23.3 Regex 集成

STMB 在两个阶段与 SillyTavern 的 Regex extension 集成：

1. **Outgoing/User Input：** 在 assembled prompt 发出之前进行 transform。
2. **Incoming/AI Output：** 在 parse/save 之前清理或标准化 raw response。

启用 **Use regex (advanced)**，然后打开 **Configure regex**，为两个方向分别选择一个或多个 scripts。

重要：STMB 自己的选择决定是否执行。即使某个 script 在 Regex extension 的普通界面中被禁用，只要被 STMB 选中，它仍可能运行。

只有在理解 transform 效果时才使用 Regex。错误的 outgoing rule 可能破坏必须的 schema instructions；错误的 incoming rule 可能破坏原本有效的 JSON。

---

## 24. Lorebook Entry 标题与字元规则

### 24.1 Title placeholders

Profile title format 可以使用：

- `{{title}}` — AI 生成的 title；
- `{{scene}}` — source range；
- `{{char}}` — character/group name；
- `{{groupname}}` — 当前 group 的 display name；在 group chat 之外解析为 `Unknown`；
- `{{present}}` — scene 中 present 的 characters，以逗号分隔：group chat 中的 individual speakers、Narrator Mode scene 选中的 Active Cast，或普通 character chat 中的 current character；
- `{{user}}` — user name；
- `{{messages}}` — scene message count；
- `{{profile}}` — profile name；
- 支持的 date/time placeholders。

### 24.2 自动编号

支援的 numbering tokens 包括：

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB 会按照所选格式分配连续的 zero-padded numbers。

### 24.3 可列印 Unicode

标题允许所有 printable Unicode characters，包括 emoji、accented text、CJK 和 symbols。U+0000–U+001F 与 U+007F–U+009F 范围内的 Unicode control characters 会被移除。

Auto-Create 使用的 lorebook filenames 会另外针对 filesystem-reserved characters 和长度进行 sanitize。

---

## 25. Job Queue 与 Retry Controls

可选 queue 需要 Chat Top Bar / Chat Top Info Bar。Queue 可用时，重新生成 Memory、consolidation 或 Side Prompt 会建立 regeneration job；replacement 会保持在 review 状态，直到使用者批准。

**Memory Books Jobs** drawer 可以显示：

- queued；
- active；
- completed；
- failed；
- canceled；
- blocked；
- Needs Review。

处理 chat range 的 jobs 会在 queue row 中显示开始与结束 message number。Drawer 还可以 cancel active work、重新打开 review jobs、查看 failures、retry work，以及 dismiss terminal history rows。

Retry scopes：

- **Retry：** 重新运行一个非 Memory job，例如 Side Prompt 或 consolidation job。
- **Retry All：** 重新运行/恢复 Memory 以及关联的 after-Memory Side Prompt work。如果 Memory 已储存，STMB 可以从该结果恢复，而不是建立重复 Memory。
- **Retry Memory：** 只重新运行/恢复 Memory，并有意跳过 after-Memory Side Prompts。

需要恢复完整组合 workflow 时使用 Retry All；不希望 tracker work 运行时使用 Retry Memory。

没有 Chat Top Bar 时，STMB 的正常 workflows 仍然可以运行，只是没有 queue UI。

---

## 26. Visual Feedback 与 Accessibility

STMB 为 scene controls 提供多种视觉状态，包括 inactive、selected、valid range、in-scene 与 processing。具体颜色取决于 SillyTavern theme。

Accessibility 支援包括：

- keyboard navigation；
- focus indicators；
- ARIA attributes；
- reduced-motion behavior；
- mobile-friendly controls。

根据 screenshot 教使用者操作时，应描述实际可见的 icon 和 label，而不要依赖特定颜色。

---

## 27. Settings Map 与当前设定参考

本节是 settings map：说明每个面向使用者的 STMB configuration control 位于哪里、控制什么，同时列出 specialized interfaces 中重要的 saved controls 和 one-run controls。仅用于建立某个 Clip、Topical Clip、Compaction 或 preview 的一次性内容字段，在各自 workflow 章节中说明，不在此重复。

常用起点：

**聊天输入框旁的 magic-wand Extensions menu → Memory Books**

除非明确注明 **SillyTavern**，以下所有路径都从 **Memory Books** main panel 开始。某个 control 在当前 chat、provider、profile 或 storage mode 不适用时，可能隐藏或禁用。

以下 scope 含义：

- **Global：** 在 STMB 中普遍适用，除非更窄的 setting 覆盖。
- **Per chat：** 储存到当前 chat 或 group。
- **Per character：** 随 character card 在兼容 chats 中保持。
- **Per profile/template/setting：** 储存到对应 reusable object。
- **Per run：** 只影响当前正在准备的 operation。

### 27.1 Main panel：storage、chat mode 与 active profile

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode；book choice 为 per chat | 不再把正常 chat-bound lorebook 作为 STMB 自动 target，并要求为当前 chat 选择 Memory Book。不能与 Auto-Create Lorebook Mode 同时启用。 |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**；Manual Mode 下可见 | Per chat | 选择本 chat 接收 Memories 的 main Memory Book。Narrator Mode 中这是 omniscient book。 |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**；real group + Manual Mode 时可见 | Per chat | 为每个 real-group member 指定独立 Memory Book。设定这些 assignments 以及对应 character-filtered retrieval behavior 需要 STLO。 |
| **Character Memory Book lock** | character Memory Book assignment 旁的 lock icon | Per character | 让该 character card 在兼容 Manual Mode chats 中始终使用同一个 Memory Book。更换 assignment 前必须 unlock。 |
| **Narrator Mode** | **Current Lorebook Configuration**；只在普通 non-group chats | Per chat | 把选中的 manual book 作为 omniscient Memory Book，并启用拥有各自 unique books 的 declared fictional cast。需要 Manual Mode 与 omniscient book。 |
| **Manage Narrator Cast** | **Narrator Mode** 下；Active Cast drawer 中也可进入 | Per chat | 添加、retire、restore Narrator characters，并为其指定 unique Memory Books。 |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Automatic Mode 下，如果 chat 没有 lorebook，则建立并绑定一个。不能与 Manual Mode 同时启用。 |
| **Lorebook Name Template** | **Auto-create lorebook if none exists** 下方 | Global | 命名 auto-created books。支援 `{{char}}`、`{{user}}`、`{{chat}}`。只在 Auto-Create Lorebook Mode 启用时使用。 |
| **Memory profile selection** | **Memory Profiles** selector | Per run | 为下一次 Memory 以及旁边的 profile actions 选择 profile。单纯选择并不会改变储存的 default。 |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | 把所选 profile 设为 automatic Memories 与其他 workflows 预设使用的 profile，除非 confirmation、Side Prompt override 或 workflow-specific choice 选择了其他 profile。 |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**，或 **Profile Actions → Edit Profile** | Per profile | 格式化新 Memory entry titles，并可使用列出的 title macros 与编号。Main-panel control 编辑 default profile 的格式；**Edit Profile** 直接修改当前 selected profile。 |

### 27.2 General Settings

在 main panel 打开 **Settings → General Settings**。

| Setting | Scope | 作用 |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | 跳过普通 pre-generation confirmation window。非交互 catch-up 必需；独立 warnings 与已启用 previews 仍可能出现。 |
| **Automatically accept detected participants in future** | Global | 不再询问 real-group participant confirmation，而是接受 STMB 之后检测到的 participant set。 |
| **Show memory previews** | Global | 在储存 generated Memories 与适用 Side Prompt output 前打开可编辑 review。 |
| **Show consolidation previews** | Global | 在 commit generated consolidation candidates 前打开 review controls。 |
| **Show notifications** | Global | 启用 STMB toast notifications。 |
| **Show floating Clip button when text is highlighted** | Global | 选择 chat text 后显示 floating scissors control。 |
| **Memory boundary indicator** | Global | 可选择不显示、显示 processed-boundary divider、显示 draggable jump button，或两者都显示。 |
| **Allow scene overlap** | Global | 允许 selected scene range 与已由 existing Memory 表示的 message IDs 重叠。 |
| **Refresh lorebook editor after adding memories** | Global | STMB 写入 entries 后重新整理已打开的 lorebook editor，以立即显示新内容。 |
| **Copy Memory Books when branching** | Global | native chat branch 获得当前 active unlocked chat-bound 或 manual Memory Books 的独立副本。Character-locked books 按设计继续共享。 |
| **Auto-rollback after message deletion** | Global | 当 message deletion 或 truncation 影响已经 processed 的 chat material 时启用 coordinated rollback。默认关闭。普通 message edits 与 swipes 不会触发。 |
| **Update last message ID processed** | Global；Auto-Rollback action | 将 processed checkpoint 移到最新 surviving Memory 的结尾；如果没有剩余 Memory，则清除 checkpoint。 |
| **Delete last Memory** | Global；Auto-Rollback action | 删除 rollback scope 中所有 invalidated Memories 及其 linked copies。Memory 与 consolidation 的删除不可逆。 |
| **Restore previous Side Prompts** | Global；Auto-Rollback action | 将每个未发生额外修改的 affected Side Prompt 恢复到最新的 exact before-state。只保留一个 rollback level。 |
| **Default for solo chats** | Global | 选择 solo chats 在 Memory 后继承的 Side Prompt Set。空选择使用 individually enabled after-Memory Side Prompts。 |
| **Default for group chats** | Global | 选择 real group chats 在 Memory 后继承的 Side Prompt Set。空选择使用 individually enabled after-Memory Side Prompts。 |
| **Max Response Tokens** | Global | 覆盖 STMB generation 的最大输出长度。有效 JSON 被截断时提高此值；`0` 允许正常 provider/SillyTavern behavior 作为 fallback。 |
| **Token Warning Threshold** | Global | estimated input request 超过 threshold 时显示 confirmation warning。它不会改变 model context limit。 |
| **Default Previous Memories Count** | Global | 设定新 Memory 预设提供的 0–7 个 prior Memories 作为 continuity context。单次运行可以在 **Advanced Memory Options** 中 override。 |
| **Use regex (advanced)** | Global | 启用 STMB 自己的 regex-processing selection。这些选择独立于底层 SillyTavern regex script 是否在普通界面启用。 |
| **Configure regex… → Outgoing scripts** | Global | 选择 STMB 在 generation provider 发送前对 material 运行的 scripts。 |
| **Configure regex… → Incoming scripts** | Global | 选择 STMB 在 parse/save 返回内容前运行的 scripts。 |

#### General Settings 中的 Memory Auto-Rollback

**Auto-rollback after message deletion** 是 master preference。三个 action checkboxes 可以独立选择，默认 enabled；master switch 关闭时它们会在界面中显示为 disabled。因此，现有安装不会仅因为升级就开始删除内容。

Auto-Rollback 只响应 message deletion 或 truncation，也包括 response regeneration 的 deletion phase。普通 edit 或 swipe 不会触发。由于 SillyTavern 的 deletion event value 无法可靠识别 middle deletion，STMB 会跟踪每个 chat 中实际的 message identities。

如果是在末尾删除，任何 stored source range 与 removed suffix 重叠的 Memory 都会受到影响。如果是在 chat 中间删除，STMB 会提供三个选择：

- **Full rollback** 删除受影响的 Memory 以及之后所有较新的 Memories。
- **Affected only** 只删除 overlapping Memories，保留 newer Memories，并按 deletion count 移动其 stored ranges、相关 Side Prompt checkpoints 与 processed checkpoint。这样会有意留下永久的 Memory coverage gap。
- **Cancel** 不对 Memory Books 做任何更改。

Rollback 会跨 available Memory Books 使用精确的 `STMB_chatId`、source-range 与 canonical/link metadata。canonical group 或 Narrator Memory 与所有可找到的 linked copies 视为一个 deletion unit。缺少 canonical copies、legacy entries 因 chat identity 不足而存在歧义、ranges malformed，或 consolidation dependencies 不完整时，整个 rollback 会停止并给出 repair guidance；STMB 不会猜测 ownership。

选择 **Delete last Memory** 时，STMB 会预先检查每个 affected Memory Book 中所有 direct 与 transitive consolidation parents。一个 combined confirmation 会列出必须删除的 consolidations。取消该确认也会取消 checkpoint、Memory 与 Side Prompt 的全部更改。批准后，STMB 会删除 consolidation ancestors，重新启用每个因 deleted consolidation 而 disabled 的 existing direct source 并清除其 `disabledBySummaryId` backlink，然后删除 selected base Memories。用户自行 disabled 的 entries 不会被重新启用。

保存前，STMB 会再次检查完整 lorebook fingerprints。Lorebooks 会通过正常 serialized write lanes 按排序顺序写入；如果后续 book 失败，会保留未修改的 pre-write clones 用于 compensating saves。只有所有 lorebook writes 都成功后，chat checkpoint metadata 才会修改。chat 的 queued work 会在 preflight 前取消；active non-queued Memory creation 可以先完成再继续 rollback。

Side Prompt rollback 使用 version-2 regeneration snapshots。每个 snapshot 记录 entry 是否原先存在、排除更旧 rollback snapshot 后的 exact prior state、source chat/range，以及 STMB 写入 state 的 fingerprint。如果 rolled-back run 创建了 entry，rollback 会删除它。如果 current entry 已不再匹配 saved fingerprint，STMB 会认为用户或 later run 已经修改它，并保持不动。Version-1 snapshots 仍支持 regeneration，但对 rollback 不够安全，会在 warning 后跳过。成功 restore 会消费该 snapshot，因此该 Side Prompt 在再次运行前不能进行第二次 rollback。如果一次 rollback 多个 Memories，每个 Side Prompt 只能恢复 latest available before-state；更早 rolled-back runs 引入的信息可能仍会保留。

#### General Settings 中的 Token Saving

这些 controls 位于同一个 **General Settings** popup 更下方的 **Token Saving (Hide/Unhide Messages)**。

| Setting | Scope | 作用 |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | 选择不自动隐藏、隐藏到 latest Memory 为止的所有 processed messages，或只隐藏 latest Memory 使用的 range。隐藏可逆，不会删除 messages。 |
| **Messages to leave unhidden** | Global | auto-hide 时保留这么多 recent messages 可见，以在 Memory boundary 附近保留 overlap。`0` 会一直隐藏到适用 scene end。 |
| **Unhide hidden messages for memory generation** | Global | 在 STMB 编译 source range 前执行相当于 `/unhide X-Y` 的操作。成功储存后，由选定 auto-hide mode 决定哪些内容再次隐藏。 |

### 27.3 Automatic Memories 与 consolidation reminders

在 main panel 打开 **Settings → Automatic Memories**。

| Setting | Scope | 作用 |
|---|---|---|
| **Auto-create memory summaries** | Global | 启用 automatic `/nextmemory`-style Memory creation。若没有 processed baseline，当前 STMB 可以从 message 0 开始；仍建议先做一条 manual Memory，以验证设定并选择明确 starting boundary。 |
| **Auto-Summary Interval** | Global | 设定 normal automatic cadence 每次包含多少 messages。 |
| **Auto-Summary Buffer** | Global | 从本来已满足条件的 automatic range 中排除这么多个最新 messages，使 generation 稍微落后于 live conversation。 |
| **Prompt for consolidation when a tier is ready** | Global | monitored tier 达到已储存 minimum eligible-source count 时显示 yes/later prompt。绝不会静默执行 consolidation。 |
| **Auto-Consolidation Tiers** | Global | 选择哪些 target tiers 被监控 readiness prompts。每个 tier 的 minimum 在 **Consolidate Memories** 中储存。 |

### 27.4 Profile editor

在 **Memory Profiles** 中选择一个 profile，然后打开 **Profile Actions → Edit Profile**。除特别说明外，这些 settings 都是 **per profile**。Built-in **Current SillyTavern Settings** profile 会锁定由 SillyTavern 控制的字段。

| Setting | 作用 |
|---|---|
| **Profile Name** | 为 reusable STMB profile 命名。Built-in profile name 被锁定。 |
| **API/Provider** | 选择 current SillyTavern routing、supported provider、Custom OpenAI-compatible connection 或 Full Manual Configuration。 |
| **Use this connection profile** | 对 **Custom OpenAI-Compatible API**，使用当前 active SillyTavern Custom connection 或一个 named Custom connection。其储存的 URL/secret 会被使用，而 STMB **Model** 仍是 model override。 |
| **Skip structured output and use plain-text completion** | provider 拒绝 structured-output schema 时，不再发送该 schema。Selected prompt 仍必须让 model 返回 STMB 要求的 valid JSON。 |
| **Use ST's ChatCompletionService** | 通过 SillyTavern built-in Chat Completion request helper 路由 supported requests。Full Manual profiles 不可用。 |
| **Chat Completion Preset** | 可选择通过 ChatCompletionService 应用一个 SillyTavern Chat Completion preset。 |
| **Model** | 提供该 profile 的 exact model ID。**Current SillyTavern Settings** 则读取 SillyTavern 当前 active model。 |
| **Temperature** | 设定该 profile 的 generation randomness。**Current SillyTavern Settings** 则读取 SillyTavern 当前 temperature。 |
| **Use reverse proxy** | 为 supported providers 传递 SillyTavern configured reverse-proxy details；Full Manual Configuration 中 secret field 标记为 proxy password。 |
| **API Endpoint URL / API Key** | 仅为 **Full Manual Configuration** 提供独立 direct endpoint 与 credential。普通使用优先采用在 SillyTavern 中已设定并测试的 connection。 |
| **Memory Creation Method** | 选择普通 Memory generation 使用的 Summary Prompt preset。Prompt content 在 **Settings → Summary Prompt Manager** 中管理。 |
| **Use separate group and character prompts in group chats** | 为 group Memory Book 与 character-focused Memory Books 使用不同 prompt presets。 |
| **Group Summary Prompt / Character Summary Prompt** | separate group/character prompting 启用时选择对应两个 presets。 |
| **Memory Title Format** | 控制该 profile 生成 Memories 的 title text、macros 与 automatic numbering。 |
| **Activation Mode** | 新 entries 储存为 **Normal** keyword activation、**Constant** 或 **Vectorized**。 |
| **Insertion Position** | 选择 generated entry 相对 Character、Example Messages、Author's Note 或 named Outlet 的 insertion 位置。 |
| **Outlet Name** | 目标 Outlet 名称；只在 **Insertion Position** 为 **Outlet** 时显示。 |
| **Insertion Order** | **Auto** 从 Memory number 推导 order；**Manual** 使用 fixed value；**Reverse** 从 starting value 倒数，仅适用于 Outlets。 |
| **Prevent Recursion** | 防止 generated entry 的 content 在 recursive scanning 中触发其他 lorebook entries。 |
| **Delay Until Recursion** | 防止 generated entry 在第一次 scan pass 激活。如果没有其他内容可以启动 recursion，应保持关闭。 |
| **Also include** | 仅用于 legacy-profile compatibility。旧 profiles 可能显示 ordered lorebook references；当前设定改用 per-chat **Context Settings**。 |

Active SillyTavern provider、model、temperature、connection preset 与 reverse proxy 在 SillyTavern 自己的 connection controls 中设定，而不是 STMB。**Current SillyTavern Settings** profile 会读取这些 live values。

### 27.5 Context Settings

在 main panel 打开 **Settings → Context Settings**。

| Setting | Scope | 作用 |
|---|---|---|
| **Additional Context for this chat** | Per chat | 选择一个 named Context Setting、明确储存 **No Context**，或保持未选择，以便 migrated context 需要决定时由 STMB 提示。 |
| **Context Setting Name** | Per Context Setting | 为 reusable Additional Context collection 命名。 |
| **Additional Context entries and order** | Per Context Setting | 选择作为 stable reference material 发送的 lorebook entries，并决定顺序。Missing entries 会被警告并跳过。 |

**New**、**Duplicate**、**Delete**、**Import JSON** 与 **Export JSON** 用于管理 Context Settings；只有当某个 setting 被 chat 或 Side Prompt 选中后，才会影响 generation behavior。

### 27.6 Trackers & Side Prompts

在 main panel 打开 **Settings → Trackers & Side Prompts**。

| Setting | Location and scope | 作用 |
|---|---|---|
| **After-memory side prompt mode for this chat** | Manager main screen；per chat | 使用匹配的 solo/group default、明确使用 individually enabled after-Memory prompts，或为本 chat 选择一个 named Side Prompt Set。 |
| **How many concurrent prompts to run at once** | Manager main screen；global | 把 simultaneous Side Prompt jobs 限制为 1–10。 |
| **Side Prompt Set Name** | **New Set** 或 edit a set；per set | 为 reusable ordered Side Prompt run group 命名。 |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row；per set | 选择 row template、可选 display/title label、literal 或 set-level runtime macro values，并以 row order 作为 execution order。 |
| **Enabled** | **New** 或 edit ordinary Side Prompt；per template | 当 chat 使用 individually enabled after-Memory prompts 时，使 template 具备候选资格。Trigger settings 仍决定何时运行。 |
| **Run on visible message interval / Interval** | Side Prompt editor；per template | 达到设定的 visible-message 数后运行。当 template 存在 unresolved runtime macros 时，automatic triggers 不可用。 |
| **Run automatically after memory** | Side Prompt editor；per template | successful Memory 后自动运行，受 chat Side Prompt mode 或 selected set 控制。 |
| **Allow manual run via `/sideprompt`** | Side Prompt editor；per template | 允许 explicit manual execution。 |
| **Prompt / Response Format** | Side Prompt editor；per template | 定义 instruction 与可选 output structure。两个字段都可以使用 supported Side Prompt macros。 |
| **Previous memories for context** | Side Prompt editor；per template | 在 selected source messages 前包含 0–7 个 previous Memory entries。 |
| **Use additional context / Additional Context Source** | Side Prompt editor；per template | 包含 Additional Context，并选择跟随当前 chat Context Setting 或始终使用一个 fixed named setting。 |
| **Lorebook Target** | Side Prompt editor；per template 或 per chat | 把 output 储存到 normal Memory Book 或其他 chosen lorebook。更改时 STMB 会询问该选择只适用于当前 chat，还是以后都应用于 template。 |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor；per template | 可选控制 upserted entry title template 与 comma-separated activation keywords。 |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor；per template | 控制 Side Prompt lorebook entry 的 activation 与 placement。 |
| **Insertion Order / Order Value** | Side Prompt editor；per template | 使用 automatic Memory-number ordering 或 fixed manual order value。 |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor；per template | 应用对应的 SillyTavern lorebook-entry recursion 与 budget flags。 |
| **Override default memory profile / Connection Profile** | Side Prompt editor；per template | 通过 selected STMB profile 路由该 Side Prompt，而不是 current default profile。 |
| **Memory Assistance Mode** | 编辑 **Memory Assistance**；global | **Off** 禁用；**Update** 对 existing Clips 提出修改；**Update and Suggest** 还会发现 Topical Clip topics；**Automatic** 直接应用 ordinary Clip additions，同时保留 Topical Clip replacements 等待批准。 |
| **Update Prompt / Topic Suggestions Prompt** | 编辑 **Memory Assistance**；per built-in template | 控制两个 AI tasks。其 response contracts 保持固定。 |
| **Use a connection profile override** | 编辑 **Memory Assistance**；per built-in template | 让 Memory Assistance 使用所选 STMB profile，而不是 default。 |

### 27.7 Prompt managers

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** 或 edit | Per preset | 定义 reusable ordinary-Memory prompt。只有 profile 的 **Memory Creation Method** 或 group/character prompt selection 指向该 preset 后才会使用。 |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | 选择 **Consolidate Memories** 预设预选的普通 prompt。Regeneration-only 与 group-only presets 不能选择。 |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** 或 edit | Per preset | 定义 reusable consolidation instructions。专用 regeneration/group presets 只能用于对应 workflows。 |

### 27.8 Topical Clip 与 Compaction defaults

在 main panel 打开 **Settings → Topical Clip** 或 **Settings → Compaction**。

| Setting | Location | Scope | 作用 |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**，或 **Compaction → Compaction Profile** | Global shared default | 选择 Topical Clip generation 与 Compaction 使用的 STMB profile。在任一界面改变它，都会改变两个 workflows 共用的 selection。 |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | 储存 custom Topical Clip prompt template。**Reset to Default** 返回当前 built-in prompt。储存或 generation 前会验证 required source macros。 |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | 储存用于缩短 existing Memory、Clip 与 Side Prompt entries 的 custom prompt template。**Reset to Default** 返回当前 built-in prompt。必须包含 `{{ENTRY_CONTENT}}`。 |

Memory Book、topic、keywords、source inclusion、source selection、message range、draft，以及 Compaction 选中的 entry 都是 per-run workflow choices，而不是 persistent settings。

### 27.9 Consolidate Memories controls

从 main panel 底部按钮打开 **Consolidate Memories**。该界面混合了 saved defaults 与 one-run choices。

| Setting | Scope | 作用 |
|---|---|---|
| **Source Memory Book** | Per run | 显示当前正在 consolidate 的 Memory Book，并允许选择其他 available book。改变选择会重新加载 eligible-entry list，但不会修改 chat 的 configured manual 或 chat-bound Memory Book。 |
| **Target tier** | Per run | 选择要建立的 higher tier，因此也确定其正下一级的 eligible source tier。 |
| **Consolidation Prompt** | Per run | 选择本次 consolidation 的 prompt；初始使用 Consolidation Prompt Manager 的 default。 |
| **Maximum entries per pass** | Per run | 限制一次 analysis pass 发送多少 lower-tier entries。 |
| **Token Budget** | Per run | 设定用于本次 consolidation batching 的 approximate input budget。 |
| **Number of automatic summary attempts** | Per run | 限制为了获得 usable assignments/summaries 而进行的 repeated analysis passes。 |
| **Saved minimum eligible entries** | Global，每个 target tier 独立储存 | 设定 chosen tier 何时被视为 ready，也控制该 tier 的 automatic readiness prompt。 |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | 控制新 consolidated entries 的储存方式，与普通 Memory profile entry settings 独立。 |
| **Disable selected source entries after creating summaries** | Per run | commit 成功后禁用已 consolidated sources，让 higher-tier summaries 在 retrieval 中接替它们。不会删除 sources。 |
| **Selected source entries** | Per run | 选择要处理的 eligible lower-tier entries。未勾选 entries 保持不变。 |

### 27.10 相关 SillyTavern World Info settings

这些 controls 位于 STMB 外部的 SillyTavern World Info/lorebook settings，但会影响储存的 Memories 是否在普通 chat generation 中被 retrieval。

| Setting | 作用 |
|---|---|
| **Match Whole Words** | 控制 keyword boundary matching。Off 是灵活 Memory keywords 的常见起点。 |
| **Scan Depth** | 控制用于 lorebook activation 的 recent text 扫描深度。较高值如 8 是常见起点。 |
| **Max Recursion Steps** | 限制 recursive World Info activation。约 2 是常见起点。 |
| **Context percentage / lorebook budget** | 限制 lorebook entries 可以占用多少 context。提高时要兼顾 model total context 与其他 prompt material。 |

这些只是建议，不是硬性要求；retrieval diagnosis 参见第 10 节。

---

## 28. Slash Command 参考

### Memory commands

```text
/creatememory
```

从当前已标记 scene 建立 Memory。

```text
/scenememory X-Y
```

设定 inclusive range 并建立 Memory，例如 `/scenememory 10-15`。

```text
/nextmemory
```

从 highest processed boundary 后的第一条 message 到当前 eligible end 建立 Memory。

```text
/stmb-catchup interval=x start=y end=z
```

把现有 long chat 按连续 chunks 处理。

### Side Prompt commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-boundary commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency stop

```text
/stmb-stop
```

停止所有正在进行的 STMB generation，包括 Side Prompts。已经 commit 的 work 仍会保留。

---

## 29. 按阶段 Troubleshooting

### 29.1 Extension/UI 没有载入

症状：

- magic-wand menu 中没有 Memory Books；
- chevrons 不见了；
- 选择文字后没有 floating Clip button。

检查：

1. extension 已安装并 enabled；
2. page 已 reload；
3. 已打开 character/group chat；
4. 最多等待十秒；
5. 展开 message actions；
6. 只有这些基本检查失败后再检查 console。

### 29.2 没有选择 scene

标记 scene 时 **►** 与 **◄** 都必须设定。请在 panel 中确认 Current Scene。

如果 range 与 existing Memory 重叠，请选择其他 range，或启用 Allow Scene Overlap。

### 29.3 没有有效 Memory Book

Automatic Mode：

- 给 chat 绑定一个 lorebook；或
- 启用 Auto-Create。

Manual Mode：

- 选择 main manual book；
- 修复已被删除的 selection；
- 更改 broken character lock 前先 unlock。

Real multi-book group：

- STLO 必须可用；
- 每个 required member 都需要有效 assignment；
- group book 不能同时作为 character book。

Narrator Mode：

- Manual Mode 必须 enabled；
- 必须选择 omniscient book；
- 每个 declared member 都需要一个 unique non-omniscient book。

### 29.4 AI 没有生成有效 Memory

按以下顺序检查：

1. provider/model/profile 有效；
2. response 没有被截断；
3. maximum response tokens 足够；
4. selected prompt 仍要求 exact JSON；
5. schema 没有被 Regex 破坏；
6. provider 支援 selected structured-output mode；
7. 只有 provider 拒绝 schema 时才尝试 Skip Structured Output；
8. 在重写 prompt 之前先尝试更擅长 instruction-following 的 model；
9. 点选 persistent error notification 中的 **Raw response from AI** 查看捕获到的 provider response；如果可用，可使用 manual JSON correction interface。

常见原因包括 code fences、commentary、缺失 key、keywords 不是 array、refusal text 或 cut-off output。

### 29.5 Memory 已储存，但 messages 消失

它们很可能被 auto-hidden。修改 Token Saving settings。Hidden messages 并没有删除。

### 29.6 Automatic Memories 没有运行

检查：

- Auto-create memory summaries 已 enabled；
- highest processed boundary 之后有足够 messages；
- 满足 interval + buffer requirement；
- 没有仍 active 的 postpone checkpoint；
- 有有效 Memory Book；
- 没有其他 Memory job 正在阻塞 trigger；
- work 进行时没有切换 current chat；
- group generation 已在预计 trigger 之前完成。

当前版本技术上不要求 first manual Memory，但仍建议这样做。

### 29.7 Memory 存在但没有 activate

检查：

- 正确 book active；
- entry enabled；
- keywords 相关；
- activation mode；
- budget；
- recursion 与 Delay Until Recursion；
- 如果使用 STLO，则检查 routing；
- World Info inspection/logs。

在 retrieval 被测试之前，不要重新生成 Memory。

### 29.8 Entry 已发送但被忽略

这属于 model-use behavior。可以尝试：

- 让 Memory 更短、更明确；
- 改善 insertion position/priority；
- 减少 competing context；
- 使用 OOC reminder；
- 使用更可靠地遵循 supplied context 的 model。

### 29.9 Side Prompt 没有运行

参见第 16.18 节。尤其注意，selected set 会抑制该 set 之外 individually enabled prompts。

### 29.10 Consolidation 没有 prompt

确认：

- readiness prompt 已 enabled；
- target tier 已选中进行 monitoring；
- 存在足够 eligible source entries；
- sources 没有已经 disabled/ineligible；
- 达到该 tier 储存的 minimum count。

### 29.11 Regeneration button 被禁用

Hover 或查看界面显示的 reason。常见原因：

- entry 早于所需 snapshot metadata；
- source chat/range 不可用；
- source entries 缺失或 tier 不正确；
- active parent consolidation 阻止 lower source；
- 无法确定 original sequence number；
- Side Prompt template 已删除。

### 29.12 Branch 没有复制 books

检查：

- 建立 branch 前 **Copy Memory Books when branching** 已 enabled；
- 使用的是 native SillyTavern branch；
- source books 存在且可载入；
- copying 过程中没有切换 chat；
- branch 没有以前被标记为 completed/failed；
- locked books 是有意继续使用，而不是复制。

### 29.13 Narrator Mode cast 不正确

检查：

- generation 前的 Active Cast selection；
- message 是否是 continuation，并 merge 了 cast metadata；
- swipe 是否恢复了较旧 cast state；
- scene 是否含 legacy untagged messages，需要 confirmation；
- declared character 是否已 retired；
- 每个 character book 是否仍存在。

---

## 30. FAQ

### 我需要 vectors 吗？

不需要。Keyword activation 已足够，并会自动生成。Vectors 是可选功能。

### Memories 应该使用独立 lorebook 吗？

通常建议这样做，便于 organization、budgeting、reuse 与 diagnosis，但不是强制要求。

### STMB 会删除 messages 吗？

不会。它可以把 processed messages 从 active context 中隐藏。

### 我可以完全手动使用 STMB 吗？

可以。只在需要时标记 scenes 并建立 Memories。

### Automatic Memories 可以建立第一条 Memory 吗？

当前 STMB 可以。如果没有 processed baseline，在 interval + buffer 达到要求后会从 message 0 开始。仍建议先手动运行一次，以验证 setup 并选择 desired starting boundary。

### Consolidation 会自动运行吗？

不会。STMB 可以在 tier ready 时提示，但由使用者确认并 review operation。

### 一个 real group 可以只用一个 Memory Book 吗？

可以。这是推荐起点，而且不需要 STLO。

### 什么时候值得给 real-group characters 使用 separate books？

当 individual continuity、knowledge、speaker-specific retrieval 或 character-focused summaries 带来的精度足以值得额外 setup 和 AI requests 时。

### Narrator Mode 和 Group Chat Mode 是一回事吗？

不是。Group Chat Mode 读取多个独立 SillyTavern character-card authors。Narrator Mode 则由使用者手动声明一个 Narrator card 在 prose 中扮演的 fictional characters。

### Narrator Mode 需要 STLO 吗？

其 Active Cast retrieval path 不需要。但它需要 Manual Lorebook Mode、一个 omniscient book，以及每个 character 独立的 unique book。

### Linked copies 会同步吗？

不会。它们只在 origin/consolidation metadata 上关联，不会持续 mirror。

### 为什么 Delay Until Recursion 通常应该关闭？

如果没有其他 lorebook entry 启动 recursion，被延迟的 Memory entry 可能永远不会 activate。

### 第一条 Memory 成功后，使用者应该做什么？

先确认 entry 能正确 retrieval，然后启用 automatic Memories、选择 interval/buffer、启用 token hiding，并只在有明确需求时添加 Clips 或一个范围明确的 Side Prompt。积累足够 Memories 后再使用 Topical Clip 和 Consolidation。

---

## 31. Compatibility、Migration 与当前历史说明

本节只保留会影响当前使用方式的历史资讯。

### 当前 baseline

- 当前文档版本：v8.5.0，2026 年 8 月 1 日。
- SillyTavern 要求：1.14.0 或更新版本。
- Narrator Mode 在 v8.5.0 加入。
- Branch book copying、Side Prompt regeneration 与 character Memory Book locks 在 v8.4.0 加入。
- Multi-character real-group Memory distribution 在 v8.0.0 加入。
- Additional Context 在 v7.0.0 从 profiles 移到 reusable per-chat Context Settings；旧 profile context 会迁移。
- Topical Clip 在 v6.10.0 加入。
- Compaction 与 Clips 在 v6.6.0 加入。
- Side Prompt Sets 与 per-prompt targets 在 v6.4–v6.5 阶段加入。
- Consolidation 在 v6.0.0 变为 Arc 到 Epic 的 multi-tier system；旧 Arc metadata 会迁移。
- Job Queue integration 在 v6.8.0 加入，目前仍为可选。
- 当前 profile defaults 预设禁用 Delay Until Recursion，除非使用者/profile 明确修改。

### 来自旧版本的 Existing Memories

只有带 `stmemorybooks` flag 与所需 metadata 的 entries 才会被识别为 STMB Memories。对于早于当前 metadata 的旧 entries，请使用提供的 lorebook converter。

### 已移除 functionality

旧 bookmark feature 在 v4.0.0 从 Memory Books 中移除，并从 core extension 拆分出去。不要把 Memory Books bookmark controls 当成当前功能进行教学。

### Localized built-ins

Built-in prompts 可以根据当前 SillyTavern language 重新生成。重新建立前，请备份经过自定义修改的 built-ins。

### Import behavior

Side Prompt import 是 additive。Existing prompts 会保留；imported key conflicts 会被 rename，而不是覆盖现有 prompt。

---

## 32. Developer 与 License Notes

Memory Books 使用 Bun 进行 bundling/minification。

```sh
bun run build
```

使用以下命令安装 repository 的 pre-commit build hook：

```sh
bun run install-hooks
```

该 hook 会在 commit 前 build，stage build artifacts，并在 build 失败时中止 commit。

Memory Books Copyright © 2024–2026 Aiko Hanasaki，并以 GNU Affero General Public License v3.0 授权。修改版本必须保留适用 notices、标明 modifications，并遵守 AGPL source-availability 要求。

---

## 33. 简明 Diagnostic Decision Tree

```text
使用者说：“Memory Books 不工作。”
│
├─ 菜单/control 可见吗？
│  ├─ 否 → 检查 installation/loading/UI。
│  └─ 是
│
├─ 可以选择 scene 吗？
│  ├─ 否 → 展开 message actions；设定两个 chevrons；检查 overlap。
│  └─ 是
│
├─ 有有效 effective Memory Book 吗？
│  ├─ 否 → bind、auto-create、选择 manual，或修复 multi-book bindings。
│  └─ 是
│
├─ Generation 返回 valid complete output 吗？
│  ├─ 否 → 检查 profile、provider、output tokens、JSON schema、Regex、model。
│  └─ 是
│
├─ Entry 存在于 intended book 中吗？
│  ├─ 否 → 检查 save/rollback/permission/job failure。
│  └─ 是
│
├─ SillyTavern 后续会 activate 并发送它吗？
│  ├─ 否 → 检查 keywords、activation mode、book binding、budget、recursion、STLO。
│  └─ 是
│
└─ Model 会使用 supplied entry 吗？
   ├─ 否 → 检查 model compliance、placement、competing context、entry clarity。
   └─ 是 → workflow 正常工作。
```

---

## 34. 最低推荐教学顺序

对于新使用者，先只教以下步骤：

1. 打开 magic-wand menu，找到 Memory Books。
2. 使用带有 bound book 的 Automatic Mode，或启用 Auto-Create。
3. 选择 Current SillyTavern Settings。
4. 展开 message actions，用 **►** 与 **◄** 标记一个短而完整的 scene。
5. 建立并 preview 一条 Memory。
6. 打开 Memory Book，验证 saved entry。
7. 验证 entry 后续可以 activate。
8. 启用 automatic Memories，并选择 interval/buffer。
9. 只有在解释清楚 hidden messages 并未被删除后，才启用 auto-hide。
10. 先介绍 Clips，再介绍 Side Prompts；只有当使用者出现明确需求时，才介绍 Topical Clip/Consolidation。

除非使用者的问题确实需要，不要一开始就讲 custom prompts、Full Manual endpoints、multiple character books、Regex 或 consolidation。

---

## 35. 最终概念总结

Memory Books 是一个建立在 SillyTavern lorebooks 上的 external continuity pipeline：

```text
选择或安排 chat material
→ 生成 structured representation
→ 连同 retrieval metadata 一起储存
→ 可选择隐藏 processed transcript
→ 之后由 SillyTavern retrieval 相关 entries
```

系统在以下条件下效果最好：

- scenes 保持 coherent；
- prompts 明确区分 target 与 reference context；
- JSON workflows 返回精确 schemas；
- keywords 具体明确；
- Memory Books 被有意识地 assignment 与 activation；
- long-running trackers 会清理 stale state；
- consolidation 减少旧细节但不抹去 continuity；
- 使用者验证 retrieval，而不是假设 saved 就等于 sent；
- advanced multi-book routing 只在其精度值得额外复杂度时使用。
