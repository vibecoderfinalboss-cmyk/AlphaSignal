import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { useApp } from "../../context/AppContext";
import Button from "../ui/Button";

const DISCLAIMER_POINTS = [
  "All tasks are informational \u2014 not financial advice",
  "Eligibility determined by protocols, not us",
  "Estimated values based on comparable airdrops",
  "Past distributions \u2260 future results",
  "You're responsible for your on-chain actions",
];

export default function Disclaimer() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  return (
    <div style={{ maxWidth: 440, margin: "0 auto", padding: "48px 20px" }}>
      <div
        style={{
          ...cardStyle,
          padding: 24,
          border: `2px solid ${palette.yellow}44`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: `${palette.yellow}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            {"\u26A0\uFE0F"}
          </div>
          <span
            style={{ fontSize: 18, fontWeight: 900, fontFamily: fonts.display }}
          >
            Important Disclosure
          </span>
        </div>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: palette.sub,
            margin: "0 0 16px",
          }}
        >
          Alpha Signal compiles publicly available airdrop information. We{" "}
          <strong style={{ color: palette.red }}>do not guarantee</strong>{" "}
          eligibility, token value, or distribution.
        </p>

        <div
          style={{
            background: palette.bg,
            borderRadius: 14,
            padding: 16,
            marginBottom: 16,
          }}
        >
          {DISCLAIMER_POINTS.map((point, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: i < DISCLAIMER_POINTS.length - 1 ? 8 : 0,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: palette.yellow,
                  marginTop: 7,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: palette.text }}>
                {point}
              </span>
            </div>
          ))}
        </div>

        <label
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            checked={state.disclaimAccepted}
            onChange={() => dispatch({ type: "ACCEPT_DISCLAIMER" })}
            style={{ display: "none" }}
          />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 8,
              border: `2px solid ${state.disclaimAccepted ? palette.green : "#D1D5DB"}`,
              background: state.disclaimAccepted
                ? `${palette.green}15`
                : "#FFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: palette.green,
              transition: "all .15s",
              flexShrink: 0,
            }}
          >
            {state.disclaimAccepted ? "\u2713" : ""}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            I understand and accept
          </span>
        </label>

        <Button
          disabled={!state.disclaimAccepted}
          fullWidth
          onClick={() => navigate("/onboarding/setup")}
          color={palette.blue}
        >
          Continue {"\u2192"}
        </Button>
      </div>
    </div>
  );
}
