"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "motion/react";
import { AmbientMotionProvider } from "./ambient-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MotionConfig reducedMotion="user">
        <AmbientMotionProvider>{children}</AmbientMotionProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
