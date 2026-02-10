import { useState, useEffect, useCallback } from "react";
import { palette, fonts } from "../../theme";

export default function ScreenWrapper({
  children,
  xpPop = 0,
  celebration = null,
}) {
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
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <main id="main-content" className="page-enter">
        {children}
      </main>

      {xpPop > 0 && (
        <div
          aria-live="polite"
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 200,
            animation: "xpFloat 1.6s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: palette.orange,
              fontFamily: fonts.display,
              textShadow: "0 4px 20px rgba(255,140,66,0.3)",
            }}
          >
            +{xpPop} XP
          </div>
        </div>
      )}

      {celebration && (
        <div
          role="alert"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(255,255,255,0.95)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "celebFade 3s ease-out forwards",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 72 }}>{"\u{1F525}"}</div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 900,
                color: palette.orange,
                fontFamily: fonts.display,
              }}
            >
              {celebration.streak}-Day Streak!
            </div>
            <div
              style={{ fontSize: 14, color: palette.sub, marginTop: 6 }}
            >
              Keep showing up. You're building something.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
