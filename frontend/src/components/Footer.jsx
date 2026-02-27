import { C } from "../constants/theme";

/**
 * Footer component.
 *
 * What it renders:
 * - A dark 4-column footer with logo/tagline and grouped navigation links.
 * - A bottom legal strip with copyright and compliance disclaimer.
 *
 * Props:
 * - None.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Uses auto-fit grid so columns naturally wrap on small screens.
 * - Keeps disclaimer always visible for regulatory-context product clarity.
 */
export default function Footer() {
  const footerColumns = [
    {
      title: "Product",
      links: ["Calculator", "PDF Labels", "FSSAI Checker", "Ingredients DB"],
    },
    {
      title: "Legal",
      links: ["Privacy Policy", "Terms of Use", "Disclaimer", "Cookie Policy"],
    },
    {
      title: "Resources",
      links: ["FSSAI Rulebook", "Blog", "API Docs", "Contact Us"],
    },
  ];

  return (
    <footer
      id="footer"
      style={{
        background: C.ink,
        padding: "3rem clamp(1rem,4vw,3rem) 2rem",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Main top grid keeps brand + three link columns in one responsive row. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.peach})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                🥗
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 800,
                  color: C.cream,
                }}
              >
                NutriLabel<span style={{ color: C.orange }}>AI</span>
              </span>
            </div>
            <p
              style={{
                color: C.peach,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13.5,
                lineHeight: 1.75,
                maxWidth: 260,
                margin: 0,
              }}
            >
              Automated FSSAI-aware nutrition label generation for Indian food businesses.
            </p>
          </div>

          {/* Each footer column uses consistent heading + link typography for scanability. */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4
                style={{
                  color: C.sage,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  margin: "0 0 16px",
                }}
              >
                {column.title}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {column.links.map((linkLabel) => (
                  <li key={linkLabel}>
                    <a
                      href="#"
                      style={{
                        color: "#9C7050",
                        textDecoration: "none",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 14,
                        transition: "color .2s",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.color = C.peach;
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.color = "#9C7050";
                      }}
                    >
                      {linkLabel}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar separates legal metadata from navigational content. */}
        <div
          style={{
            borderTop: "1px solid #4a2810",
            paddingTop: 20,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <p
            style={{
              color: "#6B4020",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              margin: 0,
            }}
          >
            © 2026 NutriLabelAI. Built for India&apos;s food entrepreneurs.
          </p>
          <p
            style={{
              color: "#5A3010",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              margin: 0,
            }}
          >
            Educational tool only — not a legal certification.
          </p>
        </div>
      </div>
    </footer>
  );
}
