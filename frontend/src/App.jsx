import { useMemo, useState } from "react";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

const ingredientHints = [
  "Sugar",
  "Salt",
  "Butter",
  "Milk",
  "Whole wheat flour",
  "Maida",
  "Rice",
  "Olive oil",
  "Sunflower oil",
  "Peanut butter",
  "Egg",
  "Paneer",
  "Chicken breast",
  "Potato",
  "Onion",
  "Tomato",
  "Carrot",
  "Green peas",
  "Lentils",
  "Yogurt",
  "Oats",
  "Honey",
];

const nutrientRows = [
  { key: "energy_kcal", label: "Energy", unit: "kcal", dailyTarget: 2000 },
  { key: "protein_g", label: "Protein", unit: "g", dailyTarget: 50 },
  { key: "carbs_g", label: "Carbohydrates", unit: "g", dailyTarget: 300 },
  { key: "sugar_g", label: "of which Sugars", unit: "g", dailyTarget: 50 },
  { key: "fat_g", label: "Fat", unit: "g", dailyTarget: 70 },
  { key: "saturated_fat_g", label: "Saturated Fat", unit: "g", dailyTarget: 20 },
  { key: "sodium_mg", label: "Sodium", unit: "mg", dailyTarget: 2000 },
];

const starterIngredients = [
  { name: "Milk", quantity_g: "300" },
  { name: "Oats", quantity_g: "80" },
  { name: "Honey", quantity_g: "20" },
];

