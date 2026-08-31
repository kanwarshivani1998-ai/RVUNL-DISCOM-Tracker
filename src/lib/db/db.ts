import { openDB, type IDBPDatabase } from "idb";
import type { Difficulty } from "@/lib/syllabus/syllabusData";

export interface TopicState {
  topicId: string;
  isCompleted: boolean;
  difficulty?: Difficulty;
  notes?: string;
  bookmarked?: boolean;
  markedForRevision?: boolean;
  lastStudied?: number; // epoch ms
  completedAt?: number;
  // ---- Spaced repetition (naya) ----
  reviewStage?: number; // 0..N — kितनी baar successfully revise ho chuka hai
  nextReviewAt?: number; // epoch ms — agla revision kab due hai
  lastReviewedAt?: number; // epoch ms — pichli baar revise kab kiya
}

export interface Settings {
  key: "settings";
  dailyTargetTopics: number;
  dailyTargetMinutes: number;
  notificationTime: string; // "09:00"
  notificationsEnabled: boolean;
  theme: "light" | "dark" | "system";
  examDate?: string; // ISO date
  audioUnlocked?: boolean; // Welcome Screen gate
  lastMotivationShownDate?: string; // YYYY-MM-DD, once-per-day gate
}

export interface DailyLogEntry {
  date: string; // YYYY-MM-DD
  completedTopicIds: string[];
  minutes: number;
}

export interface StreakState {
  key: "streak";
  current: number;
  longest: number;
  lastActiveDate?: string;
}

// User-editable daily timetable entry (drives the alarm system)
export interface TimetableItem {
  id: string;
  task: string;
  startTime24: string; // "HH:MM"
  days: number[]; // 0=Sun..6=Sat; empty array = every day
  enabled: boolean;
}

// Quick doubts / sticky-note reminders (separate from per-topic notes)
export interface PersonalReminder {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: number;
}

