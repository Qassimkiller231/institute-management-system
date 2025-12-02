// lib/levelConfig.ts
// CEFR Level Configuration for Test Grading
// This can be configured by admin per test

export interface LevelRange {
  range: [number, number];  // [min, max] inclusive
  value: string;            // CEFR level
}

export interface TestLevelConfig {
  testId?: string;
  totalQuestions: number;
  levelRanges: LevelRange[];
}

// Default configuration for 50-question tests
export const DEFAULT_LEVEL_CONFIG: TestLevelConfig = {
  totalQuestions: 50,
  levelRanges: [
    { range: [0, 18],   value: "A1" },
    { range: [19, 25],  value: "A2" },
    { range: [26, 32],  value: "B1" },
    { range: [33, 39],  value: "B2" },
    { range: [40, 46],  value: "C1" },
    { range: [47, 50],  value: "C2" },
  ]
};

// All available CEFR levels
export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CEFRLevel = typeof CEFR_LEVELS[number];

/**
 * Determine CEFR level based on MCQ score
 * @param score - The student's MCQ score
 * @param config - Level configuration (uses default if not provided)
 * @returns CEFR level (A1, A2, B1, B2, C1, C2)
 */
export function getMCQLevel(
  score: number,
  config: TestLevelConfig = DEFAULT_LEVEL_CONFIG
): CEFRLevel {
  // Ensure score is within valid range
  const normalizedScore = Math.max(0, Math.min(score, config.totalQuestions));
  
  // Find matching level range
  for (const levelRange of config.levelRanges) {
    const [min, max] = levelRange.range;
    if (normalizedScore >= min && normalizedScore <= max) {
      return levelRange.value as CEFRLevel;
    }
  }
  
  // Fallback to A1 if no match found
  return "A1";
}

/**
 * Get level description for display
 */
export function getLevelDescription(level: CEFRLevel): string {
  const descriptions: Record<CEFRLevel, string> = {
    A1: "Beginner - Can understand and use familiar everyday expressions",
    A2: "Elementary - Can communicate in simple and routine tasks",
    B1: "Intermediate - Can deal with most situations while traveling",
    B2: "Upper Intermediate - Can interact with a degree of fluency and spontaneity",
    C1: "Advanced - Can express ideas fluently and spontaneously",
    C2: "Proficient - Can express themselves spontaneously, very fluently and precisely"
  };
  
  return descriptions[level];
}

/**
 * Suggest final level based on MCQ and Speaking levels
 * Takes the lower of the two levels
 */
export function suggestFinalLevel(
  mcqLevel: CEFRLevel,
  speakingLevel: CEFRLevel
): CEFRLevel {
  const mcqIndex = CEFR_LEVELS.indexOf(mcqLevel);
  const speakingIndex = CEFR_LEVELS.indexOf(speakingLevel);
  
  // Return the lower level (more conservative assessment)
  return CEFR_LEVELS[Math.min(mcqIndex, speakingIndex)];
}

// TODO: Admin Configuration API
// Future enhancement: Store configs in database per test
// GET  /api/admin/level-configs
// POST /api/admin/level-configs
// PUT  /api/admin/level-configs/:testId

export default {
  DEFAULT_LEVEL_CONFIG,
  CEFR_LEVELS,
  getMCQLevel,
  getLevelDescription,
  suggestFinalLevel
};