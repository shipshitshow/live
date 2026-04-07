"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface TimeSeriesChartProps<T extends { day: string } = { day: string }> {
  data: T[];
  dataKey: string;
  color?: string;
  formatValue?: (v: number) => string;
  formatTick?: (v: number) => string;
}

function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <div className="text-text-secondary mb-0.5">
        {label ? format(parseISO(label), "MMM d") : ""}
      </div>
      <div className="text-text-primary font-semibold">
        {formatValue ? formatValue(value) : value.toLocaleString()}
      </div>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  dataKey,
  color = "#ff2d20",
  formatValue,
  formatTick,
}: TimeSeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
        <XAxis
          dataKey="day"
          tickFormatter={(v: string) => format(parseISO(v), "MMM d")}
          tick={{ fill: "#606060", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#606060", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatTick ?? ((v: number) => v.toLocaleString())}
          width={52}
        />
        <Tooltip
          content={<CustomTooltip formatValue={formatValue} />}
          cursor={{ stroke: "#2a2a2a", strokeWidth: 1 }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
