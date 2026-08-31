import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SYLLABUS, getAllTopics } from "@/lib/syllabus/syllabusData";
import { useTopicContentAll } from "@/lib/content/TopicContentContext";

export const Route = createFileRoute("/flashcards")({
  head: () => ({ meta: [{ title: "फ्लैशकार्ड्स" }, { name: "description", content: "मुख्य बिंदुओं से फ्लैशकार्ड रिवीजन।" }] }),
  component: FlashcardsPage,
});

interface Card { front: string; back: string; }

function FlashcardsPage() {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const { content } = useTopicContentAll();
  const allTopics = useMemo(() => getAllTopics(), []);

  const cards: Card[] = useMemo(() => {
    if (!subjectId) return [];
    const topicsInSubject = allTopics.filter((r) => r.subject.id === subjectId);
    const out: Card[] = [];
    for (const { topic } of topicsInSubject) {
      const kp = content[topic.id]?.keyPoints ?? [];
      kp.forEach((point) => out.push({ front: topic.title, back: point }));
    }
    return out;
  }, [subjectId, allTopics, content]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!subjectId) {
    return (
      <AppShell title="फ्लैशकार्ड्स" subtitle="विषय चुनें" back>
        <div className="space-y-2.5">
          {SYLLABUS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSubjectId(s.id); setIndex(0); setFlipped(false); }}
              className="card-surface flex w-full items-center gap-3 p-3 text-left touch-tap"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{s.name}</div>
                <div className="truncate text-xs text-muted-foreground">{s.hindiName}</div>
              </div>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  if (cards.length === 0) {
    return (
      <AppShell title="फ्लैशकार्ड्स" back action={<button onClick={() => setSubjectId(null)} className="text-xs font-semibold text-primary">बदलें</button>}>
        <p className="py-10 text-center text-sm text-muted-foreground">
          इस विषय के लिए अभी "मुख्य बिंदु" (key points) content sync नहीं हुआ है। पहले उन topics को खोलें ताकि content cache हो जाए।
        </p>
      </AppShell>
    );
  }

  const card = cards[index];

  const next = () => { setFlipped(false); setIndex((i) => Math.min(i + 1, cards.length - 1)); };
  const prev = () => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); };

  return (
    <AppShell title="फ्लैशकार्ड्स" subtitle={`${index + 1} / ${cards.length}`} back action={<button onClick={() => setSubjectId(null)} className="text-xs font-semibold text-primary">विषय बदलें</button>}>
      <div className="flex flex-col items-center gap-4">
        <div className="h-64 w-full" style={{ perspective: 1200 }} onClick={() => setFlipped((f) => !f)}>
          <motion.div
            className="relative h-full w-full cursor-pointer"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="card-surface absolute inset-0 grid place-items-center p-5 text-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <p className="text-base font-bold leading-snug">{card.front}</p>
            </div>
            <div
              className="card-surface absolute inset-0 grid place-items-center p-5 text-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "color-mix(in oklab, var(--color-primary) 10%, var(--color-card))" }}
            >
              <p className="text-sm leading-relaxed">{card.back}</p>
            </div>
          </motion.div>
        </div>
        <p className="text-xs text-muted-foreground">कार्ड पर टैप करके पलटें</p>

        <div className="flex w-full items-center justify-between gap-2">
          <button disabled={index === 0} onClick={prev} className="inline-flex items-center gap-1 rounded-lg border border-input px-4 py-2.5 text-xs font-semibold disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> पिछला
          </button>
          <button disabled={index === cards.length - 1} onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-40">
            अगला <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
