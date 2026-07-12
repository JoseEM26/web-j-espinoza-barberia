import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        gold: "border-gold-500/40 bg-gold-500/10 text-gold-200",
        success: "border-emerald-700/50 bg-emerald-950/40 text-emerald-300",
        warning: "border-amber-700/50 bg-amber-950/40 text-amber-300",
        destructive: "border-red-800/50 bg-red-950/40 text-red-300",
        outline: "border-surface-border text-foreground/70 bg-transparent",
        secondary: "border-surface-border bg-surface-2 text-foreground/80",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
