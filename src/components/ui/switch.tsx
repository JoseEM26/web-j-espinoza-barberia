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
        "peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border bg-sand-light transition-colors outline-none cursor-pointer",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-white shadow-xs transition-transform translate-x-0.5",
          "data-[state=checked]:translate-x-[18px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
