import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-10", className)}>
      <div className="absolute inset-0 rounded-full border border-gold-100/10" />
      <div
        className="absolute inset-0 animate-spin rounded-full [animation-duration:1.1s]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 55%, var(--gold-300) 88%, var(--gold-100) 100%)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
        }}
      />
    </div>
  );
}
