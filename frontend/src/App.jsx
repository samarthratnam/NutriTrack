import Header from "./components/Header";
import Footer from "./components/Footer";
import QuoteBanner from "./components/QuoteBanner";
import Calculator from "./components/Calculator";
import HowItWorks from "./components/HowItWorks";
import { C } from "./constants/theme";

/**
 * Root application component.
 *
 * What it renders:
 * - Global font + animation + base CSS setup in one inline <style> block.
 * - Full page composition: Header, Hero, Calculator, How-it-works, Footer.
 *
 * Props:
 * - None.
 *
 * API calls:
 * - None directly. API calls are made inside useNutrition via Calculator.
 *
 * Key design decisions:
 * - Keeps all global CSS in App as requested while components remain inline-style first.
 * - Uses /api base path so Vite proxy handles local backend forwarding cleanly.
 */
export default function App() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || "/api";

  return (
    <>
      {/* Global style layer includes required fonts, keyframes, scrollbar, and responsive nav rules. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&family=Cascadia+Mono:wght@400;600;700&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: ${C.cream};
          color: ${C.ink};
          font-family: 'DM Sans', sans-serif;
        }

        /* Required custom scrollbar treatment. */
        ::-webkit-scrollbar {
          width: 6px;
          background: ${C.cream};
        }

        ::-webkit-scrollbar-thumb {
          background: ${C.peach};
          border-radius: 6px;
        }

        /* Required input focus ring and border effect. */
        input:focus {
          border-color: ${C.orange} !important;
          box-shadow: 0 0 0 3px rgba(255, 77, 26, 0.10) !important;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-18px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @keyframes floatLeaf {
          from { transform: translateY(0) rotate(-5deg); }
          to { transform: translateY(-22px) rotate(10deg); }
        }

        /* Desktop nav visible by default. */
        .desktop-nav {
          display: flex;
        }

        /* Mobile hamburger hidden by default, enabled below 640px. */
        .hamburger {
          display: none;
        }

        @media (max-width: 640px) {
          .desktop-nav {
            display: none !important;
          }

          .hamburger {
            display: inline-flex !important;
          }
        }
      `}</style>

      <Header />
      <main>
        <QuoteBanner />
        <Calculator apiBase={apiBase} />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
