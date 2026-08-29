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

この文書を、現在のMemory Booksの運用リファレンスとして扱ってください。Start Hereガイド、README、User Guide、Side Promptsガイド、How STMB Works、過去のchangelogを個別の知識ファイルとして読み込む代わりになります。

用語:

- STMB = SillyTavern=MemoryBooks（この拡張機能）
- ST = SillyTavern（STMBが拡張する基盤コード）

ユーザーに回答するとき:

1. Memory Booksの用語を正確に維持してください。**Memory Book**はSTMBが使うSillyTavernのlorebookであり、独立したデータベース形式ではありません。
2. 現在の動作と過去の動作を区別してください。古いchangelogに出ていたというだけで、削除済み・置換済みの手順を案内しないでください。
3. **Group Chat Mode**と**Narrator Mode**を区別してください。目的が異なります。
4. Memoryの**生成**、lorebookの**保存/設定**、その後の**SillyTavernによる取得**を分けて考えてください。有効化/取得はST本体側の機能です。
5. ここに記載のないコントロール、メニュー名、プロバイダ動作、設定を創作しないでください。
6. スクリーンショットがある場合は、見えているコントロールだけを特定し、画面外の要素を仮定せず次の即時操作を示してください。
7. トラブルシューティングでは最初に失敗した段階を特定・検証してから、Promptの書き換えを提案してください。
8. 高度なルーティング、複数Book、カスタムPrompt、Regex、Side Prompt自動化より先に、単純な構成を動かしてください。
9. Character Filterと別々のMemory Bookはルーティングと関連性を改善しますが、セキュリティ境界ではないと説明してください。
10. インストール済みバージョン、SillyTavernバージョン、プロバイダ、カスタムPromptが異なる可能性があれば不確実性を明示してください。

### 現行文書に関する注意

Narrator Modeはv8.5.0で実装されています。

旧初心者向け文書では、自動Memoryを開始する前に手動Memoryが技術的に必要だと説明していたものがあります。現在のSTMBはprocessed-message baselineがない場合、message 0から最初の自動Memoryを作成できます。それでも最初に手動Memoryを作ることを推奨します。接続、Memory Book、出力形式、開始境界を確認してから自動化できるためです。

---

## 2. 製品定義と基本的な考え方

Memory Booksは、選択された、または自動的に選ばれたチャット範囲を構造化されたMemoryエントリに変換し、SillyTavern lorebookに保存する拡張機能です。

基本フロー:

```text
チャットメッセージ
    ↓
STMBがメッセージ範囲を選択または受け取る
    ↓
STMBがAIリクエストを組み立てる
    ↓
モデルが構造化Memoryを返す
    ↓
STMBがlorebookエントリとして保存
    ↓
処理済みの古いチャットメッセージをactive contextから非表示にできる
    ↓
後にSillyTavernが関連lorebookエントリを有効化
    ↓
チャットモデルがそのエントリをcontextとして受け取る
```

STMBはモデル内部に永久Memoryを作りません。外部の参照システム（lorebookエントリ）を維持します。SillyTavernが関連エントリをAIへのPromptに含めたとき、モデルは「覚えている」ように動作します。

### 3つの別段階

1. **生成品質** — Memory生成モデルが正確で有用な結果を作ったか。
2. **保存と設定** — 意図したMemory Bookに適切な有効化設定で保存されたか。
3. **取得とモデル利用** — SillyTavernがそのエントリを有効化・送信し、チャットモデルが正しく利用したか。

別々に診断してください。

### LorebookとMemory Book

**Lorebook**（SillyTavernの一部では**World Info**とも呼ばれる）は、SillyTavernが条件に応じてモデルリクエストへ追加できるエントリ集です。通常のエントリには:

- title/comment;
- content;
- activation keywordsまたは別のactivation mode;
- insertion position/order;
- recursion/budget controls;
- optional character filtersとmetadata。

**Memory Book**はSTMBが使う通常のSillyTavern lorebookです。通常のlorebookツールで開く、編集、並べ替え、export/import/deleteできます。機能によっては:

- Scene Memories;
- Arc、Chapter、Book、Legend、Series、Epic summaries;
- Clip/Topical Clip;
- Side Prompt tracker entries;
- その他STMB-managed entries。

### Memoryエントリは圧縮context

Scene Memoryは元のtranscriptではありません。連続性に重要な情報を残すための圧縮表現です:

- events/consequences;
- decisions/plans;
- discoveries/reveals;
- relationship/emotional changes;
- 個別のknowledge/beliefs/misunderstandings;
- 重要なobjects/locations/identities/promises/constraints。

処理済みメッセージをhideしても削除されません。AIへ送られなくなり、active chat-history contextを消費しなくなるだけです。

---

## 3. 基本用語と機能の選び方

| 必要なこと | 機能 | 意味 |
|---|---|---|
| 選択/自動範囲を要約 | **Memory** | 「このシーンで起きたことを覚える」 |
| 選択した文言や1つの事実を保存 | **Clip** | 「このメモを保存」 |
| 保存済みMemoriesから1テーマの情報を集約 | **Topical Clip** | 「この話題についてMemoryにある全情報を集める」 |
| 複数実行にわたり変化する情報を維持 | **Side Prompt** | 「このtrackerを更新し続ける」 |
| 複数のlower-tier Memory/summaryを統合 | **Consolidation** | 「これらを上位summaryへまとめる」 |
| 既存STMB entryを1つ短縮 | **Compaction** | 「事実を失わず短くする」 |
| 元sourceから既存entryを作り直す | **Regeneration** | 「再構築して置換をレビューする」 |

### よく混同される違い

- **Clip vs Topical Clip:** Clipは現在のchatでhighlightしたtextから開始。Topical Clipは既に確認済みのSTMB Memoriesから開始。
- **Topical Clip vs Side Prompt:** Topical Clipは手動でtopicを集約。Side Promptは変化するtrackerを継続更新可能。
- **Compaction vs Consolidation:** Compactionは1 entryをrewite。Consolidationは複数entriesから新しいhigher-tier summaryを作成。
- **Memory vs Side Prompt:** Memoryは通常、連続するscene record。Side Promptは1つの継続support documentを更新/上書き。
- **生成 vs 取得:** entry作成だけでは後にSillyTavernがactivateする保証はない。

---

## 4. 要件、インストール、初期確認

### 要件

- SillyTavern 1.18.0以降。最新の互換版推奨。
- 動作するAI接続。
- 指示に従え、Memory/Consolidationではvalid JSONを返せるモデル。
- third-party SillyTavern extensionsのinstall権限。
- local/Text Completion backendをOpenAI-compatible Chat Completion endpoint経由で使う場合、SillyTavernにChat Completion preset。

### 通常のChat Completionユーザー

OpenAI、Anthropic/Claude、OpenRouter、Gemini/Googleなどは通常、組み込み**Current SillyTavern Settings** profileを使用できます。

### Local/Text Completionユーザー

KoboldCpp、llama.cpp、TextGen、Ollama等はOpenAI-compatible Chat Completion endpoint経由が一般に安定します。通常RPがText Completionでも、STMB用のChat Completion presetが必要です。

KoboldCpp例:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:5001/v1` または `http://127.0.0.1:5000/v1`;
- 必要ならnonblank API key;
- endpointが期待するmodel ID、一般に`koboldcpp/modelname`、不要な`.gguf`なし;
- Chat Completion preset;
- response length最低2048 tokens、4096がより安全。

llama.cpp例:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`、Dockerなら`http://host.docker.internal:8080/v1`;
- 必要ならnonblank key;
- served model ID;
- endpointが要求しない限りprompt post-processingなし。

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### 任意のChat Top Bar

