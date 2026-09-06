# UX3-0 Pilot Participant Record

> この記録には、実測値・参加者発言・ファシリテーターによる事後推定が混在する。
>
> * `NR` = not recorded / 記録なし
> * `推定` = セッションメモから合理的に推定した値。厳密な実測ではない
> * 時間については、Task 1〜6に記録された `5 / 5 / 3 / 5 / 3 / 10` を、内容とテスト実態から「分」の概算値だったものとして暫定的に扱う。要確認。

---

## 参加者プロフィール

* 参加者ID: `P_1_1`
* 実施日時: `NR`
* 同意: `yes`
* 記録方法: `notes`
* 背景: `A 自転車競技に詳しい`
* AJOCCについての知識: `uses it`
* レース・ラップ分析の経験: `low`
* このプロダクトの利用経験: `seen once`
* ファシリテーター: `NR`

### Pilot上の注意

この参加者は `seen once` のため、完全な初見参加者ではない。

Pilot protocolの校正には利用できるが、完全なfirst-use discoverabilityの証拠としては弱い。

本番テストでは可能な限り `never used` の参加者を優先する。

---

## テスト環境

* URL: https://ajocc-laptime-viewer.vercel.app/
* デバイス: デスクトップPC
* OS: Windows 11
* ブラウザ / バージョン: Chrome / version `NR`
* ビューポートまたは画面サイズ: 27インチモニター
* 正確なviewport resolution: `NR`
* 画面の向き: `横`
* 入力方法: `mouse + keyboard`
* ネットワークに関するメモ: `NR`
* 対象レース / カテゴリー: `NR`
* 対象選手 / 代替選手: `NR`
* データ問題または代替レースを使用したか: `NR`

---

## Pilot所要時間

### Task別記録

Task 1〜6に記録された値:

* Task 1: 約5
* Task 2: 約5
* Task 3: 約3
* Task 4: 約5
* Task 5: 約3
* Task 6: 約10

これらは内容上、**分単位の概算値だった可能性が高い（推定）**。

その場合:

* Task 1〜6合計: 約31分
* Task 0: `NR`
* 導入説明: `NR`
* Post-test interview: `NR`

したがって、

**Pilot actual duration: 少なくとも約31分 + Task 0 / 導入 / interview時間**

と推定される。

正確な開始・終了時刻がないため、総時間の厳密値は `NR`。

### Duration interpretation

目標の10〜15分に対して、Task値が分単位で正しければPilotは明らかに長い。

ただし時間超過の原因が、

* Product UX friction
* Think Aloud
* Task protocol
* Interview
* Recording overhead

のどれによるものかは、現在の記録だけでは完全には分離できない。

---

# テスト開始前の観察

* 最初に視線が向いた場所:

  * リザルトの表
  * グラフ
  * トップ差

* 参加者がこのサイトを何のためのものだと考えたか:

  > レース結果をグラフにしてほかの選手との比較ができる。注目選手のグラフ詳細が知れる。

* 最初に行おうとした操作:

  > 大会選択 → 選手選択 → グラフ切り替え

* 最初に感じた混乱または自信:

  > 大会選択は直感的に選択できた。グラフ画面はどうやって使うかよくわからなかった。ほかの選手と比較するところがわからなかった。

* 発言の原文: 上記メモを原文相当として扱う。

---

# タスク結果

> Completionについては、記録内容から目的達成している可能性が高いTaskは暫定的に `success（推定）` とした。
>
> moderator interventionが記録されていないため、正式なsuccess判定は要確認。

