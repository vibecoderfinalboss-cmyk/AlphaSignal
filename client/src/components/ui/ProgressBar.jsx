import { palette } from "../../theme";

export default function ProgressBar({
  value,
  max,
  color = palette.blue,
  height = 6,
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{
        width: "100%",
        height,
        borderRadius: height,
        background: palette.muted,
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: height,
          background: color,
          transition: "width .6s cubic-bezier(.34,1.56,.64,1)",
        }}
      />
    </div>
  );
}