なくてもSTMBは動作します。導入すると**Memory Books Jobs** queue UIでactive/completed/failed/canceled/blocked/review-needed jobを扱えます。

### Installation

1. SillyTavernを開く。
2. **Extensions**を開く。
3. **Install Extension**。
4. 公式Memory Books repositoryをinstall。
5. 必要ならreload。
6. characterまたはgroup chatを開く。
7. 数秒待つ。

SillyTavern Extrasは不要です。

### 読み込み確認

少なくとも以下の一方:

- chat input横のmagic-wand Extensions menuに**Memory Books**;
- expanded message actionsに**►**/**◄**。

なければ:

1. 10秒程度待つ;
2. refresh;
3. install/enabled確認;
4. chatを開き直す;
5. それでもだめならbrowser console。

---

## 5. Memory Booksを開き、メインパネルを理解する

magic-wand Extensions menu → **Memory Books**。

表示されうるもの:

- Current Scene;
- Memory Status / highest processed;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- relevantなgroup/Narrator controls。

最初のMemoryに必要なのは:

1. 保存先Memory Book。
2. 生成profile/connection。
3. sceneにするchat messages。

---

## 6. Memory Bookの保存モード

### 6.1 Automatic Mode: chat-bound

標準。SillyTavernでcurrent chatにboundされたlorebookを使用。

向いている場合:

- chatごとにprimary Memory Book 1冊;
- 最小構成;
- group characters別book不要。

bookがなければbindまたはAuto-Create。

### 6.2 Auto-Create Lorebook Mode

**Auto-create lorebook if none exists**で、最初のMemory save時にbookを作成/bind。

name template:

- `{{char}}`;
- `{{user}}`;
- `{{chat}}`。

必要ならnumeric suffix。

Auto-CreateとManual Lorebook Modeは排他。

### 6.3 Manual Lorebook Mode

chat-bound bookとは別にMemory Bookを選ぶ。

用途:

- dedicated memory lorebook;
- 複数chatが意図的に1 bookを共有;
- group members別books;
- Narrator Mode;
- activation planを理解している。

main manual selectionはchatごと。ただしcompatible solo chatではpersistent character lockがoverride可能。

### 6.4 Separate Memory Booksは通常わかりやすい

- character/setting loreとmemoryを分離;
- 独立budget/order;
- history reuse/export;
- STMB entriesだけinspect;
- activation diagnosis。

推奨であり必須ではない。

### 6.5 Character Memory Book locks

Character Cardに紐づくpersistent Manual Mode assignment。

Solo:

- unlocked manual bookはcurrent chat;
- locked bookはcompatible chatsでcardについてくる;
- unlockまで変更不可。

Real group:

- unlocked per-character assignmentはcurrent group chat;
- locked assignmentはcompatible groupsへ継続;
- locked book missingならbroken-lock state。

同一characterが別storiesでも意図的に継続bookを共有する場合だけ使用。AU/別timelineでは危険。

### 6.6 推奨start layout

- Solo: chat-bound/auto-created book。
- Real group: 1 group book。
- Narrator: 1 omniscient + declared characterごとにunique book。

---

## 7. プロファイル、接続、生成ルーティング

profileは生成と結果entry設定の両方を制御。

### 7.1 最初の推奨profile

**Current SillyTavern Settings**。現在のprovider/model/temperatureを使用。

custom promptsやFull Manualより先に、1 Memoryのgenerate/saveを確認。

### 7.2 Saved profileを作る理由

- cheaper/reliable memory model;
- RPと別provider;
- named Custom connection;
- custom Summary Prompt;
- temperature/output違い;
- title formatting;
- activation/insertion/order/recursion;
- separate group/character prompts。

### 7.3 Profile fields

display name、API/provider、model ID、temperature、Summary Prompt preset、separate multi-character prompts、structured output、ChatCompletionService、Chat Completion preset、reverse proxy、title format、Normal/Constant/Vectorized、insertion position/Outlet、order、Prevent Recursion、Delay Until Recursion。

### 7.4 Named Custom connections

active Custom connectionまたはConnection Managerのnamed Custom connectionを使用。

named connectionはURL/secretを供給し、STMB Modelはoverrideのまま。connection削除/種類変更時はSTMBがblockし、別routeへsilent fallbackしない。

### 7.5 Structured output fallback

**Skip structured output and use plain-text completion**はschema送信を止めるだけ。Promptが要求するvalid JSONは依然必要。

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService**でSillyTavern helper経由。Chat Completion preset適用可能。OpenRouter provider order、quantization filters、fallback、middle-outも継承。Service失敗時のSTMB fallbackでも設定維持。両方失敗時は両errorを保持。Full Manualは対象外。

### 7.7 Reverse proxy / Full Manual

**Use reverse proxy**はST設定を渡す。

**Full Manual Configuration**はprofileに別endpoint/keyを保存する例外的経路。可能ならSTで設定/テスト済み接続を使う。

### 7.8 Output length

global STMB max response tokensが通常値をoverride可能。cut-off JSONはよくある失敗原因。Prompt/schemaを弱める前にoutputを増やす。

---

## 8. シーン、手動Memory、自動Memory、Catch-Up

### 8.1 シーン

STMBが1 Memoryに処理するinclusive message range。

よいboundary:

- event;
- conversation;
- investigation step;
- emotional/relationship development;
- location/goal change;
- connected action sequence。

小さすぎると価値が少なく、大きすぎるとcost/context/混在問題。

### 8.2 手動mark

1. message actionsをexpand。
2. first includedに**►**。
3. last includedに**◄**。
4. panelでstart/end/speakers/count/tokens確認。

両端含む。**Clear Scene**で解除。

### 8.3 Manual Memory

1. scene確認。
2. effective book。
3. profile。
4. **Create Memory**または`/creatememory`。
5. confirmation/warning/participant/previewを確認。
6. approve。
7. new lorebook entryとMemory Status確認。

通常title/content/keywords/STMB metadataを含む。

### 8.4 Preview

**Show memory previews**ならtitle/content/keywordsをreview/edit。names、attribution、facts、omissions、unrelated commentaryを確認。Previewなしならvalid result auto-save。

### 8.5 Automatic Memories

**Auto-create memory summaries**:

- **Auto-Summary Interval** = messages per Memory;
- **Auto-Summary Buffer** = newest messagesを保留。

```text
Interval: 30
Buffer: 2
```

32 messages beyond boundaryで、latestの2つ前までをMemory化。

baselineなしは`-1`、message 0から開始可能。manual first推奨。

小interval=focused/more requests。大interval=fewer/larger/mix risk。目安: detailed RP 20–40、short exchange 40–60。

required book未assignならpostpone可能。

### 8.6 Processed baseline

`/nextmemory`、automatic start、boundary、already processedを決める。

```text
/stmb-highest
/stmb-set-highest <N>
/stmb-set-highest none
```

manual変更はskip/duplicate risk。

### 8.7 Catch-Up

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

```text
/stmb-catchup interval=40 start=0 end=245
```

inclusive、consecutive chunks。

事前にprofile test、**Always use default profile** ON、**Show memory previews** OFF、book確保、multi-character assignments修復、chunkをwarning threshold未満。

preflight後順番に処理し、first failureまたは`/stmb-stop`で停止。completed chunksは残る。first unfinishedからresume。

---

## 9. トークン節約、非表示メッセージ、Memory境界

### 9.1 Hideはdeleteではない

chat fileに残り、active contextから除外されるだけ。

### 9.2 Auto-hide

**Auto-hide messages after adding memory**:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden**でrecent overlapを残す。

> **Presence拡張機能を使用する場合:** PresenceとSTMBはどちらもSillyTavernで共有されるmessage visibility stateを変更するため、PresenceがSTMBによってhideされたmessageを後からunhideすることがある。設定方法は[STMBと他の拡張機能](#23-stmbと他の拡張機能)を参照。

### 9.3 Generation前にunhide

**Unhide hidden messages for memory generation**はcompile前にrangeをshow。成功後の再hideはselected auto-hide modeに従う。

### 9.4 Boundary indicator

highest processedでprocessed/unprocessed境界を表示。

Off / divider / draggable jump / both。

Jumpはfirst unprocessedへ。

### 9.5 学習向け設定

divider+jump、2 messages visible、temporary unhide、最初はno auto-hideでsave確認後hide all processed。

---

## 10. Lorebookの有効化と取得

### 10.1 Keywords

具体的なnames/aliases、locations/orgs、objects、events、identifiers、discoveries/actions。

`important event`、`conversation`、`secret`は広すぎる。

Contentが何を学ぶか、keywordsがいつretrieveするか。

### 10.2 Modes

- **Normal** keyword/rules。
- **Constant** always active、budget等に従う。
- **Vectorized** vector retrieval対応時。

Vectorsは任意。

### 10.3 World Info推奨

Match Whole Words off、Scan Depth ~8、Max Recursion ~2、Context percentageは全体budgetに合わせる。必須ではない。

### 10.4 Delay Until Recursion

Memory Bookだけがactive sourceならOFF。そうでないとfirst recursionを始めるentryがなく、Memoryがactivateしない可能性。

### 10.5 Retrieval diagnosis

entry exists → correct book active → entry enabled → keywords/mode → budget → recursion → inspector/logでsent確認 → sentだがignoredならmodel/competing context問題。

---

## 11. 実際のGroup Chat Mode

### 11.1 定義

2枚以上の別Character CardsからなるSillyTavern group。

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

各message authorがわかるのでspeaker attribution/participantsを扱える。別switch不要。

### 11.2 Participant detection

通常はscene内で1 message以上authorになったcard。

Proseから物理的な全present charactersを推論しないため:

- silent observer未検出;
- mentioned onlyはparticipantでない;
- absent discussed characterは選ばれない;
- userはseparate group-character book targetではない;
- unusual/duplicate speakerは修正必要な場合。

0 participantsならauto accept ONでもconfirmationを表示。

質問は**このMemoryをどのgroup charactersと関連付けるか**であり、各factのknowledge/presence証明ではない。

### 11.3 1 group Memory Book

推奨start。

Automatic/Auto-Create/main Manual book。sceneごとにcanonical entry。participant namesがあればinclusive ST character filter。

Alice+Bob filterはAlice **or** Bobで、synthetic “Alice and Bob”ではない。

shared story、group summaryで十分、simple、STLO不要の場合に最適。

非対称knowledgeも保存可能:

> Aliceは送信機を見つけて隠した。Bobは部屋が空だと思っていた。

### 11.4 Group book + character books

必要:

- canonical group book;
- memberごとのcharacter book;
- Manual Mode;
- STLO;
- valid assignments。

group bookをcharacter bookにできない。複数charactersが1 shared character bookを使うことは可能でcopyは1つ。

save時: canonical group → participant confirmation → selected booksへlinked copies → failure時可能ならrollback。

none selectedは全current group members。

### 11.5 Separate prompts

defaultは同じgroup-oriented summaryをcopy。

**Use separate group and character prompts in group chats**:

- Group Summary Prompt → canonical;
- Character Summary Prompt → individual。

private knowledge、mistaken beliefs、emotions、priorities、relationship-specific continuityを保持。追加AI requests。shared character bookは1 shared copy。

### 11.6 STLO

Memory Books: range、participants、content、target books、individual prompts。
STLO: activation、which character、priority、position、budget、order。

STMBは`stlo.characterOverrides`にavatar basename追加、`stlo.onlyWhenSpeaking`有効。既存設定保存。

merge-onlyなのでassignment変更時old overrideは自動削除されない。

### 11.7 Privacyではない

別books/filtersはrelevance routingで、情報隔離を保証しない。security boundaryとして使わない。

### 11.8 Linked copiesはlive syncしない

origin metadataは共有するがedit/delete/compact/regenerateは独立。canonical group regenerationではonly clicked/all linkedを選べ、各entry別generation/approval。

### 11.9 メンバー変更

追加: next distributed Memory前にassign。old Memories/filtersはretroactive変更なし。
削除: existing entries/filters/STLO overrides残る。
reassign: future routingのみ。old overrideが残る場合。

### 11.10 Group consolidation

canonical group bookはomniscient chronologyを目指しobjective eventsとindividual knowledgeを分離するgroup prompt。

character booksはpopup選択preset。source不足bookはwarning skip、他は継続。

missing sceneはchronology gapでありabsence/ignorance/unconsciousness証明ではない。shared bookは1 consolidated entry。

---

## 12. Narrator Mode

### 12.1 定義

通常の1対1chatで1枚のNarrator cardが複数fictional charactersを書くケース。

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

通常STは全AI responseをNarrator authorとして見るため、manual cast modelを追加。real group内では利用不可。

### 12.2 必須layout

- Manual Lorebook Mode;
- 1 selected omniscient/canonical Memory Book;
- declared memberごとにunique Memory Book。

memberはomniscient book不可、2 members sharing不可、全員book必須、retired memberはidentity/book reservation維持。Auto-Create不可。

STLO不要。STMB自身がactive cast booksをcontextへinject。

### 12.3 Setup

1. Narrator normal chat。
2. Manual Mode ON。
3. main manual book = omniscient。
4. **Narrator Mode** ON。
5. **Manage Narrator Cast**。
6. names + unique books。
7. **Active Cast**でnext exchangeのpresent charactersを選択。

Narrator ModeをOFFにしてからManual ModeをOFF。

### 12.4 Active Cast metadata

Drawerはexpand/collapse/move可能。

generation時snapshot:

- user message = active snapshot;
- Narrator response = generation snapshot;
- continuation = merge;
- swipeごとにmetadata;
- swipe選択でrestore可能;
- recent deleteでlast tagged Narrator messageからrestore可能。

associationでありprose analysisではない。

### 12.5 Retrieval

generation開始時、active cast booksをloadしcharacter-loreへmerge、duplicate world/UID回避。

active castのみ追加、omniscientは通常Manual Mode設定、STLO filters不要、generation前のcast selectionが重要。

### 12.6 Scene participants

tagged Narrator responsesがauthoritative。cast IDsをunion。

legacy untaggedがあればall messages continuityからfallbackしconfirmation。current activeがpreselected、emptyはno individual members。

fully taggedなら不要。

### 12.7 Distribution

- canonical omniscient entry;
- selected participant unique booksにlinked copies。

native character filtersは使わずNarrator participant/owner IDsをmetadata保存。

separate prompts OFFならomniscient copies、ONならcharacter-focused generation。

### 12.8 Consolidation/Regeneration

ownership/participant metadataがsourceを通じてhigher tierに残る。Regeneration target判定にも使用。linked entriesはsyncしない。

### 12.9 Retire

retired memberはActive Cast choices/IDsから外れるがidentity/history/book reservationを保持。過去のMemory identityを壊さずactive castから離すため。

---

## 13. チャットのブランチ

native branchesは別continuityになり得る。parentと同じunlocked booksへ書くと矛盾が混ざる。

**Copy Memory Books when branching**はdefault ON。

### 13.1 Copy対象

Automatic: active chat-bound。
Manual: main manual。
Manual real group: unique unlocked character books。
Narrator: omniscient + declared character books。
persistent real-character locksはcopyせずshared継続。

同じbranch operationは同じlineage number:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

branch from branchでもrootを維持。

### 13.2 Metadata rewrite

parent chat IDs→new branch ID、copied linked booksのcanonical links redirect、new branch bindings更新。内容cloneのみでMemory regenerationなし。

### 13.3 Failure safety

copy中chat switchしない。failureならnew branchのinherited writable bindingsをclearし、parent originalsへの誤writeを防ぐ。

### 13.4 Disable

branchが意図的にparentとsame books/historyを共有する場合のみOFF。

---

## 14. Clips

highlighted chat textを直接`[STMB Clip]` entryに保存。AI callなし。

### 14.1 用途

preference、promise/secret、name/alias、item/pet、short relationship fact、ほぼ原文保存したいline、quick note。

### 14.2 Workflow

highlight → scissors → existing/new Clip → always-active/keyword → review → rename → save。

buttonはtext selection時のみ。

### 14.3 Format

```text
Seraphina Healed Me [STMB Clip]
```

```markdown
=== Seraphina Healed Me ===

- Seraphinaは魔法でユーザーの傷を治した。

=== END Seraphina Healed Me ===
```

1 Clip = 1 section。

### 14.4 Existing

title末尾に`[STMB Clip]`でClip扱い。長いentryはmanual edit/Compaction。

選んだtextだけ保存しsource attributionは自動追加しない。

---

## 15. Topical Clips

confirmed STMB Memories、current chatのexplicit range、または両方からAIがtopic-focused entryを作る。eligible sourcesはScene Memories/consolidated summaries。Clip/Side Promptはsource除外。

### 15.1 用途

recurring NPC、relationship history、location/faction、investigation/mystery、powers/injuries/promises/preferences/secrets、important object、unresolved plot thread。

chronologyではなくtopicで整理。

### 15.2 Sources

selected bookのconfirmed Memories + explicit inclusive `X-Y` visible messages。

**Include saved Memories**/**Include chat messages**別々/両方。message rangesはglobal unhide settingに従いhidden stateをrestore。

