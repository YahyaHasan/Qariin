import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { NEIGHBORS, HUBS, ME, getNeighborColor, statusLabel } from "../data";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

function createGeoJSONCircle(center, radiusMiles, points = 64) {
  const km = radiusMiles * 1.60934;
  const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180));
  const distanceY = km / 110.574;
  const coords = [];
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * 2 * Math.PI;
    coords.push([center[0] + distanceX * Math.cos(theta), center[1] + distanceY * Math.sin(theta)]);
  }
  coords.push(coords[0]);
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } };
}

export default function MapView({ neighbors, travelRadius, onSelectNeighbor }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerMapRef = useRef({});
  const [selectedNeighbor, setSelectedNeighbor] = useState(null);

  // Mount map once — fills full viewport
  useEffect(() => {
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [ME.lng, ME.lat],
      zoom: 14.8,
      interactive: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
    mapRef.current = map;

    map.on("load", () => {
      // Radius circle layers
      map.addSource("radius-circle", {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "Polygon", coordinates: [[]] } },
      });
      map.addLayer({ id: "radius-fill",   type: "fill",   source: "radius-circle", paint: { "fill-color": "#3B82F6", "fill-opacity": 0.06 } });
      map.addLayer({ id: "radius-border", type: "line",   source: "radius-circle", paint: { "line-color": "#3B82F6", "line-opacity": 0.4, "line-width": 1.5, "line-dasharray": [4, 3] } });

      // ME marker
      const meEl = document.createElement("div");
      meEl.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:default;";
      meEl.innerHTML = `
        <div style="
          background:#3B82F6;border:3px solid white;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          width:30px;height:30px;box-shadow:0 2px 12px rgba(59,130,246,0.7);
          display:flex;align-items:center;justify-content:center;
        "><span style="transform:rotate(45deg);font-size:14px;">🏠</span></div>
      `;
      new mapboxgl.Marker({ element: meEl, anchor: "bottom" })
        .setLngLat([ME.lng, ME.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 14, closeButton: false, className: "qariin-popup" }).setHTML(`
            <div style="font-family:'DM Sans',sans-serif;">
              <p style="font-weight:700;color:#fff;margin:0 0 3px;font-size:15px;">Ahmed Residence (You)</p>
              <p style="font-size:12px;color:#94A3B8;margin:0;">${ME.address}</p>
            </div>
          `)
        )
        .addTo(map);

      // Neighbor markers
      NEIGHBORS.forEach((n) => {
        const color = getNeighborColor(n);
        const isUrgent = n.status === "need_help_now" && !n.covered;

        const el = document.createElement("div");
        el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";

        const nameLabel = document.createElement("div");
        nameLabel.style.cssText = `
          background:rgba(15,30,53,0.92);color:white;font-size:11px;font-weight:600;
          font-family:'DM Sans',sans-serif;padding:2px 7px;border-radius:4px;margin-bottom:4px;
          white-space:nowrap;pointer-events:none;border:1px solid rgba(255,255,255,0.1);
        `;
        nameLabel.textContent = n.name;

        const dot = document.createElement("div");
        dot.style.cssText = `
          width:26px;height:26px;background:${color};border:3px solid white;border-radius:50%;
          box-shadow:0 0 0 4px ${color}55,0 2px 6px rgba(0,0,0,0.4);
          transition:transform 0.15s,box-shadow 0.15s;
          ${isUrgent ? "animation:pulse-ring 2s ease-out infinite;" : ""}
        `;

        el.appendChild(nameLabel);
        el.appendChild(dot);

        dot.addEventListener("mouseenter", () => { dot.style.transform = "scale(1.35)"; dot.style.boxShadow = `0 0 0 6px ${color}44,0 4px 12px rgba(0,0,0,0.5)`; });
        dot.addEventListener("mouseleave", () => { dot.style.transform = "scale(1)"; dot.style.boxShadow = `0 0 0 4px ${color}55,0 2px 6px rgba(0,0,0,0.4)`; });

        const popup = new mapboxgl.Popup({ offset: 16, closeButton: false, closeOnClick: false, className: "qariin-popup" })
          .setHTML(`
            <div style="font-family:'DM Sans',sans-serif;">
              <p style="font-weight:700;color:#fff;margin:0 0 4px;font-size:15px;">${n.name}</p>
              <p style="font-size:13px;color:#CBD5E1;margin:0 0 2px;">${statusLabel(n)}</p>
              ${n.needs.length ? `<p style="font-size:12px;color:#94A3B8;margin:4px 0 0;">${n.needs.join(", ")}</p>` : ""}
              ${n.medical ? `<p style="font-size:12px;color:#FCA5A5;margin:4px 0 0;">🏥 ${n.medical}</p>` : ""}
            </div>
          `);

        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([n.lng, n.lat])
          .setPopup(popup)
          .addTo(map);

        markerMapRef.current[n.id] = marker;

        el.addEventListener("click", () => {
          marker.togglePopup();
          setSelectedNeighbor((prev) => (prev?.id === n.id ? null : n));
        });
      });

      // Hub markers
      HUBS.forEach((h) => {
        const hubEl = document.createElement("div");
        hubEl.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";

        const hubLabel = document.createElement("div");
        hubLabel.style.cssText = `
          background:rgba(88,28,135,0.9);color:#E9D5FF;font-size:10px;font-weight:700;
          font-family:'DM Sans',sans-serif;padding:2px 7px;border-radius:4px;margin-bottom:4px;
          white-space:nowrap;pointer-events:none;border:1px solid rgba(167,139,250,0.3);
        `;
        hubLabel.textContent = h.name;

        const diamond = document.createElement("div");
        diamond.style.cssText = `
          width:28px;height:28px;background:#9333EA;border:3px solid white;border-radius:5px;
          transform:rotate(45deg);box-shadow:0 0 0 4px rgba(147,51,234,0.35),0 2px 8px rgba(0,0,0,0.5);
          transition:transform 0.15s;display:flex;align-items:center;justify-content:center;
        `;
        const icon = document.createElement("span");
        icon.style.cssText = "transform:rotate(-45deg);font-size:13px;line-height:1;display:block;";
        icon.textContent = h.type === "Mosque" ? "🕌" : "🏫";
        diamond.appendChild(icon);

        diamond.addEventListener("mouseenter", () => { diamond.style.transform = "rotate(45deg) scale(1.2)"; });
        diamond.addEventListener("mouseleave", () => { diamond.style.transform = "rotate(45deg) scale(1)"; });

        hubEl.appendChild(hubLabel);
        hubEl.appendChild(diamond);

        const serviceList = h.services.map((s) => `<li style="margin:3px 0;">${s}</li>`).join("");
        const hubPopup = new mapboxgl.Popup({ offset: 18, closeButton: false, closeOnClick: true, className: "qariin-popup" })
          .setHTML(`
            <div style="font-family:'DM Sans',sans-serif;">
              <p style="font-weight:700;color:#E9D5FF;margin:0 0 2px;font-size:15px;">${h.name}</p>
              <p style="font-size:12px;color:#A78BFA;margin:0 0 8px;">${h.type} · Community Hub</p>
              <ul style="font-size:12px;color:#CBD5E1;margin:0;padding-left:14px;line-height:1.6;">${serviceList}</ul>
            </div>
          `);

        const hubMarker = new mapboxgl.Marker({ element: hubEl, anchor: "bottom" })
          .setLngLat([h.lng, h.lat])
          .setPopup(hubPopup)
          .addTo(map);

        hubEl.addEventListener("click", () => hubMarker.togglePopup());
      });
    });

    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  // Marker visibility
  useEffect(() => {
    const visibleIds = new Set((neighbors ?? NEIGHBORS).map((n) => n.id));
    Object.entries(markerMapRef.current).forEach(([id, marker]) => {
      marker.getElement().style.display = visibleIds.has(Number(id)) ? "" : "none";
    });
  }, [neighbors]);

  // Radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    function updateCircle() {
      const source = map.getSource("radius-circle");
      if (!source) return;
      source.setData(
        travelRadius && isFinite(travelRadius)
          ? createGeoJSONCircle([ME.lng, ME.lat], travelRadius)
          : { type: "Feature", geometry: { type: "Polygon", coordinates: [[]] } }
      );
    }
    if (map.isStyleLoaded()) updateCircle();
    else map.once("load", updateCircle);
  }, [travelRadius]);

  const vis = neighbors ?? NEIGHBORS;
  const needNow = vis.filter((n) => n.status === "need_help_now" && !n.covered).length;
  const covered = vis.filter((n) => n.status === "need_help_now" && n.covered).length;
  const mayNeed = vis.filter((n) => n.status === "may_need_help").length;
  const canHelp = vis.filter((n) => n.status === "ok_can_help").length;

  return (
    <>
      {/* Full-screen map behind everything */}
      <div
        ref={mapContainer}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          maxWidth: 430,
          margin: "0 auto",
        }}
      />

      {/* Stats bar — sits just below fixed header */}
      <div
        className="fixed left-0 right-0 z-10 flex items-center gap-3 flex-wrap"
        style={{
          top: "var(--hdr-h)",
          maxWidth: 430,
          margin: "0 auto",
          padding: "8px 16px",
          backgroundColor: "rgba(10,22,40,0.88)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        <span style={{ color: "#FF4444" }}>🔴 {needNow}</span>
        <span style={{ color: "#F59E0B" }}>🟡 {covered}</span>
        <span style={{ color: "#F97316" }}>🟠 {mayNeed}</span>
        <span style={{ color: "#22C55E" }}>🟢 {canHelp}</span>
        {travelRadius && isFinite(travelRadius) && (
          <span
            className="ml-auto"
            style={{
              fontSize: 11,
              padding: "3px 8px",
              borderRadius: 99,
              backgroundColor: "rgba(59,130,246,0.15)",
              color: "#60A5FA",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            📍 {travelRadius} mi radius
          </span>
        )}
      </div>

      {/* Legend */}
      <div
        className="fixed left-4 z-10 rounded-2xl flex flex-col gap-1.5"
        style={{
          bottom: "calc(var(--tab-h) + 60px)",
          maxWidth: 430,
          padding: "10px 14px",
          backgroundColor: "rgba(15,30,53,0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.07)",
          fontSize: 11,
        }}
      >
        <p className="font-bold text-white mb-1" style={{ letterSpacing: "0.06em" }}>LEGEND</p>
        <LegendRow color="#FF4444" label="Need help — uncovered" />
        <LegendRow color="#F59E0B" label="Need help — covered" />
        <LegendRow color="#F97316" label="May need help" />
        <LegendRow color="#22C55E" label="Can help" />
        <LegendRow color="#3B82F6" label="Ahmed Residence (You)" />
        <LegendDiamond color="#9333EA" label="Community hub" />
      </div>

      {/* Neighbor detail — bottom sheet on mobile */}
      {selectedNeighbor && (
        <div
          className="fixed left-0 right-0 z-20 flex flex-col"
          style={{
            bottom: "var(--tab-h)",
            maxWidth: 430,
            margin: "0 auto",
            backgroundColor: "rgba(12,24,44,0.98)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -2px 20px rgba(0,0,0,0.5)",
            padding: "16px 20px 20px",
            maxHeight: "55vh",
            overflowY: "auto",
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)" }} />
          </div>

          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getNeighborColor(selectedNeighbor) }} />
                <h2 className="font-bold text-white" style={{ fontSize: 18 }}>{selectedNeighbor.name}</h2>
              </div>
              <p style={{ fontSize: 13, color: "#64748B" }}>{statusLabel(selectedNeighbor)}</p>
            </div>
            <button
              onClick={() => setSelectedNeighbor(null)}
              style={{
                fontSize: 13,
                padding: "4px 12px",
                borderRadius: 99,
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#CBD5E1",
              }}
            >
              ✕
            </button>
          </div>

          {selectedNeighbor.needs.length > 0 && (
            <div
              className="rounded-2xl flex flex-col gap-2 mb-3"
              style={{ padding: "12px 16px", backgroundColor: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.12)" }}
            >
              <p className="font-semibold" style={{ fontSize: 11, color: "#FF4444", letterSpacing: "0.08em" }}>NEEDS</p>
              <div className="flex flex-wrap gap-2">
                {selectedNeighbor.needs.map((need) => (
                  <span
                    key={need}
                    style={{ fontSize: 13, padding: "4px 12px", borderRadius: 99, backgroundColor: "rgba(255,68,68,0.15)", color: "#FCA5A5" }}
                  >
                    {need}
                  </span>
                ))}
              </div>
              {selectedNeighbor.medical && (
                <p style={{ fontSize: 13, color: "#CBD5E1" }}>🏥 <strong>{selectedNeighbor.medical}</strong></p>
              )}
              {selectedNeighbor.mobility && (
                <p style={{ fontSize: 12, color: "#94A3B8" }}>🚶 {selectedNeighbor.mobility}</p>
              )}
            </div>
          )}

          {selectedNeighbor.status === "ok_can_help" && (
            <div
              className="rounded-2xl mb-3"
              style={{ padding: "12px 16px", backgroundColor: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.12)" }}
            >
              <p style={{ fontSize: 14, color: "#4ADE80" }}>✅ Available to help neighbors</p>
            </div>
          )}

          {selectedNeighbor.id === 1 && (
            <button
              onClick={() => onSelectNeighbor(selectedNeighbor)}
              className="w-full font-bold rounded-full transition-all active:scale-95"
              style={{ minHeight: 56, fontSize: 16, backgroundColor: "#FF4444", color: "white" }}
            >
              View Match →
            </button>
          )}
        </div>
      )}
    </>
  );
}

function LegendRow({ color, label }) {
  return (
    <div className="flex items-center gap-2" style={{ color: "#CBD5E1" }}>
      <span className="rounded-full flex-shrink-0" style={{ width: 9, height: 9, backgroundColor: color, display: "inline-block" }} />
      <span>{label}</span>
    </div>
  );
}

function LegendDiamond({ color, label }) {
  return (
    <div className="flex items-center gap-2" style={{ color: "#CBD5E1" }}>
      <span className="flex-shrink-0" style={{ display: "inline-block", width: 9, height: 9, backgroundColor: color, transform: "rotate(45deg)", borderRadius: 2 }} />
      <span>{label}</span>
    </div>
  );
}
