"use client";

import { Canvas } from "@react-three/fiber";
import type { ProductVisualKind, ServiceVisualKind } from "@/lib/data";
import { useThreeColors, type ThreeColors } from "@/lib/useThreeColors";
import { TalentGeo, HrmsGeo, CrmGeo } from "./Products3D";
import { AgentsGeo, GenAIGeo, CopilotsGeo, AutomationGeo, GovernanceGeo, MLOpsGeo } from "./Services3D";

export type CardVisualKind = ProductVisualKind | ServiceVisualKind;

// AI Talent Recruit and AI CRM ship as one merged product — show both
// funnels side by side, scaled down, in a single shared scene.
function TalentCrmGeo({ colors }: { colors: ThreeColors }) {
  return (
    <>
      <group position={[-1.7, 0.2, 0]} scale={0.56}>
        <TalentGeo colors={colors} />
      </group>
      <group position={[1.7, -0.1, 0]} scale={0.56}>
        <CrmGeo colors={colors} />
      </group>
    </>
  );
}

function Stage({ kind, colors }: { kind: CardVisualKind; colors: ThreeColors }) {
  if (kind === "talent-crm") return <TalentCrmGeo colors={colors} />;
  if (kind === "talent") return <TalentGeo colors={colors} />;
  if (kind === "hrms") return <HrmsGeo colors={colors} />;
  if (kind === "crm") return <CrmGeo colors={colors} />;
  if (kind === "agents") return <AgentsGeo colors={colors} />;
  if (kind === "genai") return <GenAIGeo colors={colors} />;
  if (kind === "copilots") return <CopilotsGeo colors={colors} />;
  if (kind === "automation") return <AutomationGeo colors={colors} />;
  if (kind === "governance") return <GovernanceGeo colors={colors} />;
  return <MLOpsGeo colors={colors} />;
}

// A small, always-on 3D preview meant to live inside a card — no controls,
// no fog, no shadows, capped dpr, since several of these render at once.
export default function CardScene({ kind }: { kind: CardVisualKind }) {
  const colors = useThreeColors();

  return (
    <Canvas camera={{ position: [0, 1.2, 7], fov: 42 }} dpr={1} style={{ width: "100%", height: "100%" }}>
      <color attach="background" args={[colors.pg2]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <pointLight position={[-4, -1, -2]} intensity={0.6} color={colors.acc} />
      <Stage kind={kind} colors={colors} />
    </Canvas>
  );
}
