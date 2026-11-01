import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

export function StructureFlowScene() {
  return (
    <div className="shader-frame absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      <StructureFlowCollection
        variant="structure-flow"
        speed={1.00}
        pointSize={0.095}
        opacity={0.65}
        maskStart={0.05}
        maskSolid={0.25}
      />
    </div>
  );
}