range外messages、ordinary Clips、Side Prompts、unrelated lorebook entriesは使わない。

### 15.3 作成

Memory Books → Topical Clip → Source Book → Topic → Keywords/blank → new/existing target → sources → optional selected memories/range → profile → generate → review/edit → save。

draft auto-saveなし。

### 15.4 Update

successful run後used sourcesと必要ならchat/range/IDs/hashesを保存。次回memory-based updateは通常new/changed sources + existing contentのみ。Message rangeは毎回explicit。

**Rebuild from all source memories**はincomplete/disorganized、prompt changed、older memories heavily edited、full reconsideration時。

### 15.5 Manual selection/token

**Use only selected memories**はlarge book、limited story period、name overlap、strict evidence時。

threshold超過でwarning。

### 15.6 Review

on-topic、names/relationships、major facts、contradictions、unsupported inventionなし、duplicateなし。

### 15.7 Placeholders

saved Memories使用時`{{SOURCE_MEMORIES}}`、messages使用時`{{SOURCE_MESSAGES}}`必須。

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

問題時Reset to Default。

---

## 16. Side Prompts

通常character replyとは別に動くnamed STMB prompt。通常は継続的なsupport entryを作成/更新。

**Trackers & Side Prompts**のpower iconでprompt-wide **Enabled**を即変更。trigger自体は変えない。

