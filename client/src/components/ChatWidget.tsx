import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError } from "../lib/api";
import { btnPrimary, inputCls } from "./ui";

interface Msg {
  role: "user" | "ai" | "error";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy, open]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const message = text.trim();
    if (!message || busy) return;
    setText("");
    setMsgs((m) => [...m, { role: "user", text: message }]);
    setBusy(true);
    try {
      const { reply } = await api<{ reply: string }>("/ai/chat", { method: "POST", body: { message } });
      setMsgs((m) => [...m, { role: "ai", text: reply.trim() || "Javob bo'sh" }]);
    } catch (err) {
      setMsgs((m) => [...m, { role: "error", text: err instanceof ApiError ? err.message : "Xatolik yuz berdi" }]);
    } finally {
      setBusy(false);
    }
  }

  const bubble = {
    user: "ml-auto bg-brand text-white",
    ai: "bg-slate-100 text-slate-800",
    error: "bg-red-50 text-red-700",
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden">
      {open && (
        <div className="mb-3 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
            <span className="font-semibold">AI yordamchi</span>
            <button onClick={() => setOpen(false)} aria-label="Yopish" className="text-slate-500 hover:text-slate-800">✕</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {msgs.length === 0 && (
              <p className="text-slate-500">Jihozlar haqida so'rang. Masalan: «Nechta jihoz ta'mirda?» yoki «Noutbuklarni qidir».</p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 ${bubble[m.role]}`}>{m.text}</div>
            ))}
            {busy && <div className="text-slate-500">Yozmoqda...</div>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-2">
            <input
              className={inputCls}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={1000}
              placeholder="Savolingiz..."
              aria-label="Savol"
            />
            <button className={btnPrimary} disabled={busy || !text.trim()}>Yuborish</button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl text-white shadow-lg hover:bg-brand-dark"
        aria-label="AI yordamchi"
      >
        💬
      </button>
    </div>
  );
}
