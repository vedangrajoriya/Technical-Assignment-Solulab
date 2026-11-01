import React from "react";
export type OrbitalSphereBackgroundProps = { className?: string; [key: string]: any };
export function OrbitalSphereBackground(props: OrbitalSphereBackgroundProps) {
  return <div className={`threeui-background ${props.className || ""}`} />;
}

