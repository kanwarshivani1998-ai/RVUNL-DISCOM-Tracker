import { useState } from "react";
import { Share2 } from "lucide-react";

interface Props {
  completed: number;
  total: number;
  streak: number;
  readinessScore: number;
}

/** Canvas par ek shareable progress card banata hai, phir Web Share API (ya WhatsApp fallback) se share karta hai. */
async function generateImage({ completed, total, streak, readinessScore }: Props): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#4f46e5");
  grad.addColorStop(1, "#7c3aed");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";

  ctx.font = "bold 56px sans-serif";
  ctx.fillText("RVUNL/DISCOM Tracker", 540, 140);

  ctx.font = "bold 200px sans-serif";
  ctx.fillText(`${readinessScore}%`, 540, 460);

  ctx.font = "42px sans-serif";
  ctx.fillText("परीक्षा की तैयारी", 540, 540);

  ctx.font = "bold 48px sans-serif";
  ctx.fillText(`✅ ${completed}/${total} टॉपिक्स पूर्ण`, 540, 720);
  ctx.fillText(`🔥 ${streak} दिन की स्ट्रीक`, 540, 800);

  ctx.font = "32px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText("#RVUNLDiscomTracker", 540, 980);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

export function ShareProgressCard(props: Props) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generateImage(props);
      if (!blob) return;
      const file = new File([blob], "progress.png", { type: "image/png" });
      const text = `मैंने RVUNL/DISCOM परीक्षा की तैयारी में ${props.completed}/${props.total} टॉपिक्स पूरे कर लिए हैं और ${props.streak} दिन की स्ट्रीक बना रखी है! 🔥`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, title: "मेरी प्रगति" });
      } else {
        // Fallback: image download karo + WhatsApp text-share link kholo
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "raj-setu-progress.png";
        a.click();
        URL.revokeObjectURL(url);
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={busy}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2.5 text-sm font-semibold touch-tap disabled:opacity-60"
    >
      <Share2 className="h-4 w-4" />
      {busy ? "तैयार हो रहा है…" : "प्रगति शेयर करें (WhatsApp)"}
    </button>
  );
}
