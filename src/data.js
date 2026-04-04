export const ME = {
  name: "Ahmed",
  address: "12 George St, New Brunswick, NJ 08901",
  lat: 40.4774,
  lng: -74.4367,
  languages: ["English", "Arabic"],
};

export const RESOURCE_GROUPS = [
  { label: "Transport",    items: ["truck", "car", "van", "motorcycle"] },
  { label: "Power",        items: ["generator", "battery pack", "solar panel"] },
  { label: "Supplies",     items: ["food", "water", "blankets", "medicine / first aid", "medical supplies", "baby supplies"] },
  { label: "Tools",        items: ["shovel", "chainsaw", "cleanup tools", "basic tools"] },
  { label: "Shelter",      items: ["spare room", "wheelchair accessible space"] },
  { label: "Connectivity", items: ["internet hotspot", "satellite phone"] },
  { label: "Skills",       items: ["first aid trained", "CPR certified", "nurse / doctor", "electrician", "mechanic", "translator", "local driver", "disaster volunteer"] },
];

export const ALL_RESOURCES = RESOURCE_GROUPS.flatMap((g) => g.items);
export const ALL_MEDICAL_NEEDS = ["oxygen concentrator", "wheelchair", "dialysis"];

export const NEED_OPTIONS = [
  "Evacuation / Transport", "Medical Assistance", "Power / Generator",
  "Food / Water", "Medicine Pickup", "Temporary Shelter",
  "Translation Help", "Wellness Check", "Cleanup / Repair", "Child / Elder Support",
];

export const STATUS_TIMELINE = [
  { time: "2 min ago",  event: "Matched with Gonzalez Residence — evacuation assist" },
  { time: "8 min ago",  event: "Set status to ✅ Can Help" },
  { time: "11 min ago", event: "Disaster alert received — Hurricane Ida" },
  { time: "15 min ago", event: "Profile last updated" },
];

export const DISASTER = {
  title: "Hurricane Ida",
  severity: "Severe",
  zip: "08901",
  triggeredBy: "NWS Auto-Detect",
};

export const NEIGHBORS = [
  {
    id: 1,
    name: "Gonzalez Residence",
    lat: 40.4782,
    lng: -74.4371,
    status: "need_help_now",
    needs: ["Evacuation", "Power"],
    medical: "oxygen concentrator",
    mobility: "Limited — no vehicle",
    address: "34 Elm St, New Brunswick, NJ 08901",
    phone: "+15551234567",
    covered: false,
  },
  {
    id: 2,
    name: "Hassan Residence",
    lat: 40.4769,
    lng: -74.4358,
    status: "need_help_now",
    needs: ["Food / Water"],
    medical: null,
    covered: true,
  },
  {
    id: 3,
    name: "Kim Residence",
    lat: 40.479,
    lng: -74.438,
    status: "may_need_help",
    needs: ["Transportation"],
    medical: null,
    covered: false,
  },
  {
    id: 4,
    name: "Okafor Residence",
    lat: 40.4761,
    lng: -74.4362,
    status: "ok_can_help",
    needs: [],
    medical: null,
    covered: false,
  },
  {
    id: 5,
    name: "Patel Residence",
    lat: 40.4778,
    lng: -74.439,
    status: "ok_can_help",
    needs: [],
    medical: null,
    covered: false,
  },
];

export const HUBS = [
  {
    id: "h1",
    name: "Masjid Al-Noor",
    lat: 40.48,
    lng: -74.44,
    type: "Mosque",
    services: ["Shelter (cap: 40)", "Food & Water", "Charging Station", "Arabic/English support"],
  },
  {
    id: "h2",
    name: "Lincoln High School",
    lat: 40.4755,
    lng: -74.434,
    type: "School",
    services: ["Shelter (cap: 120)", "Medical station", "Wheelchair accessible"],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, time: "2 min ago",  text: "Gonzalez Residence (0.1mi) set status to 🆘 Need Help Now", neighborId: 1 },
  { id: 2, time: "5 min ago",  text: "Okafor Residence (0.3mi) set status to ✅ Can Help", neighborId: null },
  { id: 3, time: "8 min ago",  text: "Disaster alert activated for ZIP 08901 — Hurricane Ida", neighborId: null },
  { id: 4, time: "12 min ago", text: "Patel Residence (0.2mi) set status to ✅ Can Help", neighborId: null },
  { id: 5, time: "15 min ago", text: "Hassan Residence (0.4mi) set status to 🆘 Need Help Now", neighborId: null },
];

export const MOCK_CHAT = [
  { id: 1, from: "them", original: "¿Cuánto tiempo tardará en llegar?", translated: "How long will it take to arrive?" },
  { id: 2, from: "me", text: "About 4 minutes, I'm on my way now.", translatedForThem: "Aproximadamente 4 minutos, ya voy." },
  { id: 3, from: "them", original: "Gracias, estamos en la puerta principal.", translated: "Thank you, we are at the front door." },
];

export const DOT_COLOR = {
  need_help_now_uncovered: "#FF4444",
  need_help_now_covered:   "#F59E0B",
  may_need_help:           "#F97316",
  ok_can_help:             "#22C55E",
};

export function getNeighborColor(n) {
  if (n.status === "need_help_now") return n.covered ? DOT_COLOR.need_help_now_covered : DOT_COLOR.need_help_now_uncovered;
  if (n.status === "may_need_help") return DOT_COLOR.may_need_help;
  return DOT_COLOR.ok_can_help;
}

export function statusLabel(n) {
  if (n.status === "need_help_now") return n.covered ? "🟡 Covered" : "🆘 Needs help now";
  if (n.status === "may_need_help") return "⚠️ May need help";
  return "✅ Can help";
}

export function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
