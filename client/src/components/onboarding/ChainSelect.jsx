import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { CHAINS } from "../../constants";
import { useApp } from "../../context/AppContext";
import Button from "../ui/Button";

export default function ChainSelect() {
  const navigate = useNavigate();
  const { state, dispatch, hasContent } = useApp();
  const { chains } = state;

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px" }}>
      <p
        style={{
          color: palette.cyan,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 2,
          margin: "0 0 4px",
        }}
      >
        FARMING SETUP
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "0 0 6px",
          fontFamily: fonts.display,
        }}
      >
        Pick chains to farm
      </h2>
      <p style={{ color: palette.sub, fontSize: 13, margin: "0 0 24px" }}>
        Select as many as you want.
      </p>

      <div
        role="group"
        aria-label="Select chains"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {CHAINS.map((c) => {
          const selected = chains.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() =>
                dispatch({ type: "TOGGLE_CHAIN", payload: c.id })
              }
              aria-pressed={selected}
              style={{
                ...cardStyle,
                padding: "16px 8px",
                cursor: "pointer",
                textAlign: "center",
                border: selected
                  ? `2px solid ${c.color}`
                  : "2px solid transparent",
                background: selected ? `${c.color}10` : palette.card,
              }}
            >
              <div style={{ fontSize: 28 }}>{c.emoji}</div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: selected ? c.color : palette.text,
                  marginTop: 4,
                }}
              >
                {c.label}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          ghost
          onClick={() =>
            navigate(hasContent ? "/onboarding/tone" : "/onboarding/mode")
          }
        >
          {"\u2190"} Back
        </Button>
        <Button
          disabled={!chains.length}
          onClick={() => navigate("/onboarding/disclaimer")}
        >
          Continue {"\u2192"}
        </Button>
      </div>
    </div>
  );
}
