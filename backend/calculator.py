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

NUTRIENT_LABELS = {
    "energy_kcal": "Energy",
    "protein_g": "Protein",
    "carbs_g": "Carbohydrates",
    "sugar_g": "Sugar",
    "fat_g": "Fat",
    "saturated_fat_g": "Saturated Fat",
    "sodium_mg": "Sodium",
}

NUTRIENT_UNITS = {
    "energy_kcal": "kcal",
    "protein_g": "g",
    "carbs_g": "g",
    "sugar_g": "g",
    "fat_g": "g",
    "saturated_fat_g": "g",
    "sodium_mg": "mg",
}

# FSSAI reference values used on nutrition labels.
# Source: Food Safety and Standards (Labelling and Display) Regulations.
FSSAI_REFERENCE_VALUES = {
    "energy_kcal": 2000.0,
    "fat_g": 67.0,
    "saturated_fat_g": 22.0,
    "sugar_g": 50.0,  # Added sugar reference; total sugar is used as a practical proxy.
    "sodium_mg": 2000.0,
}

PROTEIN_REFERENCE_VALUE = 50.0
LIMIT_WARNING_PERCENT = 25.0
LIMIT_FAIL_PERCENT = 35.0

HEALTH_BAR_CONFIG = (
    ("energy_kcal", FSSAI_REFERENCE_VALUES["energy_kcal"], "limit"),
    ("protein_g", PROTEIN_REFERENCE_VALUE, "minimum"),
    ("sugar_g", FSSAI_REFERENCE_VALUES["sugar_g"], "limit"),
    ("fat_g", FSSAI_REFERENCE_VALUES["fat_g"], "limit"),
    ("saturated_fat_g", FSSAI_REFERENCE_VALUES["saturated_fat_g"], "limit"),
    ("sodium_mg", FSSAI_REFERENCE_VALUES["sodium_mg"], "limit"),
)

ALLERGEN_RULES = (
    {
        "allergen": "Milk and milk products",
        "ingredients": {"milk", "paneer", "yogurt", "butter", "ghee"},
        "alternatives": ["Coconut milk", "Olive oil", "Sunflower oil"],
        "advice": "For dairy allergy/intolerance, replace milk solids and butter fat with plant-based options.",
    },
    {
        "allergen": "Eggs",
        "ingredients": {"egg"},
        "alternatives": ["Yogurt", "Moong dal", "Chickpeas"],
        "advice": "For egg allergy, use legume- or dairy-based binders depending on the recipe style.",
    },
    {
        "allergen": "Peanuts",
        "ingredients": {"peanut butter"},
        "alternatives": ["Almonds", "Cashews", "Chickpeas"],
        "advice": "Peanut allergy can be severe. Avoid peanut ingredients and use safer protein/fat substitutes.",
    },
    {
        "allergen": "Tree nuts",
        "ingredients": {"almonds", "cashews"},
        "alternatives": ["Oats", "Chickpeas", "Lentils"],
        "advice": "When nut allergy is present, swap nuts with non-nut protein sources.",
    },
    {
        "allergen": "Cereals containing gluten",
        "ingredients": {"whole wheat flour", "maida", "oats"},
        "alternatives": ["Rice", "Chickpeas", "Lentils"],
        "advice": "If gluten sensitivity is a concern, switch to naturally gluten-free grain/legume bases.",
    },
)

VEGETABLE_INGREDIENTS = {"spinach", "tomato", "carrot", "cabbage", "onion", "green peas"}
PROTEIN_BOOST_OPTIONS = [
    "Lentils",
    "Moong dal",
    "Chickpeas",
    "Egg",
    "Chicken breast",
    "Paneer",
    "Yogurt",
]


class IngredientNotFoundError(Exception):
    def __init__(self, missing_ingredients: list[str]) -> None:
        self.missing_ingredients = missing_ingredients
        message = "Ingredient(s) not found: " + ", ".join(missing_ingredients)
        super().__init__(message)


def _round_nutrients(data: dict[str, float]) -> dict[str, float]:
    return {key: round(value, 2) for key, value in data.items()}


def _percent_of_reference(value: float, reference: float) -> float:
    if reference <= 0:
        return 0.0
    return (value / reference) * 100.0


def _status_for_metric(percent: float, direction: str) -> str:
    if direction == "minimum":
        if percent < 20:
            return "low"
        if percent < 35:
            return "watch"
        return "good"

    if percent >= 35:
        return "high"
    if percent >= 20:
        return "watch"
    return "good"


def _guidance_for_metric(key: str, status: str, direction: str) -> str:
    if key == "protein_g" and direction == "minimum":
        if status == "low":
            return "Very low protein per serving. Add a protein source."
        if status == "watch":
            return "Protein is moderate. Consider a stronger protein base."
        return "Protein contribution is in a good range."

    if status == "high":
        return "High for one serving. Consider reducing this in the recipe."
    if status == "watch":
        return "Moderate for one serving. Keep portions in check."
    return "Within a comfortable per-serving range."