const DB_NAME = "rvunl-discom-tracker";
// v5 — adds mcqStats, wrongAnswerBank, mockTestHistory stores (naye features:
// auto weak-topic detection, wrong-answer revision bank, mock test mode).
const DB_VERSION = 5;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB not available on server"));
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("topicState")) {
          db.createObjectStore("topicState", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("dailyLog")) {
          db.createObjectStore("dailyLog", { keyPath: "date" });
        }
        if (!db.objectStoreNames.contains("streak")) {
          db.createObjectStore("streak", { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains("timetable")) {
          db.createObjectStore("timetable", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("personalReminders")) {
          db.createObjectStore("personalReminders", { keyPath: "id" });
        }
        // MCQ questions ka local cache — topic_id ke hisab se, ek baar Supabase se sync ho jaane ke baad
        // baar baar internet call karne ki zaroorat nahi padti.
        if (!db.objectStoreNames.contains("mcqCache")) {
          db.createObjectStore("mcqCache", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("mcqSyncMeta")) {
          db.createObjectStore("mcqSyncMeta", { keyPath: "key" });
        }
        // Study content (key points + detailed article) ka local cache — topic_id ke hisab se,
        // ek baar Supabase se sync ho jaane ke baad offline hone par bhi dikhta rahe.
        if (!db.objectStoreNames.contains("topicContentCache")) {
          db.createObjectStore("topicContentCache", { keyPath: "topicId" });
        }
        if (!db.objectStoreNames.contains("topicContentSyncMeta")) {
          db.createObjectStore("topicContentSyncMeta", { keyPath: "key" });
        }
        // ---- Naye stores (v5) ----
        // Har topic ka MCQ performance (attempts, sahi/galat count) — auto weak-topic
        // detection aur readiness score ke liye use hota hai.
        if (!db.objectStoreNames.contains("mcqStats")) {
          db.createObjectStore("mcqStats", { keyPath: "topicId" });
        }
        // Galat kiye gaye sawaal — dobara revise karne ke liye alag bank.
        if (!db.objectStoreNames.contains("wrongAnswerBank")) {
          db.createObjectStore("wrongAnswerBank", { keyPath: "id" });
        }
        // Poore-syllabus mock test attempts ka history.
        if (!db.objectStoreNames.contains("mockTestHistory")) {
          db.createObjectStore("mockTestHistory", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

// ---------- MCQ offline cache helpers ----------

export interface CachedMCQQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation?: string;
}

interface MCQTopicCacheRow {
  topicId: string;
  questions: CachedMCQQuestion[];
  syncedAt: number;
}

export interface MCQSyncMeta {
  key: "mcqSync";
  lastFullSyncAt?: number; // epoch ms — jab poora Supabase data ek baar download ho gaya
  totalTopics?: number;
  totalQuestions?: number;
}

export async function getCachedMCQ(topicId: string): Promise<CachedMCQQuestion[] | undefined> {
  const db = await getDB();
  const row = (await db.get("mcqCache", topicId)) as MCQTopicCacheRow | undefined;
  return row?.questions;
}

export async function putCachedMCQ(topicId: string, questions: CachedMCQQuestion[]) {
  const db = await getDB();
  const row: MCQTopicCacheRow = { topicId, questions, syncedAt: Date.now() };
  await db.put("mcqCache", row);
}

export async function putCachedMCQBulk(byTopic: Record<string, CachedMCQQuestion[]>) {
  const db = await getDB();
  const tx = db.transaction("mcqCache", "readwrite");
  const now = Date.now();
  await Promise.all(
    Object.entries(byTopic).map(([topicId, questions]) =>
      tx.objectStore("mcqCache").put({ topicId, questions, syncedAt: now } as MCQTopicCacheRow)
    )
  );
  await tx.done;
}

export async function getMCQSyncMeta(): Promise<MCQSyncMeta | undefined> {
  const db = await getDB();
  return (await db.get("mcqSyncMeta", "mcqSync")) as MCQSyncMeta | undefined;
}

export async function setMCQSyncMeta(meta: Omit<MCQSyncMeta, "key">) {
  const db = await getDB();
  await db.put("mcqSyncMeta", { key: "mcqSync", ...meta } as MCQSyncMeta);
}

/** Saare topics ke cached MCQ ek flat list me — Mock Test mode ke liye (random N sawaal chunne ke liye). */
export async function getAllCachedMCQFlat(): Promise<Array<CachedMCQQuestion & { topicId: string }>> {
  const db = await getDB();
  const rows = (await db.getAll("mcqCache")) as MCQTopicCacheRow[];
  const out: Array<CachedMCQQuestion & { topicId: string }> = [];
  for (const row of rows) {
    for (const q of row.questions) out.push({ ...q, topicId: row.topicId });
  }
  return out;
}

// ---------- Study content (key points + detailed article) offline cache helpers ----------

export interface CachedTopicContent {
  topicId: string;
  keyPoints: string[];
  detailedContent?: string;
  updatedAt?: string;
}

export interface TopicContentSyncMeta {
  key: "topicContentSync";
  lastFullSyncAt?: number; // epoch ms — jab poora Supabase data ek baar download ho gaya
  totalTopics?: number;
}

export async function getAllCachedTopicContent(): Promise<Record<string, CachedTopicContent>> {
  const db = await getDB();
  const rows = (await db.getAll("topicContentCache")) as CachedTopicContent[];
  const map: Record<string, CachedTopicContent> = {};
  for (const row of rows) map[row.topicId] = row;
  return map;
}

export async function putCachedTopicContentBulk(byTopic: Record<string, CachedTopicContent>) {
  const db = await getDB();
  const tx = db.transaction("topicContentCache", "readwrite");
  await Promise.all(
    Object.values(byTopic).map((row) => tx.objectStore("topicContentCache").put(row))
  );
  await tx.done;
}

export async function getTopicContentSyncMeta(): Promise<TopicContentSyncMeta | undefined> {
  const db = await getDB();
  return (await db.get("topicContentSyncMeta", "topicContentSync")) as TopicContentSyncMeta | undefined;
}

export async function setTopicContentSyncMeta(meta: Omit<TopicContentSyncMeta, "key">) {
  const db = await getDB();
  await db.put("topicContentSyncMeta", { key: "topicContentSync", ...meta } as TopicContentSyncMeta);
}

// ---------- MCQ performance stats (naya — auto weak-topic detection ke liye) ----------

export interface MCQStatsRow {
  topicId: string;
  attempts: number; // kitni baar test submit kiya
  totalQuestions: number; // pichhle attempt ke questions
  correctCount: number; // pichhle attempt ke sahi jawab
  bestAccuracyPct: number; // ab tak ka best score %
  lastAccuracyPct: number; // sabse recent attempt ka score %
  lastAttemptAt: number; // epoch ms
}

export async function getMcqStats(topicId: string): Promise<MCQStatsRow | undefined> {
  const db = await getDB();
  return (await db.get("mcqStats", topicId)) as MCQStatsRow | undefined;
}

export async function getAllMcqStats(): Promise<Record<string, MCQStatsRow>> {
  const db = await getDB();
  const rows = (await db.getAll("mcqStats")) as MCQStatsRow[];
  const map: Record<string, MCQStatsRow> = {};
  for (const r of rows) map[r.topicId] = r;
  return map;
}

/** Test submit hone par ek attempt record karta hai (running best/last accuracy update karte hue). */
export async function recordMcqAttempt(topicId: string, correctCount: number, totalQuestions: number) {
  if (totalQuestions <= 0) return;
  const db = await getDB();
  const existing = (await db.get("mcqStats", topicId)) as MCQStatsRow | undefined;
  const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
  const next: MCQStatsRow = {
    topicId,
    attempts: (existing?.attempts ?? 0) + 1,
    totalQuestions,
    correctCount,
    bestAccuracyPct: Math.max(existing?.bestAccuracyPct ?? 0, accuracyPct),
    lastAccuracyPct: accuracyPct,
    lastAttemptAt: Date.now(),
  };
  await db.put("mcqStats", next);
  return next;
}

// ---------- Wrong-answer bank (naya) ----------

export interface WrongAnswerRow {
  id: string; // `${topicId}::${questionId}`
  topicId: string;
  questionId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  explanation?: string;
  timesWrong: number;
  lastWrongAt: number;
}

export async function upsertWrongAnswer(row: Omit<WrongAnswerRow, "timesWrong" | "lastWrongAt"> & { timesWrong?: number }) {
  const db = await getDB();
  const existing = (await db.get("wrongAnswerBank", row.id)) as WrongAnswerRow | undefined;
  const next: WrongAnswerRow = {
    ...row,
    timesWrong: (existing?.timesWrong ?? 0) + 1,
    lastWrongAt: Date.now(),
  };
  await db.put("wrongAnswerBank", next);
}

export async function removeWrongAnswer(id: string) {
  const db = await getDB();
  await db.delete("wrongAnswerBank", id);
}

export async function getAllWrongAnswers(): Promise<WrongAnswerRow[]> {
  const db = await getDB();
  return (await db.getAll("wrongAnswerBank")) as WrongAnswerRow[];
}

// ---------- Mock test history (naya) ----------

export interface MockTestAttempt {
  id: string;
  date: string; // YYYY-MM-DD
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number; // negative marking ke baad final score
  durationSeconds: number;
  createdAt: number;
}

export async function putMockTestAttempt(attempt: MockTestAttempt) {
  const db = await getDB();
  await db.put("mockTestHistory", attempt);
}

export async function getAllMockTestAttempts(): Promise<MockTestAttempt[]> {
  const db = await getDB();
  const rows = (await db.getAll("mockTestHistory")) as MockTestAttempt[];
  return rows.sort((a, b) => b.createdAt - a.createdAt);
}

export const DEFAULT_SETTINGS: Settings = {
  key: "settings",
  dailyTargetTopics: 3,
  dailyTargetMinutes: 120,
  notificationTime: "09:00",
  notificationsEnabled: false,
  theme: "system",
  examDate: undefined,
  audioUnlocked: false,
  lastMotivationShownDate: undefined,
};

export async function loadAll() {
  const db = await getDB();
  const [topicStates, settingsRow, dailyLog, streakRow, timetable, personalReminders] = await Promise.all([
    db.getAll("topicState") as Promise<TopicState[]>,
    db.get("settings", "settings") as Promise<Settings | undefined>,
    db.getAll("dailyLog") as Promise<DailyLogEntry[]>,
    db.get("streak", "streak") as Promise<StreakState | undefined>,
    db.getAll("timetable") as Promise<TimetableItem[]>,
    db.getAll("personalReminders") as Promise<PersonalReminder[]>,
  ]);
  return {
    topicStates,
    settings: settingsRow ?? DEFAULT_SETTINGS,
    dailyLog,
    streak: streakRow ?? { key: "streak" as const, current: 0, longest: 0 },
    timetable,
    personalReminders,
  };
}

export async function putTopicState(state: TopicState) {
  const db = await getDB();
  await db.put("topicState", state);
}

export async function putSettings(settings: Settings) {
  const db = await getDB();
  await db.put("settings", settings);
}

export async function putStreak(streak: StreakState) {
  const db = await getDB();
  await db.put("streak", streak);
}

export async function putDailyLog(entry: DailyLogEntry) {
  const db = await getDB();
  await db.put("dailyLog", entry);
}

export async function putTimetableItem(item: TimetableItem) {
  const db = await getDB();
  await db.put("timetable", item);
}

export async function deleteTimetableItem(id: string) {
  const db = await getDB();
  await db.delete("timetable", id);
}

export async function putReminder(item: PersonalReminder) {
  const db = await getDB();
  await db.put("personalReminders", item);
}

export async function deleteReminder(id: string) {
  const db = await getDB();
  await db.delete("personalReminders", id);
}

export async function clearAll() {
  const db = await getDB();
  await Promise.all([
    db.clear("topicState"),
    db.clear("settings"),
    db.clear("dailyLog"),
    db.clear("streak"),
    db.clear("timetable"),
    db.clear("personalReminders"),
    db.clear("mcqCache"),
    db.clear("mcqSyncMeta"),
    db.clear("topicContentCache"),
    db.clear("topicContentSyncMeta"),
    db.clear("mcqStats"),
    db.clear("wrongAnswerBank"),
    db.clear("mockTestHistory"),
  ]);
}

export async function exportAll() {
  const data = await loadAll();
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

export async function importAll(data: Awaited<ReturnType<typeof exportAll>>) {
  await clearAll();
  const db = await getDB();
  const stores = ["topicState", "settings", "dailyLog", "streak", "timetable", "personalReminders"] as const;
  const tx = db.transaction(stores, "readwrite");
  await Promise.all([
    ...data.topicStates.map((t) => tx.objectStore("topicState").put(t)),
    tx.objectStore("settings").put(data.settings),
    ...data.dailyLog.map((d) => tx.objectStore("dailyLog").put(d)),
    tx.objectStore("streak").put(data.streak),
    ...(data.timetable ?? []).map((t) => tx.objectStore("timetable").put(t)),
    ...(data.personalReminders ?? []).map((r) => tx.objectStore("personalReminders").put(r)),
  ]);
  await tx.done;
}