| タスク           | 目的達成          |           時間 | 最初のクリック | ためらい   | 誤操作・進行 | 大きな逆方向スクロール | Moderator | 容易さ | 自信 | 主な観察内容 / 発言                                                                                                                                                                           |
| ---------------- | ----------------- | -------------: | -------------- | ---------- | ------------ | ---------------------- | --------- | -----: | ---: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 第一印象       | `partial`         |           `NR` | `n/a`          | あり       | n/a          | n/a                    | `NR`      |      2 |    3 | 全体的に余白の無駄づかいが多い。表も選手の列が異様に横長いし、グラフが画面の1/4ぐらいしかない。はっきりとしたここがダメというより、パーツごとの中身はまだいいけど配置とか見せ方とかがいまいち |
| 1 レース結果     | `success（推定）` |  約5分（推定） | `NR`           | あり       | なし         | あり                   | `NR`      |      2 |    3 | 場所がわかりづらいし、空白が多くて誰がどのタイムか見にくかった                                                                                                                                |
| 2 選手分析       | `success（推定）` |  約5分（推定） | `NR`           | あまりなし | あまりなし   | あまりなし             | `NR`      |      3 |    3 | 選手の分析はどうなっているかわかるが、いろんな場所に散らばっているのが見にくかった                                                                                                            |
| 3 比較           | `success（推定）` |  約3分（推定） | `NR`           | あまりなし | 特になし     | なし                   | `NR`      |      4 |    3 | 何となく比較しているんだなとわかるが、あまり比較している感がないように感じた                                                                                                                  |
| 4 変化の調査     | `success（推定）` |  約5分（推定） | `NR`           | あまりなし | あまりなし   | なし                   | `NR`      |      4 |    3 | ほかの選手の線がこうだからこうだとわかる、という関係がわかりづらい                                                                                                                            |
| 5 選手の切り替え | `success（推定）` |  約3分（推定） | `NR`           | あまりなし | 特になし     | 特になし               | `NR`      |      4 |    3 | 選手を変えるところはわかるが、どこにあるか最初探した                                                                                                                                          |
| 6 自由探索       | `n/a`             | 約10分（推定） | `n/a`          | あり       | あり         | あり                   | `NR`      |      2 |    2 | どこが押せて、押したらどうなるか全く想像がつかず、押してから初めて「そうなるのね」と分かる。どうやって見たらいいか、どうやって使えばいいかわからなかった                                      |

---

# フリクションイベント

現在の記録から明確に読み取れるものだけを整理する。

|    # | タスク | 参加者の操作 / 発生イベント                    | 発言・証拠                                                                   | 推定フリクション種別               | 初期重要度 |
| ---: | ------ | ---------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- | ---------- |
|    1 | 0      | UI全体を見た際、情報配置・余白に違和感         | 「余白の無駄づかいが多い」「配置とか見せ方とかがいまいち」                   | layout / visual hierarchy          | P2候補     |
|    2 | 0 / 3  | 選手比較の場所・意味を理解しづらい             | 「ほかの選手と比較するところがわからなかった」「あまり比較している感がない」 | discoverability / label / analysis | P2候補     |
|    3 | 1      | 結果確認時に空白・横方向の長さが視認性を下げる | 「誰がどのタイムか見にくかった」                                             | layout / information density       | P2候補     |
|    4 | 2      | 分析情報が複数箇所に散らばって感じられる       | 「いろんな場所に散らばっているのが見にくかった」                             | context / fragmentation            | P2候補     |
|    5 | 5      | Rider変更UIを最初に探索                        | 「どこにあるか最初探すのがあった」                                           | discoverability                    | P2候補     |
|    6 | 6      | 操作可能箇所・結果の予測が困難                 | 「どこが押せて、押したらどうなるか全く想像がつかず」                         | affordance / predictability        | P1〜P2候補 |
|    7 | post   | スクロール可能範囲と内容量が一致せず往復が負担 | 「上行ったり下行ったりが大変」                                               | scroll / spatial efficiency        | P2候補     |
|    8 | post   | 小さい文字・button等の小さな問題が蓄積         | 「小さな不便が積み重なって使いづらい」                                       | micro-friction / readability       | P2候補     |

> これらはすべてPilot participant 1名からのsignalであり、正式severityではない。本番参加者で再確認する。