function formatNumber(value) {
  const numericValue = Number(value || 0);
  if (Number.isNaN(numericValue)) {
    return "0";
  }
  return numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function extractErrorMessage(errorPayload) {
  if (!errorPayload) {
    return "Something went wrong. Please try again.";
  }
  if (typeof errorPayload === "string") {
    return errorPayload.slice(0, 220);
  }
  if (typeof errorPayload.detail === "string") {
    return errorPayload.detail;
  }
  return "Request failed. Please verify your inputs.";
}

async function parseResponseBody(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return null;
  }
  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function App() {
  const [recipeName, setRecipeName] = useState("Morning Power Bowl");
  const [servings, setServings] = useState("3");
  const [ingredients, setIngredients] = useState(starterIngredients);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const servingWeight = useMemo(() => {
    if (!result) {
      return 0;
    }
    const numericServings = Number(servings || 0);
    if (!numericServings) {
      return 0;
    }
    return result.total_weight / numericServings;
  }, [result, servings]);

  const updateIngredient = (index, field, value) => {
    setIngredients((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", quantity_g: "" }]);
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const buildPayload = () => {
    const trimmedRecipeName = recipeName.trim();
    if (!trimmedRecipeName) {
      throw new Error("Recipe name is required.");
    }

    const servingsValue = Number(servings);
    if (!Number.isFinite(servingsValue) || servingsValue <= 0) {
      throw new Error("Servings must be greater than 0.");
    }

    const normalizedIngredients = ingredients.map((ingredient, index) => {
      const name = ingredient.name.trim();
      const quantity = Number(ingredient.quantity_g);
      if (!name) {
        throw new Error(`Ingredient ${index + 1} name is required.`);
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new Error(`Ingredient ${index + 1} quantity must be greater than 0.`);
      }
      return {
        name,
        quantity_g: quantity,
      };
    });

    if (normalizedIngredients.length === 0) {
      throw new Error("Add at least one ingredient.");
    }

    return {
      recipe_name: trimmedRecipeName,
      servings: servingsValue,
      ingredients: normalizedIngredients,
    };
  };

  const handleCalculate = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setResult(null);

    let payload;
    try {
      payload = buildPayload();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await parseResponseBody(response);
      if (!response.ok) {
        throw new Error(extractErrorMessage(data));
      }
      if (!data || typeof data !== "object") {
        throw new Error(
          "Backend returned empty/invalid JSON. Check that backend is running and API URL is correct."
        );
      }
      setResult(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to calculate nutrition.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDownloadPdf = async () => {
    setErrorMessage("");

    let payload;
    try {
      payload = buildPayload();
    } catch (error) {
      setErrorMessage(error.message);
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/generate-label`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await parseResponseBody(response);
        throw new Error(extractErrorMessage(errorPayload));
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      const safeName = payload.recipe_name.replace(/[^A-Za-z0-9_-]+/g, "_");
      link.download = `${safeName || "nutrition_label"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error.message || "Unable to generate PDF label.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <header className="topbar reveal">
        <div>
          <p className="kicker">Nutrition Intelligence</p>
          <h1>NutriTrack Studio</h1>
        </div>
        <p className="topbar-note">
          Smart recipe macros and FSSAI-style label generation in one flow.
        </p>
      </header>

      <main className="content-grid">
        <section className="card form-card reveal delay-1">
          <h2>Recipe Composer</h2>
          <p className="section-copy">
            Add ingredients with gram quantity, calculate nutrition instantly, then export a
            print-ready label.
          </p>

          <form onSubmit={handleCalculate} className="recipe-form">
            <div className="input-grid">
              <label>
                Recipe Name
                <input
                  type="text"
                  value={recipeName}
                  onChange={(event) => setRecipeName(event.target.value)}
                  placeholder="Ex: Protein Breakfast Mix"
                  maxLength={150}
                />
              </label>

              <label>
                Servings
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(event) => setServings(event.target.value)}
                />
              </label>
            </div>

            <div className="ingredient-block">
              <div className="ingredient-header">
                <h3>Ingredients</h3>
                <button type="button" className="chip-btn" onClick={addIngredient}>
                  + Add
                </button>
              </div>

              <datalist id="ingredient-hints">
                {ingredientHints.map((item) => (
                  <option value={item} key={item} />
                ))}
              </datalist>

              <div className="ingredient-list">
                {ingredients.map((ingredient, index) => (
                  <div className="ingredient-row" key={`${index}-${ingredient.name}`}>
                    <input
                      type="text"
                      list="ingredient-hints"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(index, "name", event.target.value)
                      }
                      placeholder="Ingredient name"
                    />
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={ingredient.quantity_g}
                      onChange={(event) =>
                        updateIngredient(index, "quantity_g", event.target.value)
                      }
                      placeholder="grams"
                    />
                    <button
                      type="button"
                      className="ghost-btn"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                      title="Remove ingredient"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-row">
              <button type="submit" className="primary-btn" disabled={isCalculating}>
                {isCalculating ? "Calculating..." : "Calculate Nutrition"}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
              >
                {isDownloading ? "Generating PDF..." : "Download Label PDF"}
              </button>
            </div>

            {errorMessage ? <p className="status error">{errorMessage}</p> : null}
          </form>
        </section>

        <section className="card insights-card reveal delay-2">
          <h2>Health Tracker View</h2>
          <p className="section-copy">
            Visualize per-serving impact against daily targets and inspect full nutrient data.
          </p>

          {!result ? (
            <div className="empty-state">
              <p>Run a calculation to view your nutrition dashboard.</p>
            </div>
          ) : (
            <>
              <div className="summary-strip">
                <div>
                  <span>Total Batch</span>
                  <strong>{formatNumber(result.total_weight)} g</strong>
                </div>
                <div>
                  <span>Per Serving Weight</span>
                  <strong>{formatNumber(servingWeight)} g</strong>
                </div>
                <div>
                  <span>Servings</span>
                  <strong>{formatNumber(servings)}</strong>
                </div>
              </div>

              <div className="tracker-grid">
                {nutrientRows.map((nutrient) => {
                  const value = Number(result.per_serving[nutrient.key] || 0);
                  const percentage = Math.min(
                    100,
                    Math.max(0, (value / nutrient.dailyTarget) * 100)
                  );
                  return (
                    <article className="tracker-card" key={nutrient.key}>
                      <header>
                        <h3>{nutrient.label}</h3>
                        <span>
                          {formatNumber(value)} {nutrient.unit}
                        </span>
                      </header>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${percentage}%` }} />
                      </div>
                      <p>
                        {formatNumber(percentage)}% of daily target ({nutrient.dailyTarget}{" "}
                        {nutrient.unit})
                      </p>
                    </article>
                  );
                })}
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nutrient</th>
                      <th>Per 100g</th>
                      <th>Per Serving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutrientRows.map((row) => (
                      <tr key={row.key}>
                        <td>{row.label}</td>
                        <td>
                          {formatNumber(result.per_100g[row.key])} {row.unit}
                        </td>
                        <td>
                          {formatNumber(result.per_serving[row.key])} {row.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
