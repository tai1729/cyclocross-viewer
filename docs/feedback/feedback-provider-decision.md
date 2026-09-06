# UX3-1B Feedback Provider / Privacy / Retention Decision

Status: DECISION COMPLETE — READY FOR UX3-1C
Decision date: 2026-09-06
Human Field Test: NOT YET EXECUTED
Product code: NOT CHANGED

この文書は、UX3-1Aで設計した `ご意見・不具合を送る` の実装前決定である。Human Field Testの代替ではなく、production feedbackの保存・保護・移行境界を決める。

## 1. Decision summary

### Selected MVP approach

`application-owned Next.js endpoint → Basin Starter form endpoint`

- clientはBasinへ直接送信しない。
- Next.jsのserver endpointでpayloadを検証し、許可したcontextだけをBasinへforwardする。
- Basinはraw submissionの保存、dashboard、spam filtering、exportの初期保存先とする。
- Basin SDKやprovider-specific fieldをclient componentへimportしない。
- MVPではBasin REST API tokenを使用しない。Basinのform endpointへserver-side `POST`するだけにし、API tokenが必要な処理は将来のadapter拡張とする。
- provider endpoint設定はserver-side environment variableで管理し、client bundleには出さない。

### Selected retention

- raw feedback（message、contact、context）: 受信から90日。
- unresolved issueに紐づけた最小化済みissue record: issue解決後30日まで、ただし最長12か月。
- optional contact: 返信完了時に削除、未解決でも受信から90日を上限とする。
- de-identified aggregate（category、issue cluster、occurrence count、decision note）: 継続保持可。free text、contact、rider ID、meet ID、raw URLは含めない。
- exportしたraw fileはtriage作業用の一時コピーとし、90日を越えて保持しない。

provider側のretention上限と削除仕様は別に適用される。Basin Starterのform retentionは最大365日なので、form設定を90日に固定する。providerのspam/trashやprocessor logに関する保持はBasinの現行policyに従い、アプリ側で保証する90日と混同しない。

## 2. Requirements and non-goals

### Requirements

- anonymous submission
- category enum、bounded free text、optional contact
- structured field保存とCSV/XLSX export
- browserからsubmitできるが、provider secretをclientへ出さない
- server-side validation、payload allowlist、spam / abuse対策
- screenshotなしで成立
- low-volume MVPとして運用可能
- Basinから別backend/databaseへ移行可能
- Human Field Test、analytics、micro-feedbackをこのphaseで代替・実装しない

### Non-goals

- login、account、cross-session user identity
- advertising ID、analytics user ID、fingerprint
- screenshot upload
- NPS、survey、micro-feedback prompt
- providerのdashboardをproduct UIへ公開
- client contextをdata correctnessやsecurityの判定に利用

## 3. Official source review

価格・plan差・API・privacy・retentionは2026-09-06にproviderのofficial documentationで確認した。価格とplanは変更され得るため、UX3-1C実装開始時に再確認する。

