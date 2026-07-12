"use client";

import { motion } from "framer-motion";

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(211,165,63,0.14), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center gap-6"
      >
        <div className="relative size-24 sm:size-28">
          {/* resplandor de fondo */}
          <div className="absolute inset-0 rounded-full bg-gold-500/10 blur-xl" />

          {/* anillo estático tenue */}
          <div className="absolute inset-0 rounded-full border border-gold-100/10" />

          {/* anillo animado (degradado tipo cometa) */}
          <div
            className="absolute inset-0 animate-spin rounded-full [animation-duration:1.1s]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, transparent 60%, var(--gold-400) 90%, var(--gold-100) 100%)",
              WebkitMaskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              maskImage:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="font-elegant text-base italic tracking-[0.08em] text-gold-200/70"
        >
          Preparando tu experiencia…
        </motion.p>
      </motion.div>
    </div>
  );
}
