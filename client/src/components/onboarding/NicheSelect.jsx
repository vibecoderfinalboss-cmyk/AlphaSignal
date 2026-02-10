import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { NICHES } from "../../constants";
import { useApp } from "../../context/AppContext";
import Button from "../ui/Button";

export default function NicheSelect() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { niches } = state;

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
        STEP 2
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "0 0 6px",
          fontFamily: fonts.display,
        }}
      >
        Pick your niches
      </h2>
      <p style={{ color: palette.sub, fontSize: 13, margin: "0 0 24px" }}>
        Choose 2-3 for your missions.
      </p>

      <div
        role="group"
        aria-label="Select niches"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {NICHES.map((n) => {
          const selected = niches.includes(n.id);
          return (
            <button
              key={n.id}
              onClick={() => dispatch({ type: "TOGGLE_NICHE", payload: n.id })}
              aria-pressed={selected}
              style={{
                ...cardStyle,
                padding: "16px 8px",
                cursor: "pointer",
                textAlign: "center",
                border: selected
                  ? `2px solid ${n.color}`
                  : "2px solid transparent",
                background: selected ? `${n.color}10` : palette.card,
              }}
            >
              <div style={{ fontSize: 28 }}>{n.emoji}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: selected ? n.color : palette.text,
                  marginTop: 4,
                }}
              >
                {n.label}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button ghost onClick={() => navigate("/onboarding/mode")}>
          {"\u2190"} Back
        </Button>
        <Button
          disabled={niches.length < 2}
          onClick={() => navigate("/onboarding/tone")}
        >
          Continue {"\u2192"}
        </Button>
      </div>
    </div>
  );
}
