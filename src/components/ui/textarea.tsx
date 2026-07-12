import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-surface-border bg-surface-2/60 px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 shadow-sm transition-colors outline-none",
        "focus-visible:border-gold-400/70 focus-visible:ring-2 focus-visible:ring-gold-400/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
