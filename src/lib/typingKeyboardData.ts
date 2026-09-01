// src/lib/typingKeyboardData.ts
// Keyboard layout + touch-typing finger map + sample paragraphs for the Typing Master feature.
// Pure data/logic module — no React here, so it's easy to unit-test independently.

export type FingerId =
  | "L-pinky"
  | "L-ring"
  | "L-middle"
  | "L-index"
  | "L-thumb"
  | "R-thumb"
  | "R-index"
  | "R-middle"
  | "R-ring"
  | "R-pinky";

export interface KeyDef {
  /** Stable id, also used to match physical key presses where possible. */
  id: string;
  /** Base (unshifted) character shown/produced by this key. Empty for Space. */
  label: string;
  /** Shifted character, if any (e.g. "1" -> "!"). */
  shiftLabel?: string;
  /** Width of the key in "units" (1 unit = a standard letter key). */
  units: number;
  /** Finger responsible for this key per standard touch-typing technique. */
  finger: FingerId;
  /** Control/whitespace keys that aren't part of the printable char map. */
  special?: boolean;
}

export interface LayoutKey extends KeyDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Raw row definitions (QWERTY, US layout)
// ---------------------------------------------------------------------------

const ROW_NUMBERS: KeyDef[] = [
  { id: "`", label: "`", shiftLabel: "~", units: 1, finger: "L-pinky" },
  { id: "1", label: "1", shiftLabel: "!", units: 1, finger: "L-pinky" },
  { id: "2", label: "2", shiftLabel: "@", units: 1, finger: "L-ring" },
  { id: "3", label: "3", shiftLabel: "#", units: 1, finger: "L-middle" },
  { id: "4", label: "4", shiftLabel: "$", units: 1, finger: "L-index" },
  { id: "5", label: "5", shiftLabel: "%", units: 1, finger: "L-index" },
  { id: "6", label: "6", shiftLabel: "^", units: 1, finger: "R-index" },
  { id: "7", label: "7", shiftLabel: "&", units: 1, finger: "R-index" },
  { id: "8", label: "8", shiftLabel: "*", units: 1, finger: "R-middle" },
  { id: "9", label: "9", shiftLabel: "(", units: 1, finger: "R-ring" },
  { id: "0", label: "0", shiftLabel: ")", units: 1, finger: "R-pinky" },
  { id: "-", label: "-", shiftLabel: "_", units: 1, finger: "R-pinky" },
  { id: "=", label: "=", shiftLabel: "+", units: 1, finger: "R-pinky" },
  { id: "Backspace", label: "⌫", units: 2, finger: "R-pinky", special: true },
];

const ROW_TOP: KeyDef[] = [
  { id: "Tab", label: "Tab", units: 1.5, finger: "L-pinky", special: true },
  { id: "q", label: "q", units: 1, finger: "L-pinky" },
  { id: "w", label: "w", units: 1, finger: "L-ring" },
  { id: "e", label: "e", units: 1, finger: "L-middle" },
  { id: "r", label: "r", units: 1, finger: "L-index" },
  { id: "t", label: "t", units: 1, finger: "L-index" },
  { id: "y", label: "y", units: 1, finger: "R-index" },
  { id: "u", label: "u", units: 1, finger: "R-index" },
  { id: "i", label: "i", units: 1, finger: "R-middle" },
  { id: "o", label: "o", units: 1, finger: "R-ring" },
  { id: "p", label: "p", units: 1, finger: "R-pinky" },
  { id: "[", label: "[", shiftLabel: "{", units: 1, finger: "R-pinky" },
  { id: "]", label: "]", shiftLabel: "}", units: 1, finger: "R-pinky" },
  { id: "\\", label: "\\", shiftLabel: "|", units: 1.5, finger: "R-pinky" },
];

