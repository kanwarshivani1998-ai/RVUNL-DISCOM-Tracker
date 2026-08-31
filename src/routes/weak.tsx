import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { useData } from "@/lib/db/DataContext";
import { getAllTopics } from "@/lib/syllabus/syllabusData";
import { getAllMcqStats, isWeakByAccuracy, WEAK_ACCURACY_THRESHOLD_PCT, type MCQStatsRow } from "@/lib/mcq/mcqStats";

export const Route = createFileRoute("/weak")({
  head: () => ({ meta: [{ title: "कमजोर विषय" }, { name: "description", content: "कठिन चिह्नित व कम accuracy वाले टॉपिक्स।" }] }),
  component: WeakPage,
});

function WeakPage() {
  const { topicStates } = useData();
  const all = useMemo(() => getAllTopics(), []);
  const [mcqStats, setMcqStats] = useState<Record<string, MCQStatsRow>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllMcqStats().then((s) => {
      setMcqStats(s);
      setLoaded(true);
    });
  }, []);

  const manualItems = all.filter(({ topic }) => topicStates[topic.id]?.difficulty === "कठिन");

  const autoWeakItems = all.filter(({ topic }) => {
    if (topicStates[topic.id]?.difficulty === "कठिन") return false; // already manual list me hai
    return isWeakByAccuracy(mcqStats[topic.id]);
  });

  const totalCount = manualItems.length + autoWeakItems.length;

  return (
    <AppShell title="कमजोर विषय" subtitle={`${totalCount} टॉपिक्स`} back>
      <div className="space-y-5">
        <div>
          <h2 className="mb-2 text-xs font-bold text-muted-foreground">मैन्युअल रूप से "कठिन" चिह्नित</h2>
          <div className="space-y-2.5">
            {manualItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">अभी कोई कठिन टॉपिक चिह्नित नहीं है।</p>
            ) : manualItems.map(({ subject, unit, topic }) => (
              <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            MCQ Accuracy कम (&lt;{WEAK_ACCURACY_THRESHOLD_PCT}%) — Auto-Detected
          </h2>
          {!loaded ? (
            <p className="py-4 text-center text-sm text-muted-foreground">लोड हो रहा है…</p>
          ) : autoWeakItems.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">कोई topic कम accuracy वाला नहीं मिला। MCQ टेस्ट दो, यहाँ auto दिखेगा।</p>
          ) : (
            <div className="space-y-2.5">
              {autoWeakItems.map(({ subject, unit, topic }) => (
                <div key={topic.id} className="relative">
                  <span className="absolute -top-1.5 right-2 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {mcqStats[topic.id]?.lastAccuracyPct}% accuracy
                  </span>
                  <TopicCard topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
