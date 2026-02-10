import { Router } from "express";

const router = Router();

const palette = {
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

const CONTENT_MISSIONS = [
  {
    id: "c1", type: "Hot Take", niche: "DeFi", xp: 20, difficulty: "medium", time: "9 AM", color: palette.orange, emoji: "\u{1F525}",
    tweet: "Unpopular opinion: most \"DeFi protocols\" shipping in 2026 are just TradFi with extra steps.\n\nThe ones that survive will be the ones banks literally cannot replicate \u2014 permissionless composability, not just \"on-chain settlement.\"\n\nName one protocol that passes this test. \u{1F447}",
    rationale: "Contrarian frames drive replies. Question hook invites engagement.",
    source: { headline: "DeFi TVL hits $180B while institutional adoption stalls", publisher: "The Block", url: "https://theblock.co", time: "3h ago",
      summary: "Total value locked across DeFi has reached $180B ATH, driven by liquid staking and restaking. However, institutional adoption has flatlined. 73% of new protocols launched with KYC features. Permissionless protocols growing 2.4x faster.",
      dataPoints: ["$180B total DeFi TVL \u2014 new ATH", "Only $3.2B from institutions (1.8%)", "73% new protocols include KYC", "Permissionless growing 2.4x faster"],
      nuggets: ["73% of new DeFi protocols launched with KYC gates \u2014 at what point do we stop calling it DeFi?", "$180B TVL but only $3.2B from institutions. The \"institutional adoption\" narrative is dead."],
    },
    alts: [
      "Hot take: 90% of new protocols need KYC, have admin keys, and could be shut down with one email.\n\nThat's not DeFi. That's fintech cosplay.\n\nProve me wrong. \u{1F447}",
      "DeFi is at $180B TVL and institutions only account for 1.8%.\n\nThis isn't their playground. It's ours.\n\nThe protocols winning are the ones they CAN'T replicate.",
    ],
  },
  {
    id: "c2", type: "Alpha Drop", niche: "AI", xp: 25, difficulty: "medium", time: "1 PM", color: palette.purple, emoji: "\u{1F48E}",
    tweet: "Everyone is watching the AI agent meta.\n\nAlmost nobody is watching who controls the compute layer underneath.\n\nThree protocols are quietly building the AWS of decentralized AI.\n\nBookmark this. \u{1F9F5}\u{1F447}",
    rationale: "\"Bookmark this\" targets highest-weight algorithm signal.",
    source: { headline: "Decentralized compute demand surges 340% in Q1", publisher: "Messari", url: "https://messari.io", time: "5h ago",
      summary: "Demand for decentralized GPU compute surged 340% QoQ, outpacing supply growth of 89%. Three leaders: Render Network ($2.1B staked), Akash (14K+ providers), io.net (28K GPU hours/day). Decentralized inference now 62% cheaper than AWS.",
      dataPoints: ["Compute demand: +340% QoQ", "Supply: only +89%", "Render: $2.1B staked", "62% cheaper than AWS"],
      nuggets: ["340% demand vs 89% supply. GPU shortage is real \u2014 bullish for infra tokens.", "Decentralized AI inference is 62% cheaper than AWS. Literally cheaper AND permissionless."],
    },
    alts: [
      "AI agents are the hype. Compute is the trade.\n\nThe protocols solving decentralized inference are the picks-and-shovels play of 2026.\n\nBookmark this. \u{1F9F5}",
      "GPU compute demand up 340%. Supply only up 89%.\n\nThat gap is where alpha lives.\n\nThree protocols are racing to fill it. Here's what you need to know \u{1F447}",
    ],
  },
  {
    id: "c3", type: "Quick Signal", niche: "Airdrops", xp: 15, difficulty: "easy", time: "8 PM", color: palette.green, emoji: "\u26A1",
    tweet: "If you're not testing @[redacted] on testnet right now, you'll be complaining about \"unfair criteria\" in 6 months.\n\n5 minutes today > 5 hours of cope later.",
    rationale: "Urgency + specific action. Classic CT engagement.",
    source: { headline: "New L2 opens testnet with $40M airdrop allocation", publisher: "Decrypt", url: "https://decrypt.co", time: "7h ago",
      summary: "ZK-rollup L2 backed by $120M (a16z + Paradigm) opened public testnet. 8% of supply for participants. 5 txns across 3 types = eligible. Zero capital. 90-day testnet.",
      dataPoints: ["$120M Series B", "8% supply for airdrop", "5 txns = eligible", "Zero capital required"],
      nuggets: ["8% token supply for testnet users. 5 transactions. Most obvious airdrop of 2026.", "Zero capital risk, 5 min effort, $120M backing. Risk/reward is absurd."],
    },
    alts: [
      "Testnet just opened for a new L2 with heavy VC backing.\n\nBridge, swap, mint. 5 minutes. Risk: zero.\n\nGo.",
      "New L2 testnet live. $120M raised. 8% to testers.\n\n5 txns. Zero cost. 5 minutes.\n\nYou literally have no excuse not to do this.",
    ],
  },
];

const FARM_TASKS = [
  {
    id: "f1", protocol: "MegaETH", chain: "MegaETH", xp: 35, deadline: "12 days", urgency: "active", color: palette.yellow, emoji: "\u26A1",
    disclaimer: "Tasks based on MegaETH's official testnet announcement. Eligibility determined by MegaETH, not Alpha Signal.",
    sourceUrl: "https://docs.megaeth.com/testnet",
    steps: [
      { text: "Claim testnet ETH from faucet", link: "https://faucet.megaeth.com", time: "1 min", tip: "Use the same wallet you'll farm with." },
      { text: "Bridge 0.05 ETH to MegaETH", link: "https://bridge.megaeth.com", time: "2 min", tip: "Use 'Fast Bridge' \u2014 30 sec vs 15 min." },
      { text: "Swap ETH \u2192 USDC on MegaDEX", link: "https://dex.megaeth.com", time: "1 min", tip: "Swap at least 0.02 ETH. Volume matters." },
      { text: "Add liquidity to ETH/USDC", link: "https://dex.megaeth.com/pools", time: "2 min", tip: "Use 'Full Range' \u2014 farming eligibility, not yield." },
      { text: "Mint a free NFT", link: "https://mint.megaeth.com", time: "1 min", tip: "Any free mint counts." },
    ],
  },
  {
    id: "f2", protocol: "Monad", chain: "Monad", xp: 30, deadline: "3 days", urgency: "urgent", color: palette.purple, emoji: "\u{1F7E3}",
    disclaimer: "Tasks based on Monad's official testnet program. Past airdrops don't guarantee future results.",
    sourceUrl: "https://docs.monad.xyz/testnet",
    steps: [
      { text: "Get testnet MON from faucet", link: "https://faucet.monad.xyz", time: "1 min", tip: "Discord verification required first." },
      { text: "Bridge assets via Monad Bridge", link: "https://bridge.monad.xyz", time: "2 min", tip: "Bridge interaction itself is what matters." },
      { text: "Execute 3 swaps on MonadSwap", link: "https://swap.monad.xyz", time: "3 min", tip: "3 separate swaps, variety of pairs." },
      { text: "Provide liquidity in any pool", link: "https://swap.monad.xyz/pools", time: "2 min", tip: "Even $1 counts. Leave for 24h." },
    ],
  },
  {
    id: "f3", protocol: "LayerZero S2", chain: "Multi-chain", xp: 40, deadline: "18 hours", urgency: "critical", color: palette.red, emoji: "\u{1F534}",
    disclaimer: "LayerZero S2 criteria based on official announcement. Subject to change.",
    sourceUrl: "https://layerzero.network/season2",
    steps: [
      { text: "Bridge USDC Ethereum \u2192 Arbitrum via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Use Stargate specifically \u2014 built on LayerZero." },
      { text: "Bridge ETH Arbitrum \u2192 Base via Stargate", link: "https://stargate.finance", time: "3 min", tip: "Different chains than Step 1. Variety matters." },
      { text: "Use an OFT token cross-chain", link: "https://layerzero.network/ecosystem", time: "5 min", tip: "Transfer any OFT-enabled token between chains." },
    ],
  },
];

const FEED = [
  { id: 1, niche: "DeFi", headline: "Aave v4 launches unified liquidity across 8 chains", summary: "TVL +$2.1B in 48h.", time: "2h", angle: "Why unified liquidity changes composability", color: palette.orange },
  { id: 2, niche: "AI", headline: "Bittensor subnet 32 matches GPT-4 on coding", summary: "60% cheaper than centralized.", time: "1h", angle: "Decentralized AI stopped being a meme", color: palette.purple },
  { id: 3, niche: "L1/L2", headline: "Base surpasses Arbitrum in daily txns", summary: "4.2M txns/day.", time: "3h", angle: "Distribution beats tech", color: palette.cyan },
  { id: 4, niche: "BTC", headline: "Bitcoin L2 TVL crosses $4B", summary: "Up 800% in 6 months.", time: "5h", angle: "Bitcoin DeFi is real", color: palette.yellow },
];

router.get("/missions", (_req, res) => {
  res.json(CONTENT_MISSIONS);
});

router.get("/farm-tasks", (_req, res) => {
  res.json(FARM_TASKS);
});

router.get("/feed", (_req, res) => {
  res.json(FEED);
});

export default router;