### 16.1 用途

plot/unresolved tracker、relationship state、NPC/faction status、inventory/resources、injuries/stats/reputation、timeline/date/deadline/travel、clues/suspects/contradictions、research/projects、continuity risk、world state。

「everythingをtrack」やduplicate scene summary、next RP response内に必要なtaskは避ける。

### 16.2 Output

通常final plain text/Markdown。Memory JSON不要。意図してJSONをtracker textとして保存する場合のみ。

### 16.3 Sequence

instructions → prior tracker → optional previous Memories → optional Additional Context → selected/since-last scene → optional Response Format。

prior entryはrevise対象stateで、全旧情報を残す根拠ではない。stale/resolved/contradicted/duplicateを削除するよう明記。

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

spaces含むnameはquotes。range inclusive。

### 16.5 Automatic after-Memory

**Run automatically after memory**。

chatはindividual enabled promptsまたは1 selected setを使用。setはindividualを置換し加算しない。

#### Memory Assistance

reserved Side Prompt、4 modes。saved Memory後に普通のenable/setと独立してrun。Memory regeneration時はrunしない。

raw sceneとtarget booksのordinary/Topical Clipsを比較し、title/topic、keywords、current content、stable ID、typeをAIへ。

Queueありならbookごとに**Memory Assistance** job。request/validation/report/apply errorはFailed。Memory本体はCompletedのまま。

- **Off**
- **Update** ≤5 clips直接、>5 selection、manual approval。
- **Update and Suggest** topic discovery後Update。
- **Automatic** all clips token-batched、ordinary additions直接apply、Topical replacementsはpending。

Query Selected/All。ordinary Clipにはmax1 exact excerpt、Topicalはfull replacement。AI outputはUID→suggestion JSON map、`{}`はnone。

Update結果は`Memory Assistance (STMB SidePrompt)`にpending。Automaticはapplied countとpending Topical/failuresを保持。Cancelでold suggestions clear。

Discovery requestはscene + lightweight Topical titles/topics/keywordsだけ。0–5 topics、`{"topics":[]}` valid。

**Review Topics**でcheck/edit/add。confirmed topicはstandard Topical draft。saveした時だけpendingからremove。

completion popupはDismiss/Go to Suggestions。menuから開くとcurrent effective bookをfirst select。

prompts/profile override editable、response contracts fixed。Memory Assistanceはdelete/duplicate/set/manual不可。

### 16.6 Visible interval

**Run on visible message interval** + visible message count。hidden/systemはcountしない。setではappropriate triggerを持つrowだけ。

### 16.7 Side Prompt Sets

ordered run listでfolderではない。同一templateを別macrosで複数回可能。

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

row: prompt ref、optional label、runtime macro values、order、duplicate/delete。

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Defaults/per-chat

General Settingsでsolo/group default set。

chatはinherit、individual、named set。

empty default=individual。selected set deletedならwarning、silent fallbackなし。missing prompt/unresolved macroはrow skip。

Automatic runには各prompt側triggerも必要。manual set commandには不要。

### 16.9 Macros

```text
{{user}}
{{char}}
```

nonstandard `{{...}}`はruntime macros。manualまたはset rowでvalues。

```text
{{npc name}}
{{faction}}
{{project_name}}
```

unresolvedならauto run不可。

### 16.10 Count macros

| Macro | Count |
|---|---|
| `{{memtier0}}` | Scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clips |
| `{{memside}}` | Side Prompts |

effective main bookのみ。multi-book character booksは合計しない。valueはnumberのみ。

### 16.11 Message ranges

explicitならexact inclusive。なしならsince-last checkpoint/cap。

### 16.12 Additional Context/Previous Memories

previous scene Memories最大7。Additional Context source = none / **Follow chat** / fixed named setting。referenceとして使いblind copyしない。

### 16.13 Lorebook targets

priority: per-chat override → template target → effective book fallback。shared campaign/dedicated trackerなど意図的用途。

### 16.14 Entry controls

