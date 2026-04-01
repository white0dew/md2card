import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultSocialProfile,
  getDefaultSocialProfileTimeLabel,
  resolveSocialProfile,
} from "@/lib/social-profile";

test("resolveSocialProfile falls back to defaults for blank values", () => {
  assert.deepEqual(
    resolveSocialProfile(
      {
        avatarUrl: "   ",
        name: "",
        timeLabel: "  ",
      },
      new Date("2026-04-01T00:00:00Z"),
    ),
    {
      ...defaultSocialProfile,
      timeLabel: "04/01",
    },
  );
});

test("resolveSocialProfile preserves trimmed custom values", () => {
  assert.deepEqual(
    resolveSocialProfile({
      avatarUrl: " https://example.com/avatar.png ",
      name: " 阿明 ",
      timeLabel: " 今天 ",
    }),
    {
      avatarUrl: "https://example.com/avatar.png",
      name: "阿明",
      timeLabel: "今天",
    },
  );
});

test("getDefaultSocialProfileTimeLabel formats date as MM/DD", () => {
  assert.equal(
    getDefaultSocialProfileTimeLabel(new Date("2026-12-03T00:00:00Z")),
    "12/03",
  );
});
