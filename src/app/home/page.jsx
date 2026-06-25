import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
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

// ─── ICONS ──────────────────────────────────────────────────────────────────
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
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: ${T.bg}; color: ${T.textPri}; font-family: 'Inter', sans-serif; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
  ::selection { background: ${T.accentMid}; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes glow { 0%,100% { box-shadow: 0 0 8px ${T.accent}44; } 50% { box-shadow: 0 0 24px ${T.accent}88; } }
  @keyframes typing { from { width: 0; } to { width: 100%; } }
  @keyframes blink { 50% { border-color: transparent; } }
  @keyframes slideIn { from { transform: translateX(-16px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes floatBadge { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
`;

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
    ...(onClick ? { ":hover": { borderColor: T.borderHi } } : {}),
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

// ─── MINI BAR CHART ─────────────────────────────────────────────────────────
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

// ─── RADIAL PROGRESS ────────────────────────────────────────────────────────
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

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: "", level: "", challenge: "", goal: "" });
  const levels = ["Secondary School", "Undergraduate", "Postgraduate", "Professional"];
  const challenges = ["Procrastination", "Distractions", "Poor Memory", "Low Motivation", "Hard to Understand", "Time Management"];

  const steps = [
    {
      title: "Welcome to SCHOLAR.",
      sub: "The last study app you'll ever need. Let's build your personal system.",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: T.textSec, marginBottom: 8, display: "block" }}>What should I call you?</label>
            <input value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))}
              placeholder="Your first name..." style={{ width: "100%", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 15, fontFamily: "Inter, sans-serif", outline: "none" }} />
          </div>
        </div>
      )
    },
    {
      title: `Good to meet you, ${data.name || "Scholar"}.`,
      sub: "Tell me where you are right now, so I can meet you there.",
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
      title: "What's your biggest battle right now?",
      sub: "Be honest. I'm not judging. I'm here to fix it.",
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
      sub: "What result would make this all worth it?",
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
  const canNext = (step === 0 && data.name.length > 0) || (step === 1 && data.level) || (step === 2 && data.challenge) || (step === 3 && data.goal.length > 0);

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480, animation: "scaleIn 0.4s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.sparkle} color={T.white} size={20} />
            </div>
            <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: T.textPri }}>SCHOLAR</span>
          </div>
        </div>

        {/* Progress dots */}
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
          <Btn onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onComplete(data)} disabled={!canNext} style={{ flex: 1 }}>
            {step === steps.length - 1 ? "Build My System →" : "Continue →"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// ─── MENTOR AI CHAT ──────────────────────────────────────────────────────────
const MentorChat = ({ user }) => {
  const [msgs, setMsgs] = useState([
    { role: "assistant", text: `Hey ${user.name} 👋 I'm your Scholar Mentor. I've looked at your profile and I already know what we need to work on. You mentioned ${user.challenge?.toLowerCase()} is your biggest battle right now — that's honestly the most honest thing someone can tell me. Let's start there. What subject is giving you the most trouble this week?`, time: "now" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(".");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, loading]);

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

    const conversationHistory = [...msgs, userMsg].map(m => ({
      role: m.role,
      content: m.text
    }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You are the Scholar Mentor AI — not a chatbot, but a genuine human-level mentor, teacher, and guardian built into the SCHOLAR educational platform.

ABOUT THIS USER:
- Name: ${user.name}
- Academic level: ${user.level}
- Biggest challenge: ${user.challenge}
- Current goal: ${user.goal}

YOUR PERSONALITY & VOICE:
You speak like the most brilliant person they know who also genuinely cares about them. You are warm, direct, honest, and encouraging without being fake. You acknowledge human weakness (distraction, procrastination, burnout) as normal — not character flaws. You never lecture. Never condescend. You adapt your tone to their academic level.

WHAT YOU CAN DO:
- Teach any subject, any level — from secondary school to professional level
- Explain concepts, write essays, solve problems, help with lab reports, presentations, case studies, dissertations, coding
- Give personalized study strategies based on their profile
- Push back (gently but firmly) when they're making excuses
- Celebrate wins with genuine enthusiasm
- Detect frustration and recalibrate accordingly

TONE EXAMPLES:
Wrong: "I have detected your study efficiency has decreased."
Right: "Hey — I noticed this week has been rough. Let's fix that together."

Wrong: "Incorrect. The answer is mitosis."
Right: "Close — here's why your thinking almost got there, and here's how to remember the difference forever."

Always be warm, specific, and human. Never robotic. Max 3 paragraphs unless teaching something complex. End with a follow-up question or action step when appropriate.`,
          messages: conversationHistory,
        })
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || "I'm here with you. Tell me more.";
      setMsgs(m => [...m, { role: "assistant", text: reply, time: "now" }]);
    } catch {
      setMsgs(m => [...m, { role: "assistant", text: "I'm having a moment — but I'm still here. Try sending that again.", time: "now" }]);
    }
    setLoading(false);
  };

  const quickPrompts = [
    "Help me understand a concept", "I keep getting distracted", "Quiz me on anything",
    "Review my study plan", "I'm feeling overwhelmed"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.sparkle} color={T.white} size={18} />
          </div>
          <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, background: T.green, borderRadius: "50%", border: `2px solid ${T.card}` }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: T.textPri }}>Scholar Mentor</div>
          <div style={{ fontSize: 12, color: T.green }}>● Online — always here for you</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge color={T.accent}>AI Powered</Badge>
        </div>
      </div>

      {/* Messages */}
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

      {/* Quick prompts */}
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

      {/* Input */}
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
    <div style={{ padding: "24px 24px 40px", overflowY: "auto", height: "100%" }}>
      {/* Welcome */}
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
            <Badge color={T.gold} bg={T.goldLo}>
              <Icon d={Icons.fire} size={12} color={T.gold} /> 14-day streak
            </Badge>
            <Badge color={T.accent} bg={T.accentLo}>
              <Icon d={Icons.coins} size={12} color={T.accent} /> 2,840 SC
            </Badge>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Scholar Score" value="847" delta={14} icon={<Icon d={Icons.star} size={16} />} color={T.accent} />
        <StatCard label="Study Hours" value="32.5h" delta={8} icon={<Icon d={Icons.clock} size={16} />} color={T.green} />
        <StatCard label="Focus Quality" value="78%" delta={5} icon={<Icon d={Icons.target} size={16} />} color={T.amber} />
        <StatCard label="Quiz Avg" value="81%" delta={3} icon={<Icon d={Icons.brain} size={16} />} color="#A78BFA" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Card>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Weekly Study Hours</span>
            <Badge>This week</Badge>
          </div>
          <BarChart data={weekData} height={90} />
        </Card>
        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, alignSelf: "flex-start" }}>Overall Progress</span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
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

      {/* Subject Performance */}
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
                  <span style={{ fontSize: 11, color: s.trend > 0 ? T.green : T.red, fontWeight: 600 }}>
                    {s.trend > 0 ? "↑" : "↓"} {Math.abs(s.trend)}%
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.score}%</span>
                </div>
              </div>
              <Progress value={s.score} color={s.color} height={7} />
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
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

