import { useEffect, useMemo, useState } from "react";
import { C } from "../constants/theme";

/**
 * QuoteBanner component.
 *
 * What it renders:
 * - Full-screen hero with rotating nutrition quotes.
 * - Decorative blur blobs, floating food emojis, CTA buttons, stats strip.
 * - Bottom decorative gradient stripe and bounce arrow.
 *
 * Props:
 * - None.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Uses a timed quote carousel to keep hero content alive without heavy libraries.
 * - Preserves readability through centered composition and high-contrast text.
 * - Keeps animation subtle (opacity + float) to avoid visual fatigue.
 */
export default function QuoteBanner() {
  const quotes = useMemo(
    () => [
      {
        text: "Let food be thy medicine and medicine be thy food.",
        author: "Hippocrates",
      },
      {
        text: "You are what you eat, so don't be fast, cheap, easy, or fake.",
        author: "Unknown",
      },
      {
        text: "The food you eat can be either the safest form of medicine or the slowest form of poison.",
        author: "Ann Wigmore",
      },
      {
        text: "To eat is a necessity, but to eat intelligently is an art.",
        author: "François de La Rochefoucauld",
      },
    ],
    []
  );

  const floatingEmoji = ["🍊", "🥗", "🌿", "🍋", "🫑", "🥦", "🍃", "🌾", "🫐", "🥕"];
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  // Rotates quotes every 5 seconds and applies a short fade transition between changes.
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setQuoteIndex((index) => (index + 1) % quotes.length);
        setVisible(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, [quotes.length]);

  const current = quotes[quoteIndex];

  return (
    <section
      id="top"
      style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${C.cream} 0%, ${C.peachFaint} 45%, ${C.sageFaint} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "7rem clamp(1rem,4vw,3rem) 5rem",
      }}
    >
      {/* Three blurred atmosphere blobs define depth in the hero without heavy imagery. */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-8%",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: `${C.orange}16`,
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "0%",
          left: "-6%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `${C.sage}28`,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "35%",
          left: "60%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: `${C.peach}22`,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Floating emojis add playful nutrition context and subtle motion. */}
      {floatingEmoji.map((emoji, index) => (
        <div
          key={`${emoji}-${index}`}
          style={{
            position: "absolute",
            left: `${8 + index * 9}%`,
            top: `${15 + Math.sin(index * 1.3) * 55}%`,
            fontSize: `${14 + (index % 3) * 5}px`,
            opacity: 0.13 + (index % 3) * 0.05,
            animation: `floatLeaf ${4 + (index % 3)}s ease-in-out infinite alternate`,
            animationDelay: `${index * 0.35}s`,
            pointerEvents: "none",
          }}
        >
          {emoji}
        </div>
      ))}

      {/* Product positioning badge. */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: `${C.orange}14`,
          border: `1.5px solid ${C.orange}44`,
          borderRadius: 50,
          padding: "7px 20px",
          marginBottom: 36,
          animation: "fadeInDown 0.8s ease both",
        }}
      >
        <span style={{ fontSize: 13 }}>🏆</span>
        <span
          style={{
            color: C.orange,
            fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
          }}
        >
          FSSAI-Aligned Nutrition Generator for India
        </span>
      </div>

      {/* Quote card body with timed fade transition. */}
      <div
        style={{
          maxWidth: 780,
          textAlign: "center",
          marginBottom: 18,
          opacity: visible ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <div
          style={{
            fontSize: 76,
            color: `${C.orange}22`,
            fontFamily: "'Playfair Display', serif",
            lineHeight: 1,
            marginBottom: -14,
          }}
        >
          "
        </div>
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)",
            fontWeight: 800,
            color: C.ink,
            lineHeight: 1.45,
            margin: "0 0 16px",
          }}
        >
          {current.text}
        </p>
        <span
          style={{
            color: C.inkMid,
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            fontStyle: "italic",
          }}
        >
          — {current.author}
        </span>
      </div>

      <p
        style={{
          color: C.inkLight,
          fontSize: 17,
          maxWidth: 520,
          textAlign: "center",
          fontFamily: "'DM Sans', sans-serif",
          lineHeight: 1.7,
          marginBottom: 48,
          animation: "fadeInUp 1s 0.3s ease both",
        }}
      >
        Enter your recipe and get instant nutrition data + FSSAI compliance check, then download
        a print-ready PDF label.
      </p>

      {/* Primary/secondary action group. */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
          animation: "fadeInUp 1s 0.5s ease both",
        }}
      >
        <a
          href="#calculator"
          style={{
            background: `linear-gradient(135deg, ${C.orange}, #e54810)`,
            color: "#fff",
            padding: "14px 36px",
            borderRadius: 50,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: `0 6px 24px ${C.orange}50`,
            transition: "transform .2s, box-shadow .2s",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = "translateY(-2px)";
            event.currentTarget.style.boxShadow = `0 10px 32px ${C.orange}70`;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = "none";
            event.currentTarget.style.boxShadow = `0 6px 24px ${C.orange}50`;
          }}
        >
          Analyse My Recipe 🔬
        </a>
        <a
          href="#how-it-works"
          style={{
            background: "transparent",
            color: C.inkMid,
            padding: "14px 36px",
            borderRadius: 50,
            border: `2px solid ${C.peach}`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            textDecoration: "none",
            transition: "background .2s",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = `${C.peach}22`;
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = "transparent";
          }}
        >
          See How It Works
        </a>
      </div>

      {/* Stats strip provides instant value summary. */}
      <div
        style={{
          marginTop: 64,
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          justifyContent: "center",
          animation: "fadeInUp 1s 0.7s ease both",
        }}
      >
        {[
          ["38+", "Ingredients DB"],
          ["7", "Nutrients Tracked"],
          ["FSSAI", "Rule Validated"],
          ["Free", "PDF Export"],
        ].map(([value, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 28,
                fontWeight: 800,
                color: C.orange,
              }}
            >
              {value}
            </div>
            <div
              style={{
                color: C.inkLight,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 1.5,
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Required 4-color decorative stripe fixed to the section bottom edge. */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${C.orange} 0%, ${C.peach} 33%, ${C.cream} 66%, ${C.sage} 100%)`,
        }}
      />

      {/* Bounce indicator guides first-time users to scroll into calculator section. */}
      <div style={{ position: "absolute", bottom: 22, animation: "bounce 2s infinite" }}>
        <div style={{ color: C.peach, fontSize: 22 }}>↓</div>
      </div>
    </section>
  );
}
