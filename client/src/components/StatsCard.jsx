"use client";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  cardClass = "backdrop-blur-xl bg-white/5 border border-white/10",
  textClass = "text-white",
  color,
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl p-6 shadow-lg min-h-[160px] ${cardClass}`}
      style={{ borderColor: color, borderWidth: "1.5px" }}
    >
      {/* Title + Icon */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 flex items-center justify-center"
          style={{ color }}
        >
          {icon}
        </div>
        <p className={`${textClass} opacity-70 font-semibold text-sm flex-1`}>
          {title}
        </p>
      </div>

      {/* Value (supports text or JSX like charts) */}
      <div className={`${textClass} font-extrabold text-2xl mb-1`}>
        {typeof value === "string" || typeof value === "number" ? (
          value
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {value}
          </div>
        )}
      </div>

      {subtitle && (
        <p className={`${textClass} opacity-50 font-medium text-xs`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
