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


class HealthBarMetric(BaseModel):
    key: str
    label: str
    unit: str
    value: float
    reference_value: float
    percent_of_reference: float
    status: str
    guidance: str


class RecipeAdjustment(BaseModel):
    nutrient_key: str
    nutrient_label: str
    current_value: float
    reference_value: float
    unit: str
    percent_of_reference: float
    recommendation: str
    top_contributors: list[str] = Field(default_factory=list)


class FssaiSuggestion(BaseModel):
    cut_down: list[RecipeAdjustment] = Field(default_factory=list)
    add_up: list[RecipeAdjustment] = Field(default_factory=list)
    note: str


class AllergySuggestion(BaseModel):
    allergen: str
    detected_ingredients: list[str]
    alternatives: list[str] = Field(default_factory=list)
    advice: str


class FssaiRuleCheck(BaseModel):
    rule_id: str
    title: str
    description: str
    status: str
    observation: str


class FssaiComplianceReport(BaseModel):
    is_fssai_aligned: bool
    status: str
    warning_count: int
    warning_banner: str
    legal_note: str
    risk_note: str
    warnings: list[str] = Field(default_factory=list)
    rulebook: list[FssaiRuleCheck] = Field(default_factory=list)


class CalculationResponse(BaseModel):
    per_100g: NutritionInfo
    per_serving: NutritionInfo
    total_weight: float
    health_bars: list[HealthBarMetric] = Field(default_factory=list)
    fssai_suggestions: FssaiSuggestion
    allergy_alerts: list[AllergySuggestion] = Field(default_factory=list)
    fssai_compliance: FssaiComplianceReport