def _top_contributors(
    ingredient_contributions: list[dict[str, Any]],
    nutrient_key: str,
    servings: int,
    limit: int = 3,
) -> list[str]:
    ranked: list[tuple[str, float]] = []
    for entry in ingredient_contributions:
        per_serving_value = entry["nutrients"][nutrient_key] / servings
        if per_serving_value <= 0:
            continue
        ranked.append((entry["name"], per_serving_value))

    ranked.sort(key=lambda item: item[1], reverse=True)
    unit = NUTRIENT_UNITS[nutrient_key]
    return [
        f"{name} ({round(value, 2)} {unit}/serving)"
        for name, value in ranked[:limit]
    ]


def _build_health_bars(per_serving: dict[str, float]) -> list[dict[str, Any]]:
    health_bars: list[dict[str, Any]] = []
    for key, reference, direction in HEALTH_BAR_CONFIG:
        value = per_serving[key]
        percent = _percent_of_reference(value, reference)
        status = _status_for_metric(percent, direction)
        health_bars.append(
            {
                "key": key,
                "label": NUTRIENT_LABELS[key],
                "unit": NUTRIENT_UNITS[key],
                "value": round(value, 2),
                "reference_value": round(reference, 2),
                "percent_of_reference": round(percent, 2),
                "status": status,
                "guidance": _guidance_for_metric(key, status, direction),
            }
        )
    return health_bars


def _build_cut_down_suggestions(
    per_serving: dict[str, float],
    ingredient_contributions: list[dict[str, Any]],
    servings: int,
) -> list[dict[str, Any]]:
    recommendation_map = {
        "sugar_g": "Reduce added sweeteners (for example sugar/honey/jaggery) or reduce portion size.",
        "fat_g": "Lower added fats or replace part of the fat source with vegetables/pulses.",
        "saturated_fat_g": "Swap butter/ghee/coconut oil with oils lower in saturated fat where possible.",
        "sodium_mg": "Cut added salt and salty spreads; improve flavor using herbs/spices.",
        "energy_kcal": "Reduce calorie-dense ingredients and increase lower-calorie whole-food ingredients.",
    }

    cut_down: list[dict[str, Any]] = []
    for key, reference in FSSAI_REFERENCE_VALUES.items():
        value = per_serving[key]
        percent = _percent_of_reference(value, reference)
        if percent < 25:
            continue

        cut_down.append(
            {
                "nutrient_key": key,
                "nutrient_label": NUTRIENT_LABELS[key],
                "current_value": round(value, 2),
                "reference_value": round(reference, 2),
                "unit": NUTRIENT_UNITS[key],
                "percent_of_reference": round(percent, 2),
                "recommendation": recommendation_map[key],
                "top_contributors": _top_contributors(
                    ingredient_contributions=ingredient_contributions,
                    nutrient_key=key,
                    servings=servings,
                ),
            }
        )

    return cut_down


def _build_add_up_suggestions(
    per_serving: dict[str, float], ingredient_names: list[str]
) -> list[dict[str, Any]]:
    add_up: list[dict[str, Any]] = []
    lowered_recipe_ingredients = {name.lower() for name in ingredient_names}

    protein_percent = _percent_of_reference(
        per_serving["protein_g"], PROTEIN_REFERENCE_VALUE
    )
    if protein_percent < 20:
        candidate_additions = [
            item for item in PROTEIN_BOOST_OPTIONS if item.lower() not in lowered_recipe_ingredients
        ][:3]
        add_up.append(
            {
                "nutrient_key": "protein_g",
                "nutrient_label": "Protein",
                "current_value": round(per_serving["protein_g"], 2),
                "reference_value": round(PROTEIN_REFERENCE_VALUE, 2),
                "unit": "g",
                "percent_of_reference": round(protein_percent, 2),
                "recommendation": "Protein is low per serving. Add a stronger protein ingredient.",
                "top_contributors": candidate_additions,
            }
        )

    has_vegetable = any(name.lower() in VEGETABLE_INGREDIENTS for name in ingredient_names)
    if not has_vegetable:
        add_up.append(
            {
                "nutrient_key": "vegetable_balance",
                "nutrient_label": "Vegetable Balance",
                "current_value": 0.0,
                "reference_value": 1.0,
                "unit": "recipe",
                "percent_of_reference": 0.0,
                "recommendation": "Add at least one vegetable ingredient to improve micronutrient balance.",
                "top_contributors": ["Spinach", "Carrot", "Tomato"],
            }
        )

    return add_up


