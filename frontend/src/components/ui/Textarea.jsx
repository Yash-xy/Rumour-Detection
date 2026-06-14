import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const Textarea = forwardRef(({ className, onChange, ...props }, ref) => {
  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    if (onChange) onChange(e);
  };

  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] max-h-[500px] overflow-y-auto w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] resize-none transition-shadow duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onChange={handleInput}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
