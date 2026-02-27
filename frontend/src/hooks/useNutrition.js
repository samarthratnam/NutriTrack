import { useState } from "react";

/**
 * Custom hook that owns the full nutrition workflow state.
 *
 * What this hook manages:
 * - Recipe form state (name, servings, ingredient rows).
 * - Result state from the /api/calculate endpoint.
 * - Loading, download-loading, and error states.
 * - All mutations for ingredient rows.
 *
 * API calls:
 * - POST /api/calculate
 * - POST /api/generate-label
 *
 * Why this design:
 * - Keeps Calculator component focused on rendering.
 * - Makes side effects (network + blob download) easier to test and reason about.
 */
export default function useNutrition(apiBase) {
  const [recipeName, setRecipeName] = useState("");
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity_g: "" },
    { name: "", quantity_g: "" },
  ]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dlLoading, setDlLoading] = useState(false);

  /**
   * Adds one empty ingredient row.
   * This keeps ingredient entry flexible for any recipe size.
   */
  const addRow = () => {
    setIngredients((previous) => [...previous, { name: "", quantity_g: "" }]);
  };

  /**
   * Removes an ingredient row by index.
   * Small recipes can be trimmed quickly without resetting the form.
   */
  const removeRow = (index) => {
    setIngredients((previous) => previous.filter((_, i) => i !== index));
  };

  /**
   * Updates any single field on one ingredient row.
   * This avoids creating per-field handlers for each input.
   */
  const changeRow = (index, key, value) => {
    setIngredients((previous) =>
      previous.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  /**
   * Internal helper to normalize and validate ingredient rows.
   * Required behavior:
   * - Filters out empty names.
   * - Filters out rows with quantity <= 0.
   */
  const normalizedIngredients = () =>
    ingredients
      .map((row) => ({
        name: row.name.trim(),
        quantity_g: Number(row.quantity_g),
      }))
      .filter(
        (row) => row.name.length > 0 && Number.isFinite(row.quantity_g) && row.quantity_g > 0
      );

  /**
   * Reads a potentially JSON response body and extracts human-readable detail.
   * This guards against non-JSON backend errors and keeps error banners useful.
   */
  const extractError = async (response, fallbackMessage) => {
    try {
      const raw = await response.text();
      if (!raw) {
        return fallbackMessage;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed?.detail === "string") {
        return parsed.detail;
      }
      return fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  /**
   * Calls /api/calculate with validated payload and stores result for rendering.
   */
  const calculate = async () => {
    setError(null);
    setResult(null);

    const validIngredients = normalizedIngredients();
    if (validIngredients.length === 0) {
      setError("Add at least one ingredient with a quantity greater than 0.");
      return;
    }

    const servingsValue = Number(servings);
    if (!Number.isFinite(servingsValue) || servingsValue <= 0) {
      setError("Servings must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_name: recipeName.trim() || "My Recipe",
          servings: servingsValue,
          ingredients: validIngredients,
        }),
      });

      if (!response.ok) {
        throw new Error(await extractError(response, "Calculation failed."));
      }

      const payload = await response.json();
      setResult(payload);
    } catch (caughtError) {
      setError(caughtError.message || "Calculation failed.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calls /api/generate-label and triggers browser file download for the returned PDF blob.
   */
  const downloadPDF = async () => {
    setError(null);

    const validIngredients = normalizedIngredients();
    if (validIngredients.length === 0) {
      setError("Add at least one ingredient with a quantity greater than 0.");
      return;
    }

    const servingsValue = Number(servings);
    if (!Number.isFinite(servingsValue) || servingsValue <= 0) {
      setError("Servings must be greater than 0.");
      return;
    }

    setDlLoading(true);
    try {
      const response = await fetch(`${apiBase}/generate-label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipe_name: recipeName.trim() || "My Recipe",
          servings: servingsValue,
          ingredients: validIngredients,
        }),
      });

      if (!response.ok) {
        throw new Error(await extractError(response, "PDF generation failed."));
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const safeName = (recipeName.trim() || "nutrition_label").replace(/[^A-Za-z0-9_-]+/g, "_");

      anchor.href = objectURL;
      anchor.download = `${safeName}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectURL);
    } catch (caughtError) {
      setError(caughtError.message || "PDF generation failed.");
    } finally {
      setDlLoading(false);
    }
  };

  return {
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
  };
}