def _build_fssai_suggestions(
    per_serving: dict[str, float],
    ingredient_contributions: list[dict[str, Any]],
    servings: int,
    ingredient_names: list[str],
) -> dict[str, Any]:
    return {
        "cut_down": _build_cut_down_suggestions(
            per_serving=per_serving,
            ingredient_contributions=ingredient_contributions,
            servings=servings,
        ),
        "add_up": _build_add_up_suggestions(
            per_serving=per_serving,
            ingredient_names=ingredient_names,
        ),
        "note": (
            "FSSAI label reference values used: Energy 2000 kcal, Fat 67 g, "
            "Saturated Fat 22 g, Added Sugar 50 g, Sodium 2000 mg."
        ),
    }


def _build_allergy_alerts(ingredient_names: list[str]) -> list[dict[str, Any]]:
    lowered_to_original = {name.lower(): name for name in ingredient_names}
    lowered_recipe_ingredients = set(lowered_to_original.keys())
    allergy_alerts: list[dict[str, Any]] = []

    for rule in ALLERGEN_RULES:
        detected = sorted(rule["ingredients"] & lowered_recipe_ingredients)
        if not detected:
            continue

        alternatives = [
            option
            for option in rule["alternatives"]
            if option.lower() not in lowered_recipe_ingredients
        ][:3]

        allergy_alerts.append(
            {
                "allergen": rule["allergen"],
                "detected_ingredients": [
                    lowered_to_original[ingredient] for ingredient in detected
                ],
                "alternatives": alternatives,
                "advice": rule["advice"],
            }
        )

    return allergy_alerts


def _limit_status(percent_of_reference: float) -> str:
    if percent_of_reference > LIMIT_FAIL_PERCENT:
        return "fail"
    if percent_of_reference > LIMIT_WARNING_PERCENT:
        return "warn"
    return "pass"


def _protein_status(percent_of_reference: float) -> str:
    if percent_of_reference < 10:
        return "fail"
    if percent_of_reference < 20:
        return "warn"
    return "pass"


