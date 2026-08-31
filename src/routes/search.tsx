import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X, Mic, MicOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TopicCard } from "@/components/TopicCard";
import { getAllTopics } from "@/lib/syllabus/syllabusData";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "खोजें — RVUNL/DISCOM Tracker" }, { name: "description", content: "विषय, यूनिट, टॉपिक व कीवर्ड से खोजें।" }] }),
  component: SearchPage,
});

// Web Speech API type nahi hoti standard TS lib me — safe fallback ke saath.
type SpeechRecognitionCtor = new () => any;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

function SearchPage() {
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const all = useMemo(() => getAllTopics(), []);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionCtor() != null);
  }, []);

  const startVoiceSearch = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognitionRef.current = recognition;
    recognition.lang = "hi-IN"; // Hindi voice input — अंग्रेज़ी शब्द भी अक्सर पहचान लेता है
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) setQ(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    setListening(true);
    recognition.start();
  };

  const stopVoiceSearch = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return all.filter(({ subject, unit, topic }) =>
      subject.name.toLowerCase().includes(query) ||
      subject.hindiName.includes(query) ||
      unit.title.toLowerCase().includes(query) ||
      topic.title.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [q, all]);

  return (
    <AppShell title="खोजें" subtitle="विषय, यूनिट, टॉपिक या कीवर्ड">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="यहाँ लिखें… जैसे History, संविधान"
          className="w-full rounded-xl border border-input bg-card py-3 pl-9 pr-20 text-sm outline-none focus:border-primary"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {q && (
            <button onClick={() => setQ("")} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground touch-tap" aria-label="साफ़ करें">
              <X className="h-4 w-4" />
            </button>
          )}
          {voiceSupported && (
            <button
              onClick={listening ? stopVoiceSearch : startVoiceSearch}
              className="grid h-8 w-8 place-items-center rounded-full touch-tap"
              style={listening ? { background: "color-mix(in oklab, var(--color-hard) 20%, transparent)", color: "var(--color-hard)" } : { color: "var(--color-muted-foreground)" }}
              aria-label={listening ? "सुनना बंद करें" : "बोलकर खोजें"}
            >
              {listening ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {listening && <p className="mt-2 text-center text-xs text-muted-foreground">🎤 सुन रहा हूँ… बोलिए</p>}

      <div className="mt-4 space-y-2.5">
        {q && results.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">कोई परिणाम नहीं मिला।</p>
        )}
        {!q && (
          <p className="py-8 text-center text-sm text-muted-foreground">खोजने के लिए कुछ लिखें या माइक दबाएँ।</p>
        )}
        {results.map(({ subject, unit, topic }) => (
          <TopicCard key={topic.id} topic={topic} contextLabel={`${subject.name} › ${unit.title}`} />
        ))}
      </div>
    </AppShell>
  );
}
