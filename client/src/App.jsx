import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ALPHA SIGNAL v3 — AIRDROP FARMER MVP
   "You are becoming someone who never misses an opportunity."
   
   Core loop: Smart queue (urgency-sorted) + Discovery feed
   Gamification: Titles (losable), reputation, streak freezes
   Content: Coming Soon teaser
   ═══════════════════════════════════════════════════════════ */

/* ═══ API LAYER ═══ */
const cache = {};
const CACHE_TTL = 5 * 60 * 1000;
async function cachedFetch(key, url, transform, ttl = CACHE_TTL) {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < ttl) return cache[key].data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status}`);
    const raw = await res.json();
    const data = transform ? transform(raw) : raw;
    cache[key] = { data, ts: now };
    return data;
  } catch (err) {
    console.warn(`API [${key}]:`, err.message);
    if (cache[key]) return cache[key].data;
    return null;
  }
}
const LLAMA = "https://api.llama.fi";
async function getTokenlessProtocols() {
  return cachedFetch("protocols_tokenless", `${LLAMA}/protocols`, (raw) =>
    raw.filter(p => p.tvl > 1_000_000 && !p.symbol)
      .sort((a, b) => b.tvl - a.tvl).slice(0, 30)
      .map(p => ({ name: p.name, slug: p.slug, tvl: p.tvl, chain: p.chains?.[0] || p.chain, chains: p.chains || [], category: p.category, logo: p.logo, url: p.url })),
    10 * 60 * 1000);
}
async function getRaises() {
  return cachedFetch("raises", `${LLAMA}/raises`, (raw) =>
    (raw?.raises || []).filter(r => r.amount >= 5_000_000).sort((a, b) => b.date - a.date).slice(0, 30)
      .map(r => ({ name: r.name, amount: r.amount, round: r.round, sector: r.sector, leadInvestors: r.leadInvestors || [], date: new Date(r.date * 1000).toLocaleDateString(), chains: r.chains || [] })),
    30 * 60 * 1000);
}
const GECKO = "https://api.coingecko.com/api/v3";
async function getGlobalMarket() {
  return cachedFetch("global", `${GECKO}/global`, (raw) => {
    const d = raw?.data; if (!d) return null;
    return { btcDom: Math.round((d.market_cap_percentage?.btc || 0) * 10) / 10, change24h: Math.round((d.market_cap_change_percentage_24h_usd || 0) * 100) / 100 };
  });
}
function fmt(n) { if (!n) return "—"; if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`; if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`; return `$${(n/1e3).toFixed(0)}K`; }

async function buildDiscovery() {
  const [tokenless, raises] = await Promise.all([getTokenlessProtocols(), getRaises()]);
  if (!tokenless) return [];
  return tokenless.map(p => {
    const raise = raises?.find(r => r.name.toLowerCase() === p.name.toLowerCase());
    let score = 25; // base: tokenless
    if (p.tvl > 100e6) score += 25; else if (p.tvl > 10e6) score += 18; else score += 10;
    if (raise) { if (raise.amount > 50e6) score += 25; else if (raise.amount > 10e6) score += 18; else score += 10; }
    if (p.chains?.length > 3) score += 15; else if (p.chains?.length > 1) score += 10;
    const hotCats = ["dexes","lending","bridge","restaking","liquid staking"];
    if (hotCats.includes(p.category?.toLowerCase())) score += 10;
    return { ...p, funding: raise?.amount || null, fundingRound: raise?.round || null, investors: raise?.leadInvestors || [], score: Math.min(score, 100) };
  }).sort((a, b) => b.score - a.score);
}

/* ═══ DESIGN SYSTEM ═══ */
const P = {
  bg: "#0A0A12", card: "#12121E", cardHover: "#16162A", text: "#E8E8EC",
  sub: "#6B6B80", muted: "#1E1E30", accent: "#FF6B2C", accentSoft: "#FF6B2C22",
  green: "#22C55E", red: "#EF4444", blue: "#3B82F6", purple: "#8B5CF6",
  yellow: "#EAB308", cyan: "#06B6D4", pink: "#EC4899",
  border: "#1E1E30",
};
const FONT = `'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif`;
const MONO = `'JetBrains Mono','Fira Code',monospace`;

/* ═══ CHAINS ═══ */
const CHAINS = [
  { id: "eth", label: "Ethereum", emoji: "⟠", color: P.blue },
  { id: "base", label: "Base", emoji: "🔵", color: P.cyan },
  { id: "megaeth", label: "MegaETH", emoji: "⚡", color: P.yellow },
  { id: "monad", label: "Monad", emoji: "🟣", color: P.purple },
  { id: "arb", label: "Arbitrum", emoji: "🔷", color: P.blue },
  { id: "zksync", label: "zkSync", emoji: "🔲", color: P.pink },
  { id: "scroll", label: "Scroll", emoji: "📜", color: P.yellow },
  { id: "linea", label: "Linea", emoji: "🟩", color: P.green },
];

