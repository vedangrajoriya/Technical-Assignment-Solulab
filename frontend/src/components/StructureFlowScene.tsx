import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function StructureFlowScene() {
  return (
    <div className="shader-frame absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <StructureFlowCollection
        variant="structure-flow"
        speed={1.00}
        pointSize={0.080}
        opacity={0.40}
        maskStart={0.20}
        maskSolid={0.50}
      />
    </div>
  );
}