title override、keywords、Normal/Constant/Vectorized、position/Outlet、order、Prevent Recursion、Delay Until Recursion、Ignore Budget。macros expand可能。Ignore Budget注意。

### 16.15 Connection profile override

normal resolution継承またはspecific STMB profile。組合せを増やしすぎない。

### 16.16 Regeneration

compatible saveはversion-2 snapshotを保存：template key、regeneration用prior content、run前にentryが存在したかとexact prior state（古いrollback snapshotを除外）、source chat/range、runtime macro values、STMBが書いたexact stateのfingerprint。

lorebook editor → **Regenerate side prompt**。current template/profile/contextでreplacement。

template deleted/source unavailable/target-source changedなら不可。contentのみ置換。legacy version-1 snapshotもregenerationには使えるが、Memory Auto-Rollbackには使えない。

### 16.17 良いSide Prompt

exact job、sources、revise/replace/merge/append、stale removal、stable headings/order、strict length、final-onlyを指定。

```text
提供されたシーンから関係trackerを更新してください。現在の事実を維持し、新しい展開を既存セクションへ統合し、解決済み・矛盾・古い・重複した内容を削除してください。各関係は簡潔な1～3項目にしてください。更新済みtrackerだけを出力してください。
```

```text
本当に新しい情報がない限り新しいセクションを追加しないでください。
解決済みのthreadと古い推測を削除してください。
前置きや説明なしで更新済みreportのみ出力してください。
全体を300語未満にしてください。
```

### 16.18 Troubleshooting

not run: event、selection mode/set、prompt exists、trigger、runtime values、stop/failure。
twice: manual+auto、duplicate rows/prompts、multiple tabs/chats。
wrong book: per-chat/template targets。
grows forever: replace/prune/item/word limits。

---

## 17. Consolidation

lower-tier STMB Memories/summariesをhigher-tier chronological recapへ。

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

raw chatではなくexisting STMB entriesがsource。

### 17.2 用途

scene Memories蓄積、old detailを減らす、relationship/plot/campaign phase終了、token reduction、clean chronology。

lasting changes、turning points、goals、consequences、relationship shifts、unresolved threads、stable stateを重視。

### 17.3 Manual

**Consolidate Memories** → 表示されたSource Memory Bookを確認（必要ならこのrunだけ別bookを選択。chatのconfigured bookは変わらない）→ target tier → sources → prompt/profile → disable sources? → run/review → approve。

### 17.4 Readiness prompt

**Prompt for consolidation when a tier is ready**はminimum到達時yes/later。YesはUIを開くだけで自動consolidateしない。

### 17.5 Schema

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

one/multiple summaries可。`member_ids`でsource assignment。outlierは`unassigned_items`。

### 17.6 Previous higher-tier summary

canon contextとして提供可、source to rewriteではない。

### 17.7 Previews/failures

edit/accept/regenerate candidate/batch。malformed response inspect/manual correction対応時。

### 17.8 Source disabling

success後sourceをdisableしてhigher summaryにretrievalを任せる。deleteではなくreversible。

### 17.9 良いPrompt

compression target、smallest coherent number、chronology/grouping、must-survive details、outliers、exact JSON。major beats/consequences/promises/relationships/IDs/threads/keywords保持、repeated scene detail削減。

---

## 18. Compaction

1つのSTMB-managed entryをAIで短縮し、originalとdraftを比較後置換。

### 18.1 Eligible

`[STMB Clip]`、Side Prompt、STMB Memory。ordinary non-STMB entriesは対象外。

### 18.2 Workflow

Compaction → book → profile → optional prompt → entry → compare → edit → replace/copy/cancel。

**Replace with Compacted Version**までoriginal不変。

### 18.3 用途

long Clips、repetitive/stale tracker、wordy Memories、expensive always-active entries。

adding facts/raw chat summary/new Memory/ordinary entriesには使わない。

### 18.4 Placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

facts/names/pronouns/macros/wrappers/end markersを保ち、redundancy削減。

---

## 19. Regeneration

既存entryのレビュー可能なreplacementを作ります。2つ目のnumbered entryは作らず、approvalなしでoverwriteしません。

### 19.1 Scene Memory Regeneration

- source chatを開く;
- Memory Bookをlorebook editorで開く;
- **Regenerate memory**;
- canonical group entryにlinked character entriesがある場合、clicked entryのみかall linkedか選択;
- current profile、prompt、Previous Memories count、Additional Contextを選択;
- 各entryのtitle/content/keywordsをreview。

original scene rangeとsequence numberは保持。linked entriesは同じselected settingsを使いますが、自分自身のbook contextとgroup/character targetで生成されます。STMBはdirect save前にすべてのapprovalを集めます。source messagesがhiddenならunhideするか設定をON。

### 19.2 Consolidation Regeneration

higher-tier summaryをexact linked lower-tier sourcesから専用**Regenerate Consolidation** presetで再生成。

full source setが正しいtierに残っている必要があります。active parent summaryが依存するlower sourceはregenerate不可。意図的にlower tierを再構築するならparentを先にdelete。

### 19.3 Side Prompt Regeneration

16.16参照。

### 19.4 Safety checks

replacement直前に:

- target entry unchanged;
- source chat range unchanged;
- required consolidation sources unchanged/available;
- entry still eligible。

失敗時overwriteなし。

linked group/character/Narrator copiesは独立。

---

## 20. 生成用コンテキスト

複数のcontext sourceは互換ではありません。

### 20.1 Current scene

現在処理するrange。ordinary Scene Memoryのtarget material。

### 20.2 Previous Memories

effective Memory Book内のearlier Scene Memories。read-only continuity contextとして0～7件。current sceneより前にあるだけで再要約しない。

### 20.3 Additional Context

stable referenceとして選ぶlorebook entries:

- character/setting rules;
- canonical names/terms;
- campaign constraints;
- authoritative timeline;
- location refs;
- scene内で繰り返されていないknown facts。

Previous Memoriesとscene transcriptより前。別sceneではない。

### 20.4 Context Settings

reusable ordered Additional Context collection。

1. **Context Settings**。
2. named setting作成。
3. entries選択。
4. order。
5. chat用settingまたはNo Context。

per-chat stored、Current ST Settingsとsaved profiles双方で利用。

referenced book/entry missingならwarning+skip。setting自体deletedなら別選択までAdditional Contextなし。

`stmb-context-settings.json`としてduplicate/import/export。

### 20.5 Prior Side Prompt entry

reviseするcurrent tracker state。古い全statementがtrueである証拠ではない。

### 20.6 Consolidation sources

実際にgroup/compressするlower-tier entries。

### 20.7 Previous higher-tier summary

carry-forward canon。rewrite sourceではない。

### 20.8 Workflow ordering

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

target materialとreference-only materialを明確にlabel。

---

## 21. Prompt構造、組み込みSummary Prompt、作成ルール

### 21.1 Ordinary Memory

期待JSON:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

rules: JSON objectのみ、exact keys、keywordsはstring array、short title、concrete retrieval terms、Markdownはcontent string内、quotesをescape。

STMBは一部のfence/trailing comma/think tag/wrapper/minor malformedをrepairできますが依存しない。

強いPromptはstyle/compression、must-preserve continuity、omit content、exact schemaを定義。

### 21.2 Built-in Summary Prompts

ordinary Memory専用。Consolidation/Side Prompt/Topical/Compactionには影響しない。Profileの**Memory Creation Method**で選択。**Summary**が普通のdefault/fallback。

