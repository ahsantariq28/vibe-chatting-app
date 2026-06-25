"use client";

interface PresenceIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
}

export default function PresenceIndicator({
  isOnline,
  size = "md",
}: PresenceIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span
      className={`${sizeClasses[size]} rounded-full ${
        isOnline ? "bg-green-500" : "bg-gray-400"
      } border-2 border-slate-800`}
    />
  );
}
