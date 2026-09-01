// src/components/TypingTest.tsx
// Core Typing Master engine.
//
// Strict constraints honoured:
//  - No <input>/<textarea>/contenteditable anywhere — all input comes from a
//    global window "keydown" listener, so no virtual/on-screen keyboard ever pops up.
//  - Locks to landscape via @capacitor/screen-orientation on native, with a
//    CSS "please rotate" fallback for web/portrait testing.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";
import { ChevronLeft, RotateCcw, SkipForward, Smartphone } from "lucide-react";
import { TypingKeyboardSVG } from "@/components/TypingKeyboardSVG";
import {
  SAMPLE_PARAGRAPHS,
  computeStats,
  getFingersForChar,
  type FingerId,
  type TypingStats,
} from "@/lib/typingKeyboardData";

interface TypedChar {
  char: string;
  correct: boolean;
}

interface Feedback {
  type: "correct" | "wrong";
  keyId: string | null;
  fingers: FingerId[];
  tick: number;
}

const FEEDBACK_MS = 170;

export function TypingTest() {
  const router = useRouter();

  const [paragraphIndex, setParagraphIndex] = useState(0);
  const paragraph = SAMPLE_PARAGRAPHS[paragraphIndex];

  const [typed, setTyped] = useState<TypedChar[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [finished, setFinished] = useState(false);
  const [liveTick, setLiveTick] = useState(0); // forces re-render every 500ms while typing

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animTickRef = useRef(0);

  const index = typed.length;

  // ---------------------------------------------------------------------
  // Landscape lock (native) + portrait fallback (web) on mount/unmount
  // ---------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/screen-orientation")
        .then(({ ScreenOrientation }) => {
          if (!cancelled) ScreenOrientation.lock({ orientation: "landscape" }).catch(() => {});
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
      if (Capacitor.isNativePlatform()) {
        import("@capacitor/screen-orientation")
          .then(({ ScreenOrientation }) => ScreenOrientation.unlock().catch(() => {}))
          .catch(() => {});
      }
    };
  }, []);

  // ---------------------------------------------------------------------
  // Live WPM ticker while the test is running
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (finished || !startTimeRef.current) return;
    const id = setInterval(() => setLiveTick((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [finished, startTimeRef.current]);

  const resetTest = useCallback((nextIndex?: number) => {
    setTyped([]);
    setFeedback(null);
    setFinished(false);
    startTimeRef.current = null;
    endTimeRef.current = null;
    if (typeof nextIndex === "number") setParagraphIndex(nextIndex);
  }, []);

  // ---------------------------------------------------------------------
  // Physical keyboard capture — the whole point of this component.
  // ---------------------------------------------------------------------
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (finished) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        setTyped((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        return;
      }

      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        return;
      }

      // Ignore pure modifier presses — we only care about characters they produce.
      if (e.key.length !== 1) return;

      e.preventDefault();

      if (!startTimeRef.current) startTimeRef.current = Date.now();

      setTyped((prev) => {
        if (prev.length >= paragraph.length) return prev;
        const expected = paragraph[prev.length];
        const correct = e.key === expected;
        const { fingers, keyId } = getFingersForChar(expected);

        animTickRef.current += 1;
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        setFeedback({ type: correct ? "correct" : "wrong", keyId, fingers, tick: animTickRef.current });
        feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), FEEDBACK_MS);

        const next = [...prev, { char: e.key, correct }];
        if (next.length === paragraph.length) {
          endTimeRef.current = Date.now();
          setFinished(true);
        }
        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paragraph, finished]);

  useEffect(() => () => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
  }, []);

  // ---------------------------------------------------------------------
  // Derived stats
  // ---------------------------------------------------------------------
  const stats: TypingStats = useMemo(() => {
    const errors = typed.filter((t) => !t.correct).length;
    const elapsed = startTimeRef.current
      ? (endTimeRef.current ?? Date.now()) - startTimeRef.current
      : 0;
    return computeStats(typed.length, errors, elapsed);
    // liveTick forces a recompute every 500ms while typing so WPM ticks up live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed, finished, liveTick]);

  // ---------------------------------------------------------------------
  // Next-character guidance for the keyboard/hands
  // ---------------------------------------------------------------------
  const nextChar = index < paragraph.length ? paragraph[index] : null;
  const guidance = useMemo(() => (nextChar ? getFingersForChar(nextChar) : { fingers: [], keyId: null }), [nextChar]);

  const tapFingers = feedback?.type === "correct" ? feedback.fingers : [];
  const tapKeyId = feedback?.type === "correct" ? feedback.keyId : null;
  const errorFingers = feedback?.type === "wrong" ? feedback.fingers : [];
  const errorKeyId = feedback?.type === "wrong" ? feedback.keyId : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Portrait fallback — hides everything else until the device is rotated */}
      <div className="rotate-hint">
        <Smartphone className="h-10 w-10 rotate-90" style={{ color: "var(--color-primary)" }} />
        <p className="mt-3 text-sm font-bold">कृपया फ़ोन को landscape mode में घुमाएं</p>
        <p className="mt-1 text-xs text-muted-foreground">Typing Master सिर्फ़ landscape में चलता है</p>
      </div>

      <div className="typing-content flex min-h-0 flex-1 flex-col px-3 py-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.history.back()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted touch-tap"
            aria-label="वापस"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-bold">टाइपिंग मास्टर</h1>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => resetTest()}
              className="flex h-9 items-center gap-1 rounded-full bg-muted px-3 text-xs font-bold touch-tap"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restart
            </button>
            <button
              onClick={() => resetTest((paragraphIndex + 1) % SAMPLE_PARAGRAPHS.length)}
              className="flex h-9 items-center gap-1 rounded-full bg-muted px-3 text-xs font-bold touch-tap"
            >
              <SkipForward className="h-3.5 w-3.5" /> Next
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <StatCard label="Gross WPM" value={stats.grossWpm.toFixed(1)} />
          <StatCard label="Net WPM" value={stats.netWpm.toFixed(1)} accent />
          <StatCard label="Accuracy" value={`${stats.accuracy.toFixed(1)}%`} />
        </div>

        {/* Text display */}
        <div className="card-surface mt-2 flex-1 overflow-y-auto p-3">
          <p className="font-mono text-[15px] leading-8 tracking-wide">
            {paragraph.split("").map((ch, i) => {
              const t = typed[i];
              let cls = "text-muted-foreground";
              if (t) {
                cls = t.correct
                  ? "text-[var(--color-success,#22c55e)] bg-[var(--color-success,#22c55e)]/10"
                  : "text-destructive bg-destructive/10 underline decoration-destructive decoration-2 underline-offset-2";
              } else if (i === index) {
                cls = "bg-primary/15 border-b-2 border-primary text-foreground";
              }
              return (
                <span key={i} className={`rounded-sm ${cls}`}>
                  {ch === " " ? "\u00A0" : ch}
                </span>
              );
            })}
          </p>
        </div>

        {/* Keyboard + hands */}
        <div className="mt-2 shrink-0" style={{ height: "38%" }}>
          <TypingKeyboardSVG
            activeFingers={guidance.fingers}
            activeKeyId={guidance.keyId}
            tapFingers={tapFingers}
            tapKeyId={tapKeyId}
            errorFingers={errorFingers}
            errorKeyId={errorKeyId}
            animTick={feedback?.tick ?? 0}
          />
        </div>
      </div>

      {/* Finish overlay */}
      {finished && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="card-surface w-full max-w-xs p-5 text-center">
            <h2 className="text-base font-bold">पैराग्राफ़ पूरा हुआ 🎉</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ResultStat label="Gross WPM" value={stats.grossWpm.toFixed(1)} />
              <ResultStat label="Net WPM" value={stats.netWpm.toFixed(1)} />
              <ResultStat label="Accuracy" value={`${stats.accuracy.toFixed(1)}%`} />
              <ResultStat label="Errors" value={String(stats.errors)} />
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => resetTest()}
                className="flex-1 rounded-xl border border-input py-2.5 text-sm font-bold touch-tap"
              >
                दोबारा
              </button>
              <button
                onClick={() => resetTest((paragraphIndex + 1) % SAMPLE_PARAGRAPHS.length)}
                className="gradient-primary flex-1 rounded-xl py-2.5 text-sm font-bold touch-tap"
              >
                अगला
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-surface px-2 py-1.5 text-center">
      <div className={`text-lg font-bold leading-none ${accent ? "text-primary" : ""}`}>{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2">
      <div className="text-lg font-bold leading-none text-primary">{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
