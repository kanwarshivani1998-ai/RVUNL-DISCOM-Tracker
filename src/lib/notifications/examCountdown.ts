/**
 * Exam-date countdown ke liye dynamic notification message banata hai.
 * Daily reminder ke saath jud kar chalta hai (scheduler.ts) — koi alag native
 * alarm nahi lagta, bas message har baar fresh calculate hota hai jab bhi
 * reminder (re)schedule hota hai (app open / settings change).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CountdownInputs {
  examDate?: string; // ISO date "YYYY-MM-DD"
  completedTopics: number;
  totalTopics: number;
}

export function daysRemaining(examDate: string, now = Date.now()): number {
  const exam = new Date(examDate + "T23:59:59").getTime();
  return Math.ceil((exam - now) / DAY_MS);
}

/**
 * Agar exam date set hai to countdown + pace-target wala message banata hai,
 * warna null (caller default generic message use kar le).
 */
export function buildCountdownMessage({ examDate, completedTopics, totalTopics }: CountdownInputs): string | null {
  if (!examDate) return null;
  const days = daysRemaining(examDate);
  const remainingTopics = Math.max(0, totalTopics - completedTopics);

  if (days < 0) return null; // exam nikal chuka
  if (days === 0) return "आज परीक्षा है! शुभकामनाएँ 🎯";

  if (remainingTopics === 0) {
    return `परीक्षा में ${days} दिन बाकी हैं — पूरा सिलेबस हो चुका है, अब रिवीजन पर फोकस करें! 🔁`;
  }

  const perDay = Math.ceil(remainingTopics / days);
  return `परीक्षा में ${days} दिन बाकी हैं — ${remainingTopics} टॉपिक्स शेष, आज लगभग ${perDay} टॉपिक्स पूरे करें। 📚`;
}
