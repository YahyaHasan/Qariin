import { useState } from "react";
import { NEIGHBORS } from "../data";
import ChatPanel from "./ChatPanel";

export default function ActiveHelp({ neighbor, checklist, eta }) {
  const [resolved, setResolved] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [eocData, setEocData] = useState(NEIGHBORS);
  const [chatOpen, setChatOpen] = useState(false);

  function handleResolve() {
    setResolved(true);
    setShowToast(true);
    setEocData((prev) =>
      prev.map((n) => (n.id === neighbor.id ? { ...n, resolved: true, covered: true } : n))
    );
    setTimeout(() => setShowToast(false), 4000);
  }

  const CHECKLIST_ICONS = ["⚡", "🚛", "🏫"];
  // Use first name only for the ETA arrival message (spec requirement)
  const etaDisplay = eta ?? "~2 min";

  return (
    <div style={{ backgroundColor: "#0A1628" }}>

      {/* ── Helper panel ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-4">
        <div>
          <span className="font-bold" style={{ fontSize: 12, color: "#22C55E", letterSpacing: "0.08em" }}>
            ✅ MATCH ACCEPTED
          </span>
          <h2 className="font-bold text-white mt-1" style={{ fontSize: 20 }}>
            Helping {neighbor.name}
          </h2>
        </div>

        {/* Address + call */}
        <div
          className="rounded-2xl flex flex-col gap-3"
          style={{
            padding: "16px 20px",
            backgroundColor: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <span
            className="font-bold label-sm"
            style={{ color: "#22C55E" }}
          >
            ADDRESS REVEALED
          </span>
          <p className="font-semibold text-white" style={{ fontSize: 15 }}>
            {neighbor.address}
          </p>
          <a
            href={`tel:${neighbor.phone}`}
            className="flex items-center justify-center gap-2 font-bold rounded-full transition-all active:scale-95"
            style={{
              minHeight: 56,
              fontSize: 15,
              backgroundColor: "#22C55E",
              color: "white",
              textDecoration: "none",
            }}
          >
            📞 &nbsp; One-tap call
          </a>
        </div>

        {/* Checklist */}
        {checklist && (
          <div
            className="rounded-2xl"
            style={{
              padding: "16px 20px",
              backgroundColor: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <p className="font-semibold mb-3" style={{ fontSize: 14, color: "#60A5FA" }}>
              ⚡ Your Checklist
            </p>
            <div className="flex flex-col gap-2.5">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0" style={{ fontSize: 16 }}>{CHECKLIST_ICONS[i] || "⚡"}</span>
                  <span style={{ fontSize: 15, color: "#E2E8F0" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-2 font-semibold rounded-full px-4 transition-all active:scale-95"
          style={{
            minHeight: 48,
            fontSize: 14,
            backgroundColor: "rgba(59,130,246,0.12)",
            color: "#60A5FA",
            border: "1px solid rgba(59,130,246,0.2)",
            alignSelf: "flex-start",
          }}
        >
          💬 Chat with Gonzalez Residence
          <span
            style={{
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 99,
              backgroundColor: "rgba(34,197,94,0.15)",
              color: "#4ADE80",
            }}
          >
            🌐 Auto-translated
          </span>
        </button>

        {/* Resolve */}
        <div>
          {!resolved ? (
            <button
              onClick={handleResolve}
              className="w-full font-bold rounded-full transition-all active:scale-95"
              style={{ minHeight: 56, fontSize: 16, backgroundColor: "#22C55E", color: "white" }}
            >
              ✅ Mark as Resolved
            </button>
          ) : (
            <div
              className="w-full flex items-center justify-center rounded-full font-semibold fade-in"
              style={{
                minHeight: 56,
                fontSize: 16,
                backgroundColor: "rgba(34,197,94,0.15)",
                color: "#22C55E",
                border: "1.5px solid #22C55E",
              }}
            >
              ✅ Resolved — EOC notified
            </div>
          )}
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

      {/* ── EOC panel ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
        <div className="flex items-center gap-2">
          <span
            className="font-bold"
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 99,
              backgroundColor: "rgba(59,130,246,0.15)",
              color: "#60A5FA",
              letterSpacing: "0.06em",
            }}
          >
            EOC
          </span>
          <h3 className="font-bold text-white" style={{ fontSize: 16 }}>Coordinator View</h3>
          <span className="ml-auto flex items-center gap-1" style={{ fontSize: 12, color: "#22C55E" }}>
            <span className="pulse-dot w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: "#22C55E" }} />
            Live
          </span>
        </div>

        {/* ETA banner — uses first name only per spec */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            fontSize: 14,
            backgroundColor: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          {resolved ? (
            <p className="font-semibold" style={{ color: "#4ADE80" }}>
              ✅ Ahmed has arrived
            </p>
          ) : (
            <p style={{ color: "#FDE68A" }}>
              ⏳ Help is on the way — Ahmed arriving in {etaDisplay}
            </p>
          )}
        </div>

        {/* EOC table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.06em" }}>
                  RESIDENCE
                </th>
                <th className="text-left px-4 py-3 font-semibold" style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.06em" }}>
                  NEEDS
                </th>
                <th className="text-left px-4 py-3 font-semibold" style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.06em" }}>
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {eocData.map((n, i) => (
                <EocRow
                  key={n.id}
                  neighbor={n}
                  isMe={n.id === neighbor.id}
                  resolved={resolved && n.id === neighbor.id}
                  striped={i % 2 === 0}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl font-semibold fade-in"
          style={{
            bottom: "calc(var(--tab-h) + 16px)",
            fontSize: 14,
            backgroundColor: "#22C55E",
            color: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          ✅ {neighbor.name}'s need marked resolved. EOC notified.
        </div>
      )}

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}

function EocRow({ neighbor, isMe, resolved, striped }) {
  function getStatus() {
    if (resolved) return <span style={{ color: "#22C55E" }}>✅ Resolved</span>;
    if (isMe)     return <span style={{ color: "#22C55E" }}>🟡 Being helped</span>;
    if (neighbor.status === "need_help_now" && neighbor.covered)
      return <span style={{ color: "#F59E0B" }}>🟡 Covered</span>;
    if (neighbor.status === "need_help_now" && !neighbor.covered)
      return <span style={{ color: "#FF4444" }}>🔴 Uncovered</span>;
    if (neighbor.status === "may_need_help")
      return <span style={{ color: "#F97316" }}>🟠 May need</span>;
    return <span style={{ color: "#22C55E" }}>🟢 Can help</span>;
  }

  return (
    <tr style={{ backgroundColor: striped ? "rgba(255,255,255,0.02)" : "transparent" }}>
      <td className="px-4 py-3 font-medium text-white" style={{ fontSize: 12 }}>{neighbor.name}</td>
      <td className="px-4 py-3" style={{ fontSize: 12, color: "#CBD5E1" }}>
        {neighbor.needs.length > 0 ? neighbor.needs.join(", ") : "—"}
      </td>
      <td className="px-4 py-3 font-medium" style={{ fontSize: 12 }}>{getStatus()}</td>
    </tr>
  );
}
