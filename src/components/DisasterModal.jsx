import { useState } from "react";
import { DISASTER, NEED_OPTIONS } from "../data";

const PEOPLE_OPTIONS = ["1", "2", "3", "4", "5+"];

export default function DisasterModal({ onSelect }) {
  const [step, setStep] = useState(null); // null | "travel_radius" | "needs" | "urgency" | "people"
  const [selectedNeeds, setSelectedNeeds] = useState([]);
  const [radius, setRadius] = useState(2); // slider default 2 mi
  const [selectedUrgency, setSelectedUrgency] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState(null);

  function toggleNeed(n) {
    setSelectedNeeds((prev) =>
      prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]
    );
  }

  // ── Travel radius (ok path) — slider ─────────────────────────────
  if (step === "travel_radius") {
    return (
      <ModalShell>
        <div className="text-center w-full">
          <p className="font-bold text-white" style={{ fontSize: 20 }}>
            How far will you travel to help?
          </p>
          <p className="mt-1" style={{ fontSize: 13, color: "#94A3B8" }}>
            Only residences within this radius appear on your map.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4 py-2">
          <div className="flex justify-between text-xs" style={{ color: "#64748B" }}>
            <span>0.5 mi</span>
            <span>10 mi</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="radius-slider w-full"
          />
          <div className="text-center">
            <span
              className="font-bold"
              style={{ fontSize: 28, color: "#22C55E" }}
            >
              {radius} mi
            </span>
            <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
              Currently selected
            </p>
          </div>
        </div>

        <button
          onClick={() => onSelect("ok", { radius })}
          className="w-full font-bold rounded-full transition-all active:scale-95"
          style={{ minHeight: 56, fontSize: 16, backgroundColor: "#22C55E", color: "white" }}
        >
          Continue →
        </button>
        <button onClick={() => setStep(null)} style={{ fontSize: 13, color: "#64748B" }}>
          ← Back
        </button>
      </ModalShell>
    );
  }

  // ── People count (need path — step 3) ────────────────────────────
  if (step === "people") {
    return (
      <ModalShell>
        <div className="text-center">
          <p className="font-bold text-white text-lg">How many people are affected?</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            Include everyone in your household who needs help.
          </p>
        </div>
        <div className="w-full flex gap-3">
          {PEOPLE_OPTIONS.map((p) => {
            const active = selectedPeople === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPeople(p)}
                className="flex-1 font-bold text-lg rounded-2xl transition-all active:scale-95"
                style={{
                  minHeight: 72,
                  backgroundColor: active ? "#FF4444" : "rgba(255,255,255,0.06)",
                  color: active ? "white" : "#CBD5E1",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onSelect("need", { needs: selectedNeeds, urgency: selectedUrgency, peopleCount: selectedPeople })}
          disabled={selectedPeople === null}
          className="w-full font-bold text-base rounded-full transition-all active:scale-95 disabled:opacity-40"
          style={{ minHeight: 56, backgroundColor: "#FF4444", color: "white" }}
        >
          Go to Map →
        </button>
        <button onClick={() => setStep("urgency")} className="text-xs" style={{ color: "#64748B" }}>
          ← Back
        </button>
      </ModalShell>
    );
  }

  // ── Urgency (need path — step 2) ─────────────────────────────────
  if (step === "urgency") {
    return (
      <ModalShell>
        <div className="text-center">
          <p className="font-bold text-white text-lg">How urgent?</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
            This helps us prioritize your request.
          </p>
        </div>
        <div className="w-full flex flex-col gap-3">
          {[
            { label: "🟡  Stable — not immediate",        bg: "#854D0E", color: "#FDE68A" },
            { label: "🟠  Time-sensitive — within hours", bg: "#7C2D12", color: "#FED7AA" },
            { label: "🔴  Urgent — within the hour",      bg: "#7F1D1D", color: "#FCA5A5" },
            { label: "🆘  Life-threatening — right now",  bg: "#FF4444", color: "white"   },
          ].map(({ label, bg, color }) => (
            <button
              key={label}
              onClick={() => { setSelectedUrgency(label); setStep("people"); }}
              className="w-full font-semibold text-base rounded-full transition-all active:scale-95 text-left px-5"
              style={{ minHeight: 56, backgroundColor: bg, color }}
            >
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setStep("needs")} className="text-xs" style={{ color: "#64748B" }}>
          ← Back
        </button>
      </ModalShell>
    );
  }

  // ── Needs multi-select (need path — step 1) ───────────────────────
  if (step === "needs") {
    return (
      <ModalShell>
        <div className="text-center">
          <p className="font-bold text-white text-lg">What do you need?</p>
          <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>Select all that apply.</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {NEED_OPTIONS.map((n) => {
            const active = selectedNeeds.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleNeed(n)}
                className="text-sm px-3 py-2 rounded-full font-medium transition-all active:scale-95"
                style={{
                  backgroundColor: active ? "rgba(255,68,68,0.25)" : "rgba(255,255,255,0.06)",
                  color: active ? "#FCA5A5" : "#CBD5E1",
                  border: active ? "1px solid rgba(255,68,68,0.5)" : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setStep("urgency")}
          disabled={selectedNeeds.length === 0}
          className="w-full font-bold text-base rounded-full transition-all active:scale-95 disabled:opacity-40"
          style={{ minHeight: 56, backgroundColor: "#FF4444", color: "white" }}
        >
          Next →
        </button>
        <button onClick={() => setStep(null)} className="text-xs" style={{ color: "#64748B" }}>
          ← Back
        </button>
      </ModalShell>
    );
  }

  // ── Default: status selection ─────────────────────────────────────
  return (
    <ModalShell>
      <div className="flex flex-col items-center gap-2">
        <span style={{ fontSize: 52 }}>🌀</span>
        <div
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(255,68,68,0.15)", color: "#FF4444" }}
        >
          ACTIVE DISASTER
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">{DISASTER.title}</h1>
        <p className="text-sm" style={{ color: "#CBD5E1" }}>
          Severe weather alert — ZIP {DISASTER.zip}, New Brunswick, NJ
        </p>
        <p className="text-xs mt-1" style={{ color: "#64748B" }}>
          Triggered by {DISASTER.triggeredBy}
        </p>
      </div>

      <div
        className="w-full rounded-xl px-4 py-3 flex items-center gap-2 text-sm"
        style={{ backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
      >
        <span>📡</span>
        <span style={{ color: "#93C5FD" }}>
          Disaster check-in active — <strong>47</strong> households responded ·{" "}
          <strong style={{ color: "#FCA5A5" }}>12</strong> need help ·{" "}
          <strong style={{ color: "#86EFAC" }}>8</strong> can help
        </span>
      </div>

      <div
        className="w-full rounded-xl p-3 text-center text-sm"
        style={{ backgroundColor: "rgba(255,68,68,0.07)", color: "#CBD5E1" }}
      >
        Update your status so neighbors can coordinate.
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => setStep("travel_radius")}
          className="w-full font-semibold text-base rounded-full transition-all active:scale-95"
          style={{ minHeight: 56, backgroundColor: "#22C55E", color: "white" }}
        >
          ✅ &nbsp; I'm okay and can help
        </button>
        <button
          onClick={() => onSelect("maybe")}
          className="w-full font-semibold text-base rounded-full transition-all active:scale-95"
          style={{ minHeight: 56, backgroundColor: "#F59E0B", color: "white" }}
        >
          ⚠️ &nbsp; I may need help
        </button>
        <button
          onClick={() => setStep("needs")}
          className="w-full font-semibold text-base rounded-full transition-all active:scale-95"
          style={{ minHeight: 56, backgroundColor: "#FF4444", color: "white" }}
        >
          🆘 &nbsp; I need help now
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(10,22,40,0.97)", padding: "16px" }}
    >
      <div
        className="pulse-border-anim fade-in w-full flex flex-col items-center gap-5 scroll-area"
        style={{
          backgroundColor: "#0F1E35",
          border: "3px solid #FF4444",
          borderRadius: 24,
          padding: "28px 20px",
          maxHeight: "calc(100dvh - 32px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
