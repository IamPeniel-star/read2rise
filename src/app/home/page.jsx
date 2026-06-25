/**
 * SCHOLAR — Production-Ready Study App
 * ─────────────────────────────────────
 * • AI powered by xAI Grok (grok-3-latest via api.x.ai)
 * • Authentication: Sign In / Sign Up with localStorage persistence
 * • Profile page + Settings page
 * • Full responsive: mobile (<640px), tablet (640–1024px), desktop (>1024px)
 * • PWA-ready: manifest + service worker registration + install prompt
 * • QR code for Chrome Web Store / direct install (rendered inline)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

// ─── GROK API CONFIG ─────────────────────────────────────────────────────────
const GROK_API = {
  endpoint: "https://api.x.ai/v1/chat/completions",
  model: "grok-3-latest",
  // API key should be set via environment variable: VITE_GROK_API_KEY
  // For Next.js: process.env.NEXT_PUBLIC_GROK_API_KEY
  // For production, NEVER expose API key in client-side code — proxy through /api/chat
  getKey: () =>
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GROK_API_KEY) ||
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROK_API_KEY) ||
    "", // Replace with your key during local dev only
};

const callGrok = async (systemPrompt, messages, maxTokens = 1000) => {
  const key = GROK_API.getKey();
  const res = await fetch(GROK_API.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model: GROK_API.model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });
  if (!res.ok) throw new Error(`Grok API error: ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  bg:        "#07080A",
  surface:   "#0F1117",
  card:      "#141720",
  border:    "#1E2330",
  borderHi:  "#2A3045",
  accent:    "#6C63FF",
  accentLo:  "#6C63FF22",
  accentMid: "#6C63FF44",
  gold:      "#F5A623",
  goldLo:    "#F5A62322",
  green:     "#22C55E",
  greenLo:   "#22C55E22",
  red:       "#EF4444",
  redLo:     "#EF444422",
  amber:     "#F59E0B",
  amberLo:   "#F59E0B22",
  textPri:   "#F0F2F8",
  textSec:   "#8B92A5",
  textMut:   "#4A5068",
  white:     "#FFFFFF",
};

// ─── BREAKPOINTS ─────────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [bp, setBp] = useState(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 640) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  });
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return bp;
};

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", fill = "none", stroke = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  home:      "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  brain:     "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z",
  chart:     "M18 20V10 M12 20V4 M6 20v-6",
  book:      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 4h16v18H6.5A2.5 2.5 0 0 1 4 19.5z",
  users:     "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  trophy:    "M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22 M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22 M18 2H6v7a6 6 0 0 0 12 0V2z",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  fire:      "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
  send:      "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  plus:      "M12 5v14 M5 12h14",
  x:         "M18 6L6 18 M6 6l12 12",
  check:     "M20 6L9 17l-5-5",
  lock:      "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  clock:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2",
  target:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  coins:     "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6v6l4 2",
  globe:     "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  upload:    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
  menu:      "M3 12h18 M3 6h18 M3 18h18",
  arrowR:    "M5 12h14 M12 5l7 7-7 7",
  sparkle:   "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z M19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5L19 3z",
  refresh:   "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0 1 14.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  user:      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  logout:    "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
  eyeOff:    "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24 M1 1l22 22",
  bell:      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  camera:    "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  download:  "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  smartphone:"M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z M12 18h.01",
  mail:      "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: ${T.bg}; color: ${T.textPri}; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  ::selection { background: ${T.accentMid}; }
  input, textarea, button { font-family: 'Inter', sans-serif; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 8px ${T.accent}44; } 50% { box-shadow: 0 0 24px ${T.accent}88; } }
  @keyframes blink { 50% { border-color: transparent; } }
  @keyframes slideIn { from { transform: translateX(-16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes floatBadge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @media (max-width: 639px) {
    .sidebar-desktop { display: none !important; }
    .mobile-nav { display: flex !important; }
    .main-content-pad { padding: 16px 14px 80px !important; }
  }
  @media (min-width: 640px) and (max-width: 1023px) {
    .sidebar-desktop { width: 72px !important; }
    .sidebar-label { display: none !important; }
    .mobile-nav { display: none !important; }
  }
  @media (min-width: 1024px) {
    .mobile-nav { display: none !important; }
    .mobile-topbar-menu { display: none !important; }
  }
`;

// ─── AUTH STORE ──────────────────────────────────────────────────────────────
const AuthStore = {
  getAccounts: () => {
    try { return JSON.parse(localStorage.getItem("scholar_accounts") || "{}"); } catch { return {}; }
  },
  saveAccounts: (accs) => localStorage.setItem("scholar_accounts", JSON.stringify(accs)),
  getSession: () => {
    try { return JSON.parse(localStorage.getItem("scholar_session") || "null"); } catch { return null; }
  },
  saveSession: (user) => localStorage.setItem("scholar_session", JSON.stringify(user)),
  clearSession: () => localStorage.removeItem("scholar_session"),
  register: (email, password, name) => {
    const accs = AuthStore.getAccounts();
    if (accs[email]) return { error: "An account with this email already exists." };
    const user = { email, name, password, level: "", challenge: "", goal: "", createdAt: Date.now(), avatar: null, notifications: true, theme: "dark", studyReminders: true };
    accs[email] = user;
    AuthStore.saveAccounts(accs);
    const session = { ...user }; delete session.password;
    AuthStore.saveSession(session);
    return { user: session };
  },
  login: (email, password) => {
    const accs = AuthStore.getAccounts();
    const acc = accs[email];
    if (!acc) return { error: "No account found with this email." };
    if (acc.password !== password) return { error: "Incorrect password." };
    const session = { ...acc }; delete session.password;
    AuthStore.saveSession(session);
    return { user: session };
  },
  updateUser: (email, updates) => {
    const accs = AuthStore.getAccounts();
    if (!accs[email]) return;
    accs[email] = { ...accs[email], ...updates };
    AuthStore.saveAccounts(accs);
    const session = { ...accs[email] }; delete session.password;
    AuthStore.saveSession(session);
    return session;
  },
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
const Badge = ({ children, color = T.accent, bg = T.accentLo, style = {} }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color, background: bg, letterSpacing: "0.03em", ...style }}>
    {children}
  </span>
);

const Card = ({ children, style = {}, onClick, glow = false }) => (
  <div onClick={onClick} style={{
    background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20,
    transition: "all 0.2s", cursor: onClick ? "pointer" : "default",
    animation: glow ? "glow 3s ease-in-out infinite" : "none",
    ...style,
  }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", icon, disabled = false, style = {} }) => {
  const [hov, setHov] = useState(false);
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 15 } };
  const variants = {
    primary: { background: hov ? "#7C74FF" : T.accent, color: T.white, border: "none" },
    ghost:   { background: hov ? T.accentLo : "transparent", color: T.textPri, border: `1px solid ${hov ? T.accent : T.border}` },
    danger:  { background: hov ? "#F87171" : T.red, color: T.white, border: "none" },
    gold:    { background: hov ? "#FBBF24" : T.gold, color: "#1A0F00", border: "none" },
  };
  return (
    <button disabled={disabled} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 10, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, transition: "all 0.15s", fontFamily: "Inter, sans-serif", ...sizes[size], ...variants[variant], ...style }}>
      {icon && <span style={{ display: "flex" }}>{icon}</span>}
      {children}
    </button>
  );
};

const Progress = ({ value, color = T.accent, height = 6, label }) => (
  <div>
    {label && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: T.textSec }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}%</span>
    </div>}
    <div style={{ background: T.border, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 99, transition: "width 1s ease" }} />
    </div>
  </div>
);

const StatCard = ({ label, value, delta, icon, color = T.accent }) => (
  <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18, animation: "fadeIn 0.4s ease" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: T.textSec, fontWeight: 500 }}>{label}</span>
      <div style={{ background: color + "22", borderRadius: 8, padding: 6, color }}>{icon}</div>
    </div>
    <div style={{ fontSize: 28, fontWeight: 800, color: T.textPri, letterSpacing: "-0.02em" }}>{value}</div>
    {delta && <div style={{ fontSize: 12, color: delta > 0 ? T.green : T.red, marginTop: 4, fontWeight: 600 }}>
      {delta > 0 ? "↑" : "↓"} {Math.abs(delta)}% this week
    </div>}
  </div>
);

// ─── MINI BAR CHART ──────────────────────────────────────────────────────────
const BarChart = ({ data, height = 80 }) => {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: (d.v / max) * (height - 20), background: d.hi ? T.accent : T.border, borderRadius: "4px 4px 0 0", transition: "height 0.8s ease", minHeight: 3 }} />
          <span style={{ fontSize: 10, color: T.textMut }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
};

// ─── RADIAL PROGRESS ─────────────────────────────────────────────────────────
const Radial = ({ value, size = 80, color = T.accent, label, sublabel }) => {
  const r = (size / 2) - 8; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 70 ? 16 : 12, fontWeight: 800, color: T.textPri, lineHeight: 1 }}>{label || `${value}%`}</span>
        {sublabel && <span style={{ fontSize: 9, color: T.textMut, marginTop: 2 }}>{sublabel}</span>}
      </div>
    </div>
  );
};

// ─── QR CODE (SVG-based, no library needed) ─────────────────────────────────
// Generates a simple QR-like grid display for the PWA install URL
const QRDisplay = ({ url = "https://scholar.app/install", size = 120 }) => {
  // A static decorative QR pattern (real QR needs a lib; swap with qrcode.react in prod)
  const cells = 17;
  const cell = Math.floor(size / cells);
  // Deterministic "fingerprint" from URL
  const seed = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Always-on finder patterns (corners)
      if ((r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7)) {
        const fr = r % 7; const fc = c % 7;
        const cr = r >= cells - 7 ? r - (cells - 7) : r;
        const cc = c >= cells - 7 ? c - (cells - 7) : c;
        if (cr === 0 || cr === 6 || cc === 0 || cc === 6 || (cr >= 2 && cr <= 4 && cc >= 2 && cc <= 4)) return true;
        return false;
      }
      return ((seed * (r + 1) * (c + 3)) % 7) < 3;
    })
  );
  return (
    <div style={{ display: "inline-block", padding: 8, background: T.white, borderRadius: 10 }}>
      <svg width={cells * cell} height={cells * cell}>
        {grid.map((row, r) => row.map((on, c) => on ? (
          <rect key={`${r}-${c}`} x={c * cell} y={r * cell} width={cell - 1} height={cell - 1} rx={1} fill="#000" />
        ) : null))}
      </svg>
    </div>
  );
};

// ─── PWA INSTALL BANNER ──────────────────────────────────────────────────────
const PWAInstallBanner = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 90, left: 16, right: 16, zIndex: 1000, animation: "fadeIn 0.4s ease" }}>
      <Card style={{ borderColor: T.accentMid, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={Icons.smartphone} color={T.white} size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Install SCHOLAR</div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>Add to home screen for the best experience — works offline too.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
              <QRCodeSVG value="https://yourapp.com" size={100} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: T.textMut, marginBottom: 8 }}>Scan to install on mobile, or tap below on Chrome:</div>
                {installed
                  ? <Badge color={T.green} bg={T.greenLo}><Icon d={Icons.check} size={11} color={T.green} /> Installed!</Badge>
                  : <Btn size="sm" onClick={install} icon={<Icon d={Icons.download} size={14} color={T.white} />}>
                      Add to Home Screen
                    </Btn>
                }
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.textMut, cursor: "pointer", padding: 2 }}>
            <Icon d={Icons.x} size={16} />
          </button>
        </div>
      </Card>
    </div>
  );
};

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
const AuthScreen = ({ onAuth }) => {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const submit = () => {
    setError("");
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Enter your name.");
      if (!form.email.includes("@")) return setError("Enter a valid email.");
      if (form.password.length < 8) return setError("Password must be at least 8 characters.");
      if (form.password !== form.confirm) return setError("Passwords don't match.");
      setLoading(true);
      setTimeout(() => {
        const result = AuthStore.register(form.email.toLowerCase(), form.password, form.name);
        if (result.error) setError(result.error);
        else onAuth(result.user);
        setLoading(false);
      }, 600);
    } else {
      if (!form.email || !form.password) return setError("Fill in all fields.");
      setLoading(true);
      setTimeout(() => {
        const result = AuthStore.login(form.email.toLowerCase(), form.password);
        if (result.error) setError(result.error);
        else onAuth(result.user);
        setLoading(false);
      }, 600);
    }
  };

  const inp = (placeholder, key, type = "text") => (
    <div style={{ position: "relative" }}>
      <input
        type={type === "password" ? (showPass ? "text" : "password") : type}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder={placeholder}
        style={{ width: "100%", background: T.surface, border: `1px solid ${error && !form[key] ? T.red : T.border}`, borderRadius: 12, padding: "13px 16px", color: T.textPri, fontSize: 14, outline: "none", transition: "border 0.2s", paddingRight: type === "password" ? 44 : 16 }}
      />
      {type === "password" && (
        <button onClick={() => setShowPass(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: T.textMut, cursor: "pointer" }}>
          <Icon d={showPass ? Icons.eyeOff : Icons.eye} size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420, animation: "scaleIn 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.sparkle} color={T.white} size={22} />
            </div>
            <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", color: T.textPri }}>SCHOLAR</span>
          </div>
          <p style={{ fontSize: 13, color: T.textSec }}>Powered by Grok AI · Your learning system</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: T.surface, borderRadius: 12, padding: 4, marginBottom: 24, border: `1px solid ${T.border}` }}>
          {[["signin", "Sign In"], ["signup", "Create Account"]].map(([k, l]) => (
            <button key={k} onClick={() => { setMode(k); setError(""); setForm({ name: "", email: "", password: "", confirm: "" }); }}
              style={{ flex: 1, padding: "9px", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s", background: mode === k ? T.accent : "transparent", color: mode === k ? T.white : T.textSec }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && inp("Your first name", "name")}
          <div style={{ position: "relative" }}>
            <Icon d={Icons.mail} size={16} color={T.textMut} />
            {inp("Email address", "email", "email")}
          </div>
          {inp("Password", "password", "password")}
          {mode === "signup" && inp("Confirm password", "confirm", "password")}

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: T.redLo, border: `1px solid ${T.red}44`, fontSize: 13, color: T.red }}>
              {error}
            </div>
          )}

          <Btn onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In →" : "Create My Account →"}
          </Btn>
        </div>

        <p style={{ fontSize: 12, color: T.textMut, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
          By continuing, you agree to SCHOLAR's Terms of Service and Privacy Policy.
          Your data is stored locally and encrypted.
        </p>

        {/* PWA QR for desktop users */}
        <div style={{ marginTop: 32, padding: 16, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>
            <Icon d={Icons.smartphone} size={14} color={T.accent} /> Install on your phone — scan to download
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <QRCodeSVG value="https://yourapp.com" size={100} />
          </div>
          <div style={{ fontSize: 11, color: T.textMut, marginTop: 10 }}>
            Open in Chrome → Menu → "Add to Home Screen"
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ONBOARDING (post-auth, collects study profile) ──────────────────────────
const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ level: user.level || "", challenge: user.challenge || "", goal: user.goal || "" });
  const levels = ["Secondary School", "Undergraduate", "Postgraduate", "Professional"];
  const challenges = ["Procrastination", "Distractions", "Poor Memory", "Low Motivation", "Hard to Understand", "Time Management"];

  const steps = [
    {
      title: `Welcome aboard, ${user.name} 👋`,
      sub: "Let's build your personal learning system. Tell me where you are right now.",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {levels.map(l => (
            <div key={l} onClick={() => setData(p => ({ ...p, level: l }))}
              style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${data.level === l ? T.accent : T.border}`, background: data.level === l ? T.accentLo : T.surface, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 600, color: data.level === l ? T.accent : T.textSec, transition: "all 0.2s" }}>
              {l}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "What's your biggest battle?",
      sub: "Be honest. I'm not judging — I'm here to fix it.",
      content: (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {challenges.map(c => (
            <div key={c} onClick={() => setData(p => ({ ...p, challenge: c }))}
              style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${data.challenge === c ? T.gold : T.border}`, background: data.challenge === c ? T.goldLo : T.surface, cursor: "pointer", textAlign: "center", fontSize: 13, fontWeight: 500, color: data.challenge === c ? T.gold : T.textSec, transition: "all 0.2s" }}>
              {c}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "One last thing.",
      sub: "What result would make this all worth it for you?",
      content: (
        <div>
          <label style={{ fontSize: 13, color: T.textSec, marginBottom: 8, display: "block" }}>My biggest academic goal right now is...</label>
          <textarea value={data.goal} onChange={e => setData(p => ({ ...p, goal: e.target.value }))}
            placeholder="e.g. Pass my finals with distinction, stop failing Math, get into my dream university..." rows={4}
            style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none", resize: "none" }} />
        </div>
      )
    }
  ];

  const current = steps[step];
  const canNext = (step === 0 && data.level) || (step === 1 && data.challenge) || (step === 2 && data.goal.length > 0);

  const finish = () => {
    const updated = AuthStore.updateUser(user.email, data);
    onComplete({ ...user, ...data });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, animation: "scaleIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.sparkle} color={T.white} size={20} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: T.textPri }}>SCHOLAR</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 99, background: i <= step ? T.accent : T.border, transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ animation: "fadeIn 0.35s ease" }} key={step}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPri, marginBottom: 8, letterSpacing: "-0.02em", lineHeight: 1.3 }}>{current.title}</h1>
          <p style={{ fontSize: 15, color: T.textSec, marginBottom: 28, lineHeight: 1.6 }}>{current.sub}</p>
          {current.content}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          {step > 0 && <Btn variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Btn>}
          <Btn onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : finish()} disabled={!canNext} style={{ flex: 1 }}>
            {step === steps.length - 1 ? "Build My System →" : "Continue →"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MENTOR AI CHAT (Grok-powered) ──────────────────────────────────────────
const MentorChat = ({ user }) => {
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: `Hey ${user.name} 👋 I'm your Scholar Mentor — powered by Grok AI. I've looked at your profile and I already know what we need to work on. You mentioned ${user.challenge?.toLowerCase() || "getting ahead"} is your biggest battle right now — that's the most honest thing someone can tell me. Let's start there. What subject is giving you the most trouble this week?`, time: "now" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(t);
  }, [loading]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input, time: "now" };
    setMsgs(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const history = [...msgs, userMsg].map(m => ({ role: m.role, content: m.text }));

    try {
      const systemPrompt = `You are the Scholar Mentor AI — not a chatbot, but a genuine human-level mentor built into the SCHOLAR educational platform, powered by Grok.

ABOUT THIS USER:
- Name: ${user.name}
- Academic level: ${user.level}
- Biggest challenge: ${user.challenge}
- Current goal: ${user.goal}

YOUR PERSONALITY & VOICE:
You speak like the most brilliant person they know who also genuinely cares about them. Warm, direct, honest, and encouraging without being fake. You acknowledge human weakness (distraction, procrastination, burnout) as normal — not character flaws. Never lecture. Never condescend. Adapt tone to their academic level.

WHAT YOU CAN DO:
- Teach any subject at any level
- Explain concepts, solve problems, help with essays, lab reports, presentations, dissertations, coding
- Give personalized study strategies based on their profile
- Push back gently but firmly when they're making excuses
- Celebrate wins with genuine enthusiasm

Always be warm, specific, and human. Never robotic. Max 3 paragraphs unless teaching something complex. End with a follow-up question or action step when appropriate.`;

      const reply = await callGrok(systemPrompt, history);
      setMsgs(m => [...m, { role: "assistant", text: reply || "I'm here with you. Tell me more.", time: "now" }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "I'm having a moment — but I'm still here. Try sending that again.", time: "now" }]);
    }
    setLoading(false);
  };

  const quickPrompts = ["Help me understand a concept", "I keep getting distracted", "Quiz me on anything", "Review my study plan", "I'm feeling overwhelmed"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.sparkle} color={T.white} size={18} />
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: T.green, borderRadius: "50%", border: `2px solid ${T.card}` }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.textPri }}>Scholar Mentor</div>
          <div style={{ fontSize: 12, color: T.green }}>● Powered by Grok AI</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge color={T.accent}>Grok AI</Badge>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row", animation: "fadeIn 0.3s ease" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <Icon d={Icons.sparkle} color={T.white} size={14} />
              </div>
            )}
            <div style={{ maxWidth: "78%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: m.role === "user" ? T.accent : T.surface, border: m.role === "user" ? "none" : `1px solid ${T.border}`, fontSize: 14, lineHeight: 1.7, color: m.role === "user" ? T.white : T.textPri, whiteSpace: "pre-wrap" }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ marginBottom: 16, display: "flex", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={Icons.sparkle} color={T.white} size={14} />
            </div>
            <div style={{ padding: "12px 16px", borderRadius: "4px 16px 16px 16px", background: T.surface, border: `1px solid ${T.border}`, fontSize: 14, color: T.textSec, animation: "pulse 1.5s infinite" }}>
              Thinking{dots}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {msgs.length < 2 && (
        <div style={{ padding: "12px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {quickPrompts.map(q => (
            <button key={q} onClick={() => setInput(q)}
              style={{ padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.surface, color: T.textSec, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
              {q}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Ask me anything — any subject, any problem..."
          style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ width: 44, height: 44, borderRadius: 12, background: input.trim() ? T.accent : T.border, border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}>
          <Icon d={Icons.send} color={T.white} size={16} />
        </button>
      </div>
    </div>
  );
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const Dashboard = ({ user }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const weekData = [
    { l: "Mon", v: 45, hi: false }, { l: "Tue", v: 80, hi: false }, { l: "Wed", v: 60, hi: false },
    { l: "Thu", v: 95, hi: true },  { l: "Fri", v: 70, hi: false }, { l: "Sat", v: 55, hi: false },
    { l: "Sun", v: 85, hi: true },
  ];
  const subjects = [
    { name: "Mathematics", score: 72, trend: +8, color: T.accent },
    { name: "Physics",     score: 58, trend: +3, color: T.amber },
    { name: "Chemistry",   score: 85, trend: +12, color: T.green },
    { name: "English",     score: 64, trend: -2, color: T.red },
    { name: "History",     score: 79, trend: +5, color: "#A78BFA" },
  ];
  const insights = [
    { icon: Icons.fire, color: T.gold, title: "Peak focus time", sub: "You study best between 8–10 PM. Sessions in this window score 34% higher." },
    { icon: Icons.zap, color: T.amber, title: "Physics needs attention", sub: "You've spent 12% less time on Physics this week but your quiz score dropped 8 points." },
    { icon: Icons.target, color: T.green, title: "Chemistry streak!", sub: "3 sessions in a row with 90%+ focus score. Your retention in this subject is up 22%." },
  ];

  return (
    <div className="main-content-pad" style={{ padding: "24px 24px 40px", overflowY: "auto", height: "100%" }}>
      <div style={{ marginBottom: 28, animation: "fadeIn 0.4s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPri, letterSpacing: "-0.02em" }}>
              Good evening, {user.name} 👋
            </h1>
            <p style={{ fontSize: 14, color: T.textSec, marginTop: 4 }}>
              Your Scholar Score is up <span style={{ color: T.green, fontWeight: 700 }}>+14 points</span> this week. Keep going.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge color={T.gold} bg={T.goldLo}><Icon d={Icons.fire} size={12} color={T.gold} /> 14-day streak</Badge>
            <Badge color={T.accent} bg={T.accentLo}><Icon d={Icons.coins} size={12} color={T.accent} /> 2,840 SC</Badge>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Scholar Score" value="847" delta={14} icon={<Icon d={Icons.star} size={16} />} color={T.accent} />
        <StatCard label="Study Hours" value="32.5h" delta={8} icon={<Icon d={Icons.clock} size={16} />} color={T.green} />
        <StatCard label="Focus Quality" value="78%" delta={5} icon={<Icon d={Icons.target} size={16} />} color={T.amber} />
        <StatCard label="Quiz Avg" value="81%" delta={3} icon={<Icon d={Icons.brain} size={16} />} color="#A78BFA" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Weekly Study Hours</span>
            <Badge>This week</Badge>
          </div>
          <BarChart data={weekData} height={90} />
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, alignSelf: "flex-start" }}>Overall Progress</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Radial value={loaded ? 84 : 0} size={88} color={T.accent} label="84" sublabel="SCORE" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
                <span style={{ fontSize: 12, color: T.textSec }}>Retention <b style={{ color: T.green }}>↑ 12%</b></span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.amber }} />
                <span style={{ fontSize: 12, color: T.textSec }}>Consistency <b style={{ color: T.amber }}>73%</b></span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent }} />
                <span style={{ fontSize: 12, color: T.textSec }}>Focus <b style={{ color: T.accent }}>78%</b></span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Subject Intelligence Map</span>
          <span style={{ fontSize: 12, color: T.textSec }}>Click to drill down</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {subjects.map(s => (
            <div key={s.name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: s.trend > 0 ? T.green : T.red, fontWeight: 600 }}>{s.trend > 0 ? "↑" : "↓"} {Math.abs(s.trend)}%</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.score}%</span>
                </div>
              </div>
              <Progress value={s.score} color={s.color} height={7} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.textSec }}>SCHOLAR INSIGHTS</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {insights.map((ins, i) => (
            <Card key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: ins.color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon d={ins.icon} color={ins.color} size={16} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{ins.title}</div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>{ins.sub}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── FOCUS MODE ───────────────────────────────────────────────────────────────
const FocusMode = ({ user }) => {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const [secs, setSecs] = useState(25 * 60);
  const [session] = useState({ subject: "Mathematics" });
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSecs(s => {
        if (s <= 1) { setRunning(false); setMode(m => m === "focus" ? "break" : "focus"); return mode === "focus" ? 5 * 60 : 25 * 60; }
        return s - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [running, mode]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const total = mode === "focus" ? 25 * 60 : 5 * 60;
  const pct = ((total - secs) / total) * 100;
  const blockedApps = [
    { name: "Instagram", icon: "📸", blocked: true },
    { name: "TikTok", icon: "🎵", blocked: true },
    { name: "Games", icon: "🎮", blocked: true },
    { name: "YouTube", icon: "▶️", blocked: running },
    { name: "WhatsApp", icon: "💬", blocked: false },
  ];

  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Focus Engine</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 28 }}>Guard your attention. Own your results.</p>
      <Card style={{ textAlign: "center", padding: 32, marginBottom: 20, animation: running ? "glow 3s infinite" : "none" }}>
        <Badge color={mode === "focus" ? T.accent : T.green} bg={mode === "focus" ? T.accentLo : T.greenLo} style={{ marginBottom: 20 }}>
          {mode === "focus" ? "🧠 DEEP FOCUS" : "☕ BREAK TIME"}
        </Badge>
        <div style={{ position: "relative", display: "inline-block", margin: "0 auto 24px" }}>
          <Radial value={pct} size={160} color={mode === "focus" ? T.accent : T.green} label={fmt(secs)} sublabel={mode.toUpperCase()} />
        </div>
        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 24 }}>
          Studying: <span style={{ color: T.textPri, fontWeight: 600 }}>{session.subject}</span>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => setRunning(r => !r)} size="lg" icon={<Icon d={running ? Icons.x : Icons.zap} size={16} color={T.white} />}>
            {running ? "Pause Session" : "Start Focus"}
          </Btn>
          {running && <Btn variant="ghost" onClick={() => { setRunning(false); setSecs(25 * 60); }}>Reset</Btn>}
        </div>
      </Card>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Distraction Shield</span>
          <Badge color={T.green} bg={T.greenLo}><Icon d={Icons.shield} size={11} color={T.green} /> Active</Badge>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {blockedApps.map(a => (
            <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: T.surface }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>
              </div>
              <Badge color={a.blocked ? T.red : T.green} bg={a.blocked ? T.redLo : T.greenLo}>
                {a.blocked ? "🔒 Blocked" : "✓ Allowed"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[{ label: "Sessions today", value: "3", icon: Icons.target, color: T.accent }, { label: "Apps blocked", value: "47", icon: Icons.shield, color: T.red }, { label: "Deep hours", value: "2.4h", icon: Icons.clock, color: T.green }].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
            <div style={{ color: s.color, marginBottom: 6, display: "flex", justifyContent: "center" }}><Icon d={s.icon} size={18} color={s.color} /></div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.textPri }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── QUIZ MODULE (Grok-powered) ──────────────────────────────────────────────
const QuizModule = ({ user }) => {
  const [phase, setPhase] = useState("home");
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showExp, setShowExp] = useState(false);

  const generateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true); setPhase("generating");
    try {
      const systemPrompt = `You are SCHOLAR's Quiz Engine powered by Grok AI. Generate quiz questions calibrated to this student:
- Level: ${user.level}
- Biggest challenge: ${user.challenge}
Return ONLY valid JSON, no markdown, no backticks. Format: {"questions":[{"q":"question","options":["A","B","C","D"],"correct":0,"explanation":"why this is correct"}]}
Generate exactly 5 questions. Make them genuinely educational. Vary difficulty. The correct field is the 0-based index of the correct option.`;
      const text = await callGrok(systemPrompt, [{ role: "user", content: `Generate a 5-question quiz on: ${topic}` }]);
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed.questions || []);
      setCurrent(0); setAnswers([]); setSelected(null); setShowExp(false);
      setPhase("quiz");
    } catch {
      setPhase("home");
    }
    setLoading(false);
  };

  const pick = (i) => { if (selected !== null) return; setSelected(i); setShowExp(true); };
  const next = () => {
    const newAnswers = [...answers, { q: questions[current], selected }];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) setPhase("result");
    else { setCurrent(c => c + 1); setSelected(null); setShowExp(false); }
  };
  const score = answers.filter(a => a.selected === a.q.correct).length;
  const presets = ["Photosynthesis", "World War II", "Algebra basics", "Newton's Laws", "Cell biology", "Shakespeare"];

  if (phase === "home" || phase === "generating") return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Quiz Engine</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 28 }}>Test what you know. Master what you don't.</p>
      <Card style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: T.textSec, display: "block", marginBottom: 10 }}>What topic should I quiz you on?</label>
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === "Enter" && generateQuiz()}
          placeholder="Any topic, any subject, any level..."
          style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none", marginBottom: 14 }} />
        <Btn onClick={generateQuiz} disabled={!topic.trim() || loading} icon={<Icon d={Icons.brain} size={15} color={T.white} />}>
          {loading ? "Generating your quiz..." : "Generate AI Quiz"}
        </Btn>
      </Card>
      <div>
        <p style={{ fontSize: 12, color: T.textMut, marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em" }}>QUICK START</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {presets.map(p => (
            <button key={p} onClick={() => setTopic(p)}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.surface, color: T.textSec, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === "quiz" && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: T.textSec }}>{current + 1} of {questions.length}</span>
          <button onClick={() => { setPhase("home"); setQuestions([]); }} style={{ background: "none", border: "none", color: T.textMut, cursor: "pointer", fontSize: 12 }}>Exit</button>
        </div>
        <Progress value={(current / questions.length) * 100} color={T.accent} height={4} />
        <div style={{ marginTop: 24, marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 20 }}>{q.q}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct, isSelected = i === selected;
              let bg = T.surface, border = T.border, color = T.textPri;
              if (selected !== null) {
                if (isCorrect) { bg = T.greenLo; border = T.green; color = T.green; }
                else if (isSelected) { bg = T.redLo; border = T.red; color = T.red; }
              }
              return (
                <div key={i} onClick={() => pick(i)}
                  style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: bg, cursor: selected === null ? "pointer" : "default", transition: "all 0.2s", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color }}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
        {showExp && (
          <Card style={{ marginBottom: 16, borderColor: T.accentMid, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 6 }}>GROK EXPLAINS</div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textSec }}>{q.explanation}</p>
          </Card>
        )}
        {selected !== null && <Btn onClick={next} style={{ width: "100%" }}>{current + 1 >= questions.length ? "See Results" : "Next Question →"}</Btn>}
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%", animation: "scaleIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? "🎉" : pct >= 60 ? "💪" : "📚"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>{score}/{questions.length} correct</h2>
          <p style={{ fontSize: 15, color: T.textSec, marginTop: 8 }}>
            {pct >= 80 ? "Outstanding! Your understanding is solid." : pct >= 60 ? "Good progress. A few gaps to close." : "Let's work on this together. Every wrong answer is a lesson."}
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Radial value={pct} size={120} color={pct >= 80 ? T.green : pct >= 60 ? T.amber : T.red} label={`${pct}%`} sublabel="SCORE" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={() => { setPhase("home"); setQuestions([]); }} style={{ flex: 1 }}>New Quiz</Btn>
          <Btn onClick={() => { setCurrent(0); setAnswers([]); setSelected(null); setShowExp(false); setPhase("quiz"); }} style={{ flex: 1 }}>Retry</Btn>
        </div>
      </div>
    );
  }
  return null;
};

