from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _fmt(value: float) -> str:
    return f"{value:.2f}"


def generate_nutrition_label_pdf(
    recipe_name: str,
    servings: int,
    total_weight: float,
    per_100g: dict[str, float],
    per_serving: dict[str, float],
) -> bytes:
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        alignment=1,
        textColor=colors.black,
        spaceAfter=8,
    )
    meta_style = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.black,
    )

    table_data = [
        ["Nutrient", "Per 100g", "Per Serving"],
        ["Energy (kcal)", _fmt(per_100g["energy_kcal"]), _fmt(per_serving["energy_kcal"])],
        ["Protein (g)", _fmt(per_100g["protein_g"]), _fmt(per_serving["protein_g"])],
        ["Carbohydrates (g)", _fmt(per_100g["carbs_g"]), _fmt(per_serving["carbs_g"])],
        ["  of which Sugars (g)", _fmt(per_100g["sugar_g"]), _fmt(per_serving["sugar_g"])],
        ["Fat (g)", _fmt(per_100g["fat_g"]), _fmt(per_serving["fat_g"])],
        [
            "  Saturated Fat (g)",
            _fmt(per_100g["saturated_fat_g"]),
            _fmt(per_serving["saturated_fat_g"]),
        ],
        ["Sodium (mg)", _fmt(per_100g["sodium_mg"]), _fmt(per_serving["sodium_mg"])],
    ]

    table = Table(table_data, colWidths=[260, 110, 110])
    table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("ALIGN", (0, 0), (0, -1), "LEFT"),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BACKGROUND", (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
            ]
        )
    )

    content = [
        Paragraph("NUTRITION INFORMATION", title_style),
        Paragraph(f"Recipe: {recipe_name}", meta_style),
        Paragraph(f"Servings: {servings}", meta_style),
        Paragraph(f"Total batch weight: {total_weight:.2f} g", meta_style),
        Spacer(1, 12),
        table,
    ]

    document.build(content)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
