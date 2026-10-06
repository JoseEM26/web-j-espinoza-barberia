"use client";

import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#FAF7F3]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(217, 185, 155, 0.25), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-6"
      >
        <span className="font-display italic font-semibold text-3xl sm:text-4xl tracking-tight text-primary select-none">
          Jota Espinoza
        </span>

        <div className="relative size-12">
          {/* resplandor de fondo */}
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" />

          {/* anillo estático tenue */}
          <div className="absolute inset-0 rounded-full border border-border" />

          {/* anillo animado */}
          <div
            className="absolute inset-0 animate-spin rounded-full [animation-duration:1.1s]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--sand) 90%, var(--primary) 100%)",
              WebkitMaskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 2.5px), black calc(100% - 2.5px))",
              maskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 2.5px), black calc(100% - 2.5px))",
            }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-sm italic tracking-[0.06em] text-muted"
        >
          Preparando tu experiencia…
        </motion.p>
      </motion.div>
    </div>
  );
}
