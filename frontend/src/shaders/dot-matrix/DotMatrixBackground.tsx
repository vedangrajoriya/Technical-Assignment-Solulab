import React from "react";
export type DotMatrixBackgroundProps = { className?: string; [key: string]: any };
export function DotMatrixBackground(props: DotMatrixBackgroundProps) {
  return <div className={`threeui-background ${props.className || ""}`} />;
}