const ROW_HOME: KeyDef[] = [
  { id: "CapsLock", label: "Caps", units: 1.75, finger: "L-pinky", special: true },
  { id: "a", label: "a", units: 1, finger: "L-pinky" },
  { id: "s", label: "s", units: 1, finger: "L-ring" },
  { id: "d", label: "d", units: 1, finger: "L-middle" },
  { id: "f", label: "f", units: 1, finger: "L-index" },
  { id: "g", label: "g", units: 1, finger: "L-index" },
  { id: "h", label: "h", units: 1, finger: "R-index" },
  { id: "j", label: "j", units: 1, finger: "R-index" },
  { id: "k", label: "k", units: 1, finger: "R-middle" },
  { id: "l", label: "l", units: 1, finger: "R-ring" },
  { id: ";", label: ";", shiftLabel: ":", units: 1, finger: "R-pinky" },
  { id: "'", label: "'", shiftLabel: '"', units: 1, finger: "R-pinky" },
  { id: "Enter", label: "Enter", units: 2.25, finger: "R-pinky", special: true },
];

const ROW_BOTTOM: KeyDef[] = [
  { id: "ShiftLeft", label: "Shift", units: 2.25, finger: "L-pinky", special: true },
  { id: "z", label: "z", units: 1, finger: "L-pinky" },
  { id: "x", label: "x", units: 1, finger: "L-ring" },
  { id: "c", label: "c", units: 1, finger: "L-middle" },
  { id: "v", label: "v", units: 1, finger: "L-index" },
  { id: "b", label: "b", units: 1, finger: "L-index" },
  { id: "n", label: "n", units: 1, finger: "R-index" },
  { id: "m", label: "m", units: 1, finger: "R-index" },
  { id: ",", label: ",", shiftLabel: "<", units: 1, finger: "R-middle" },
  { id: ".", label: ".", shiftLabel: ">", units: 1, finger: "R-ring" },
  { id: "/", label: "/", shiftLabel: "?", units: 1, finger: "R-pinky" },
  { id: "ShiftRight", label: "Shift", units: 2.75, finger: "R-pinky", special: true },
];

const ROW_SPACE: KeyDef[] = [{ id: "Space", label: "", units: 6.25, finger: "L-thumb", special: true }];

const RAW_ROWS: KeyDef[][] = [ROW_NUMBERS, ROW_TOP, ROW_HOME, ROW_BOTTOM, ROW_SPACE];

// ---------------------------------------------------------------------------
// Layout geometry — computed once at module load
// ---------------------------------------------------------------------------

const UNIT = 46;
const GAP = 5;
const KEY_H = 42;
const ROW_GAP = 7;
const FULL_ROW_UNITS = 15; // rows 0-3 all add up to 15 units

function layoutRows(rows: KeyDef[][]): LayoutKey[][] {
  return rows.map((row, rowIndex) => {
    const rowUnits = row.reduce((sum, k) => sum + k.units, 0);
    const offsetUnits = rowIndex === 4 ? (FULL_ROW_UNITS - rowUnits) / 2 : 0;
    let cursor = offsetUnits * UNIT;
    const y = rowIndex * (KEY_H + ROW_GAP);
    return row.map((key) => {
      const x = cursor + GAP / 2;
      const w = key.units * UNIT - GAP;
      cursor += key.units * UNIT;
      return { ...key, x, y, w, h: KEY_H };
    });
  });
}

export const KEY_ROWS: LayoutKey[][] = layoutRows(RAW_ROWS);
export const ALL_KEYS: LayoutKey[] = KEY_ROWS.flat();

export const KEYBOARD_WIDTH = FULL_ROW_UNITS * UNIT;
export const KEYBOARD_HEIGHT = 5 * (KEY_H + ROW_GAP) - ROW_GAP;

export function getKeyById(id: string): LayoutKey | undefined {
  return ALL_KEYS.find((k) => k.id === id);
}

// Home-row anchor keys per finger, used to position the resting hand overlay.
export const HOME_KEY_FOR_FINGER: Record<Exclude<FingerId, "L-thumb" | "R-thumb">, string> = {
  "L-pinky": "a",
  "L-ring": "s",
  "L-middle": "d",
  "L-index": "f",
  "R-index": "j",
  "R-middle": "k",
  "R-ring": "l",
  "R-pinky": ";",
};

// ---------------------------------------------------------------------------
// Character -> finger(s) resolution
// ---------------------------------------------------------------------------

const KEY_BY_CHAR = new Map<string, LayoutKey>();
for (const key of ALL_KEYS) {
  if (key.special) continue;
  if (key.label) KEY_BY_CHAR.set(key.label, key);
  if (key.shiftLabel) KEY_BY_CHAR.set(key.shiftLabel, key);
}

