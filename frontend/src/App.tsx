import { useState, useRef, useEffect } from "react";

/* ─────────────────────────── palette ─────────────────────────── */
const P = {
  /* Backgrounds */
  bg:      "#0d1520",
  s1:      "#111c2b",  // sidebar, panels
  s2:      "#162032",  // card surfaces
  s3:      "#1a2740",  // elevated surfaces
  s4:      "#1f2f4a",  // hover / active
  /* Borders */
  border:  "rgba(255,255,255,0.08)",
  borderM: "rgba(255,255,255,0.12)",
  /* Accents */
  teal:    "#2dd4bf",
  cyan:    "#38bdf8",
  /* Status */
  safe:    "#34d399",
  caution: "#fbbf24",
  danger:  "#f87171",
  /* Text */
  t1:      "#f1f5f9",  // headings
  t2:      "#cbd5e1",  // body
  t3:      "#64748b",  // muted
  t4:      "#334155",  // very muted
};

/* ─────────────────────────── types ──────────────────────────── */
type Message = { id: number; role: "user" | "ai"; text: string; cards?: InfoCard[]; timestamp: string };
type InfoCard = { emoji: string; label: string; value: string; detail: string; tag: "safe" | "caution" | "danger" };

/* ─────────────────────────── data ───────────────────────────── */
const SUGGESTIONS = [
  { emoji: "🎣", text: "Best fishing zones today?" },
  { emoji: "⛵", text: "Safe to sail tomorrow?" },
  { emoji: "🌊", text: "Wave & tide forecast?" },
  { emoji: "⛈️", text: "Storm alerts nearby?" },
];

const INITIAL: Message[] = [
  {
    id: 1, role: "ai", timestamp: "9:00 AM",
    text: "Hello! I'm MARIN, your ocean intelligence assistant. Ask me about fishing zones, sea conditions, weather, or navigation — available in English, Hindi, Tamil, Telugu, and Malayalam.",
  },
  {
    id: 2, role: "user", timestamp: "9:02 AM",
    text: "Where's the best spot to fish today near Visakhapatnam?",
  },
  {
    id: 3, role: "ai", timestamp: "9:02 AM",
    text: "Based on today's Oceansat-3 satellite imagery and INCOIS advisories, I found 2 active fishing zones within reach. Here's the breakdown:",
    cards: [
      { emoji: "🐟", label: "Zone Alpha — 42 km Northeast", value: "Excellent conditions", detail: "High chlorophyll activity · SST 28.6°C · Wave height 1.1m", tag: "safe" },
      { emoji: "🐠", label: "Zone Beta — 28 km East", value: "Moderate activity", detail: "Favourable but rising swell · Temp 29.1°C · Light chop", tag: "caution" },
      { emoji: "💨", label: "Sea Conditions Today", value: "Wave height 1.2 m", detail: "NE winds 12 knots · Visibility 8 km · Safe to sail all day", tag: "safe" },
    ],
  },
];

const LIVE = [
  { emoji: "🌡️", label: "Sea Temp",    value: "28.4°C",  trend: "+0.2", status: "n" },
  { emoji: "🌊", label: "Wave Height", value: "1.4 m",   trend: "-0.1", status: "n" },
  { emoji: "💨", label: "Wind",        value: "14 kn NE", trend: "+2",  status: "w" },
  { emoji: "👁️", label: "Visibility",  value: "7.2 km",  trend: "—",   status: "n" },
  { emoji: "🌿", label: "Chlorophyll", value: "High",    trend: "↑",    status: "g" },
  { emoji: "🌙", label: "Tide",        value: "Rising",  trend: "↑",    status: "n" },
];

const ALERTS = [
  { level: "danger"  as const, emoji: "🚨", text: "3 vessels approaching maritime boundary — immediate return advised", time: "8:10 AM" },
  { level: "caution" as const, emoji: "⚠️", text: "Swell increasing after 18:00 near 17°N — plan return by 16:00", time: "9:15 AM" },
  { level: "info"    as const, emoji: "📡", text: "PFZ advisory extended northward off Coromandel coast today", time: "8:40 AM" },
];