- [Basin plan comparison](https://docs.usebasin.com/plan-comparison/): Freeは50 submissions/月・30日retention・data exportなし。Starterは250 submissions/月・365日retention・data exportあり。Basic spam filteringとCAPTCHA optionsはplan表にあるが、duplicate filterはGrowth以上。
- [Basin pricing](https://usebasin.com/pricing): Starterは現行表示で年払い `$12.50/mo`。Freeは1 form endpoint、50 submissions/月、30日retention。
- [Basin form backend](https://docs.usebasin.com/creating-forms/overview/): HTML endpoint、Basin JS、AJAX、spam filtering、custom success/error handlingを提供。
- [Basin spam protection](https://docs.usebasin.com/getting-started/spam-protection-basics/): backend filters、CAPTCHA、honeypot、domain restriction、duplicate detectionなどを案内。duplicate detectionはGrowth以上。
- [Basin data storage](https://docs.usebasin.com/advanced-features/data-storage/): per-form retention、dashboard/API deletion、Free 30日 / Starter 365日などを説明。
- [Basin GDPR / privacy](https://usebasin.com/gdpr) and [security FAQ](https://docs.usebasin.com/faq/): export、deletion、retention controls、DPA、Canada運用、US sub-processors、Canada-only residency不可を説明。
- [Vercel Functions](https://vercel.com/docs/functions): server-side endpoint、external API/database呼び出し、region controlを提供。
- [Vercel environment variables](https://vercel.com/docs/environment-variables): Production / Preview / Development別のserver environment configurationを提供。

比較用に、[Formspree export](https://help.formspree.io/articles/form-and-project-settings/exporting-submissions/)、[Formspree spam protection](https://help.formspree.io/articles/troubleshooting/how-to-prevent-spam/)、[Formspree webhooks](https://help.formspree.io/articles/plugins/webhooks)も確認した。FormspreeはCSV/JSON export、ML spam scan、reCAPTCHA、honeypot、domain restriction等を提供するが、exportはPersonal以上、webhookはProfessional / Businessに制限されるため、今回の第一候補にはしない。

## 4. Compared approaches

評価基準は、Implementation simplicity / Privacy / Security / Anonymous submission / Structured exportをHigh、Cost / Spam handling / Future migration / Operational burdenをMediumとする。

| Option | Architecture | Simplicity | Privacy / security | Export / abuse | Migration | Cost / burden | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A | Basin Starter endpointへclientから直接送信 | Highest | provider endpointがclientに露出し、client validationを迂回したpayloadも届く。Basin側filterは使える。 | Starterのexportとbasic spamは利用できる。duplicate filterはGrowth以上。 | Medium。form fieldにcoupleしやすい。 | Low。現行表示$12.50/mo（年払い） | Not selected |
| B | Next.js server endpoint → Basin Starter endpoint | High | serverでenum、length、context allowlist、contact validationを行える。providerをclientから隠せる。 | Starterのstructured export / basic spam + server honeypot / validationを組み合わせる。 | High。canonical payloadとadapterを維持できる。 | Medium。Vercel Function一つ + Basin Starter | **Recommended** |
| C | Next.js server endpoint → dedicated managed Postgres / backend | Medium | retention、deletion、access control、auditを最も細かく所有できる。 | 自前triage、duplicate、export、rate limitが必要。 | Highest。provider依存が少ない。 | Low volumeには過剰。DB、migration、backup、運用を追加 | Deferred |

### Concrete alternative: Formspree

FormspreeはOption Aの代替managed form serviceである。CSV/JSON export、ML spam scan、reCAPTCHA、honeypot、domain restrictionを公式資料で確認できる。ただしexportとwebhookのplan境界、provider-specific workflow、privacy / retentionの再確認が必要で、今回はBasin Starterの方が要件と確認結果を直接対応づけやすい。Basinが利用不能になった場合のfallback候補として記録する。

### Why not dedicated database now

現在はlow-volume MVPであり、raw feedbackの複雑なquery、account-based access、large-scale analytics、attachmentが不要である。Dedicated databaseを先に導入すると、provider選定だけでなくschema migration、backup、deletion job、admin access、spam handlingを同時に運用することになる。将来volumeまたはtriage要件が増えた場合に移行する。

## 5. Data classification and minimization

### User-provided fields

| Field | Need | Sensitivity | Required / retention | Disclosure |
| --- | --- | --- | --- | --- |
| `category` | triageの最小入力 | Low | Required / raw 90日 | labelと選択肢を表示 |
| `message` | 問題の内容と再現手掛かり | Medium〜High。自由記述には個人情報が混入し得る | Required / raw 90日、issueに必要な最小要約だけ延長 | form noticeで明示 |
| `contactEmail` | 返信希望時のみ | High | Optional / 返信完了時、または最大90日 | `返信が必要な場合の連絡先（任意）` と表示 |

MVPのcontactはemailのみとし、電話番号・SNS ID・氏名欄は追加しない。

### Automatically captured fields

| Field | Decision | Sensitivity | Required / retention | Disclosure |
| --- | --- | --- | --- | --- |
| `route` | Keep as enum `home` / `race` / `feedback` | Low | Required / raw 90日 | technical contextとして明示 |
| `meetId` | Keep when race page; app内IDのみ | Low〜Medium | Optional / raw 90日 | 大会状態として明示 |
| `raceId` | Keep when loaded race exists; app内IDのみ | Low〜Medium | Optional / raw 90日 | カテゴリー状態として明示 |
| `categoryId` | Keep; app内IDのみ | Low〜Medium | Optional / raw 90日 | カテゴリー状態として明示 |
| `riderId` | Keep only selected rider ID; nameは送らない | Medium。結果データと結びつく | Optional / raw 90日 | 選手IDとして明示 |
| `fixedRiderIds` | Keep max 4 IDs only when pinned comparison | Medium | Optional / raw 90日 | 比較設定として明示 |
| `metric` | Keep enum `rank` / `gap` / `pace` / `lap` | Low | Optional / raw 90日 | 表示指標として明示 |
| `comparisonMode` | Keep enum `0`〜`5` / `pinned` / `all` | Low | Optional / raw 90日 | 比較設定として明示 |
| `lap` | Keep positive integer when selected | Low | Optional / raw 90日 | 表示設定として明示 |
| `season` / `series` | Keep only on home or return context; bounded strings | Low | Optional / raw 90日 | 大会絞り込み状態として明示 |
| `viewport` | Keep bounded integer width / height | Low | Required / raw 90日 | 画面サイズとして明示 |
| `browserFamily` | Keep normalized family only | Low | Required / raw 90日 | ブラウザ種別として明示 |
| `appVersion` | Keep build version / short commit label | Low | Required / raw 90日 | アプリ版として明示 |

送信しないもの:

- full URL、unknown query parameters、URL fragment
- rider name、free-form display text、raw user-agent
- IP addressをapplication payloadへ保存すること
- Cookie、localStorage内容、広告ID、analytics user ID、persistent anonymous ID
- referrer、geolocation、cursor / keystroke、閲覧履歴
- screenshot、attachment、file metadata

providerやhosting infrastructureがabuse preventionのためにnetwork metadataを処理する可能性はある。これはapplication payloadへ収集することとは分けてprivacy noticeとprovider policyで扱う。

## 6. Final privacy disclosure

formの送信ボタン付近に、次の短文を表示する。

> このフォームは匿名で送信できます。入力したカテゴリー・内容と、問題の確認に必要な表示中の画面状態（大会・カテゴリー・選手ID・表示指標・比較設定・画面サイズ・ブラウザ種別・アプリ版）を送信します。返信が必要な場合のみ連絡先を入力してください。個人を追跡するID、Cookie、広告ID、スクリーンショットは送信しません。匿名送信は後から特定・削除できない場合があります。

この文言は、form内に長いprivacy policyを埋め込まず、詳細なpolicyへのlinkが必要な場合だけ別ページへ置く。

## 7. Retention and deletion policy

### Recommended policy

1. Basin form設定: `90 days`。
2. raw recordをinternal triageへexportする場合、private storageで同じ90日retentionを設定し、triage後に削除する。
3. P0〜P1または未解決のdata / accessibility issueで必要な場合は、raw record全体を無期限保存せず、issue key、最小化した再現条件、category、severity、occurrence count、decision noteだけを残す。
4. issueに紐づく最小化recordは解決後30日で削除し、受信から12か月を上限とする。
5. contactEmailは返信完了時に削除する。返信できない状態でも受信から90日を超えて保持しない。
6. aggregate countは、個別message、contact、ID、raw contextを除いた状態で保持する。

Free planの30日retentionは運用上短く、exportもないため不採用。Growth以上の無期限retentionもdefaultにしない。

### Data request / deletion

- contactあり: userが削除を希望した場合、受信時期・連絡先・内容の確認によりoperatorが対象recordを特定し、Basinとinternal copiesから削除する。contactEmail削除後は将来の再特定を保証しない。
- anonymous: identityを確認できないため、特定のsubmissionを削除できない場合がある。この制約を上記noticeで開示する。provider dashboardからoperatorが見つけられる情報がある場合のみ削除する。
- aggregate count: 個人recordと結びつかない状態であれば、削除requestの対象外とする。ただし個人を推測できる少数clusterはraw record同様に扱う。
- 削除は復元不能とする。バックアップやproviderのspam/training retentionがある場合は、provider policyの範囲で扱う。

## 8. Payload and transport contract

### Canonical payload

```ts
type FeedbackCategory =
  | "usability"      // 使いにくい
  | "understanding"  // 分かりにくい
  | "display"        // 表示がおかしい
  | "data"           // データがおかしい
  | "feature"        // 欲しい機能
  | "other";

type FeedbackContext = {
  route: "home" | "race" | "feedback";
  meetId?: string;
  raceId?: string;
  categoryId?: string;
  riderId?: string;
  fixedRiderIds?: string[]; // max 4
  metric?: "rank" | "gap" | "pace" | "lap";
  comparisonMode?: 0 | 1 | 2 | 3 | 4 | 5 | "pinned" | "all";
  lap?: number;
  season?: string;
  series?: string;
  viewportWidth: number;
  viewportHeight: number;
  browserFamily: "chromium" | "firefox" | "safari" | "edge" | "other" | "unknown";
  appVersion: string;
};

type FeedbackSubmission = {
  schemaVersion: 1;
  category: FeedbackCategory;
  message: string;
  contactEmail?: string;
  context: FeedbackContext;
};
```

### User-facing category mapping

| User-facing label | Payload value | Default internal type |
| --- | --- | --- |
| 使いにくい | `usability` | `UX` |
| 分かりにくい | `understanding` | `UX` |
| 表示がおかしい | `display` | `BUG` |
| データがおかしい | `data` | `DATA` |
| 欲しい機能 | `feature` | `FEATURE` |
| その他 | `other` | `OTHER` |

内容からaccessibility、correctness、securityに該当する場合は、default mappingをtriage担当者が上書きする。user-facing categoryとinternal triage typeは同一enumに固定しない。

### Transport-only values

- `Idempotency-Key`: form instanceごとの一時nonce。cross-session identityではなく、raw recordへ保存しない。MVPのdouble-submit対策と調査用に使い、成功後に破棄する。
- `honeypot`: hidden empty field。値が入っていれば保存せず、providerへforwardしない。
- `serverReceivedAt`: server側で付与する。client timestampをtrusted timeにしない。
- `provider`: server側adapterが付与する内部値。user payloadには含めない。

### Limits

| Field | Limit / validation |
| --- | --- |
| `category` | allowlisted enum only |
| `message` | trim後1〜4,000 characters。empty / control-onlyはreject |
| `contactEmail` | optional、trim後254 characters以下、基本的なemail format。返信用途以外に使わない |
| ID fields | string、1〜128 characters、許可文字をboundedにする。nameやHTMLは受けない |
| `fixedRiderIds` | max 4 items、各128 characters |
| `season` / `series` | max 64 characters |
| `metric` / `comparisonMode` | enum only |
| `lap` | positive safe integer、上限100,000 |
| `viewportWidth` / `viewportHeight` | integer、240〜10,000の範囲へclamp / reject |
| `browserFamily` | normalized enum only |
| `appVersion` | max 64 characters、server build metadataを優先 |
| unknown keys | ignoreまたは400。providerへforwardしない |

HTML、Markdown、URL、SQL、scriptをmessageから除去するのではなく、保存・表示時にtextとして扱う。内部dashboardでrenderする場合もHTMLとしてinjectしない。

### Client context is untrusted

serverはclientから来た`meetId`、`raceId`、rider ID、metric、versionをdebugging hintとして扱う。data correctness、authorization、security、公式結果判定には利用しない。必要な場合の再現確認は、別途trusted sourceとapplication stateで行う。

## 9. Abuse / spam prevention

### MVP defaults

1. server-side method check、content type check、JSON/body size limit。
2. category enum、message / contact / context length validation。
3. hidden honeypot。filled honeypotは成功表示を返してproviderへ送らず、内部には保存しない。
4. providerのBasin basic spam filteringとallowed-domain設定を有効化する。
5. deploymentで利用可能なedge / WAF rate limitがあればendpointに設定する。利用できない場合も、新しいtracking IDや独自DBを追加せず、Basin basic spam filtering・allowed domain・honeypot・bounded validationをbaselineとする。rate-limit判定用のnetwork metadataをfeedback recordへ保存しない。
6. submit中はbuttonをdisableし、clientのautomatic POST retryを行わない。
7. provider error、validation error、abuse rejectionの詳細をclientへ漏らさない。

CAPTCHAは初期の常時必須にはしない。通常ユーザーの2〜3 interaction目標を守り、basic filter・honeypot・rate limitで不足するspamが継続した場合だけ、BasinのTurnstile / hCaptcha等を段階的に有効化する。導入時はaccessibilityとprivacy noticeを再確認する。

### Repeated submission

- double click: sending stateとbutton disableで防ぐ。
- browser / network retry: clientでautomatic retryをしない。manual retryだけ許可する。
- same messageの複数送信: MVPではstrict idempotencyを保証せず、provider filterとinternal duplicate clusteringで扱う。Growth以上のduplicate filterやdedupe storeを先に追加するための根拠にはしない。
- `Idempotency-Key`はper-submit nonceとして送るが、cross-session user identityにはしない。strict dedupeが必要になった場合だけ、server-side short-lived storeを別decisionにする。

## 10. Secret management

- Basin form endpointはclient componentに埋め込まず、server endpointがserver environment variableから読む。
- Basin REST APIを将来使う場合のAPI keyはserver-only environment variableとし、source code、client bundle、docs、logsへ書かない。
- VercelのDevelopment / Preview / Productionを分離し、Preview submissionsとProduction submissionsを同一formへ混ぜない。実装時はenvironment別form endpointを設定する。
- route handler、provider adapter、provider responseをserver logへ出す場合もmessage、email、IDs、full payloadを記録しない。

## 11. Failure UX contract

### Sending

- submit buttonをdisabledにし、`送信中…`を表示する。
- form fieldsは変更不可または二重送信防止状態にする。
- `aria-busy`またはpolite live regionで状態を通知する。

### Success

- `ご意見・不具合を送信しました。ご協力ありがとうございます。` を表示する。
- success announcementへfocusを移すか、form上部のstatusへkeyboard focusを戻す。
- success後にmessage/contactの再送信を防ぐため、formをclearまたは完了状態へ切り替える。

### Failure

- `送信できませんでした。入力内容を確認して、もう一度お試しください。` を表示する。
- category、message、contact、context draftを消さない。
- errorを該当fieldに`aria-describedby`で関連づける。network/provider failureの詳細は表示しない。
- retryは同じformで行える。page全体のerror boundaryへ遷移させない。

## 12. Exact UI placement contract

UX3-1AのOption Bを次のように具体化する。

### Desktop (`min-width: 1024px`)

- `app/layout.tsx`のsite-level entryとして、viewport右下にcompact buttonをfixed配置する。
- `bottom`は通常16px、`right`は16pxを基準とし、safe-areaがある場合は`max(16px, env(safe-area-inset-bottom))`相当の余白を取る。
- buttonは一行の`ご意見・不具合を送る`、または長さに応じてaccessible nameを保持したicon + textとする。大きなfloating panelにはしない。
- main shellにbutton分のbottom clearanceを確保し、chart、Results、Lap Detail、keyboard focus targetの上に重ならないようにする。
- `position: sticky`ではなくfixed。chart内部、RaceHeader sticky layer、tableのscroll regionには入れない。
- feedback buttonから専用`/feedback` routeへ移動する。chart上にdialogを重ねない。

### Mobile (`< 1024px`)

- fixed buttonを表示しない。
- `app/layout.tsx`のglobal footer utility rowにnon-sticky link/buttonとして置く。
- footerはsafe-area bottom paddingを持つ。rider picker bottom sheet、browser bottom controls、chart、Resultsへoverlayしない。
- feedback formは専用`/feedback` routeで表示し、rider pickerのnative dialogやcomparison disclosureと同時に開かない。
- entry click前にcurrent app stateをephemeral session snapshotへ保存し、feedback routeでcontext builderが読み取る。snapshotは送信後または離脱時にclearし、user identityとして再利用しない。

Direct `/feedback` visitではcontextが空でも送信可能とする。

## 13. Implementation scope for UX3-1C

予定範囲は次のbounded sliceとする。

- `app/layout.tsx`: desktop entry / mobile footer utilityの配置。
- `app/feedback/page.tsx`: dedicated feedback form route、notice、success/error states。
- `app/api/feedback/route.ts`: method、body、length、enum、honeypot、rate-limit boundary、provider adapter呼び出し。
- `components/feedback/FeedbackEntry.tsx`: compact entry point、responsive placement、context snapshot。
- `components/feedback/FeedbackForm.tsx`: labels、fields、validation、focus、live regions。
- `lib/feedback/feedbackSchema.ts`: canonical category、payload validation、bounded context。
- `lib/feedback/context.ts`: existing `urlState` keysからallow-listed contextを組み立てる。unknown queryは捨てる。
- `lib/feedback/provider.ts`: provider-neutral `submitFeedback` interfaceとBasin adapter。Basin SDKをclientへ追加しない。
- `tests/feedback*.test.ts`: pure validation / serialization / category mapping tests。
- browser smoke artifact: desktop、390px、320px、keyboard、failure/retry、existing bottom sheet non-interference。

今回は上記ファイルを作成・変更しない。既存route、upstream data contract、chart logic、product stylingはfeedback sliceに必要な最小範囲を越えて変更しない。

## 14. Testing strategy for UX3-1C

### Unit / pure contract

- category enumとuser-facing label mapping
- message 1〜4,000文字、empty / oversized / control-only
- optional email format、254文字上限
- context serialization: known `urlState` keysだけ、unknown queryなし
- comparison mode、metric、lap、fixed rider max 4
- viewport clamp、browser normalization、appVersion bound
- honeypot rejection、unknown key rejection

### Integration / route adapter

- valid anonymous submission
- invalid category / message / contact / context
- provider success
- provider 4xx / 5xx / timeout
- retry後にdraft保持
- sending中の二重submit抑止
- productionとpreviewのprovider endpoint分離
- provider responseやsecretがclientへ漏れないこと

### Browser

- 1440px / 1280pxでfixed entryがchart、RaceHeader、Results、focus targetに重ならない
- 390px / 320pxでfooter entryがsafe-area、rider picker bottom sheet、browser controlsと競合しない
- keyboard tab order、labels、error association、success announcement
- direct `/feedback` visitとrace pageからのcontext snapshot
- feedback routeから戻った後のrace URL state / analysis state
- reduced motion環境で不要なtransitionを行わない

既存project commandsと整合する形で、`npm test`、`npx tsc --noEmit`、`npm run lint`、`npm run build`、`git diff --check`を実装後に実行する。browser smokeは既存のUX検証手順に追加する。

## 15. Provider failure and migration path

provider-specific contractは`lib/feedback/provider.ts`のserver-side adapterだけに閉じ込める。UIはcanonical `FeedbackSubmission`とprovider-neutral response (`accepted` / `retryable` / `rejected`)だけを扱う。

移行時は次の順序とする。

1. new provider adapterを追加し、既存canonical payloadから変換する。
2. staging / Previewでvalidation、privacy、retention、spam、failure UXを検証する。
3. BasinからCSV/XLSXをexportし、必要なissue clusterとaggregate countを移す。raw feedbackの移行はretentionとprivacy reviewで必要と判断した場合だけ行う。
4. Productionを切り替え、旧Basin endpointをread-only review期間にする。
5. Basin raw data、contact、provider credentialsをretention / deletion policyに従って削除する。

UIからprovider SDKへcoupleしないため、provider変更でentry point、form、analysis workspaceを大幅変更しない。

## 16. Final decision

`UX3-1B FEEDBACK IMPLEMENTATION READY`

This document, together with the updated `feedback-intake-spec.md`, fixes the provider/storage approach, data contract, privacy disclosure, retention, anonymous behavior, abuse protection, screenshot policy, payload limits, failure UX, placement, secret handling, migration boundary, implementation scope, and test strategy. Product implementation remains deferred to UX3-1C.
