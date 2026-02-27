from pydantic import BaseModel, Field, field_validator


class IngredientInput(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    quantity_g: float = Field(..., gt=0, description="Quantity of ingredient in grams")

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Ingredient name cannot be empty.")
        return normalized


class RecipeRequest(BaseModel):
    recipe_name: str = Field(..., min_length=1, max_length=150)
    servings: int = Field(..., gt=0)
    ingredients: list[IngredientInput] = Field(..., min_length=1)

    @field_validator("recipe_name")
    @classmethod
    def normalize_recipe_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Recipe name cannot be empty.")
        return normalized


class NutritionInfo(BaseModel):
    energy_kcal: float
    protein_g: float
    carbs_g: float
    sugar_g: float
    fat_g: float
    saturated_fat_g: float
    sodium_mg: float


class CalculationResponse(BaseModel):
    per_100g: NutritionInfo
    per_serving: NutritionInfo
    total_weight: float
