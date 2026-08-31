import type { MCQStatsRow } from "@/lib/db/db";

export interface ReadinessInput {
  completedTopics: number;
  totalTopics: number;
  mcqStats: Record<string, MCQStatsRow>;
}

export interface ReadinessResult {
  score: number; // 0-100
  coveragePct: number; // syllabus coverage %
  avgAccuracyPct: number; // topics jinka MCQ diya hai unki average accuracy
  attemptedTopicsCount: number;
  label: string;
  colorVar: string;
}

/**
 * Readiness score = 60% syllabus coverage + 40% average MCQ accuracy.
 * Agar abhi tak koi MCQ nahi diya, to sirf coverage ke aadhar par (weight adjust ho jaata hai)
 * taaki naye users ka score 0 na dikhe.
 */
export function computeReadiness({ completedTopics, totalTopics, mcqStats }: ReadinessInput): ReadinessResult {
  const coveragePct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const attempted = Object.values(mcqStats).filter((s) => s.attempts > 0);
  const avgAccuracyPct =
    attempted.length > 0
      ? Math.round(attempted.reduce((sum, s) => sum + s.lastAccuracyPct, 0) / attempted.length)
      : 0;

  const score =
    attempted.length > 0
      ? Math.round(coveragePct * 0.6 + avgAccuracyPct * 0.4)
      : Math.round(coveragePct * 0.7); // MCQ data na ho to coverage ko zyada weight

  let label = "शुरुआत करें";
  let colorVar = "var(--color-hard)";
  if (score >= 80) {
    label = "परीक्षा के लिए तैयार";
    colorVar = "var(--color-success)";
  } else if (score >= 50) {
    label = "अच्छी प्रगति";
    colorVar = "var(--color-medium)";
  } else if (score >= 20) {
    label = "और मेहनत चाहिए";
    colorVar = "var(--color-hard)";
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    coveragePct,
    avgAccuracyPct,
    attemptedTopicsCount: attempted.length,
    label,
    colorVar,
  };
}
