import { C, inputStyle } from "../constants/theme";

/**
 * IngredientRow component.
 *
 * What it renders:
 * - One editable row with ingredient name, quantity in grams, and remove action.
 *
 * Props:
 * - idx (number): position index for display label.
 * - item ({name: string, quantity_g: string|number}): current row data.
 * - onChange (function): callback(index, key, value) when input changes.
 * - onRemove (function): callback(index) when remove button is clicked.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Keeps row self-contained so Calculator stays focused on orchestration logic.
 * - Uses fixed 3-column layout requested for consistent editing rhythm.
 */
export default function IngredientRow({ idx, item, onChange, onRemove }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 110px 38px",
        gap: 10,
        alignItems: "center",
        background: C.cream,
        borderRadius: 12,
        padding: "10px 14px",
        border: `1.5px solid ${C.peachFaint}`,
        animation: "fadeInLeft 0.3s ease both",
      }}
    >
      {/* Ingredient name input allows free text matching backend ingredient list. */}
      <input
        type="text"
        placeholder={`Ingredient ${idx + 1} (e.g. Sugar)`}
        value={item.name}
        onChange={(event) => onChange(idx, "name", event.target.value)}
        style={inputStyle}
      />

      {/* Quantity input is numeric and centered to improve quick scanability. */}
      <input
        type="number"
        min={0}
        placeholder="grams"
        value={item.quantity_g}
        onChange={(event) => onChange(idx, "quantity_g", event.target.value)}
        style={{ ...inputStyle, textAlign: "center" }}
      />

      {/* Remove action remains compact to preserve grid width even with many rows. */}
      <button
        type="button"
        onClick={() => onRemove(idx)}
        style={{
          background: `${C.orange}14`,
          border: `1.5px solid ${C.orange}44`,
          color: C.orange,
          borderRadius: 8,
          width: 38,
          height: 38,
          cursor: "pointer",
          fontSize: 18,
          lineHeight: 1,
          transition: "background .2s",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.background = `${C.orange}28`;
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.background = `${C.orange}14`;
        }}
      >
        ×
      </button>
    </div>
  );
}