export interface CharFingerResult {
  /** One finger normally; two when Shift is required (shift-finger, letter-finger). */
  fingers: FingerId[];
  /** The key id that should be visually highlighted, if any. */
  keyId: string | null;
  /** Whether producing this char requires holding Shift. */
  needsShift: boolean;
}

const EMPTY_RESULT: CharFingerResult = { fingers: [], keyId: null, needsShift: false };

export function getFingersForChar(char: string): CharFingerResult {
  if (char === " ") {
    return { fingers: ["L-thumb", "R-thumb"], keyId: "Space", needsShift: false };
  }

  let key = KEY_BY_CHAR.get(char);
  let matchedChar = char;
  if (!key && char.toLowerCase() !== char) {
    // Uppercase letter typed via Shift — look up the base (lowercase) key.
    key = KEY_BY_CHAR.get(char.toLowerCase());
    matchedChar = char.toLowerCase();
  }
  if (!key) return EMPTY_RESULT;

  const needsShift = matchedChar !== key.label;
  if (needsShift) {
    const shiftFinger: FingerId = key.finger.startsWith("L") ? "R-pinky" : "L-pinky";
    return { fingers: [shiftFinger, key.finger], keyId: key.id, needsShift: true };
  }
  return { fingers: [key.finger], keyId: key.id, needsShift: false };
}

// ---------------------------------------------------------------------------
// Sample paragraphs — Rajasthan govt / history / admin themed (LDC/RVUNL flavour)
// ---------------------------------------------------------------------------

export const SAMPLE_PARAGRAPHS: string[] = [
  "Rajasthan Vidyut Utpadan Nigam Limited is responsible for power generation across the state, operating thermal and renewable plants that supply electricity to millions of households. The Rajasthan Public Service Commission conducts recruitment examinations for various administrative posts, including the Lower Division Clerk position. Candidates must clear a written test, a typing test, and a document verification round.",
  "Rajasthan, the largest state of India by area, was formed on 30 March 1949 through the merger of princely states like Jaipur, Jodhpur, Udaipur, and Bikaner. The state capital, Jaipur, is famously known as the Pink City for its distinctive terracotta colored buildings. The administration is divided into several districts, each governed by a District Collector who oversees revenue and law matters.",
  "The Rajasthan Subordinate and Ministerial Services Selection Board conducts the Lower Division Clerk examination every few years to fill vacancies in various government departments. Applicants are tested on general knowledge, reasoning, mathematics, and computer skills. A strong typing speed is essential for clerical staff, since daily duties include drafting letters and preparing official reports for senior officers.",
  "Jaipur, Jodhpur, and Udaipur remain the most visited cities in Rajasthan, drawing tourists with their forts, palaces, and vibrant markets. The state government promotes heritage tourism while also investing in infrastructure, irrigation, and rural electrification projects. Government employees working in revenue and administrative departments must maintain accurate records and respond promptly to citizen applications.",
];

// ---------------------------------------------------------------------------
// Scoring helpers (LDC exam standard)
// ---------------------------------------------------------------------------

export interface TypingStats {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  totalTypedChars: number;
  errors: number;
  elapsedSeconds: number;
}

export function computeStats(totalTypedChars: number, errors: number, elapsedMs: number): TypingStats {
  const minutes = Math.max(elapsedMs / 60000, 1 / 60); // floor at 1 second to avoid divide-by-huge-number
  const grossWpm = totalTypedChars > 0 ? totalTypedChars / 5 / minutes : 0;
  const netWpm = totalTypedChars > 0 ? Math.max(0, (totalTypedChars - errors * 5) / 5 / minutes) : 0;
  const accuracy = totalTypedChars > 0 ? ((totalTypedChars - errors) / totalTypedChars) * 100 : 100;
  return {
    grossWpm: Math.round(grossWpm * 10) / 10,
    netWpm: Math.round(netWpm * 10) / 10,
    accuracy: Math.round(Math.max(0, accuracy) * 10) / 10,
    totalTypedChars,
    errors,
    elapsedSeconds: Math.round(elapsedMs / 1000),
  };
}
