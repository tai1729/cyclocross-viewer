export type ResultsPresentation =
  | "full"
  | "desktop-disclosure"
  | "mobile-disclosure";

export interface AnalysisPresentationOrder {
  mainBeforeRail: boolean;
  chartTabsBeforeLapDetail: boolean;
}

export function classifyResultsPresentation(
  isDesktop: boolean,
  isAnalysisState: boolean,
): ResultsPresentation {
  if (!isAnalysisState) return "full";
  return isDesktop ? "desktop-disclosure" : "mobile-disclosure";
}

export function getResultsDisclosureOpen(
  presentation: ResultsPresentation,
  userPreference: boolean,
): boolean {
  return presentation !== "full" && userPreference;
}

export function getAnalysisPresentationOrder(isDesktop: boolean): AnalysisPresentationOrder {
  return {
    mainBeforeRail: isDesktop,
    chartTabsBeforeLapDetail: isDesktop,
  };
}
