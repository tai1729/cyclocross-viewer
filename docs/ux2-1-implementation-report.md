# UX2-1 Implementation Report — Workspace State / URL / Scroll / Focus

実施日: 2026-09-05

## Scope

UX2-1の対象である、同一分析コンテキスト内のstate lifecycle、URL同期、
history semantics、scroll intent、focus reconciliationだけを実装した。
UX2-2以降のDesktop/Mobileレイアウト変更、disclosure変更、chart/data semantics変更は
行っていない。

## Root cause

事前に公開版を初見ユーザーとして操作し、その後にsourceを確認した。
主原因は`RaceViewer.pushRaceUrl`の全ての`router.push`がscroll optionを省略していたことだった。
Next.js App Routerはnavigation時に既定でページ先頭へscrollするため、queryだけが変わる
rider、comparison、metric変更もnavigationとして扱われていた。

併せて、canonicalizationの`router.replace`にもscroll optionがなく、URL正規化が発生した
場合に同じ問題を起こし得た。`RaceViewer`自体のReact `key`によるremountや、分析ロジックの
再計算が直接のscroll-to-top原因ではなかった。

既存の`RiderSelector`には選択行を`scrollIntoView({ block: "center" })`する処理があり、
pickerの内部リストではなくページscrollへ影響する余地があった。これはURL更新時の処理では
なかったが、分析中のscroll stabilityを損なうため、bounded listの`scrollTop`だけを調整する
処理へ置き換えた。

browser back/forwardでは、URLにfocusを保存していないため、ブラウザが復元したfocusが
復元後のmetricと一致しない状態も確認した。表示されているだけの古いtabを有効なfocusと
みなさず、現在の`aria-selected` / `aria-pressed` / rider triggerを検証するreconciliationを
追加した。

## Before behavior

公開版で、`MMJ-256-005 / ME1 / 和田 良平`を使って確認した。

| viewport | 操作 | before |
| --- | --- | --- |
| 1440×900 | chartまでscroll後、comparisonを`±5`へ変更 | `scrollY` 約788 → 0 |
| 1440×900 | chartまでscroll後、metricを`タイム差`へ変更 | `scrollY` 約824 → 0 |
| 390×844 | chartまでscroll後、comparisonを変更 | `scrollY` 約2220 → 0 |
| 390×844 | chartまでscroll後、metricを変更 | `scrollY` 約2184 → 0 |
| 1440×900 | metric tabにfocusしたままBack | URL/stateは順位へ戻るが、focusは非選択のタイム差に残る |

これは、設定変更のたびに設定位置と分析結果位置を往復させる摩擦と、
browser history traversal後のstale focusを示す再現結果である。

## Implemented contract

### Transition and URL/history

| transition | URL | history | router scroll intent |
| --- | --- | --- | --- |
| browseから最初のrider選択 | 既存の`rider`/`fixed` | `push` | `scroll: true` |
| 分析中のrider変更 | `rider`/`fixed` | `push` | `scroll: false` |
| comparison / fixed rider変更 | `compare`/`fixed` | `push` | `scroll: false` |
| metric/tab変更 | `tab`/`lap` | `push` | `scroll: false` |
| lap pin変更 | `lap` | `push` | `scroll: false` |
| category変更 | `category`、rider/fixed/tab/lapをclear、compare=2 | `push` | `scroll: true` |
| canonicalization | 既存のknown/unknown query規則を維持 | `replace` | `scroll: false` |

URLを唯一のdurable state sourceとし、scroll positionとfocusはURLへ追加していない。
unknown repeated query pairs、既存keyの順序、default omission、deep link仕様は維持した。

### Scroll

同一分析workspaceのrider、comparison、metric、lap変更では`router.push(..., { scroll: false })`
を使う。`window.scrollTo`や固定遅延によるscroll復元は追加していない。
category/new-race navigationだけは新しいcontentの開始位置への通常navigationを許可する。
pickerを開くときの選択行revealは、`max-h-64 overflow-y-auto`の内部listのscrollTopだけを
変更し、documentのscrollを変更しない。

### Focus

- 結果表からkeyboardで分析を開始した場合は、既存の`#race-analysis` focus behaviorを維持する。
- 分析中のpicker selectionは、閉じた後にvisibleなrider triggerへfocusを戻す。
- browser back/forwardで、復元後もvisibleかつ現在stateを表すfocus（selected tab、pressed control、
  rider trigger、input）は保持する。
- stale/removed/non-current focusの場合は、current selected tabまたはrider trigger/inputへ
  `focus({ preventScroll: true })`する。必要時はanalysis region headingをfallbackにする。
- categoryのback/forwardは、target raceのloading/errorが終わるまでfocusを移動せず、loaded後に
  category triggerへfocusする。
- focus補正は`requestAnimationFrame`でDOMが復元された後に行うが、固定timeoutやmagic numberは使わない。

