import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text)]",
        destructive:
          "bg-danger-500/10 border-danger-500/20 text-danger-400",
        success:
          "bg-success-500/10 border-success-500/20 text-success-400",
        warning:
          "bg-warning-500/10 border-warning-500/20 text-warning-400",
        info:
          "bg-primary-500/10 border-primary-500/20 text-primary-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({ className, variant, children, ...props }) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Alert, alertVariants };
