import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EXAM_SCHEME_META, EXAM_SCHEME_SECTIONS, SUBJECT_MARKS_DISTRIBUTION } from "@/lib/syllabus/examScheme";
import { FileText, HelpCircle, Award, Clock, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/exam-syllabus")({
  head: () => ({
    meta: [
      { title: "सिलेबस — RVUNL/DISCOM Tracker" },
      { name: "description", content: "RVUNL/DISCOM जूनियर असिस्टेंट / कमर्शियल असिस्टेंट-II — आधिकारिक परीक्षा स्कीम व पूर्ण पाठ्यक्रम।" },
    ],
  }),
  component: ExamSyllabusPage,
});

function ExamSyllabusPage() {
  return (
    <AppShell title="सिलेबस" subtitle={EXAM_SCHEME_META.examName}>
      {/* Board + exam header */}
      <section className="card-surface relative overflow-hidden p-5">
        <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
        <div className="relative space-y-1">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg gradient-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold leading-tight">{EXAM_SCHEME_META.board}</h2>
              <p className="text-xs text-muted-foreground">{EXAM_SCHEME_META.examName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Scheme stats */}
      <section className="mt-3 grid grid-cols-3 gap-3">
        <SchemeStat icon={HelpCircle} label="प्रश्न" value={String(EXAM_SCHEME_META.totalQuestions)} />
        <SchemeStat icon={Award} label="कुल अंक" value={String(EXAM_SCHEME_META.totalMarks)} />
        <SchemeStat icon={Clock} label="समय" value={EXAM_SCHEME_META.duration} />
      </section>

      {/* Subject-wise marks distribution */}
      <section className="mt-3">
        <h3 className="mb-2 text-sm font-bold">विषयवार अंक विभाजन (कुल 140 प्रश्न / 200 अंक)</h3>
        <div className="card-surface overflow-hidden p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 text-left font-bold">विषय</th>
                <th className="px-3 py-2 text-center font-bold">प्रश्न</th>
                <th className="px-3 py-2 text-center font-bold">अंक</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECT_MARKS_DISTRIBUTION.map((row, i) => (
                <tr key={i} className={i !== SUBJECT_MARKS_DISTRIBUTION.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-3 py-2 text-muted-foreground">{row.subject}</td>
                  <td className="px-3 py-2 text-center tabular-nums text-muted-foreground">{row.questions}</td>
                  <td className="px-3 py-2 text-center tabular-nums font-semibold">{row.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Notes */}
      <section className="mt-3 card-surface p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-bold">महत्वपूर्ण नोट</h3>
        </div>
        <ul className="space-y-1.5">
          {EXAM_SCHEME_META.notes.map((n, i) => (
            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 shrink-0 font-bold text-primary">{i + 1}.</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Syllabus by subject */}
      <section className="mt-4">
        <h3 className="mb-2 text-sm font-bold">पाठ्यक्रम विवरण — विषयवार</h3>
        <div className="card-surface px-3">
          <Accordion type="multiple" className="w-full">
            {EXAM_SCHEME_SECTIONS.map((sec, idx) => (
              <AccordionItem key={sec.id} value={sec.id} className={idx === EXAM_SCHEME_SECTIONS.length - 1 ? "border-b-0" : ""}>
                <AccordionTrigger className="text-sm">{sec.title}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pb-1">
                    {sec.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </AppShell>
  );
}

function SchemeStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="card-surface p-3 text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg gradient-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-sm font-black tabular-nums leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
