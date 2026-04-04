import { useState } from "react";
import DisasterModal from "./components/DisasterModal";
import MapView from "./components/MapView";
import MatchCard from "./components/MatchCard";
import ActiveHelp from "./components/ActiveHelp";
import ProfilePanel from "./components/ProfilePanel";
import NotificationPanel from "./components/NotificationPanel";
import { NEIGHBORS, MOCK_NOTIFICATIONS, ME, distanceMiles } from "./data";

export default function App() {
  const [screen, setScreen] = useState("disaster");
  const [checklist, setChecklist] = useState(null);
  const [eta, setEta] = useState(null); // computed string, e.g. "~2 min"

  // Disaster self-report
  const [travelRadius, setTravelRadius] = useState(null);
  const [selfPeopleCount, setSelfPeopleCount] = useState(null);

  // Profile
  const [profile, setProfile] = useState({
    resources: ["truck", "generator", "first aid trained"],
    medicalNeeds: [],
  });

  // Notifications
  const [notifications] = useState(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(MOCK_NOTIFICATIONS.length);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const maria = NEIGHBORS.find((n) => n.id === 1);

  const visibleNeighbors = travelRadius
    ? NEIGHBORS.filter(
        (n) =>
          !isFinite(travelRadius) ||
          distanceMiles(ME.lat, ME.lng, n.lat, n.lng) <= travelRadius
      )
    : NEIGHBORS;

  function handleDisasterSelect(choice, data = {}) {
    if (data.radius !== undefined) setTravelRadius(data.radius);
    if (data.peopleCount !== undefined) setSelfPeopleCount(data.peopleCount);
    setScreen("map");
  }

  function handleMapSelectNeighbor() { setScreen("match"); }

  function handleAccept(cl, etaStr) {
    setChecklist(cl);
    setEta(etaStr);
    setScreen("active");
  }

  function handleDecline() { setScreen("map"); }

  function openNotifications() { setNotifOpen(true); setUnreadCount(0); }

  function handleNotifClick(notif) {
    setNotifOpen(false);
    if (notif.neighborId === 1) setScreen("match");
  }

  function handleTabClick(tab) {
    if (screen === "map") return;
    setScreen(tab);
  }

  const showNav      = screen !== "disaster";
  const tabsUnlocked = screen === "match" || screen === "active";

  // Scrollable content top/bottom padding (non-map screens)
  const contentStyle = {
    paddingTop: "var(--hdr-h)",
    paddingBottom: "var(--tab-h)",
    minHeight: "100dvh",
  };

  return (
    <div style={{ backgroundColor: "#0A1628", minHeight: "100dvh" }}>

      {/* ── Fixed top header ──────────────────────────────────── */}
      {showNav && (
        <div
          className="fixed left-0 right-0 z-30 flex items-end gap-3 px-4"
          style={{
            top: 0,
            maxWidth: 430,
            margin: "0 auto",
            backgroundColor: "#0F1E35",
            borderBottom: "1px solid rgba(255,68,68,0.18)",
            height: "var(--hdr-h)",
            paddingTop: "var(--safe-top)",
            paddingBottom: 10,
          }}
        >
          <span
            className="pulse-dot w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: "#FF4444" }}
          />
          <span className="font-bold text-white" style={{ fontSize: 15, letterSpacing: "0.01em" }}>
            DISASTER ACTIVE
          </span>
          <span className="text-xs hidden sm:block" style={{ color: "#94A3B8" }}>
            Hurricane Ida · ZIP 08901
          </span>

          <div className="flex items-center gap-1 ml-auto">
            {/* Bell */}
            <button
              onClick={openNotifications}
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 40, height: 40,
                backgroundColor: notifOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
              }}
              title="Notifications"
            >
              <span style={{ fontSize: 16 }}>🔔</span>
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center text-white font-bold rounded-full"
                  style={{
                    top: 2, right: 2, width: 16, height: 16,
                    backgroundColor: "#FF4444", fontSize: 9,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Profile */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center justify-center rounded-full"
              style={{
                width: 40, height: 40,
                backgroundColor: profileOpen ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
              }}
              title="My Profile"
            >
              <span style={{ fontSize: 16 }}>👤</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Screens ───────────────────────────────────────────── */}
      {screen === "disaster" && (
        <DisasterModal onSelect={handleDisasterSelect} />
      )}

      {screen === "map" && (
        <MapView
          neighbors={visibleNeighbors}
          travelRadius={travelRadius}
          onSelectNeighbor={handleMapSelectNeighbor}
        />
      )}

      {screen === "match" && (
        <div style={contentStyle} className="scroll-area">
          <MatchCard
            neighbor={maria}
            helperResources={profile.resources}
            peopleCount={selfPeopleCount}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        </div>
      )}

      {screen === "active" && (
        <div style={contentStyle} className="scroll-area">
          <ActiveHelp neighbor={maria} checklist={checklist} eta={eta} />
        </div>
      )}

      {/* ── Fixed bottom tab bar ──────────────────────────────── */}
      {showNav && (
        <div
          className="fixed left-0 right-0 z-30 flex"
          style={{
            bottom: 0,
            maxWidth: 430,
            margin: "0 auto",
            height: "var(--tab-h)",
            paddingBottom: "var(--safe-bottom)",
            backgroundColor: "#0B1929",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.4)",
          }}
        >
          <Tab icon="🗺"  label="Map"   active={screen === "map"}    disabled={false}        onClick={() => handleTabClick("map")} />
          <Tab icon="🤝"  label="Match" active={screen === "match"}  disabled={!tabsUnlocked} disabledTitle="Set your status first" onClick={() => handleTabClick("match")} />
          <Tab icon="🆘"  label="Help"  active={screen === "active"} disabled={!tabsUnlocked} disabledTitle="Set your status first" onClick={() => handleTabClick("active")} />
        </div>
      )}

      {/* ── Overlays ──────────────────────────────────────────── */}
      {notifOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setNotifOpen(false)}
          onNotifClick={handleNotifClick}
        />
      )}
      {profileOpen && (
        <ProfilePanel
          profile={profile}
          setProfile={setProfile}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}

function Tab({ icon, label, active, disabled, disabledTitle, onClick }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? disabledTitle : undefined}
      className="flex-1 flex flex-col items-center justify-center gap-0.5"
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        backgroundColor: "transparent",
        borderTop: active ? "2px solid #60A5FA" : "2px solid transparent",
        opacity: disabled ? 0.3 : 1,
        paddingTop: 6,
        minHeight: 56,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: active ? "#60A5FA" : "#64748B",
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
    </button>
  );
}
