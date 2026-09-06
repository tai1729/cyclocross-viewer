# Feedback Intake Specification

Status: DECISION COMPLETE — READY FOR UX3-1C; NO PRODUCT IMPLEMENTATION IN THIS PHASE
Human Field Test: NOT YET EXECUTED

## 1. Purpose

正式公開後に、実ユーザーが短時間で「使いにくい」「分かりにくい」「表示・データの問題」「欲しい機能」を匿名で送れる入口を用意する。Production Feedbackは構造化されたHuman Field Testの代替ではなく、実利用環境から継続的にsignalを集める補助線である。

このspecだけではfeedback UI、backend、依存関係、analyticsを実装しない。providerとprivacy設定を確定した後、別の実装・reviewを行う。

## 2. Recommended entry point

推奨labelは `ご意見・不具合を送る` とする。entry pointはcompact persistent entry pointとして維持するが、desktopとmobileで表示方式を分ける。

### Desktop (`min-width: 1024px`)

- `app/layout.tsx`のsite-level entryとしてviewport右下にcompact buttonをfixed配置する。
- 基準位置は`bottom: 16px; right: 16px`。safe-areaがある場合はbottom insetを加える。
- main shellにbutton分のbottom clearanceを確保し、chart、RaceHeader、Results、Lap Detail、keyboard focus targetに重ねない。
- `position: sticky`ではなくfixed。chart内部、既存sticky header、tableのscroll regionには置かない。
- click後はchart上のdialogではなく専用`/feedback` routeへ移動する。

### Mobile (`< 1024px`)

- fixed floating buttonは表示しない。
- `app/layout.tsx`のglobal footer utility rowにnon-sticky link/buttonを置く。
- footerはsafe-area bottom paddingを持ち、rider picker bottom sheet、browser bottom controls、chart、Resultsへoverlayしない。
- feedback formは専用`/feedback` routeで表示し、既存native dialog / bottom sheetと同時に開かない。
- race pageから遷移する場合、allow-listed contextだけを一時的なsession snapshotで渡す。送信後または離脱時にclearし、user identityとして再利用しない。

Direct `/feedback` visitではcontextが空でも送信可能とする。

entry click、category選択、form送信で通常2〜3 interaction程度を維持する。Feedbackはsecondary actionであり、Results、rider選択、comparison、chart閲覧を遮らない。

## 3. Form fields

### Required

1. `どんな内容ですか？`
   - 使いにくい
   - 分かりにくい
   - 表示がおかしい
   - データがおかしい
   - 欲しい機能
   - その他
2. `内容を教えてください。`
   - non-empty free text
   - 長いsurvey回答を求めない
   - 可能なら「何をしようとして、何が起きたか」を短く案内する

### Optional

- `返信が必要な場合の連絡先（任意）` — MVPではemailのみ

現在のページ、device、race、category、rider、metric、comparison、viewport、browser、versionはuserに再入力させず、許可したcontextを送信時に自動付与する。screenshot / attachmentはMVPのform fieldに含めない。

Emailは連絡が必要な場合だけ任意入力とする。匿名送信にemailを要求しない。

## 4. Auto-captured context

入力負荷を増やさず再現性を高めるため、送信時に次のapplication contextを自動付与する。ユーザーが意図せず別情報を送らないよう、許可した項目だけを構造化して保存する。

### Capture

- `route`: `home` / `race` / `feedback`
- `meetId`、`raceId`、`categoryId`: app内identifierのみ
- `riderId`: selected rider IDのみ。nameは送信しない
- `fixedRiderIds`: pinned comparison時のみ、最大4件
- `metric`: `rank` / `gap` / `pace` / `lap`
- `comparisonMode`: `0`〜`5` / `pinned` / `all`
- `lap`: selected positive integerのみ
- `season`、`series`: home / return contextのbounded valueのみ
- viewport width / height
- normalized browser familyのみ。raw user-agentは送信しない
- application version / short commit label

`current URL`は保存しない。`route`とallow-listed stateへ変換し、unknown query、fragment、arbitrary parameterを捨てる。versionは実装時に明示的なbuild metadataとして渡し、秘密情報や環境変数を露出させない。

### Do not capture

- login account、user ID、cookie、local storageの内容
- application payloadへのIP address、正確な位置情報、連絡先を自動推定した情報
- full referrer
- full browser fingerprint
- rider name、raw user-agent、full URL、unknown query
- keystroke、cursor path、閲覧履歴、analytics ID、persistent anonymous ID
- feedback送信以外のbackground tracking

