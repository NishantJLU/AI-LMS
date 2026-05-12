"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { week: "W1", focus: 42, mastery: 38 },
  { week: "W2", focus: 55, mastery: 44 },
  { week: "W3", focus: 48, mastery: 52 },
  { week: "W4", focus: 62, mastery: 58 },
  { week: "W5", focus: 71, mastery: 64 },
  { week: "W6", focus: 68, mastery: 72 },
];

export function LearningMomentumChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gFocus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.65 0.2 264)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="oklch(0.65 0.2 264)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 8" className="stroke-border/50" />
        <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid oklch(0.35 0.02 260 / 40%)",
            background: "oklch(0.18 0.02 260)",
          }}
        />
        <Area
          type="monotone"
          dataKey="focus"
          stroke="oklch(0.65 0.2 264)"
          fill="url(#gFocus)"
          strokeWidth={2}
          name="Focus time"
        />
        <Area
          type="monotone"
          dataKey="mastery"
          stroke="oklch(0.75 0.12 175)"
          fill="transparent"
          strokeWidth={2}
          name="Mastery"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
