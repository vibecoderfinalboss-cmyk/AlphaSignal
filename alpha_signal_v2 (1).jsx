import { useState, useEffect, useCallback } from "react";

/* ═══ PALETTE — Inspired by habit tracker screenshots ═══ */
const palette = {
  bg: "#F5F3EE",
  card: "#FFFFFF",
  text: "#1A1A2E",
  sub: "#6B7280",
  muted: "#E8E6E1",
  orange: "#FF8C42",
  blue: "#4F6AF6",
  green: "#34C759",
  pink: "#FF6B8A",
  yellow: "#FFCB45",
  purple: "#9B7DFF",
  cyan: "#22C3DC",
  red: "#FF4757",
  lime: "#B8E63C",
};
const p = palette;

/* ═══ FONTS ═══ */
const display = `'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif`;
const body = `'DM Sans',-apple-system,sans-serif`;

/* ═══ DATA ═══ */
const NICHES = [
  { id: "defi", label: "DeFi", emoji: "🏦", color: p.orange },
  { id: "rwa", label: "RWA", emoji: "🏢", color: p.blue },
  { id: "ai", label: "AI / DePAI", emoji: "🤖", color: p.purple },
  { id: "l1l2", label: "L1 / L2", emoji: "⛓️", color: p.cyan },
  { id: "btc", label: "Bitcoin", emoji: "₿", color: p.yellow },
  { id: "memes", label: "Memes", emoji: "🐸", color: p.lime },
];
const TONES = [
  { id: "degen", label: "Degen", emoji: "🤙", ex: "Ser if you're not farming this, ngmi.", color: p.pink },
  { id: "pro", label: "Professional", emoji: "📊", ex: "The risk-adjusted opportunity here is underpriced.", color: p.blue },
  { id: "edu", label: "Educational", emoji: "📚", ex: "Let me break down why this matters.", color: p.green },
];
const CHAINS = [
  { id: "eth", label: "Ethereum", emoji: "⟠", color: p.blue },
  { id: "base", label: "Base", emoji: "🔵", color: p.cyan },
  { id: "megaeth", label: "MegaETH", emoji: "⚡", color: p.yellow },
  { id: "monad", label: "Monad", emoji: "🟣", color: p.purple },
  { id: "arb", label: "Arbitrum", emoji: "🔷", color: p.blue },
  { id: "zksync", label: "zkSync", emoji: "🔲", color: p.pink },
];

const CONTENT_MISSIONS = [
  { id: "c1", type: "Hot Take", niche: "DeFi", xp: 20, difficulty: "medium", time: "9 AM", color: p.orange, emoji: "🔥",
    tweet: "Unpopular opinion: most \"DeFi protocols\" shipping in 2026 are just TradFi with extra steps.\n\nThe ones that survive will be the ones banks literally cannot replicate — permissionless composability, not just \"on-chain settlement.\"\n\nName one protocol that passes this test. 👇",
    rationale: "Contrarian frames drive replies. Question hook invites engagement.",
    source: { headline: "DeFi TVL hits $180B while institutional adoption stalls", publisher: "The Block", url: "https://theblock.co/example", time: "3h ago",
      summary: "Total value locked across DeFi has reached $180B ATH, driven by liquid staking and restaking. However, institutional adoption has flatlined — fewer than a dozen TradFi managers deployed meaningful capital on-chain. 73% of new protocols launched with KYC features. Permissionless protocols growing 2.4x faster.",
      dataPoints: ["$180B total DeFi TVL — new ATH", "Only $3.2B from institutions (1.8%)", "73% new protocols include KYC", "Permissionless growing 2.4x faster"],
      nuggets: ["73% of new DeFi protocols launched with KYC gates — at what point do we stop calling it DeFi?", "$180B TVL but only $3.2B from institutions. The 'institutional adoption' narrative is dead."] },
    alts: ["Hot take: 90% of new protocols need KYC, have admin keys, and could be shut down with one email.\n\nThat's not DeFi. That's fintech cosplay.\n\nProve me wrong. 👇"] },
  { id: "c2", type: "Alpha Drop", niche: "AI", xp: 25, difficulty: "medium", time: "1 PM", color: p.purple, emoji: "💎",
    tweet: "Everyone is watching the AI agent meta.\n\nAlmost nobody is watching who controls the compute layer underneath.\n\nThree protocols are quietly building the AWS of decentralized AI.\n\nBookmark this. 🧵👇",
    rationale: "\"Bookmark this\" targets highest-weight algorithm signal.",
    source: { headline: "Decentralized compute demand surges 340% in Q1", publisher: "Messari", url: "https://messari.io/example", time: "5h ago",
      summary: "Demand for decentralized GPU compute surged 340% QoQ, outpacing supply growth of 89%. Three leaders: Render Network ($2.1B staked), Akash (14K+ providers), io.net (28K GPU hours/day). Decentralized inference now 62% cheaper than AWS.",
      dataPoints: ["Compute demand: +340% QoQ", "Supply: only +89%", "Render: $2.1B staked", "62% cheaper than AWS"],
      nuggets: ["340% demand vs 89% supply. GPU shortage is real — bullish for infra tokens.", "Decentralized AI inference is 62% cheaper than AWS. Literally cheaper AND permissionless."] },
    alts: ["AI agents are the hype. Compute is the trade.\n\nThe protocols solving decentralized inference are the picks-and-shovels play of 2026.\n\nBookmark this. 🧵"] },
  { id: "c3", type: "Quick Signal", niche: "Airdrops", xp: 15, difficulty: "easy", time: "8 PM", color: p.green, emoji: "⚡",
    tweet: "If you're not testing @[redacted] on testnet right now, you'll be complaining about \"unfair criteria\" in 6 months.\n\n5 minutes today > 5 hours of cope later.",
    rationale: "Urgency + specific action. Classic CT engagement.",
    source: { headline: "New L2 opens testnet with $40M airdrop allocation", publisher: "Decrypt", url: "https://decrypt.co/example", time: "7h ago",
      summary: "ZK-rollup L2 backed by $120M (a16z + Paradigm) opened public testnet. 8% of supply for participants. 5 txns across 3 types = eligible. Zero capital. 90-day testnet.",
      dataPoints: ["$120M Series B", "8% supply for airdrop", "5 txns = eligible", "Zero capital required"],
      nuggets: ["8% token supply for testnet users. 5 transactions. Most obvious airdrop of 2026.", "Zero capital risk, 5 min effort, $120M backing. Risk/reward is absurd."] },
    alts: ["Testnet just opened for a new L2 with heavy VC backing.\n\nBridge, swap, mint. 5 minutes. Risk: zero.\n\nGo."] },
];