自動contextは「誰が見ていたか」ではなく「どの画面のどの状態で起きたか」を知るためだけに使う。すべてclient由来のdebugging hintであり、data correctnessやsecurityのtrusted inputにはしない。

## 5. Anonymous behavior

- emailなしで送信可能とする。
- login、cookie、永続的な匿名識別子、cross-session tracking IDはfeedback送信のために新設しない。
- 内部では重複管理用にfeedback record IDを発行するが、利用者IDではない。
- anonymous recordには返信できないことを送信前または送信後に短く表示する。
- emailを入力した場合は、contact目的に限って保存し、triage担当者だけが扱う。
- form instanceごとの一時`Idempotency-Key`はdouble-submit抑止用に使えるが、cross-session identityとして保存・再利用しない。

## 6. Screenshot decision

MVPではscreenshot uploadを採用しない。これは最終決定である。

理由は、privacy（個人名・通知・別タブの情報の混入）、storage、retention、redaction、mobile uploadの実装負荷である。URL、race、category、metric、viewport、自由記述だけで、多くの再現条件を先に取得できる。

将来採用する場合は、opt-in、画像サイズ制限、content type検査、保存先、retention、削除手段、個人情報注意書きを別specで定義してから行う。

## 7. Storage options and recommendation

| Option | Strength | Risk / cost | Decision |
| --- | --- | --- | --- |
| Basin Starter behind an application-owned endpoint | anonymous form、structured export、basic spam、server-side validationを組み合わせられる | Basinのprovider retention / Canada運用 / plan制約を確認する必要 | **Selected MVP approach** |
| Managed form service direct from browser | anonymous form、短期導入 | client validation迂回、provider coupling、context allowlistの境界が弱い | Not selected |
| Dedicated backend / database | structured triage、occurrence count、権限管理を設計しやすい | backend、security、retention、運用を追加する | volume増加後の候補 |
| Email | 最小導入 | 構造化、duplicate count、権限、検索性が弱い | fallback only |
| Direct GitHub Issues | internal engineeringとの連携 | 一般ユーザーへaccountや公開投稿を要求し、privacyも弱い | Do not expose directly |
| Analytics / event system | 既存event基盤があれば集計しやすい | free text、匿名feedback、retention、privacyの境界が曖昧になり、background trackingへ拡張しやすい | Do not use as primary destination |

選択は、Basin Starterをraw submissionのprovider / storageとし、application-owned Next.js endpointをvalidationとadapter boundaryにする方式である。MVPではBasin REST API tokenを使わず、server-sideからform endpointへ送信する。ユーザーへGitHub Issuesを要求しない。

現行のBasin資料ではFree planにdata exportがないため、Freeは採用しない。Starterのform retentionを90日に設定する。Basinが利用不能になった場合は、`feedback-provider-decision.md`のprovider adapter boundaryを通じて別managed form serviceまたはdedicated databaseへ移行する。

## 8. Internal triage model

受信後に次の項目を付けられること。

### Type

- `BUG`
- `DATA`
- `UX`
- `FEATURE`
- `ACCESSIBILITY`
- `OTHER`

### Severity

- `P0`: correctness、security、または主要利用を広範囲に阻害する緊急問題。
- `P1`: 主要taskの失敗、重大な誤解、またはaccessibility上の重大な利用阻害。
- `P2`: 再現するUX friction、表示問題、または複数報告で優先すべき改善。
- `P3`: polish、軽微な違和感、単独の未検証feature希望。

Severityは受信時のcategoryとは分けて、後から担当者が付与する。

推奨record fields:

- internal feedback ID
- received timestamp
- original category / free text
- sanitized context
- contact supplied: yes / no
- triage type
- severity
- status: NEW / REVIEWED / DUPLICATE / RESOLVED / WONT_FIX
- issue cluster key
- occurrence count
- decision note

## 9. Duplicate signals and gates

exact textの一致だけでなく、category、対象画面、同じ操作・目的、同じ失敗結果を見てissue clusterへまとめる。匿名投稿のため、occurrence countは「報告件数」であり、ユニークユーザー数とは断定しない。

例: `comparison is hard to find — 7 reports` のように、同じclusterの報告数を保持する。

1件のfeedbackだけで、通常のUX変更を即決しない。次を優先する。

1. correctness / data issue
2. security / privacy
3. accessibility
4. major task failureまたはsevere misunderstanding
5. 同じ内容の複数報告
6. そのほかのUX、feature、polish

