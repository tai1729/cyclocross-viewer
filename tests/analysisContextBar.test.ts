import test from "node:test";
import assert from "node:assert/strict";
import {
  getAnalysisComparisonLabel,
  getAnalysisMetricLabel,
  getAnalysisRiderStatus,
} from "@/components/AnalysisContextBar";
import type { Rider } from "@/lib/types";

const rider: Rider = {
  riderId: "rider-1",
  name: "テスト選手",
  finalPosition: 4,
  status: "finished",
  laps: [],
  dataQuality: "ok",
};

test("analysis context labels preserve the visible metric and comparison vocabulary", () => {
  assert.equal(getAnalysisMetricLabel("rank"), "順位");
  assert.equal(getAnalysisMetricLabel("gap"), "タイム差");
  assert.equal(getAnalysisMetricLabel("pace"), "周回差");
  assert.equal(getAnalysisMetricLabel("lap"), "ラップ");
  assert.equal(getAnalysisComparisonLabel(2), "±2");
  assert.equal(getAnalysisComparisonLabel("pinned"), "固定");
  assert.equal(getAnalysisComparisonLabel("all"), "全員");
});

test("analysis context gives status text for finish, lap-down, DNF, and unavailable riders", () => {
  assert.equal(
    getAnalysisRiderStatus(rider, { kind: "finished", position: 4, totalTimeSec: 1, gapToLeaderSec: 0, completedLapNumber: 5 }),
    "4位・完走",
  );
  assert.equal(
    getAnalysisRiderStatus(rider, { kind: "lapped", position: 4, lapDeficit: 1, completedLapNumber: 4 }),
    "4位・-1周",
  );
  assert.equal(
    getAnalysisRiderStatus(rider, { kind: "dnf", completedLapNumber: 3, finalCheckpointRank: 7, gapToLeaderAtCheckpointSec: 1 }),
    "DNF・最終通過7位",
  );
  assert.equal(
    getAnalysisRiderStatus(rider, { kind: "unavailable", reason: "data-quality" }),
    "データ異常・分析不可",
  );
});
