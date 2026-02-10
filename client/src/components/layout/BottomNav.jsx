import { useLocation, useNavigate } from "react-router-dom";
import { palette, cardStyle } from "../../theme";

const NAV_ITEMS = [
  { path: "/", icon: "\u{1F3E0}", label: "Home" },
  { path: "/recap", icon: "\u{1F4CA}", label: "Recap" },
  { path: "/profile", icon: "\u{1F464}", label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: palette.card,
        borderTop: `1px solid ${palette.muted}`,
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{ maxWidth: 440, margin: "0 auto", display: "flex" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={{
                flex: 1,
                padding: "10px 0 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: isActive ? palette.blue : palette.sub,
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <div
                  style={{
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    background: palette.blue,
                    marginTop: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
