import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RaceHeader } from "../components/RaceHeader";
import type { RaceResult } from "../lib/types";

test("RaceHeader counts only literal dnf rows as DNF", () => {
  const race: RaceResult = {
    raceId: "race-1",
    raceName: "Race",
    category: "Category",
    updatedAt: "2026-09-14",
    riders: [
      {
        riderId: "finished",
        name: "Finished",
        finalPosition: 1,
        status: "finished",
        dataQuality: "ok",
        laps: [],
      },
      {
        riderId: "annotated",
        name: "Annotated",
        finalPosition: 2,
        status: "annotated-rank",
        officialPositionLabel: "2 LapOut",
        dataQuality: "ok",
        laps: [],
      },
      {
        riderId: "dnf",
        name: "DNF",
        finalPosition: 3,
        status: "dnf",
        dataQuality: "ok",
        laps: [],
      },
    ],
  };

  const html = renderToStaticMarkup(
    createElement(RaceHeader, {
      race,
      listHref: "/",
      meetName: "Meet",
      categorySelector: createElement("span", null, "Category selector"),
    }),
  );

  assert.match(html, /3名（完走1 \/ DNF 1）/);
  assert.doesNotMatch(html, /3名（完走1 \/ DNF 2）/);
});
