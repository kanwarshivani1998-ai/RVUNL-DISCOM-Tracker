import type { TopicState } from "@/lib/db/db";

/**
 * Spaced-repetition intervals (Ebbinghaus curve se inspired) — din me.
 * Stage 0 → topic abhi complete hua, pehla revision 1 din baad due hoga.
 * Har successful revision ke baad agla interval badhta jaata hai.
 */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 15, 30, 45];

export const MAX_REVIEW_STAGE = REVIEW_INTERVALS_DAYS.length - 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Topic pehli baar complete hone par yeh call karo — stage 0, 1 din baad due. */
export function initReviewSchedule(now = Date.now()) {
  return {
    reviewStage: 0,
    nextReviewAt: now + REVIEW_INTERVALS_DAYS[0] * DAY_MS,
    lastReviewedAt: undefined as number | undefined,
  };
}

/** User ne revision complete kiya — agle stage par badhao (max stage tak). */
export function advanceReviewSchedule(currentStage: number | undefined, now = Date.now()) {
  const stage = Math.min((currentStage ?? -1) + 1, MAX_REVIEW_STAGE);
  const intervalDays = REVIEW_INTERVALS_DAYS[stage];
  return {
    reviewStage: stage,
    nextReviewAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now,
  };
}

/** Kya yeh topic aaj revision ke liye due hai (ya overdue hai)? */
export function isDueForReview(state: TopicState | undefined, now = Date.now()): boolean {
  if (!state?.isCompleted) return false;
  if (state.nextReviewAt == null) return false; // purane data (spaced repetition se pehle complete hue topics) — due nahi maanenge
  return state.nextReviewAt <= now;
}

/** Kitne din baad due hai (negative = overdue). UI display ke liye. */
export function daysUntilDue(state: TopicState | undefined, now = Date.now()): number | null {
  if (!state?.nextReviewAt) return null;
  return Math.ceil((state.nextReviewAt - now) / DAY_MS);
}
