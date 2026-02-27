import { C } from "../constants/theme";

/**
 * RuleBadge component.
 *
 * What it renders:
 * - One card for a single FSSAI rule check with status icon and explanatory text.
 *
 * Props:
 * - rule: { rule_id, title, description, observation, status } object.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Status-specific visual mapping improves scan speed for long rule lists.
 * - Subtle horizontal hover motion reinforces card interactivity without distraction.
 */
export default function RuleBadge({ rule }) {
  const config = {
    pass: {
      bg: C.sageFaint,
      border: C.sage,
      color: C.sageDark,
      icon: "✓",
    },
    warn: {
      bg: C.peachFaint,
      border: C.peach,
      color: C.inkMid,
      icon: "⚠",
    },
    fail: {
      bg: "#FF4D1A0D",
      border: "#FF4D1A44",
      color: C.orange,
      icon: "✗",
    },
  }[rule?.status] || {
    bg: C.cream,
    border: C.border,
    color: C.inkMid,
    icon: "•",
  };

  return (
    <div
      style={{
        background: config.bg,
        border: `1.5px solid ${config.border}`,
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 10,
        transition: "transform .2s",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "none";
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: config.color, fontWeight: 800, fontSize: 16, marginTop: 1 }}>
          {config.icon}
        </span>

        {/* Text block clearly separates title, description, and observed runtime value. */}
        <div>
          <div
            style={{
              color: C.ink,
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {rule?.rule_id} — {rule?.title}
          </div>
          <div
            style={{
              color: C.inkLight,
              fontSize: 12.5,
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 2,
            }}
          >
            {rule?.description}
          </div>
          <div
            style={{
              color: config.color,
              fontSize: 12,
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 3,
              fontWeight: 600,
            }}
          >
            {rule?.observation}
          </div>
        </div>
      </div>
    </div>
  );
}
