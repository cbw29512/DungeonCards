import { describe, expect, it } from "vitest";
import {
  formatMonsterChallengeRating,
  stripMonsterExperienceText
} from "./monsterChallenge";

describe("monster challenge formatting", () => {
  it("keeps only the challenge rating from 2014 values", () => {
    expect(formatMonsterChallengeRating("1/4 (50 XP)")).toBe("1/4");
    expect(formatMonsterChallengeRating("21 (33,000 XP)")).toBe("21");
  });

  it("keeps only the challenge rating from 2024 values", () => {
    expect(formatMonsterChallengeRating("5 (XP 1,800; PB +3)")).toBe("5");
    expect(formatMonsterChallengeRating("CR 1/2 (XP 100; PB +2)")).toBe("1/2");
  });

  it("leaves plain challenge ratings unchanged", () => {
    expect(formatMonsterChallengeRating("0")).toBe("0");
    expect(formatMonsterChallengeRating("1/8")).toBe("1/8");
  });

  it("removes experience parentheticals from stat-block text", () => {
    expect(stripMonsterExperienceText(
      "Armor Class 15\nHit Points 7\nChallenge 1/4 (50 XP)\nActions"
    )).toBe("Armor Class 15\nHit Points 7\nChallenge 1/4\nActions");

    expect(stripMonsterExperienceText(
      "AC 16\nHP 90\nCR 5 (XP 1,800; PB +3)\nActions"
    )).toBe("AC 16\nHP 90\nCR 5\nActions");
  });
});
