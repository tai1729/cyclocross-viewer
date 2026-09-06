export function isResultsRiderSelectionNavigation(
  selectedRiderId: string | null,
  nextRiderId: string,
): boolean {
  return selectedRiderId !== null && selectedRiderId !== nextRiderId;
}

export interface ResultsSelectionNavigationInput {
  pendingRiderId: string | null;
  currentUrlRiderId: string | null;
  queryChanged: boolean;
  isPopstate: boolean;
}

export interface ResultsSelectionNavigationDecision {
  canConsumePending: boolean;
  shouldClearPending: boolean;
}

export function getResultsSelectionNavigationDecision({
  pendingRiderId,
  currentUrlRiderId,
  queryChanged,
  isPopstate,
}: ResultsSelectionNavigationInput): ResultsSelectionNavigationDecision {
  const pendingMatchesUrl =
    pendingRiderId !== null && pendingRiderId === currentUrlRiderId;
  const hasUrlTransition = queryChanged || isPopstate;

  return {
    canConsumePending: pendingMatchesUrl && queryChanged,
    shouldClearPending: pendingRiderId !== null && !pendingMatchesUrl && hasUrlTransition,
  };
}

export function shouldRevealAnalysisRegion(
  rect: { top: number; bottom: number },
  innerHeight: number,
): boolean {
  return rect.top >= innerHeight || rect.bottom <= 0;
}

export interface SupportingDisclosureLifecycleInput {
  isLoading: boolean;
  hasError: boolean;
  hasRace: boolean;
  isAnalyzing: boolean;
  wasAnalyzing: boolean;
}

export type SupportingDisclosureLifecycleDecision = "reset" | "preserve";

export function getSupportingDisclosureLifecycleDecision({
  isLoading,
  hasError,
  hasRace,
  isAnalyzing,
  wasAnalyzing,
}: SupportingDisclosureLifecycleInput): SupportingDisclosureLifecycleDecision {
  return isLoading || hasError || !hasRace || isAnalyzing !== wasAnalyzing
    ? "reset"
    : "preserve";
}