def _build_fssai_compliance(
    per_serving: dict[str, float],
    total_weight: float,
    allergy_alerts: list[dict[str, Any]],
) -> dict[str, Any]:
    rulebook: list[dict[str, Any]] = []
    warnings: list[str] = []

    mandatory_fields_present = all(field in per_serving for field in NUTRIENT_FIELDS)
    rulebook.append(
        {
            "rule_id": "FSSAI-R1",
            "title": "Mandatory nutrition fields",
            "description": "Energy, protein, carbs, sugar, fat, saturated fat and sodium should be declared on label.",
            "status": "pass" if mandatory_fields_present else "fail",
            "observation": (
                "All mandatory nutrient values are available in output."
                if mandatory_fields_present
                else "One or more mandatory nutrient values are missing."
            ),
        }
    )
    if not mandatory_fields_present:
        warnings.append("Mandatory nutrient declarations are incomplete.")

    serving_rule_ok = total_weight > 0
    rulebook.append(
        {
            "rule_id": "FSSAI-R2",
            "title": "Recipe weight and serving validity",
            "description": "Total recipe weight and serving-based calculations must be valid for nutrition declaration.",
            "status": "pass" if serving_rule_ok else "fail",
            "observation": (
                f"Total batch weight is {round(total_weight, 2)} g."
                if serving_rule_ok
                else "Total batch weight is invalid."
            ),
        }
    )
    if not serving_rule_ok:
        warnings.append("Recipe weight/serving values are invalid for compliant labeling.")

    limit_rules = (
        ("FSSAI-R3", "Sugar load per serving", "sugar_g"),
        ("FSSAI-R4", "Saturated fat load per serving", "saturated_fat_g"),
        ("FSSAI-R5", "Sodium load per serving", "sodium_mg"),
        ("FSSAI-R6", "Energy load per serving", "energy_kcal"),
    )
    for rule_id, title, nutrient_key in limit_rules:
        reference = FSSAI_REFERENCE_VALUES[nutrient_key]
        value = per_serving[nutrient_key]
        percent = _percent_of_reference(value, reference)
        status = _limit_status(percent)
        rulebook.append(
            {
                "rule_id": rule_id,
                "title": title,
                "description": (
                    f"Prefer keeping {NUTRIENT_LABELS[nutrient_key].lower()} at or below "
                    f"{LIMIT_WARNING_PERCENT}% of reference value per serving."
                ),
                "status": status,
                "observation": (
                    f"{round(value, 2)} {NUTRIENT_UNITS[nutrient_key]} per serving "
                    f"({round(percent, 2)}% of reference)."
                ),
            }
        )
        if status == "fail":
            warnings.append(
                f"{NUTRIENT_LABELS[nutrient_key]} is very high per serving ({round(percent, 2)}% of reference)."
            )
        elif status == "warn":
            warnings.append(
                f"{NUTRIENT_LABELS[nutrient_key]} is moderately high per serving ({round(percent, 2)}% of reference)."
            )

    protein_percent = _percent_of_reference(
        per_serving["protein_g"], PROTEIN_REFERENCE_VALUE
    )
    protein_rule_status = _protein_status(protein_percent)
    rulebook.append(
        {
            "rule_id": "FSSAI-R7",
            "title": "Protein adequacy for balanced profile",
            "description": "Protein should be meaningful per serving for a better nutrition profile.",
            "status": protein_rule_status,
            "observation": (
                f"{round(per_serving['protein_g'], 2)} g per serving "
                f"({round(protein_percent, 2)}% of 50 g reference)."
            ),
        }
    )
    if protein_rule_status == "fail":
        warnings.append("Protein is very low per serving; improve recipe balance.")
    elif protein_rule_status == "warn":
        warnings.append("Protein is on the lower side per serving.")

    allergen_detected = len(allergy_alerts) > 0
    detected_allergen_names = ", ".join(
        alert["allergen"] for alert in allergy_alerts
    )
    rulebook.append(
        {
            "rule_id": "FSSAI-R8",
            "title": "Allergen declaration readiness",
            "description": "When common allergens are present, declaration on packaging should be explicit.",
            "status": "warn" if allergen_detected else "pass",
            "observation": (
                f"Common allergen groups detected: {detected_allergen_names}."
                if allergen_detected
                else "No common allergen groups detected in this recipe."
            ),
        }
    )
    if allergen_detected:
        warnings.append(
            "Allergen declaration will be required on packaging for this recipe."
        )

    fail_count = sum(1 for rule in rulebook if rule["status"] == "fail")
    warn_count = sum(1 for rule in rulebook if rule["status"] == "warn")

    if fail_count > 0:
        status = "not_aligned"
        is_fssai_aligned = False
        warning_banner = (
            "This recipe is currently NOT ready for FSSAI-friendly label positioning."
        )
    elif warn_count > 0:
        status = "caution"
        is_fssai_aligned = False
        warning_banner = (
            "This recipe is close, but has caution points before claiming strong FSSAI-ready compliance."
        )
    else:
        status = "aligned"
        is_fssai_aligned = True
        warning_banner = (
            "This recipe looks aligned with the in-app FSSAI rulebook checks."
        )

    return {
        "is_fssai_aligned": is_fssai_aligned,
        "status": status,
        "warning_count": len(warnings),
        "warning_banner": warning_banner,
        "legal_note": (
            "This checker is an educational screening tool, not a legal certification."
        ),
        "risk_note": (
            "Incorrect or misleading packaged food labels may lead to product rejection and "
            "can attract regulatory penalties/fines under applicable food safety law."
        ),
        "warnings": warnings,
        "rulebook": rulebook,
    }


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
    ingredient_contributions: list[dict[str, Any]] = []

    for item in recipe.ingredients:
        key = item.name.strip().lower()
        per_100g_values = ingredient_map[key]
        quantity_factor = item.quantity_g / 100.0
        total_weight += item.quantity_g

        nutrient_contribution = {}
        for field in NUTRIENT_FIELDS:
            contribution_value = per_100g_values[field] * quantity_factor
            totals[field] += contribution_value
            nutrient_contribution[field] = contribution_value

        ingredient_contributions.append(
            {
                "name": item.name.strip(),
                "quantity_g": item.quantity_g,
                "nutrients": nutrient_contribution,
            }
        )

    if total_weight <= 0:
        raise ValueError("Total recipe weight must be greater than zero.")

    per_100g = {
        field: (totals[field] / total_weight) * 100.0 for field in NUTRIENT_FIELDS
    }
    per_serving = {field: totals[field] / recipe.servings for field in NUTRIENT_FIELDS}
    health_bars = _build_health_bars(per_serving=per_serving)
    fssai_suggestions = _build_fssai_suggestions(
        per_serving=per_serving,
        ingredient_contributions=ingredient_contributions,
        servings=recipe.servings,
        ingredient_names=ingredient_names,
    )
    allergy_alerts = _build_allergy_alerts(ingredient_names=ingredient_names)
    fssai_compliance = _build_fssai_compliance(
        per_serving=per_serving,
        total_weight=total_weight,
        allergy_alerts=allergy_alerts,
    )

    return {
        "per_100g": _round_nutrients(per_100g),
        "per_serving": _round_nutrients(per_serving),
        "total_weight": round(total_weight, 2),
        "health_bars": health_bars,
        "fssai_suggestions": fssai_suggestions,
        "allergy_alerts": allergy_alerts,
        "fssai_compliance": fssai_compliance,
    }
