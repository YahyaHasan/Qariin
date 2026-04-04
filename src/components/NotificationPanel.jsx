import { useEffect, useState } from "react";

export default function NotificationPanel({ notifications, onClose, onNotifClick }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
  }, []);

  function handleClose() {
    setOpen(false);
    setTimeout(onClose, 300);
  }

  function handleNotifClick(n) {
    setOpen(false);
    setTimeout(() => onNotifClick(n), 300);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={handleClose}
      />

      {/* Bottom sheet */}
      <div
        className={`sheet fixed left-0 right-0 z-50 flex flex-col rounded-t-3xl${open ? " open" : ""}`}
        style={{
          bottom: 0,
          maxWidth: 430,
          margin: "0 auto",
          backgroundColor: "#0F1E35",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          maxHeight: "70vh",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ paddingTop: 10, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>🔔</span>
            <span className="font-bold text-white" style={{ fontSize: 17 }}>Notifications</span>
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

        {/* List */}
        <div
          className="flex flex-col overflow-y-auto flex-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {notifications.map((n, i) => (
            <button
              key={n.id}
              onClick={() => n.neighborId ? handleNotifClick(n) : handleClose()}
              className="text-left px-5 flex flex-col gap-1 w-full transition-colors active:bg-white/5"
              style={{
                paddingTop: 16,
                paddingBottom: 16,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                backgroundColor: i === 0 ? "rgba(255,68,68,0.05)" : "transparent",
                cursor: n.neighborId ? "pointer" : "default",
                minHeight: 56,
              }}
            >
              <p style={{ fontSize: 15, color: "#E2E8F0" }}>{n.text}</p>
              <div className="flex items-center justify-between">
                <p style={{ fontSize: 12, color: "#64748B" }}>{n.time}</p>
                {n.neighborId && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#60A5FA" }}>
                    View match →
                  </span>
                )}
              </div>
            </button>
          ))}

          {notifications.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p style={{ fontSize: 14, color: "#64748B" }}>No notifications</p>
            </div>
          )}
        </div>

        {/* Bottom safe area spacer */}
        <div style={{ height: "var(--safe-bottom)", flexShrink: 0 }} />
      </div>
    </>
  );
}
