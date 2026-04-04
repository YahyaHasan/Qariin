import { useEffect, useRef, useState } from "react";
import { MOCK_CHAT } from "../data";

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState(MOCK_CHAT);
  const [input, setInput] = useState("");
  const [translating, setTranslating] = useState(false);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Trigger sheet open animation on mount
    requestAnimationFrame(() => setOpen(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleClose() {
    setOpen(false);
    setTimeout(onClose, 300);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || translating) return;
    setInput("");
    setTranslating(true);

    // Optimistically add message with pending translation
    const tempId = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: tempId, from: "me", text, translatedForThem: null, pending: true },
    ]);

    try {
      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_FEATHERLESS_API_KEY}`,
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_FEATHERLESS_MODEL,
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `Translate the following English text to Spanish. Return ONLY the translated text, nothing else.\n\nText: "${text}"`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      const translated = data.choices[0].message.content.trim().replace(/^["']|["']$/g, "");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, translatedForThem: translated, pending: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...m, translatedForThem: "[translation unavailable]", pending: false } : m
        )
      );
    } finally {
      setTranslating(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className={`sheet fixed left-0 right-0 z-50 flex flex-col rounded-t-3xl${open ? " open" : ""}`}
        style={{
          bottom: 0,
          maxWidth: 430,
          margin: "0 auto",
          backgroundColor: "#0B1929",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          height: "65vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 16 }}>💬</span>
            <span className="font-bold text-white" style={{ fontSize: 15 }}>Chat — Gonzalez Residence</span>
            <span
              className="font-medium"
              style={{
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 99,
                backgroundColor: "rgba(34,197,94,0.12)",
                color: "#4ADE80",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              🌐 Auto-translated
            </span>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 32, height: 32,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#CBD5E1",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Language note */}
        <div
          className="px-5 py-2 flex-shrink-0 flex items-center gap-1"
          style={{
            fontSize: 12,
            backgroundColor: "rgba(59,130,246,0.07)",
            color: "#93C5FD",
            borderBottom: "1px solid rgba(59,130,246,0.1)",
          }}
        >
          <span>You speak English · They speak Spanish · Messages auto-translated</span>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4"
          style={{
            paddingTop: 12,
            paddingBottom: "max(12px, var(--safe-bottom))",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type in English…"
            className="chat-input flex-1 px-4 outline-none"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || translating}
            className="flex items-center justify-center rounded-full font-bold transition-all active:scale-95 disabled:opacity-40 flex-shrink-0"
            style={{ width: 48, height: 48, backgroundColor: "#22C55E", color: "white", fontSize: 18 }}
          >
            {translating ? (
              <svg className="spinner" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            ) : "→"}
          </button>
        </div>
      </div>
    </>
  );
}

function ChatBubble({ msg }) {
  const isMe = msg.from === "me";

  if (isMe) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div
          className="max-w-xs px-4 py-2.5 rounded-2xl rounded-br-sm"
          style={{ fontSize: 15, backgroundColor: "#1D4ED8", color: "white" }}
        >
          {msg.text}
        </div>
        {msg.pending ? (
          <p style={{ fontSize: 12, color: "#475569", paddingLeft: 4 }}>Translating…</p>
        ) : msg.translatedForThem ? (
          <p style={{ fontSize: 12, color: "#475569", paddingLeft: 4 }}>
            🌐 {msg.translatedForThem}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      {msg.original && (
        <p style={{ fontSize: 12, color: "#475569", paddingLeft: 4 }}>
          {msg.original}
        </p>
      )}
      <div
        className="max-w-xs px-4 py-2.5 rounded-2xl rounded-bl-sm"
        style={{ fontSize: 15, backgroundColor: "rgba(255,255,255,0.08)", color: "#E2E8F0" }}
      >
        {msg.translated}
      </div>
    </div>
  );
}
