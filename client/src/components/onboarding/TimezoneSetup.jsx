import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { useApp } from "../../context/AppContext";
import { getUserTimezone, getTimezoneOffset } from "../../utils";
import Button from "../ui/Button";

export default function TimezoneSetup() {
  const navigate = useNavigate();
  const { state, dispatch, hasFarm, hasContent } = useApp();

  useEffect(() => {
    if (!state.timezone) {
      dispatch({ type: "SET_TIMEZONE", payload: getUserTimezone() });
    }
  }, [state.timezone, dispatch]);

  const handleLaunch = () => {
    dispatch({ type: "COMPLETE_ONBOARDING" });
    navigate("/loading");
  };

  const handleBack = () => {
    if (hasFarm) {
      navigate("/onboarding/disclaimer");
    } else if (hasContent) {
      navigate("/onboarding/tone");
    } else {
      navigate("/onboarding/mode");
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
        FINAL STEP
      </p>
      <h2
        style={{
          fontSize: 26,
          fontWeight: 900,
          margin: "0 0 24px",
          fontFamily: fonts.display,
        }}
      >
        Almost there!
      </h2>

      <div style={{ ...cardStyle, padding: 18, marginBottom: 12 }}>
        <label
          htmlFor="handle-input"
          style={{
            display: "block",
            fontSize: 11,
            color: palette.sub,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          X Handle (optional)
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: palette.bg,
            borderRadius: 12,
            padding: "10px 14px",
          }}
        >
          <span style={{ color: palette.sub, fontWeight: 600 }}>@</span>
          <input
            id="handle-input"
            value={state.handle}
            onChange={(e) =>
              dispatch({ type: "SET_HANDLE", payload: e.target.value })
            }
            placeholder="yourhandle"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: palette.text,
              fontSize: 15,
              fontFamily: fonts.body,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ ...cardStyle, padding: 18, marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            color: palette.sub,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          Timezone
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          {"\u{1F30D}"} {state.timezone || getUserTimezone()} ({getTimezoneOffset()})
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button ghost onClick={handleBack}>
          {"\u2190"} Back
        </Button>
        <Button onClick={handleLaunch} color={palette.green}>
          Launch {"\u{1F680}"}
        </Button>
      </div>
    </div>
  );
}
