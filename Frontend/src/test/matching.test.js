import { describe, expect, it } from "vitest";

function calculateMatch(currentUser, candidate) {
  const currentNative = (currentUser.nativeLanguage || "").toLowerCase().trim();
  const currentLearning = (currentUser.learningLanguage || "").toLowerCase().trim();
  const candNative = (candidate.nativeLanguage || "").toLowerCase().trim();
  const candLearning = (candidate.learningLanguage || "").toLowerCase().trim();

  let matchScore = 15;
  let matchType = "Community Member";

  if (
    currentNative &&
    currentLearning &&
    candNative === currentLearning &&
    candLearning === currentNative
  ) {
    matchScore = 100;
    matchType = "Perfect Exchange";
  } else if (currentLearning && candNative === currentLearning) {
    matchScore = 75;
    matchType = "Native Speaker";
  } else if (currentLearning && candLearning === currentLearning) {
    matchScore = 50;
    matchType = "Study Partner";
  } else if (currentNative && candLearning === currentNative) {
    matchScore = 40;
    matchType = "Practice Partner";
  }

  return { matchScore, matchType };
}

describe("Reciprocal Language Matching Algorithm", () => {
  const currentUser = {
    nativeLanguage: "English",
    learningLanguage: "Spanish",
  };

  it("should score 100 and identify 'Perfect Exchange' for mutual swap partners", () => {
    const candidate = {
      nativeLanguage: "Spanish",
      learningLanguage: "English",
    };
    const result = calculateMatch(currentUser, candidate);
    expect(result.matchScore).toBe(100);
    expect(result.matchType).toBe("Perfect Exchange");
  });

  it("should score 75 and identify 'Native Speaker' when candidate is native in target", () => {
    const candidate = {
      nativeLanguage: "Spanish",
      learningLanguage: "French",
    };
    const result = calculateMatch(currentUser, candidate);
    expect(result.matchScore).toBe(75);
    expect(result.matchType).toBe("Native Speaker");
  });

  it("should score 50 and identify 'Study Partner' when both are learning same language", () => {
    const candidate = {
      nativeLanguage: "German",
      learningLanguage: "Spanish",
    };
    const result = calculateMatch(currentUser, candidate);
    expect(result.matchScore).toBe(50);
    expect(result.matchType).toBe("Study Partner");
  });

  it("should score 40 and identify 'Practice Partner' when candidate learns user native language", () => {
    const candidate = {
      nativeLanguage: "Japanese",
      learningLanguage: "English",
    };
    const result = calculateMatch(currentUser, candidate);
    expect(result.matchScore).toBe(40);
    expect(result.matchType).toBe("Practice Partner");
  });

  it("should score 15 and label 'Community Member' for generic pairs", () => {
    const candidate = {
      nativeLanguage: "Russian",
      learningLanguage: "Italian",
    };
    const result = calculateMatch(currentUser, candidate);
    expect(result.matchScore).toBe(15);
    expect(result.matchType).toBe("Community Member");
  });
});