/* ═══ TITLES — identity-driven, can be LOST ═══ */
const TITLES = [
  { id: "ghost", name: "Ghost", icon: "👻", color: "#555", desc: "Haven't farmed this week", min: -1 },
  { id: "active", name: "Active", icon: "🌱", color: P.green, desc: "Farmed 3+ days", min: 3 },
  { id: "consistent", name: "Consistent", icon: "🔥", color: P.accent, desc: "7-day streak", min: 7 },
  { id: "grinder", name: "Grinder", icon: "⚡", color: P.yellow, desc: "14-day streak + protocols completed", min: 14 },
  { id: "alpha_farmer", name: "Alpha Farmer", icon: "🎯", color: P.purple, desc: "30-day streak", min: 30 },
  { id: "never_miss", name: "Never Miss", icon: "👁", color: P.accent, desc: "60-day streak — you never miss", min: 60 },
];
function getTitle(streak) {
  if (streak >= 60) return TITLES[5];
  if (streak >= 30) return TITLES[4];
  if (streak >= 14) return TITLES[3];
  if (streak >= 7) return TITLES[2];
  if (streak >= 3) return TITLES[1];
  return TITLES[0];
}

/* ═══ FARM TASKS — sorted by urgency ═══ */
const FARM_TASKS = [
  { id: "f1", protocol: "LayerZero S2", chain: "Multi-chain", deadline: "18 hours", deadlineHrs: 18, urgency: "critical", emoji: "🔴", speculative: false,
    sourceUrl: "https://layerzero.network/season2",
    disclaimer: "Based on LayerZero's official Season 2 announcement.",
    steps: [
      { text: "Bridge USDC Ethereum → Arbitrum via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Use Stargate specifically — built on LayerZero." },
      { text: "Bridge ETH Arbitrum → Base via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Different chains than Step 1. Variety matters." },
      { text: "Use an OFT token cross-chain", link: "https://layerzero.network/ecosystem", time: "5 min", tip: "Transfer any OFT-enabled token between chains." },
    ] },
  { id: "f2", protocol: "Monad", chain: "Monad", deadline: "3 days", deadlineHrs: 72, urgency: "urgent", emoji: "🟣", speculative: false,
    sourceUrl: "https://docs.monad.xyz/testnet",
    disclaimer: "Based on Monad's official testnet program.",
    steps: [
      { text: "Get testnet MON from faucet", link: "https://faucet.monad.xyz", time: "1 min", tip: "Discord verification required first." },
      { text: "Bridge assets via Monad Bridge", link: "https://bridge.monad.xyz", time: "2 min", tip: "Bridge interaction itself is what matters." },
      { text: "Execute 3 swaps on MonadSwap", link: "https://swap.monad.xyz", time: "3 min", tip: "3 separate swaps, variety of pairs." },
      { text: "Provide liquidity in any pool", link: "https://swap.monad.xyz/pools", time: "2 min", tip: "Even $1 counts. Leave for 24h." },
    ] },
  { id: "f3", protocol: "MegaETH", chain: "MegaETH", deadline: "12 days", deadlineHrs: 288, urgency: "active", emoji: "⚡", speculative: false,
    sourceUrl: "https://docs.megaeth.com/testnet",
    disclaimer: "Based on MegaETH's official testnet announcement.",
    steps: [
      { text: "Claim testnet ETH from faucet", link: "https://faucet.megaeth.com", time: "1 min", tip: "Use the same wallet you'll farm with." },
      { text: "Bridge 0.05 ETH to MegaETH", link: "https://bridge.megaeth.com", time: "2 min", tip: "Use 'Fast Bridge' — 30 sec vs 15 min." },
      { text: "Swap ETH → USDC on MegaDEX", link: "https://dex.megaeth.com", time: "1 min", tip: "Swap at least 0.02 ETH. Volume matters." },
      { text: "Add liquidity to ETH/USDC", link: "https://dex.megaeth.com/pools", time: "2 min", tip: "Use 'Full Range' — farming eligibility, not yield." },
      { text: "Mint a free NFT", link: "https://mint.megaeth.com", time: "1 min", tip: "Any free mint counts." },
    ] },
  { id: "f4", protocol: "Scroll", chain: "Scroll", deadline: "21 days", deadlineHrs: 504, urgency: "upcoming", emoji: "📜", speculative: true,
    sourceUrl: "https://scroll.io",
    disclaimer: "SPECULATIVE — No official airdrop announced. Tasks based on community patterns.",
    steps: [
      { text: "Bridge ETH to Scroll via official bridge", link: "https://scroll.io/bridge", time: "3 min", tip: "Use the canonical bridge for on-chain proof." },
      { text: "Swap tokens on ScrollSwap", link: "https://scrollswap.app", time: "2 min", tip: "At least 3 separate swaps." },
      { text: "Provide liquidity on any Scroll DEX", link: "https://app.syncswap.xyz", time: "3 min", tip: "SyncSwap is the most active DEX on Scroll." },
      { text: "Deploy a contract (optional, high signal)", link: "https://remix.ethereum.org", time: "5 min", tip: "Deploy any contract — shows developer activity." },
    ] },
];

