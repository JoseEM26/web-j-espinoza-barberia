import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-10", className)}>
      <div className="absolute inset-0 rounded-full border border-border" />
      <div
        className="absolute inset-0 animate-spin rounded-full [animation-duration:1.1s]"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0%, transparent 55%, var(--sand) 85%, var(--primary) 100%)",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
        }}
      />
    </div>
  );
}