// ─── FOCUS MODE ──────────────────────────────────────────────────────────────
const FocusMode = ({ user }) => {
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("focus"); // focus | break
  const [secs, setSecs] = useState(25 * 60);
  const [session, setSession] = useState({ blocked: 0, subject: "Mathematics" });
  const timerRef = useRef(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setSecs(s => {
        if (s <= 1) { setRunning(false); setMode(m => m === "focus" ? "break" : "focus"); return m === "focus" ? 5 * 60 : 25 * 60; }
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
    { name: "TikTok",    icon: "🎵", blocked: true },
    { name: "Games",     icon: "🎮", blocked: true },
    { name: "YouTube",   icon: "▶️", blocked: running },
    { name: "WhatsApp",  icon: "💬", blocked: false },
  ];

  return (
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Focus Engine</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 28 }}>Guard your attention. Own your results.</p>

      {/* Timer */}
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
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Btn onClick={() => setRunning(r => !r)} size="lg" icon={<Icon d={running ? Icons.x : Icons.zap} size={16} color={T.white} />}>
            {running ? "Pause Session" : "Start Focus"}
          </Btn>
          {running && <Btn variant="ghost" onClick={() => { setRunning(false); setSecs(25 * 60); }}>Reset</Btn>}
        </div>
      </Card>

      {/* Blocked apps */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Distraction Shield</span>
          <Badge color={T.green} bg={T.greenLo}>
            <Icon d={Icons.shield} size={11} color={T.green} /> Active
          </Badge>
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Sessions today", value: "3", icon: Icons.target, color: T.accent },
          { label: "Apps blocked", value: "47", icon: Icons.shield, color: T.red },
          { label: "Deep hours", value: "2.4h", icon: Icons.clock, color: T.green },
        ].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}>
            <div style={{ color: s.color, marginBottom: 6, display: "flex", justifyContent: "center" }}>
              <Icon d={s.icon} size={18} color={s.color} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.textPri }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── QUIZZES ─────────────────────────────────────────────────────────────────
