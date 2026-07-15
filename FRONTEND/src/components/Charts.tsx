import React from "react";

interface BarChartProps {
  data: Record<string, number>;
  theme: "light" | "dark";
  title: string;
}

export const ThemeAwareBarChart: React.FC<BarChartProps> = ({ data, theme, title }) => {
  const keys = Object.keys(data);
  const values = Object.values(data) as number[];
  const maxValue = Math.max(...values, 1);

  const isDark = theme === "dark";
  const barColor = isDark ? "#38bdf8" : "#0284c7"; // sky-400 vs sky-600
  const textColor = isDark ? "#94a3b8" : "#475569"; // slate-400 vs slate-600
  const gridColor = isDark ? "#334155" : "#e2e8f0"; // slate-700 vs slate-200

  return (
    <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"} h-full flex flex-col`}>
      <h4 className={`text-sm font-semibold mb-4 tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {title}
      </h4>

      {keys.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          No data available
        </div>
      ) : (
        <div className="flex-1 flex items-end gap-3 h-48 pt-4">
          {keys.map((key) => {
            const value = data[key] || 0;
            const heightPercent = (value / maxValue) * 100;

            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-10 font-mono">
                  {value}
                </div>

                <div className="w-full relative rounded-t-sm overflow-hidden" style={{ height: `${heightPercent}%` }}>
                  <div 
                    className="w-full h-full transition-all duration-500 origin-bottom"
                    style={{ backgroundColor: barColor }}
                  />
                </div>
                <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: textColor }}>
                  {key}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface DoughnutChartProps {
  data: Record<string, number>;
  theme: "light" | "dark";
  title: string;
}

export const ThemeAwareDoughnutChart: React.FC<DoughnutChartProps> = ({ data, theme, title }) => {
  const isDark = theme === "dark";
  const keys = Object.keys(data);
  const values = Object.values(data) as number[];
  const total = values.reduce((sum, val) => sum + val, 0);

  // Elegant colors
  const colors = isDark 
    ? ["#38bdf8", "#818cf8", "#fb7185", "#34d399", "#fbbf24", "#a78bfa"] 
    : ["#0284c7", "#4f46e5", "#f43f5e", "#10b981", "#d97706", "#7c3aed"];

  let cumulativeAngle = 0;

  return (
    <div className={`p-5 rounded-xl border ${isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"} h-full flex flex-col`}>
      <h4 className={`text-sm font-semibold mb-4 tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {title}
      </h4>

      {keys.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
          No data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              {keys.map((key, i) => {
                const value = (data[key] as number) || 0;
                const percentage = total > 0 ? (value / total) * 100 : 0;
                if (percentage === 0) return null;

                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = 100 - cumulativeAngle + 25; // start from top (12 o'clock)
                cumulativeAngle += percentage;

                return (
                  <circle
                    key={key}
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={colors[i % colors.length]}
                    strokeWidth="3.5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                  />
                );
              })}
              <circle
                cx="18"
                cy="18"
                r="12.5"
                fill={isDark ? "#0b1329" : "#ffffff"} // match card bg
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-[10px] uppercase font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>Total</span>
              <span className={`text-lg font-bold font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>{total}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-1.5 w-full">
            {keys.map((key, i) => {
              const value = (data[key] as number) || 0;
              const pct = total > 0 ? ((value / total) * 100).toFixed(0) : "0";
              return (
                <div key={key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
                    <span className={`font-medium truncate ${isDark ? "text-slate-300" : "text-slate-600"}`}>{key}</span>
                  </div>
                  <span className={`font-mono text-[11px] ml-2 flex-shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {value} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
