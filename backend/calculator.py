from typing import Any

from database import get_connection
from models import RecipeRequest


NUTRIENT_FIELDS = (
    "energy_kcal",
    "protein_g",
    "carbs_g",
    "sugar_g",
    "fat_g",
    "saturated_fat_g",
    "sodium_mg",
)


class IngredientNotFoundError(Exception):
    def __init__(self, missing_ingredients: list[str]) -> None:
        self.missing_ingredients = missing_ingredients
        message = "Ingredient(s) not found: " + ", ".join(missing_ingredients)
        super().__init__(message)


def _round_nutrients(data: dict[str, float]) -> dict[str, float]:
    return {key: round(value, 2) for key, value in data.items()}


def _fetch_ingredient_map(ingredient_names: list[str]) -> dict[str, dict[str, Any]]:
    placeholders = ",".join(["?"] * len(ingredient_names))
    query = f"""
        SELECT
            name,
            energy_kcal,
            protein_g,
            carbs_g,
            sugar_g,
            fat_g,
            saturated_fat_g,
            sodium_mg
        FROM ingredients
        WHERE LOWER(name) IN ({placeholders})
    """

    lowered_names = [name.lower() for name in ingredient_names]
    with get_connection() as connection:
        rows = connection.execute(query, lowered_names).fetchall()

    return {row["name"].strip().lower(): dict(row) for row in rows}


def calculate_nutrition(recipe: RecipeRequest) -> dict[str, Any]:
    ingredient_names = [item.name.strip() for item in recipe.ingredients]
    ingredient_map = _fetch_ingredient_map(ingredient_names)

    missing = [name for name in ingredient_names if name.lower() not in ingredient_map]
    if missing:
        raise IngredientNotFoundError(sorted(set(missing)))

    totals = {field: 0.0 for field in NUTRIENT_FIELDS}
    total_weight = 0.0

    for item in recipe.ingredients:
        key = item.name.strip().lower()
        per_100g_values = ingredient_map[key]
        quantity_factor = item.quantity_g / 100.0
        total_weight += item.quantity_g

        for field in NUTRIENT_FIELDS:
            totals[field] += per_100g_values[field] * quantity_factor

    if total_weight <= 0:
        raise ValueError("Total recipe weight must be greater than zero.")

    per_100g = {
        field: (totals[field] / total_weight) * 100.0 for field in NUTRIENT_FIELDS
    }
    per_serving = {field: totals[field] / recipe.servings for field in NUTRIENT_FIELDS}

    return {
        "per_100g": _round_nutrients(per_100g),
        "per_serving": _round_nutrients(per_serving),
        "total_weight": round(total_weight, 2),
    }
