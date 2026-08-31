import { Zap } from "lucide-react";
import { unlockAudio } from "@/lib/audio/audioContext";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const handleStart = async () => {
    try {
      await unlockAudio();
    } catch (e) {
      console.error("Audio unlock failed", e);
    }
    onStart();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-primary px-6 text-center text-primary-foreground">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white/10">
        <Zap className="h-8 w-8" style={{ color: "var(--color-accent)" }} />
      </div>
      <h1 className="mb-2 text-2xl font-bold tracking-tight">RVUNL/DISCOM जूनियर असिस्टेंट ट्रैकर</h1>
      <p className="mb-10 text-sm opacity-80">आपका व्यक्तिगत स्मार्ट टाइम-टेबल</p>
      <button
        onClick={handleStart}
        className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg transition-all active:scale-95 touch-tap"
      >
        आज की पढ़ाई शुरू करें
      </button>
    </div>
  );
}
