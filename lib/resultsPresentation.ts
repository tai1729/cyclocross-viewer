export type ResultsPresentation = "full" | "desktop-disclosure";

export interface AnalysisPresentationOrder {
  mainBeforeRail: boolean;
  chartTabsBeforeLapDetail: boolean;
}

export function classifyResultsPresentation(
  isDesktop: boolean,
  isAnalysisState: boolean,
): ResultsPresentation {
  return isDesktop && isAnalysisState ? "desktop-disclosure" : "full";
}

export function getResultsDisclosureOpen(
  presentation: ResultsPresentation,
  userPreference: boolean,
): boolean {
  return presentation === "desktop-disclosure" && userPreference;
}

export function getAnalysisPresentationOrder(isDesktop: boolean): AnalysisPresentationOrder {
  return {
    mainBeforeRail: isDesktop,
    chartTabsBeforeLapDetail: isDesktop,
  };
}