- **Summary**: ほとんどのユーザーのbest start。
- **Comprehensive**: continuity-heavy long RP。causality/continuity/keywordsを強く管理するが要求が高い。
- **Minimal**: token saving優先。nuanceを失う。
- **Group + Character**: separate real-group/Narrator books向けtargeting。

| Preset | 最適用途 | Trade-off |
|---|---|---|
| **Summary** | solo/first setup。詳細なchronological narrativeとevents/interactions/developments/revelations/outcomes/keywords。 | token-minimalより詳細だが扱いやすい。 |
| **Comprehensive** | long-running continuity-sensitive stories。causal chains、dynamics、facts、exchanges、threads、keywords。 | 最も長く高要求。能力あるmodelと十分なtokens。 |
| **Summarize** | Timeline、Story Beats、Key Interactions、Notable Details、Outcomeのscannable Markdown。 | bullet-heavyで重複可能。 |
| **Synopsis** | ほぼ全significant beat/detail/outcomeを残す。 | 長い。tight budget不向き。 |
| **Sum Up** | heading/timeline付きchronological narrative、section overhead少なめ。 | category separation弱め。 |
| **Minimal** | high-volume/low context、2～5文。 | motives/emotion/causality/minor continuityを落としうる。 |
| **Northgate** | third-person past-tense literary record、actions/emotion/dialogue。SillyTavern DiscordのNorthgate由来。 | readability重視、OOC除外を明示しない。 |
| **Aelemar** | major plot/emotional scenesをstandalone record化。Aelemar由来。 | 300語以上、token-saving不向き、OOC明示除外なし。 |
| **Group** | shared/omniscient book、正しいmember attribution。 | individual character Memoryには不向き。 |
| **Character** | target characterがdid/knew/felt/learned/concealed/misunderstood/affectedした内容。 | target無関係・unsupported private knowledgeを除外。 |

新規installでは**Summary**でgeneration/retrievalを安定させ、Promptだけ変えて比較。omissionならComprehensive、sizeならMinimal。Promptはweak model、truncation、bad scene boundaries、bad retrievalを補えない。

Built-insはactive localeでrecreate可能。customized built-inは先にduplicate/export。

### 21.3 Multi-character target

`group` = canonical real-group/omniscient Narrator、`character` = individual book。scene/context未支持のknowledgeをinventしない。

### 21.4 Side Prompt authoring

maintenance instructionとして、narrow job、prior tracker handling、stale removal、stable headings/length、final-only。

### 21.5 Consolidation authoring

17.5 schema。chronology、smallest coherent summaries、`member_ids`、`unassigned_items`、major continuity、concrete keywords。**Regenerate Consolidation**はreplacement専用。

### 21.6 Topical Clip authoring

`{{SOURCE_MEMORIES}}`必須（使用時）。topic focus、evidence/inference、existing content merge、contradictions。

### 21.7 Compaction authoring

`{{ENTRY_CONTENT}}`必須。unsupported factsを増やさず、required wrappers/macros保持。

### 21.8 Checklist

1. analysis target?
2. reference-only?
3. strict JSON or final text?
4. later retrievalに何を残す?
5. omit/merge/carry/unassignは?

format correctnessがstyleより先。

---

## 22. Summary Prompt ManagerとConsolidation Prompt Manager

Summary Manager: ordinary Memory presetsのcreate/edit/duplicate/delete/import/export。profileからassign。required JSON schema維持。

Consolidation Manager: lower→higher promptsとnormal default。regeneration-only presetはordinary default不可。

Built-insはlocaleでrecreate可能。custom editsはbackup。

---

## 23. STMBと他の拡張機能

SillyTavernの拡張機能は並行して動作し、同じSillyTavern dataを読み取ったり変更したりすることがある。STMBが他の拡張機能をoverrideまたはdisableしたり、他の拡張機能より高いpriorityを持ったりすることはない。拡張機能の動作が重なる場合、最終結果は関係する各拡張機能の設定と実行タイミングによって決まる。

### 23.1 共有されるmessage visibility

Chat messageがhiddenかどうかは、SillyTavernで共有されるmessage stateの一部である。STMBだけが所有するstateではない。

STMBの**Token Saving**設定は、Memoryの保存後に処理済みmessageをhideできる。別の拡張機能がそのmessageを後からunhideすることがあり、STMBはそれを阻止しない。同様に、**Unhide hidden messages for memory generation**は、STMBがselected rangeを処理またはregenerateしている間にmessageをunhideすることがある。

### 23.2 Presence

Presence拡張機能とSTMBはどちらも、chat messageのhidden/visible stateを変更できる。PresenceがSTMBによってhideされたmessageをunhideしても、STMBのToken Saving設定が消去または無視されたわけではない。Presenceの後続actionが、同じSillyTavern message stateを変更した結果である。

Presenceを使用し、STMBによってhideされたmessageをhiddenのまま維持したい場合は、Presence自身のhidden-message lock機能を使用する。Presenceは現在、この目的のために`/presenceLockHiddenMessages` commandを提供している。対象message rangeに対して実行し、そのrangeが広がったら再度実行する。現在のcommand動作はPresenceのdocumentationを参照。

STMBがPresenceを自動で設定または呼び出すことはない。また、STMBのgroup chat participant管理はToken Savingとは無関係である。

### 23.3 Regex連携

1. **Outgoing/User Input**: send前にassembled promptをtransform。
2. **Incoming/AI Output**: parse/save前にraw responseをclean。

**Use regex (advanced)** → **Configure regex** → scripts。

STMB selectionがexecutionを制御し、通常Regex UIでdisabledでもrunしうる。

bad outgoingはschema instructionsを、bad incomingはvalid JSONを破壊する可能性。

---

## 24. Lorebookエントリのタイトルと文字ポリシー

### 24.1 Placeholders

`{{title}}`、`{{scene}}`、`{{char}}`、`{{groupname}}`（current group display name。group外は`Unknown`）、`{{present}}`（sceneにいるcharactersのcomma-separated list。groupのspeakers、Narrator Modeのselected Active Cast、通常chatのcurrent character）、`{{user}}`、`{{messages}}`、`{{profile}}`、date/time placeholders。

### 24.2 Numbering

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

sequential zero-padded。

### 24.3 Unicode

printable Unicodeすべて可（emoji、accented、CJK、symbols）。U+0000–U+001F/U+007F–U+009F control charsはremove。Auto-Create filenamesは別途sanitize。

---

## 25. Job QueueとRetry操作

optional Chat Top Barが必要。Memory/Consolidation/Side Prompt regenerationでjob作成、replacementはapprovalまでreview。

statuses: queued、active、completed、failed、canceled、blocked、Needs Review。

range jobsはstart/end numbers表示。cancel、reopen review、inspect failure、retry、dismiss可能。

- **Retry**: non-Memory job。
- **Retry All**: Memory + after-Memory Side Prompts。Memory already savedならduplicateせずresume可。
- **Retry Memory**: Memoryのみ、after prompts skip。

Top Barなしでもworkflow自体は動く。

---

## 26. 視覚的フィードバックとアクセシビリティ

scene controlsのinactive/selected/valid/in-scene/processing states。colorsはtheme依存。

keyboard、focus indicators、ARIA、reduced motion、mobile-friendly。

Screenshot案内では色でなくvisible icon/label。

---

## 27. 設定マップと現行設定リファレンス

基本path: **magic-wand Extensions → Memory Books**。

scope: Global / Per chat / Per character / Per profile-template-setting / Per run。

### 27.1 Main panel