/* ═══ SCREENS ═══ */
const SC = { WELCOME: 0, CHAINS: 1, LOADING: 2, HOME: 3, TASK: 4, DISCOVER: 5, STATS: 6, PROFILE: 7 };

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AlphaSignal() {
  const [sc, setSc] = useState(SC.WELCOME);
  const [fade, setFade] = useState(true);
  const [chains, setChains] = useState([]);
  const [handle, setHandle] = useState("");
  const [streak, setStreak] = useState(14);
  const [freezes, setFreezes] = useState(2);
  const [farmDone, setFarmDone] = useState({});
  const [activeTask, setActiveTask] = useState(null);
  const [liveMarket, setLiveMarket] = useState(null);
  const [liveDisc, setLiveDisc] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle");
  const [editing, setEditing] = useState(false);
  const [discFilter, setDiscFilter] = useState("all");

  const nav = useCallback(s => { setFade(false); setTimeout(() => { setSc(s); setFade(true); }, 100); }, []);
  const tog = (id) => setChains(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Computed
  const title = getTitle(streak);
  const prevTitle = getTitle(Math.max(0, streak - 1));
  const nextTitle = TITLES[TITLES.indexOf(title) + 1] || null;
  const daysToNext = nextTitle ? Math.max(0, nextTitle.min - streak) : 0;

  const protocolsDone = FARM_TASKS.filter(t => (farmDone[t.id]?.size || 0) >= t.steps.length).length;
  const totalSteps = FARM_TASKS.reduce((a, t) => a + (farmDone[t.id]?.size || 0), 0);
  const reputation = Math.min(100, Math.round(streak * 1.1 + protocolsDone * 12 + totalSteps * 2));

  const hasAnalytics = streak >= 7;
  const hasAdvancedDiscovery = streak >= 14;
  const hasPortfolio = streak >= 30;

  const getFP = (tid) => farmDone[tid]?.size || 0;
  const isComplete = (tid) => { const t = FARM_TASKS.find(x => x.id === tid); return t && getFP(tid) >= t.steps.length; };
  const completeFarmStep = (tid, idx) => {
    if (farmDone[tid]?.has(idx)) return;
    setFarmDone(prev => { const s = new Set(prev[tid] || []); s.add(idx); return { ...prev, [tid]: s }; });
    const t = FARM_TASKS.find(x => x.id === tid);
    if (t && getFP(tid) + 1 >= t.steps.length) {
      // Protocol completed — streak continues
      if (streak > 0) setStreak(s => s + 0); // streak maintained by daily activity
    }
  };

  // Sort tasks by urgency
  const sortedTasks = [...FARM_TASKS].sort((a, b) => a.deadlineHrs - b.deadlineHrs);
  const criticalTasks = sortedTasks.filter(t => t.urgency === "critical" && !isComplete(t.id));
  const urgentTasks = sortedTasks.filter(t => t.urgency === "urgent" && !isComplete(t.id));
  const activeTasks = sortedTasks.filter(t => t.urgency === "active" && !isComplete(t.id));
  const completedTasks = sortedTasks.filter(t => isComplete(t.id));

  // Fetch live data
  useEffect(() => {
    if (sc !== SC.HOME && sc !== SC.DISCOVER) return;
    if (liveMarket && liveDisc) return;
    setApiStatus("loading");
    Promise.all([getGlobalMarket().catch(() => null), buildDiscovery().catch(() => null)])
      .then(([m, d]) => {
        if (m) setLiveMarket(m);
        if (d) setLiveDisc(d);
        setApiStatus(m || d ? "live" : "error");
      });
  }, [sc]);

  /* ═══ SHARED UI ═══ */
  const card = { background: P.card, borderRadius: 16, border: `1px solid ${P.border}` };
  const Pill = ({ text, color, filled, small }) => <span style={{
    padding: small ? "2px 7px" : "4px 10px", borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 600, fontFamily: FONT,
    background: filled ? color : `${color}18`, color: filled ? "#FFF" : color, whiteSpace: "nowrap",
  }}>{text}</span>;

  const Btn = ({ children, on, dis, full, ghost, color: cc = P.accent, small }) => <button disabled={dis} onClick={on} style={{
    padding: small ? "10px 18px" : "14px 28px", borderRadius: 14,
    border: ghost ? `1px solid ${P.border}` : "none",
    background: ghost ? "transparent" : dis ? P.muted : cc,
    color: ghost ? P.text : dis ? P.sub : "#FFF",
    fontWeight: 700, fontSize: small ? 13 : 15, fontFamily: FONT,
    cursor: dis ? "default" : "pointer", width: full ? "100%" : "auto",
  }}>{children}</button>;

  const urgencyColor = (u) => u === "critical" ? P.red : u === "urgent" ? P.yellow : u === "upcoming" ? P.sub : P.cyan;
  const urgencyLabel = (u) => u === "critical" ? "⚠️ CRITICAL" : u === "urgent" ? "🔶 URGENT" : u === "upcoming" ? "📅 UPCOMING" : "🟢 ACTIVE";

  const BottomNav = () => (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: P.card, borderTop: `1px solid ${P.border}`, display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
      {[
        { id: SC.HOME, icon: "🎯", label: "Queue" },
        { id: SC.DISCOVER, icon: "🔍", label: "Discover" },
        { id: SC.STATS, icon: "📊", label: "Stats" },
        { id: SC.PROFILE, icon: "👤", label: "You" },
      ].map(t => (
        <button key={t.id} onClick={() => nav(t.id)} style={{
          flex: 1, padding: "10px 0 8px", background: "none", border: "none", cursor: "pointer",
          color: sc === t.id ? P.accent : P.sub, fontFamily: FONT, fontSize: 10, fontWeight: 700,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        }}>
          <span style={{ fontSize: 18 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );

  const wrap = (content, hasNav) => (
    <div style={{ minHeight: "100vh", background: P.bg, fontFamily: FONT, color: P.text }}>
      {/* Subtle grid background */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.015, zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "relative", zIndex: 1, opacity: fade ? 1 : 0, transition: "opacity .1s ease", maxWidth: 430, margin: "0 auto", padding: hasNav ? "0 20px 100px" : "0 20px 40px" }}>
        {content}
      </div>
      {hasNav && <BottomNav />}
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
        @keyframes glow{0%,100%{box-shadow:0 0 15px ${P.accent}15}50%{box-shadow:0 0 25px ${P.accent}30}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );

  /* ═══════════════════════════════════════
     WELCOME
     ═══════════════════════════════════════ */
  if (sc === SC.WELCOME) return wrap(
    <div style={{ paddingTop: 100, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>🎯</div>
      <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>Alpha Signal</h1>
      <p style={{ color: P.accent, fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>Never miss an airdrop again.</p>
      <p style={{ color: P.sub, fontSize: 13, margin: "0 0 40px", lineHeight: 1.5 }}>
        Smart task queue. Step-by-step farming.<br/>Deadline tracking that actually works.
      </p>
      <Btn on={() => nav(SC.CHAINS)} full>Start Farming →</Btn>
      <p style={{ color: P.sub, fontSize: 11, marginTop: 16 }}>Free. No wallet connection required.</p>
    </div>
  );

  /* ═══════════════════════════════════════
     CHAIN SELECT
     ═══════════════════════════════════════ */
  if (sc === SC.CHAINS) return wrap(
    <div style={{ paddingTop: 48 }}>
      <p style={{ color: P.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>SETUP</p>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>Which chains do you farm?</h2>
      <p style={{ color: P.sub, fontSize: 13, margin: "0 0 24px" }}>We'll prioritize tasks on these chains. You can change this anytime.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {CHAINS.map(c => {
          const sel = chains.includes(c.id);
          return <div key={c.id} onClick={() => tog(c.id)} style={{
            ...card, padding: "16px 14px", cursor: "pointer", textAlign: "center",
            border: sel ? `2px solid ${c.color}` : `1px solid ${P.border}`,
            background: sel ? `${c.color}10` : P.card,
          }}>
            <span style={{ fontSize: 28 }}>{c.emoji}</span>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6, color: sel ? c.color : P.text }}>{c.label}</div>
          </div>;
        })}
      </div>
      {/* Handle input */}
      <div style={{ ...card, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: P.sub, fontWeight: 600, marginBottom: 6 }}>X handle (optional)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: P.muted, borderRadius: 10, padding: "10px 14px" }}>
          <span style={{ color: P.sub, fontWeight: 700 }}>@</span>
          <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="yourhandle" style={{ flex: 1, background: "none", border: "none", color: P.text, fontSize: 14, fontFamily: FONT, outline: "none", fontWeight: 600 }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn ghost on={() => { if (editing) { setEditing(false); nav(SC.PROFILE); } else nav(SC.WELCOME); }}>← Back</Btn>
        <Btn dis={!chains.length} on={() => { if (editing) { setEditing(false); nav(SC.PROFILE); } else { nav(SC.LOADING); setTimeout(() => nav(SC.HOME), 1500); } }}>{editing ? "Save ✓" : "Let's Go 🚀"}</Btn>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     LOADING
     ═══════════════════════════════════════ */
  if (sc === SC.LOADING) return wrap(
    <div style={{ paddingTop: 140, textAlign: "center" }}>
      <div style={{ fontSize: 56, animation: "pulse 1.5s ease-in-out infinite" }}>🎯</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, marginTop: 12 }}>Scanning for opportunities...</h2>
      <p style={{ color: P.sub, fontSize: 13, marginTop: 4 }}>Building your smart queue</p>
    </div>
  );

  /* ═══════════════════════════════════════
     HOME — Smart Queue
     ═══════════════════════════════════════ */
  if (sc === SC.HOME) {
    const TaskCard = ({ t, highlight }) => {
      const pr = getFP(t.id), total = t.steps.length, done = pr >= total;
      return (
        <div onClick={() => { setActiveTask(t); nav(SC.TASK); }} style={{
          ...card, padding: 16, marginBottom: 8, cursor: "pointer",
          border: highlight ? `1px solid ${urgencyColor(t.urgency)}44` : `1px solid ${P.border}`,
          background: done ? `${P.green}08` : highlight ? `${urgencyColor(t.urgency)}06` : P.card,
          opacity: done ? 0.55 : 1, animation: "fadeIn .3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>{t.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800 }}>{t.protocol}</span>
                {t.speculative && <Pill text="SPECULATIVE" color={P.yellow} small />}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                <Pill text={t.chain} color={P.cyan} small />
                <Pill text={t.deadline} color={urgencyColor(t.urgency)} filled small />
              </div>
            </div>
            {done ? <span style={{ fontSize: 18, color: P.green }}>✓</span> : <span style={{ color: P.sub, fontSize: 13 }}>›</span>}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 10, height: 3, background: P.muted, borderRadius: 3 }}>
            <div style={{ height: "100%", width: `${(pr / total) * 100}%`, background: done ? P.green : urgencyColor(t.urgency), borderRadius: 3, transition: "width .3s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: P.sub }}>{pr}/{total} steps</span>
            <span style={{ fontSize: 10, color: P.sub }}>~{t.steps.reduce((a, s) => a + parseInt(s.time), 0)} min total</span>
          </div>
        </div>
      );
    };

    return wrap(
      <div style={{ paddingTop: 12 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: P.sub }}>{handle ? `@${handle}` : "Hey farmer"}</div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>Your Queue</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {liveMarket && <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: liveMarket.change24h > 0 ? P.green : P.red }}>{liveMarket.change24h > 0 ? "+" : ""}{liveMarket.change24h}%</span>
              <span style={{ fontSize: 10, color: P.sub }}>24h</span>
            </div>}
            <div style={{ textAlign: "center", padding: "4px 10px", background: `${P.accent}15`, borderRadius: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: P.accent }}>{streak}</div>
              <div style={{ fontSize: 8, color: P.accent, fontWeight: 700 }}>STREAK</div>
            </div>
          </div>
        </div>

        {/* Title + streak warning */}
        <div style={{ ...card, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, background: `${title.color}08`, border: `1px solid ${title.color}22` }}>
          <span style={{ fontSize: 24 }}>{title.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: title.color }}>{title.name}</div>
            {nextTitle ? (
              <div style={{ fontSize: 11, color: P.sub }}>{daysToNext} day{daysToNext !== 1 ? "s" : ""} to "{nextTitle.name}" · {freezes}/3 freezes banked</div>
            ) : (
              <div style={{ fontSize: 11, color: P.sub }}>Maximum title achieved · {freezes}/3 freezes</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < freezes ? P.blue : P.muted }} />)}
          </div>
        </div>

        {/* CRITICAL section */}
        {criticalTasks.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, animation: "pulse 2s ease infinite" }}>
            <span style={{ fontSize: 13 }}>⚠️</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: P.red, letterSpacing: 1 }}>EXPIRING TODAY</span>
          </div>
          {criticalTasks.map(t => <TaskCard key={t.id} t={t} highlight />)}
        </div>}

        {/* URGENT section */}
        {urgentTasks.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 12 }}>🔶</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: P.yellow, letterSpacing: 1 }}>URGENT — CLOSING SOON</span>
          </div>
          {urgentTasks.map(t => <TaskCard key={t.id} t={t} highlight />)}
        </div>}

        {/* ACTIVE section */}
        {activeTasks.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.cyan, letterSpacing: 1, marginBottom: 8 }}>🟢 ACTIVE</div>
          {activeTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>}

        {/* COMPLETED */}
        {completedTasks.length > 0 && <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.green, letterSpacing: 1, marginBottom: 8 }}>✅ COMPLETED</div>
          {completedTasks.map(t => <TaskCard key={t.id} t={t} />)}
        </div>}

        {/* Content Creator teaser */}
        <div style={{ ...card, padding: 18, marginTop: 8, background: `${P.purple}08`, border: `1px solid ${P.purple}22`, textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>✍️</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: P.purple }}>Content Creator Mode</div>
          <div style={{ fontSize: 12, color: P.sub, marginTop: 2, lineHeight: 1.4 }}>AI-powered daily tweet missions to build your CT voice. Coming soon.</div>
          <div style={{ marginTop: 8, padding: "6px 14px", background: `${P.purple}15`, borderRadius: 8, display: "inline-block", fontSize: 11, fontWeight: 700, color: P.purple }}>Coming Soon</div>
        </div>
      </div>, true
    );
  }

  /* ═══════════════════════════════════════
     TASK DETAIL
     ═══════════════════════════════════════ */
  if (sc === SC.TASK && activeTask) {
    const t = activeTask;
    const pr = getFP(t.id), allDone = pr >= t.steps.length;
    return wrap(
      <div style={{ paddingTop: 12 }}>
        <button onClick={() => nav(SC.HOME)} style={{ background: "none", border: "none", color: P.sub, cursor: "pointer", fontSize: 13, fontFamily: FONT, fontWeight: 600, padding: "8px 0", marginBottom: 12 }}>← Back to Queue</button>

        {/* Protocol header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 40 }}>{t.emoji}</span>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{t.protocol}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <Pill text={t.chain} color={P.cyan} />
              <Pill text={urgencyLabel(t.urgency)} color={urgencyColor(t.urgency)} filled />
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ ...card, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{pr}/{t.steps.length} steps complete</span>
            <span style={{ fontSize: 12, color: urgencyColor(t.urgency), fontWeight: 700 }}>⏰ {t.deadline} left</span>
          </div>
          <div style={{ height: 6, background: P.muted, borderRadius: 6 }}>
            <div style={{ height: "100%", width: `${(pr / t.steps.length) * 100}%`, background: allDone ? P.green : P.accent, borderRadius: 6, transition: "width .4s ease" }} />
          </div>
        </div>

        {/* Steps */}
        {t.steps.map((s, i) => {
          const d = farmDone[t.id]?.has(i);
          const isNext = !d && i === pr; // Next uncompleted step
          return <div key={i} style={{
            ...card, padding: 16, marginBottom: 8,
            border: isNext ? `1px solid ${P.accent}44` : `1px solid ${P.border}`,
            background: isNext ? `${P.accent}06` : d ? `${P.green}06` : P.card,
            animation: isNext ? "glow 3s ease infinite" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div onClick={() => completeFarmStep(t.id, i)} style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${d ? P.green : isNext ? P.accent : P.muted}`,
                background: d ? `${P.green}20` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 900, color: d ? P.green : isNext ? P.accent : P.sub,
                cursor: "pointer", transition: "all .2s",
              }}>{d ? "✓" : i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: d ? P.sub : P.text, textDecoration: d ? "line-through" : "none" }}>{s.text}</div>
                <div style={{ fontSize: 11, color: P.sub, marginTop: 3 }}>~{s.time}</div>
                {s.tip && !d && <div style={{ fontSize: 11, color: P.yellow, marginTop: 4 }}>💡 {s.tip}</div>}
                {s.link && !d && <a href={s.link} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-block", marginTop: 8, padding: "6px 14px", background: isNext ? P.accent : P.muted,
                  color: isNext ? "#FFF" : P.text, borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none",
                }}>{isNext ? "Open & Do This ↗" : "Open ↗"}</a>}
              </div>
            </div>
          </div>;
        })}

        {allDone && <div style={{ ...card, padding: 20, marginTop: 8, textAlign: "center", border: `1px solid ${P.green}33`, background: `${P.green}08` }}>
          <div style={{ fontSize: 36, marginBottom: 4 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: P.green }}>{t.protocol} Complete!</div>
          <div style={{ fontSize: 12, color: P.sub, marginTop: 2 }}>You're in the eligible pool. This counts toward your streak.</div>
        </div>}

        {/* Disclaimer + source */}
        <div style={{ marginTop: 16, padding: "10px 14px", background: P.muted, borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: P.sub, lineHeight: 1.5 }}>{t.disclaimer}</div>
          <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: P.accent, fontWeight: 600, textDecoration: "none", marginTop: 4, display: "inline-block" }}>View source ↗</a>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     DISCOVER — Live protocol opportunities
     ═══════════════════════════════════════ */
  if (sc === SC.DISCOVER) return wrap(
    <div style={{ paddingTop: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>🔍 Discover</div>
      <p style={{ fontSize: 12, color: P.sub, marginBottom: 16 }}>Tokenless protocols ranked by airdrop potential. Data from DefiLlama.</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {["all", "dexes", "lending", "bridge", "liquid staking", "restaking"].map(f => (
          <button key={f} onClick={() => setDiscFilter(f)} style={{
            padding: "6px 14px", borderRadius: 20, border: `1px solid ${discFilter === f ? P.accent : P.border}`,
            background: discFilter === f ? `${P.accent}15` : "transparent",
            color: discFilter === f ? P.accent : P.sub,
            fontSize: 11, fontWeight: 700, fontFamily: FONT, cursor: "pointer", whiteSpace: "nowrap",
          }}>{f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {apiStatus === "loading" && <div style={{ textAlign: "center", padding: 40, color: P.sub }}>
        <div style={{ fontSize: 32, animation: "pulse 1.5s ease infinite" }}>🔍</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>Scanning protocols...</div>
      </div>}

      {liveDisc && liveDisc.filter(o => discFilter === "all" || o.category?.toLowerCase() === discFilter).map((opp, i) => (
        <a key={i} href={opp.url} target="_blank" rel="noopener noreferrer" style={{
          ...card, padding: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 12,
          textDecoration: "none", color: "inherit", animation: `fadeIn .3s ease ${i * 0.05}s both`,
        }}>
          {opp.logo && <img src={opp.logo} alt="" style={{ width: 36, height: 36, borderRadius: 10, background: P.muted }} onError={e => e.target.style.display = "none"} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{opp.name}</span>
              {opp.score >= 80 && <Pill text="🔥 HOT" color={P.accent} filled small />}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
              <Pill text={opp.chain} color={P.cyan} small />
              <Pill text={opp.category || "—"} color={P.sub} small />
              {opp.funding && <Pill text={`Raised ${fmt(opp.funding)}`} color={P.green} small />}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: opp.score >= 70 ? P.accent : P.text }}>{opp.score}</div>
            <div style={{ fontSize: 9, color: P.sub }}>SCORE</div>
          </div>
        </a>
      ))}

      {liveDisc && liveDisc.filter(o => discFilter === "all" || o.category?.toLowerCase() === discFilter).length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: P.sub, fontSize: 13 }}>No protocols match this filter.</div>
      )}

      <div style={{ fontSize: 10, color: P.sub, padding: "10px 12px", background: `${P.yellow}08`, borderRadius: 10, marginTop: 8 }}>
        ℹ️ Tokenless ≠ guaranteed airdrop. Scores estimate likelihood based on TVL, funding, and chain diversity. Not financial advice.
      </div>

      {!hasAdvancedDiscovery && <div style={{ ...card, padding: 16, marginTop: 12, textAlign: "center", opacity: 0.6 }}>
        <span style={{ fontSize: 22 }}>🔒</span>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Advanced Filters & Alerts</div>
        <div style={{ fontSize: 11, color: P.sub }}>Unlock at 14-day streak ({Math.max(0, 14 - streak)} to go)</div>
      </div>}
    </div>, true
  );

  /* ═══════════════════════════════════════
     STATS
     ═══════════════════════════════════════ */
  if (sc === SC.STATS) return wrap(
    <div style={{ paddingTop: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>📊 Stats</div>

      {!hasAnalytics ? (
        <div style={{ ...card, padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Stats unlock at 7-day streak</div>
          <div style={{ fontSize: 13, color: P.sub, marginTop: 4 }}>You're at {streak} days. {Math.max(0, 7 - streak)} more to go.</div>
          <div style={{ marginTop: 16, height: 6, background: P.muted, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (streak / 7) * 100)}%`, background: P.accent, borderRadius: 6 }} />
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn .3s ease" }}>
          {/* Reputation */}
          <div style={{ ...card, padding: 24, textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: P.accent, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>REPUTATION SCORE</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: P.accent }}>{reputation}</div>
            <div style={{ fontSize: 12, color: P.sub }}>Based on streak, protocols farmed, and steps completed</div>
          </div>

          {/* Key stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { label: "Streak", val: streak, color: P.accent, icon: "🔥" },
              { label: "Protocols", val: protocolsDone, color: P.green, icon: "✅" },
              { label: "Steps", val: totalSteps, color: P.blue, icon: "👣" },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: 14, textAlign: "center" }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, marginTop: 2 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: P.sub }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Farm activity this week */}
          <div style={{ ...card, padding: 18, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>This Week</div>
            {FARM_TASKS.map(t => {
              const pr = getFP(t.id), total = t.steps.length, done = pr >= total;
              return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${P.muted}` }}>
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{t.protocol}</div>
                  <div style={{ height: 3, background: P.muted, borderRadius: 3, marginTop: 3 }}>
                    <div style={{ height: "100%", width: `${(pr/total)*100}%`, background: done ? P.green : P.accent, borderRadius: 3 }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: done ? P.green : P.sub, fontWeight: 700 }}>{pr}/{total}</span>
              </div>;
            })}
          </div>

          {/* What's working */}
          <div style={{ ...card, padding: 18, marginBottom: 12, border: `1px solid ${P.green}22` }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>💡 Farming Insight</div>
            <div style={{ fontSize: 12, color: P.sub, lineHeight: 1.6 }}>
              You've been most active on <strong style={{ color: P.text }}>{chains[0] ? CHAINS.find(c => c.id === chains[0])?.label : "EVM"} chains</strong>. 
              Consider diversifying to Monad and Scroll — both have strong airdrop signals and you haven't started yet.
            </div>
          </div>

          {/* Locked tiers */}
          {!hasPortfolio && <div style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 10, opacity: 0.5 }}>
            <span style={{ fontSize: 22 }}>🔒</span>
            <div><div style={{ fontSize: 13, fontWeight: 700 }}>Shareable Farmer Portfolio</div><div style={{ fontSize: 11, color: P.sub }}>Unlock at 30-day streak ({Math.max(0, 30 - streak)} to go)</div></div>
          </div>}
        </div>
      )}
    </div>, true
  );

  /* ═══════════════════════════════════════
     PROFILE
     ═══════════════════════════════════════ */
  if (sc === SC.PROFILE) return wrap(
    <div style={{ paddingTop: 12 }}>
      {/* Identity card */}
      <div style={{ ...card, padding: 24, textAlign: "center", marginBottom: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${P.accent}, ${P.yellow})`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#FFF" }}>
          {(handle || "A")[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: P.text }}>@{handle || "anon"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Pill text={title.name} color={title.color} filled />
          <Pill text={`${streak}-day streak`} color={P.accent} />
        </div>
        <div style={{ fontSize: 48, fontWeight: 900, color: P.accent, marginTop: 16 }}>{reputation}</div>
        <div style={{ fontSize: 10, color: P.sub, fontWeight: 700, letterSpacing: 2 }}>REPUTATION</div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Freezes", val: `${freezes}/3`, icon: "❄️" },
          { label: "Protocols", val: protocolsDone, icon: "✅" },
          { label: "Steps", val: totalSteps, icon: "👣" },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: 12, textAlign: "center" }}>
            <div style={{ fontSize: 16 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: P.sub }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Title progression */}
      <div style={{ ...card, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 12 }}>Title Progression</div>
        {TITLES.filter(t => t.id !== "ghost").map((t, i) => {
          const active = title.id === t.id;
          const achieved = streak >= t.min;
          return <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < TITLES.length - 2 ? `1px solid ${P.muted}` : "none" }}>
            <span style={{ fontSize: 20, filter: achieved ? "none" : "grayscale(1)", opacity: achieved ? 1 : 0.3 }}>{t.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: active ? 800 : 600, color: active ? t.color : achieved ? P.text : P.sub }}>{t.name}</div>
              <div style={{ fontSize: 10, color: P.sub }}>{t.desc}</div>
            </div>
            {active && <Pill text="CURRENT" color={t.color} filled small />}
            {achieved && !active && <span style={{ fontSize: 12, color: P.green }}>✓</span>}
            {!achieved && <span style={{ fontSize: 10, color: P.sub }}>{t.min}d</span>}
          </div>;
        })}
      </div>

      {/* Settings */}
      <div style={{ ...card, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10 }}>Settings</div>
        {[
          { label: "Chains", val: chains.map(c => CHAINS.find(x => x.id === c)?.emoji || "").join(" ") || "None", go: true },
          { label: "Handle", val: handle ? `@${handle}` : "Not set", go: true },
        ].map((s, i) => (
          <div key={i} onClick={() => { setEditing(true); nav(SC.CHAINS); }} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 0", borderBottom: i === 0 ? `1px solid ${P.muted}` : "none", cursor: "pointer",
          }}>
            <span style={{ fontSize: 13, color: P.sub }}>{s.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{s.val}</span>
              <span style={{ fontSize: 12, color: P.sub }}>›</span>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 10, color: P.sub, marginTop: 6 }}>Tap to change</div>
      </div>

      {/* Streak freeze info */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>❄️ Streak Freezes</div>
        <div style={{ fontSize: 12, color: P.sub, lineHeight: 1.6 }}>
          You earn 1 freeze for every 7 consecutive days. Max 3 banked.
          If you miss a day, a freeze auto-activates to protect your streak.
          No freezes left? Your streak resets and your title drops.
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[0,1,2].map(i => <div key={i} style={{
            flex: 1, height: 6, borderRadius: 4, background: i < freezes ? P.blue : P.muted,
          }} />)}
        </div>
        <div style={{ fontSize: 11, color: P.blue, fontWeight: 700, marginTop: 4 }}>{freezes}/3 available</div>
      </div>
    </div>, true
  );

  return null;
}
