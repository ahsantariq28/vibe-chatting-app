"use client";

interface LoaderProps {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "blue" | "white" | "slate";
}

export default function Loader({ size = "md", color = "blue" }: LoaderProps) {
  const sizeClasses = {
    xs: "w-3.5 h-3.5 border-2",
    sm: "w-4.5 h-4.5 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  const colorClasses = {
    blue: "border-slate-700 border-t-blue-500",
    white: "border-white/20 border-t-white",
    slate: "border-slate-800 border-t-slate-400",
  };

  return (
    <div
      className={`animate-spin rounded-full border-solid ${sizeClasses[size]} ${colorClasses[color]}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
