const SERIES_ORDER = [
  "全日本",
  "東北",
  "関東",
  "宇都宮",
  "前橋",
  "野田",
  "千葉",
  "東京",
  "湘南",
  "富山",
  "信州",
  "東海",
  "関西",
  "中国",
  "もみじ",
  "山口",
  "四国",
  "九州",
] as const;

const SERIES_ORDER_INDEX = new Map<string, number>(SERIES_ORDER.map((series, index) => [series, index]));

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function sortSeriesOptions(seriesOptions: readonly string[]): string[] {
  return [...seriesOptions].sort((left, right) => {
    const leftIndex = SERIES_ORDER_INDEX.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightIndex = SERIES_ORDER_INDEX.get(right) ?? Number.MAX_SAFE_INTEGER;
    return leftIndex - rightIndex || compareCodePoints(left, right);
  });
}