const FARM_TASKS = [
  { id: "f1", protocol: "MegaETH", chain: "MegaETH", xp: 35, deadline: "12 days", urgency: "active", color: p.yellow, emoji: "⚡",
    disclaimer: "Tasks based on MegaETH's official testnet announcement. Eligibility determined by MegaETH, not Alpha Signal.",
    sourceUrl: "https://docs.megaeth.com/testnet",
    steps: [
      { text: "Claim testnet ETH from faucet", link: "https://faucet.megaeth.com", time: "1 min", tip: "Use the same wallet you'll farm with." },
      { text: "Bridge 0.05 ETH to MegaETH", link: "https://bridge.megaeth.com", time: "2 min", tip: "Use 'Fast Bridge' — 30 sec vs 15 min." },
      { text: "Swap ETH → USDC on MegaDEX", link: "https://dex.megaeth.com", time: "1 min", tip: "Swap at least 0.02 ETH. Volume matters." },
      { text: "Add liquidity to ETH/USDC", link: "https://dex.megaeth.com/pools", time: "2 min", tip: "Use 'Full Range' — farming eligibility, not yield." },
      { text: "Mint a free NFT", link: "https://mint.megaeth.com", time: "1 min", tip: "Any free mint counts." },
    ] },
  { id: "f2", protocol: "Monad", chain: "Monad", xp: 30, deadline: "3 days", urgency: "urgent", color: p.purple, emoji: "🟣",
    disclaimer: "Tasks based on Monad's official testnet program. Past airdrops don't guarantee future results.",
    sourceUrl: "https://docs.monad.xyz/testnet",
    steps: [
      { text: "Get testnet MON from faucet", link: "https://faucet.monad.xyz", time: "1 min", tip: "Discord verification required first." },
      { text: "Bridge assets via Monad Bridge", link: "https://bridge.monad.xyz", time: "2 min", tip: "Bridge interaction itself is what matters." },
      { text: "Execute 3 swaps on MonadSwap", link: "https://swap.monad.xyz", time: "3 min", tip: "3 separate swaps, variety of pairs." },
      { text: "Provide liquidity in any pool", link: "https://swap.monad.xyz/pools", time: "2 min", tip: "Even $1 counts. Leave for 24h." },
    ] },
  { id: "f3", protocol: "LayerZero S2", chain: "Multi-chain", xp: 40, deadline: "18 hours", urgency: "critical", color: p.red, emoji: "🔴",
    disclaimer: "LayerZero S2 criteria based on official announcement. Subject to change.",
    sourceUrl: "https://layerzero.network/season2",
    steps: [
      { text: "Bridge USDC Ethereum → Arbitrum via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Use Stargate specifically — built on LayerZero." },
      { text: "Bridge ETH Arbitrum → Base via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Different chains than Step 1. Variety matters." },
      { text: "Use an OFT token cross-chain", link: "https://layerzero.network/ecosystem", time: "5 min", tip: "Transfer any OFT-enabled token between chains." },
    ] },
];

const FEED = [
  { id: 1, niche: "DeFi", headline: "Aave v4 launches unified liquidity across 8 chains", summary: "TVL +$2.1B in 48h.", time: "2h", angle: "Why unified liquidity changes composability", color: p.orange },
  { id: 2, niche: "AI", headline: "Bittensor subnet 32 matches GPT-4 on coding", summary: "60% cheaper than centralized.", time: "1h", angle: "Decentralized AI stopped being a meme", color: p.purple },
  { id: 3, niche: "L1/L2", headline: "Base surpasses Arbitrum in daily txns", summary: "4.2M txns/day.", time: "3h", angle: "Distribution beats tech", color: p.cyan },
  { id: 4, niche: "BTC", headline: "Bitcoin L2 TVL crosses $4B", summary: "Up 800% in 6 months.", time: "5h", angle: "Bitcoin DeFi is real", color: p.yellow },
];

const LEVELS = [
  { name: "Lurker", min: 0, color: "#9CA3AF", icon: "👀" },
  { name: "Contributor", min: 200, color: p.blue, icon: "✍️" },
  { name: "Voice", min: 600, color: p.purple, icon: "🗣️" },
  { name: "Analyst", min: 1500, color: p.orange, icon: "📊" },
  { name: "Alpha Leader", min: 3500, color: p.pink, icon: "👑" },
  { name: "CT Legend", min: 7000, color: p.red, icon: "🏆" },
];
function getLevel(xp) { let l = LEVELS[0]; for (const v of LEVELS) if (xp >= v.min) l = v; return l; }
function getNext(xp) { for (const v of LEVELS) if (xp < v.min) return v; return null; }

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const TODAY_IDX = 2; // Wed

const S = { W:"w", MODE:"m", NICHES:"n", TONE:"t", CHAINS:"ch", DIS:"dis", TZ:"tz", LD:"ld", DASH:"d", CM:"cm", FT:"ft", REC:"r", PRO:"p" };

