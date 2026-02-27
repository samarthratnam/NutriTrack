import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { C, NUTRIENT_COLORS } from "../constants/theme";

/**
 * NutrientPie component.
 *
 * What it renders:
 * - A donut chart of recipe nutrient distribution for per-serving values.
 *
 * Props:
 * - data: per_serving object from backend response.
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Filters zero-value slices so chart stays readable.
 * - Uses donut style to match dashboard visual identity and leave center breathing room.
 */
export default function NutrientPie({ data }) {
  // Build chart data from required nutrients and drop zero entries.
  const pieData = [
    { name: "Protein", value: Number(data?.protein_g || 0) },
    { name: "Carbs", value: Number(data?.carbs_g || 0) },
    { name: "Sugar", value: Number(data?.sugar_g || 0) },
    { name: "Fat", value: Number(data?.fat_g || 0) },
    { name: "Sat. Fat", value: Number(data?.saturated_fat_g || 0) },
  ].filter((item) => item.value > 0);

  return (
    <div style={{ width: "100%", height: 270 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={48}
            paddingAngle={3}
            stroke="none"
          >
            {pieData.map((_, index) => (
              <Cell key={`nutrient-slice-${index}`} fill={NUTRIENT_COLORS[index % NUTRIENT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} g`, name]}
            contentStyle={{
              background: C.creamLight,
              border: `1.5px solid ${C.border}`,
              borderRadius: 10,
              color: C.ink,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
            }}
          />
          <Legend
            wrapperStyle={{
              color: C.inkMid,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