---

# 重要場面ログ

## Critical Moment 1

* タスク: 第一印象

* 参加者の操作: 初期画面を確認

* 発言:

  > パーツごとの中身はまだいいけど配置とか見せ方とかがいまいち

* 期待される行動:
  primary informationを自然に認識できること

* 実際の行動:
  contentそのものより先にspacing/layoutへ違和感

* 推定原因:
  spatial efficiency / visual hierarchy

* 重要度:
  `P2 candidate`

* フォローアップ:
  本番参加者にも同様の第一印象が自然発生するか確認

---

## Critical Moment 2

* タスク: 比較

* 発言:

  > 何となく比較しているんだなとわかるが、あまり比較している感がない

* 期待される行動:
  比較対象とchart上の関係を理解する

* 実際の行動:
  比較機能の存在は認識するが、比較結果の意味が弱い

* 推定原因:
  comparison state / visual encoding / context

* 重要度:
  `P2 candidate`

---

## Critical Moment 3

* タスク: 自由探索

* 発言:

  > どこが押せて、押したらどうなるか全く想像がつかず、押してから初めてそうなるのねとなる

* 期待される行動:
  UI controlの役割・結果を事前にある程度予測できる

* 実際の行動:
  trial-and-errorで理解

* 推定原因:
  affordance / information scent / interaction predictability

* 重要度:
  `P1〜P2 candidate`

---

# 機能の発見状況

| 画面要素 / 目的                              | 状態                              | 最初に気づいたタスク | 到達方法       | 意味を理解したか | 発言 / 根拠                                                                    |
| -------------------------------------------- | --------------------------------- | -------------------- | -------------- | ---------------- | ------------------------------------------------------------------------------ |
| 現在の大会・カテゴリー・選手・比較対象の文脈 | `found`                           | 0〜2                 | 通常flow       | partial          | 「これがどんなグラフ化やどんな表示方法なのかをまず理解しないと使いづらかった」 |
| 選手の変更                                   | `found after search`              | 5                    | UIを探索       | yes              | 「どこにあるか最初探す」                                                       |
| 指標の切り替え                               | `found`                           | 2〜4                 | chart controls | yes              | 「グラフ切り替えは直感的にできる」                                             |
| 周囲の選手との比較                           | `found after search`              | 3                    | 比較UIを探索   | partial          | 「あまり比較している感がない」                                                 |
| ラップの詳細値                               | `found / meaning partial（推定）` | 4                    | analysis UI    | partial          | 「選択中の周回あたりの操作がわからない」                                       |
| カテゴリー全体の結果                         | `found`                           | 0〜1                 | Results        | partial          | 「空白が多くて誰がどのタイムか見にくかった」                                   |
| 自由探索で発見したその他の情報               | `NR`                              | 6                    | NR             | NR               | NR                                                                             |

---

# テスト後評価

## 総合評価

* 全体的な使いやすさ（1–5）: `NR`

  * 個別5項目の平均値は2.6だが、これを総合評価値として勝手に3へ丸めない。
* 今後、助けなしで使えそうか: `maybe（推定）`
* 「なんとなく使いづらい」と感じた場面: `yes`

根拠:

> 小さな不便が積み重なって使いづらい

> パッと見いまいちが勝つ

---

| 評価項目                       | スコア | 理由 / 発言                                                                                                          |
| ------------------------------ | -----: | -------------------------------------------------------------------------------------------------------------------- |
| 覚えやすい                     |      2 | 直感的な操作、反応ではないので、これを見るにはどうやるんだっけとなると思う                                           |
| 画面内を移動しやすい           |      3 | スクロール場所によって全然下に行けないとか上に戻れないがあるし、細かいところがスクロールで隠れたりして悪い           |
| 比較しやすい                   |      3 | なんとなく比較できているが、±nが灰色で選手比較は色付きなのは、色付きがわかりやすかった                               |
| 現在の状況・文脈を理解しやすい |      3 | これがどんなグラフ化やどんな表示方法なのかをまず理解しないと使いづらかった                                           |
| 快適に使える                   |      2 | 文字が小さかったり、ボタンが小さかったり、大きな不便というより、小さな不便が積み重なって使いづらいなというほうが強い |

