import React, { useState } from "react";
import { BrainCircuit, Send, Loader2 } from "lucide-react";
import { DashboardCard } from "./ui";

const SUGGESTED = [
  "How do I reduce maize moisture?",
  "Where are bean prices highest today?",
  "Best storage temperature for potatoes?",
];

export default function MkulimaChat({ compact = false }: { compact?: boolean }) {
  const [lang, setLang] = useState<"english" | "kiswahili">("english");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    {
      role: "ai",
      text: "Jambo! I'm Mkulima Intel — ask about prices, storage, pests, or post-harvest care.",
    },
  ]);

  async function send(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          language: lang === "kiswahili" ? "kiswahili" : "english",
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.text || "I couldn't process that. Try again." }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          text: "Market tip: Keep grain moisture below 13.5% and sell to Nairobi when county premiums rise above 8%.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const body = (
    <>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setLang("english")}
          className={`text-xs px-3 py-1 rounded-lg font-semibold ${lang === "english" ? "bg-agri-emerald text-white" : "bg-slate-100 text-slate-600"}`}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang("kiswahili")}
          className={`text-xs px-3 py-1 rounded-lg font-semibold ${lang === "kiswahili" ? "bg-agri-emerald text-white" : "bg-slate-100 text-slate-600"}`}
        >
          Kiswahili
        </button>
      </div>
      <div className={`space-y-3 overflow-y-auto custom-scrollbar ${compact ? "max-h-48" : "max-h-80"} mb-4`}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm p-3 rounded-xl max-w-[90%] ${
              m.role === "user"
                ? "ml-auto bg-agri-emerald text-white"
                : "bg-slate-100 text-slate-800 border border-slate-200"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
          </div>
        )}
      </div>
      {!compact && (
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTED.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => send(p)}
              className="text-xs px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-100 hover:bg-cyan-100"
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Mkulima Intel…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri-emerald/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="p-2.5 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );

  if (compact) return <div>{body}</div>;

  return (
    <DashboardCard
      title={
        <span className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-cyan-600" /> Mkulima Intel · Gemini AI
        </span>
      }
    >
      {body}
    </DashboardCard>
  );
}