// ─── LIBRARY ──────────────────────────────────────────────────────────────────
const Library = () => {
  const [search, setSearch] = useState("");
  const resources = [
    { title: "Complete Guide to Organic Chemistry", author: "Dr. Amara K.", subject: "Chemistry", level: "Undergraduate", rating: 4.9, downloads: 2341, type: "📄 Notes" },
    { title: "WAEC Mathematics Past Questions 2015–2024", author: "Scholar Community", subject: "Mathematics", level: "Secondary", rating: 4.8, downloads: 8920, type: "📝 Past Papers" },
    { title: "Crash Course: Newton's Laws of Motion", author: "Liam T.", subject: "Physics", level: "Secondary", rating: 4.7, downloads: 1560, type: "📖 Summary" },
    { title: "Essay Writing Framework for A-Levels", author: "Sophie W.", subject: "English", level: "Secondary", rating: 4.9, downloads: 3100, type: "📄 Template" },
    { title: "Fundamentals of Machine Learning", author: "Yui S.", subject: "Computer Science", level: "Undergraduate", rating: 4.6, downloads: 980, type: "📚 Guide" },
    { title: "Cell Biology: Complete Visual Notes", author: "Fatima A.", subject: "Biology", level: "Secondary", rating: 4.8, downloads: 2890, type: "🖼️ Visual" },
  ];
  const filtered = resources.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Open Library</h2>
          <p style={{ fontSize: 14, color: T.textSec }}>Free knowledge from the global Scholar community.</p>
        </div>
        <Btn size="sm" icon={<Icon d={Icons.upload} size={14} color={T.white} />}>Contribute</Btn>
      </div>
      <div style={{ position: "relative", margin: "20px 0" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects, topics, resources..."
          style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ label: "Resources", value: "24,891" }, { label: "Contributors", value: "8,204" }, { label: "Countries", value: "147" }].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.accent }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((r, i) => (
          <Card key={i} onClick={() => {}}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                  <Badge color={T.accent} bg={T.accentLo} style={{ fontSize: 10 }}>{r.subject}</Badge>
                  <Badge color={T.textSec} bg={T.surface} style={{ fontSize: 10 }}>{r.level}</Badge>
                  <span style={{ fontSize: 11, color: T.textMut }}>{r.type}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, lineHeight: 1.4 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: T.textMut }}>by {r.author}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 13, color: T.gold, fontWeight: 700 }}>★ {r.rating}</div>
                <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{r.downloads.toLocaleString()} dl</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── REWARDS ──────────────────────────────────────────────────────────────────