---

# インタビューメモ

1. 一番分かりやすかったところ:

   * 大会選択場面

2. 一番分かりにくかったところ:

   * 選手比較する所がどこにあるか

3. 何度も戻ったり探したりしたところ:

   * スクロールできる範囲が表示内容と比較して無駄に大きく、上へ行ったり下へ行ったりするのが大変

4. もっと目立ってほしかったもの:

   * 選手選択
   * グラフ
   * グラフの選択中の内容

5. 画面を取りすぎていると感じたもの:

   * 今表示中の内容
   * 選手切り替え
   * ラップサマリー
   * 比較対象
   * 選択中の周回情報
   * 横に長すぎる表

6. グラフを見る・条件を変える操作について:

   * グラフ切り替えは直感的
   * 選択中の周回付近の操作は分かりにくい

7. もう一度使う場合:

   * 自分と気になった選手のラップと順位のグラフ程度は利用しそう
   * 初見でよく分からなかった機能を次回以降使う可能性は低そう

8. 1つだけ直すなら:

   * 各パーツの配置
   * 無駄のある見せ方

9. その他:

   > パッと見いまいちが勝つ

---

# Pilot-only UX Signals

> 以下はPilot participant 1名のみのsignal。
>
> 正式findingへの昇格禁止。本番3〜5人で再現確認する。

| Signal                           | Evidence                                         | Candidate severity | Main-test confirmation |
| -------------------------------- | ------------------------------------------------ | ------------------ | ---------------------- |
| Spatial efficiency / layout      | 「余白の無駄づかい」「配置とか見せ方がいまいち」 | P2                 | REQUIRED               |
| Chart prominence不足             | 「グラフが画面の1/4ぐらいしかない」              | P2                 | REQUIRED               |
| Comparison discoverability       | 「選手比較する所がどこにあるか」                 | P2                 | REQUIRED               |
| Comparison feedback不足          | 「あまり比較している感がない」                   | P2                 | REQUIRED               |
| Rider change discoverability     | 「どこにあるか最初探す」                         | P2                 | REQUIRED               |
| Interaction predictability不足   | 「押したらどうなるか想像がつかない」             | P1/P2              | REQUIRED               |
| Analysis controlsのfragmentation | 「いろんな場所に散らばっている」                 | P2                 | REQUIRED               |
| Scroll / spatial friction        | 「上行ったり下行ったりが大変」                   | P2                 | REQUIRED               |
| Accumulated micro-friction       | 小さい文字・button等                             | P2                 | REQUIRED               |
| First-impression visual quality  | 「パッと見いまいちが勝つ」                       | P2                 | REQUIRED               |

The 10 detailed rows above are retained as raw/qualitative evidence only, not formal findings. Final review clusters them into the seven required confirmation categories: layout/spatial efficiency, chart prominence, comparison discoverability, rider switching discoverability, interaction predictability, fragmentation, and accumulated micro-friction.

---

# Hesitation Definition Recommendation

今回のPilotでは「あり / あまりなし」という定性記録が中心だった。

本番では単純な「3秒以上停止」だけでfriction扱いしない。

## Interaction hesitation

以下を満たすもの:

* 約3秒以上操作が止まる
* かつ、以下のいずれかがある

  * controlを探索
  * cursorが複数候補間を移動
  * 上下scrollして探す
  * 「どこ」「分からない」等の迷い発話

これはfrictionとして記録する。

## Reading / Analysis Pause

* chart
* Results
* Lap Detail

などを読んだり考えたりする自然な停止。

これは原則hesitation countへ含めない。

