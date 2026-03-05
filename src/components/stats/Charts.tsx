import React from "react";
import { motion } from "framer-motion";

interface DonutChartProps {
  completed: number;
  total: number;
  title?: string;
  size?: "sm" | "md" | "lg";
}

export const DonutChart: React.FC<DonutChartProps> = ({
  completed,
  total,
  title = "Dzisiaj",
  size = "md",
}) => {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Color based on completion percentage
  let color = "#ef4444"; // red
  if (percent >= 100)
    color = "#22c55e"; // green
  else if (percent >= 50) color = "#f97316"; // orange

  const sizes = {
    sm: "w-24 h-24",
    md: "w-32 h-32",
    lg: "w-40 h-40",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizes[size]}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 120 120"
        >
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold text-center ${textSizes[size]}`}>
            {completed}/{total}
          </div>
          <div className={`text-muted-foreground ${textSizes[size]}`}>
            {percent}%
          </div>
        </div>
      </div>

      {title && (
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {title}
        </p>
      )}
    </div>
  );
};

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    max?: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  title,
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((d) => d.max || d.value), 1);

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <div
        style={{ height, display: "flex", alignItems: "flex-end", gap: "8px" }}
      >
        {data.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex-1 flex flex-col items-center"
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
          >
            <motion.div
              className="w-full rounded-t bg-primary transition-colors hover:bg-primary/80"
              style={{
                backgroundColor: item.color || "#3b82f6",
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: "4px",
              }}
              whileHover={{ opacity: 0.8 }}
            />
            <div className="text-xs font-medium mt-2 text-muted-foreground">
              {item.label}
            </div>
            <div className="text-xs font-bold">{item.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

interface HeatmapProps {
  data: Array<{
    day: number;
    date: string;
    dayOfWeek?: string;
    intensity: number; // 0-4 scale
    percentComplete?: number;
  }>;
  columns?: number;
  cellSize?: number;
}

export const HeatmapGrid: React.FC<HeatmapProps> = ({
  data,
  columns = 7,
  cellSize = 32,
}) => {
  const getColor = (intensity: number) => {
    const colors = [
      "bg-muted-foreground/10",
      "bg-green-200 dark:bg-green-900/40",
      "bg-green-400 dark:bg-green-700/60",
      "bg-green-600 dark:bg-green-600",
      "bg-green-800 dark:bg-green-500",
    ];
    return colors[Math.min(intensity, 4)];
  };

  const weekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="inline-grid gap-1"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        }}
      >
        {data.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.1 }}
            title={`${item.date}: ${item.percentComplete || 0}%`}
            className={`${getColor(item.intensity)} rounded cursor-pointer transition-colors border border-transparent hover:border-foreground/20`}
            style={{
              width: cellSize,
              height: cellSize,
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  title?: string;
  height?: number;
}

export const SimpleLineChart: React.FC<LineChartProps> = ({
  data,
  title,
  height = 150,
}) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, idx) => ({
    x: (idx / (data.length - 1 || 1)) * 100,
    y: 100 - (d.value / maxValue) * 100,
  }));

  const pathData = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="w-full">
      {title && <h3 className="font-semibold mb-4">{title}</h3>}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ height }}
      >
        {/* Grid lines */}
        <line
          x1="0"
          y1="25"
          x2="100"
          y2="25"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />
        <line
          x1="0"
          y1="50"
          x2="100"
          y2="50"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />
        <line
          x1="0"
          y1="75"
          x2="100"
          y2="75"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />

        {/* Area under line */}
        <path
          d={`${pathData} L 100 100 L 0 100 Z`}
          fill="#3b82f6"
          opacity="0.1"
        />

        {/* Line */}
        <path
          d={pathData}
          stroke="#3b82f6"
          strokeWidth="1.5"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />

        {/* Points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="0.5"
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        {data.length <= 7 ? (
          data.map((d, idx) => (
            <div
              key={idx}
              style={{ width: `${100 / data.length}%` }}
              className="text-center"
            >
              {d.label}
            </div>
          ))
        ) : (
          <>
            <span>{data[0]?.label}</span>
            <span>{data[Math.floor(data.length / 2)]?.label}</span>
            <span>{data[data.length - 1]?.label}</span>
          </>
        )}
      </div>
    </div>
  );
};

interface ProgressRingProps {
  current: number;
  max: number;
  label?: string;
  size?: number;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  current,
  max,
  label,
  size = 80,
}) => {
  const circumference = 2 * Math.PI * (size / 2 - 4);
  const progress = Math.min(100, (current / max) * 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-muted-foreground/20"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-bold">{progress.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">
              {current}/{max}
            </div>
          </div>
        </div>
      </div>
      {label && <p className="text-xs text-muted-foreground mt-2">{label}</p>}
    </div>
  );
};