繰り返し数は重要なsupporting evidenceだが、P0/P1やcorrectness/accessibilityは1件でも即時確認対象とする。feedbackを正式findingへ昇格する際は、Human Field Test、reproduction、source reviewのいずれかを別途記録する。

MVPのduplicate submit対策は、sending中のbutton disable、client automatic retryなし、per-submit一時nonce、provider spam filter、internal clusteringとする。strict idempotencyやcross-session dedup storeは導入しない。manual retryは許可するため、同一内容の重複が完全にゼロになることは保証しない。

## 10. Review cadence

- 公開後最初の2週間: 2〜3日ごとに確認。P0/P1は受信通知または検知時に即時確認。
- stable period: 少なくとも週1回。
- 各reviewで新規、duplicate、occurrence count、severity、対応判断を更新する。
- 大きなUX変更の前に、関連するfeedback clusterとHuman evidenceの有無を確認する。

自動化は今回の設計範囲外である。

## 11. Privacy proposal

### Collect

必須category、free text、送信時の許可済みapplication context、任意のcontact email。

### Do not collect

アカウント、login情報、tracking ID、IP・位置情報、不要なreferrer、keystroke、閲覧履歴、screenshot（MVP）。

### Retention proposal

最終決定は、raw submissionと任意emailを90日保持し、その後は個人情報を除いたissue cluster / occurrence count / decision noteだけを運用記録として残す。unresolved issueに必要な最小化済みrecordは解決後30日まで、受信から最大12か月とする。Basin Starterのform retentionを90日に設定し、exportしたraw fileも90日以内に削除する。

### User notice

formには次を表示する。

> このフォームは匿名で送信できます。入力したカテゴリー・内容と、問題の確認に必要な表示中の画面状態（大会・カテゴリー・選手ID・表示指標・比較設定・画面サイズ・ブラウザ種別・アプリ版）を送信します。返信が必要な場合のみ連絡先を入力してください。個人を追跡するID、Cookie、広告ID、スクリーンショットは送信しません。匿名送信は後から特定・削除できない場合があります。

長いprivacy policyをform内に表示せず、必要な場合だけ別policyへのlinkを置く。

## 12. Relationship to Human Field Test

| Human Field Test | Production Feedback |
| --- | --- |
| 3–5名の構造化されたtask観察 | 公開後の実利用から継続的なsignal |
| moderator、task、hesitation、quoteを記録 | user-initiatedの短いcategory + free text |
| participant間比較が可能 | occurrence countは報告件数として扱う |
| Pilotとは別の正式dataset | Human Testの代替ではない |

正式participantを確保できたら、現在のUX3 protocolを用いてHuman Field Testを実施する。feedback intakeの存在を理由にHuman validation済みとは記載しない。

## 13. Future implementation acceptance criteria

実装時には少なくとも次を満たす。

- anonymousで送信でき、emailをrequiredにしない
- entry pointからform送信まで2〜3 interaction程度
- desktopはfixed entryのためのbottom clearanceを確保し、chart、RaceHeader、Results、Lap Detail、focus targetを遮らない
- mobileはnon-sticky footer/menu entryとし、rider picker bottom sheet、safe area、browser controlsを遮らない
- formは専用`/feedback` routeで表示し、既存overlayを重ねない
- 320px / 390px級とdesktopでkeyboard focus、長文、error、success、retryを確認する
- contextは許可リストのapplication stateだけを送る
- background analyticsや不要trackingを追加しない
- server endpointがclient contextをtrusted dataとして扱わない
- deploymentで利用可能なedge / WAF rate limitがあれば設定し、利用できない場合はprovider spam filter・honeypot・bounded validationをbaselineとする
- messageは1〜4,000文字、contactは254文字以下、categoryとcontextはbounded enum / stringとする
- Basin form endpoint / provider tokenをclient bundleへ露出しない
- duplicate clusterとoccurrence countを後から更新できる
- provider、retention、region、access権限を実装前に記録する
- sending / success / failure / retryで入力内容とfocusを適切に保持する

## 14. Design decision

最終案は、`ご意見・不具合を送る` のpersistent compact entry point + 専用`/feedback` route + application-owned endpoint + Basin Starter + 短いanonymous form + sanitized context + internal triageである。低頻度micro-feedbackとscreenshotはMVPから外す。

詳細なprovider、payload、abuse、retention、migration、UX3-1C scopeは `docs/feedback/feedback-provider-decision.md` を正本とする。
