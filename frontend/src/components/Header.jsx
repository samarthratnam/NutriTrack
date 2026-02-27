import { useEffect, useState } from "react";
import { C } from "../constants/theme";

/**
 * Header component.
 *
 * What it renders:
 * - A fixed navigation bar with logo, links, and CTA.
 * - A responsive mobile hamburger menu under 640px.
 *
 * Props:
 * - None.
 *
 * API calls:
 * - None. This component is purely presentational + scroll state logic.
 *
 * Key design decisions:
 * - Uses scroll position to switch between transparent and blurred header so hero visuals remain visible at top.
 * - Keeps nav links centered for desktop clarity.
 * - Uses a lightweight dropdown pattern for mobile to avoid routing dependency.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll listener to apply blur and border once the user leaves the top area.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Ingredients", href: "#calculator" },
    { label: "Compliance", href: "#calculator" },
    { label: "About", href: "#footer" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,251,240,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1.5px solid ${C.border}` : "none",
        transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        padding: "0 clamp(1rem,4vw,3rem)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          height: 68,
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Brand block keeps icon + name grouped on the left side. */}
        <a
          href="#top"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${C.orange}, ${C.peach})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              boxShadow: `0 4px 16px ${C.orange}44`,
            }}
          >
            🥗
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20,
              fontWeight: 800,
              color: C.ink,
            }}
          >
            NutriLabel<span style={{ color: C.orange }}>AI</span>
          </span>
        </a>

        {/* Desktop links remain centered to stabilize header balance. */}
        <nav
          className="desktop-nav"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 30,
            alignItems: "center",
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: C.inkMid,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif",
                transition: "color .2s",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = C.orange;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = C.inkMid;
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA is kept on the right for strong conversion focus. */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            className="desktop-nav"
            href="#calculator"
            style={{
              background: `linear-gradient(135deg, ${C.orange}, #e8451a)`,
              color: "#ffffff",
              padding: "9px 22px",
              borderRadius: 50,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: `0 4px 14px ${C.orange}55`,
              transition: "opacity .2s, transform .2s",
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.opacity = "0.9";
              event.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = "1";
              event.currentTarget.style.transform = "none";
            }}
          >
            Try Free →
          </a>

          {/* Mobile menu trigger is visible only below 640px via global media rule. */}
          <button
            type="button"
            className="hamburger"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen((value) => !value)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: C.ink,
              fontSize: 26,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile dropdown sits under header and animates with max-height + opacity. */}
      <div
        style={{
          maxHeight: menuOpen ? 260 : 0,
          opacity: menuOpen ? 1 : 0,
          overflow: "hidden",
          transition: "max-height .25s ease, opacity .2s ease",
          background: C.creamLight,
          borderTop: menuOpen ? `1.5px solid ${C.border}` : "none",
          padding: menuOpen ? "0.6rem 1.2rem 1rem" : "0 1.2rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {navLinks.map((link) => (
            <a
              key={`mobile-${link.label}`}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: C.inkMid,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#calculator"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: 4,
              background: `linear-gradient(135deg, ${C.orange}, #e8451a)`,
              color: "#ffffff",
              borderRadius: 999,
              textDecoration: "none",
              textAlign: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              padding: "9px 14px",
            }}
          >
            Try Free →
          </a>
        </nav>
      </div>
    </header>
  );
}
