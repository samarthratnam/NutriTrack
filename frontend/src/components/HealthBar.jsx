import { C, clamp } from "../constants/theme";

/**
 * HealthBar component.
 *
 * What it renders:
 * - One nutrient progress row with label, current value, %DV, and guidance text.
 *
 * Props:
 * - bar: health bar object from backend (key, label, value, unit, status, percent_of_reference, guidance).
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Clamps width for defensive rendering even if backend sends values outside 0–100.
 * - Uses color-coded status to provide immediate risk interpretation.
 */
export default function HealthBar({ bar }) {
  // Map status to required semantic colors.
  const color =
    bar?.status === "high"
      ? C.orange
      : bar?.status === "moderate" || bar?.status === "watch"
      ? C.peach
      : C.sageDark;

  const percent = clamp(Number(bar?.percent_of_reference || 0), 0, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Label/value row keeps a compact summary above the animated progress track. */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
        <span
          style={{
            color: C.inkMid,
            fontSize: 13.5,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
          }}
        >
          {bar?.label}
        </span>
        <span
          style={{
            color,
            fontSize: 13.5,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            textAlign: "right",
          }}
        >
          {bar?.value}
          {bar?.unit}
          <span
            style={{
              color: C.inkLight,
              fontWeight: 400,
              marginLeft: 4,
              fontFamily: "'Cascadia Mono', monospace",
            }}
          >
            ({Number(bar?.percent_of_reference || 0).toFixed(2)}% DV)
          </span>
        </span>
      </div>

      {/* Track stays fixed height while fill animates to reinforce change over time. */}
      <div
        style={{
          height: 9,
          borderRadius: 8,
          background: C.peachFaint,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: color,
            borderRadius: 8,
            transition: "width 1.1s cubic-bezier(.4,0,.2,1)",
            boxShadow: `0 0 8px ${color}55`,
          }}
        />
      </div>

      {/* Guidance explains why the bar status matters and what to do next. */}
      {bar?.guidance ? (
        <p
          style={{
            color: C.inkLight,
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          {bar.guidance}
        </p>
      ) : null}
    </div>
  );
}
