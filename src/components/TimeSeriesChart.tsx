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

export interface ChartLine {
  dataKey: string;
  color: string;
  label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TimeSeriesChartProps {
  data: any[];
  dataKey: string;
  color?: string;
  formatValue?: (v: number) => string;
  formatTick?: (v: number) => string;
  /** Additional lines to overlay (for multi-channel "All" view) */
  lines?: ChartLine[];
}

function CustomTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number; stroke: string; name: string }>;
  label?: string;
  formatValue?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-elevated border border-surface-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <div className="text-text-secondary mb-1">
        {label ? format(parseISO(label), "MMM d") : ""}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.stroke }}
          />
          <span className="text-text-primary font-semibold">
            {formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TimeSeriesChart({
  data,
  dataKey,
  color = "#ff2d20",
  formatValue,
  formatTick,
  lines,
}: TimeSeriesChartProps) {
  // If lines are provided, render multiple lines; otherwise single line
  const renderLines = lines && lines.length > 0;

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
        {renderLines ? (
          lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.label}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: line.color, strokeWidth: 0 }}
            />
          ))
        ) : (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
