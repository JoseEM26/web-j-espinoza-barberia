import { cn } from "@/lib/utils";

export function Logo({
  className,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={cn(
        "font-display italic font-semibold text-2xl sm:text-3xl tracking-tight text-primary select-none inline-block leading-tight",
        className,
      )}
    >
      Jota Espinoza
    </span>
  );
}