const NAV = [
  { id: "chat",   emoji: "💬", label: "Chat" },
  { id: "map",    emoji: "🗺️", label: "Map" },
  { id: "alerts", emoji: "🔔", label: "Alerts" },
  { id: "zones",  emoji: "🎣", label: "Zones" },
  { id: "routes", emoji: "🧭", label: "Routes" },
];

const TAG = {
  safe:    { bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",  text: "#34d399", badge: "rgba(52,211,153,0.12)",  badgeT: "#34d399", label: "Safe"    },
  caution: { bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.18)", text: "#fbbf24", badge: "rgba(251,191,36,0.12)",  badgeT: "#fbbf24", label: "Caution" },
  danger:  { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.2)", text: "#f87171", badge: "rgba(248,113,113,0.12)", badgeT: "#f87171", label: "Risk"    },
};

const ALERT_STYLE = {
  danger:  { bg: "rgba(248,113,113,0.07)", border: "rgba(248,113,113,0.18)", text: "#f87171" },
  caution: { bg: "rgba(251,191,36,0.07)",  border: "rgba(251,191,36,0.16)",  text: "#fbbf24" },
  info:    { bg: "rgba(45,212,191,0.06)",  border: "rgba(45,212,191,0.15)",  text: "#2dd4bf" },
};

/* ─────────────────────────── app ────────────────────────────── */
export default function App() {
  const [activeNav, setActiveNav] = useState("chat");
  const [messages, setMessages]   = useState<Message[]>(INITIAL);
  const [input, setInput]         = useState("");
  const [typing, setTyping]       = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  function send(text?: string) {
    const q = (text || input).trim();
    if (!q) return;
    const ts = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    setMessages(m => [...m, { id: Date.now(), role: "user", text: q, timestamp: ts }]);
    setInput(""); setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, {
        id: Date.now() + 1, role: "ai", timestamp: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
        text: "Here's the synthesized intelligence based on current satellite and oceanographic data:",
        cards: [
          { emoji: "⚠️", label: "Safety Assessment", value: "Moderate caution", detail: "Conditions deteriorate after 16:00 IST — plan your return early.", tag: "caution" },
          { emoji: "🐟", label: "Recommended Zone",  value: "34 km Southeast",  detail: "Active fishing ground · Calm waters · Approx. 2 hrs transit", tag: "safe" },
        ],
      }]);
    }, 2100);
  }

  return (
    <div className="flex h-full overflow-hidden" style={{ background: P.bg }}>

      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="flex flex-col w-[68px] flex-shrink-0 relative"
        style={{ background: P.s1, borderRight: `1px solid ${P.border}` }}>

        {/* Logo */}
        <div className="flex items-center justify-center h-[60px] flex-shrink-0"
          style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg relative"
            style={{ background: `linear-gradient(135deg, #0e7490, #2dd4bf)`, boxShadow: `0 0 16px rgba(45,212,191,0.35)` }}>
            🌊
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-1 p-2 flex-1 pt-3">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} title={n.label}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-200 relative group"
              style={{
                background: activeNav === n.id ? P.s4 : "transparent",
                border: activeNav === n.id ? `1px solid ${P.borderM}` : "1px solid transparent",
              }}>
              <span style={{ opacity: activeNav === n.id ? 1 : 0.45, transition: "opacity 0.15s" }}>{n.emoji}</span>
              {activeNav === n.id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ background: P.teal }} />
              )}
            </button>
          ))}
        </nav>

        {/* User avatar */}
        <div className="flex justify-center pb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-600"
            style={{ background: `linear-gradient(135deg, #0e7490, #2dd4bf)`, color: "#fff" }}>
            R
          </div>
        </div>
      </aside>

      {/* ═══════════ CHAT ═══════════ */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-6 h-[60px] flex-shrink-0"
          style={{ background: P.s1, borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-3">
            <div className="float text-xl">🐬</div>
            <div>
              <div className="font-600 text-[14px]" style={{ color: P.t1 }}>MARIN — Ocean Intelligence</div>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: P.t3 }}>
                <span className="w-1.5 h-1.5 rounded-full inline-block pulse-glow" style={{ background: P.safe }} />
                Live · ISRO + INCOIS satellite data
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-lg text-[11px] font-500"
              style={{ background: "rgba(251,191,36,0.1)", color: P.caution, border: `1px solid rgba(251,191,36,0.2)` }}>
              🌤️ Good sailing conditions
            </div>
            {ALERTS.some(a => a.level === "danger") && (
              <div className="px-3 py-1.5 rounded-lg text-[11px] font-500 flex items-center gap-1.5"
                style={{ background: "rgba(248,113,113,0.1)", color: P.danger, border: `1px solid rgba(248,113,113,0.2)` }}>
                🚨 1 urgent alert
              </div>
            )}
            <div className="w-px h-5 mx-1" style={{ background: P.border }} />
            <div className="text-right">
              <div className="text-[11px]" style={{ color: P.t3 }}>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              <div className="text-[11px] font-500" style={{ color: P.teal }}>IST {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, rgba(14,116,144,0.06) 0%, transparent 60%),
                         radial-gradient(ellipse at 80% 80%, rgba(45,212,191,0.04) 0%, transparent 50%),
                         ${P.bg}`,
          }}>

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                style={msg.role === "ai"
                  ? { background: P.s3, border: `1px solid ${P.border}` }
                  : { background: `linear-gradient(135deg, #0e7490, #2dd4bf)` }}>
                {msg.role === "ai" ? "🌊" : "👤"}
              </div>

              <div className={`flex flex-col gap-2.5 max-w-[68%] ${msg.role === "user" ? "items-end" : "items-start"}`}>

                {/* Bubble */}
                <div className="px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed card-shadow"
                  style={msg.role === "ai"
                    ? {
                        background: P.s2,
                        border: `1px solid ${P.border}`,
                        color: P.t2,
                        borderTopLeftRadius: 6,
                      }
                    : {
                        background: `linear-gradient(135deg, #0c5f73, #0e7490)`,
                        border: `1px solid rgba(45,212,191,0.2)`,
                        color: P.t1,
                        borderTopRightRadius: 6,
                      }}>
                  {msg.text}
                </div>

                {/* Info cards */}
                {msg.cards && (
                  <div className="flex flex-col gap-2 w-full">
                    {msg.cards.map((card, i) => {
                      const t = TAG[card.tag];
                      return (
                        <div key={i} className="rounded-xl p-3.5 card-shadow card-hover"
                          style={{ background: t.bg, border: `1px solid ${t.border}` }}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5 flex-shrink-0">{card.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-500 mb-0.5" style={{ color: P.t3 }}>{card.label}</div>
                              <div className="font-600 text-[13px] mb-1" style={{ color: P.t1 }}>{card.value}</div>
                              <div className="text-[11px] leading-relaxed" style={{ color: P.t3 }}>{card.detail}</div>
                            </div>
                            <span className="text-[11px] font-500 px-2.5 py-1 rounded-lg flex-shrink-0"
                              style={{ background: t.badge, color: t.badgeT }}>
                              {t.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <span className="text-[11px]" style={{ color: P.t4 }}>{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {/* Typing */}
          {typing && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                style={{ background: P.s3, border: `1px solid ${P.border}` }}>🌊</div>
              <div className="px-4 py-3 rounded-2xl flex items-center gap-2 card-shadow"
                style={{ background: P.s2, border: `1px solid ${P.border}`, borderTopLeftRadius: 6 }}>
                {[0, 0.18, 0.36].map((d, i) => (
                  <span key={i} className="w-2 h-2 rounded-full block"
                    style={{ background: P.teal, animation: `dot-wave 1.1s ease-in-out ${d}s infinite` }} />
                ))}
                <span className="text-[11px] ml-1" style={{ color: P.t3 }}>Analyzing ocean data…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        <div className="flex-shrink-0 px-6 py-2.5 flex gap-2 overflow-x-auto"
          style={{ borderTop: `1px solid ${P.border}`, background: P.s1 }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => send(s.text)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-400 transition-all duration-150 hover:opacity-80"
              style={{ background: P.s3, border: `1px solid ${P.borderM}`, color: P.t2 }}>
              <span>{s.emoji}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 px-6 py-4" style={{ background: P.s1, borderTop: `1px solid ${P.border}` }}>
          <div className="flex gap-3 items-end px-4 py-3 rounded-2xl"
            style={{ background: P.s2, border: `1px solid ${P.borderM}`, boxShadow: `0 0 0 1px ${P.border}` }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about fishing zones, safety, weather, routes…"
              rows={1}
              className="flex-1 resize-none text-[13.5px] leading-relaxed focus:outline-none bg-transparent"
              style={{ color: P.t1, maxHeight: 96 }}
            />
            <button onClick={() => send()} disabled={!input.trim() || typing}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-25"
              style={{ background: `linear-gradient(135deg, #0e7490, ${P.teal})`, boxShadow: `0 4px 14px rgba(45,212,191,0.3)` }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 13L13 7.5L2 2v4l8 1.5L2 9v4z" fill="white" />
              </svg>
            </button>
          </div>
          <p className="text-center text-[11px] mt-2" style={{ color: P.t4 }}>
            English · हिंदी · தமிழ் · తెలుగు · മലയാളം
          </p>
        </div>
      </div>

      {/* ═══════════ RIGHT PANEL ═══════════ */}
      <aside className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
        style={{ background: P.s1, borderLeft: `1px solid ${P.border}` }}>

        {/* Hero banner */}
        <div className="flex-shrink-0 relative overflow-hidden px-5 py-5"
          style={{
            background: `linear-gradient(145deg, #0a3d52 0%, #0e5f77 50%, #0c7a8a 100%)`,
            borderBottom: `1px solid ${P.border}`,
          }}>
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: P.teal }} />
              <span className="text-[11px] font-500 tracking-wide uppercase" style={{ color: P.teal }}>Bay of Bengal</span>
            </div>
            <div className="font-600 text-[15px] leading-snug" style={{ color: P.t1 }}>
              Conditions favourable<br />for fishing today
            </div>
            <div className="mt-2 text-[11px]" style={{ color: "rgba(45,212,191,0.7)" }}>Updated just now</div>
          </div>
          <div className="absolute top-3 right-4 float text-4xl opacity-60">🐋</div>
          {/* Wave cut */}
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 288 18" preserveAspectRatio="none"
            style={{ opacity: 0.15 }}>
            <path d="M0,10 C60,18 100,2 144,10 C188,18 228,2 288,10 L288,18 L0,18Z" fill="white"/>
          </svg>
        </div>

        {/* Live conditions */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-600 uppercase tracking-wider" style={{ color: P.t3 }}>Live Conditions</span>
            <span className="shimmer-badge text-[10px] font-500 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(52,211,153,0.1)", color: P.safe, border: `1px solid rgba(52,211,153,0.2)` }}>
              ● Synced
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LIVE.map(d => {
              const accent = d.status === "g" ? P.safe : d.status === "w" ? P.caution : P.teal;
              return (
                <div key={d.label} className="rounded-xl p-3 card-hover"
                  style={{ background: P.s2, border: `1px solid ${P.border}` }}>
                  <div className="text-[18px] mb-2">{d.emoji}</div>
                  <div className="font-600 text-[13px]" style={{ color: P.t1 }}>{d.value}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[10px]" style={{ color: P.t3 }}>{d.label}</span>
                    <span className="text-[10px] font-500" style={{ color: accent }}>{d.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map */}
        <div className="mx-4 my-3 rounded-xl overflow-hidden flex-shrink-0 relative"
          style={{ height: 140, border: `1px solid rgba(45,212,191,0.2)`, boxShadow: `0 0 24px rgba(45,212,191,0.06)` }}>
          <svg width="100%" height="100%" viewBox="0 0 264 140" style={{ display: "block" }}>
            {/* Deep water fill */}
            <defs>
              <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#061524"/>
                <stop offset="100%" stopColor="#0a2035"/>
              </linearGradient>
              <radialGradient id="zoneA" cx="55%" cy="32%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/>
              </radialGradient>
              <radialGradient id="zoneB" cx="43%" cy="57%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.14"/>
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <rect width="264" height="140" fill="url(#oceanGrad)"/>

            {/* Grid lines */}
            {[44,88,132,176,220].map(x => <line key={x} x1={x} y1={0} x2={x} y2={140} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
            {[35,70,105].map(y => <line key={y} x1={0} y1={y} x2={264} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}

            {/* Zone glows */}
            <circle cx="145" cy="46" r="32" fill="url(#zoneA)"/>
            <circle cx="114" cy="80" r="22" fill="url(#zoneB)"/>

            {/* Zone rings */}
            <circle cx="145" cy="46" r="24" fill="none" stroke="#2dd4bf" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>
            <circle cx="114" cy="80" r="16" fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4,3" opacity="0.4"/>

            {/* Coastline */}
            <path d="M22,0 L27,22 L20,46 L28,70 L22,96 L30,120 L24,140" stroke="rgba(100,180,130,0.5)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <rect x="0" y="0" width="20" height="140" fill="rgba(60,120,80,0.25)"/>

            {/* Vessel dot */}
            <circle cx="66" cy="68" r="4" fill={P.teal}/>
            <circle cx="66" cy="68" r="9" fill="none" stroke={P.teal} strokeWidth="1" opacity="0.35"/>
            <circle cx="66" cy="68" r="15" fill="none" stroke={P.teal} strokeWidth="0.5" opacity="0.15"/>

            {/* Labels */}
            <text x="145" y="43" fontSize="7.5" fill="#2dd4bf" textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">Zone A</text>
            <text x="114" y="77" fontSize="7.5" fill="#fbbf24" textAnchor="middle" fontWeight="600" fontFamily="Inter, sans-serif">Zone B</text>
            <text x="66" y="90" fontSize="6.5" fill="rgba(45,212,191,0.6)" textAnchor="middle" fontFamily="Inter, sans-serif">You</text>
          </svg>

          {/* Map overlay badges */}
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-500 px-2 py-0.5 rounded-md"
              style={{ background: "rgba(6,21,36,0.75)", color: P.teal, backdropFilter: "blur(8px)", border: `1px solid rgba(45,212,191,0.2)` }}>
              Bay of Bengal
            </span>
          </div>
          <div className="absolute bottom-2 right-2 text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            18.2°N 84.0°E
          </div>
        </div>

        {/* Alerts */}
        <div className="flex-1 overflow-y-auto px-4 pb-3">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-600 uppercase tracking-wider" style={{ color: P.t3 }}>Active Alerts</span>
            <span className="text-[10px]" style={{ color: P.t4 }}>{ALERTS.length} active</span>
          </div>
          <div className="space-y-2">
            {ALERTS.map((a, i) => {
              const s = ALERT_STYLE[a.level];
              return (
                <div key={i} className="rounded-xl p-3 card-hover"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0 mt-0.5">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-400 leading-snug" style={{ color: s.text }}>{a.text}</div>
                      <div className="text-[10px] mt-1.5" style={{ color: P.t4 }}>{a.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between"
          style={{ borderTop: `1px solid ${P.border}` }}>
          <span className="text-[10px]" style={{ color: P.t4 }}>ISRO · INCOIS · IMD</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-500 shimmer-badge"
            style={{ background: "rgba(52,211,153,0.08)", color: P.safe, border: `1px solid rgba(52,211,153,0.18)` }}>
            ● Live
          </span>
        </div>
      </aside>

    </div>
  );
}
