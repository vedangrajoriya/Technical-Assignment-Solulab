import React from "react";
export type EmeraldHorizonBackgroundProps = { className?: string; [key: string]: any };
export function EmeraldHorizonBackground(props: EmeraldHorizonBackgroundProps) {
  return <div className={`threeui-background ${props.className || ""}`} />;
}