| Setting | Location | Scope | 機能 |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | Current Lorebook Configuration | global mode; book per chat | chat-bound targetをやめmanual book必須。Auto-Createと排他。 |
| **Selected manual Memory Book** | manual controls | per chat | main book。Narratorではomniscient。 |
| **Group-character Memory Book assignments** | group rows | per chat | characterごとのbook。STLO必要。 |
| **Character Memory Book lock** | lock icon | per character | compatible chats間でassignment固定。 |
| **Narrator Mode** | current config | per chat | main manualをomniscientにしdeclared unique booksを有効化。 |
| **Manage Narrator Cast** | Narrator/Active Cast | per chat | add/retire/restore/assign。 |
| **Auto-create lorebook if none exists** | current config | global | Automatic Modeでbook作成/bind。 |
| **Lorebook Name Template** | Auto-Create下 | global | `{{char}}`, `{{user}}`, `{{chat}}`。 |
| **Memory profile selection** | Memory Profiles | per run | next Memory profile。 |
| **Set as Default** | Profile Actions | global | default profile。 |
| **Memory Title Format** | Profiles/Edit | per profile | title/numbering。 |

### 27.2 General Settings

| Setting | Scope | 機能 |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | confirmation skip、Catch-Up必須。 |
| **Automatically accept detected participants in future** | Global | group participants自動accept。 |
| **Show memory previews** | Global | editable review。 |
| **Show consolidation previews** | Global | consolidation review。 |
| **Show notifications** | Global | toasts。 |
| **Show floating Clip button when text is highlighted** | Global | scissors。 |
| **Memory boundary indicator** | Global | divider/jump。 |
| **Allow scene overlap** | Global | existing Memory range overlap許可。 |
| **Refresh lorebook editor after adding memories** | Global | write後editor refresh。 |
| **Copy Memory Books when branching** | Global | unlocked books copy、locked shared。 |
| **Auto-rollback after message deletion** | Global | processed chatにmessage deletion/truncationがかかった時のcoordinated rollback。default off。通常edit/swipeは対象外。 |
| **Update last message ID processed** | Global; Auto-Rollback action | processed checkpointを最新surviving Memory末尾へ。Memoryがなければclear。 |
| **Delete last Memory** | Global; Auto-Rollback action | rollback scopeでinvalidになったMemoriesとlinked copiesを削除。Memory/consolidation deleteは不可逆。 |
| **Restore previous Side Prompts** | Global; Auto-Rollback action | unchanged affected Side Promptをlatest exact before-stateへrestore。1 rollback levelのみ。 |
| **Default for solo chats** | Global | solo Side Prompt Set。 |
| **Default for group chats** | Global | group set。 |
| **Max Response Tokens** | Global | STMB output override、`0` fallback。 |
| **Token Warning Threshold** | Global | input size warning。 |
| **Default Previous Memories Count** | Global | 0–7。 |
| **Use regex (advanced)** | Global | Regex enable。 |
| **Configure regex… → Outgoing scripts** | Global | pre-send。 |
| **Configure regex… → Incoming scripts** | Global | pre-parse/save。 |

#### Memory Auto-Rollback

**Auto-rollback after message deletion**がmaster。3 action checkboxは独立選択、default enabledだがmaster off中はdisabled表示なので、upgradeだけで削除は始まらない。

対象はmessage deletion/truncation（response regenerationのdeletion phase含む）のみ。edit/swipeは対象外。middle deletionを正確に扱うためSTMBはactual message identitiesを追跡する。

Tail deletionはremoved suffixとsource rangeが重なるMemoriesが対象。Middle deletionは **Full rollback**（affected + newer Memoriesを削除）、**Affected only**（overlapのみ削除しnewerを維持、ranges/Side Prompt checkpoints/processed checkpointをshift。coverage gapが残る）、**Cancel**。

Rollbackはexact `STMB_chatId`、source-range、canonical/link metadataを使用。canonical group/Narrator Memory + discoverable linked copiesは1 deletion unit。missing canonical、ambiguous legacy identity、malformed range、incomplete consolidation dependencyなら全体停止してrepair guidance。ownershipは推測しない。

**Delete last Memory**時はdirect/transitive consolidation parentsをpreflightし、必要なconsolidationsをcombined confirmation。Cancelなら全変更を中止。Approveならancestors削除、deleted consolidationがdisabledにしたexisting direct sourcesをre-enableして`disabledBySummaryId`をclearし、base Memoriesを削除。user独自disableは触らない。

Save前にcomplete lorebook fingerprintsを再確認し、serialized write lanesでsorted write。後続失敗用のunchanged pre-write cloneを保持。chat checkpointは全lorebook write成功後のみ変更。queued workはpreflight前cancel、active non-queued Memory creationは完了待ち。

Side Prompt rollbackはversion-2 snapshotを使用。entry existed、exact prior state、source chat/range、written-state fingerprintを記録。rolled-back runが作成したentryはdelete。current entryがfingerprint不一致ならuser/later run変更とみなし保持。version-1はregeneration可だがrollback不可。restore成功でsnapshotをconsumeするため次runまでは再rollback不可。複数Memories同時rollbackでは各Side Promptのlatest before-stateのみ戻せる。

Token Saving:
- **Auto-hide messages after adding memory**: none/all processed/last range。
- **Messages to leave unhidden**: recent overlap、0ならendまで。
- **Unhide hidden messages for memory generation**: `/unhide X-Y`相当。

### 27.3 Automatic Memories

**Auto-create memory summaries**、**Auto-Summary Interval**、**Auto-Summary Buffer**、**Prompt for consolidation when a tier is ready**（yes/laterのみ）、**Auto-Consolidation Tiers**。

### 27.4 Profile Editor

| Setting | 機能 |
|---|---|
| **Profile Name** | reusable name |
| **API/Provider** | Current ST/provider/Custom/Full Manual |
| **Use this connection profile** | active/named Custom |
| **Skip structured output and use plain-text completion** | schema送信なし、JSONは必要 |
| **Use ST's ChatCompletionService** | ST helper |
| **Chat Completion Preset** | optional preset |
| **Model** | exact ID |
| **Temperature** | randomness |
| **Use reverse proxy** | ST proxy |
| **API Endpoint URL / API Key** | Full Manual only |
| **Memory Creation Method** | Summary preset |
| **Use separate group and character prompts in group chats** | separate presets |
| **Group Summary Prompt / Character Summary Prompt** | selections |
| **Memory Title Format** | title |
| **Activation Mode** | Normal/Constant/Vectorized |
| **Insertion Position** | Character/Example/Author's Note/Outlet |
| **Outlet Name** | Outlet |
| **Insertion Order** | Auto/Manual/Reverse |
| **Prevent Recursion** | recursive trigger防止 |
| **Delay Until Recursion** | first scan activation防止 |
| **Also include** | legacy profile only |

Current ST live valuesはSillyTavern側。

### 27.5 Context Settings

**Additional Context for this chat**、**Context Setting Name**、**Additional Context entries and order**。New/Duplicate/Delete/Import/Exportは管理操作。

### 27.6 Trackers & Side Prompts

after-memory mode per chat、concurrency 1–10、Set Name、Row template/label/macros/order、Enabled、visible interval、auto-after-memory、manual `/sideprompt`、Prompt/Response Format、Previous Memories 0–7、Additional Context follow/fixed、Lorebook Target、title/keywords、activation/insertion/outlet、order、recursion/Ignore Budget、profile override、Memory Assistance Mode、Update/Topic prompts、Memory Assistance profile override。

### 27.7 Prompt managers

Summary prompt name/text、default consolidation prompt、Consolidation prompt name/text。

### 27.8 Topical/Compaction defaults

