<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books：AI向け完全リファレンスマニュアル

**製品:** SillyTavern Memory Books (STMB)  
**参照バージョン:** v8.5.0、2026年8月1日  
**目的:** Memory Books を教え、説明し、トラブルシューティングするAIアシスタント向けの、単一かつ高密度な情報源。

---

## 目次

- [1. AIアシスタントによる本マニュアルの使い方](#1-aiアシスタントによる本マニュアルの使い方)
- [2. 製品定義と基本的な考え方](#2-製品定義と基本的な考え方)
- [3. 基本用語と機能の選び方](#3-基本用語と機能の選び方)
- [4. 要件、インストール、初期確認](#4-要件インストール初期確認)
- [5. Memory Booksを開き、メインパネルを理解する](#5-memory-booksを開きメインパネルを理解する)
- [6. Memory Bookの保存モード](#6-memory-bookの保存モード)
- [7. プロファイル、接続、生成ルーティング](#7-プロファイル接続生成ルーティング)
- [8. シーン、手動Memory、自動Memory、Catch-Up](#8-シーン手動memory自動memorycatch-up)
- [9. トークン節約、非表示メッセージ、Memory境界](#9-トークン節約非表示メッセージmemory境界)
- [10. Lorebookの有効化と取得](#10-lorebookの有効化と取得)
- [11. 実際のGroup Chat Mode](#11-実際のgroup-chat-mode)
- [12. Narrator Mode](#12-narrator-mode)
- [13. チャットのブランチ](#13-チャットのブランチ)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. 生成用コンテキスト](#20-生成用コンテキスト)
- [21. Prompt構造、組み込みSummary Prompt、作成ルール](#21-prompt構造組み込みsummary-prompt作成ルール)
- [22. Summary Prompt ManagerとConsolidation Prompt Manager](#22-summary-prompt-managerとconsolidation-prompt-manager)
- [23. STMBと他の拡張機能](#23-stmbと他の拡張機能)
- [24. Lorebookエントリのタイトルと文字ポリシー](#24-lorebookエントリのタイトルと文字ポリシー)
- [25. Job QueueとRetry操作](#25-job-queueとretry操作)
- [26. 視覚的フィードバックとアクセシビリティ](#26-視覚的フィードバックとアクセシビリティ)
- [27. 設定マップと現行設定リファレンス](#27-設定マップと現行設定リファレンス)
- [28. Slash Commandリファレンス](#28-slash-commandリファレンス)
- [29. 段階別トラブルシューティング](#29-段階別トラブルシューティング)
- [30. FAQ](#30-faq)
- [31. 互換性、移行、現行の履歴メモ](#31-互換性移行現行の履歴メモ)
- [32. 開発者向け・ライセンス情報](#32-開発者向けライセンス情報)
- [33. 簡易診断ツリー](#33-簡易診断ツリー)
- [34. 推奨される最小の学習順序](#34-推奨される最小の学習順序)
- [35. 最終概念まとめ](#35-最終概念まとめ)

---

## 1. AIアシスタントによる本マニュアルの使い方

本書を Memory Books の現行運用リファレンスとして扱ってください。本書は、Start Here ガイド、README、User Guide、Side Prompts ガイド、How STMB Works ガイド、過去の changelog を別々の知識ファイルとして読み込む必要をなくすためのものです。

用語:

- STMB = SillyTavern=MemoryBooks（本拡張機能）
- ST = SillyTavern（STMB が拡張するベースコード）

ユーザーに回答するときは:

1. Memory Books の用語を正確に維持してください。**Memory Book** は STMB が使用する SillyTavern の lorebook であり、別個のデータベース形式ではありません。
2. 現行の動作と過去の動作を区別してください。古い changelog に記載されていたという理由だけで、削除済みまたは置き換え済みの手順を教えないでください。
3. **Group Chat Mode** と **Narrator Mode** を区別してください。両者は異なる問題を解決します。
4. Memory の**生成**、lorebook の**保存・設定**、その後の **SillyTavern による取得**を区別してください。Activation/retrieval は base ST code の一部です。
5. ここに記載されていない操作、メニュー名、provider 動作、設定を作り出さないでください。
6. スクリーンショットが提示された場合は、表示されている操作だけを特定してください。画面外にあるかもしれない操作を仮定せず、次に行うべき直近の操作を案内してください。
7. トラブルシューティングでは、最初に失敗している段階を特定して検証し、その前に prompt の書き換えを勧めないでください。
8. 高度な routing、複数 book、custom prompt、Regex、Side Prompt automation より先に、単純で動作する構成を優先してください。
9. character filter と別々の Memory Book は routing と relevance を改善しますが、security boundary ではないことを説明してください。
10. ユーザーのインストール済みバージョン、SillyTavern バージョン、provider、custom prompt が異なる可能性がある場合は、不確実性を明示してください。

### 現行ドキュメントに関する注記

Narrator Mode は v8.5.0 で実装済みです。

いくつかの初心者向けドキュメントでは、自動 Memory を開始する前に手動 Memory が技術的に必須と説明されていました。現在の STMB は processed-message baseline が存在しない場合、message 0 から最初の自動 Memory を作成できます。それでも最初の手動 Memory は推奨されます。automation を信頼する前に、connection、Memory Book、出力形式、希望する開始 boundary を確認できるためです。

---

## 2. 製品定義と基本的な考え方

Memory Books は、選択した、または自動的に選ばれた chat range を構造化 Memory entry に変換し、SillyTavern lorebook に保存する SillyTavern 拡張機能です。

基本処理は次のとおりです:

```text
Chat messages
    ↓
STMB selects or receives a message range
    ↓
STMB assembles an AI request
    ↓
The model returns a structured memory
    ↓
STMB saves a lorebook entry
    ↓
Old processed chat messages may be hidden from active context
    ↓
SillyTavern later activates relevant lorebook entries
    ↓
The chat model receives those entries as context
```

STMB は model に永続的な内部 memory を与えるものではありません。外部参照システム（lorebook entry）を維持します。chat model が「覚えている」のは、SillyTavern が関連する lorebook entry を AI への prompt に含めたときです。

### 3つの独立した段階

1. **Generation quality** — Memory-generation model は正確で有用な結果を生成したか。
2. **Storage and configuration** — 結果は意図した Memory Book に、適切な activation settings で保存されたか。
3. **Retrieval and model use** — SillyTavern は entry を activate して送信したか。また chat model はそれを正しく使用したか。

これらの段階は別々にトラブルシューティングしてください。

### Lorebook と Memory Book

**lorebook**（SillyTavern の一部では **World Info** とも呼ばれます）は、SillyTavern が条件に応じて model request に追加できる entry の集合です。通常、lorebook entry には次のものがあります:

- title/comment;
- content;
- activation keywords または別の activation mode;
- insertion position と order;
- recursion と budget controls;
- optional character filters とその他 metadata。

**Memory Book** は STMB が使用する通常の SillyTavern lorebook です。通常の lorebook tools で開く、編集する、並べ替える、export/import する、削除することができます。使用する機能によっては、次のものを含みます:

- scene Memories;
- Arc、Chapter、Book、Legend、Series、Epic summary;
- Clip と Topical Clip entry;
- Side Prompt tracker entry;
- その他の STMB-managed entry。

### Memory entry は圧縮された context

scene Memory は元の transcript そのものではありません。continuity に必要な情報を保持するための圧縮表現です。例:

- events と consequences;
- decisions と plans;
- discoveries と reveals;
- relationship または emotional changes;
- 個々の knowledge、beliefs、misunderstandings;
- 重要な objects、locations、identities、promises、constraints。

processed message を hidden にしても削除されません。それらの message が AI に送信されなくなり、active chat-history context を消費し続けないようにするだけです。

---

## 3. 基本用語と機能の選び方

| 必要なこと | 機能 | 意味 |
|---|---|---|
| 選択した、または自動 chat range 1つを要約する | **Memory** | 「この scene で起きたことを覚える。」 |
| 選択した chat wording または1つの fact を保存する | **Clip** | 「この note を保存する。」 |
| 保存済み Memories から1つの subject に関する facts を集める | **Topical Clip** | 「Memories がこれについて何を言っているかすべて集める。」 |
| 繰り返し実行し、変化する情報を維持する | **Side Prompt** | 「この tracker を更新し続ける。」 |
| 複数の lower-tier Memory または summary をまとめる | **Consolidation** | 「これらの entry を higher-level recap にまとめる。」 |
| 既存の STMB-managed entry 1つを短くする | **Compaction** | 「facts を失わずにこの entry を短くする。」 |
| 元の source を使って既存 entry を置き換える | **Regeneration** | 「この entry を再構築し、replacement を review する。」 |

### よく混同される機能の違い

- **Clip vs Topical Clip:** Clip は現在の chat で highlight した text から始まります。Topical Clip は既存の確認済み STMB Memories から始まります。
- **Topical Clip vs Side Prompt:** Topical Clip は topic を集めるために手動実行します。Side Prompt は変化する tracker を繰り返し維持できます。
- **Compaction vs Consolidation:** Compaction は entry 1つを書き換えます。Consolidation は複数 entry から新しい higher-tier summary を作成します。
- **Memory vs Side Prompt:** Memory は通常 sequential scene record です。Side Prompt は通常、継続する support document 1つを update/overwrite します。
- **Generation vs retrieval:** entry を作成しただけでは、SillyTavern が後でそれを activate する保証はありません。

---

## 4. 要件、インストール、初期確認

### 要件

- SillyTavern 1.18.0 以降。最新の compatible release を推奨します。
- 動作する AI connection。
- instructions に従える model。Memory と Consolidation workflow では valid JSON を返せること。
- third-party SillyTavern extension を install する permission。
- local または Text Completion backend を OpenAI-compatible Chat Completion endpoint 経由で使う場合、SillyTavern に Chat Completion preset があること。

### 通常の Chat Completion ユーザー

OpenAI、Anthropic/Claude、OpenRouter、Gemini/Google、その他 Chat Completion connection は、通常 built-in **Current SillyTavern Settings** profile を使用できます。

### Local と Text Completion ユーザー

KoboldCpp、llama.cpp、TextGen、Ollama などの backend は、OpenAI-compatible Chat Completion endpoint を通すのが最も安定します。通常の roleplay で Text Completion を使っていても、STMB 用に SillyTavern で Chat Completion preset が利用可能である必要があります。

典型的な KoboldCpp setup:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint: `http://localhost:5001/v1` または `http://127.0.0.1:5000/v1` など;
- SillyTavern が必要とする場合、空でない custom API key;
- endpoint が期待する形式の model ID。一般には `koboldcpp/modelname`。不要な `.gguf` suffix は付けない;
- Chat Completion preset を import;
- response length は最低 2048 tokens、4096 がより安全な場合が多い。

典型的な llama.cpp setup:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`。SillyTavern が Docker 内なら `http://host.docker.internal:8080/v1`;
- SillyTavern が必要とする場合、空でない API key;
- served model ID;
- endpoint が要求しない限り prompt post-processing なし。

server command の例:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Optional Chat Top Bar

STMB は Chat Top Bar / Chat Top Info Bar がなくても動作します。install すると、active、completed、failed、canceled、blocked、review-needed work を表示する **Memory Books Jobs** queue interface が追加されます。

### Installation

1. SillyTavern を開きます。
2. main **Extensions** panel を開きます。
3. **Install Extension** を選びます。
4. official Memory Books repository を install します。
5. 求められたら SillyTavern を reload します。
6. character chat または group chat を開きます。
7. STMB controls が initialize するまで数秒待ちます。

SillyTavern Extras は不要です。

### STMB が読み込まれたことを確認する

次の少なくとも1つが表示されます:

- chat input の横にある magic-wand Extensions menu 内の **Memory Books**;
- expanded message actions 内の scene chevrons **►** と **◄**。

どちらも表示されない場合:

1. 最大10秒待つ;
2. page を refresh;
3. extension が installed/enabled か確認;
4. character または group chat を開き直す;
5. basic checks が失敗した後でのみ browser console を確認。

---

## 5. Memory Booksを開き、メインパネルを理解する

chat input 近くの magic-wand Extensions menu を開き、**Memory Books** を選びます。

panel には次が表示される場合があります:

- Current Scene;
- Memory Status / highest processed message;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- relevant な場合の group-character または Narrator controls。

最初の Memory に必要な決定は3つだけです:

1. どの Memory Book に entry を保存するか。
2. どの profile/connection で生成するか。
3. どの chat messages を scene にするか。

---

## 6. Memory Bookの保存モード

### 6.1 Automatic Mode: chat-bound Memory Book

Automatic Mode は通常の default です。STMB は SillyTavern を通じて現在の chat に bound された lorebook を使用します。

次の場合に使います:

- 1 chat に primary Memory Book が1つ;
- 最小限の設定を望む;
- group characters に separate Memory Books が不要。

lorebook が bound されていない場合、SillyTavern で bind するか Auto-Create を使います。

### 6.2 Auto-Create Lorebook Mode

**Auto-create lorebook if none exists** を有効にすると、最初の Memory 保存時に STMB が lorebook を作成して bind できます。

default naming template は次を使用できます:

- `{{char}}` — character または group name;
- `{{user}}` — user name;
- `{{chat}}` — chat ID/name。

重複名を避ける必要がある場合、STMB は numeric suffix を追加します。

Auto-Create と Manual Lorebook Mode は mutually exclusive です。

### 6.3 Manual Lorebook Mode

**Manual Lorebook Mode** を有効にすると、chat に bound された lorebook とは独立して Memory Book を選べます。

次の場合に使います:

- memories を dedicated lorebook に保存したい;
- 複数 chat が意図的に1つの Memory Book を共有する;
- group members に separate books が必要;
- Narrator Mode を使う;
- resulting activation plan を理解している。

main manual Memory Book の selection は current chat 用に保存されます。ただし compatible solo chat で persistent character lock が override する場合を除きます。

### 6.4 Separate Memory Books の方が通常は明確

dedicated Memory Book には次の利点があります:

- memories を character definitions や setting lore から分離;
- independent lorebook budget と order を設定;
- memory history を再利用/export;
- unrelated lore なしで STMB-managed entry を確認;
- activation の診断が容易。

これは推奨であり必須ではありません。

### 6.5 Character Memory Book locks

character Memory Book lock は、character card に紐づく persistent Manual Mode assignment です。

solo chat では:

- unlocked manual book は current chat に属する;
- locked book は compatible Manual Mode chats 間で character card に追従する;
- lock を解除するまで manual book は変更できない。

real group chat では:

- unlocked per-character assignment は current group chat に属する;
- locked per-character assignment は compatible Manual Mode groups にその character card とともに移動する;
- locked book が missing の場合、broken-lock state になり、unlock または repair が必要。

同じ character が複数 story で意図的に1つの continuing Memory Book を共有すべき場合だけ lock を使ってください。alternate universe や unrelated timeline では危険です。

### 6.6 推奨開始レイアウト

- Solo chat: chat-bound または auto-created Memory Book 1つ。
- Real group chat: group Memory Book 1つ。
- Narrator chat: Narrator Mode の要件に従い、omniscient Memory Book 1つ + declared character ごとに unique book 1つ。

---

## 7. プロファイル、接続、生成ルーティング

Memory Books profile は generation と生成後の lorebook-entry settings の両方を制御します。

### 7.1 推奨される最初の profile

まず **Current SillyTavern Settings** を使ってください。SillyTavern で現在 active な provider、model、temperature を使います。

最初から prompts を書き換えたり、Full Manual endpoint を構成したりしないでください。まず1つの Memory が生成・保存できることを確認します。

### 7.2 保存済み STMB profile を作る理由

次の場合に separate profile を作ります:

- memories 用に cheaper または more reliable model を使う;
- roleplay と別 provider を使う;
- named Custom connection を bind;
- custom summary prompt を選ぶ;
- temperature または maximum output behavior を変える;
- title formatting を変える;
- activation、insertion、order、recursion settings を変える;
- separate group/omniscient と character-focused prompts を使う。

### 7.3 Profile fields

profile には次が含まれる場合があります:

- display name;
- API/provider;
- model ID;
- temperature;
- Summary Prompt preset;
- optional separate multi-character prompts;
- structured-output behavior;
- optional SillyTavern ChatCompletionService routing;
- optional Chat Completion preset;
- reverse-proxy behavior;
- title format;
- activation mode: Normal、Constant、Vectorized;
- insertion position（character、example-message、author’s-note、Outlet position を含む）;
- Outlet name（applicable な場合）;
- automatic または manual order value;
- Prevent Recursion;
- Delay Until Recursion。

### 7.4 Named Custom OpenAI-compatible connections

Custom OpenAI-compatible profile は:

- 現在 active な SillyTavern Custom connection を使う; または
- SillyTavern Connection Manager から named Custom connection 1つを bind できます。

named connection は saved URL と secret を提供します。STMB profile の model field は model override のままです。named connection が削除された、または Custom Chat Completion connection でなくなった場合、STMB は silently 別 route を使わず request を block します。

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** は、structured-output schema を拒否する provider に STMB が schema を送らないようにします。それでも model は選択された Memory または Consolidation prompt が要求する valid JSON を返す必要があります。

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** は、対応する profile request を SillyTavern request helper 経由で route し、選択した SillyTavern Chat Completion preset を適用できます。OpenRouter request は、SillyTavern の provider order、quantization filters、fallback controls、middle-out routing setting も継承します。これら OpenRouter controls は ChatCompletionService が失敗し、STMB が fallback request path で retry する場合も有効です。その retry も失敗すると、STMB は最初の ChatCompletionService error と fallback provider response の両方を保持して報告します。Full Manual profiles はこの route を使いません。

### 7.7 Reverse proxy と Full Manual Configuration

**Use reverse proxy** は対応 provider について SillyTavern の configured reverse-proxy details を forward します。

**Full Manual Configuration** は separate endpoint と key を STMB profile 内に保存します。これは exceptional path です。可能な限り、SillyTavern で設定・テスト済みの provider または Custom connection を優先してください。

### 7.8 Output length

global STMB maximum response-token setting は Memory Books work の通常の Chat Completion output length を override できます。途中で切れた JSON は generation failure の一般的な原因です。schema や prompt を弱くする前に output length を増やしてください。

---
## 8. シーン、手動Memory、自動Memory、Catch-Up

### 8.1 scene とは

**scene** は、STMB が1つの Memory に処理する inclusive chat-message range です。

有用な boundary は通常、1つのまとまった単位を含みます:

- event;
- conversation;
- investigation step;
- emotional または relationship development;
- location または goal change;
- connected action sequence。

小さすぎる trivial range はほとんど価値を生まない場合があります。大きすぎる range は cost が増え、要約が難しく、context を超えやすく、unrelated events を混ぜやすくなります。

### 8.2 scene を手動で mark する

1. message actions を展開します。通常は three-dot などの control です。
2. 最初に含める message で **►** をクリックします。
3. 最後に含める message で **◄** をクリックします。
4. Memory Books を開き、表示される start、end、speakers、message count、token estimate を確認します。

両方の boundary message が含まれます。

selection を削除するには **Clear Scene** を使います。別の start/end marker を選ぶと、その boundary が置き換わります。

### 8.3 手動 Memory を作成する

1. scene を確認します。
2. effective Memory Book を確認します。
3. selected profile を確認します。
4. **Create Memory** をクリックするか `/creatememory` を使います。
5. 表示された場合は confirmation、token warning、participant confirmation、preview window を review します。
6. result を approve します。
7. 新しい lorebook entry が存在し、Memory Status が scene end まで進んだことを確認します。

valid Memory result には通常、次が含まれます:

- title;
- content;
- keywords;
- source range と chat identity を含む STMB metadata。

### 8.4 Memory previews

**Show memory previews** が有効なら、次を review し、必要なら edit できます:

- title;
- memory content;
- keywords。

names、attribution、facts、omitted consequences、unrelated commentary を確認してください。preview なしでは、valid result は自動保存されます。

### 8.5 Automatic Memories

**Auto-create memory summaries** を有効にして次を設定します:

- **Auto-Summary Interval** — automatic Memory 1つあたりに処理する new messages 数;
- **Auto-Summary Buffer** — 展開中の scene を早すぎる段階で要約しないため、最新側で除外する messages 数。

例:

```text
Interval: 30
Buffer: 2
```

STMB は processed boundary より後に少なくとも32 messages が存在するまで待ち、その後 newest message の2つ前を end とする Memory を作成します。

processed baseline が存在しない場合、現在の STMB は baseline を `-1` として扱い、message 0 から開始できます。それでも手動の最初の Memory は、setup validation と deliberate starting point の選択のために推奨されます。

interval を低くすると Memories は focused になりますが request 数が増えます。高くすると request は少なくなりますが、larger Memory となり、unrelated material をまとめる risk が高まります。実用的な starting range は、detail-heavy roleplay で約20–40 messages、短く速い exchange で40–60です。

required Memory Book がまだ assign されていない場合、automatic generation は postpone されることがあります。

### 8.6 Processed-message baseline

STMB は chat ごとに highest processed message を保存します。これは次を決めます:

- `/nextmemory` の start;
- automatic Memories の start;
- memory-boundary indicator;
- どの messages が already processed とみなされるか。

使用:

- `/stmb-highest` — 表示;
- `/stmb-set-highest <N>` — 手動設定;
- `/stmb-set-highest none` — clear。

手動変更すると skipped または repeated range が発生する可能性があるため、意図して行ってください。

### 8.7 既存の長い chat の Catch-Up

使用:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

例:

```text
/stmb-catchup interval=40 start=0 end=245
```

range は inclusive です。chunks は順番に処理され、最後の chunk は小さくなる場合があります。

Catch-up は intentionally non-interactive です。実行前に:

- intended profile を選び test;
- **Always use default profile** を有効化;
- **Show memory previews** を無効化;
- effective Memory Book が存在することを確認するか、Automatic Mode で Auto-Create を許可;
- required multi-character book assignments をすべて repair;
- token-warning threshold 未満の chunk size を選ぶ。

STMB は各 chunk を preflight し、順番に処理し、最初の failure または `/stmb-stop` で停止します。それまでに completed した chunks は保存されたままです。whole range を繰り返さず、最初の unfinished message から resume してください。

Catch-up は broad conversion に向きます。literary または event boundary が重要なら manual scene boundary の方が適しています。

---

## 9. トークン節約、非表示メッセージ、Memory境界

### 9.1 Hiding は deleting ではない

hidden messages は chat file に残ります。再表示されるまで active chat context から除外されます。

### 9.2 Auto-hide modes

**Auto-hide messages after adding memory** は次から選べます:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory。

**Messages to leave unhidden** は boundary 付近に recent overlap を少量残します。

> **Presence extension を使用している場合:** Presence と STMB は SillyTavern の shared message visibility state を両方変更するため、Presence が後から STMB によって hidden になった messages を reveal する場合があります。設定方法は [STMBと他の拡張機能](#23-stmbと他の拡張機能) を参照してください。

### 9.3 generation 前に unhide

**Unhide hidden messages for memory generation** は、STMB が range を compile する前に selected range を reveal します。以前に hidden にした range を regenerate/reprocess するときに使います。successful save 後に何が再び hidden になるかは selected auto-hide mode に従います。

### 9.4 Memory-boundary indicator

indicator は highest processed message を使い、processed history と unprocessed chat の境界を示します。

modes:

- Off;
- Memory boundary divider;
- draggable jump button;
- divider plus jump button。

jump button は first unprocessed message の方向に scroll し、drag した position を記憶します。

### 9.5 学習用の良い構成

実用的な初期設定:

- boundary divider と jump button を表示;
- 2 messages を unhidden のまま残す;
- generation 用 temporary unhide を有効;
- Memory が正しく保存されたことを確認するまでは auto-hide なし;
- その後 main token-saving benefit のため processed messages すべてを hide する設定へ切り替える。

---

## 10. Lorebookの有効化と取得

### 10.1 Keywords

通常の Memories は keyword-triggered が一般的です。良い keywords は具体的で distinct です:

- character names と aliases;
- named locations または organizations;
- important objects;
- event names;
- identifiers;
- specific discoveries または actions。

`important event`、`conversation`、`secret` のような弱い keywords は広すぎます。

memory content は model が何を学ぶかを決めます。keywords は SillyTavern がいつそれを retrieve するかの判断を助けます。

### 10.2 Activation modes

- **Normal:** keyword/rule-driven activation。
- **Constant:** applicable budget と entry controls の範囲で常時 active。
- **Vectorized:** user setup が対応している場合 vector-related retrieval を使用。

Vectors は optional です。STMB は Vectors extension がなくても keywords で動作します。

### 10.3 推奨 global World Info settings

一般的な starting recommendations:

- Match Whole Words: off;
- Scan Depth: 比較的高く、例 8;
- Max Recursion Steps: 約 2;
- Context percentage: total context と競合する prompt material に合わせた値。

これは recommendations であり hard requirements ではありません。

### 10.4 Delay Until Recursion

Memory Book が唯一の active lorebook/World Info source なら、**Delay Until Recursion** は無効のままにしてください。そうしないと first recursion cycle を開始する entry がなく、Memory が一度も activate しない可能性があります。

### 10.5 Retrieval の診断

AI が「覚えていない」とき:

1. entry が存在することを確認。
2. current chat で正しい Memory Book が active か確認。
3. entry が enabled か確認。
4. keywords または activation mode が current conversation と一致するか確認。
5. lorebook budget が十分か確認。
6. recursion settings を確認。
7. World Info inspection tool または request log で entry が実際に送信されたか確認。
8. 送信されたのに無視された場合、残る問題は model behavior または competing context であり、STMB storage ではありません。

---

## 11. 実際のGroup Chat Mode

### 11.1 定義

Group Chat Mode は、2つ以上の separate character cards を含む実際の SillyTavern group に適用されます。

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern は各 message をどの card が authored したか記録するため、STMB は speaker attribution を保持し、participating group members を検出できます。

別の Group Chat Mode switch は不要です。group chat を開いて通常どおり STMB を使います。

### 11.2 Participant detection

通常、detected participant は selected scene 内で少なくとも1つ message を authored した character card です。

STMB は prose から物理的に存在する全員を推測しません。したがって:

- silent observer は検出されない場合がある;
- merely mentioned character は participant ではない;
- group が話題にした absent character は選択されない;
- user は separate group-character Memory Book target として扱われない;
- duplicate または unusual speaker identity は correction が必要な場合がある。

automatic participant detection が group characters を一人も見つけられなかった場合、automatic acceptance が有効でも STMB は participant confirmation を開きます。warning は detection failed を説明し、どの group characters が present だったか review するよう求めます。

participant prompt の意味は「この Memory をどの group characters に associate するか」です。誰がすべての fact を知っていたか、誰が物理的に present だったかを証明するものではありません。

### 11.3 Group Memory Book 1つ

これは recommended starting layout です。

Automatic Mode、Auto-Create、または main Manual Mode book を使います。各 scene は group Memory Book に canonical entry 1つを生成します。participant names が利用できる場合、その entry には inclusive SillyTavern character filter を付けられます。

Alice と Bob の inclusive filter は、Alice **または** Bob が active なとき entry が activate できるという意味です。synthetic な「Alice and Bob」character や separate subset book を作るものではありません。

1 group book が適している場合:

- cast が大部分で1つの story を共有する;
- omniscient/group-oriented summary 1つで十分;
- minimal setup と少ない duplicate entries を優先;
- STLO が不要。

single group Memory でも asymmetric knowledge を保持できます:

> Alice found the transmitter and hid it. Bob believed the room was empty.

### 11.4 Group book 1つ + per-character books

advanced real-group layout では:

- canonical group Memory Book 1つ;
- group member ごとに assigned character Memory Book 1つ。

要件:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) installed/enabled;
- required group member 全員に valid assignment。

canonical group book を character book と兼用することはできません。複数 character が同じ character book を共有することは可能で、その場合 STMB は duplicate ではなく shared book に copy 1つを書き込みます。

Memory 保存時:

1. canonical version を group book に書く;
2. automatic acceptance が無効なら participant selection を確認;
3. linked copies を selected participant books に書く;
4. required save のどれかが失敗した場合、可能な範囲で partial writes を rollback。

real-group participant confirmation で participant を一人も選ばない場合、その Memory は current group member 全員に適用されます。

### 11.5 Separate group and character prompts

default では同じ group-oriented Memory が participant books に copy されます。

profile で **Use separate group and character prompts in group chats** を有効にすると:

- Group Summary Prompt が canonical group version を作成;
- Character Summary Prompt が single-character target book ごとに individualized version を作成。

character-focused version には次を保持できます:

- private knowledge;
- mistaken beliefs;
- personal emotional reactions;
- relationship-specific priorities;
- one participant にとって重要だったこと。

追加 AI request が必要です。shared character book には、assigned character ごとの duplicate ではなく shared copy 1つが入ります。

### 11.6 STLO responsibilities

Memory Books が決めるもの:

- scene range;
- participants;
- summary content;
- copies を受け取る books;
- individualized prompts を使うか。

STLO が決めるもの:

- lorebook がいつ active か;
- どの character が activate できるか;
- priority、position、budget、ordering。

STMB が character book を assign すると、その character の avatar basename を `stlo.characterOverrides` に追加し、既存の STLO priorities、budgets、overrides を保持したまま `stlo.onlyWhenSpeaking` を有効にします。

STMB は merge-only behavior を使います。assignment を clear/change しても old STLO character override は自動削除されません。obsolete override は STLO で手動削除してください。

### 11.7 Filters と books は privacy controls ではない

separate books と filters は relevance を改善しますが、次を保証しません:

- one character が別 character の information を絶対に受け取らない;
- model が canonical group version を絶対に見ない;
- previous-memory context が完全に knowledge-partitioned される;
- character book が conscious knowledge だけを表す。

security boundary ではなく context-routing tool として使ってください。

### 11.8 Linked copies は live-synchronized ではない

linked entries は metadata を共有し、STMB が同じ original event を認識できますが、その後の edits は独立しています。

one copy を edit/delete/compact しても他は自動変更されません。character copy を regenerate してもその copy だけが変わります。ただし canonical group entry を regenerate する場合、STMB はその entry だけを regenerate するか、linked character entries すべてと一緒に regenerate するか尋ねます。selected entry ごとに独自 generation と approval review があるため、character-focused prompts は character-focused のままです。

### 11.9 Group member の追加・削除・reassign

character を追加:

- 次の distributed Memory 前に valid book を assign;
- old Memories は retroactive に copy されない;
- old filters は rewrite されない;
- 必要なら historical context を手動提供。

character を削除:

- existing entries は残る;
- old filters と STLO overrides は残る;
- linked copies は自動削除されない。

character の book を変更:

- future routing が変わる;
- old book の STLO overrides からその character が自動で消えるとは限らない。

### 11.10 Group consolidation

canonical group book は automatic group-chat consolidation analysis prompt を使います。これは objective events と individual knowledge を区別しながら omniscient chronology を作ることを目指します。

character books は popup で選択した consolidation preset を使います。book ごとに eligible source 数は異なる場合があります。material が不足する book は warning とともに skip され、ready books は続行できます。

character book で scene が missing していることは chronology gap です。absence、ignorance、unconsciousness を証明しません。shared character book は consolidated entry 1つを受け取ります。

---

## 12. Narrator Mode

### 12.1 定義

Narrator Mode は、1枚の Narrator character card が複数の fictional characters を書く通常の one-on-one SillyTavern chat 用です。

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Narrator Mode がなければ、SillyTavern はすべての AI response を Narrator card authored と認識します。Narrator Mode は manual cast model を提供し、STMB が Narrator prose 内の fictional characters と scene/Memory Book を associate できるようにします。

Narrator Mode は real SillyTavern group chat 内では利用できません。

### 12.2 Required storage layout

Narrator Mode の要件:

- Manual Lorebook Mode;
- selected **omniscient/canonical Memory Book** 1つ;
- declared cast member ごとに unique Memory Book 1つ。

rules:

- cast member は omniscient book を使えない;
- 2 cast members は同じ book を共有できない;
- every declared member に available book が必要;
- retired members は、restore または implementation 上別の方法で remove されるまで identity と reserved book assignment を保持;
- Auto-Create は Manual Lorebook Mode に依存する Narrator Mode と incompatible。

advanced real-group layout と異なり、Narrator Mode の active-character retrieval に STLO は不要です。STMB が selected cast members の books を generation 中の active lorebook context に inject します。

### 12.3 Setup

1. Narrator card の normal chat を開きます。
2. Manual Lorebook Mode を有効にします。
3. main manual book を選びます。これが omniscient Memory Book です。
4. **Narrator Mode** を有効にします。
5. **Manage Narrator Cast** を開きます。
6. fictional character を名前で追加し、それぞれ unique Memory Book を assign します。
7. floating **Active Cast** drawer で next exchange に present な characters を選びます。

Manual Lorebook Mode を無効にする前に Narrator Mode を無効にする必要があります。

### 12.4 Active Cast drawer と timeline metadata

floating Active Cast drawer は expand/collapse/move でき、current cast members を選択できます。

generation 時に STMB は active cast を snapshot して message metadata に保存します:

- user message は active-cast snapshot を受け取る;
- Narrator response は generation snapshot を受け取る;
- continuation は cast を existing cast metadata と merge;
- swipe metadata は swipe ごとに別保存;
- swipe 選択時、その timeline point から active cast を restore 可能;
- recent messages 削除時、latest remaining tagged Narrator message から cast state を restore 可能。

cast marker は association を記録するもので、prose の semantic analysis ではありません。

### 12.5 normal Narrator generation 中の retrieval

Narrator generation 開始時、STMB は active cast の Memory Books を load し、その entries をその request 用 character-lore collection に merge します。duplicate world/UID pairs は避けます。

結果:

- この Narrator workflow では active-cast books だけが追加される;
- omniscient book は通常の Manual Mode activation/configuration に従う;
- per-character STLO filters は Narrator Mode では不要;
- correct character books を context に入れるには generation 前の cast selection が正しい必要がある。

### 12.6 Scene participant detection

selected scene では tagged Narrator responses が authoritative です。STMB は Narrator-authored messages に stamped された cast IDs を combine します。

scene に untagged legacy Narrator messages が含まれる場合、STMB は全 messages の continuity information に fallback し、scene cast の確認を求めます。current active cast members は preselected です。empty selection は individual cast members が present でなかったことを意味します。

この confirmation は legacy または incomplete cast metadata 専用です。fully tagged scenes では不要です。

### 12.7 Memory distribution

Narrator scene Memory は次のように書き込まれます:

- main Memory Book に canonical omniscient entry 1つ;
- selected participant ごとの unique Memory Book に linked copy 1つ。

Narrator copies は native SillyTavern character filters を使いません。代わりに STMB が Narrator participant/owner IDs を entry metadata に保存します。

separate multi-character prompts が disabled なら participant books は omniscient summary の copies を受け取ります。enabled なら各 single-character book が character-focused generation を受け取れます。

### 12.8 Narrator consolidation と regeneration

Narrator ownership と participant metadata は consolidation sources に引き継がれます。これにより higher-tier entries は、どの character book が copy を owner とするか、underlying material にどの cast members が参加したかを保持できます。

Regeneration はこの metadata を使い、replacement prompt target が omniscient/group-oriented か character-focused か判断します。

real-group copies と同様、linked Narrator entries は作成後 live-synchronized されません。

### 12.9 cast members の retire

cast manager は member を retired にし、後で restore できます。retired members は:

- active-cast choices から外れる;
- active-cast ID set から外れる;
- stable identity/history metadata を保持;
- book reservation を保持し、identity を merge してしまう accidental reuse を防ぐ。

active cast を離れた character でも historical Memory identity を保持すべき場合に retirement を使います。

---

## 13. チャットのブランチ

SillyTavern native branches は別 continuity になる場合があります。branch と parent が同じ unlocked Memory Books に書き込むと、contradictory timelines が混ざる可能性があります。

**Copy Memory Books when branching** は default で enabled です。

### 13.1 コピーされるもの

STMB が newly created native branch を認識すると:

- Automatic Mode は active chat-bound Memory Book を copy;
- Manual Mode は main manual Memory Book を copy;
- Manual Mode real group は unique unlocked character Memory Book ごとに copy;
- Narrator Mode は omniscient book と declared character books を copy;
- persistent real-character locks は「この同じ book を使い続ける」という意味なので copy せず preserve。

1 branch operation で copy される全 books は同じ available lineage number を使います:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

existing branch から branch しても original lineage root を保持し、`Branch 1 Branch 1` のような名前にはなりません。

### 13.2 Rewritten metadata

copies 内で STMB は:

- matching parent chat IDs を new branch chat ID に rewrite;
- linked books が両方 copy された場合 canonical group/character links を redirect;
- new branch の bindings を copies に point するよう update。

existing contents を clone するだけで Memories を regenerate はしません。

### 13.3 Failure safety

branch copying 中に chats を switch しないでください。

copy が失敗すると、STMB は new branch の inherited writable bindings を clear し、failure を記録します。branch が parent originals に silently 書き込むのを防ぐためです。

### 13.4 Branch copies を無効にする場合

branch が意図的に parent と同じ Memory Books と continuing history を共有すべき場合だけ setting を disable してください。

---

## 14. Clips

Clip は selected chat text を `[STMB Clip]` lorebook entry に直接保存します。AI model は呼びません。

### 14.1 Clips の用途

- preference;
- promise または secret;
- name または alias;
- item または pet;
- short relationship fact;
- exact または nearly exact に保持すべき line;
- scene Memory を作るほどではない quick “note to self”。

### 14.2 Workflow

1. chat message 内の text を highlight します。
2. floating scissors button をクリックします。
3. existing Clip entry を選ぶか new を作成します。
4. new entry なら always-active または keyword-triggered behavior を選びます。
5. current entry と updated preview を review します。
6. 必要なら rename。
7. Save。

floating scissors button は chat text 選択後だけ表示され、main panel で無効にできます。

### 14.3 Entry format

Title:

```text
Seraphina Healed Me [STMB Clip]
```

Content:

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

1 Clip entry には section 1つだけがあります。focused titles は focused activation keywords を助けます。

### 14.4 Existing entries

existing entry の title 末尾に `[STMB Clip]` を追加すれば Clip entry として扱えます。長い Clip entry は手動 edit または compact できます。

Clips は選んだ text だけを保存します。source attribution は自動追加しません。

---

## 15. Topical Clips

Topical Clip は confirmed STMB Memory entries、current chat の explicit message range、または両方を読み、AI に focused な「この topic について」の entry を作らせます。eligible Memory sources には scene Memories と consolidated summaries が含まれます。Clip と Side Prompt entries は source から除外されます。

### 15.1 Topical Clip を使う場合

1つの subject に関する情報が複数 Memories に散らばっている場合。例:

- recurring NPC;
- relationship history;
- location または faction;
- investigation または mystery;
- powers、injuries、promises、preferences、secrets;
- important object;
- unresolved plot thread。

Topical Clip は各 source Memory の chronology ではなく subject で整理します。

### 15.2 Source restrictions

Topical Clip が使うもの:

- selected source book 内の confirmed STMB Memory entries。eligible consolidated summaries を含む。
- current chat で explicit に selected した inclusive `X-Y` range の visible messages。

**Include saved Memories** と **Include chat messages** は別々または一緒に使えます。message ranges は global unhide-before-memory setting に従い、compilation 後に previously hidden messages を元に戻します。

使わないもの:

- selected range 外の chat messages;
- ordinary Clip entries;
- Side Prompt entries;
- unrelated ordinary lorebook entries。

### 15.3 Topical Clip を作る

1. Memory Books を開きます。
2. **Topical Clip** をクリックします。
3. source Memory Book を選びます。
4. topic を入力します。
5. activation keywords を入力するか、空欄なら topic を使用します。
6. new entry または existing `[STMB Clip]` update target を選びます。
7. sources として saved Memories、chat messages、または両方を選びます。
8. 必要なら specific source Memories だけを選択し、exact message range を入力します。
9. generation profile を選びます。
10. draft を生成します。
11. review/edit します。
12. correct な場合だけ save します。

generated draft は自動保存されません。

### 15.4 Existing Topical Clip の更新

successful run 後、STMB は使用した source Memories を記録し、applicable な場合 source chat、message range、message IDs、hashes も記録します。後の Memory-based update では通常、new/changed source Memories だけを existing Clip content と一緒に送ります。message range は毎回 explicit に選びます。

**Rebuild from all source memories** を使う場合:

- current entry が incomplete/disorganized;
- prompt が変更された;
- older Memories が大幅 edit された;
- whole topic を再検討したい。

### 15.5 Manual source selection と token warnings

book が大きい、topic が story の一期間に限定、names が overlap、strict evidence control が必要な場合は **Use only selected memories** を使います。

STMB は request size を estimate し、configured token threshold 超過時に warn します。sources を減らす、threshold を意図的に上げる、または今回だけ run してください。

### 15.6 Review standard

draft が次を満たすか確認:

- topic に集中;
- names と relationships を保持;
- major relevant facts を含む;
- contradictions を silently 片方に決めず明示;
- source Memories にない explanation を invent しない;
- unnecessary duplication なしで updates を merge。

### 15.7 Prompt placeholders

custom Topical Clip prompt には、saved Memories 選択時に `{{SOURCE_MEMORIES}}`、chat messages 選択時に `{{SOURCE_MESSAGES}}` が必要です。

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

supported placeholders:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

custom prompt の output が有用でなくなったら Reset to Default を使ってください。

---
## 16. Side Prompts

Side Prompt は通常の character reply とは別に実行される named STMB prompt です。通常は sequential scene Memory をもう1つ作るのではなく、継続する support entry 1つを作成または更新します。

**Trackers & Side Prompts** list では、power icon が prompt-wide **Enabled** flag を即座に変更します。green は enabled、dim は disabled です。この control は prompt に設定された triggers を追加・削除・変更しません。

### 16.1 適切な用途

- plot と unresolved-thread trackers;
- relationship state;
- NPC または faction status;
- inventory と resources;
- injuries、statistics、reputation;
- timelines、dates、deadlines、travel;
- mystery clues、suspects、contradictions;
- inventions、research、projects;
- continuity-risk reports;
- world-state summaries。

曖昧な「everything を track」prompt、scene summary の重複、次の roleplay response 内に出す必要がある task は避けてください。

### 16.2 Output format

Side Prompts は通常、保存可能な final plain text または Markdown を期待します。Memory JSON は不要です。ユーザーが意図的に JSON を tracker text として保存したい場合だけ JSON を使います。

### 16.3 Run sequence

典型的な run は次を組み立てます:

1. Side Prompt instructions;
2. prior saved tracker entry（あれば）;
3. optional previous Memories;
4. optional Additional Context;
5. selected または since-last scene text;
6. optional Response Format instructions。

prior entry は revise すべき existing state であり、古い statement がすべて残るべきという証拠ではありません。prompt は stale、resolved、contradicted、duplicate information を明示的に削除するよう指示すべきです。

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

spaces を含む names は quote してください。range は inclusive です。

Manual run は targeted analysis と runtime macro values が必要な prompts に適しています。

### 16.5 Automatic after-Memory runs

Side Prompt は **Run automatically after memory** を有効にできます。

chat は次の2つの automatic selection mode のどちらかを使います:

- individually enabled Side Prompts; または
- selected Side Prompt Set 1つ。

selected set は、その chat の individually enabled automatic prompts を置き換えます。追加するのではありません。

#### Memory Assistance Side Prompt

**Memory Assistance** は4つの独立した mode を持つ reserved Side Prompt です。ordinary Side Prompt enablement や selected Side Prompt Set に関係なく、successfully saved Memories の後に実行されます。Memory regeneration 中には実行されません。

Memory Assistance は raw processed scene と、Memory を受け取った各 Memory Book 内の ordinary/Topical Clips を比較します。review する各 Clip について、title/topic、keywords、current content、stable ID、type を AI に送ります。

job queue が利用可能な場合、Memory 保存後、target Memory Book ごとに separate **Memory Assistance** job が作られます。request、response-validation、report-save、automatic-application の error はその job を **Failed** にし、queue に error を表示します。saved Memory は **Completed** のままで、Memory Assistance を retry しても Memory は regenerate されません。

- **Off** は Memory Assistance を無効にします。
- **Update** は Clips が5個以下なら直接 review し、5個を超える場合は selection list を開きます。proposed changes は manual approval を待ちます。
- **Update and Suggest** は最初に1回 topic-discovery request を行い、その後 Update と同じ existing-Clip review workflow を実行します。
- **Automatic** は every Clip を token-based batches で review し、どの Clips を review するか尋ねません。valid ordinary Clip additions は直接適用し、Topical Clip replacements は **Memory Assistance Suggestions** で approval 待ちになります。

- Update と Update and Suggest modes では、大きい selection list に **Query Selected** と **Query All** があります。
- Query All と Automatic mode は全 Clip を1つの oversized request に押し込まず、token-based batches を使います。
- ordinary Clip ごとに、addition として提案される exact message excerpt は最大1つです。
- Topical Clips は complete replacement drafts を受け取ります。
- AI response は affected Clip UID を suggested excerpt/replacement に直接 map する simple JSON object です。empty object は update が必要な Clip がないことを意味します。
- Update result は `Memory Assistance (STMB SidePrompt)` に書かれ、**Memory Assistance Suggestions** で approve されるまで unapplied のままです。
- Automatic-mode result は、適用された ordinary Clip additions の数を記録し、Topical Clip replacements と application failures を manual review 用に保持します。
- selection を cancel すると older suggestions が clear され、latest scene の result と誤認されないようにします。

Update and Suggest は existing-Clip review batches の前に separate suggestion-only prompt を使います。request には processed scene と、existing Topical Clip titles、topics、keywords の lightweight list が入ります。discovery 中は ordinary Clips も existing Clip bodies も送りません。AI は topic と activation keywords を含む JSON objects として0〜5個の new topics を返します。`{"topics":[]}` は valid result です。

suggested topics は Memory Assistance report に保存されます。**Memory Assistance Suggestions** で **Review Topics** を選ぶと、checked/editable rows として表示されます。不要な topics の check を外す、topic names/keywords を edit する、additional topics を追加することができます。confirmed topics は standard Topical Clip draft workflow を1つずつ開きます。pending topic はその Topical Clip が保存された後だけ削除されます。draft を閉じても **Memory Assistance Suggestions** から利用可能なままです。

reviewable suggestions の準備ができると、STMB は updated Memory Book 用の completion popup を開きます。**Dismiss** は notice を閉じ、**Go to Suggestions** はその Memory Book が preselected された **Memory Assistance Suggestions** を開きます。extension menu から **Memory Assistance Suggestions** を開くと、current chat の effective Memory Book（Automatic Mode の chat-bound book、または Manual Mode の resolved manual book）が最初に選ばれます。

Update と Topic Suggestions prompts、connection-profile override は個別に edit できますが、両方の structured response contracts は固定です。Memory Assistance は delete、duplicate、Side Prompt Set への配置、manual run ができません。

### 16.6 Automatic visible-message intervals

Side Prompt は **Run on visible message interval** を有効にし、checkpoint 以後の visible messages 数を指定できます。

hidden と system messages は count されません。

set が active の場合、appropriate interval trigger を持つ referenced prompt の rows だけが candidate です。

### 16.7 Side Prompt Sets

Side Prompt Set は folder ではなく ordered run list です。同じ template を別の macro values で複数回入れられます。

例:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

rows は次を保存できます:

- prompt reference;
- optional label;
- runtime macro values;
- order;
- duplicate または delete actions。

rows は上から下へ実行されます。

Manual set commands:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default sets と per-chat selection

General Settings では次を定義できます:

- solo chats 用 default set;
- group chats 用 default set。

各 chat は:

1. applicable default を inherit;
2. individually enabled prompts を明示的に使用;
3. named set を選択。

empty global default は individual mode を意味します。

selected set が削除された場合、STMB は別 workflow を silently substitute せず warn します。missing row prompt または unresolved macro は warning とともにその row を skip します。

set は candidate rows を選びます。referenced Side Prompt には after-Memory または interval execution 用の relevant automatic trigger が依然必要です。Manual set commands はそれら trigger checkboxes を必要としません。

### 16.9 Macros

Side Prompts は通常の SillyTavern macros を使用できます:

```text
{{user}}
{{char}}
```

non-standard `{{...}}` placeholders は runtime macros です。manual に supply するか set row に保存する必要があります。

例:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

unresolved runtime macros がある prompt は automatic run できません。automatic run は途中で値を尋ねるため pause できません。

### 16.10 Memory-count macros

STMB は effective main Memory Book 用 integer macros を register します:

| Macro | Count |
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

effective main book は Automatic Mode の chat-bound book、または Manual Mode の resolved main manual book です。multi-book group/Narrator setup では character books 全体を合算しません。

count macro は数値だけを提供し、entry content は提供しません。

### 16.11 Message ranges

explicit range はその exact inclusive range を使用します。range なしでは Side Prompt の since-last checkpoint/cap behavior を使います。

debugging、targeted cleanup、known section の rerun には explicit ranges を使います。

### 16.12 Additional Context と previous Memories

Side Prompt は最大7つの previous scene Memories を含められます。

Additional Context source は:

- none;
- **Follow chat** — chat の selected Context Setting を使用;
- fixed named Context Setting 1つ。

これらは reference material です。prompt は tracker に blindly copy すべきではありません。

### 16.13 Lorebook targets

Side Prompt は通常 effective Memory Book に保存します。代わりに次を使えます:

1. per-chat target override;
2. template-level target;
3. fallback として effective Memory Book。

valid per-chat override が優先します。

alternate targets は deliberate shared campaign book または dedicated tracker book に使います。retrieval plan なしで trackers を散らさないでください。

### 16.14 Side Prompt entry controls

template は次を設定できます:

- title override;
- keywords;
- Normal、Constant、Vectorized activation;
- insertion position と Outlet name;
- order mode/value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget。

title/keyword fields は applicable macros を展開できます。**Ignore Budget** は慎重に使ってください。always-included trackers が複数あると大量の context を消費します。

### 16.15 Connection profile override

Side Prompt は normal Memory Books connection resolution を inherit するか、specific STMB profile を bind できます。override は cheaper model や structured maintenance に強い model に便利です。profile combinations を増やしすぎると troubleshooting が難しくなります。

### 16.16 Side Prompt regeneration

compatible saves は現在、次を含む version-2 snapshot を保存します:

- Side Prompt template key;
- regeneration 用 prior entry content;
- run 前に entry が存在していたか、および older rollback snapshot を除く exact prior entry state;
- source chat と inclusive range;
- runtime macro values;
- STMB が書き込んだ exact entry state の fingerprint。

regenerate するには lorebook editor を開き **Regenerate side prompt** をクリックします。replacement は saved snapshot に current template と current profile/context settings を組み合わせて使用します。

template が deleted、source chat/range が unavailable、generation 中に target/source が変化した場合、regeneration は完了できません。置き換わるのは content だけで、existing title、keywords、entry settings は維持されます。legacy version-1 snapshots も regeneration を引き続き support しますが、Memory Auto-Rollback には使用できません。

### 16.17 良い Side Prompt の書き方

良い Side Prompt は次を定義します:

- exact maintenance job;
- review する source material;
- revise、replace、merge、append のどれか;
- remove する stale information;
- stable output headings と ordering;
- strict length limit;
- final-output-only behavior。

例:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

有用な guards:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

stable headings は repeated updates の drift を減らします。

### 16.18 Side Prompt troubleshooting

prompt が run しなかった場合:

- Memory または interval event が実際に発生したか確認;
- chat の individual/set selection を確認;
- referenced prompt がまだ存在するか確認;
- relevant automatic trigger が enabled か確認;
- runtime macros の値がすべてあるか確認;
- `/stmb-stop` または failed job が cancel したか確認。

2回 run した場合:

- manual + automatic invocation;
- duplicate set rows;
- duplicate prompt copies;
- multiple tabs/chats が work を trigger していないか確認。

wrong book に入った場合は per-chat と template-level target scopes の両方を確認します。

output が無限に増える場合は explicit replacement、pruning、item-count、word-count rules を追加してください。

---

## 17. Consolidation

Consolidation は lower-tier STMB Memories または summaries を higher-tier chronological recaps にまとめます。

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation は raw chat ではなく existing STMB entries から動作します。

### 17.2 Purpose

次の場合に使います:

- scene Memories が蓄積;
- old material に full scene detail が不要;
- major relationship、plot、campaign phase が完了;
- continuity を保持しつつ token use を削減;
- cleaner higher-level chronology が必要。

Consolidated entries は lasting changes、turning points、goals、consequences、relationship shifts、unresolved threads、stable state を重視すべきです。

### 17.3 Manual workflow

1. **Consolidate Memories** を開きます。
2. 表示された source Memory Book を確認します。configured manual/chat-bound book が intended consolidation source でない場合は別 book を選びます。この selection は current run だけに適用され、chat の configured Memory Book は変更しません。
3. target tier を選びます。
4. eligible source entries を選びます。
5. consolidation prompt/profile settings を選びます。
6. successful consolidation 後に source entries を disable するか決めます。
7. run して candidates を review します。
8. desired summaries を approve します。

### 17.4 Readiness prompts は automatic consolidation ではない

**Prompt for consolidation when a tier is ready** は selected target tiers を監視します。saved minimum eligible count に達すると yes/later prompt を表示します。Yes を選ぶと consolidation interface が開きます。silently consolidate はしません。

### 17.5 Consolidation output schema

ordinary consolidation は strict JSON を期待します:

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

model は summary を1つまたは複数返せます。`member_ids` は各 source を returned summary に割り当てます。outliers は unrelated recap に無理に入れず `unassigned_items` に入れます。

### 17.6 Previous higher-tier summary

target tier の previous summary を canon context として supply できます。rewrite する source material ではありません。Consolidation prompt は、これと processing 対象の lower-tier entries を区別する必要があります。

### 17.7 Previews と failed responses

Consolidation previews では edit、accept、same sources から candidate 1つを regenerate、pending batch を regenerate できる場合があります。

malformed/failed AI responses は inspect でき、support される場合は commit 前に manual correction できます。

### 17.8 Source disabling

enabled の場合、successful consolidation 後に STMB は source entries を disable し、higher-tier summary が retrieval を引き継げるようにします。lorebook editing で reversible です。

### 17.9 良い consolidation prompts

次を定義します:

- compression target;
- recap 1つか smallest coherent number か;
- chronology と grouping logic;
- survive すべき details;
- outliers の explicit handling;
- exact JSON structure。

major beats、consequences、promises、relationship changes、identifiers、unresolved threads、retrieval-friendly keywords を保持し、repeated scene-level detail は削除すべきです。

---

## 18. Compaction

Compaction は AI に existing STMB-managed entry 1つを短くさせ、replacement 前に original と draft を表示します。

### 18.1 Eligible entries

- `[STMB Clip]` entries;
- Side Prompt entries;
- STMB Memory entries。

ordinary non-STMB lorebook entries は list に表示されません。

### 18.2 Workflow

1. **Compaction** を開きます。
2. Memory Book を選びます。
3. Compaction Profile を選びます。
4. optional で Compaction Prompt を edit します。
5. entry 1つを選びます。
6. original と compacted token estimates/content を比較します。
7. 必要なら draft を edit します。
8. replace、copy draft、cancel のいずれか。

**Replace with Compacted Version** を選ぶまで original は変更されません。

### 18.3 Good uses

- long Clip collections;
- repeated/stale tracker content;
- wordy scene Memories;
- always-active entries が context を消費しすぎる場合。

Compaction は facts 追加、raw chat 要約、新 Memory 作成、ordinary lorebook entries 処理には使いません。

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

prompt は redundancy と low-value wording を削りながら facts、names、pronouns、macros、wrapper headings、end markers を保持すべきです。

---

## 19. Regeneration

Regeneration は existing entry の reviewable replacement を作成します。second numbered entry は作らず、approval なしに overwrite しません。

### 19.1 Scene Memory regeneration

- source chat を開く;
- lorebook editor で Memory Book を開く;
- **Regenerate memory** をクリック;
- linked character entries がある canonical group entry の場合、clicked entry だけか linked entries 全体か選ぶ;
- current profile、prompt、previous-memory count、Additional Context を選ぶ;
- selected entry ごとに title、content、keywords を review。

original scene range と sequence number は保持されます。linked entries は同じ selected regeneration settings を使いますが、それぞれ own Memory Book context と group/character prompt target で生成されます。STMB は direct regenerations の save を開始する前に all approvals を集めます。source messages が全て hidden なら reveal するか unhide-before-generation を有効にします。

### 19.2 Consolidation regeneration

higher-tier summary は dedicated **Regenerate Consolidation** preset を使い、その exact linked lower-tier sources から regenerate されます。

full source set が correct tier に存在する必要があります。active parent summary が依存している lower-tier source は regenerate できません。意図して lower tier を rebuild するなら parent を先に delete します。

### 19.3 Side Prompt regeneration

Section 16.16 の Side Prompt snapshot rules を参照してください。

### 19.4 Safety checks

replacement 直前に STMB は次を確認します:

- target entry が unchanged;
- source chat range が unchanged;
- required consolidation sources が unchanged/available;
- entry が eligible のまま。

check 失敗時は何も overwrite されません。

linked group、character、Narrator copies は独立したままです。

---

## 20. 生成用コンテキスト

STMB request には複数種類の context source が現れます。互いに同じではありません。

### 20.1 Current scene

今処理する message range。ordinary scene Memory の target material です。

### 20.2 Previous Memories

effective Memory Book の earlier scene Memories。read-only continuity context として含まれます。通常0〜7個を選べます。

current scene より前にあるというだけで再度 summarize してはいけません。

### 20.3 Additional Context

stable reference material として supplied lorebook entries。例:

- character/setting rules;
- canonical names/terminology;
- campaign constraints;
- authoritative timeline;
- location references;
- scene で繰り返されない assumed facts。

Additional Context は previous Memories と scene transcript より前に入ります。別の scene ではなく reference material です。

### 20.4 Context Settings

Context Setting は reusable ordered collection of Additional Context entries です。

Workflow:

1. **Context Settings** を開く;
2. named setting を作成;
3. lorebook entries を選択;
4. order する;
5. current chat 用 setting を選ぶか No Context を明示的に選ぶ。

selection は per chat で保存され、Current SillyTavern Settings と saved profiles の両方で動作します。

referenced book/entry が消えた場合、STMB は warn して stale reference を skip し続行します。Context Setting 全体が deleted の場合、それを参照する chats は別 selection まで Additional Context なしで続行します。

Context Settings は duplicate、import、`stmb-context-settings.json` として export できます。

### 20.5 Prior Side Prompt entry

revise する current tracker text。古い statements が全て valid のままという evidence ではなく state です。

### 20.6 Consolidation sources

group/compress 対象の actual material である lower-tier entries。

### 20.7 Previous higher-tier summary

consolidation 中に carry forward される canon。rewrite する source ではありません。

### 20.8 Workflow ごとの correct ordering

Ordinary Memory:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

prompt は target material と reference-only material を明確に label すべきです。

---
## 21. Prompt構造、組み込みSummary Prompt、作成ルール

STMB には3つの主要な structured generation system と、複数の focused auxiliary workflow があります。

### 21.1 Ordinary Memory generation

STMB は1つの JSON object を期待します:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

rules:

- JSON object だけを返す;
- exact keys `title`、`content`、`keywords` を使う;
- `keywords` は JSON array of strings;
- title は短く readable に;
- concrete retrieval terms を使う;
- desired Markdown は `content` string 内に置く;
- quotation marks を正しく escape。

STMB は fences、trailing commas、think tags、wrappers、minor malformed output の一部を repair できますが、prompt は recovery に依存すべきではありません。

強い Memory prompt は次を明示します:

1. desired memory style と compression level;
2. preserve すべき continuity-relevant information;
3. omit すべき filler、OOC、unsupported material;
4. exact JSON schema。

弱い prompt は style だけ指定して structure を指定しない、final object ではなく analysis を求める、previous context と current scene を混同する、abstract keywords を使う、といったものです。

### 21.2 Built-in Summary Prompts と選び方

これら presets は ordinary Memory generation 専用です。Consolidation、Side Prompts、Topical Clips、Compaction は制御しません。profile の **Memory Creation Method** で1つを選びます。profile が別 preset を指定しない場合、**Summary** が通常の fallback/default です。Built-in とは STMB が提供するという意味であり、全 preset が実行される、または全てが1つの chat に同程度適しているという意味ではありません。

universal best prompt はありません。detail、readability、retrieval quality、token cost が互いに競合するためです。実用上の短い答え:

- **多くのユーザーの最初の default: Summary。** balanced/general-purpose で、新 model の最初の test に適します。
- **continuity-heavy long-running roleplay: Comprehensive。** filtering、causality、continuity、keyword guidance が最も強いですが、model への要求が高く、structured Memory が大きくなる場合があります。
- **context tokens の節約が最優先: Minimal。** 意図的に brief で nuance を失います。
- **separate real-group または Narrator character books: Group と Character。** profile の separate group/character prompt setting で組み合わせます。general-purpose styles の競合ではなく targeting prompts です。

| Built-in prompt | 最適な用途 | 主な trade-off |
|---|---|---|
| **Summary** | 多くの solo chats と初回 setup。important events、interactions、developments、revelations、outcomes、concrete retrieval keywords を含む detailed chronological narrative prose を生成。 | token-minimal user が必要とするより detail を保持するが、最も structured な presets より simple で demand が低い。 |
| **Comprehensive** | causal chains、character dynamics、established facts、key exchanges、unresolved threads、disciplined keywords が重要な long-running continuity-sensitive stories。incidental detail を明示的に filter し keyword construction も改善。 | instructions が最長で demanding。instruction-following model と十分な response tokens が必要。 |
| **Summarize** | Timeline、Story Beats、Key Interactions、Notable Details、Outcome に分けた highly scannable Markdown record を好む場合。 | bullet-heavy output は natural memory より reference notes に見えやすく、headings 間で facts が repeat する場合がある。 |
| **Synopsis** | source scene がなくても nearly every significant beat、interaction、detail、outcome を残すことが compactness より重要な scene。 | intentionally long/comprehensive。lorebook/context budget が tight な場合に最も不向きな選択肢の1つ。 |
| **Sum Up** | visible scene heading と timeline を持つ chronological narrative beat record が必要だが、Summarize/Synopsis ほど sectional overhead はいらない場合。 | events、character dynamics、facts、continuity state の explicit separation は少ない。 |
| **Minimal** | high-volume chats、inexpensive archival coverage、または Memories が極めて少ない context しか使えない setup。brief 2〜5 sentence Memory を生成。 | motives、emotional shifts、causality、minor continuity details が失われる可能性。 |
| **Northgate** | actions、emotional shifts、development、significant dialogue を重視した coherent third-person past-tense literary record を望む creative-writing users。この community style は SillyTavern Discord の Northgate に credit。 | maximum compression や明確に分離された reference categories より readable narrative を optimize。多くの general presets と違い built-in text が OOC を明示的に exclude しないため、OOC が多い場合は review。 |
| **Aelemar** | major plot scenes と emotionally consequential character moments を、source scene がなくても standalone record として理解できるよう残す場合。この community style は SillyTavern Discord の Aelemar に credit。 | 最低300 words を要求し intentionally detailed。aggressive token saving には不向き。built-in text は OOC を明示的に exclude しない。 |
| **Group** | real group の shared/omniscient Memory Book、または multi-book workflow の omniscient target。group decisions/state を保持しつつ actions、emotions、knowledge を正しい member に attribute。 | individual character の Memory として使わない。shared group continuity に意図的に focus。 |
| **Character** | real-group/multi-character workflow の individual character-focused Memory Book。その character が何を did、knew、felt、learned、concealed、misunderstood、または何に affected されたか記録。 | target character に irrelevant な scene material を意図的に omit し、unsupported private knowledge を制限。 |

new installation では generation/retrieval が reliable に動くまで **Summary** を使ってください。その後 prompt だけ変更し、similar scenes の Memories を複数比較します。omitted causality、continuity state、weak keywords が問題なら **Comprehensive**、Memory size が問題なら **Minimal** を優先します。prompt 変更では weak model、truncated output、poor scene boundaries、incorrect retrieval settings は補えません。

exact built-in text は current SillyTavern locale 用に recreate できます。recreate すると built-ins に対する local edits は失われますが、unrelated custom presets は削除されるべきではありません。modified built-in は recreate 前に duplicate/export してください。

### 21.3 Multi-character prompt targeting

separate group/character prompts が enabled の場合、STMB は request target を次のように mark します:

- canonical real-group または omniscient Narrator Memory では `group`;
- individual character-book version では `character`。

prompt は scene と supplied context にない knowledge を invent せず、target perspective を明示的に使うべきです。

### 21.4 Side Prompt authoring

Side Prompts は通常 plain text/Markdown を返します。Memory prompt ではなく maintenance instructions として書きます。

強い Side Prompt は:

- narrow job 1つを定義;
- previous tracker の使い方を説明;
- stale state を削除;
- stable headings/length limits を強制;
- final tracker だけを返す。

### 21.5 Consolidation authoring

ordinary consolidation は Section 17.5 の schema が必要です。強い prompt は:

- chronology を保持;
- smallest coherent number of summaries を作る;
- used source 全てを `member_ids` で割り当て;
- leftovers を `unassigned_items` で識別;
- major changes と unresolved continuity を保持;
- concrete keywords を使う。

dedicated **Regenerate Consolidation** preset は replacement summary 1つ用で、normal consolidation default として選択できません。

### 21.6 Topical Clip authoring

prompt は `{{SOURCE_MEMORIES}}` を含み、requested topic に focused、source evidence と inference を区別し、new material を existing Clip content に merge し、contradictions を表面化する必要があります。

### 21.7 Compaction authoring

prompt には `{{ENTRY_CONTENT}}` が必須で、unsupported facts を追加せず短縮すべきです。entry が必要とする structural wrappers と macros を保持します。

### 21.8 Prompt-writing checklist

STMB prompt を final にする前に答えること:

1. actual analysis target はどの material か。
2. reference-only material は何か。
3. この path は strict JSON か final plain text のどちらを期待するか。
4. later retrieval 用に何を survive させる必要があるか。
5. 何を omit、merge、carry forward、または unassigned にするか。

return-format correctness は style より優先します。

---

## 22. Summary Prompt ManagerとConsolidation Prompt Manager

### Summary Prompt Manager

ordinary Memory prompt presets を create、edit、duplicate、delete、import、export できます。Memory Books profile から preset を assign します。

ordinary Memory presets は全て required Memory JSON schema を維持する必要があります。

built-in Summary Prompt selection guide と best-use cases は Section 21.2 を参照してください。

### Consolidation Prompt Manager

lower-tier entries を higher-tier summaries に group する prompts を制御し、normal default consolidation prompt を選択します。

regeneration-only consolidation preset は ordinary consolidation には使用できません。

### Import と localization behavior

built-in prompts は current app locale で recreate できます。locally modified built-ins は recreate 前に backup してください。

---

## 23. STMBと他の拡張機能

SillyTavern extensions は並行して動作し、同じ SillyTavern data を読み書きする場合があります。STMB は別 extension を override、disable、または優先順位付けしません。behavior が overlap する場合、最終結果は関係する全 extension の settings と timing に依存します。

### 23.1 Shared message visibility

chat message が hidden かどうかは SillyTavern の shared message state の一部です。STMB 専有 state ではありません。

STMB の **Token Saving** settings は Memory 保存後に processed messages を hide できます。その後別 extension が reveal でき、STMB はそれを防ぎません。同様に **Unhide hidden messages for memory generation** は selected range を STMB が process/regenerate 中に reveal する場合があります。

### 23.2 Presence

Presence extension と STMB はどちらも chat message の hidden/visible state を変更できます。Presence が STMB により hidden になった messages を reveal しても、STMB の Token Saving setting が erased/ignored されたわけではありません。Presence の later action が同じ SillyTavern message state を変更したということです。

Presence を使い、STMB により hidden になった messages を hidden のままにしたい場合は Presence 独自の hidden-message locking feature を使います。Presence は現在この用途に `/presenceLockHiddenMessages` command を提供しています。applicable message range に対して実行し、range が伸びるにつれて繰り返してください。current command behavior は Presence documentation を参照してください。

STMB は Presence を自動設定/実行せず、group-chat participant handling は Token Saving と無関係です。

### 23.3 Regex integration

STMB は SillyTavern Regex extension と2段階で統合します:

1. **Outgoing/User Input:** assembled prompt を送信前に transform。
2. **Incoming/AI Output:** raw response を parsing/saving 前に clean/standardize。

**Use regex (advanced)** を有効にし、**Configure regex** を開き、各 direction に script を1つ以上選択します。

重要: STMB 独自の selection が execution を制御します。STMB で selected な script は Regex extension の normal interface で disabled でも実行できます。

Regex は transformation を理解している場合だけ使ってください。bad outgoing rule は required schema instructions を corrupt し、bad incoming rule は valid JSON を corrupt する可能性があります。

---

## 24. Lorebookエントリのタイトルと文字ポリシー

### 24.1 Title placeholders

profile title formats は次を使用できます:

- `{{title}}` — AI-generated title;
- `{{scene}}` — source range;
- `{{char}}` — character/group name;
- `{{groupname}}` — current group の display name。group chat 外では `Unknown`;
- `{{present}}` — scene に present な characters の comma-separated list。group chat では individual speakers、Narrator Mode では scene の selected Active Cast、regular character chat では current character;
- `{{user}}` — user name;
- `{{messages}}` — scene message count;
- `{{profile}}` — profile name;
- supported date/time placeholders。

### 24.2 Auto-numbering

supported numbering tokens には次の形式があります:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB は chosen format に従い sequential、zero-padded numbers を assign します。

### 24.3 Printable Unicode

emoji、accented text、CJK、symbols を含む printable Unicode characters は全て title で使用できます。U+0000–U+001F と U+007F–U+009F の Unicode control characters は削除されます。

Auto-Create が使う lorebook filenames は filesystem-reserved characters と length について別途 sanitize されます。

---

## 25. Job QueueとRetry操作

optional queue には Chat Top Bar / Chat Top Info Bar が必要です。queue が利用可能な場合、Memory、consolidation、Side Prompt の regeneration は regeneration job を作成し、replacement は approve されるまで review のままです。

**Memory Books Jobs** drawer は次を表示できます:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review。

chat range を process する jobs は queue rows に starting/ending message numbers を表示します。drawer では active work を cancel、review jobs を reopen、failures を inspect、work を retry、terminal history rows を dismiss できます。

Retry scopes:

- **Retry:** Side Prompt/consolidation など non-Memory job 1つを rerun。
- **Retry All:** Memory と associated after-Memory Side Prompt work を rerun/resume。Memory が既に saved なら duplicate せずその result から resume できる。
- **Retry Memory:** Memory だけを rerun/resume し、after-Memory Side Prompts は intentional に skip。

combined workflow を restore するなら Retry All、tracker work を走らせたくないなら Retry Memory を使います。

Chat Top Bar がなくても STMB は normal workflows を実行しますが queue UI はありません。

---

## 26. 視覚的フィードバックとアクセシビリティ

STMB は scene controls に inactive、selected、valid range、in-scene、processing などの visual states を提供します。exact colors は SillyTavern theme に依存します。

accessibility support:

- keyboard navigation;
- focus indicators;
- ARIA attributes;
- reduced-motion behavior;
- mobile-friendly controls。

screenshot から教えるときは specific color に頼らず、visible icon と label を説明してください。

---
## 27. 設定マップと現行設定リファレンス

この section は settings map です。user-facing STMB configuration controls がどこにあり、何を制御するかを示します。また specialized interfaces にある重要な saved controls と one-run controls も一覧化します。特定の Clip、Topical Clip、Compaction、preview を作るためだけに使う one-time content fields は、それぞれの workflow section に記載し、ここでは繰り返しません。

一般的な開始 path:

**chat input 横の magic-wand Extensions menu → Memory Books**

以下の paths は、明示的に **SillyTavern** と書かれていない限り、**Memory Books** main panel から始まります。control は current chat、provider、profile、storage mode に適用されない場合 hidden/disabled になることがあります。

以下で使う scope:

- **Global:** narrower setting が override しない限り STMB 全体に適用。
- **Per chat:** current chat/group に保存。
- **Per character:** compatible chats 間で character card に追従。
- **Per profile/template/setting:** reusable object 内に保存。
- **Per run:** 現在準備中の operation だけに適用。

### 27.1 Main panel: storage、chat mode、active profile

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; book choice は per chat | normal chat-bound lorebook を STMB automatic target として使うのをやめ、current chat 用 Memory Book の選択を要求します。Auto-Create Lorebook Mode と同時に有効にできません。 |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; Manual Mode で表示 | Per chat | この chat で Memories を受け取る main Memory Book を選びます。Narrator Mode では omniscient book です。 |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; Manual Mode の real group で表示 | Per chat | real-group member ごとに separate Memory Book を assign します。これら assignments の設定と corresponding character-filtered retrieval behavior には STLO が必要です。 |
| **Character Memory Book lock** | character の Memory Book assignment 横の lock icon | Per character | compatible Manual Mode chats 間で character card に同じ Memory Book を assign し続けます。assignment を変更する前に unlock してください。 |
| **Narrator Mode** | **Current Lorebook Configuration**; normal non-group chats only | Per chat | selected manual book を omniscient Memory Book として使い、それぞれ unique book を持つ declared fictional cast members を有効にします。Manual Mode と omniscient book が必要です。 |
| **Manage Narrator Cast** | **Narrator Mode** 下; Active Cast drawer からも利用可能 | Per chat | declared Narrator characters を add、retire、restore し、unique Memory Books を assign します。 |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | Automatic Mode で chat に lorebook がないとき作成して bind します。Manual Mode と同時に有効にできません。 |
| **Lorebook Name Template** | **Auto-create lorebook if none exists** の直下 | Global | auto-created books を命名します。`{{char}}`、`{{user}}`、`{{chat}}` を support。Auto-Create Lorebook Mode 有効時だけ使用されます。 |
| **Memory profile selection** | **Memory Profiles** selector | Per run | next Memory と隣接 profile actions 用 profile を選びます。この selection だけでは saved default は変わりません。 |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | selected profile を automatic Memories その他 workflows の default にします。confirmation、Side Prompt override、workflow-specific choice が別 profile を選ぶ場合を除きます。 |
| **Memory Title Format** | **Memory Profiles → Memory Title Format** または **Profile Actions → Edit Profile** | Per profile | new Memory entry titles と optional numbering を listed title macros で format。main-panel control は default profile の format を edit し、**Edit Profile** は selected profile を直接変更します。 |

### 27.2 General Settings

main panel の **Settings → General Settings** を開きます。

| Setting | Scope | What it does |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | normal pre-generation confirmation window を skip。non-interactive catch-up に必須です。independent warnings と enabled previews は引き続き表示される場合があります。 |
| **Automatically accept detected participants in future** | Global | real-group participant confirmation を今後表示せず、STMB の detected participant set を受け入れます。 |
| **Show memory previews** | Global | generated Memories と applicable Side Prompt output を save 前に editable review で表示します。 |
| **Show consolidation previews** | Global | generated consolidation candidates を commit 前に review します。 |
| **Show notifications** | Global | STMB toast notifications を有効にします。 |
| **Show floating Clip button when text is highlighted** | Global | chat text 選択後に floating scissors control を表示します。 |
| **Memory boundary indicator** | Global | control なし、processed-boundary divider、draggable jump button、または両方を表示します。 |
| **Allow scene overlap** | Global | selected scene range が existing Memory にすでに represented message IDs と overlap することを許可します。 |
| **Refresh lorebook editor after adding memories** | Global | STMB が entry を書いた後、open lorebook editor を refresh し new content を即表示します。 |
| **Copy Memory Books when branching** | Global | native chat branch に active unlocked chat-bound/manual Memory Books の independent copies を与えます。character-locked books は design 上 shared のままです。 |
| **Auto-rollback after message deletion** | Global | deletion/truncation が already processed chat material と intersect したとき coordinated rollback を有効にします。default は disabled。ordinary message edits と swipes は trigger しません。 |
| **Update last message ID processed** | Global; Auto-rollback action | processed checkpoint を newest surviving Memory の end に移動し、surviving Memory がなければ clear します。 |
| **Delete last Memory** | Global; Auto-rollback action | rollback scope で selected な invalidated Memory 全てと linked copies を delete します。Memory/consolidation deletion は irreversible です。 |
| **Restore previous Side Prompts** | Global; Auto-rollback action | unchanged affected Side Prompt ごとに latest exact saved before-state を restore します。rollback level は1つだけ保持されます。 |
| **Default for solo chats** | Global | Memory 後に solo chats が inherit する Side Prompt Set を選びます。empty selection は individually enabled after-Memory Side Prompts を使用します。 |
| **Default for group chats** | Global | Memory 後に real group chats が inherit する Side Prompt Set を選びます。empty selection は individually enabled after-Memory Side Prompts を使用します。 |
| **Max Response Tokens** | Global | STMB generation の maximum output length を override。otherwise valid JSON が cut off する場合増やします。`0` は normal provider/SillyTavern behavior を fallback として残します。 |
| **Token Warning Threshold** | Global | estimated input request が threshold を超えた場合 confirmation warning を表示します。model context limit 自体は変更しません。 |
| **Default Previous Memories Count** | Global | new Memory に continuity context として供給する prior Memories の normal default を0–7で設定。run ごとに **Advanced Memory Options** で override 可能。 |
| **Use regex (advanced)** | Global | STMB 独自の regex-processing selection を有効にします。underlying SillyTavern regex script の一般 enablement とは別です。 |
| **Configure regex… → Outgoing scripts** | Global | generation provider に送る前に STMB が material に実行する scripts を選びます。 |
| **Configure regex… → Incoming scripts** | Global | returned material を parse/save する前に STMB が実行する scripts を選びます。 |

#### General Settings 内の Memory Auto-Rollback

**Auto-rollback after message deletion** は master preference です。3つの action checkboxes は independently selectable、default enabled で、master switch が off の間は visually disabled です。したがって existing installation は upgrade しただけでは何も delete し始めません。

Auto-rollback は message deletion/truncation にだけ反応し、response regeneration の deletion phase も含みます。ordinary edit または swipe には反応しません。SillyTavern の deletion event value は middle deletion を reliably identify しないため、STMB は各 chat の actual message identities を track します。

tail deletion では removed suffix と stored source range が intersect する全 Memory が affected です。chat middle の deletion では STMB は3つの choices を尋ねます:

- **Full rollback** — affected Memory とそれ以降の newer Memories 全てを delete。
- **Affected only** — overlapping Memories だけ delete、newer Memories は preserve し、stored ranges、relevant Side Prompt checkpoints、processed checkpoint を deletion count 分 shift。これは意図的に Memory coverage に permanent gap を残します。
- **Cancel** — Memory Books の変更なし。

rollback は available Memory Books 全体で exact `STMB_chatId`、source-range、canonical/link metadata を使います。canonical group/Narrator Memory と discoverable linked copies 全てが1つの deletion unit です。missing canonical copies、十分な chat identity がない ambiguous legacy entries、malformed ranges、incomplete consolidation dependencies がある場合、entire rollback を stop して repair guidance を示します。STMB は ownership を推測しません。

**Delete last Memory** を選んだ場合、STMB は affected Memory Book ごとに direct/transitive consolidation parent 全てを preflight します。1つの combined confirmation に delete が必要な consolidations が表示されます。その confirmation を cancel すると checkpoint、Memory、Side Prompt changes も全て cancel されます。approve すると consolidation ancestors を delete し、deleted consolidation によって disabled だった existing direct source を re-enable して `disabledBySummaryId` backlink を clear し、その後 selected base Memories を delete します。user が independently disabled にした entries は enable されません。

save 前に STMB は complete lorebook fingerprints を recheck します。lorebooks は normal serialized write lanes を通じて sorted order で書かれ、later book が失敗した場合の compensating saves 用に unchanged pre-write clones が保持されます。Chat checkpoint metadata は every lorebook write が成功した後だけ変更されます。chat の queued work は preflight 前に cancel され、active non-queued Memory creation は rollback 開始前に finish することを許可されます。

Side Prompt rollback は version-2 regeneration snapshots を使います。各 snapshot は entry が存在していたか、older rollback snapshot を除く exact prior state、source chat/range、STMB が書いた state の fingerprint を記録します。rolled-back run が entry を作成した場合は rollback が delete します。current entry が saved fingerprint と一致しない場合、STMB は user または later run が変更したと判断し、そのまま残します。Version-1 snapshots は regeneration を support しますが rollback には安全性が不十分なため warning とともに skip されます。successful restore は snapshot を consume するため、その Side Prompt は再び run するまで2回目の rollback はできません。複数 Memories をまとめて rollback する場合、各 Side Prompt について restore できるのは latest available before-state だけです。older rolled-back runs が導入した information が残る場合があります。

#### General Settings 内の Token Saving

これら controls は同じ **General Settings** popup の下部、**Token Saving (Hide/Unhide Messages)** にあります。

| Setting | Scope | What it does |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | no automatic hiding、latest Memory までの全 processed messages、latest Memory が使った range だけ、から選びます。Hiding は reversible で message を delete しません。 |
| **Messages to leave unhidden** | Global | auto-hide 時にこの数の recent messages を visible のまま残し、Memory boundary 近くの overlap を維持します。`0` は applicable scene end まで hide。 |
| **Unhide hidden messages for memory generation** | Global | STMB が source range を compile する前に `/unhide X-Y` 相当を実行。successful save 後に何を hide するかは selected auto-hide mode に従います。 |

### 27.3 Automatic Memories と consolidation reminders

main panel の **Settings → Automatic Memories** を開きます。

| Setting | Scope | What it does |
|---|---|---|
| **Auto-create memory summaries** | Global | automatic `/nextmemory`-style Memory creation を有効にします。processed baseline がなくても current STMB は message 0 から開始可能。最初の manual Memory は setup validation と deliberate starting boundary のため依然推奨。 |
| **Auto-Summary Interval** | Global | normal automatic cadence 1回あたりの message 数を設定します。 |
| **Auto-Summary Buffer** | Global | otherwise ready automatic range から newest messages をこの数だけ除外し、live conversation より少し遅れて generation します。 |
| **Prompt for consolidation when a tier is ready** | Global | monitored tier が saved eligible-source minimum に達すると yes/later prompt を表示。silently consolidation はしません。 |
| **Auto-Consolidation Tiers** | Global | readiness prompts を監視する target tiers を選びます。各 tier の minimum は **Consolidate Memories** で保存されます。 |

### 27.4 Profile editor

**Memory Profiles** で profile を選び、**Profile Actions → Edit Profile** を開きます。特記がなければこれらは **per profile** settings です。built-in **Current SillyTavern Settings** profile は SillyTavern が制御する fields を意図的に lock しています。

| Setting | What it does |
|---|---|
| **Profile Name** | reusable STMB profile の名前。built-in profile name は locked。 |
| **API/Provider** | current SillyTavern routing、supported provider、Custom OpenAI-compatible connection、Full Manual Configuration のいずれかを選びます。 |
| **Use this connection profile** | **Custom OpenAI-Compatible API** では active SillyTavern Custom connection または named Custom connection 1つを使用。saved URL/secret が使われ、STMB **Model** は model override のまま。 |
| **Skip structured output and use plain-text completion** | provider が schema を拒否する場合 structured-output schema を送らなくします。selected prompt は引き続き STMB required valid JSON を model に返させる必要があります。 |
| **Use ST's ChatCompletionService** | supported requests を SillyTavern built-in Chat Completion request helper 経由で route。Full Manual profiles では unavailable。 |
| **Chat Completion Preset** | ChatCompletionService 経由で SillyTavern Chat Completion preset を optional 適用。 |
| **Model** | profile の exact model ID。**Current SillyTavern Settings** は代わりに SillyTavern active model を読みます。 |
| **Temperature** | profile generation randomness。**Current SillyTavern Settings** は SillyTavern active temperature を読みます。 |
| **Use reverse proxy** | supported providers に SillyTavern configured reverse-proxy details を渡します。Full Manual Configuration では secret field は proxy password と表示。 |
| **API Endpoint URL / API Key** | **Full Manual Configuration** 専用 separate direct endpoint/credential。normal use は SillyTavern で設定・test 済み connection を優先。 |
| **Memory Creation Method** | ordinary Memory generation に使う Summary Prompt preset。prompt content は **Settings → Summary Prompt Manager** で管理。 |
| **Use separate group and character prompts in group chats** | group Memory Book と character-focused Memory Books に distinct prompt presets を使います。 |
| **Group Summary Prompt / Character Summary Prompt** | separate group/character prompting enabled 時の2 presets を選びます。 |
| **Memory Title Format** | profile 生成 Memories の title text、macros、automatic numbering を制御。 |
| **Activation Mode** | new entries を **Normal** keyword activation、**Constant**、**Vectorized** で保存。 |
| **Insertion Position** | generated entry を Character、Example Messages、Author's Note、named Outlet に対してどこへ insert するか選択。 |
| **Outlet Name** | **Insertion Position** が **Outlet** のとき target Outlet を指定。 |
| **Insertion Order** | **Auto** は Memory number から order を derive、**Manual** は fixed value、**Reverse** は starting value から countdown し Outlets 専用。 |
| **Prevent Recursion** | generated entry content が recursive scan 中に別 lorebook entries を trigger するのを防ぎます。 |
| **Delay Until Recursion** | generated entry が first scan pass で activate するのを防ぎます。recursion を開始できる他のものがない場合は off。 |
| **Also include** | legacy-profile compatibility 専用。older profiles では ordered lorebook references が表示される場合があります。current configuration は per-chat **Context Settings** を使います。 |

active SillyTavern provider、model、temperature、connection preset、reverse proxy は STMB ではなく SillyTavern 自身の connection controls で設定します。**Current SillyTavern Settings** profile はそれら live values を読みます。

### 27.5 Context Settings

main panel の **Settings → Context Settings** を開きます。

| Setting | Scope | What it does |
|---|---|---|
| **Additional Context for this chat** | Per chat | named Context Setting 1つを選ぶ、明示的に **No Context** を保存、または choice を unset のままにして migrated context に decision が必要な場合 STMB に prompt させます。 |
| **Context Setting Name** | Per Context Setting | reusable Additional Context collection を命名。 |
| **Additional Context entries and order** | Per Context Setting | stable reference material として送る lorebook entries を選び、その order を決めます。missing entries は warn され skip。 |

**New**、**Duplicate**、**Delete**、**Import JSON**、**Export JSON** は Context Settings を管理します。chat または Side Prompt が setting を select するまでは generation behavior は変えません。

### 27.6 Trackers & Side Prompts

main panel の **Settings → Trackers & Side Prompts** を開きます。

| Setting | Location and scope | What it does |
|---|---|---|
| **After-memory side prompt mode for this chat** | Manager main screen; per chat | matching solo/group default、明示的な individually enabled after-Memory prompts、または named Side Prompt Set 1つをこの chat に使用します。 |
| **How many concurrent prompts to run at once** | Manager main screen; global | simultaneous Side Prompt jobs を1–10に制限。 |
| **Side Prompt Set Name** | **New Set** または edit set; per set | reusable ordered group of Side Prompt runs を命名。 |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row; per set | row の template、optional display/title label、literal または set-level runtime macro values を設定し、row order を execution order として使用。 |
| **Enabled** | **New** または ordinary Side Prompt edit; per template | chat が individually enabled after-Memory prompts を使う場合 template を eligible にします。trigger settings は依然 when it runs を決定。 |
| **Run on visible message interval / Interval** | Side Prompt editor; per template | configured visible message count 後に実行。template が unresolved runtime macros を必要とする場合 automatic triggers は unavailable。 |
| **Run automatically after memory** | Side Prompt editor; per template | successful Memory 後に template を実行。chat の Side Prompt mode/selected set に従います。 |
| **Allow manual run via `/sideprompt`** | Side Prompt editor; per template | explicit manual execution を許可。 |
| **Prompt / Response Format** | Side Prompt editor; per template | instruction と optional output structure を定義。両 field は supported Side Prompt macros を使用可能。 |
| **Previous memories for context** | Side Prompt editor; per template | selected source messages の前に0–7 previous Memory entries を含めます。 |
| **Use additional context / Additional Context Source** | Side Prompt editor; per template | Additional Context を含め、current chat Context Setting に follow するか fixed named setting 1つを常に使用。 |
| **Lorebook Target** | Side Prompt editor; per template または per chat | normal Memory Book または別 lorebook に output を保存。変更時、choice を this chat only か template going forward か尋ねます。 |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor; per template | upserted entry title template と comma-separated activation keywords を optional 制御。 |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor; per template | Side Prompt lorebook entry の activation/placement を制御。 |
| **Insertion Order / Order Value** | Side Prompt editor; per template | automatic Memory-number ordering または fixed manual order value。 |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor; per template | corresponding SillyTavern lorebook-entry recursion/budget flags を適用。 |
| **Override default memory profile / Connection Profile** | Side Prompt editor; per template | current default profile の代わりに selected STMB profile で Side Prompt を route。 |
| **Memory Assistance Mode** | **Memory Assistance** edit; global | **Off** disables; **Update** existing Clips の changes を提案; **Update and Suggest** は Topical Clip topics も discover; **Automatic** は ordinary Clip additions を直接適用し Topical Clip replacements は approval に残す。 |
| **Update Prompt / Topic Suggestions Prompt** | **Memory Assistance** edit; per built-in template | 2つの AI tasks を制御。response contracts は fixed のまま。 |
| **Use a connection profile override** | **Memory Assistance** edit; per built-in template | Memory Assistance に default ではなく selected STMB profile を使用。 |

### 27.7 Prompt managers

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** または edit | Per preset | reusable ordinary-Memory prompt を定義。profile の **Memory Creation Method** または group/character prompt selection がその preset を指した後だけ使用。 |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | **Consolidate Memories** で normal prompt として preselected されるものを選択。regeneration-only/group-only presets は選べません。 |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** または edit | Per preset | reusable consolidation instructions を定義。dedicated regeneration/group presets は respective workflows に制限。 |

### 27.8 Topical Clip と Compaction defaults

main panel の **Settings → Topical Clip** または **Settings → Compaction** を開きます。

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile** または **Compaction → Compaction Profile** | Global shared default | Topical Clip generation と Compaction 用 STMB profile を選択。どちらかで変更すると両 workflows が共有する selection が変わります。 |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Topical Clip generation 用 custom prompt template を保存。**Reset to Default** で current built-in prompt に戻る。required source macros は save/generation 前に validate。 |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | existing Memory、Clip、Side Prompt entries を短縮する custom prompt template を保存。**Reset to Default** で current built-in prompt に戻る。`{{ENTRY_CONTENT}}` 必須。 |

Memory Book、topic、keywords、source inclusion/selection、message range、draft、Compaction で選ぶ entry は persistent settings ではなく per-run workflow choices です。

### 27.9 Consolidate Memories controls

main panel 下部 buttons から **Consolidate Memories** を開きます。この interface は saved defaults と one-run choices を混在させています。

| Setting | Scope | What it does |
|---|---|---|
| **Source Memory Book** | Per run | 現在 consolidate する Memory Book を表示し、別 available book を選べます。変更すると chat の manual/chat-bound Memory Book configuration を変えず eligible-entry list を reload。 |
| **Target tier** | Per run | 作成する higher tier と、その直下の eligible source tier を選択。 |
| **Consolidation Prompt** | Per run | この consolidation 用 prompt を選択。initially Consolidation Prompt Manager の default を使用。 |
| **Maximum entries per pass** | Per run | 1 analysis pass に送る lower-tier entries 数を制限。 |
| **Token Budget** | Per run | consolidation batching に使う approximate input budget。 |
| **Number of automatic summary attempts** | Per run | usable assignments/summaries を得るための repeated analysis passes を制限。 |
| **Saved minimum eligible entries** | Global, target tier ごとに別保存 | chosen tier が ready とみなされる threshold。tier の automatic readiness prompt も制御。 |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | newly consolidated entries の save behavior を制御。ordinary Memory profile entry settings とは別。 |
| **Disable selected source entries after creating summaries** | Per run | commit 後 successfully consolidated sources を disable し higher-tier summaries に retrieval を引き継がせます。delete はしません。 |
| **Selected source entries** | Per run | processing 対象の eligible lower-tier entries を選択。unchecked entries は untouched。 |

### 27.10 Related SillyTavern World Info settings

これらは STMB 外、SillyTavern の World Info/lorebook settings にありますが、saved Memories が ordinary chat generation 中に retrieve されるかに影響します。

| Setting | What it does |
|---|---|
| **Match Whole Words** | keyword boundary matching を制御。flexible Memory keywords では Off が common starting point。 |
| **Scan Depth** | lorebook activation 用に scan する recent text 量を制御。8 など比較的高い値が common starting point。 |
| **Max Recursion Steps** | recursive World Info activation を制限。約2が common starting point。 |
| **Context percentage / lorebook budget** | lorebook entries が占められる context を制限。model total context と他 prompt material との balance を見て増やします。 |

これらは recommendations であり hard requirements ではありません。retrieval diagnosis は Section 10 を参照してください。

---
## 28. Slash Commandリファレンス

### Memory commands

```text
/creatememory
```

現在 mark されている scene から Memory を作成します。

```text
/scenememory X-Y
```

inclusive range を設定して Memory を作成します。例: `/scenememory 10-15`。

```text
/nextmemory
```

highest processed boundary の次の message から current eligible end までを Memory にします。

```text
/stmb-catchup interval=x start=y end=z
```

既存の長い chat を consecutive chunks で処理します。

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

Side Prompts を含む in-flight STMB generation を everywhere で停止します。すでに committed された work は保存されたままです。

---

## 29. 段階別トラブルシューティング

### 29.1 Extension/UI が load しない

症状:

- magic-wand menu に Memory Books がない;
- chevrons がない;
- selection 後 floating Clip button がない。

checks:

1. extension が installed/enabled;
2. page reload;
3. character/group chat が open;
4. 最大10秒待つ;
5. message actions を expand;
6. それでも失敗してから console を inspect。

### 29.2 Scene が selected されていない

marked scene には **►** と **◄** の両方が必要です。panel の Current Scene を確認してください。

range が existing Memory と overlap する場合、別 range を選ぶか Allow Scene Overlap を有効にします。

### 29.3 Valid Memory Book がない

Automatic Mode:

- lorebook を chat に bind; または
- Auto-Create を有効。

Manual Mode:

- main manual book を選ぶ;
- deleted selection を repair;
- broken character lock は変更前に unlock。

Real multi-book group:

- STLO が available であること;
- required member 全員に valid assignment;
- group book を character book として再利用できない。

Narrator Mode:

- Manual Mode が enabled;
- omniscient book selected;
- declared member ごとに unique non-omniscient book。

### 29.4 AI が valid Memory を作れない

この順番で確認:

1. provider/model/profile が valid;
2. response が truncated していない;
3. maximum response tokens が十分;
4. selected prompt が exact JSON を要求している;
5. Regex が schema を corrupt していない;
6. provider が selected structured-output mode を support;
7. provider が schemas を reject する場合だけ Skip Structured Output を試す;
8. prompt を rewrite する前により instruction-following model を試す;
9. persistent error notification の **Raw response from AI** をクリックして captured provider response を inspect し、利用可能なら manual JSON correction interface を使う。

common causes: code fences、commentary、missing key、keywords が array でない、refusal text、cut-off output。

### 29.5 Memory は保存されたが messages が消えた

おそらく auto-hidden です。Token Saving settings を変更してください。Hidden messages は deleted ではありません。

### 29.6 Automatic Memories が run しない

check:

- Auto-create memory summaries enabled;
- highest processed boundary 以後に十分な messages;
- interval + buffer requirement を満たす;
- postpone checkpoint が active でない;
- valid Memory Book available;
- trigger を block する別 Memory job がない;
- work 中に current chat を switch していない;
- trigger が期待される前に group generation が finish している。

current version では first manual Memory は recommended ですが technically required ではありません。

### 29.7 Memory は存在するが activate しない

check:

- correct book active;
- entry enabled;
- relevant keywords;
- activation mode;
- budget;
- recursion と Delay Until Recursion;
- STLO routing（使用時）;
- World Info inspection/logs。

retrieval を test する前に Memory を regenerate しないでください。

### 29.8 Entry は送られたが無視される

これは model-use behavior です。対策:

- Memory を短く明確に;
- insertion position/priority を改善;
- competing context を減らす;
- OOC reminder を使う;
- supplied context をより reliably follow する model を選ぶ。

### 29.9 Side Prompt が run しない

Section 16.18 を参照。特に selected set はその set 外の individually enabled prompts を suppress します。

### 29.10 Consolidation prompt が出ない

verify:

- readiness prompt enabled;
- target tier selected for monitoring;
- eligible source entries が十分;
- sources が already disabled/ineligible でない;
- saved minimum count を満たす。

### 29.11 Regeneration button が disabled

hover または stated reason を inspect。common causes:

- entry が required snapshot metadata より古い;
- source chat/range unavailable;
- source entries missing/wrong tier;
- active parent consolidation が lower source を block;
- original sequence number を determine できない;
- Side Prompt template deleted。

### 29.12 Branch が books を copy しなかった

check:

- branch creation 前に Copy Memory Books when branching が enabled;
- native SillyTavern branch だった;
- source books が存在し load 可能;
- copying 中に chat switch していない;
- branch が以前 completed/failed と mark されていない;
- locked books が意図的に copy ではなく preserved されたこと。

### 29.13 Narrator Mode cast が wrong

check:

- generation 前の Active Cast selection;
- message が cast metadata を merge した continuation か;
- swipe が older cast state を restore したか;
- scene に confirmation が必要な legacy untagged messages があるか;
- declared character が retired か;
- each character book がまだ存在するか。

---

## 30. FAQ

### Vectors は必要ですか?

いいえ。Keyword activation だけで十分で、自動生成されます。Vectors は optional です。

### Memories は separate lorebook を使うべきですか?

organization、budgeting、reuse、diagnosis のため通常は yes ですが、mandatory ではありません。

### STMB は messages を delete しますか?

いいえ。processed messages を active context から hide できます。

### STMB を完全に manual で使えますか?

はい。必要なときだけ scenes を mark して Memories を作れます。

### Automatic Memories は first Memory を作れますか?

current STMB では yes。processed baseline がない場合、interval + buffer を満たすと message 0 から始まります。それでも setup verification と desired starting boundary 選択のため manual first run を推奨します。

### Consolidation は automatic に実行されますか?

いいえ。tier が ready なとき STMB が prompt できますが、user が confirm/review します。

### Real group は Memory Book 1つだけでも使えますか?

はい。recommended starting setup で STLO は不要です。

### Separate real-group character books はいつ有用ですか?

individual continuity、knowledge、speaker-specific retrieval、character-focused summaries が extra setup/AI requests に見合う場合です。

### Narrator Mode と Group Chat Mode は同じですか?

いいえ。Group Chat Mode は separate SillyTavern character-card authors を読みます。Narrator Mode は1枚の Narrator card が書く fictional characters を manual declare します。

### Narrator Mode は STLO が必要ですか?

active-cast retrieval path には不要です。Manual Lorebook Mode、omniscient book 1つ、unique per-character books は必要です。

### Linked copies は synchronized されますか?

いいえ。origin/consolidation metadata で linked されるだけで continuous mirroring ではありません。

### Delay Until Recursion はなぜ通常 off にすべきですか?

別 lorebook entry が recursion を開始しなければ、delayed Memory entry は activate しない可能性があるためです。

### 最初の successful Memory の後は何をすべきですか?

entry retrieval を verify し、その後 automatic Memories を enable、interval/buffer を選び、token hiding を有効にします。Clips や narrowly defined Side Prompt は必要が生じてから追加し、Topical Clip/Consolidation は十分な Memories が蓄積した後に使います。

---

## 31. 互換性、移行、現行の履歴メモ

この section は current use に影響する history だけを保持します。

### Current baseline

- Current documented release: v8.5.0, August 1, 2026.
- SillyTavern requirement: 1.14.0 or later.
- Narrator Mode was added in v8.5.0.
- Branch book copying, Side Prompt regeneration, and character Memory Book locks were added in v8.4.0.
- Multi-character real-group Memory distribution arrived in v8.0.0.
- Additional Context moved from profiles to reusable per-chat Context Settings in v7.0.0; older profile context is migrated.
- Topical Clip was added in v6.10.0.
- Compaction and Clips were added in v6.6.0.
- Side Prompt Sets and per-prompt targets were added in the v6.4–v6.5 period.
- Consolidation became a multi-tier Arc-through-Epic system in v6.0.0; older Arc metadata is migrated.
- Job Queue integration was added in v6.8.0 and remains optional.
- Current profile defaults use Delay Until Recursion disabled unless a user/profile explicitly changes it.

### Older versions の existing Memories

`stmemorybooks` flag と required metadata を持つ entries だけが STMB Memories として認識されます。current metadata より前の older entries は supplied lorebook converter を使ってください。

### Removed functionality

old bookmark feature は Memory Books v4.0.0 で削除され、core extension から分離されました。Memory Books bookmark controls を current behavior として教えないでください。

### Localized built-ins

Built-in prompts は active SillyTavern language に応じて regenerate できます。customized built-ins は recreation 前に backup してください。

### Import behavior

Side Prompt import は additive です。existing prompts は保持され、imported key conflicts は existing prompt を overwrite せず rename されます。

---

## 32. 開発者向け・ライセンス情報

Memory Books は bundling/minification に Bun を使います。

```sh
bun run build
```

repository の pre-commit build hook を install:

```sh
bun run install-hooks
```

hook は commit 前に build し、build artifacts を stage し、build failure なら abort します。

Memory Books は Copyright © 2024–2026 Aiko Hanasaki、GNU Affero General Public License v3.0 の下で licensed されています。modified versions は applicable notices を保持し、modifications を identify し、AGPL source-availability requirements に従う必要があります。

---

## 33. 簡易診断ツリー

```text
User says “Memory Books is not working.”
│
├─ Is the menu/control visible?
│  ├─ No → installation/loading/UI checks.
│  └─ Yes
│
├─ Can a scene be selected?
│  ├─ No → expand message actions; set both chevrons; inspect overlap.
│  └─ Yes
│
├─ Is there a valid effective Memory Book?
│  ├─ No → bind, auto-create, select manual, or repair multi-book bindings.
│  └─ Yes
│
├─ Does generation return valid complete output?
│  ├─ No → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ Yes
│
├─ Does the entry exist in the intended book?
│  ├─ No → save/rollback/permission/job failure.
│  └─ Yes
│
├─ Does SillyTavern activate and send it later?
│  ├─ No → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ Yes
│
└─ Does the model use the supplied entry?
   ├─ No → model compliance, placement, competing context, entry clarity.
   └─ Yes → workflow is functioning.
```

---

## 34. 推奨される最小の学習順序

new user にはまずこの sequence だけを教えます:

1. magic-wand menu を開いて Memory Books を見つける。
2. bound book の Automatic Mode を使うか Auto-Create を enable。
3. Current SillyTavern Settings を選ぶ。
4. message actions を expand し、短く complete な scene を **►** と **◄** で mark。
5. Memory 1つを create/preview。
6. Memory Book を開き saved entry を verify。
7. entry が後で activate できることを verify。
8. automatic Memories を enable し interval/buffer を選ぶ。
9. hidden messages は deleted ではないと説明してから auto-hide を enable。
10. concrete need が生じたとき Clips、次に Side Prompts、その後 Topical Clip/Consolidation を紹介。

user の actual problem が要求しない限り、custom prompts、Full Manual endpoints、multiple character books、Regex、consolidation から始めないでください。

---

## 35. 最終概念まとめ

Memory Books は SillyTavern lorebooks 上に構築された external continuity pipeline です:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

system が最もよく機能する条件:

- scenes が coherent;
- prompts が target と reference context を明確に区別;
- JSON workflows が exact schemas を返す;
- keywords が concrete;
- Memory Books が deliberate に assigned/activated;
- long-running trackers が stale state を prune;
- consolidation が continuity を消さず old detail を減らす;
- users が saved = sent と仮定せず retrieval を verify;
- advanced multi-book routing は precision が complexity に見合う場合だけ使用。
