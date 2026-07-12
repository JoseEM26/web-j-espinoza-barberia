import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt="JEspinoza Barbershop"
      width={858}
      height={473}
      priority={priority}
      className={cn("w-full h-auto select-none", className)}
    />
  );
}
