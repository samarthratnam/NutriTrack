import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// ── Palette — from uploaded swatch ───────────────────────────────────────────
const C = {
  orange:      "#FF4D1A",
  peach:       "#EDAC6A",
  peachMid:    "#F2C48D",
  peachFaint:  "#F9E4C4",
  cream:       "#F5EDD0",
  creamLight:  "#FFFBF0",
  sage:        "#A8C9A0",
  sageDark:    "#6FA96A",
  sageFaint:   "#D6EBCF",
  ink:         "#2C1505",
  inkMid:      "#7A4520",
  inkLight:    "#B07040",
  border:      "#EDAC6A66",
  borderLight: "#EDAC6A33",
};

const NUTRIENT_COLORS = [C.orange, C.peach, C.sage, C.sageDark, C.peachMid, "#c0785a", "#8FC985"];

const inputStyle = {
  background: C.creamLight,
  border: `1.5px solid ${C.peachMid}`,
  color: C.ink,
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  transition: "border-color .2s",
};

const cardStyle = {
  background: C.creamLight,
  border: `1.5px solid ${C.border}`,
  borderRadius: 20,
  padding: "clamp(1.2rem, 2.5vw, 2rem)",
  boxShadow: `0 6px 32px #EDAC6A18`,
};

const cardTitle = {
  fontFamily: "'Playfair Display', serif",
  color: C.ink,
  fontSize: 20,
  fontWeight: 800,
  margin: 0,
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

function formatSuggestion(item) {
  if (typeof item === "string") return item;
  if (!item || typeof item !== "object") return "";

  const title = item.nutrient_label || item.nutrient_key || "Suggestion";
  const unit = item.unit ? ` ${item.unit}` : "";
  const value =
    item.current_value === undefined || item.current_value === null
      ? ""
      : ` (${item.current_value}${unit})`;
  const recommendation = item.recommendation ? `: ${item.recommendation}` : "";
  const contributors =
    Array.isArray(item.top_contributors) && item.top_contributors.length
      ? ` Top contributors: ${item.top_contributors.join(", ")}.`
      : "";

  return `${title}${value}${recommendation}${contributors}`.trim();
}

// ── Header ────────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu]         = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = ["How It Works", "Ingredients", "Compliance", "About"];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,251,240,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1.5px solid ${C.border}` : "none",
      transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
      padding: "0 clamp(1rem,4vw,3rem)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.orange}, ${C.peach})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: `0 4px 16px ${C.orange}44`,
          }}>🥗</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, color: C.ink }}>
            NutriLabel<span style={{ color: C.orange }}>AI</span>
          </span>
        </div>

        <nav style={{ display: "flex", gap: 32, alignItems: "center" }} className="desktop-nav">
          {navLinks.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/\s+/g, "-")}`} style={{
              color: C.inkMid, textDecoration: "none", fontSize: 14, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", transition: "color .2s",
            }}
              onMouseEnter={e => e.target.style.color = C.orange}
              onMouseLeave={e => e.target.style.color = C.inkMid}
            >{l}</a>
          ))}
          <a href="#calculator" style={{
            background: `linear-gradient(135deg, ${C.orange}, #e8451a)`,
            color: "#fff", padding: "9px 22px", borderRadius: 50,
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
            textDecoration: "none", boxShadow: `0 4px 14px ${C.orange}55`,
            transition: "opacity .2s, transform .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = ".88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
          >Try Free →</a>
        </nav>

        <button onClick={() => setMenu(!menu)} className="hamburger" style={{
          background: "none", border: "none", color: C.ink, fontSize: 26, cursor: "pointer", display: "none",
        }}>☰</button>
      </div>

      {menu && (
        <div style={{
          background: C.creamLight, padding: "1rem 2rem 1.5rem",
          borderTop: `1.5px solid ${C.border}`,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {[...navLinks, "Try Free →"].map(l => (
            <a key={l} href="#calculator" style={{ color: C.inkMid, textDecoration: "none", fontSize: 15, fontFamily: "'DM Sans',sans-serif" }}
              onClick={() => setMenu(false)}>{l}</a>
          ))}
        </div>
      )}
    </header>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      background: C.ink,
      padding: "3rem clamp(1rem,4vw,3rem) 2rem",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg,${C.orange},${C.peach})`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
              }}>🥗</div>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 800, color: C.cream }}>
                NutriLabel<span style={{ color: C.orange }}>AI</span>
              </span>
            </div>
            <p style={{ color: C.peach, fontSize: 13.5, lineHeight: 1.75, maxWidth: 240 }}>
              Automated FSSAI-compliant nutrition label generation for Indian food businesses.
            </p>
          </div>
          {[
            { title: "Product",   links: ["Calculator","PDF Labels","FSSAI Checker","Ingredients DB"] },
            { title: "Legal",     links: ["Privacy Policy","Terms of Use","Disclaimer","Cookie Policy"] },
            { title: "Resources", links: ["FSSAI Rulebook","Blog","API Docs","Contact Us"] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ color: C.sage, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 16, textTransform: "uppercase" }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ color: "#9C7050", fontSize: 14, textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => e.target.style.color = C.peach}
                    onMouseLeave={e => e.target.style.color = "#9C7050"}
                  >{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid #4a2810", paddingTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <p style={{ color: "#6B4020", fontSize: 13 }}>© 2025 NutriLabelAI. Built for India's food entrepreneurs.</p>
          <p style={{ color: "#5a3010", fontSize: 12 }}>⚠️ Educational tool only — not a legal certification.</p>
        </div>
      </div>
    </footer>
  );
}

// ── Hero / Quote Banner ───────────────────────────────────────────────────────
function QuoteBanner() {
  const quotes = [
    { text: "Let food be thy medicine and medicine be thy food.", author: "Hippocrates" },
    { text: "You are what you eat, so don't be fast, cheap, easy, or fake.", author: "Unknown" },
    { text: "The food you eat can be either the safest form of medicine or the slowest form of poison.", author: "Ann Wigmore" },
    { text: "To eat is a necessity, but to eat intelligently is an art.", author: "François de La Rochefoucauld" },
  ];
  const [idx, setIdx]   = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % quotes.length); setFade(true); }, 500);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const q = quotes[idx];

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.cream} 0%, ${C.peachFaint} 45%, ${C.sageFaint} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      padding: "7rem clamp(1rem,4vw,3rem) 5rem",
    }}>
      {/* Blobs */}
      <div style={{ position:"absolute", top:"-10%", right:"-8%", width:460, height:460, borderRadius:"50%", background:`${C.orange}16`, filter:"blur(90px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"0%", left:"-6%", width:400, height:400, borderRadius:"50%", background:`${C.sage}28`, filter:"blur(80px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"35%", left:"60%", width:260, height:260, borderRadius:"50%", background:`${C.peach}22`, filter:"blur(60px)", pointerEvents:"none" }} />

      {/* Floating food emojis */}
      {["🍊","🥗","🌿","🍋","🫑","🥦","🍃","🌾","🫐","🥕"].map((e, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${8 + i * 9}%`,
          top: `${15 + Math.sin(i * 1.3) * 55}%`,
          fontSize: `${14 + (i % 3) * 5}px`,
          opacity: 0.13 + (i % 3) * 0.05,
          animation: `floatLeaf ${4 + i % 3}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.35}s`,
          pointerEvents: "none",
        }}>{e}</div>
      ))}

      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: `${C.orange}14`, border: `1.5px solid ${C.orange}44`,
        borderRadius: 50, padding: "7px 20px", marginBottom: 36,
        animation: "fadeInDown 0.8s ease both",
      }}>
        <span style={{ fontSize: 13 }}>🏆</span>
        <span style={{ color: C.orange, fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
          FSSAI-Aligned Nutrition Generator for India
        </span>
      </div>

      {/* Quote */}
      <div style={{ maxWidth: 780, textAlign: "center", marginBottom: 18, opacity: fade ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <div style={{ fontSize: 76, color: `${C.orange}22`, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: -14 }}>"</div>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.5rem, 3.5vw, 2.3rem)",
          fontWeight: 800, color: C.ink, lineHeight: 1.45, margin: "0 0 16px",
        }}>{q.text}</p>
        <span style={{ color: C.inkMid, fontSize: 15, fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>
          — {q.author}
        </span>
      </div>

      {/* Sub-headline */}
      <p style={{
        color: C.inkLight, fontSize: 17, maxWidth: 520, textAlign: "center",
        fontFamily: "'DM Sans',sans-serif", lineHeight: 1.7, marginBottom: 48,
        animation: "fadeInUp 1s 0.3s ease both",
      }}>
        Enter your recipe and get instant nutrition data + FSSAI compliance check — then download a print-ready PDF label.
      </p>

      {/* CTAs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", animation: "fadeInUp 1s 0.5s ease both" }}>
        <a href="#calculator" style={{
          background: `linear-gradient(135deg, ${C.orange}, #e54810)`,
          color: "#fff", padding: "14px 36px", borderRadius: 50,
          fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 700,
          textDecoration: "none", boxShadow: `0 6px 24px ${C.orange}50`,
          transition: "transform .2s, box-shadow .2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${C.orange}70`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 6px 24px ${C.orange}50`; }}
        >Analyse My Recipe 🔬</a>
        <a href="#how-it-works" style={{
          background: "transparent", color: C.inkMid,
          padding: "14px 36px", borderRadius: 50,
          border: `2px solid ${C.peach}`,
          fontFamily: "'DM Sans',sans-serif", fontSize: 16, fontWeight: 600,
          textDecoration: "none", transition: "background .2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = `${C.peach}22`}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >See How It Works</a>
      </div>

      {/* Stats */}
      <div style={{ marginTop: 64, display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center", animation: "fadeInUp 1s 0.7s ease both" }}>
        {[["38+","Ingredients DB"],["7","Nutrients Tracked"],["FSSAI","Rule Validated"],["Free","PDF Export"]].map(([v, l]) => (
          <div key={l} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: C.orange }}>{v}</div>
            <div style={{ color: C.inkLight, fontSize: 11, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: 1.5, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Palette stripe at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(90deg, ${C.orange} 0%, ${C.peach} 33%, ${C.cream} 66%, ${C.sage} 100%)`,
      }} />

      <div style={{ position: "absolute", bottom: 22, animation: "bounce 2s infinite" }}>
        <div style={{ color: C.peach, fontSize: 22 }}>↓</div>
      </div>
    </div>
  );
}

// ── Ingredient row ────────────────────────────────────────────────────────────
function IngredientRow({ idx, item, onChange, onRemove }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 110px 38px", gap: 10, alignItems: "center",
      background: C.cream, borderRadius: 12, padding: "10px 14px",
      border: `1.5px solid ${C.peachFaint}`, animation: "fadeInLeft 0.3s ease both",
    }}>
      <input placeholder={`Ingredient ${idx + 1} (e.g. Sugar)`}
        value={item.name} onChange={e => onChange(idx, "name", e.target.value)}
        style={inputStyle} />
      <input type="number" placeholder="grams" min={0}
        value={item.quantity_g} onChange={e => onChange(idx, "quantity_g", e.target.value)}
        style={{ ...inputStyle, textAlign: "center" }} />
      <button onClick={() => onRemove(idx)} style={{
        background: `${C.orange}14`, border: `1.5px solid ${C.orange}44`,
        color: C.orange, borderRadius: 8, width: 38, height: 38,
        cursor: "pointer", fontSize: 18, lineHeight: 1, transition: "background .2s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = `${C.orange}28`}
        onMouseLeave={e => e.currentTarget.style.background = `${C.orange}14`}
      >×</button>
    </div>
  );
}

// ── Nutrient Pie ──────────────────────────────────────────────────────────────
function NutrientPie({ data }) {
  const pieData = [
    { name: "Protein",  value: data.protein_g },
    { name: "Carbs",    value: data.carbs_g },
    { name: "Sugar",    value: data.sugar_g },
    { name: "Fat",      value: data.fat_g },
    { name: "Sat. Fat", value: data.saturated_fat_g },
  ].filter(d => d.value > 0);
  return (
    <div style={{ width: "100%", height: 270 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name"
            cx="50%" cy="50%" outerRadius={100} innerRadius={48} paddingAngle={3} stroke="none">
            {pieData.map((_, i) => <Cell key={i} fill={NUTRIENT_COLORS[i % NUTRIENT_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [`${v}g`, n]}
            contentStyle={{ background: C.creamLight, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.ink, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }} />
          <Legend wrapperStyle={{ color: C.inkMid, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── FSSAI Pie ─────────────────────────────────────────────────────────────────
function FSSAIPie({ result }) {
  const rules  = result.fssai_compliance?.rulebook || [];
  const counts = { pass: 0, warn: 0, fail: 0 };
  rules.forEach(r => { counts[r.status] = (counts[r.status] || 0) + 1; });
  if (rules.length === 0) counts.pass = 1;
  const pieData = [
    { name: "Pass",    value: counts.pass, color: C.sageDark },
    { name: "Warning", value: counts.warn, color: C.peach },
    { name: "Fail",    value: counts.fail, color: C.orange },
  ].filter(d => d.value > 0);
  return (
    <div style={{ width: "100%", height: 270 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name"
            cx="50%" cy="50%" outerRadius={100} innerRadius={48} paddingAngle={3} stroke="none">
            {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: C.creamLight, border: `1.5px solid ${C.border}`, borderRadius: 10, color: C.ink, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }} />
          <Legend wrapperStyle={{ color: C.inkMid, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Health bar ────────────────────────────────────────────────────────────────
function HealthBar({ bar }) {
  const color =
    bar.status === "high" || bar.status === "low"
      ? C.orange
      : bar.status === "moderate" || bar.status === "watch"
      ? C.peach
      : C.sageDark;
  const pct   = clamp(bar.percent_of_reference, 0, 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: C.inkMid, fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{bar.label}</span>
        <span style={{ color, fontSize: 13.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
          {bar.value}{bar.unit}
          <span style={{ color: C.inkLight, fontWeight: 400, marginLeft: 4 }}>({bar.percent_of_reference}% DV)</span>
        </span>
      </div>
      <div style={{ height: 9, borderRadius: 8, background: C.peachFaint, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color, borderRadius: 8,
          transition: "width 1.1s cubic-bezier(.4,0,.2,1)", boxShadow: `0 0 8px ${color}55`,
        }} />
      </div>
      {bar.guidance && <p style={{ color: C.inkLight, fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>{bar.guidance}</p>}
    </div>
  );
}

// ── Rule badge ────────────────────────────────────────────────────────────────
function RuleBadge({ rule }) {
  const cfg = {
    pass: { bg: C.sageFaint,    border: C.sage,       color: C.sageDark, icon: "✓" },
    warn: { bg: C.peachFaint,   border: C.peach,      color: C.inkMid,   icon: "⚠" },
    fail: { bg: "#FF4D1A0D",    border: "#FF4D1A44",  color: C.orange,   icon: "✗" },
  }[rule.status] || { bg: C.cream, border: C.border, color: C.inkMid, icon: "•" };
  return (
    <div style={{
      background: cfg.bg, border: `1.5px solid ${cfg.border}`,
      borderRadius: 12, padding: "12px 16px", marginBottom: 10,
      transition: "transform .2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "none"}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ color: cfg.color, fontWeight: 800, fontSize: 16, marginTop: 1 }}>{cfg.icon}</span>
        <div>
          <div style={{ color: C.ink, fontSize: 13.5, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            {rule.rule_id} — {rule.title}
          </div>
          <div style={{ color: C.inkLight, fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", marginTop: 2 }}>{rule.description}</div>
          <div style={{ color: cfg.color, fontSize: 12, fontFamily: "'DM Sans',sans-serif", marginTop: 3, fontWeight: 600 }}>{rule.observation}</div>
        </div>
      </div>
    </div>
  );
}

// ── Calculator ────────────────────────────────────────────────────────────────
function Calculator() {
  const [recipeName, setRecipeName]   = useState("");
  const [servings, setServings]       = useState(2);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity_g: "" },
    { name: "", quantity_g: "" },
  ]);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dlLoading, setDlLoading] = useState(false);

  const addRow    = () => setIngredients(p => [...p, { name: "", quantity_g: "" }]);
  const removeRow = i  => setIngredients(p => p.filter((_, j) => j !== i));
  const changeRow = (i, k, v) => setIngredients(p => p.map((r, j) => j === i ? { ...r, [k]: v } : r));

  const calculate = async () => {
    setError(null); setResult(null);
    const valid = ingredients.filter(r => r.name.trim() && Number(r.quantity_g) > 0);
    if (!valid.length) { setError("Add at least one ingredient with a quantity."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_name: recipeName || "My Recipe",
          servings: Number(servings),
          ingredients: valid.map(r => ({ name: r.name.trim(), quantity_g: Number(r.quantity_g) })),
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Calculation failed."); }
      setResult(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const downloadPDF = async () => {
    setDlLoading(true);
    const valid = ingredients.filter(r => r.name.trim() && Number(r.quantity_g) > 0);
    try {
      const res = await fetch(`${API_BASE}/generate-label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_name: recipeName || "My Recipe",
          servings: Number(servings),
          ingredients: valid.map(r => ({ name: r.name.trim(), quantity_g: Number(r.quantity_g) })),
        }),
      });
      if (!res.ok) throw new Error("PDF generation failed.");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${recipeName || "nutrition_label"}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { setError(e.message); }
    finally { setDlLoading(false); }
  };

  const compliance = result?.fssai_compliance;
  const aligned    = compliance?.is_fssai_aligned;

  return (
    <section id="calculator" style={{ background: C.cream, padding: "6rem clamp(1rem,4vw,3rem)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span style={{
            background: `${C.orange}14`, color: C.orange, padding: "6px 18px",
            borderRadius: 50, fontSize: 11, fontFamily: "'DM Sans',sans-serif",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, border: `1px solid ${C.orange}33`,
          }}>Recipe Analyser</span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: C.ink, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, margin: "16px 0 12px" }}>
            What's Really in Your Recipe?
          </h2>
          <p style={{ color: C.inkLight, fontFamily: "'DM Sans',sans-serif", fontSize: 16, maxWidth: 460, margin: "0 auto" }}>
            Enter your ingredients and get instant nutrition facts + FSSAI compliance report.
          </p>
        </div>

        {/* Input card */}
        <div style={{
          background: C.creamLight, border: `1.5px solid ${C.border}`,
          borderRadius: 22, padding: "clamp(1.2rem,3vw,2.4rem)",
          boxShadow: `0 12px 48px ${C.orange}0F`, marginBottom: 40,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginBottom: 24, alignItems: "end" }}>
            <div>
              <label style={{ color: C.inkMid, fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Recipe Name</label>
              <input placeholder="e.g. Masala Oats, Protein Bar…"
                value={recipeName} onChange={e => setRecipeName(e.target.value)}
                style={{ ...inputStyle, fontSize: 15 }} />
            </div>
            <div>
              <label style={{ color: C.inkMid, fontSize: 11, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>Servings</label>
              <input type="number" min={1} value={servings} onChange={e => setServings(e.target.value)}
                style={{ ...inputStyle, width: 80, textAlign: "center" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 38px", gap: 10, padding: "0 14px", marginBottom: 8 }}>
            <span style={{ color: C.inkLight, fontSize: 11, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Ingredient</span>
            <span style={{ color: C.inkLight, fontSize: 11, fontFamily: "'DM Sans',sans-serif", textTransform: "uppercase", letterSpacing: 1 }}>Qty (g)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {ingredients.map((item, i) => (
              <IngredientRow key={i} idx={i} item={item} onChange={changeRow} onRemove={removeRow} />
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <button onClick={addRow} style={{
              background: "transparent", border: `1.5px dashed ${C.peach}`,
              color: C.inkMid, borderRadius: 10, padding: "9px 22px",
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, cursor: "pointer", fontWeight: 600,
              transition: "background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = `${C.peach}20`}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >+ Add Ingredient</button>

            <button onClick={calculate} disabled={loading} style={{
              background: `linear-gradient(135deg, ${C.orange}, #e54810)`,
              color: "#fff", borderRadius: 50, padding: "12px 34px",
              fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700,
              border: "none", cursor: loading ? "wait" : "pointer",
              boxShadow: `0 4px 20px ${C.orange}44`, opacity: loading ? 0.7 : 1,
              transition: "opacity .2s, transform .2s",
            }}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            >{loading ? "Analysing…" : "🔬 Analyse Recipe"}</button>

            {result && (
              <button onClick={downloadPDF} disabled={dlLoading} style={{
                background: "transparent", border: `2px solid ${C.sage}`,
                color: C.sageDark, borderRadius: 50, padding: "11px 28px",
                fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 600,
                cursor: dlLoading ? "wait" : "pointer", opacity: dlLoading ? 0.6 : 1,
                transition: "background .2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${C.sage}20`}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >{dlLoading ? "Generating…" : "📄 Download PDF Label"}</button>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: 16, background: `${C.orange}0F`, border: `1.5px solid ${C.orange}44`,
              borderRadius: 10, padding: "12px 16px",
              color: C.orange, fontFamily: "'DM Sans',sans-serif", fontSize: 14,
            }}>⚠ {error}</div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation: "fadeInUp 0.6s ease both" }}>
            {compliance && (
              <div style={{
                borderRadius: 16, padding: "18px 24px", marginBottom: 32,
                background: aligned ? C.sageFaint : `${C.orange}0C`,
                border: `1.5px solid ${aligned ? C.sage : C.orange}55`,
                display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
              }}>
                <span style={{ fontSize: 30 }}>{aligned ? "✅" : "⛔"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, color: aligned ? C.sageDark : C.orange, fontSize: 16 }}>
                    {compliance.warning_banner}
                  </div>
                  <div style={{ color: C.inkLight, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 3 }}>
                    {compliance.legal_note}
                  </div>
                </div>
                {!aligned && compliance.risk_note && (
                  <div style={{
                    background: `${C.orange}0F`, border: `1.5px solid ${C.orange}33`,
                    borderRadius: 10, padding: "10px 16px", color: C.orange,
                    fontSize: 12.5, fontFamily: "'DM Sans',sans-serif", maxWidth: 340,
                  }}>⚖ {compliance.risk_note}</div>
                )}
              </div>
            )}

            {/* Side-by-side: Your Recipe | FSSAI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))", gap: 28, marginBottom: 28 }}>
              {/* Your Recipe */}
              <div style={cardStyle}>
                <h3 style={cardTitle}>🥘 Your Recipe</h3>
                <p style={{ color: C.inkLight, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, marginTop: 6 }}>
                  Per serving · Total weight {result.total_weight}g
                </p>
                <NutrientPie data={result.per_serving} />
                <div style={{ marginTop: 16 }}>
                  {[
                    ["energy_kcal","Energy","kcal"],
                    ["protein_g","Protein","g"],
                    ["carbs_g","Carbohydrates","g"],
                    ["sugar_g","  of which Sugars","g"],
                    ["fat_g","Fat","g"],
                    ["saturated_fat_g","  Saturated Fat","g"],
                    ["sodium_mg","Sodium","mg"],
                  ].map(([k, label, unit]) => (
                    <div key={k} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "9px 0", borderBottom: `1px solid ${C.peachFaint}`,
                      fontFamily: "'DM Sans',sans-serif",
                    }}>
                      <span style={{ color: C.inkMid, fontSize: 14 }}>{label}</span>
                      <span style={{ color: C.ink, fontSize: 14, fontWeight: 700 }}>{result.per_serving[k]} {unit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FSSAI Analysis */}
              <div style={cardStyle}>
                <h3 style={cardTitle}>✅ FSSAI Analysis</h3>
                <p style={{ color: C.inkLight, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 20, marginTop: 6 }}>
                  {compliance?.warning_count ?? 0} warning(s) · {(compliance?.rulebook || []).length} rules checked
                </p>
                <FSSAIPie result={result} />
                {result.fssai_suggestions && (
                  <div style={{ marginTop: 20 }}>
                    {result.fssai_suggestions.cut_down?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ color: C.orange, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>✂ Cut Down</div>
                        {result.fssai_suggestions.cut_down.map((s, i) => (
                          <div key={i} style={{ background: `${C.orange}0A`, border: `1px solid ${C.orange}33`, borderRadius: 8, padding: "8px 13px", color: C.inkMid, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 7 }}>
                            {formatSuggestion(s)}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.fssai_suggestions.add_up?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ color: C.sageDark, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginBottom: 8 }}>➕ Add Up</div>
                        {result.fssai_suggestions.add_up.map((s, i) => (
                          <div key={i} style={{ background: C.sageFaint, border: `1px solid ${C.sage}`, borderRadius: 8, padding: "8px 13px", color: C.inkMid, fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginBottom: 7 }}>
                            {formatSuggestion(s)}
                          </div>
                        ))}
                      </div>
                    )}
                    {result.fssai_suggestions.note && (
                      <p style={{ color: C.inkLight, fontSize: 11.5, fontFamily: "'DM Sans',sans-serif", fontStyle: "italic" }}>ℹ {result.fssai_suggestions.note}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Health bars */}
            {result.health_bars?.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: 28 }}>
                <h3 style={cardTitle}>
                  📊 Nutrient Health Bars
                  <span style={{ color: C.inkLight, fontSize: 14, fontWeight: 400, marginLeft: 8 }}>vs Daily Reference per serving</span>
                </h3>
                <div style={{ marginTop: 22 }}>
                  {result.health_bars.map(bar => <HealthBar key={bar.key} bar={bar} />)}
                </div>
              </div>
            )}

            {/* Rulebook */}
            {compliance?.rulebook?.length > 0 && (
              <div style={{ ...cardStyle, marginBottom: 28 }}>
                <h3 style={cardTitle}>📋 FSSAI Rulebook</h3>
                <div style={{ marginTop: 16 }}>
                  {compliance.rulebook.map(r => <RuleBadge key={r.rule_id} rule={r} />)}
                </div>
              </div>
            )}

            {/* Allergens */}
            {result.allergy_alerts?.length > 0 && (
              <div style={{ ...cardStyle, border: `1.5px solid ${C.peach}88` }}>
                <h3 style={{ ...cardTitle, color: C.inkMid }}>⚠ Allergen Alerts</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                  {result.allergy_alerts.map((a, i) => (
                    <span key={i} style={{
                      background: C.peachFaint, border: `1.5px solid ${C.peach}`,
                      color: C.inkMid, borderRadius: 50, padding: "6px 18px",
                      fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
                    }}>
                      {typeof a === "string"
                        ? a
                        : [
                            a?.allergen,
                            Array.isArray(a?.detected_ingredients) && a.detected_ingredients.length
                              ? `Detected: ${a.detected_ingredients.join(", ")}`
                              : "",
                            Array.isArray(a?.alternatives) && a.alternatives.length
                              ? `Alternatives: ${a.alternatives.join(", ")}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon: "📝", title: "Enter Your Recipe",  desc: "List ingredients and quantities in grams. Supports 38+ common Indian kitchen ingredients." },
    { icon: "🔬", title: "Instant Analysis",   desc: "Calculates per-100g and per-serving values benchmarked against FSSAI reference values." },
    { icon: "✅", title: "FSSAI Compliance",   desc: "Get a pass/warn/fail report against FSSAI rules — know your regulatory risk before printing." },
    { icon: "📄", title: "Download PDF Label", desc: "Export a print-ready FSSAI-style Nutrition Information PDF in one click. Free, always." },
  ];
  return (
    <section id="how-it-works" style={{ background: `${C.peachFaint}`, padding: "6rem clamp(1rem,4vw,3rem)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", color: C.ink, fontSize: "clamp(1.6rem,3.5vw,2.4rem)", fontWeight: 800, margin: "0 0 12px" }}>
            How It Works
          </h2>
          <p style={{ color: C.inkLight, fontFamily: "'DM Sans',sans-serif", fontSize: 15 }}>
            Four steps. Zero spreadsheets. Full FSSAI alignment.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              background: C.creamLight, border: `1.5px solid ${C.border}`,
              borderRadius: 18, padding: "28px 24px", position: "relative",
              transition: "transform .25s, box-shadow .25s", cursor: "default",
              boxShadow: `0 4px 18px ${C.orange}08`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${C.orange}18`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 18px ${C.orange}08`; }}
            >
              <div style={{ position: "absolute", top: 18, right: 20, fontFamily: "'Playfair Display',serif", fontSize: 40, color: `${C.orange}14`, fontWeight: 800, lineHeight: 1 }}>0{i + 1}</div>
              <div style={{ fontSize: 34, marginBottom: 16 }}>{s.icon}</div>
              <h4 style={{ color: C.ink, fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 16, margin: "0 0 10px" }}>{s.title}</h4>
              <p style={{ color: C.inkLight, fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: ${C.cream}; color: ${C.ink}; }
        ::-webkit-scrollbar { width: 6px; background: ${C.cream}; }
        ::-webkit-scrollbar-thumb { background: ${C.peach}; border-radius: 6px; }
        input:focus { border-color: ${C.orange} !important; box-shadow: 0 0 0 3px ${C.orange}18; }

        @keyframes fadeInDown { from { opacity:0; transform:translateY(-18px); } to { opacity:1; transform:none; } }
        @keyframes fadeInUp   { from { opacity:0; transform:translateY(18px);  } to { opacity:1; transform:none; } }
        @keyframes fadeInLeft { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:none; } }
        @keyframes bounce     { 0%,100% { transform:translateY(0); } 50% { transform:translateY(8px); } }
        @keyframes floatLeaf  { from { transform:translateY(0) rotate(-5deg); } to { transform:translateY(-22px) rotate(10deg); } }

        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: block !important; }
        }
      `}</style>
      <Header />
      <main>
        <QuoteBanner />
        <Calculator />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
