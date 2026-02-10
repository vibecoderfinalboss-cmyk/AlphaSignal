import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import Button from "../ui/Button";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "80px 20px 40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 8 }}>{"\u26A1"}</div>
      <h1
        style={{
          fontSize: 34,
          fontWeight: 900,
          margin: "0 0 4px",
          fontFamily: fonts.display,
          color: palette.text,
        }}
      >
        Alpha Signal
      </h1>
      <p
        style={{
          color: palette.sub,
          fontSize: 13,
          margin: "0 0 36px",
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        Your Crypto Copilot
      </p>

      <div style={{ ...cardStyle, padding: 24, textAlign: "left", marginBottom: 28 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${palette.orange}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {"\u270D\uFE0F"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Content Creator Mode
            </div>
            <div style={{ fontSize: 12, color: palette.sub }}>
              3 AI tweet missions daily
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${palette.cyan}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {"\u{1FA82}"}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Airdrop Farmer Mode
            </div>
            <div style={{ fontSize: 12, color: palette.sub }}>
              Step-by-step protocol tasks
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => navigate("/onboarding/mode")}
        fullWidth
        color={palette.blue}
      >
        Get Started
      </Button>
      <p style={{ color: palette.sub, fontSize: 12, marginTop: 20 }}>
        Free forever. No credit card.
      </p>
    </div>
  );
}
