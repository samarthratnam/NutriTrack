import { C, cardStyle, cardTitle, inputStyle } from "../constants/theme";
import useNutrition from "../hooks/useNutrition";
import FSSAIPie from "./FSSAIPie";
import HealthBar from "./HealthBar";
import IngredientRow from "./IngredientRow";
import NutrientPie from "./NutrientPie";
import RuleBadge from "./RuleBadge";

/**
 * Calculator component.
 *
 * What it renders:
 * - Main recipe input experience (name, servings, ingredients, actions).
 * - Full analysis dashboard after successful API response.
 * - Compliance alerts, charts, suggestions, health bars, rulebook, and allergen pills.
 *
 * Props:
 * - apiBase (string): base URL for API calls, typically "/api".
 *
 * API calls:
 * - Indirectly uses useNutrition hook which calls:
 *   - POST /api/calculate
 *   - POST /api/generate-label
 *
 * Key design decisions:
 * - Keeps API and form logic inside useNutrition hook for separation of concerns.
 * - Uses defensive rendering for mixed backend response shapes.
 * - Prioritizes compliance signal visibility with top-of-results warning banner.
 */
export default function Calculator({ apiBase }) {
  const {
    recipeName,
    setRecipeName,
    servings,
    setServings,
    ingredients,
    addRow,
    removeRow,
    changeRow,
    result,
    loading,
    error,
    dlLoading,
    calculate,
    downloadPDF,
  } = useNutrition(apiBase);

  const compliance = result?.fssai_compliance;
  const aligned = Boolean(compliance?.is_fssai_aligned);

  /**
   * Converts suggestion payload into readable text.
   * Supports both string-based and object-based backend responses.
   */
  const formatSuggestion = (item) => {
    if (typeof item === "string") {
      return item;
    }
    if (!item || typeof item !== "object") {
      return "";
    }

    const label = item.nutrient_label || item.nutrient_key || "Suggestion";
    const value =
      item.current_value !== undefined && item.current_value !== null
        ? ` (${item.current_value}${item.unit ? ` ${item.unit}` : ""})`
        : "";
    const recommendation = item.recommendation ? `: ${item.recommendation}` : "";
    const contributors =
      Array.isArray(item.top_contributors) && item.top_contributors.length
        ? ` Top contributors: ${item.top_contributors.join(", ")}.`
        : "";
    return `${label}${value}${recommendation}${contributors}`;
  };

  return (
    <section id="calculator" style={{ background: C.cream, padding: "6rem clamp(1rem,4vw,3rem)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Section heading block introduces the analysis workflow clearly. */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <span
            style={{
              background: `${C.orange}14`,
              color: C.orange,
              padding: "6px 18px",
              borderRadius: 50,
              fontSize: 11,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              border: `1px solid ${C.orange}33`,
            }}
          >
            Recipe Analyser
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              color: C.ink,
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              fontWeight: 800,
              margin: "16px 0 12px",
            }}
          >
            What&apos;s Really in Your Recipe?
          </h2>
          <p
            style={{
              color: C.inkLight,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 16,
              maxWidth: 460,
              margin: "0 auto",
            }}
          >
            Enter your ingredients and get instant nutrition facts plus FSSAI compliance signals.
          </p>
        </div>

        {/* Input card contains all controls required to request analysis. */}
        <div
          style={{
            background: C.creamLight,
            border: `1.5px solid ${C.border}`,
            borderRadius: 22,
            padding: "clamp(1.2rem,3vw,2.4rem)",
            boxShadow: `0 12px 48px ${C.orange}0F`,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 16,
              marginBottom: 24,
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  color: C.inkMid,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Recipe Name
              </label>
              <input
                type="text"
                placeholder="e.g. Masala Oats, Protein Bar…"
                value={recipeName}
                onChange={(event) => setRecipeName(event.target.value)}
                style={{ ...inputStyle, fontSize: 15 }}
              />
            </div>

            <div>
              <label
                style={{
                  color: C.inkMid,
                  fontSize: 11,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Servings
              </label>
              <input
                type="number"
                min={1}
                value={servings}
                onChange={(event) => setServings(event.target.value)}
                style={{ ...inputStyle, width: 80, textAlign: "center" }}
              />
            </div>
          </div>

          {/* Column labels align with IngredientRow grid for strong table-like clarity. */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 38px", gap: 10, padding: "0 14px", marginBottom: 8 }}>
            <span
              style={{
                color: C.inkLight,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Ingredient
            </span>
            <span
              style={{
                color: C.inkLight,
                fontSize: 11,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Qty (g)
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {ingredients.map((item, index) => (
              <IngredientRow
                key={`ingredient-${index}`}
                idx={index}
                item={item}
                onChange={changeRow}
                onRemove={removeRow}
              />
            ))}
          </div>

          {/* Primary action row with add/analyse/download controls. */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <button
              type="button"
              onClick={addRow}
              style={{
                background: "transparent",
                border: `1.5px dashed ${C.peach}`,
                color: C.inkMid,
                borderRadius: 10,
                padding: "9px 22px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                cursor: "pointer",
                fontWeight: 600,
                transition: "background .2s",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background = `${C.peach}20`;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "transparent";
              }}
            >
              + Add Ingredient
            </button>

            <button
              type="button"
              onClick={calculate}
              disabled={loading}
              style={{
                background: `linear-gradient(135deg, ${C.orange}, #e54810)`,
                color: "#fff",
                borderRadius: 50,
                padding: "12px 34px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                boxShadow: `0 4px 20px ${C.orange}44`,
                opacity: loading ? 0.7 : 1,
                transition: "opacity .2s, transform .2s",
              }}
              onMouseEnter={(event) => {
                if (!loading) {
                  event.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "none";
              }}
            >
              {loading ? "Analysing…" : "🔬 Analyse Recipe"}
            </button>

            {result ? (
              <button
                type="button"
                onClick={downloadPDF}
                disabled={dlLoading}
                style={{
                  background: "transparent",
                  border: `2px solid ${C.sage}`,
                  color: C.sageDark,
                  borderRadius: 50,
                  padding: "11px 28px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: dlLoading ? "wait" : "pointer",
                  opacity: dlLoading ? 0.6 : 1,
                  transition: "background .2s",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = `${C.sage}20`;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "transparent";
                }}
              >
                {dlLoading ? "Generating…" : "📄 Download PDF Label"}
              </button>
            ) : null}
          </div>

          {/* API / validation errors are displayed inline to keep user context intact. */}
          {error ? (
            <div
              style={{
                marginTop: 16,
                background: `${C.orange}0F`,
                border: `1.5px solid ${C.orange}44`,
                borderRadius: 10,
                padding: "12px 16px",
                color: C.orange,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
              }}
            >
              ⚠ {error}
            </div>
          ) : null}
        </div>

        {/* Results dashboard appears only after successful calculation. */}
        {result ? (
          <div style={{ animation: "fadeInUp 0.6s ease both" }}>
            {compliance ? (
              <div
                style={{
                  borderRadius: 16,
                  padding: "18px 24px",
                  marginBottom: 32,
                  background: aligned ? C.sageFaint : `${C.orange}0C`,
                  border: `1.5px solid ${aligned ? C.sage : C.orange}55`,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 30 }}>{aligned ? "✅" : "⛔"}</span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 800,
                      color: aligned ? C.sageDark : C.orange,
                      fontSize: 16,
                    }}
                  >
                    {compliance.warning_banner}
                  </div>
                  <div
                    style={{
                      color: C.inkLight,
                      fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      marginTop: 3,
                    }}
                  >
                    {compliance.legal_note}
                  </div>
                </div>
                {!aligned && compliance.risk_note ? (
                  <div
                    style={{
                      background: `${C.orange}0F`,
                      border: `1.5px solid ${C.orange}33`,
                      borderRadius: 10,
                      padding: "10px 16px",
                      color: C.orange,
                      fontSize: 12.5,
                      fontFamily: "'DM Sans', sans-serif",
                      maxWidth: 340,
                    }}
                  >
                    ⚖ {compliance.risk_note}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Two-column results grid for recipe vs FSSAI side-by-side interpretation. */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
                gap: 28,
                marginBottom: 28,
              }}
            >
              <div style={cardStyle}>
                <h3 style={cardTitle}>🥘 Your Recipe</h3>
                <p
                  style={{
                    color: C.inkLight,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 20,
                    marginTop: 6,
                  }}
                >
                  Per serving · Total weight {result.total_weight}g
                </p>

                <NutrientPie data={result.per_serving} />

                <div style={{ marginTop: 16 }}>
                  {[
                    ["energy_kcal", "Energy", "kcal"],
                    ["protein_g", "Protein", "g"],
                    ["carbs_g", "Carbohydrates", "g"],
                    ["sugar_g", "  of which Sugars", "g"],
                    ["fat_g", "Fat", "g"],
                    ["saturated_fat_g", "  Saturated Fat", "g"],
                    ["sodium_mg", "Sodium", "mg"],
                  ].map(([key, label, unit]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "9px 0",
                        borderBottom: `1px solid ${C.peachFaint}`,
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      <span style={{ color: C.inkMid, fontSize: 14 }}>{label}</span>
                      <span
                        style={{
                          color: C.ink,
                          fontSize: 14,
                          fontWeight: 700,
                          fontFamily: "'Cascadia Mono', monospace",
                        }}
                      >
                        {result.per_serving?.[key]} {unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={cardTitle}>✅ FSSAI Analysis</h3>
                <p
                  style={{
                    color: C.inkLight,
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                    marginBottom: 20,
                    marginTop: 6,
                  }}
                >
                  {compliance?.warning_count ?? 0} warning(s) · {(compliance?.rulebook || []).length} rules checked
                </p>

                <FSSAIPie result={result} />

                {result?.fssai_suggestions ? (
                  <div style={{ marginTop: 20 }}>
                    {Array.isArray(result.fssai_suggestions.cut_down) &&
                    result.fssai_suggestions.cut_down.length > 0 ? (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            color: C.orange,
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                            marginBottom: 8,
                          }}
                        >
                          ✂ Cut Down
                        </div>
                        {result.fssai_suggestions.cut_down.map((item, index) => (
                          <div
                            key={`cut-${index}`}
                            style={{
                              background: `${C.orange}0A`,
                              border: `1px solid ${C.orange}33`,
                              borderRadius: 8,
                              padding: "8px 13px",
                              color: C.inkMid,
                              fontSize: 13,
                              fontFamily: "'DM Sans', sans-serif",
                              marginBottom: 7,
                            }}
                          >
                            {formatSuggestion(item)}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {Array.isArray(result.fssai_suggestions.add_up) &&
                    result.fssai_suggestions.add_up.length > 0 ? (
                      <div style={{ marginBottom: 14 }}>
                        <div
                          style={{
                            color: C.sageDark,
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "'DM Sans', sans-serif",
                            marginBottom: 8,
                          }}
                        >
                          ➕ Add Up
                        </div>
                        {result.fssai_suggestions.add_up.map((item, index) => (
                          <div
                            key={`add-${index}`}
                            style={{
                              background: C.sageFaint,
                              border: `1px solid ${C.sage}`,
                              borderRadius: 8,
                              padding: "8px 13px",
                              color: C.inkMid,
                              fontSize: 13,
                              fontFamily: "'DM Sans', sans-serif",
                              marginBottom: 7,
                            }}
                          >
                            {formatSuggestion(item)}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {result.fssai_suggestions.note ? (
                      <p
                        style={{
                          color: C.inkLight,
                          fontSize: 11.5,
                          fontFamily: "'DM Sans', sans-serif",
                          fontStyle: "italic",
                          margin: 0,
                        }}
                      >
                        ℹ {result.fssai_suggestions.note}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {Array.isArray(result.health_bars) && result.health_bars.length > 0 ? (
              <div style={{ ...cardStyle, marginBottom: 28 }}>
                <h3 style={cardTitle}>
                  📊 Nutrient Health Bars
                  <span
                    style={{
                      color: C.inkLight,
                      fontSize: 14,
                      fontWeight: 400,
                      marginLeft: 8,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    vs Daily Reference per serving
                  </span>
                </h3>
                <div style={{ marginTop: 22 }}>
                  {result.health_bars.map((bar) => (
                    <HealthBar key={bar.key} bar={bar} />
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(compliance?.rulebook) && compliance.rulebook.length > 0 ? (
              <div style={{ ...cardStyle, marginBottom: 28 }}>
                <h3 style={cardTitle}>📋 FSSAI Rulebook</h3>
                <div style={{ marginTop: 16 }}>
                  {compliance.rulebook.map((rule) => (
                    <RuleBadge key={rule.rule_id} rule={rule} />
                  ))}
                </div>
              </div>
            ) : null}

            {Array.isArray(result.allergy_alerts) && result.allergy_alerts.length > 0 ? (
              <div style={{ ...cardStyle, border: `1.5px solid ${C.peach}88` }}>
                <h3 style={{ ...cardTitle, color: C.inkMid }}>⚠ Allergen Alerts</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 16 }}>
                  {result.allergy_alerts.map((alert, index) => {
                    const pillText =
                      typeof alert === "string"
                        ? alert
                        : [
                            alert?.allergen || "",
                            Array.isArray(alert?.detected_ingredients) && alert.detected_ingredients.length
                              ? `Detected: ${alert.detected_ingredients.join(", ")}`
                              : "",
                            Array.isArray(alert?.alternatives) && alert.alternatives.length
                              ? `Alternatives: ${alert.alternatives.join(", ")}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" • ");

                    return (
                      <span
                        key={`allergy-${index}`}
                        style={{
                          background: C.peachFaint,
                          border: `1.5px solid ${C.peach}`,
                          color: C.inkMid,
                          borderRadius: 50,
                          padding: "6px 18px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {pillText}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
