# Automated Nutrition Label Generator (FSSAI Style)

A full-stack app with:

- FastAPI backend for nutrition calculation and PDF label generation
- React frontend with a modern health-tracker style dashboard

## What this project does

- Stores nutrition values **per 100g** for common ingredients in SQLite.
- Accepts a recipe (ingredients + quantity in grams + servings).
- Computes:
  - total nutrients for full recipe
  - nutrition **per 100g**
  - nutrition **per serving**
- Generates a downloadable PDF label titled **NUTRITION INFORMATION**.
- Handles missing ingredients with clear error messages.
- Enables CORS for frontend integration.
- Provides an aesthetic frontend to compose recipes, visualize per-serving targets, and download labels.

## Tech stack

- FastAPI
- SQLite (`nutrition.db`)
- ReportLab (PDF generation)
- Pydantic (request/response validation)
- React + Vite (frontend UI)

## Project structure

```text
frontend/
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.jsx
    |-- main.jsx
    `-- styles.css

backend/
|-- main.py              # FastAPI app, routes, startup init, CORS
|-- database.py          # SQLite connection and table creation
|-- models.py            # Pydantic schemas
|-- calculator.py        # Nutrition calculation engine
|-- label_generator.py   # PDF label generation
|-- seed_data.py         # Ingredient seed data (38 items)
`-- requirements.txt     # Python dependencies
```

## Database design

Table: `ingredients`

- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE, case-insensitive)
- `energy_kcal` (REAL)
- `protein_g` (REAL)
- `carbs_g` (REAL)
- `sugar_g` (REAL)
- `fat_g` (REAL)
- `saturated_fat_g` (REAL)
- `sodium_mg` (REAL)

All values are stored per 100g.

## Calculation logic

For each ingredient:

```text
actual_nutrient = (nutrient_per_100g * quantity_g) / 100
```

Then:

```text
per_100g = (total_nutrient / total_weight_g) * 100
per_serving = total_nutrient / servings
```

Values are rounded to 2 decimals in API output.

## API endpoints

### 1) Health check

- `GET /health`
- `GET /api/health` (frontend-friendly alias)
- Response:

```json
{
  "status": "ok"
}
```

### 2) Calculate nutrition

- `POST /calculate`
- `POST /api/calculate` (frontend-friendly alias)
- Request body:

```json
{
  "recipe_name": "Sweet Milk",
  "servings": 5,
  "ingredients": [
    { "name": "Sugar", "quantity_g": 100 },
    { "name": "Milk", "quantity_g": 500 }
  ]
}
```

- Response:

```json
{
  "per_100g": {
    "energy_kcal": 115.33,
    "protein_g": 2.63,
    "carbs_g": 20.67,
    "sugar_g": 20.88,
    "fat_g": 2.71,
    "saturated_fat_g": 1.55,
    "sodium_mg": 36.0
  },
  "per_serving": {
    "energy_kcal": 138.4,
    "protein_g": 3.16,
    "carbs_g": 24.8,
    "sugar_g": 25.06,
    "fat_g": 3.25,
    "saturated_fat_g": 1.86,
    "sodium_mg": 43.2
  },
  "total_weight": 600.0
}
```

### 3) Generate nutrition label PDF

- `POST /generate-label`
- `POST /api/generate-label` (frontend-friendly alias)
- Request body: same as `/calculate`
- Response: PDF file download (`application/pdf`) with filename based on `recipe_name`.

PDF rows include:

- Energy (kcal)
- Protein (g)
- Carbohydrates (g)
- of which Sugars (g)
- Fat (g)
- Saturated Fat (g)
- Sodium (mg)

## Error handling

- Unknown ingredient(s): `404`
  - Example detail: `Ingredient(s) not found: XYZ`
- Unexpected internal errors in calculation/PDF generation: `500`

## Seed data

On app startup, DB table is initialized and seed data is inserted/updated automatically.

- Current seed count: **38 ingredients**
- Includes: Sugar, Salt, Butter, Milk, Whole wheat flour, Maida, Rice, Olive oil, Sunflower oil, Peanut butter, Egg, Paneer, Chicken breast, Potato, Onion, Tomato, and more.

You can also run seed directly:

```bash
cd backend
python seed_data.py
```

## How to run backend

1. Open terminal in project root:

```bash
cd backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start server:

```bash
uvicorn main:app --reload
```

API docs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## How to run frontend

Open a second terminal from project root:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://127.0.0.1:5173`

Backend API URL used by frontend:

- default: `/api` (Vite proxy sends this to backend during local dev)
- optional override via `frontend/.env`:

```bash
VITE_API_BASE_URL=/api
```

## Run as one combined app (single URL)

Build frontend once, then let FastAPI serve it:

```bash
cd frontend
npm install
npm run build

cd ..\\backend
uvicorn main:app --reload
```

Now open:

- `http://127.0.0.1:8000` for frontend + backend together
- Frontend requests go to `/api/*` on the same server

## Notes for frontend integration

- CORS is enabled for all origins (`*`) to simplify local frontend development.
- Send ingredient names matching seeded names (case-insensitive matching is supported).
