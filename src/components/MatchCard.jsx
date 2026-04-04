import { useEffect, useState } from "react";
import { ME, distanceMiles } from "../data";

const ICONS = ["⚡", "🚛", "🏫"];

function calcETA(dist) {
  const minutes = Math.round((dist / 25) * 60);
  return minutes < 1 ? "< 1 min" : `~${minutes} min`;
}

export default function MatchCard({ neighbor, helperResources, peopleCount, onAccept, onDecline }) {
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const distance = distanceMiles(ME.lat, ME.lng, neighbor.lat, neighbor.lng);
  const distText  = distance < 0.1 ? "< 0.1mi" : `${distance.toFixed(1)}mi`;
  const etaText   = calcETA(distance);

  useEffect(() => { generateChecklist(); }, []);

  async function generateChecklist() {
    setLoading(true);
    setError(null);
    const resourceStr = helperResources.length ? helperResources.join(", ") : "none listed";
    try {
      const prompt = `You are a disaster response assistant. Generate EXACTLY 3 ultra-short action bullets for a volunteer helper going to assist a neighbor. Each bullet must be under 10 words, action-first, and only non-obvious or time-critical steps. No generic advice.

Helper has: ${resourceStr}
Person needs: evacuation, power for medical device
Person's situation: oxygen concentrator, mobility limited, ground floor flooding
Disaster type: Hurricane
Nearest open shelter: Lincoln High School, 2.3mi east

Return ONLY a JSON array of 3 strings. No markdown, no explanation.`;

      const response = await fetch("https://api.featherless.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_FEATHERLESS_API_KEY}`,
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_FEATHERLESS_MODEL,
          max_tokens: 256,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const raw = data.choices[0].message.content.trim();
      const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
      const items = JSON.parse(jsonStr);
      if (!Array.isArray(items) || items.length === 0) throw new Error("Bad response");
      setChecklist(items.slice(0, 3));
    } catch (e) {
      console.error(e);
      setError(true);
      setChecklist([
        "Start generator before leaving — device can't lose power",
        "Pull truck to front door, she cannot walk far",
        "Drop-off: Lincoln High School, 2.3mi east",
      ]);
    } finally {
      setLoading(false);
    }
  }

  const matchedResources = helperResources.filter((r) => ["truck", "generator"].includes(r));

  return (
    <div className="flex items-start justify-center px-4 pt-5 pb-6">
      <div
        className="fade-in w-full flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F1E35", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ── Header ── */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowProfile((p) => !p)}
              className="font-bold text-white hover:underline"
              style={{ fontSize: 20 }}
              title="Tap for more info"
            >
              {neighbor.name}
            </button>
            <span style={{ color: "#334155" }}>•</span>
            <span style={{ fontSize: 14, color: "#94A3B8" }}>{distText}</span>
            <span style={{ color: "#334155" }}>•</span>
            <span
              className="font-bold px-2 py-0.5 rounded-full"
              style={{ fontSize: 12, backgroundColor: "rgba(255,68,68,0.18)", color: "#FF4444" }}
            >
              🔴 Urgent
            </span>
          </div>
          {/* ETA — calculated, not a slider */}
          <p className="mt-2" style={{ fontSize: 14, color: "#94A3B8" }}>
            🕐 ETA <strong style={{ color: "#60A5FA" }}>{etaText}</strong> by truck
          </p>
        </div>

        {/* ── Expandable profile ── */}
        {showProfile && (
          <div
            className="px-5 py-3 fade-in flex flex-col gap-1"
            style={{
              fontSize: 14,
              backgroundColor: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p style={{ color: "#94A3B8" }}>📍 {neighbor.address}</p>
            <p style={{ color: "#94A3B8" }}>🚶 {neighbor.mobility}</p>
            {neighbor.medical && <p style={{ color: "#FCA5A5" }}>🏥 {neighbor.medical}</p>}
          </div>
        )}

        {/* ── Situation ── */}
        <div
          className="px-5 py-3 flex flex-col gap-2"
          style={{ fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Row label="Needs">{neighbor.needs.join(", ")}</Row>
          <Row label="Has">{[neighbor.medical, "No vehicle"].filter(Boolean).join(" · ")}</Row>
          {peopleCount && (
            <Row label="Affected">
              {peopleCount} {peopleCount === "1" ? "person" : "people"}
            </Row>
          )}
        </div>

        {/* ── Your match ── */}
        <div
          className="px-5 py-3"
          style={{ fontSize: 15, borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="font-medium" style={{ color: "#94A3B8" }}>Your match: </span>
          {matchedResources.length > 0 ? (
            matchedResources.map((r) => (
              <span key={r} className="font-semibold" style={{ color: "#4ADE80" }}>
                {r} ✓{"  "}
              </span>
            ))
          ) : (
            <span style={{ color: "#64748B" }}>
              {helperResources.length ? helperResources.slice(0, 3).join(", ") : "No resources set"}
            </span>
          )}
        </div>

        {/* ── AI Checklist ── */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <svg className="spinner flex-shrink-0" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span style={{ fontSize: 14, color: "#64748B" }}>Generating checklist…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {checklist.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 fade-in"
                  style={{ fontSize: 15, animationDelay: `${i * 0.1}s` }}
                >
                  <span className="flex-shrink-0">{ICONS[i] || "⚡"}</span>
                  <span style={{ color: "#E2E8F0" }}>{item}</span>
                </div>
              ))}
              {error && (
                <p style={{ fontSize: 12, color: "#F59E0B", marginTop: 4 }}>
                  ⚠️ AI unavailable — fallback shown
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Buttons ── */}
        <div className="flex gap-3 px-5 py-4">
          <button
            onClick={() => onAccept(checklist, etaText)}
            disabled={loading}
            className="flex-1 font-bold rounded-full transition-all active:scale-95 disabled:opacity-40"
            style={{ minHeight: 56, fontSize: 16, backgroundColor: "#22C55E", color: "white" }}
          >
            Accept — I'll help
          </button>
          <button
            onClick={onDecline}
            className="flex-1 font-semibold rounded-full transition-all active:scale-95"
            style={{
              minHeight: 56,
              fontSize: 16,
              backgroundColor: "transparent",
              border: "1.5px solid rgba(255,255,255,0.12)",
              color: "#94A3B8",
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-medium flex-shrink-0" style={{ color: "#94A3B8" }}>{label}:</span>
      <span style={{ color: "#E2E8F0" }}>{children}</span>
    </div>
  );
}
