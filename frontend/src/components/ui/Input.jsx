import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Input = forwardRef(({ className, type = "text", icon: Icon, ...props }, ref) => {
  if (Icon) {
    return (
      <div className="relative">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
          <Icon size={16} />
        </div>
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] pl-10 pr-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