shared **Generation Profile / Compaction Profile**。global Topical Clip Prompt。global Compaction Prompt（`{{ENTRY_CONTENT}}`必須）。

### 27.9 Consolidate Memories

**Source Memory Book**（Per run。表示中のconsolidation source bookを別のavailable bookへ変更できる。eligible listはreloadするがchatのmanual/chat-bound設定は変えない）、 Target tier、prompt、max entries/pass、Token Budget、automatic summary attempts、saved minimum per tier、consolidated-entry activation/position/order/recursion defaults、disable sources、selected sources。


### 27.10 SillyTavern World Info

Match Whole Words offが一般的、Scan Depth ~8、Max Recursion ~2、Context percentage/lorebook budget。推奨で必須ではない。

---

## 28. Slash Commandリファレンス

```text
/creatememory
/scenememory X-Y
/nextmemory
/stmb-catchup interval=x start=y end=z
```

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

```text
/stmb-highest
/stmb-set-highest <N|none>
```

```text
/stmb-stop
```

`/stmb-stop`は全in-flight STMB generation（Side Prompts含む）を停止。committed workは残る。

---

## 29. 段階別トラブルシューティング

### 29.1 UIなし

install/enabled → reload → chat open → 10s → message actions → console。

### 29.2 Sceneなし

**►**/**◄**両方。Current Scene確認。overlapならrange変更またはAllow Scene Overlap。

### 29.3 Valid bookなし

Automatic: bind/Auto-Create。
Manual: main選択、deleted selection修復、broken lock解除。
Multi-book group: STLO、all assignments、group book≠character book。
Narrator: Manual、omniscient、unique books。

### 29.4 Invalid AI Memory

provider/model/profile → truncation → response tokens → exact JSON prompt → Regex → structured support → providerがschema reject時だけSkip Structured Output → better model → **Raw response from AI**とmanual correction。

### 29.5 Messages消えた

auto-hidden。deleteされていない。

### 29.6 Automatic動かない

enabled、enough messages、interval+buffer、postpone、valid book、blocking job、chat switch、group generation complete。

manual firstは推奨だが必須でない。

### 29.7 Entry activateしない

book active、entry enabled、keywords、mode、budget、recursion、STLO、World Info inspector/logs。retrieval確認前にregenerateしない。

### 29.8 Sentだがignored

model behavior。短く明確に、placement改善、competing context削減、OOC reminder、better model。

### 29.9 Side Prompt

16.18。selected setはset外individual promptsを抑制。

### 29.10 Consolidation promptなし

readiness enabled、tier monitored、eligible sources/minimum。

### 29.11 Regeneration disabled

old metadata、source unavailable、sources missing/wrong tier、active parent、unknown sequence、template deleted。

### 29.12 Branch copyなし

settingがbranch前ON、native branch、books available、copy中chat switchなし、already handledでない、locksは意図的にshared。

### 29.13 Narrator cast wrong

Active Cast、continuation merge、swipe restore、legacy confirmation、retired、books exist。

---

## 30. FAQ

**Vectors必要?** いいえ。Keywordsで十分。Vectorsはoptional。

**Memory用に別lorebook?** 通常は整理/budget/reuse/diagnosisのため推奨、必須ではない。

**STMBはmessagesを削除?** しない。active contextからhide可能。

**完全manual?** 可能。

**Automaticで最初のMemory?** 現行は可能。baselineなしでinterval+buffer到達後message 0から。manual firstは推奨。

**Consolidationはautomatic?** いいえ。ready promptは出せるがuser confirmation/reviewが必要。

**Real groupで1 book?** はい、推奨start、STLO不要。

**Separate character booksはいつ?** individual continuity/knowledge/retrievalがextra setup/requestsに見合うとき。

**Narrator=Group?** いいえ。Groupはseparate Character Cards、Narratorは1 cardがmultiple fictional characters。

**NarratorはSTLO必要?** Active Cast retrievalには不要。Manual Mode、omniscient、unique booksは必要。

**Linked copies sync?** しない。

**Delay Until Recursionなぜ通常OFF?** 他のentryがrecursionを開始しないとMemoryが一度もactivateしない可能性。

**最初の成功後?** retrieval確認 → automatic/interval/buffer → hide → 必要に応じClip/Side Prompt → 十分なMemories後Topical/Consolidation。

---

## 31. 互換性、移行、現行の履歴メモ

- 現行document: v8.5.0、2026-08-01。
- SillyTavern requirement: 1.14.0+。
- Narrator Mode: v8.5.0。
- Branch copying、Side Prompt Regeneration、Character Locks: v8.4.0。
- Multi-character real group: v8.0.0。
- Additional Context → per-chat Context Settings: v7.0.0。
- Topical Clip: v6.10.0。
- Compaction/Clips: v6.6.0。
- Side Prompt Sets/targets: v6.4–v6.5。
- Multi-tier Consolidation: v6.0.0。
- Job Queue: v6.8.0 optional。
- current defaultsはDelay Until Recursion OFF。

Older entriesは`stmemorybooks` flagとrequired metadataがあるものだけSTMB Memoryとして認識。古いものはconverter。

Bookmark機能はv4.0.0でcoreからremoved。現行として案内しない。

Built-in promptsはactive localeでregenerate可能。custom backup。

Side Prompt importはadditive。key conflictはrenameしoverwriteしない。

---

## 32. 開発者向け・ライセンス情報

```sh
bun run build
```

```sh
bun run install-hooks
```

pre-commit hookはbuild、artifacts stage、failure時abort。

Copyright © 2024–2026 Aiko Hanasaki。GNU Affero General Public License v3.0。modified versionsはnotice保持、modifications識別、AGPL source availability要件に従う。

---

## 33. 簡易診断ツリー

```text
「Memory Booksが動かない」
│
├─ UI visible?
│  ├─ No → install/loading/UI
│  └─ Yes
├─ Scene selectable?
│  ├─ No → actions、両chevrons、overlap
│  └─ Yes
├─ Valid effective book?
│  ├─ No → bind/auto-create/manual/repair
│  └─ Yes
├─ Valid complete generation?
│  ├─ No → profile/provider/tokens/JSON/Regex/model
│  └─ Yes
├─ Entry saved?
│  ├─ No → save/rollback/permission/job
│  └─ Yes
├─ ST activates/sends?
│  ├─ No → keywords/mode/binding/budget/recursion/STLO
│  └─ Yes
└─ Model uses entry?
   ├─ No → compliance/placement/context/clarity
   └─ Yes → workflow正常
```

---

## 34. 推奨される最小の学習順序

1. magic-wandからMemory Books。
2. Automatic Mode + bound book、またはAuto-Create。
3. Current SillyTavern Settings。
4. **►**/**◄**で短いcomplete scene。
5. Memory create/preview。
6. bookでsaved entry確認。
7. retrieval確認。
8. Automatic + interval/buffer。
9. hidden≠deletedを説明してからAuto-Hide。
10. Clips → Side Prompts → 必要になったらTopical/Consolidation。

custom prompts、Full Manual、multiple character books、Regex、Consolidationから始めない。

---

## 35. 最終概念まとめ

```text
chat materialを選択/スケジュール
→ structured representation生成
→ retrieval metadata付きで保存
→ 必要ならprocessed transcriptをhide
→ 後にSillyTavernがrelevant entriesをretrieve
```

coherent scenes、target/reference区別、exact JSON schemas、concrete keywords、deliberate book assignment/activation、stale tracker pruning、continuityを失わないConsolidation、saved=sentと仮定せずretrieval確認、精度が複雑さに見合う場合のみadvanced multi-book routing、が重要です。
