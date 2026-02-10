import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { palette, fonts } from "../../theme";
import { useApp } from "../../context/AppContext";

const LOADING_DURATION = 2200;

export default function Loading() {
  const navigate = useNavigate();
  const { hasContent, hasFarm } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/", { replace: true }), LOADING_DURATION);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        maxWidth: 440,
        margin: "0 auto",
        padding: "140px 20px 0",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 64,
          marginBottom: 12,
          animation: "pulse 1.5s ease-in-out infinite",
        }}
        role="status"
        aria-label="Loading your missions"
      >
        {"\u26A1"}
      </div>
      <h2
        style={{
          fontSize: 24,
          fontWeight: 900,
          fontFamily: fonts.display,
          color: palette.text,
        }}
      >
        Building your missions...
      </h2>
      <p style={{ color: palette.sub, fontSize: 13 }}>
        {hasContent ? "Curating alpha" : ""}
        {hasContent && hasFarm ? " \u00B7 " : ""}
        {hasFarm ? "Scanning protocols" : ""}
      </p>
    </div>
  );
}
