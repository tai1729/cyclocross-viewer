export function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").replace(/\s+/gu, "").toLocaleLowerCase("ja");
}
