import { useMemo } from "react";
import type { DailyLogEntry } from "@/lib/db/db";

interface Props {
  dailyLog: DailyLogEntry[];
  weeks?: number; // kitne hafte dikhane hain (default 13 ≈ ~3 mahine)
}

function levelFor(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes < 30) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "var(--color-muted)",
  "color-mix(in oklab, var(--color-primary) 25%, var(--color-muted))",
  "color-mix(in oklab, var(--color-primary) 50%, var(--color-muted))",
  "color-mix(in oklab, var(--color-primary) 75%, var(--color-muted))",
  "var(--color-primary)",
];

export function StudyHeatmap({ dailyLog, weeks = 13 }: Props) {
  const days = weeks * 7;

  const cells = useMemo(() => {
    const map = new Map(dailyLog.map((d) => [d.date, d.minutes]));
    const out: { date: string; minutes: number }[] = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, minutes: map.get(key) ?? 0 });
    }
    return out;
  }, [dailyLog, days]);

  // Columns = weeks, rows = 7 din (Sun..Sat) — grid ko week-column-major order me banate hain.
  const columns: { date: string; minutes: number }[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  const totalMinutes = dailyLog.reduce((s, d) => s + d.minutes, 0);
  const activeDays = dailyLog.filter((d) => d.minutes > 0).length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{activeDays} दिन पढ़ाई की, कुल {Math.round(totalMinutes / 60)} घंटे</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((c) => (
              <div
                key={c.date}
                title={`${c.date} — ${c.minutes} मिनट`}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ background: LEVEL_COLORS[levelFor(c.minutes)] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        कम
        {LEVEL_COLORS.map((c, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} />
        ))}
        ज़्यादा
      </div>
    </div>
  );
}