---

# 記録負荷に関するPilot所見

現在のtemplateには、

* Task table
* Friction event
* Critical moment
* Feature discovery
* Post-test evaluation

が存在する。

今回、

* Friction event
* Critical moment
* Feature discovery

に未記入が多く残った。

したがって、

**Recording burden = HIGH candidate**

と評価する。

ただし、記録者が意図的に後入力を省略した可能性もあるため確定ではない。

本番ではリアルタイム記録を以下に絞ることを推奨:

### During session

* Task completion
* Task start/endまたは概算時間
* major hesitation
* moderator intervention
* notable quote

### Immediately after

* wrong turn
* discoverability
* severity candidate
* suspected cause
* facilitator finding

---

# 既存バックログ項目

今回のPilotだけでは以下は評価不能。

| バックログ項目                            | 観察                       |
| ----------------------------------------- | -------------------------- |
| 実機・対象デバイスでのresponsive evidence | NOT OBSERVED — Desktopのみ |
| 大規模categoryでのResults rider discovery | NOT EVALUABLE              |
| 狭い画面でのchart tooltip / legend        | NOT OBSERVED               |
| broader assistive technology verification | NOT OBSERVED               |
| pointer→focus handoff                     | NOT OBSERVED               |

---

# ファシリテーター所見

## 最も強いポジティブな兆候

* 大会選択は直感的だった
* metric / graph切替自体は比較的理解しやすかった
* Rider分析そのものの目的はある程度理解された

## 最も強いネガティブな兆候

* 個々の機能よりも、全体の配置・空間効率・情報の散らばりに対する不満が強かった
* どこが操作可能で、操作すると何が起きるかの予測が弱かった
* comparisonのdiscoverability / visual feedbackが弱かった
* 小さなUI摩擦が積み重なり、全体として「なんとなく使いづらい」という印象につながった

## 最も重要度が高い問題候補

1. Interaction predictability / affordance
2. Layout / spatial efficiency
3. Comparison discoverability / feedback
4. Analysis controls fragmentation
5. Accumulated micro-friction

## 原因分類

現時点では主に:

`Product UX candidate`

と考えられる。

データ問題・技術障害が原因だった証拠はない。

ただしPilot 1名のみのため正式判断は禁止。

## 次の参加者へのフォローアップ

誘導せず、以下が自然に再発するか観察する。

* first impressionでlayout/spacingへ違和感が出るか
* comparisonを自然に発見できるか
* rider変更を探すか
* chartを十分大きく感じるか
* 操作結果を事前に予測できるか
* 上下移動を負担に感じるか
* 「小さな不便の積み重ね」という感想が再発するか

## 過度に解釈しないこと

* Pilot participantは完全初見ではない
* 1名のみ
* cycling knowledgeable
* Desktopのみ
* exact viewport不明
* task durationは推定
* moderator intervention level未記録
* exact first-click未記録

---

# プライバシー / データの取り扱い

* メモを匿名化したか: `yes（Participant IDのみを使用）`
* 記録データの保持期限: `NR`
* 削除 / アクセスに関するメモ: `NR`
* 発言の公開許可: `NR`

---

# Pilot Record Quality

## 十分記録されているもの

* participant background
* environmentの大枠
* first impression
* Taskごとのqualitative observation
* Ease / Confidence
* post-test評価
* UX frictionの具体的発言

## 不足しているもの

* exact start / end time
* exact viewport
* exact Task completion判定
* first click
* moderator intervention
* timestamp
* exact friction count
* facilitator identity
* target race/category/rider
* privacy retention / quote permission

これらは推測で埋めない。

---

# Pilot Record Overall Status

**Usability evidence: usable with limitations**

**Timing evidence: approximate only**

**Moderator evidence: insufficient**

**First-use evidence: limited because participant had seen the product once**

**Pilot protocol calibration evidence: sufficient to identify recording burden and measurement issues**
