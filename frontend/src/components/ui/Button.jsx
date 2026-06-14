import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ring-offset)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white shadow-lg shadow-primary-600/25 hover:bg-primary-500 hover:shadow-xl hover:shadow-primary-500/30",
        destructive:
          "bg-danger-500 text-white shadow-lg shadow-danger-500/25 hover:bg-danger-600",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--text)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)]",
        secondary:
          "bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg-muted)]",
        ghost:
          "text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text)]",
        link:
          "text-primary-400 underline-offset-4 hover:underline",
        success:
          "bg-success-500 text-white shadow-lg shadow-success-500/25 hover:bg-success-600",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-xs rounded-md",
        lg: "h-12 px-8 text-base rounded-xl",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
