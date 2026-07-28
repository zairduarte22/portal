"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={"light" as ToasterProps["theme"]}
      className="toaster group !z-[9999]"
      style={
        {
          "--normal-bg": "var(--popover, #fff)",
          "--normal-text": "var(--popover-foreground, #000)",
          "--normal-border": "var(--border, #e2e8f0)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
