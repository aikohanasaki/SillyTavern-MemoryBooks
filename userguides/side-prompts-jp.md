# 🎡 Side Prompts（サイドプロンプト）

Side Prompt は、チャット管理のために追加で実行される STMB プロンプトです。通常のキャラクター返信にすべての作業を押し込まずに、分析、追跡、要約、整理、補助メモの更新などを行えます。

チャットに継続的な tracker、関係性レポート、プロットリスト、発明ログ、NPC 状態シート、タイムライン、または似たような補助ドキュメントが必要なときに使います。キャラクターはそのままロールプレイを続けられます。事務作業は Side Prompt が担当します。❤️

## 目次

- [Side Prompt とは](#side-prompt-とは)
- [使うべき場面](#使うべき場面)
- [簡単セットアップ手順](#簡単セットアップ手順)
- [実行の仕組み](#実行の仕組み)
- [手動実行](#手動実行)
- [memory 作成後の自動実行](#memory-作成後の自動実行)
- [Side Prompt Sets](#side-prompt-sets)
- [マクロ](#マクロ)
- [メッセージ範囲](#メッセージ範囲)
- [良い Side Prompt の書き方](#良い-side-prompt-の書き方)
- [例](#例)
- [トラブルシューティング](#トラブルシューティング)
- [要点](#要点)

---

## Side Prompt とは

Side Prompt は、通常のキャラクター返信とは別に実行される、名前付きのプロンプトです。

次のようなものを作成または更新できます。

- プロット tracker
- 関係性 tracker
- NPC や勢力のメモ
- 所持品／資源リスト
- タイムライン
- 謎／手がかりボード
- 発明やプロジェクトの tracker
- continuity レポート
- 整理用メモ
- lorebook 風の補助エントリー

Side Prompt は通常の memory とは異なります。memory はふつう、シーン要約を順番に保存します。Side Prompt はふつう、継続的な状態ドキュメントを維持し、それを更新または上書きします。

また、Side Prompt は **JSON を返す必要はありません**。特定のプロンプトや保存先がより厳密な形式を要求していない限り、プレーンテキストや Markdown で問題ありません。

---

## 使うべき場面

Side Prompt は、構造化された補助作業に使います。

良い使い方:

- **プロットポイント:** 進行中のスレッド、解決済みのスレッド、未回収の要素
- **関係性:** 信頼、緊張、惹かれ合い、境界線、目的
- **NPC:** 各 NPC が知っていること、望んでいること、最近したこと、次に必要なこと
- **タイムライン:** 日付、移動、怪我、締め切り、カウントダウン
- **世界状態:** 変化した場所、物品、勢力、資源
- **謎:** 手がかり、容疑者、矛盾、未回答の疑問
- **プロジェクト:** 発明、研究、障害、スコープの変化、次の手順
- **Continuity:** 幻覚が起きやすい箇所や不足している文脈

悪い使い方:

- 次のキャラクター返信の中に必ず出す必要があるもの
- 「物語を良くして」のような曖昧なプロンプト
- 毎回エッセイを出力する巨大な分析プロンプト
- 別の役割がない、memory 要約の重複

Side Prompt は魔法ではありません。曖昧な Side Prompt は、整理された曖昧さになるだけです。

---

## 簡単セットアップ手順

クリックごとの手順が必要な場合は、[Side Prompt を有効にするための Scribe walkthrough](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ) を使ってください。

短い手順は次のとおりです。**Extensions** を開き、**Memory Books** を開き、**Side Prompts** をクリックし、使いたいプロンプトを選んで有効化します。必要なら **Run automatically after memory** をオンにして、最後に **Save** と **Close** を押します。

---

## 実行の仕組み

通常の Side Prompt 実行は、基本的に次の流れです。

1. STMB が確認するメッセージを選びます。
2. Side Prompt が準備されます。
3. 必要なマクロが埋められます。
4. モデルが Side Prompt の出力を生成します。
5. STMB が出力を確認します。
6. Side Prompt の設定に従って、結果がプレビュー、保存、更新、またはスキップされます。

手動 Side Prompt、memory 作成後の Side Prompt、Side Prompt Set の各行は、同じシステムとして感じられるべきものです。プレビュー、バッチ処理、空レスポンスの確認、保存、停止処理、通知について、同じ一般的な実行動作を共有します。

---

## 手動実行

1 つの Side Prompt を手動で実行するには、`/sideprompt` を使います。

基本形:

```txt
/sideprompt "Prompt Name"
```

メッセージ範囲付き:

```txt
/sideprompt "Prompt Name" 10-20
```

runtime macro 付き:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

スペースを含むプロンプト名は引用符で囲んでください。

手動実行は、単発チェック、対象を絞った更新、カスタムのマクロ値が必要なプロンプトに向いています。

---

## memory 作成後の自動実行

一部の Side Prompt は、memory が作成された後に自動実行できます。

これは、チャットの進行に合わせて tracker を最新状態に保ちたい場合に便利です。たとえば、関係性 tracker やプロット tracker は memory 作成後に更新できます。

memory 作成後の動作には 2 つのモードがあります。

- **個別に有効化された Side Prompt を使う** — 旧動作です。**Run automatically after memory** が有効な Side Prompt が実行されます。
- **名前付き Side Prompt Set を使う** — 選択された set が代わりに実行されます。

Side Prompt Set が選択されている場合、個別に有効化された memory 作成後の Side Prompt は置き換えられます。追加ではありません。これにより、ユーザーが古いチェックボックスを忘れたままにして起きる重複実行を防ぎます。

---

## Side Prompt Sets

Side Prompt Set は、複数の Side Prompt を 1 つの順序付きワークフローにまとめます。

set は単なるフォルダーではなく、順序付きの実行リストです。同じ Side Prompt を、異なるマクロ値で複数回入れることもできます。

set の例:

1. `{{npc name}} = Alice` を指定した Relationship Tracker
2. `{{npc name}} = Bob` を指定した Relationship Tracker
3. Plot Points Tracker
4. Scene Cleanup Notes

これにより、1 つのプロンプトテンプレートで、NPC、勢力、場所、プロジェクトごとに別々のエントリーを管理できます。

### Set の管理

set の作成、編集、複製、削除、並べ替えは **🎡 Trackers & Side Prompts** から行います。

各行には次のものを含められます。

- Side Prompt
- 任意の行ラベル
- 保存済みマクロ値
- 複製／削除コントロール
- 上へ／下へ移動するコントロール

行は上から下へ実行されます。土台になる tracker を先に置き、整理やレポート用のプロンプトを後ろに置いてください。

### Set を手動実行する

保存済みの値で set を実行します。

```txt
/sideprompt-set "Set Name"
```

範囲付き:

```txt
/sideprompt-set "Set Name" 10-20
```

マクロ値を指定して再利用可能な set を実行します。

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

set に、まだ値が必要な再利用用トークンがある場合は `/sideprompt-macroset` を使います。

### Set や行が見つからない場合

Side Prompt Set は意図的に厳密です。

- set が選択されていない場合は、個別に有効化された memory 作成後の動作が使われます。
- set が選択されている場合、個別に有効化された memory 作成後の Side Prompt は無視されます。
- 選択された set が削除されていた場合、何も実行されず、STMB が警告します。
- 行が削除済みプロンプトを指している場合、その行はスキップされ、STMB が警告します。
- 行にまだ必要なマクロ値がある場合、その行はスキップされ、STMB が警告します。

黙ってフォールバックするより、そのほうが安全です。選択済みワークフローが壊れているなら、ユーザーはそれを知るべきです。

---

## マクロ

Side Prompt では、`{{user}}` や `{{char}}` など、通常の SillyTavern マクロを使えます。

また、runtime macro も使えます。これは Side Prompt 実行時に埋められるプレースホルダーです。

runtime macro の例:

```txt
{{npc name}}
```

手動実行:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

保存済み set 値:

```txt
{{npc name}} = Alice
```

再利用可能な set レベル値:

```txt
{{npc name}} = {{npc_1}}
```

その後、次のように実行します。

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### マクロのコツ

退屈な名前を使ってください。

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

次のような名前は避けてください。

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

スペース入りの名前は UI では読みやすいです。スラッシュコマンドでは、たいていアンダースコアのほうが面倒が少なくなります。

カスタム runtime macro を使う Side Prompt は、必要な値がどこかに保存されていない限り、個別に自動化しないでください。たとえば、Side Prompt Set の行に保存しておく必要があります。自動実行は、`{{npc name}}` が誰を指すのかを途中で質問できません。

---

## メッセージ範囲

Side Prompt は、特定のメッセージ範囲に対して実行できます。

```txt
/sideprompt "Plot Points" 50-80
```

範囲を指定した場合、STMB はその範囲を使います。

範囲を指定しなかった場合、STMB は既存の上限／checkpoint ロジックを使い、通常の「前回の Side Prompt 以降」の動作を使います。

日常的な追跡では、「前回以降」の動作のほうが簡単です。デバッグや対象を絞った整理には、明示的な範囲のほうが明確です。

Side Prompt の範囲コンパイルは、memory と同じ隠しメッセージ設定に従うべきです。これには、memory 作成前に hidden message を表示するグローバル設定も含まれます。

---

## 良い Side Prompt の書き方

良い Side Prompt には仕事があります。悪い Side Prompt には雰囲気しかありません。

次の点を明確にしてください。

- 何を確認するべきか
- 何を更新するべきか
- 何を無視するべきか
- どの形式で出力するべきか
- 出力の長さ
- 置き換え、修正、追記のどれをするべきか

### 出力は意図的に短くする

tracker は、そう指示しない限り肥大化します。

弱い例:

```txt
Update the relationship tracker.
```

より良い例:

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

役に立つ制約:

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### 安定した見出しを使う

安定した見出しを使うと、繰り返し更新がきれいになります。

良い例:

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

悪い例:

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### 何でも求めない

あらゆる詳細を求める Side Prompt は、たいていあらゆる詳細を出力します。

重要なものを選んでください。プロット tracker に必要なのは通常、未解決のフック、何が変わったか、誰が知っているか、何を後で回収する必要があるかです。シーン内のすべての表情は必要ありません。

### マクロの用途を明確にする

良い名前:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

あまり役に立たない名前:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

なぜ値を求めているのかを理解するために、ユーザーがプロンプト本文を開く必要があってはいけません。

---

## 例

### Plot Points Tracker

チャットに複数の進行中ストーリーラインがあるときに使います。

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

推奨形式:

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

### マクロ付き Relationship Tracker

プロンプトは次を要求します。

```txt
{{npc name}}
```

手動実行:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

set の行:

| 行 | Side Prompt | 保存済みマクロ |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

これにより、NPC ごとに別々のプロンプト定義を作らずに済みます。

### 発明またはプロジェクト Tracker

ユーザーが時間をかけて何かを発明、研究、制作、変更しているときに使います。

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

これは通常、「そのプロジェクトが存在する」とだけ言う memory エントリーを 10 個保存するよりきれいです。

### 再利用可能な Cast Pass

set レベルの runtime token を使って set を作成します。

```txt
{{npc_1}}
{{npc_2}}
```

実行します。

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

後で再利用します。

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

同じ set。違うキャスト。💡

---

## トラブルシューティング

### Side Prompt が memory 作成後に実行されませんでした。

確認してください。

- memory は実際に実行されましたか？
- Side Prompt は memory 作成後の実行に対して有効ですか？
- チャットは **Use individually-enabled side prompts** を使っていますか？
- チャットは代わりに Side Prompt Set を使っていますか？
- プロンプトに、指定されていないマクロ値が必要ですか？
- プロンプトが削除、名前変更、または移動されていませんか？

チャットが Side Prompt Set を使っている場合、そのチャットでは個別に有効化された memory 作成後チェックボックスは無視されます。

### Side Prompt Set が実行されませんでした。

確認してください。

- このチャットに set が選択されていますか？
- set はまだ存在しますか？
- すべての行が存在する Side Prompt を指していますか？
- すべての必須マクロに、保存済みまたは指定済みの値がありますか？

自動実行は不足している値を質問できません。マクロ値を set に保存するか、`/sideprompt-macroset` で手動実行してください。

### 1 行だけスキップされました。

可能性の高い原因:

- 参照先の Side Prompt が削除された
- 参照先の Side Prompt の名前が変更された
- 行に未解決のマクロがある
- モデルが空または無効なレスポンスを返した

STMB は、すべて正常だったふりをするのではなく、警告するべきです。

### 出力が長すぎます。

厳しい上限を追加してください。

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

モデルは、tracker が無駄に大きくなったタイミングを自然には把握しません。明確に指示してください。

### 2 回実行されました。

確認してください。

- 手動実行と自動実行の両方が起きていないか
- set 内に重複行がないか
- 同じ Side Prompt のコピーが複数ないか
- 複数のチャットやタブが近いタイミングで作業を開始していないか

選択された Side Prompt Set は、個別に有効化された memory 作成後プロンプトを置き換えるべきです。これにより、よくある重複実行の問題を 1 つ防げます。

### 間違ったメッセージが分析されました。

明示的な範囲を使ってください。

```txt
/sideprompt "Plot Points" 50-80
```

「前回以降」の動作は便利です。デバッグには明示的な範囲のほうが向いています。

### tracker が古い情報を残し続けます。

古い情報を削除するよう Side Prompt に指示してください。

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

tracker は偶然きれいに保たれるものではありません。

---

## 要点

### ユーザー向け

長いチャットを構造化して維持したいときは、Side Prompt を使ってください。

手動実行は単発分析に向いています。memory 作成後の実行や Side Prompt Set は、最新状態を保ちたい tracker に向いています。

### Botmaker 向け

Side Prompt は、ロールプレイの文章ではなくメンテナンスツールとして作ってください。

安定した見出し、厳密な出力ルール、明確な更新動作を使います。1 つのプロンプトを複数の NPC、勢力、場所、プロジェクトに使いたい場合は、マクロを使ってください。

### 管理者向け

Side Prompt は生成作業を増やします。

つまり、予測可能で、確認可能で、良い意味で退屈であるべきです。Set は、古いチェックボックスの山に任せるのではなく、意図されたワークフローを明示できるので便利です。
