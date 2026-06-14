import { cn } from "../../lib/cn";

const sizes = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export function Spinner({ size = "md", className, label, inline = false }) {
  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-primary-500/30 border-t-primary-400",
        sizes[size] || sizes.md,
        inline && "inline-block",
        className
      )}
    />
  );

  if (inline) return spinner;

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      {spinner}
      {label && (
        <p className="text-sm text-[var(--text-muted)] animate-pulse">{label}</p>
      )}
    </div>
  );
}