const QuizModule = ({ user }) => {
  const [phase, setPhase] = useState("home"); // home | generating | quiz | result
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: `You are SCHOLAR's Quiz Engine. Generate quiz questions perfectly calibrated to this student:
- Level: ${user.level}
- Biggest challenge: ${user.challenge}
Return ONLY valid JSON, no markdown, no backticks. Format: {"questions":[{"q":"question","options":["A","B","C","D"],"correct":0,"explanation":"why this is correct, and why others are wrong"}]}
Generate exactly 5 questions. Make them genuinely educational, not trivial. Vary difficulty. The correct field is the 0-based index of the correct option in the options array.`,
          messages: [{ role: "user", content: `Generate a 5-question quiz on: ${topic}` }]
        })
      });
      const d = await res.json();
      const text = d.content?.[0]?.text || "{}";
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

  const pick = (i) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExp(true);
  };

  const next = () => {
    const newAnswers = [...answers, { q: questions[current], selected }];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowExp(false);
    }
  };

  const score = answers.filter(a => a.selected === a.q.correct).length;

  const presets = ["Photosynthesis", "World War II", "Algebra basics", "Newton's Laws", "Cell biology", "Shakespearean literature"];

  if (phase === "home" || phase === "generating") return (
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
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
              style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.surface, color: T.textSec, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "all 0.2s" }}>
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
      <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, color: T.textSec }}>{current + 1} of {questions.length}</span>
          <button onClick={() => { setPhase("home"); setQuestions([]); }} style={{ background: "none", border: "none", color: T.textMut, cursor: "pointer", fontSize: 12 }}>Exit</button>
        </div>
        <Progress value={(current / questions.length) * 100} color={T.accent} height={4} />
        <div style={{ marginTop: 24, marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
          <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5, marginBottom: 20 }}>{q.q}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isSelected = i === selected;
              let bg = T.surface, border = T.border, color = T.textPri;
              if (selected !== null) {
                if (isCorrect) { bg = T.greenLo; border = T.green; color = T.green; }
                else if (isSelected) { bg = T.redLo; border = T.red; color = T.red; }
              }
              return (
                <div key={i} onClick={() => pick(i)}
                  style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${border}`, background: bg, cursor: selected === null ? "pointer" : "default", transition: "all 0.2s", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, color }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.5, color }}>{opt}</span>
                </div>
              );
            })}
          </div>
        </div>
        {showExp && (
          <Card style={{ marginBottom: 16, borderColor: T.accentMid, animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, marginBottom: 6 }}>SCHOLAR EXPLAINS</div>
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
      <div style={{ padding: 24, overflowY: "auto", height: "100%", animation: "scaleIn 0.4s ease" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{pct >= 80 ? "🎉" : pct >= 60 ? "💪" : "📚"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>
            {score}/{questions.length} correct
          </h2>
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

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
const Leaderboard = ({ user }) => {
  const leaders = [
    { rank: 1, name: "Amara K.",     country: "🇳🇬", score: 12480, streak: 98, badge: "👑", level: "Undergraduate" },
    { rank: 2, name: "Liam T.",      country: "🇬🇧", score: 11920, streak: 72, badge: "🥈", level: "Secondary" },
    { rank: 3, name: "Yui S.",       country: "🇯🇵", score: 11340, streak: 65, badge: "🥉", level: "Postgraduate" },
    { rank: 4, name: "Carlos M.",    country: "🇧🇷", score: 10890, streak: 44, badge: null, level: "Undergraduate" },
    { rank: 5, name: "Fatima A.",    country: "🇸🇦", score: 10200, streak: 38, badge: null, level: "Secondary" },
    { rank: 6, name: user.name + " (You)", country: "🌍", score: 2840, streak: 14, badge: null, level: user.level, isYou: true },
  ];

  return (
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Global Leaderboard</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>The hunger to be first is the hunger to be better.</p>

      {/* Top 3 podium */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, alignItems: "flex-end", justifyContent: "center" }}>
        {[leaders[1], leaders[0], leaders[2]].map((l, idx) => {
          const heights = [100, 120, 90];
          const colors = [T.textSec, T.gold, "#CD7F32"];
          const order = [1, 0, 2];
          return (
            <div key={l.rank} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ fontSize: 20 }}>{l.badge}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri, textAlign: "center" }}>{l.name}</div>
              <div style={{ fontSize: 11, color: T.textSec }}>{l.country}</div>
              <div style={{ width: "100%", height: heights[idx], background: `linear-gradient(180deg, ${colors[idx]}33, ${colors[idx]}11)`, border: `1px solid ${colors[idx]}44`, borderRadius: "8px 8px 0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: colors[idx] }}>#{l.rank}</span>
                <span style={{ fontSize: 12, color: T.textPri, fontWeight: 700 }}>{l.score.toLocaleString()}</span>
                <span style={{ fontSize: 10, color: T.textMut }}>SC</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full list */}
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

      {/* Earn more */}
      <Card style={{ marginTop: 20, borderColor: T.accentMid }}>
        <p style={{ fontSize: 13, color: T.textSec, marginBottom: 12, lineHeight: 1.6 }}>
          You're <b style={{ color: T.textPri }}>7,360 SC</b> away from rank #5. Here's how to close the gap fast:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { action: "Complete a study session", coins: "+120 SC" },
            { action: "Answer community question", coins: "+200 SC" },
            { action: "Perfect quiz score", coins: "+350 SC" },
          ].map(a => (
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
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Open Library</h2>
          <p style={{ fontSize: 14, color: T.textSec }}>Free knowledge from the global Scholar community.</p>
        </div>
        <Btn size="sm" icon={<Icon d={Icons.upload} size={14} color={T.white} />}>Contribute</Btn>
      </div>

      {/* Search */}
      <div style={{ position: "relative", margin: "20px 0" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subjects, topics, resources..."
          style={{ width: "100%", background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", color: T.textPri, fontSize: 14, fontFamily: "Inter, sans-serif", outline: "none" }} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[{ label: "Resources", value: "24,891" }, { label: "Contributors", value: "8,204" }, { label: "Countries", value: "147" }].map(s => (
          <div key={s.label} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.accent }}>{s.value}</div>
            <div style={{ fontSize: 11, color: T.textMut, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Resources */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((r, i) => (
          <Card key={i} onClick={() => {}} style={{ cursor: "pointer" }}>
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

      <div style={{ marginTop: 20, padding: 16, borderRadius: 14, background: T.accentLo, border: `1px solid ${T.accentMid}` }}>
        <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>
          <b style={{ color: T.accent }}>Community Rule:</b> Every contribution is reviewed by Scholar AI for quality and accuracy. Correct answers are verified and highlighted. All perspectives on open discussions are valid — what's not welcome is disrespect.
        </p>
      </div>
    </div>
  );
};

// ─── STREAK & COINS ──────────────────────────────────────────────────────────
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
    <div style={{ padding: 24, overflowY: "auto", height: "100%" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.02em" }}>Streaks & Rewards</h2>
      <p style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Learning earns coins. Coins prove mastery. Mastery changes everything.</p>

      {/* Main streak */}
      <Card style={{ marginBottom: 20, textAlign: "center", padding: 28, background: `linear-gradient(135deg, ${T.goldLo}, ${T.card})`, borderColor: T.gold + "44", animation: "floatBadge 3s ease-in-out infinite" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔥</div>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.gold, letterSpacing: "-0.03em" }}>14</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.textPri, marginBottom: 4 }}>Day Streak</div>
        <div style={{ fontSize: 13, color: T.textSec }}>Complete today's session to reach 15 days</div>
        <div style={{ marginTop: 16 }}>
          <Progress value={65} color={T.gold} height={6} label="Today's progress" />
        </div>
      </Card>

      {/* Coins */}
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

      {/* Achievements */}
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

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "dashboard", label: "Dashboard",  icon: Icons.chart  },
  { id: "mentor",    label: "Mentor AI",  icon: Icons.sparkle },
  { id: "focus",     label: "Focus",      icon: Icons.shield  },
  { id: "quiz",      label: "Quizzes",    icon: Icons.brain   },
  { id: "library",   label: "Library",    icon: Icons.book    },
  { id: "rewards",   label: "Rewards",    icon: Icons.trophy  },
  { id: "leaders",   label: "Global",     icon: Icons.globe   },
];

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function Scholar() {
  const [onboarded, setOnboarded] = useState(false);
  const [user, setUser] = useState({});
  const [tab, setTab] = useState("dashboard");
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (!onboarded) return <Onboarding onComplete={d => { setUser(d); setOnboarded(true); }} />;

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return <Dashboard user={user} />;
      case "mentor":    return <MentorChat user={user} />;
      case "focus":     return <FocusMode user={user} />;
      case "quiz":      return <QuizModule user={user} />;
      case "library":   return <Library />;
      case "rewards":   return <Rewards user={user} />;
      case "leaders":   return <Leaderboard user={user} />;
      default:          return <Dashboard user={user} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, overflow: "hidden", fontFamily: "Inter, sans-serif" }}>

      {/* ── SIDEBAR (desktop) ── */}
      <div style={{ width: 220, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${T.accent}, #9C8FFF)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon d={Icons.sparkle} color={T.white} size={17} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>SCHOLAR</div>
              <div style={{ fontSize: 10, color: T.textMut, marginTop: 2 }}>Your learning system</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          {NAV.map(n => {
            const active = tab === n.id;
            return (
              <div key={n.id} onClick={() => setTab(n.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, marginBottom: 2, cursor: "pointer", background: active ? T.accentLo : "transparent", color: active ? T.accent : T.textSec, fontWeight: active ? 600 : 500, fontSize: 13, transition: "all 0.15s", border: `1px solid ${active ? T.accentMid : "transparent"}` }}>
                <Icon d={n.icon} size={16} color={active ? T.accent : T.textSec} />
                {n.label}
                {n.id === "mentor" && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.green }} />}
              </div>
            );
          })}
        </div>

        {/* User profile */}
        <div style={{ padding: 14, borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${T.gold}, ${T.amber})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#1A0F00", flexShrink: 0 }}>
              {(user.name || "S")[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: T.textMut }}>{user.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textPri }}>
            {NAV.find(n => n.id === tab)?.label}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge color={T.gold} bg={T.goldLo}>🔥 {14} day streak</Badge>
            <Badge color={T.accent} bg={T.accentLo}>2,840 SC</Badge>
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "hidden", animation: "fadeIn 0.3s ease" }} key={tab}>
          {renderTab()}
        </div>

        {/* Mobile bottom nav */}
        <div style={{ display: "flex", borderTop: `1px solid ${T.border}`, background: T.surface }}>
          {NAV.slice(0, 5).map(n => {
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
    </div>
  );
}