export default function AlphaSignal() {
  const [sc, setSc] = useState(S.W);
  const [fade, setFade] = useState(true);
  const [modes, setModes] = useState([]);
  const [niches, setNiches] = useState([]);
  const [tone, setTone] = useState(null);
  const [chains, setChains] = useState([]);
  const [user, setUser] = useState("");
  const [streak, setStreak] = useState(14);
  const [xp, setXp] = useState(520);
  const [done, setDone] = useState(new Set());
  const [farmDone, setFarmDone] = useState({});
  const [activeC, setActiveC] = useState(null);
  const [activeF, setActiveF] = useState(null);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  const [xpPop, setXpPop] = useState(0);
  const [tab, setTab] = useState("missions");
  const [celeb, setCeleb] = useState(false);
  const [srcOpen, setSrcOpen] = useState(false);
  const [warn, setWarn] = useState(false);
  const [disclaimOk, setDisclaimOk] = useState(false);
  const [dualToday, setDualToday] = useState(false);

  const nav = useCallback(s => { setFade(false); setTimeout(() => { setSc(s); setFade(true); }, 120); }, []);
  const tog = (_arr, set, id, max) => set(prev => prev.includes(id) ? prev.filter(x=>x!==id) : max ? (prev.length<max ? [...prev,id] : prev) : [...prev,id]);

  const hasContent = modes.includes("content"), hasFarm = modes.includes("farm");
  const contentDone = [...done].some(id => id.startsWith("c"));
  const farmStepDone = Object.values(farmDone).some(s => s?.size > 0);
  const anyDone = contentDone || farmStepDone;
  const isDual = contentDone && farmStepDone;
  const level = getLevel(xp), nextLvl = getNext(xp);

  const addXp = (amt) => {
    const bonus = isDual && !dualToday ? 1.5 : 1;
    const t = Math.round(amt * bonus);
    setXp(p => p + t); setXpPop(t);
    setTimeout(() => setXpPop(0), 1800);
    if (isDual && !dualToday) setDualToday(true);
  };
  const completeContent = (m) => {
    if (done.has(m.id)) return;
    setDone(p => new Set([...p, m.id]));
    addXp(m.xp);
    if (!anyDone) setTimeout(() => { setStreak(s => s + 1); setCeleb(true); setTimeout(() => setCeleb(false), 3000); }, 600);
    setTimeout(() => nav(S.DASH), 1200);
  };
  const completeFarmStep = (tid, idx) => {
    const prevSize = farmDone[tid]?.size || 0;
    if (farmDone[tid]?.has(idx)) return; // already done
    setFarmDone(prev => { const s = new Set(prev[tid]||[]); s.add(idx); return {...prev,[tid]:s}; });
    const t = FARM_TASKS.find(x=>x.id===tid);
    const newSize = prevSize + 1;
    if (newSize >= t.steps.length) addXp(t.xp); else addXp(3);
    if (!anyDone && !contentDone) setTimeout(() => setStreak(s=>s+1), 600);
  };
  const getFP = (tid) => farmDone[tid]?.size || 0;

  useEffect(() => {
    if (sc === S.DASH && !anyDone) { const t = setTimeout(() => setWarn(true), 4000); return () => clearTimeout(t); }
    setWarn(false);
  }, [sc, anyDone]);

  /* ═══ SHARED COMPONENTS ═══ */
  const r = 20; // border radius
  const cardS = { background: p.card, borderRadius: r, boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)" };

  const Pill = ({ text, color, filled }) => <span style={{
    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: body,
    background: filled ? color : `${color}15`, color: filled ? "#FFF" : color,
  }}>{text}</span>;

  const Btn = ({ children, on, dis, full, ghost, color: cc = p.blue }) => <button disabled={dis} onClick={on} style={{
    padding: "14px 28px", borderRadius: 14,
    border: ghost ? `2px solid ${p.muted}` : "none",
    background: ghost ? "transparent" : dis ? "#E5E7EB" : cc,
    color: ghost ? p.text : dis ? "#9CA3AF" : "#FFF",
    fontWeight: 700, fontSize: 15, fontFamily: body,
    cursor: dis ? "default" : "pointer", width: full ? "100%" : "auto",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all .15s", opacity: dis ? 0.6 : 1,
  }}>{children}</button>;

  const PB = ({ v, mx, c = p.blue, h = 6 }) => <div style={{ width: "100%", height: h, borderRadius: h, background: p.muted }}>
    <div style={{ width: `${Math.min(v/mx*100,100)}%`, height: "100%", borderRadius: h, background: c, transition: "width .6s cubic-bezier(.34,1.56,.64,1)" }} />
  </div>;

  const ct = { maxWidth: 440, margin: "0 auto", padding: "0 20px", opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(6px)", transition: "opacity .15s, transform .15s" };

  const wrap = (ch, navShow = false) => (
    <div style={{ minHeight: "100vh", background: p.bg, color: p.text, fontFamily: body, fontSize: 14 }}>
      {ch}
      {navShow && <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: p.card, borderTop: `1px solid ${p.muted}`, borderRadius: "20px 20px 0 0", boxShadow: "0 -2px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 440, margin: "0 auto", display: "flex" }}>
          {[{ id: S.DASH, i: "🏠", l: "Home" }, { id: S.REC, i: "📊", l: "Recap" }, { id: S.PRO, i: "👤", l: "Profile" }].map(it => (
            <button key={it.id} onClick={() => nav(it.id)} style={{
              flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span style={{ fontSize: 22 }}>{it.i}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: sc === it.id ? p.blue : p.sub }}>{it.l}</span>
              {sc === it.id && <div style={{ width: 20, height: 3, borderRadius: 2, background: p.blue, marginTop: 1 }} />}
            </button>
          ))}
        </div>
      </div>}
      {xpPop > 0 && <div style={{ position: "fixed", top: "40%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 200, animation: "xpF 1.6s ease-out forwards", pointerEvents: "none" }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: p.orange, fontFamily: display, textShadow: "0 4px 20px rgba(255,140,66,0.3)" }}>+{xpPop} XP</div>
      </div>}
      {celeb && <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center", animation: "cF 3s ease-out forwards" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72 }}>🔥</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: p.orange, fontFamily: display }}>{streak + 1}-Day Streak!</div>
          <div style={{ fontSize: 14, color: p.sub, marginTop: 6 }}>Keep showing up. You're building something.</div>
        </div>
      </div>}
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes xpF{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}55%{opacity:1}100%{opacity:0;transform:translate(-50%,-110%) scale(.9)}}
        @keyframes cF{0%,65%{opacity:1}100%{opacity:0;pointer-events:none}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      `}</style>
    </div>
  );

  // ═══ WELCOME ═══
  if (sc === S.W) return wrap(
    <div style={{ ...ct, paddingTop: 80, textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 8 }}>⚡</div>
      <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 4px", fontFamily: display, color: p.text }}>Alpha Signal</h1>
      <p style={{ color: p.sub, fontSize: 13, margin: "0 0 36px", letterSpacing: 2, textTransform: "uppercase" }}>Your Crypto Copilot</p>
      <div style={{ ...cardS, padding: 24, textAlign: "left", marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${p.orange}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✍️</div>
          <div><div style={{ fontWeight: 700, fontSize: 15 }}>Content Creator Mode</div><div style={{ fontSize: 12, color: p.sub }}>3 AI tweet missions daily</div></div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${p.cyan}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🪂</div>
          <div><div style={{ fontWeight: 700, fontSize: 15 }}>Airdrop Farmer Mode</div><div style={{ fontSize: 12, color: p.sub }}>Step-by-step protocol tasks</div></div>
        </div>
      </div>
      <Btn on={() => nav(S.MODE)} full color={p.blue}>Get Started</Btn>
      <p style={{ color: p.sub, fontSize: 12, marginTop: 20 }}>Free forever. No credit card.</p>
    </div>
  );

  // ═══ MODE SELECT ═══
  if (sc === S.MODE) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <p style={{ color: p.blue, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>STEP 1</p>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", fontFamily: display }}>What do you want to do?</h2>
      <p style={{ color: p.sub, fontSize: 13, margin: "0 0 24px" }}>Pick one or both.</p>
      {[
        { id: "content", icon: "✍️", title: "Build my CT presence", desc: "Daily tweet missions, AI-generated, algorithm-optimized.", color: p.orange },
        { id: "farm", icon: "🪂", title: "Farm airdrops", desc: "Step-by-step tasks with deadline tracking.", color: p.cyan },
      ].map(m => {
        const sel = modes.includes(m.id);
        return <div key={m.id} onClick={() => tog(modes, setModes, m.id)} style={{
          ...cardS, padding: 20, marginBottom: 10, cursor: "pointer",
          border: sel ? `2px solid ${m.color}` : "2px solid transparent",
          background: sel ? `linear-gradient(135deg,${m.color}08,${p.card})` : p.card,
          transition: "all .15s",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{m.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: p.sub, marginTop: 2 }}>{m.desc}</div>
            </div>
            {sel && <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 14, fontWeight: 900 }}>✓</div>}
          </div>
        </div>;
      })}
      {modes.length === 2 && <div style={{ padding: "10px 16px", background: `${p.purple}10`, borderRadius: 14, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: p.purple, fontWeight: 600 }}>🔥 Dual Mode! Both count toward your streak. Both in one day = 1.5x XP.</span>
      </div>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
        <Btn dis={!modes.length} on={() => nav(hasContent ? S.NICHES : S.CHAINS)}>Continue →</Btn>
      </div>
    </div>
  );

  // ═══ NICHES ═══
  if (sc === S.NICHES) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <p style={{ color: p.blue, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>STEP 2</p>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", fontFamily: display }}>Pick your niches</h2>
      <p style={{ color: p.sub, fontSize: 13, margin: "0 0 24px" }}>Choose 2–3 for your missions.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {NICHES.map(n => {
          const sel = niches.includes(n.id);
          return <div key={n.id} onClick={() => tog(niches, setNiches, n.id, 3)} style={{
            ...cardS, padding: "16px 8px", cursor: "pointer", textAlign: "center",
            border: sel ? `2px solid ${n.color}` : "2px solid transparent",
            background: sel ? `${n.color}10` : p.card,
          }}>
            <div style={{ fontSize: 28 }}>{n.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: sel ? n.color : p.text, marginTop: 4 }}>{n.label}</div>
          </div>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn ghost on={() => nav(S.MODE)}>← Back</Btn>
        <Btn dis={niches.length < 2} on={() => nav(S.TONE)}>Continue →</Btn>
      </div>
    </div>
  );

  // ═══ TONE ═══
  if (sc === S.TONE) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <p style={{ color: p.blue, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>STEP 3</p>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 24px", fontFamily: display }}>What's your voice?</h2>
      {TONES.map(t => {
        const sel = tone === t.id;
        return <div key={t.id} onClick={() => setTone(t.id)} style={{
          ...cardS, padding: 18, marginBottom: 10, cursor: "pointer",
          border: sel ? `2px solid ${t.color}` : "2px solid transparent",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: `${t.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{t.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: sel ? t.color : p.text }}>{t.label}</div>
              <div style={{ fontSize: 12, color: p.sub, fontStyle: "italic", marginTop: 2 }}>"{t.ex}"</div>
            </div>
            {sel && <div style={{ width: 24, height: 24, borderRadius: "50%", background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 12, fontWeight: 900 }}>✓</div>}
          </div>
        </div>;
      })}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <Btn ghost on={() => nav(S.NICHES)}>← Back</Btn>
        <Btn dis={!tone} on={() => nav(hasFarm ? S.CHAINS : S.TZ)}>Continue →</Btn>
      </div>
    </div>
  );

  // ═══ CHAINS ═══
  if (sc === S.CHAINS) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <p style={{ color: p.cyan, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>FARMING SETUP</p>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 6px", fontFamily: display }}>Pick chains to farm</h2>
      <p style={{ color: p.sub, fontSize: 13, margin: "0 0 24px" }}>Select as many as you want.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
        {CHAINS.map(c => {
          const sel = chains.includes(c.id);
          return <div key={c.id} onClick={() => tog(chains, setChains, c.id)} style={{
            ...cardS, padding: "16px 8px", cursor: "pointer", textAlign: "center",
            border: sel ? `2px solid ${c.color}` : "2px solid transparent",
            background: sel ? `${c.color}10` : p.card,
          }}>
            <div style={{ fontSize: 28 }}>{c.emoji}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: sel ? c.color : p.text, marginTop: 4 }}>{c.label}</div>
          </div>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn ghost on={() => nav(hasContent ? S.TONE : S.MODE)}>← Back</Btn>
        <Btn dis={!chains.length} on={() => nav(S.DIS)}>Continue →</Btn>
      </div>
    </div>
  );

  // ═══ DISCLAIMER ═══
  if (sc === S.DIS) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <div style={{ ...cardS, padding: 24, border: `2px solid ${p.yellow}44` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `${p.yellow}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>⚠️</div>
          <span style={{ fontSize: 18, fontWeight: 900, fontFamily: display }}>Important Disclosure</span>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: p.sub, margin: "0 0 16px" }}>
          Alpha Signal compiles publicly available airdrop information. We <strong style={{ color: p.red }}>do not guarantee</strong> eligibility, token value, or distribution.
        </p>
        <div style={{ background: p.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          {["All tasks are informational — not financial advice", "Eligibility determined by protocols, not us", "Estimated values based on comparable airdrops", "Past distributions ≠ future results", "You're responsible for your on-chain actions"].map((l,i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: i<4?8:0, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.yellow, marginTop: 7, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: p.text }}>{l}</span>
            </div>
          ))}
        </div>
        <div onClick={() => setDisclaimOk(!disclaimOk)} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", marginBottom: 20 }}>
          <div style={{ width: 24, height: 24, borderRadius: 8, border: `2px solid ${disclaimOk ? p.green : "#D1D5DB"}`, background: disclaimOk ? `${p.green}15` : "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: p.green, transition: "all .15s" }}>{disclaimOk ? "✓" : ""}</div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>I understand and accept</span>
        </div>
        <Btn dis={!disclaimOk} full on={() => nav(S.TZ)} color={p.blue}>Continue →</Btn>
      </div>
    </div>
  );

  // ═══ TIMEZONE ═══
  if (sc === S.TZ) return wrap(
    <div style={{ ...ct, paddingTop: 48 }}>
      <p style={{ color: p.blue, fontSize: 12, fontWeight: 700, letterSpacing: 2, margin: "0 0 4px" }}>FINAL STEP</p>
      <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 24px", fontFamily: display }}>Almost there!</h2>
      <div style={{ ...cardS, padding: 18, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: p.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>X Handle (optional)</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: p.bg, borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ color: p.sub, fontWeight: 600 }}>@</span>
          <input value={user} onChange={e => setUser(e.target.value)} placeholder="yourhandle" style={{ flex: 1, background: "none", border: "none", color: p.text, fontSize: 15, fontFamily: body, outline: "none" }} />
        </div>
      </div>
      <div style={{ ...cardS, padding: 18, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: p.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Timezone</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>🌍 Africa/Lagos (UTC+1)</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn ghost on={() => nav(hasFarm ? S.DIS : hasContent ? S.TONE : S.MODE)}>← Back</Btn>
        <Btn on={() => { nav(S.LD); setTimeout(() => nav(S.DASH), 2200); }} color={p.green}>Launch 🚀</Btn>
      </div>
    </div>
  );

  // ═══ LOADING ═══
  if (sc === S.LD) return wrap(
    <div style={{ ...ct, paddingTop: 140, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 12, animation: "pulse 1.5s ease-in-out infinite" }}>⚡</div>
      <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: display, color: p.text }}>Building your missions...</h2>
      <p style={{ color: p.sub, fontSize: 13 }}>{hasContent ? "Curating alpha" : ""}{hasContent && hasFarm ? " · " : ""}{hasFarm ? "Scanning protocols" : ""}</p>
    </div>
  );

  // ═══ CONTENT MISSION DETAIL ═══
  if (sc === S.CM && activeC) {
    const m = activeC, s = m.source, text = editText || m.tweet, cc = text.length;
    return wrap(
      <div style={{ ...ct, paddingTop: 16, paddingBottom: 40 }}>
        <button onClick={() => { nav(S.DASH); setEditText(""); setSrcOpen(false); }} style={{ background: "none", border: "none", color: p.sub, cursor: "pointer", fontSize: 13, fontFamily: body, padding: "8px 0", marginBottom: 10, fontWeight: 600 }}>← Back</button>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Pill text={m.type} color={m.color} filled /><Pill text={m.niche} color="#9CA3AF" /><Pill text={m.difficulty} color={m.difficulty==="easy"?p.green:p.orange} />
          <span style={{ marginLeft: "auto", fontSize: 12, color: p.sub }}>🕐 {m.time}</span>
        </div>

        {/* Source panel */}
        <div style={{ ...cardS, marginBottom: 12, overflow: "hidden", border: srcOpen ? `2px solid ${p.orange}44` : "2px solid transparent" }}>
          <div onClick={() => setSrcOpen(!srcOpen)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, background: srcOpen ? `${p.orange}05` : "transparent" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${p.orange}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📰</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: p.sub, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Source</div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3, marginTop: 1 }}>{s.headline}</div>
              <div style={{ fontSize: 11, color: p.orange, marginTop: 2, fontWeight: 600 }}>{s.publisher} · {s.time}</div>
            </div>
            <span style={{ fontSize: 16, color: p.sub, transition: "transform .2s", transform: srcOpen ? "rotate(180deg)" : "none" }}>▾</span>
          </div>
          {srcOpen && <div style={{ padding: "0 16px 16px", animation: "fadeIn .2s ease" }}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: `${p.orange}08`, borderRadius: 12, textDecoration: "none", marginBottom: 12 }}>
              <span>🔗</span><span style={{ flex: 1, fontSize: 13, color: p.orange, fontWeight: 600 }}>Read on {s.publisher}</span><span style={{ color: p.orange }}>↗</span>
            </a>
            <p style={{ fontSize: 13, color: p.sub, lineHeight: 1.65, margin: "0 0 12px" }}>{s.summary}</p>
            <div style={{ fontSize: 10, color: p.orange, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>📊 Key Data</div>
            <div style={{ background: p.bg, borderRadius: 12, marginBottom: 12 }}>
              {s.dataPoints.map((d,i) => <div key={i} style={{ display: "flex", gap: 8, padding: "8px 12px", borderBottom: i<s.dataPoints.length-1?`1px solid ${p.muted}`:"none" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: p.orange, marginTop: 6, flexShrink: 0 }} /><span style={{ fontSize: 12 }}>{d}</span>
              </div>)}
            </div>
            <div style={{ fontSize: 10, color: p.purple, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>💎 Tweetable Nuggets</div>
            {s.nuggets.map((n,i) => <div key={i} onClick={() => setEditText(n)} style={{ ...cardS, padding: "10px 14px", marginBottom: 6, cursor: "pointer", border: "1px solid transparent", transition: "border .15s" }}>
              <div style={{ fontSize: 12, color: p.text, lineHeight: 1.5 }}>"{n}"</div>
              <div style={{ fontSize: 10, color: p.purple, marginTop: 4, fontWeight: 600 }}>Tap to use ↑</div>
            </div>)}
          </div>}
        </div>

        {/* Tweet editor */}
        <div style={{ ...cardS, marginBottom: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${p.muted}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${p.orange},${p.yellow})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#FFF" }}>{(user||"A")[0].toUpperCase()}</div>
            <div style={{ fontWeight: 700 }}>@{user || "you"}</div>
            <div style={{ marginLeft: "auto", color: p.orange, fontWeight: 800 }}>+{m.xp} XP</div>
          </div>
          <textarea value={text} onChange={e => setEditText(e.target.value)} style={{ width: "100%", minHeight: 120, padding: 16, background: "none", border: "none", color: p.text, fontSize: 14, lineHeight: 1.6, fontFamily: "-apple-system,sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px", borderTop: `1px solid ${p.muted}` }}>
            <span style={{ fontSize: 11, color: cc>270?p.red:p.sub, fontWeight: 600 }}>{cc}/280</span>
            <div style={{ width: 80 }}><PB v={cc} mx={280} c={cc>260?p.red:p.blue} h={3} /></div>
          </div>
        </div>

        <button onClick={() => setEditText(m.alts?.[0] || m.tweet)} style={{ width: "100%", padding: 12, ...cardS, border: "none", color: p.sub, fontSize: 13, fontFamily: body, cursor: "pointer", fontWeight: 600, marginBottom: 12 }}>🔄 Re-roll — different version</button>

        <div style={{ ...cardS, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: p.orange, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>💡 Why this works</div>
          <p style={{ margin: 0, fontSize: 12, color: p.sub, lineHeight: 1.5 }}>{m.rationale}</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Btn ghost full on={() => { navigator.clipboard?.writeText?.(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>{copied ? "✓ Copied!" : "📋 Copy"}</Btn>
          <Btn full dis={done.has(m.id)} on={() => completeContent(m)} color={p.green}>{done.has(m.id) ? "✓ Done" : "✅ Posted it"}</Btn>
        </div>
      </div>
    );
  }

  // ═══ FARM TASK DETAIL ═══
  if (sc === S.FT && activeF) {
    const t = activeF, prog = getFP(t.id), total = t.steps.length, allD = prog >= total;
    const uc = { active: p.cyan, urgent: p.orange, critical: p.red };
    return wrap(
      <div style={{ ...ct, paddingTop: 16, paddingBottom: 40 }}>
        <button onClick={() => nav(S.DASH)} style={{ background: "none", border: "none", color: p.sub, cursor: "pointer", fontSize: 13, fontFamily: body, padding: "8px 0", marginBottom: 10, fontWeight: 600 }}>← Back</button>

        <div style={{ ...cardS, padding: 18, marginBottom: 12, background: `linear-gradient(135deg,${t.color}10,${p.card})` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${t.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{t.emoji}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, fontFamily: display }}>{t.protocol}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}><Pill text={t.chain} color={p.cyan} /><Pill text={t.deadline} color={uc[t.urgency]||p.cyan} filled /></div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: p.orange }}>+{t.xp}</div>
              <div style={{ fontSize: 11, color: p.sub }}>{prog}/{total} steps</div>
            </div>
          </div>
          <PB v={prog} mx={total} c={allD ? p.green : p.blue} h={6} />
        </div>

        <div style={{ padding: "8px 14px", background: `${p.yellow}12`, borderRadius: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: "#8B7A3D", lineHeight: 1.5 }}>ℹ️ {t.disclaimer} </span>
          <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: p.blue, fontWeight: 600 }}>Source ↗</a>
        </div>

        {t.steps.map((step, i) => {
          const sd = farmDone[t.id]?.has(i), cur = i === prog && !allD;
          return <div key={i} style={{
            ...cardS, padding: "14px 16px", marginBottom: 8,
            border: cur ? `2px solid ${p.blue}` : sd ? `2px solid ${p.green}44` : "2px solid transparent",
            background: cur ? `${p.blue}05` : p.card,
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div onClick={() => cur && completeFarmStep(t.id, i)} style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                border: sd ? `2px solid ${p.green}` : cur ? `2px solid ${p.blue}` : `2px solid ${p.muted}`,
                background: sd ? `${p.green}15` : "#FFF",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: cur ? "pointer" : "default", transition: "all .2s",
              }}>
                {sd ? <span style={{ fontSize: 14, color: p.green, fontWeight: 700 }}>✓</span> : <span style={{ fontSize: 12, color: cur ? p.blue : p.sub, fontWeight: 700 }}>{i+1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: sd ? p.sub : p.text, fontWeight: cur ? 700 : 500, textDecoration: sd ? "line-through" : "none" }}>{step.text}</div>
                <div style={{ fontSize: 11, color: p.sub, marginTop: 2 }}>⏱ ~{step.time}</div>
                {cur && step.tip && <div style={{ marginTop: 8, padding: "8px 12px", background: `${p.orange}08`, borderRadius: 10 }}>
                  <div style={{ fontSize: 10, color: p.orange, fontWeight: 700, marginBottom: 2 }}>💡 Pro tip</div>
                  <div style={{ fontSize: 12, color: "#8B6A2F" }}>{step.tip}</div>
                </div>}
              </div>
              <a href={step.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                padding: "6px 12px", borderRadius: 10, textDecoration: "none",
                background: cur ? p.blue : p.bg, color: cur ? "#FFF" : p.sub,
                fontSize: 11, fontWeight: 700,
              }}>Open ↗</a>
            </div>
          </div>;
        })}

        {allD && <div style={{ textAlign: "center", padding: 24, ...cardS, background: `${p.green}08`, marginTop: 8 }}>
          <div style={{ fontSize: 40 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: p.green }}>All steps complete!</div>
          <div style={{ fontSize: 12, color: p.sub, marginTop: 4 }}>You're in the eligible pool for {t.protocol}.</div>
        </div>}
      </div>
    );
  }

  // ═══ RECAP ═══
  if (sc === S.REC) return wrap(
    <div style={{ ...ct, paddingTop: 24, paddingBottom: 100 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 20px", fontFamily: display }}>Your Week 📊</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { l: "Streak", v: `${streak}d`, c: p.orange, i: "🔥" },
          { l: "XP Earned", v: `+${xp-520}`, c: p.purple, i: "⭐" },
          { l: "Content", v: `${[...done].filter(d=>d.startsWith("c")).length}`, c: p.orange, i: "✍️" },
          { l: "Farm Steps", v: `${Object.values(farmDone).reduce((a,s)=>a+(s?.size||0),0)}`, c: p.cyan, i: "🪂" },
        ].map((s,i) => <div key={i} style={{ ...cardS, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 18 }}>{s.i}</span><span style={{ fontSize: 11, color: p.sub, fontWeight: 600, textTransform: "uppercase" }}>{s.l}</span></div>
          <div style={{ fontSize: 28, fontWeight: 900, color: s.c }}>{s.v}</div>
        </div>)}
      </div>
      {hasFarm && <div style={{ ...cardS, padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: p.cyan, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🪂 Protocol Progress</div>
        {FARM_TASKS.map(t => <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, minWidth: 90 }}>{t.protocol}</span>
          <div style={{ flex: 1 }}><PB v={getFP(t.id)} mx={t.steps.length} c={getFP(t.id)>=t.steps.length?p.green:p.blue} h={5} /></div>
          <span style={{ fontSize: 11, color: p.sub, fontWeight: 600 }}>{getFP(t.id)}/{t.steps.length}</span>
        </div>)}
      </div>}
      <div style={{ ...cardS, padding: 18, background: `${p.blue}06` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 18 }}>🧠</span><span style={{ fontSize: 12, fontWeight: 800, color: p.blue }}>COACH SUGGESTION</span></div>
        <p style={{ margin: 0, fontSize: 13, color: p.sub, lineHeight: 1.6 }}>
          {hasFarm && hasContent ? "You're running dual mode — aim for 3 Dual Mode Days this week for max XP." : hasContent ? "Try thread-style breakdowns this week. Your audience loves data takes." : "LayerZero S2 deadline is closing. Prioritize it."}
        </p>
      </div>
    </div>, true
  );

  // ═══ PROFILE ═══
  if (sc === S.PRO) {
    const xpIn = nextLvl ? xp - level.min : 0, xpFor = nextLvl ? nextLvl.min - level.min : 1;
    return wrap(
      <div style={{ ...ct, paddingTop: 24, paddingBottom: 100 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg,${p.orange},${p.yellow})`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color: "#FFF" }}>{(user||"A")[0].toUpperCase()}</div>
          <div style={{ fontSize: 20, fontWeight: 900, fontFamily: display }}>@{user || "you"}</div>
          <div style={{ fontSize: 13, color: level.color, fontWeight: 700, marginTop: 3 }}>{level.icon} {level.name}</div>
        </div>
        <div style={{ ...cardS, padding: 18, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: level.color, fontWeight: 700 }}>{level.name}</span>
            {nextLvl && <span style={{ fontSize: 11, color: p.sub }}>{nextLvl.min - xp} XP → {nextLvl.name}</span>}
          </div>
          <PB v={xpIn} mx={xpFor} c={level.color} h={8} />
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>{xp} XP</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[{ l: "Streak", v: streak, i: "🔥" }, { l: "Level", v: LEVELS.indexOf(level)+1, i: level.icon }, { l: "Modes", v: modes.length, i: "⚡" }].map((s,i) => (
            <div key={i} style={{ ...cardS, padding: 14, textAlign: "center" }}><div style={{ fontSize: 22 }}>{s.i}</div><div style={{ fontSize: 22, fontWeight: 900 }}>{s.v}</div><div style={{ fontSize: 10, color: p.sub, fontWeight: 600, textTransform: "uppercase" }}>{s.l}</div></div>
          ))}
        </div>
        <div style={{ ...cardS, padding: 18 }}>
          <div style={{ fontSize: 11, color: p.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Settings</div>
          {[
            { l: "Modes", v: modes.map(m => m === "content" ? "✍️ Content" : "🪂 Farm").join(" + ") },
            hasContent && { l: "Niches", v: niches.map(n => NICHES.find(x=>x.id===n)?.emoji).join(" ") },
            hasContent && { l: "Tone", v: TONES.find(t=>t.id===tone)?.label },
            hasFarm && { l: "Chains", v: chains.map(c => CHAINS.find(x=>x.id===c)?.emoji).join(" ") },
            { l: "Timezone", v: "Africa/Lagos" },
          ].filter(Boolean).map((s,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${p.muted}` }}>
              <span style={{ fontSize: 13, color: p.sub }}>{s.l}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>, true
    );
  }

  // ═══ DASHBOARD ═══
  if (sc === S.DASH) {
    const critTask = FARM_TASKS.find(t => t.urgency === "critical");
    const tabs = [];
    if (hasContent) tabs.push({ id: "missions", label: "✍️ Missions" });
    if (hasFarm) tabs.push({ id: "farm", label: "🪂 Farm" });
    tabs.push({ id: "feed", label: "📰 Feed" });
    const validTab = tabs.find(t => t.id === tab) ? tab : tabs[0]?.id || "missions";

    return wrap(<div>
      {warn && !anyDone && <div style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 80, maxWidth: 400, width: "90%", ...cardS, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, border: `2px solid ${p.red}33`, animation: "fadeIn .3s ease" }}>
        <span style={{ fontSize: 22 }}>🔥</span>
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 800, color: p.red }}>{streak}-day streak at risk!</div><div style={{ fontSize: 11, color: p.sub }}>Complete 1 task to keep it alive.</div></div>
        <button onClick={() => setWarn(false)} style={{ background: "none", border: "none", color: p.sub, cursor: "pointer", fontSize: 16 }}>✕</button>
      </div>}

      <div style={{ ...ct, paddingTop: 18, paddingBottom: 100 }}>
        {/* Greeting */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: p.sub }}>Good morning,</div>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: display }}>{user ? user : "Anon"} ⚡</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 28 }}>🔥</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: p.orange }}>{streak}</div>
          </div>
        </div>

        {/* Day selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{
              flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 14,
              background: i === TODAY_IDX ? p.blue : p.card,
              color: i === TODAY_IDX ? "#FFF" : p.sub,
              boxShadow: i === TODAY_IDX ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>{10 + i}</div>
              <div style={{ fontSize: 10, fontWeight: 600 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Streak + Level bar */}
        {nextLvl && <div style={{ ...cardS, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 16 }}>{level.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: level.color }}>{level.name}</span>
              <span style={{ fontSize: 12, color: p.sub }}>{xp} XP</span>
            </div>
            <span style={{ fontSize: 11, color: p.sub }}>{nextLvl.min - xp} → {nextLvl.name}</span>
          </div>
          <PB v={xp - level.min} mx={nextLvl.min - level.min} c={level.color} h={6} />
          {isDual && <div style={{ marginTop: 8, padding: "6px 12px", background: `${p.purple}10`, borderRadius: 10 }}>
            <span style={{ fontSize: 11, color: p.purple, fontWeight: 700 }}>⚡ Dual Mode Day — 1.5x XP active!</span>
          </div>}
          {hasFarm && critTask && !isDual && <div style={{ marginTop: 8, padding: "6px 12px", background: `${p.red}08`, borderRadius: 10 }}>
            <span style={{ fontSize: 11, color: p.red, fontWeight: 700 }}>⚠️ {critTask.protocol}: {critTask.deadline} left!</span>
          </div>}
        </div>}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16, background: p.muted, borderRadius: 14, padding: 3 }}>
          {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "9px 0", borderRadius: 12, border: "none",
            background: validTab === t.id ? p.card : "transparent",
            boxShadow: validTab === t.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            color: validTab === t.id ? p.text : p.sub, fontWeight: 700, fontSize: 12, fontFamily: body, cursor: "pointer",
          }}>{t.label}</button>)}
        </div>

        {/* Content missions */}
        {validTab === "missions" && hasContent && CONTENT_MISSIONS.map(m => {
          const d = done.has(m.id);
          return <div key={m.id} onClick={() => { if(!d){ setActiveC(m); setEditText(m.tweet); setSrcOpen(false); setCopied(false); nav(S.CM); }}} style={{
            ...cardS, padding: 16, marginBottom: 10, cursor: d ? "default" : "pointer",
            opacity: d ? 0.55 : 1, border: `2px solid ${d ? p.green + "44" : "transparent"}`,
            background: d ? `${p.green}05` : p.card,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${m.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{m.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
                  <Pill text={m.type} color={m.color} filled /><span style={{ fontSize: 11, color: p.sub }}>🕐 {m.time}</span>
                </div>
                <div style={{ fontSize: 13, color: p.text, lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{m.tweet.split("\n")[0]}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {d ? <span style={{ fontSize: 20, color: p.green }}>✓</span> : <span style={{ fontSize: 13, fontWeight: 800, color: p.orange }}>+{m.xp}</span>}
              </div>
            </div>
          </div>;
        })}

        {/* Farm tasks */}
        {validTab === "farm" && hasFarm && FARM_TASKS.map(t => {
          const pr = getFP(t.id), allD = pr >= t.steps.length;
          const uc = { active: p.cyan, urgent: p.orange, critical: p.red };
          return <div key={t.id} onClick={() => { setActiveF(t); nav(S.FT); }} style={{
            ...cardS, padding: 16, marginBottom: 10, cursor: "pointer",
            border: t.urgency === "critical" ? `2px solid ${p.red}44` : "2px solid transparent",
            opacity: allD ? 0.55 : 1,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${t.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{t.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{t.protocol}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}><Pill text={t.chain} color={p.cyan} /><Pill text={t.deadline} color={uc[t.urgency]||p.cyan} filled /></div>
              </div>
              <div style={{ textAlign: "right" }}>
                {allD ? <span style={{ fontSize: 20, color: p.green }}>✓</span> : <span style={{ fontSize: 14, fontWeight: 900, color: p.orange }}>+{t.xp}</span>}
              </div>
            </div>
            <PB v={pr} mx={t.steps.length} c={allD ? p.green : p.blue} h={5} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: p.sub }}>{pr}/{t.steps.length} steps · ~{t.steps.reduce((a,s)=>a+parseInt(s.time),0)} min</span>
              <span style={{ fontSize: 10, color: p.sub, fontStyle: "italic" }}>Source: {t.protocol} official docs</span>
            </div>
          </div>;
        })}

        {/* Feed */}
        {validTab === "feed" && FEED.map(f => (
          <div key={f.id} style={{ ...cardS, padding: 16, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <Pill text={f.niche} color={f.color} /><span style={{ marginLeft: "auto", fontSize: 11, color: p.sub }}>{f.time} ago</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>{f.headline}</div>
            <div style={{ fontSize: 12, color: p.sub, marginBottom: 8 }}>{f.summary}</div>
            <div style={{ padding: "8px 12px", background: `${f.color}08`, borderRadius: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: f.color }}>💡 {f.angle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>, true);
  }

  return null;
}
