import { C } from "../constants/theme";

/**
 * HowItWorks component.
 *
 * What it renders:
 * - A 4-step explainer section showing the full product workflow.
 *
 * Props:
 * - None.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Uses concise cards to reduce cognitive load for first-time users.
 * - Keeps explanatory copy close to icons and sequence numbers for quick onboarding.
 */
export default function HowItWorks() {
  const steps = [
    {
      icon: "📝",
      title: "Enter Your Recipe",
      description:
        "List ingredients and quantities in grams. Supports common Indian kitchen ingredients.",
    },
    {
      icon: "🔬",
      title: "Instant Analysis",
      description:
        "Calculates per-100g and per-serving values benchmarked against FSSAI reference values.",
    },
    {
      icon: "✅",
      title: "FSSAI Compliance",
      description:
        "Get pass/warn/fail rule checks so risk signals are visible before label printing.",
    },
    {
      icon: "📄",
      title: "Download PDF Label",
      description:
        "Export a print-ready nutrition label PDF with one click for your packaging workflow.",
    },
  ];

  return (
    <section
      id="how-it-works"
      style={{
        background: C.peachFaint,
        padding: "6rem clamp(1rem,4vw,3rem)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: C.ink,
              fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            How It Works
          </h2>
          <p
            style={{
              color: C.inkLight,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              margin: 0,
            }}
          >
            Four steps. Zero spreadsheets. Full FSSAI alignment support.
          </p>
        </div>

        {/* Auto-fit grid keeps cards responsive without custom media-query complexity. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 24,
          }}
        >
          {steps.map((step, index) => (
            <article
              key={step.title}
              style={{
                background: C.creamLight,
                border: `1.5px solid ${C.border}`,
                borderRadius: 18,
                padding: "28px 24px",
                position: "relative",
                transition: "transform .25s, box-shadow .25s",
                boxShadow: `0 4px 18px ${C.orange}08`,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-5px)";
                event.currentTarget.style.boxShadow = `0 16px 40px ${C.orange}18`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "none";
                event.currentTarget.style.boxShadow = `0 4px 18px ${C.orange}08`;
              }}
            >
              {/* Ghost sequence number helps ordering without adding visual noise. */}
              <div
                style={{
                  position: "absolute",
                  top: 18,
                  right: 20,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 40,
                  color: `${C.orange}14`,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <div style={{ fontSize: 34, marginBottom: 16 }}>{step.icon}</div>
              <h3
                style={{
                  color: C.ink,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: 16,
                  margin: "0 0 10px",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: C.inkLight,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
