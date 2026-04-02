import React, { useEffect, useMemo, useState } from "react";

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  tone,
  loading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  const numericValue = useMemo(() => {
    if (typeof value === "number") return value;
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [value]);

  useEffect(() => {
    if (loading) return;

    let frameId;
    const duration = 700;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplayValue(Math.round(numericValue * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [numericValue, loading]);

  if (loading) {
    return (
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <div className="mb-4 h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
        <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="mb-2 h-7 w-20 animate-pulse rounded bg-slate-300" />
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
      </article>
    );
  }

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ${tone}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900">{displayValue}</p>
      <p className="mt-2 text-xs font-semibold text-emerald-600">{subtext}</p>
    </article>
  );
};

export default StatCard;
