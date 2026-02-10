import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { TONES } from "../../constants";
import { useApp } from "../../context/AppContext";
import Button from "../ui/Button";

export default function ToneSelect() {
  const navigate = useNavigate();
  const { state, dispatch, hasFarm } = useApp();
  const { tone } = state;

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
        STEP 3
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "0 0 24px",
          fontFamily: fonts.display,
        }}
      >
        What's your voice?
      </h2>

      <div role="radiogroup" aria-label="Select your tone">
        {TONES.map((t) => {
          const selected = tone === t.id;
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={selected}
              onClick={() => dispatch({ type: "SET_TONE", payload: t.id })}
              style={{
                ...cardStyle,
                width: "100%",
                padding: 18,
                marginBottom: 10,
                cursor: "pointer",
                border: selected
                  ? `2px solid ${t.color}`
                  : "2px solid transparent",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: `${t.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {t.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: selected ? t.color : palette.text,
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: palette.sub,
                      fontStyle: "italic",
                      marginTop: 2,
                    }}
                  >
                    "{t.example}"
                  </div>
                </div>
                {selected && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: t.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFF",
                      fontSize: 12,
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
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14,
        }}
      >
        <Button ghost onClick={() => navigate("/onboarding/niches")}>
          {"\u2190"} Back
        </Button>
        <Button
          disabled={!tone}
          onClick={() =>
            navigate(hasFarm ? "/onboarding/chains" : "/onboarding/setup")
          }
        >
          Continue {"\u2192"}
        </Button>
      </div>
    </div>
  );
}
