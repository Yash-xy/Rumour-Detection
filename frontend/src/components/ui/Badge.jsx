import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-primary-500/15 text-primary-400 border border-primary-500/20",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border)]",
        destructive:
          "bg-danger-500/15 text-danger-400 border border-danger-500/20",
        success:
          "bg-success-500/15 text-success-400 border border-success-500/20",
        warning:
          "bg-warning-500/15 text-warning-400 border border-warning-500/20",
        outline:
          "border border-[var(--border)] text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
