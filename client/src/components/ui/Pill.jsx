import { fonts } from "../../theme";

export default function Pill({ text, color, filled = false }) {
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: fonts.body,
        background: filled ? color : `${color}15`,
        color: filled ? "#FFF" : color,
        display: "inline-block",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}
