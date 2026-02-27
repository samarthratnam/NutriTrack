import re
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse

from calculator import IngredientNotFoundError, calculate_nutrition
from database import init_db
from label_generator import generate_nutrition_label_pdf
from models import CalculationResponse, RecipeRequest
from seed_data import seed_ingredients

BACKEND_DIR = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = BACKEND_DIR.parent / "frontend" / "dist"

app = FastAPI(
    title="Automated Nutrition Label Generator API",
    version="1.0.0",
    description="FastAPI backend for calculating recipe nutrition and generating FSSAI-style labels.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()
    seed_ingredients()


@app.get("/health")
@app.get("/api/health", include_in_schema=False)
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/calculate", response_model=CalculationResponse)
@app.post(
    "/api/calculate", response_model=CalculationResponse, include_in_schema=False
)
def calculate(recipe: RecipeRequest) -> CalculationResponse:
    try:
        result = calculate_nutrition(recipe)
        return CalculationResponse(**result)
    except IngredientNotFoundError as exc:
        missing = ", ".join(exc.missing_ingredients)
        raise HTTPException(
            status_code=404, detail=f"Ingredient(s) not found: {missing}"
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Unable to calculate nutrition for this recipe."
        ) from exc


@app.post("/generate-label")
@app.post("/api/generate-label", include_in_schema=False)
def generate_label(recipe: RecipeRequest) -> StreamingResponse:
    try:
        result = calculate_nutrition(recipe)
    except IngredientNotFoundError as exc:
        missing = ", ".join(exc.missing_ingredients)
        raise HTTPException(
            status_code=404, detail=f"Ingredient(s) not found: {missing}"
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Unable to calculate nutrition for this recipe."
        ) from exc

    try:
        pdf_bytes = generate_nutrition_label_pdf(
            recipe_name=recipe.recipe_name,
            servings=recipe.servings,
            total_weight=result["total_weight"],
            per_100g=result["per_100g"],
            per_serving=result["per_serving"],
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Unable to generate nutrition label PDF."
        ) from exc

    safe_name = re.sub(r"[^A-Za-z0-9_-]+", "_", recipe.recipe_name).strip("_")
    filename = f"{safe_name or 'nutrition_label'}.pdf"

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def _frontend_ready() -> bool:
    return FRONTEND_DIST_DIR.exists() and (FRONTEND_DIST_DIR / "index.html").exists()


@app.get("/", include_in_schema=False)
def serve_frontend_root():
    if _frontend_ready():
        return FileResponse(FRONTEND_DIST_DIR / "index.html")
    return {
        "message": "Frontend build not found. Run `npm run build` in the frontend folder.",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/{file_path:path}", include_in_schema=False)
def serve_frontend_spa(file_path: str):
    protected_paths = (
        "api/",
        "calculate",
        "generate-label",
        "health",
        "docs",
        "redoc",
        "openapi.json",
    )
    if file_path in {"api", "calculate", "generate-label", "health"} or file_path.startswith(
        protected_paths
    ):
        raise HTTPException(status_code=404, detail="Not Found")

    if not _frontend_ready():
        raise HTTPException(status_code=404, detail="Not Found")

    target = FRONTEND_DIST_DIR / file_path
    if target.exists() and target.is_file():
        return FileResponse(target)
    return FileResponse(FRONTEND_DIST_DIR / "index.html")
