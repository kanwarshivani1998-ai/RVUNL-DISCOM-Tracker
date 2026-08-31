import { getAllMcqStats, recordMcqAttempt, type MCQStatsRow } from "@/lib/db/db";

export type { MCQStatsRow };
export { getAllMcqStats, recordMcqAttempt };

/** Weak-topic threshold — isse kam accuracy wale topics "kamzor" maane jaate hain. */
export const WEAK_ACCURACY_THRESHOLD_PCT = 60;

export function isWeakByAccuracy(stats: MCQStatsRow | undefined): boolean {
  if (!stats || stats.attempts === 0) return false;
  return stats.lastAccuracyPct < WEAK_ACCURACY_THRESHOLD_PCT;
}
