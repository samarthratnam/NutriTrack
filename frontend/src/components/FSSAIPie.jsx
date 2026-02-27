import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { C } from "../constants/theme";

/**
 * FSSAIPie component.
 *
 * What it renders:
 * - Donut chart that summarizes rulebook pass/warn/fail counts.
 *
 * Props:
 * - result: full calculate response object (used for compliance rulebook access).
 *
 * API calls:
 * - None.
 *
 * Key design decisions:
 * - Uses count-based slices so compliance status can be understood in one glance.
 * - Falls back to a single pass slice when no rules are available to avoid empty-chart UX.
 */
export default function FSSAIPie({ result }) {
  const rules = result?.fssai_compliance?.rulebook || [];
  const counts = { pass: 0, warn: 0, fail: 0 };

  // Aggregate statuses from backend rulebook list.
  rules.forEach((rule) => {
    if (rule?.status === "pass" || rule?.status === "warn" || rule?.status === "fail") {
      counts[rule.status] += 1;
    }
  });

  // Empty rulebook still renders as "pass" so chart component has at least one slice.
  if (rules.length === 0) {
    counts.pass = 1;
  }

  const pieData = [
    { name: "Pass", value: counts.pass, color: C.sageDark },
    { name: "Warning", value: counts.warn, color: C.peach },
    { name: "Fail", value: counts.fail, color: C.orange },
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
            {pieData.map((entry, index) => (
              <Cell key={`fssai-slice-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
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
