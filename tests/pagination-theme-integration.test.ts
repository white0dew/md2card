import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("pagination measurement locates card-content container", async () => {
  const measurementText = await readFile(
    new URL("../lib/pagination-card-measurement.tsx", import.meta.url),
    "utf8",
  );
  const factoryText = await readFile(
    new URL("../components/cards/create-themed-card.tsx", import.meta.url),
    "utf8",
  );

  assert.match(measurementText, /querySelector\(".card-content"\)/);
  assert.match(factoryText, /className="card-content"/);
});
