import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { XCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAllWrongAnswers, removeWrongAnswer, type WrongAnswerRow } from "@/lib/mcq/wrongAnswerBank";
import { findTopic } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/wrong-answers")({
  head: () => ({ meta: [{ title: "गलत उत्तर बैंक" }, { name: "description", content: "जो सवाल गलत हुए, उन्हें दोबारा revise करें।" }] }),
  component: WrongAnswersPage,
});

function WrongAnswersPage() {
  const [items, setItems] = useState<WrongAnswerRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const load = async () => {
    const rows = await getAllWrongAnswers();
    rows.sort((a, b) => b.lastWrongAt - a.lastWrongAt);
    setItems(rows);
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  const handleGotIt = async (id: string) => {
    await removeWrongAnswer(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <AppShell title="गलत उत्तर बैंक" subtitle={`${items.length} सवाल दोबारा revise करने हैं`} back>
      {!loaded ? (
        <p className="py-8 text-center text-sm text-muted-foreground">लोड हो रहा है…</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">बधाई हो! अभी कोई गलत सवाल pending नहीं है। 🎉</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const ref = findTopic(item.topicId);
            const isRevealed = !!revealed[item.id];
            return (
              <div key={item.id} className="card-surface p-3">
                {ref && (
                  <div className="mb-1.5 truncate text-[11px] font-medium text-muted-foreground">
                    {ref.subject.name} › {ref.unit.title}
                  </div>
                )}
                <p className="text-sm font-semibold leading-snug">{item.questionText}</p>

                <div className="mt-2 space-y-1.5">
                  {item.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs ${
                        isRevealed && idx === item.correctOption
                          ? "border-emerald-500 bg-emerald-500/10 font-semibold text-emerald-600"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </div>
                  ))}
                </div>

                {isRevealed && item.explanation && (
                  <p className="mt-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">{item.explanation}</p>
                )}

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-500">
                    <XCircle className="h-3.5 w-3.5" /> {item.timesWrong}× गलत हुआ
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRevealed((p) => ({ ...p, [item.id]: !p[item.id] }))}
                      className="rounded-lg border border-input px-3 py-1.5 text-xs font-semibold touch-tap"
                    >
                      {isRevealed ? "छिपाएँ" : "सही उत्तर देखें"}
                    </button>
                    <button
                      onClick={() => handleGotIt(item.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground touch-tap"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> समझ गया
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
