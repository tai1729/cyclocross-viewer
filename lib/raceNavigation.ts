export type RaceNavigationAction =
  | "route"
  | "category"
  | "rider"
  | "comparison"
  | "metric"
  | "lap"
  | "canonical";

export type RaceNavigationClassification =
  | "navigation"
  | "same-workspace"
  | "canonical";

export interface RaceNavigationOptions {
  scroll: boolean;
}

export function classifyRaceNavigation(
  action: RaceNavigationAction,
  hasAnalysis = false,
): RaceNavigationClassification {
  if (action === "canonical") return "canonical";
  if (action === "category" || action === "route") return "navigation";
  if (action === "rider") return hasAnalysis ? "same-workspace" : "navigation";
  return "same-workspace";
}

export function getRaceNavigationOptions(
  action: RaceNavigationAction,
  hasAnalysis = false,
): RaceNavigationOptions {
  return {
    scroll: classifyRaceNavigation(action, hasAnalysis) === "navigation",
  };
}
