import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultSocialProfile,
  resolveSocialProfile,
} from "@/lib/social-profile";

test("resolveSocialProfile falls back to defaults for blank values", () => {
  assert.deepEqual(
    resolveSocialProfile({
      avatarUrl: "   ",
      name: "",
      timeLabel: "  ",
    }),
    defaultSocialProfile,
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
