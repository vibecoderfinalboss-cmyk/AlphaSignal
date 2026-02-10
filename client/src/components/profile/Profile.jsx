import { palette, fonts, cardStyle } from "../../theme";
import { NICHES, TONES, CHAINS, LEVELS } from "../../constants";
import { useApp } from "../../context/AppContext";
import { getLevel, getNextLevel, getUserTimezone } from "../../utils";
import BottomNav from "../layout/BottomNav";
import ProgressBar from "../ui/ProgressBar";

export default function Profile() {
  const { state, hasContent, hasFarm } = useApp();
  const { handle, modes, niches, tone, chains, streak, xp } = state;

  const level = getLevel(xp);
  const nextLvl = getNextLevel(xp);
  const xpInLevel = nextLvl ? xp - level.min : 0;
  const xpForLevel = nextLvl ? nextLvl.min - level.min : 1;

  const settings = [
    {
      label: "Modes",
      value: modes
        .map((m) => (m === "content" ? "\u270D\uFE0F Content" : "\u{1FA82} Farm"))
        .join(" + "),
    },
    hasContent && {
      label: "Niches",
      value: niches
        .map((n) => NICHES.find((x) => x.id === n)?.emoji)
        .join(" "),
    },
    hasContent && {
      label: "Tone",
      value: TONES.find((t) => t.id === tone)?.label,
    },
    hasFarm && {
      label: "Chains",
      value: chains
        .map((c) => CHAINS.find((x) => x.id === c)?.emoji)
        .join(" "),
    },
    {
      label: "Timezone",
      value: state.timezone || getUserTimezone(),
    },
  ].filter(Boolean);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.bg,
        color: palette.text,
        fontFamily: fonts.body,
        fontSize: 14,
      }}
    >
      <div
        className="page-enter"
        style={{
          maxWidth: 440,
          margin: "0 auto",
          padding: "24px 20px 100px",
        }}
      >
        {/* Avatar + name */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            aria-hidden="true"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: `linear-gradient(135deg,${palette.orange},${palette.yellow})`,
              margin: "0 auto 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 900,
              color: "#FFF",
            }}
          >
            {(handle || "A")[0].toUpperCase()}
          </div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 900,
              fontFamily: fonts.display,
              margin: 0,
            }}
          >
            @{handle || "you"}
          </h1>
          <div
            style={{
              fontSize: 13,
              color: level.color,
              fontWeight: 700,
              marginTop: 3,
            }}
          >
            {level.icon} {level.name}
          </div>
        </div>

        {/* XP progress */}
        <div style={{ ...cardStyle, padding: 18, marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span
              style={{ fontSize: 12, color: level.color, fontWeight: 700 }}
            >
              {level.name}
            </span>
            {nextLvl && (
              <span style={{ fontSize: 11, color: palette.sub }}>
                {nextLvl.min - xp} XP {"\u2192"} {nextLvl.name}
              </span>
            )}
          </div>
          <ProgressBar
            value={xpInLevel}
            max={xpForLevel}
            color={level.color}
            height={8}
          />
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
            {xp} XP
          </div>
        </div>

        {/* Quick stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          {[
            { label: "Streak", value: streak, icon: "\u{1F525}" },
            {
              label: "Level",
              value: LEVELS.indexOf(level) + 1,
              icon: level.icon,
            },
            { label: "Modes", value: modes.length, icon: "\u26A1" },
          ].map((s, i) => (
            <div
              key={i}
              style={{ ...cardStyle, padding: 14, textAlign: "center" }}
            >
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{s.value}</div>
              <div
                style={{
                  fontSize: 10,
                  color: palette.sub,
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div style={{ ...cardStyle, padding: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: palette.sub,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            Settings
          </div>
          {settings.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: `1px solid ${palette.muted}`,
              }}
            >
              <span style={{ fontSize: 13, color: palette.sub }}>
                {s.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
