import { palette, fonts } from "../../theme";

export default function Button({
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  ghost = false,
  color = palette.blue,
  type = "button",
  ariaLabel,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        padding: "14px 28px",
        borderRadius: 14,
        border: ghost ? `2px solid ${palette.muted}` : "none",
        background: ghost
          ? "transparent"
          : disabled
            ? "#E5E7EB"
            : color,
        color: ghost ? palette.text : disabled ? "#9CA3AF" : "#FFF",
        fontWeight: 700,
        fontSize: 15,
        fontFamily: fonts.body,
        cursor: disabled ? "default" : "pointer",
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "all .15s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
