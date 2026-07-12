"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-surface-border bg-surface-2 transition-colors outline-none",
        "data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-gold-300 data-[state=checked]:to-gold-500 data-[state=checked]:border-gold-400",
        "focus-visible:ring-2 focus-visible:ring-gold-400/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-foreground shadow-sm transition-transform translate-x-0.5",
          "data-[state=checked]:translate-x-[18px] data-[state=checked]:bg-[#1a1206]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
