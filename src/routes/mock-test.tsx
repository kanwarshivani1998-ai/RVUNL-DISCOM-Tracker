import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MockTest } from "@/components/MockTest";
import { getAllMockTestAttempts, type MockTestAttempt } from "@/lib/db/db";

export const Route = createFileRoute("/mock-test")({
  head: () => ({ meta: [{ title: "मॉक टेस्ट" }, { name: "description", content: "पूरे सिलेबस से रैंडम मॉक टेस्ट, negative marking के साथ।" }] }),
  component: MockTestPage,
});

const OPTIONS = [25, 50, 100];

function MockTestPage() {
  const [count, setCount] = useState<number | null>(null);
  const [history, setHistory] = useState<MockTestAttempt[]>([]);

  useEffect(() => {
    if (count == null) {
      getAllMockTestAttempts().then(setHistory);
    }
  }, [count]);

  if (count != null) {
    return (
      <AppShell title="मॉक टेस्ट" subtitle={`${count} सवाल`} back>
        <MockTest questionCount={count} onFinish={() => setCount(null)} />
      </AppShell>
    );
  }

  return (
    <AppShell title="मॉक टेस्ट" subtitle="पूरे सिलेबस से रैंडम टेस्ट" back>
      <div className="space-y-4">
        <div className="card-surface p-4">
          <h2 className="mb-3 text-sm font-bold">कितने सवाल?</h2>
          <div className="grid grid-cols-3 gap-2">
            {OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className="rounded-xl border border-input py-3 text-sm font-bold touch-tap hover:border-primary hover:text-primary"
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            नोट: सिर्फ वही टॉपिक्स शामिल होंगे जिनके MCQ पहले से cache हैं (यानी जो टॉपिक कम से कम एक बार खोले जा चुके हैं)।
          </p>
        </div>

        {history.length > 0 && (
          <div className="card-surface p-4">
            <h2 className="mb-3 text-sm font-bold">पिछले attempts</h2>
            <div className="space-y-2">
              {history.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
                  <span className="text-muted-foreground">{a.date} · {a.totalQuestions} सवाल</span>
                  <span className="font-bold text-primary">{a.score} अंक</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