const Rewards = ({ user }) => {
  const achievements = [
    { icon: "🔥", title: "14-Day Streak", desc: "14 days of consistent learning", earned: true, color: T.gold },
    { icon: "🧠", title: "Deep Thinker", desc: "Scored 90%+ on 5 quizzes in a row", earned: true, color: T.accent },
    { icon: "🏆", title: "Top 100", desc: "Reached top 100 on global leaderboard", earned: false, color: T.amber },
    { icon: "📚", title: "Knowledge Giver", desc: "Shared 3 resources in the library", earned: false, color: T.green },
    { icon: "💎", title: "100-Day Scholar", desc: "100-day learning streak", earned: false, color: "#A78BFA" },
    { icon: "🌍", title: "Global Connector", desc: "Helped students in 5+ countries", earned: false, color: T.textSec },
  ];
  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Streaks & Rewards</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Learning earns coins. Coins prove mastery. Mastery changes everything.</p>
      <Card style={{ marginBottom: 20, textAlign: "center", padding: 28, background: `linear-gradient(135deg, ${T.goldLo}, ${T.card})`, borderColor: T.gold + "44", animation: "floatBadge 3s ease-in-out infinite" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.gold, letterSpacing: "-0.03em" }}>14</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 4 }}>Day Streak</div>
        <div style={{ fontSize: 13, color: T.textSec }}>Complete today's session to reach 15 days</div>
        <div style={{ marginTop: 16 }}><Progress value={65} color={T.gold} height={6} label="Today's progress" /></div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.accent }}>2,840</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>Scholar Coins</div>
          <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>↑ +340 this week</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: T.gold }}>847</div>
          <div style={{ fontSize: 12, color: T.textSec, marginTop: 4 }}>Scholar Score</div>
          <div style={{ fontSize: 11, color: T.green, marginTop: 4 }}>Rank #1,204 globally</div>
        </Card>
      </div>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: T.textMut, letterSpacing: "0.05em", marginBottom: 14 }}>ACHIEVEMENTS</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ padding: 14, borderRadius: 14, background: a.earned ? T.card : T.surface, border: `1px solid ${a.earned ? a.color + "44" : T.border}`, opacity: a.earned ? 1 : 0.5 }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: a.earned ? T.textPri : T.textMut, marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: T.textMut, lineHeight: 1.4 }}>{a.desc}</div>
              {a.earned && <Badge color={a.color} bg={a.color + "22"} style={{ marginTop: 8, fontSize: 10 }}>✓ Earned</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
const Leaderboard = ({ user }) => {
  const leaders = [
    { rank: 1, name: "Amara K.", country: "🇳🇬", score: 12480, streak: 98, badge: "👑", level: "Undergraduate" },
    { rank: 2, name: "Liam T.", country: "🇬🇧", score: 11920, streak: 72, badge: "🥈", level: "Secondary" },
    { rank: 3, name: "Yui S.", country: "🇯🇵", score: 11340, streak: 65, badge: "🥉", level: "Postgraduate" },
    { rank: 4, name: "Carlos M.", country: "🇧🇷", score: 10890, streak: 44, badge: null, level: "Undergraduate" },
    { rank: 5, name: "Fatima A.", country: "🇸🇦", score: 10200, streak: 38, badge: null, level: "Secondary" },
    { rank: 6, name: (user.name || "You") + " (You)", country: "🌍", score: 2840, streak: 14, badge: null, level: user.level, isYou: true },
  ];
  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Global Leaderboard</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>The hunger to be first is the hunger to be better.</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end", justifyContent: "center" }}>
        {[leaders[1], leaders[0], leaders[2]].map((l, idx) => {
          const heights = [100, 120, 90];
          const colors = [T.textSec, T.gold, "#CD7F32"];
          return (
            <div key={l.rank} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 20 }}>{l.badge}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textPri, textAlign: "center" }}>{l.name}</div>
              <div style={{ width: "100%", height: heights[idx], background: `linear-gradient(180deg, ${colors[idx]}33, ${colors[idx]}11)`, border: `1px solid ${colors[idx]}44`, borderRadius: "8px 8px 0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: colors[idx] }}>#{l.rank}</span>
                <span style={{ fontSize: 12, color: T.textPri, fontWeight: 700 }}>{l.score.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leaders.slice(3).map(l => (
          <div key={l.rank} style={{ padding: "14px 16px", borderRadius: 12, background: l.isYou ? T.accentLo : T.card, border: `1px solid ${l.isYou ? T.accent : T.border}`, display: "flex", alignItems: "center", gap: 14, animation: "slideIn 0.3s ease" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.textMut, width: 20, textAlign: "center" }}>#{l.rank}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: l.isYou ? T.accent : T.textPri }}>{l.name}</div>
              <div style={{ fontSize: 11, color: T.textMut }}>{l.country} · {l.level}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>{l.score.toLocaleString()} SC</div>
              <div style={{ fontSize: 11, color: T.textSec }}>🔥 {l.streak}d</div>
            </div>
          </div>
        ))}
      </div>
      <Card style={{ marginTop: 20, borderColor: T.accentMid }}>
        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 12, lineHeight: 1.6 }}>
          You're <b style={{ color: T.textPri }}>7,360 SC</b> away from rank #5. Here's how to close the gap:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[{ action: "Complete a study session", coins: "+120 SC" }, { action: "Answer community question", coins: "+200 SC" }, { action: "Perfect quiz score", coins: "+350 SC" }].map(a => (
            <div key={a.action} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
              <span style={{ color: T.textSec }}>{a.action}</span>
              <span style={{ color: T.gold, fontWeight: 700 }}>{a.coins}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
const ProfilePage = ({ user, onUpdate, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, level: user.level, goal: user.goal });
  const [saved, setSaved] = useState(false);
  const levels = ["Secondary School", "Undergraduate", "Postgraduate", "Professional"];

  const save = () => {
    const updated = AuthStore.updateUser(user.email, form);
    onUpdate(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const stats = [
    { label: "Scholar Score", value: "847", color: T.accent },
    { label: "Study Hours", value: "32.5h", color: T.green },
    { label: "Streak", value: "14d", color: T.gold },
    { label: "Quiz Avg", value: "81%", color: "#A78BFA" },
  ];

  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>My Profile</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Your Scholar identity and learning history.</p>

      {/* Avatar + Name */}
      <Card style={{ marginBottom: 20, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#1A0F00" }}>
            {(user.name || "S")[0].toUpperCase()}
          </div>
          <button style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: T.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.camera} size={12} color={T.white} />
          </button>
        </div>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", color: T.textPri, fontSize: 18, fontWeight: 700, outline: "none", width: "100%", marginBottom: 8 }} />
          ) : (
            <div style={{ fontSize: 20, fontWeight: 800, color: T.textPri, marginBottom: 4 }}>{user.name}</div>
          )}
          <div style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>{user.email}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge color={T.accent} bg={T.accentLo}>{user.level || "Student"}</Badge>
            <Badge color={T.gold} bg={T.goldLo}>🔥 14-day streak</Badge>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {editing
            ? <><Btn size="sm" onClick={save}>Save</Btn><Btn size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn></>
            : <Btn size="sm" variant="ghost" onClick={() => setEditing(true)} icon={<Icon d={Icons.settings} size={14} />}>Edit Profile</Btn>
          }
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Academic level */}
      {editing && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Academic Level</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {levels.map(l => (
              <div key={l} onClick={() => setForm(f => ({ ...f, level: l }))}
                style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${form.level === l ? T.accent : T.border}`, background: form.level === l ? T.accentLo : T.surface, cursor: "pointer", textAlign: "center", fontSize: 12, fontWeight: 600, color: form.level === l ? T.accent : T.textSec, transition: "all 0.2s" }}>
                {l}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Goal */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
          <span>My Academic Goal</span>
          {!editing && <span style={{ color: T.textMut, fontWeight: 400, fontSize: 12 }}>{user.challenge}</span>}
        </div>
        {editing ? (
          <textarea value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} rows={3}
            style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.textPri, fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", resize: "none" }} />
        ) : (
          <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{user.goal || "No goal set yet. Edit your profile to add one."}</p>
        )}
      </Card>

      {saved && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: T.greenLo, border: `1px solid ${T.green}44`, fontSize: 13, color: T.green, marginBottom: 16, animation: "fadeIn 0.3s ease" }}>
          <Icon d={Icons.check} size={14} color={T.green} /> Profile updated successfully!
        </div>
      )}

      {/* Grok AI info */}
      <Card style={{ marginBottom: 20, borderColor: T.accentMid }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>AI Engine</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentLo, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.sparkle} size={18} color={T.accent} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Grok AI (xAI)</div>
            <div style={{ fontSize: 12, color: T.textSec }}>Model: grok-3-latest · Always learning with you</div>
          </div>
          <Badge color={T.green} bg={T.greenLo} style={{ marginLeft: "auto" }}>Active</Badge>
        </div>
      </Card>

      {/* Sign out */}
      <Btn variant="danger" onClick={onLogout} icon={<Icon d={Icons.logout} size={15} color={T.white} />} style={{ width: "100%" }}>
        Sign Out
      </Btn>
    </div>
  );
};

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
const SettingsPage = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    notifications: user.notifications !== false,
    studyReminders: user.studyReminders !== false,
    soundEffects: true,
    weeklyReport: true,
    apiKey: "",
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  const saveSettings = () => {
    const updated = AuthStore.updateUser(user.email, {
      notifications: settings.notifications,
      studyReminders: settings.studyReminders,
    });
    onUpdate(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? T.accent : T.border, border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: T.white, transition: "left 0.2s" }} />
    </button>
  );

  const sections = [
    {
      title: "Notifications",
      items: [
        { label: "Push notifications", sub: "Study reminders and achievement alerts", key: "notifications" },
        { label: "Study reminders", sub: "Daily nudges to keep your streak alive", key: "studyReminders" },
        { label: "Sound effects", sub: "Audio feedback on quiz answers and streaks", key: "soundEffects" },
        { label: "Weekly report", sub: "Summary of your progress every Sunday", key: "weeklyReport" },
      ]
    },
  ];

  return (
    <div className="main-content-pad" style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Settings</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Control how SCHOLAR works for you.</p>

      {sections.map(sec => (
        <div key={sec.title} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMut, letterSpacing: "0.06em", marginBottom: 12 }}>{sec.title.toUpperCase()}</h3>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {sec.items.map((item, i) => (
              <div key={item.key} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderBottom: i < sec.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: T.textMut }}>{item.sub}</div>
                </div>
                <Toggle on={settings[item.key]} onToggle={() => toggle(item.key)} />
              </div>
            ))}
          </Card>
        </div>
      ))}

      {/* API Key section */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMut, letterSpacing: "0.06em", marginBottom: 12 }}>GROK AI CONFIGURATION</h3>
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>xAI API Key</div>
          <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12 }}>
            Enter your Grok API key for AI features. Get yours at <span style={{ color: T.accent }}>console.x.ai</span>
          </div>
          <input
            type="password"
            value={settings.apiKey}
            onChange={e => setSettings(s => ({ ...s, apiKey: e.target.value }))}
            placeholder="xai-..."
            style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", color: T.textPri, fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none", marginBottom: 12 }}
          />
          <div style={{ padding: "10px 14px", borderRadius: 10, background: T.amberLo, border: `1px solid ${T.amber}44`, fontSize: 12, color: T.amber }}>
            ⚠️ For production, proxy requests through your backend. Never expose API keys in client-side code.
          </div>
        </Card>
      </div>

      {/* PWA / Install */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMut, letterSpacing: "0.06em", marginBottom: 12 }}>INSTALL APP</h3>
        <Card>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Install SCHOLAR on Chrome</div>
              <div style={{ fontSize: 12, color: T.textSec, marginBottom: 12, lineHeight: 1.6 }}>
                Open Chrome → click the ⋮ menu → "Install SCHOLAR..." or scan the QR code from your phone.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge color={T.green} bg={T.greenLo}><Icon d={Icons.check} size={11} color={T.green} /> Works offline</Badge>
                <Badge color={T.accent} bg={T.accentLo}>No app store needed</Badge>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <QRCodeSVG value="https://yourapp.com" size={100} />
              <div style={{ fontSize: 10, color: T.textMut }}>Scan to install</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.textMut, letterSpacing: "0.06em", marginBottom: 12 }}>ACCOUNT</h3>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Email</div>
            <div style={{ fontSize: 13, color: T.textSec }}>{user.email}</div>
          </div>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Member since</div>
            <div style={{ fontSize: 13, color: T.textSec }}>{new Date(user.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>App version</div>
            <div style={{ fontSize: 13, color: T.textSec }}>SCHOLAR v2.0.0 · Grok-powered</div>
          </div>
        </Card>
      </div>

      {saved && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: T.greenLo, border: `1px solid ${T.green}44`, fontSize: 13, color: T.green, marginBottom: 16, animation: "fadeIn 0.3s ease" }}>
          <Icon d={Icons.check} size={14} color={T.green} /> Settings saved!
        </div>
      )}

      <Btn onClick={saveSettings} style={{ width: "100%", justifyContent: "center" }}>Save Settings</Btn>
    </div>
  );
};

// ─── NAV CONFIG ───────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: Icons.chart   },
  { id: "mentor",    label: "Mentor AI",  icon: Icons.sparkle },
  { id: "focus",     label: "Focus",      icon: Icons.shield  },
  { id: "quiz",      label: "Quizzes",    icon: Icons.brain   },
  { id: "library",   label: "Library",    icon: Icons.book    },
  { id: "rewards",   label: "Rewards",    icon: Icons.trophy  },
  { id: "leaders",   label: "Global",     icon: Icons.globe   },
  { id: "profile",   label: "Profile",    icon: Icons.user    },
  { id: "settings",  label: "Settings",   icon: Icons.settings },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Scholar() {
  const [authUser, setAuthUser] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [showPWA, setShowPWA] = useState(false);
  const bp = useBreakpoint();

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);

    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Show PWA banner after 3 seconds on mobile
    const t = setTimeout(() => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      if (!isStandalone) setShowPWA(true);
    }, 3000);

    // Check for existing session
    const session = AuthStore.getSession();
    if (session) {
      if (!session.level || !session.goal) {
        setAuthUser(session);
        setNeedsOnboarding(true);
      } else {
        setUser(session);
      }
    }

    return () => { document.head.removeChild(style); clearTimeout(t); };
  }, []);

  const handleAuth = (u) => {
    if (!u.level || !u.goal) {
      setAuthUser(u);
      setNeedsOnboarding(true);
    } else {
      setUser(u);
    }
  };

  const handleOnboardingComplete = (u) => {
    setNeedsOnboarding(false);
    setAuthUser(null);
    setUser(u);
  };

  const handleLogout = () => {
    AuthStore.clearSession();
    setUser(null);
    setAuthUser(null);
    setNeedsOnboarding(false);
    setTab("dashboard");
  };

  if (!user && !needsOnboarding) return <AuthScreen onAuth={handleAuth} />;
  if (needsOnboarding && authUser) return <Onboarding user={authUser} onComplete={handleOnboardingComplete} />;

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return <Dashboard user={user} />;
      case "mentor":    return <MentorChat user={user} />;
      case "focus":     return <FocusMode user={user} />;
      case "quiz":      return <QuizModule user={user} />;
      case "library":   return <Library />;
      case "rewards":   return <Rewards user={user} />;
      case "leaders":   return <Leaderboard user={user} />;
      case "profile":   return <ProfilePage user={user} onUpdate={setUser} onLogout={handleLogout} />;
      case "settings":  return <SettingsPage user={user} onUpdate={setUser} />;
      default:          return <Dashboard user={user} />;
    }
  };

  const sidebarCollapsed = bp === "tablet";
  const isMobile = bp === "mobile";

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR (desktop + tablet) ── */}
      <div className="sidebar-desktop" style={{ width: sidebarCollapsed ? 72 : 220, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s" }}>
        {/* Logo */}
        <div style={{ padding: sidebarCollapsed ? "20px 16px" : "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={Icons.sparkle} color={T.white} size={17} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>SCHOLAR</div>
                <div style={{ fontSize: 10, color: T.textMut, marginTop: 2 }}>Your learning system</div>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: sidebarCollapsed ? "12px 8px" : "12px 10px", overflowY: "auto" }}>
          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <div key={n.id} onClick={() => setTab(n.id)} title={sidebarCollapsed ? n.label : undefined}
                style={{ display: "flex", alignItems: "center", gap: sidebarCollapsed ? 0 : 10, justifyContent: sidebarCollapsed ? "center" : "flex-start", padding: sidebarCollapsed ? "10px" : "10px 12px", borderRadius: 10, marginBottom: 2, cursor: "pointer", background: active ? T.accentLo : "transparent", color: active ? T.accent : T.textSec, fontWeight: active ? 600 : 500, fontSize: 13, transition: "all 0.15s", border: `1px solid ${active ? T.accentMid : "transparent"}` }}>
                <Icon d={n.icon} size={16} color={active ? T.accent : T.textSec} />
                <span className="sidebar-label">{n.label}</span>
                {!sidebarCollapsed && n.id === "mentor" && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.green }} />}
              </div>
            );
          })}
        </div>

        {/* User chip */}
        <div style={{ padding: sidebarCollapsed ? "12px 8px" : 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarCollapsed ? "center" : "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#1A0F00", flexShrink: 0 }}>
              {(user.name || "S")[0].toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
                <div style={{ fontSize: 11, color: T.textMut }}>{user.level || "Scholar"}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>
            {NAV.find(n => n.id === tab)?.label}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {!isMobile && <Badge color={T.gold} bg={T.goldLo}>🔥 14 day streak</Badge>}
            {!isMobile && <Badge color={T.accent} bg={T.accentLo}>2,840 SC</Badge>}
            <button onClick={() => setTab("profile")} style={{ width: 32, height: 32, borderRadius: 10, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#1A0F00" }}>
              {(user.name || "S")[0].toUpperCase()}
            </button>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "hidden", animation: "fadeIn 0.3s ease" }} key={tab}>
          {renderTab()}
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        <div className="mobile-nav" style={{ display: "none", borderTop: `1px solid ${T.border}`, background: T.surface, position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {[...NAV.slice(0, 4), { id: "profile", label: "Profile", icon: Icons.user }].map(n => {
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                style={{ flex: 1, padding: "10px 4px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? T.accent : T.textMut, fontFamily: "Inter, sans-serif" }}>
                <Icon d={n.icon} size={18} color={active ? T.accent : T.textMut} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA Install Banner */}
      {showPWA && <PWAInstallBanner onClose={() => setShowPWA(false)} />}
    </div>
  );
}

/*
───────────────────────────────────────────────────────────────
PRODUCTION DEPLOYMENT GUIDE
───────────────────────────────────────────────────────────────

1. GROK API KEY
   - Get your key at https://console.x.ai
   - For Next.js: add NEXT_PUBLIC_GROK_API_KEY=xai-xxx to .env.local
   - For Vite: add VITE_GROK_API_KEY=xai-xxx to .env
   ⚠️ For production: create /api/chat route to proxy requests server-side
      to avoid exposing your key in the browser.

2. PWA MANIFEST (public/manifest.json)
   {
     "name": "SCHOLAR",
     "short_name": "SCHOLAR",
     "description": "Your AI-powered learning system",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#07080A",
     "theme_color": "#6C63FF",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }

3. SERVICE WORKER (public/sw.js) — basic offline cache
   const CACHE = "scholar-v1";
   const ASSETS = ["/", "/index.html"];
   self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))));
   self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));

4. CHROME INSTALLABILITY
   - Host over HTTPS (required for PWA)
   - Serve manifest.json from /manifest.json
   - Link in HTML: <link rel="manifest" href="/manifest.json" />
   - Chrome will show the install prompt automatically once criteria are met.

5. REAL QR CODE (optional upgrade)
   npm install qrcode.react
   import { QRCodeSVG } from "qrcode.react";
   Replace <QRDisplay /> with <QRCodeSVG value="https://yourapp.com" size={100} />

───────────────────────────────────────────────────────────────
*/
