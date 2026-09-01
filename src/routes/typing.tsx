// src/routes/typing.tsx
import { createFileRoute } from "@tanstack/react-router";
import { TypingTest } from "@/components/TypingTest";

export const Route = createFileRoute("/typing")({
  head: () => ({
    meta: [
      { title: "टाइपिंग मास्टर" },
      { name: "description", content: "OTG keyboard से practice करें — LDC/RVUNL typing test standard के अनुसार Gross/Net WPM और Accuracy." },
    ],
  }),
  component: TypingTest,
});
