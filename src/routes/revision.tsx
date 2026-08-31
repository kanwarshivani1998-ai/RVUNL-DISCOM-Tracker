import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RotateCcw, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";
import { isDueForReview, daysUntilDue } from "@/lib/revision/spacedRepetition";

export const Route = createFileRoute("/revision")({
  head: () => ({ meta: [{ title: "रिवीजन" }, { name: "description", content: "रिवीजन के लिए चिह्नित व due टॉपिक्स।" }] }),
  component: RevisionPage,
});

function RevisionPage() {
  const { topicStates, markReviewed } = useData();
  const all = useMemo(() => getAllTopics(), []);

  const manualItems = all.filter(({ topic }) => topicStates[topic.id]?.markedForRevision);

  const dueItems = all.filter(({ topic }) => isDueForReview(topicStates[topic.id]));

  return (
    <AppShell title="रिवीजन" subtitle={`${dueItems.length} आज due, ${manualItems.length} मैन्युअल`} back>
      <div className="space-y-5">
        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <CalendarClock className="h-3.5 w-3.5 text-primary" />
            आज रिवीजन के लिए due (Spaced Repetition)
          </h2>
          {dueItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">आज कोई रिवीजन due नहीं है। 🎉</p>
          ) : (
            <div className="space-y-2.5">
              {dueItems.map(({ subject, unit, topic }) => {
                const days = daysUntilDue(topicStates[topic.id]);
                return (
                  <div key={topic.id} className="card-surface p-3">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-medium text-muted-foreground">
                          {subject.name} › {unit.title}
                        </div>
                        <h3 className="text-[15px] font-semibold leading-snug">{topic.title}</h3>
                        {days != null && days < 0 && (
                          <span className="mt-1 inline-block rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-500">
                            {Math.abs(days)} दिन overdue
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => markReviewed(topic.id)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground touch-tap"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        रिवाइज़ किया
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-xs font-bold text-muted-foreground">मैन्युअल रूप से चिह्नित</h2>
          {manualItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">कोई टॉपिक रिवीजन के लिए चिह्नित नहीं है।</p>
          ) : (
            <div className="space-y-2.5">
              {manualItems.map(({ subject, unit, topic }) => (
                <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
