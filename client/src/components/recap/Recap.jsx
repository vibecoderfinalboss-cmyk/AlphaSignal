import { palette, fonts, cardStyle } from "../../theme";
import { FARM_TASKS } from "../../constants";
import { useApp } from "../../context/AppContext";
import { getLevel } from "../../utils";
import BottomNav from "../layout/BottomNav";
import ProgressBar from "../ui/ProgressBar";

export default function Recap() {
  const { state, hasContent, hasFarm } = useApp();
  const { streak, xp, completedMissions, farmProgress } = state;

  const contentCount = completedMissions.filter((id) =>
    id.startsWith("c")
  ).length;
  const farmStepCount = Object.values(farmProgress).reduce(
    (acc, steps) => acc + (steps?.length || 0),
    0
  );
  const getFarmProgress = (taskId) => farmProgress[taskId]?.length || 0;

  const stats = [
    { label: "Streak", value: `${streak}d`, color: palette.orange, icon: "\u{1F525}" },
    { label: "XP Earned", value: `+${xp}`, color: palette.purple, icon: "\u2B50" },
    { label: "Content", value: `${contentCount}`, color: palette.orange, icon: "\u270D\uFE0F" },
    { label: "Farm Steps", value: `${farmStepCount}`, color: palette.cyan, icon: "\u{1FA82}" },
  ];

  const getCoachSuggestion = () => {
    if (hasFarm && hasContent) {
      return "You're running dual mode \u2014 aim for 3 Dual Mode Days this week for max XP.";
    }
    if (hasContent) {
      return "Try thread-style breakdowns this week. Your audience loves data takes.";
    }
    return "LayerZero S2 deadline is closing. Prioritize it.";
  };

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
        <h1
          style={{
            fontSize: 24,
            fontWeight: 900,
            margin: "0 0 20px",
            fontFamily: fonts.display,
          }}
        >
          Your Week {"\u{1F4CA}"}
        </h1>

        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {stats.map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span
                  style={{
                    fontSize: 11,
                    color: palette.sub,
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Protocol progress */}
        {hasFarm && (
          <div style={{ ...cardStyle, padding: 18, marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: palette.cyan,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              {"\u{1FA82}"} Protocol Progress
            </div>
            {FARM_TASKS.map((t) => {
              const prog = getFarmProgress(t.id);
              return (
                <div
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, minWidth: 90 }}
                  >
                    {t.protocol}
                  </span>
                  <div style={{ flex: 1 }}>
                    <ProgressBar
                      value={prog}
                      max={t.steps.length}
                      color={
                        prog >= t.steps.length ? palette.green : palette.blue
                      }
                      height={5}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: palette.sub,
                      fontWeight: 600,
                    }}
                  >
                    {prog}/{t.steps.length}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Coach suggestion */}
        <div
          style={{
            ...cardStyle,
            padding: 18,
            background: `${palette.blue}06`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>{"\u{1F9E0}"}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: palette.blue,
              }}
            >
              COACH SUGGESTION
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: palette.sub,
              lineHeight: 1.6,
            }}
          >
            {getCoachSuggestion()}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
