import { useEffect, useRef, useState } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { getAllCachedMCQFlat, putMockTestAttempt, type CachedMCQQuestion } from "@/lib/db/db";

type QuestionWithTopic = CachedMCQQuestion & { topicId: string };

interface Props {
  questionCount: number; // 25 / 50 / 100
  onFinish: () => void;
}

// RVUNL/DISCOM me negative marking ka exact pattern official notification se confirm kar lena —
// yahan standard 1/3rd negative marking use ki hai (badalna ho to yahi constant change karo).
const NEGATIVE_MARKING_FRACTION = 1 / 3;
const SECONDS_PER_QUESTION = 60; // ~1 min per question, adjust as needed

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function MockTest({ questionCount, onFinish }: Props) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionWithTopic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const startedAtRef = useRef<number>(0);
  const submittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const all = await getAllCachedMCQFlat();
      const picked = shuffle(all).slice(0, questionCount);
      setQuestions(picked);
      setSecondsLeft(picked.length * SECONDS_PER_QUESTION);
      startedAtRef.current = Date.now();
      setLoading(false);
    })();
  }, [questionCount]);

  useEffect(() => {
    if (loading || submitted || questions.length === 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, submitted, questions.length]);

  const handleSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans === undefined) skipped++;
      else if (ans === q.correct_option) correct++;
      else wrong++;
    });
    const score = Math.round((correct - wrong * NEGATIVE_MARKING_FRACTION) * 100) / 100;
    const durationSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);

    await putMockTestAttempt({
      id: crypto.randomUUID(),
      date: new Date().toISOString().slice(0, 10),
      totalQuestions: questions.length,
      correct, wrong, skipped, score,
      durationSeconds,
      createdAt: Date.now(),
    });
  };

  if (loading) return <div className="py-10 text-center text-sm text-muted-foreground">सवाल तैयार हो रहे हैं…</div>;

  if (questions.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-2 p-6 text-center">
        <AlertCircle className="h-6 w-6 text-amber-500" />
        <p className="text-sm text-muted-foreground">
          अभी कोई MCQ cache में नहीं है। पहले कुछ topics के MCQ टेस्ट खोलें (ताकि वो cache हो जाएँ), फिर Mock Test try करें।
        </p>
        <button onClick={onFinish} className="mt-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">वापस जाएँ</button>
      </div>
    );
  }

  if (submitted) {
    let correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans === undefined) skipped++;
      else if (ans === q.correct_option) correct++;
      else wrong++;
    });
    const score = Math.round((correct - wrong * NEGATIVE_MARKING_FRACTION) * 100) / 100;

    return (
      <div className="card-surface space-y-3 p-4 text-center">
        <h3 className="text-lg font-bold">मॉक टेस्ट पूरा हुआ! 🎯</h3>
        <div className="text-3xl font-black text-primary">{score}</div>
        <p className="text-xs text-muted-foreground">कुल {questions.length} सवाल (नेगेटिव मार्किंग -1/3 शामिल)</p>
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
          <div className="rounded-lg bg-emerald-500/10 p-2 font-semibold text-emerald-600">{correct} सही</div>
          <div className="rounded-lg bg-rose-500/10 p-2 font-semibold text-rose-600">{wrong} गलत</div>
          <div className="rounded-lg bg-muted p-2 font-semibold text-muted-foreground">{skipped} छूटे</div>
        </div>
        <button onClick={onFinish} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground touch-tap">
          ठीक है
        </button>
      </div>
    );
  }

  const q = questions[currentIndex];
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2">
        <span className="text-xs font-semibold">Q {currentIndex + 1} / {questions.length}</span>
        <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: secondsLeft < 60 ? "var(--color-hard)" : "var(--color-foreground)" }}>
          <Clock className="h-3.5 w-3.5" /> {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="card-surface p-4">
        <p className="mb-3 text-sm font-semibold leading-relaxed">{q.question_text}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers((prev) => ({ ...prev, [currentIndex]: idx }))}
              className={`w-full rounded-lg border p-2.5 text-left text-sm font-medium touch-tap ${
                answers[currentIndex] === idx ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="flex-1 rounded-lg border border-input py-2.5 text-xs font-semibold disabled:opacity-40"
        >
          पिछला
        </button>
        {currentIndex === questions.length - 1 ? (
          <button onClick={handleSubmit} className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-xs font-bold text-white">
            सबमिट करें
          </button>
        ) : (
          <button onClick={() => setCurrentIndex((i) => i + 1)} className="flex-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-primary-foreground">
            अगला
          </button>
        )}
      </div>
    </div>
  );
}