## Files changed

- `components/RaceViewer.tsx`
  - transition別router options
  - canonicalizationのscroll抑制
  - URL変更とprogrammatic navigationを区別するfocus reconciliation
  - category/race triggerとanalysis regionのstable marker
- `components/RiderSelector.tsx`
  - bounded picker list内のselected-row reveal
  - in-analysis selection後のrider trigger focus
- `lib/raceNavigation.ts`
  - transition classificationとscroll intentの純粋関数
- `tests/raceNavigation.test.ts`
  - transition分類、router scroll intent、URL round trip、category reset/history相当
- `docs/ux2-1-implementation-report.md`

## Tests added

追加テストは次を確認する。

- browse rider選択とanalysis rider変更の分類差
- categoryをnavigation、comparison/metric/lapをsame-workspaceとして分類
- canonicalizationをscrollなしとして分類
- rider、metric、comparison、lapを順に変更したURL historyのround trip
- unknown repeated pairsの保持
- category変更時のrider、compare、fixed、tab、lap reset

## Required validation

以下は全てpassした。

- `npm.cmd test` — 57 tests passed
- `npx.cmd tsc --noEmit`
- `npm.cmd run lint`
- `npm.cmd run build`
- `git diff --check`

## Browser verification

`agent-browser` CLIは環境に存在しなかったため、同じChrome browser automation surface
(CUA)でlocal Next.js dev server (`http://localhost:3001`)を操作した。3000番ポートは既存の
dev serverが使用中だったため3001を使用した。console errorは0件だった。

### Same-workspace scroll checks

初期状態を`rider=KNS-000-4368`、`scrollY=800`付近へ置き、comparison、metricを順に変更した。
いずれもdocument topへ戻らず、chartのviewport上端も正の値を保った。

| viewport | comparison後 `scrollY` / chart top | metric後 `scrollY` / chart top | overflow |
| --- | --- | --- | --- |
| 1440×900 | 1056 / 233px | 775 / 514px | none |
| 1280×720 | 771 / 538px | 885 / 444px | none |
| 390×844 | 927 / 1439px | 1860 / 546px | none |
| 320×568 | 1201 / 1399px | 2232 / 408px | none |

metric変更時のchart top差は、UX2-1で変更していない既存layout/content height差によるもの。
重要なUX2-1条件であるtop resetは発生していない。chart-firstのanchor/layout改善はUX2-2の範囲で扱う。

### History and focus checks

- `metric変更 → Back`でURLとselected tabは`順位`へ戻り、focusは非選択の`タイム差`に残らず、
  current rider triggerへ移動した。
- `rider変更 → Back → Forward`でrider、metric、comparison、URLが一致し、scrollは0へ戻らなかった。
- category `ME1 → ME2 → Back → Forward`でcategory URLと表示が一致し、back/forward後は
  `category-select`にfocusした。category change中は既存loading branchを表示し、old rider analysisは残さなかった。
- 結果表をkeyboardのSpaceで選ぶと`#race-analysis`にfocusした。
- 390×844でrider pickerをkeyboardのEnterで選ぶと、picker close後にrider triggerへfocusが戻り、
  `scrollY`はtopへ戻らなかった。
- 390×844のmetric keyboard操作ではselected tabとfocus-visibleが維持された。
- 1440×900で`次の周回`を押して`lap=2`にした後Backすると、lap URLは戻り、
  可視・enabledな`次の周回`buttonのfocusを保持した。
- canonicalizationが必要なstale deep linkでは、URLだけが正規化され、body以外の
  rider/tab/category controlへfocusを移動しなかった。

### Limitations

- このsliceでは既存layoutを維持しているため、内容量の差に伴うviewport内のchart位置変化は残る。
  UX2-2のworkspace layoutでchart anchorを設計する。
- scroll/focusをURLに保存していないため、reload時に同じscroll/focusを復元する仕様ではない。
- browser native scroll restorationの挙動差は残るが、同一workspaceのrouter navigationがtopへ強制する経路は除去した。

レビューで検出した上記2つのfocus edge case（canonicalization後の誤focus、lap controlの
stale判定）はbounded revisionで修正し、独立reviewerの最終判定は`PASS`となった。

## Regression risks

- category変更は分析stateをclearして新raceを読み込むため、rider/fixed/tab/lapの依存関係を変更しないこと。
- canonicalizationの`replace({ scroll: false })`がdeep linkの既存queryを破壊しないこと。
- popstate reconciliationがloading/error中にfocusを奪わず、loaded stateでstale controlをfocusしないこと。
- 既存のDNF、lap-down、missing lap、chart計算、検索正規化、error/retry、large datasetの処理は変更していない。

## UX2-1 status

Required validationとbrowser verificationを完了し、UX2-1のblocking issueは解消済み。
