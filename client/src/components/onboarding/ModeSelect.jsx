import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { useApp } from "../../context/AppContext";
import Button from "../ui/Button";

const MODE_OPTIONS = [
  {
    id: "content",
    icon: "\u270D\uFE0F",
    title: "Build my CT presence",
    desc: "Daily tweet missions, AI-generated, algorithm-optimized.",
    color: palette.orange,
  },
  {
    id: "farm",
    icon: "\u{1FA82}",
    title: "Farm airdrops",
    desc: "Step-by-step tasks with deadline tracking.",
    color: palette.cyan,
  },
];

export default function ModeSelect() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { modes } = state;

  const handleContinue = () => {
    if (modes.includes("content")) {
      navigate("/onboarding/niches");
    } else {
      navigate("/onboarding/chains");
    }
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px" }}>
      <p
        style={{
          color: palette.blue,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          margin: "0 0 4px",
        }}
      >
        STEP 1
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "0 0 6px",
          fontFamily: fonts.display,
        }}
      >
        What do you want to do?
      </h2>
      <p style={{ color: palette.sub, fontSize: 13, margin: "0 0 24px" }}>
        Pick one or both.
      </p>

      {MODE_OPTIONS.map((m) => {
        const selected = modes.includes(m.id);
        return (
          <button
            key={m.id}
            onClick={() => dispatch({ type: "TOGGLE_MODE", payload: m.id })}
            aria-pressed={selected}
            style={{
              ...cardStyle,
              width: "100%",
              padding: 20,
              marginBottom: 10,
              cursor: "pointer",
              border: selected
                ? `2px solid ${m.color}`
                : "2px solid transparent",
              background: selected
                ? `linear-gradient(135deg,${m.color}08,${palette.card})`
                : palette.card,
              transition: "all .15s",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `${m.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {m.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: palette.sub, marginTop: 2 }}>
                  {m.desc}
                </div>
              </div>
              {selected && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: m.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFF",
                    fontSize: 14,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {"\u2713"}
                </div>
              )}
            </div>
          </button>
        );
      })}

      {modes.length === 2 && (
        <div
          style={{
            padding: "10px 16px",
            background: `${palette.purple}10`,
            borderRadius: 14,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, color: palette.purple, fontWeight: 600 }}>
            {"\u{1F525}"} Dual Mode! Both count toward your streak. Both in one
            day = 1.5x XP.
          </span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <Button ghost onClick={() => navigate("/")}>
          {"\u2190"} Back
        </Button>
        <Button disabled={!modes.length} onClick={handleContinue}>
          Continue {"\u2192"}
        </Button>
      </div>
    </div>
  );
}
