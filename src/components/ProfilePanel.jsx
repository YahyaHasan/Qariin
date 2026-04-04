import { useEffect, useState } from "react";
import { ME, RESOURCE_GROUPS, ALL_MEDICAL_NEEDS, STATUS_TIMELINE } from "../data";

export default function ProfilePanel({ profile, setProfile, onClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  function handleClose() {
    setOpen(false);
    setTimeout(onClose, 300);
  }

  function toggleResource(tag) {
    setProfile((prev) => ({
      ...prev,
      resources: prev.resources.includes(tag)
        ? prev.resources.filter((r) => r !== tag)
        : [...prev.resources, tag],
    }));
  }

  function toggleMedical(tag) {
    setProfile((prev) => ({
      ...prev,
      medicalNeeds: prev.medicalNeeds.includes(tag)
        ? prev.medicalNeeds.filter((m) => m !== tag)
        : [...prev.medicalNeeds, tag],
    }));
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleClose}
      />

      {/* Bottom sheet (scrollable full-height) */}
      <div
        className={`sheet fixed left-0 right-0 z-50 flex flex-col rounded-t-3xl${open ? " open" : ""}`}
        style={{
          bottom: 0,
          maxWidth: 430,
          margin: "0 auto",
          backgroundColor: "#0B1929",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          maxHeight: "90vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header — sticky */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0 sticky top-0"
          style={{
            paddingTop: 10,
            paddingBottom: 14,
            backgroundColor: "#0B1929",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            zIndex: 1,
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>👤</span>
            <span className="font-bold text-white" style={{ fontSize: 17 }}>My Profile</span>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36, height: 36,
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#CBD5E1",
              fontSize: 14,
            }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex flex-col gap-6 overflow-y-auto"
          style={{ padding: "20px 20px", paddingBottom: "max(32px, var(--safe-bottom))", WebkitOverflowScrolling: "touch" }}
        >
          {/* Identity */}
          <div
            className="rounded-2xl p-4 flex flex-col gap-1"
            style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}
          >
            <p className="font-bold text-white" style={{ fontSize: 17 }}>{ME.name}</p>
            <p style={{ fontSize: 14, color: "#94A3B8" }}>{ME.address}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              {ME.languages.map((l) => (
                <span
                  key={l}
                  style={{
                    fontSize: 12,
                    padding: "2px 8px",
                    borderRadius: 99,
                    backgroundColor: "rgba(59,130,246,0.15)",
                    color: "#93C5FD",
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Resources — grouped */}
          <div>
            <p
              className="font-bold uppercase"
              style={{ fontSize: 11, letterSpacing: "0.08em", color: "#22C55E", marginBottom: 4 }}
            >
              My Resources
            </p>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 16 }}>
              Tap to toggle on/off. Active resources are visible to neighbors.
            </p>
            <div className="flex flex-col gap-4">
              {RESOURCE_GROUPS.map((group) => (
                <div key={group.label}>
                  <p
                    className="font-semibold uppercase"
                    style={{ fontSize: 11, letterSpacing: "0.06em", color: "#475569", marginBottom: 8 }}
                  >
                    {group.label}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((tag) => {
                      const active = profile.resources.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleResource(tag)}
                          className="font-medium transition-all active:scale-95"
                          style={{
                            fontSize: 13,
                            padding: "6px 12px",
                            borderRadius: 99,
                            minHeight: 36,
                            backgroundColor: active ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.04)",
                            color: active ? "#4ADE80" : "#64748B",
                            border: active ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          {active ? "✓ " : ""}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical needs */}
          <div>
            <p
              className="font-bold uppercase"
              style={{ fontSize: 11, letterSpacing: "0.08em", color: "#FF4444", marginBottom: 4 }}
            >
              My Medical Needs
            </p>
            <p style={{ fontSize: 13, color: "#64748B", marginBottom: 12 }}>
              Flag so neighbors know what to bring if you need help.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_MEDICAL_NEEDS.map((tag) => {
                const active = profile.medicalNeeds.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleMedical(tag)}
                    className="font-medium transition-all active:scale-95"
                    style={{
                      fontSize: 13,
                      padding: "6px 12px",
                      borderRadius: 99,
                      minHeight: 36,
                      backgroundColor: active ? "rgba(255,68,68,0.18)" : "rgba(255,255,255,0.04)",
                      color: active ? "#FCA5A5" : "#64748B",
                      border: active ? "1px solid rgba(255,68,68,0.35)" : "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    {active ? "✓ " : ""}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status timeline */}
          <div>
            <p
              className="font-bold uppercase"
              style={{ fontSize: 11, letterSpacing: "0.08em", color: "#475569", marginBottom: 12 }}
            >
              Recent Activity
            </p>
            <div className="flex flex-col gap-0">
              {STATUS_TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-3 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: i === 0 ? "#60A5FA" : "#334155" }}
                    />
                    {i < STATUS_TIMELINE.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ backgroundColor: "#1E293B", minHeight: 20 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p style={{ fontSize: 14, color: i === 0 ? "#E2E8F0" : "#94A3B8" }}>
                      {item.event}
                    </p>
                    <p style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
