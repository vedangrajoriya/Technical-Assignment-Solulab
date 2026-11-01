import * as THREE from "three";

export type StructureFlowOptions = { 
  speed: number; 
  pointSize: number; 
  opacity: number; 
  maskStart: number; 
  maskSolid: number;
};

export const STRUCTURE_FLOW_DEFAULTS: StructureFlowOptions = { 
  speed: 1, 
  pointSize: 0.08, 
  opacity: 0.4, 
  maskStart: 0.2, 
  maskSolid: 0.5 
};

// Color Palette generator for flowing plasma waves
const COLOR_PALETTE = [
  new THREE.Color(0x06b6d4), // Electric Cyan
  new THREE.Color(0x38bdf8), // Sky Blue
  new THREE.Color(0x2563eb), // Precision Cobalt
  new THREE.Color(0x8b5cf6), // Royal Purple
  new THREE.Color(0xf59e0b), // Molten Amber / Heat-treat Spec
  new THREE.Color(0x10b981), // Emerald Cleared
];

export function createStructureFlowRenderer(canvas: HTMLCanvasElement, getOptions: () => StructureFlowOptions) {
  const scene = new THREE.Scene();
  
  // Perspective Camera positioned to view both the outer flow and the vibrant central core
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.set(0, 3, 28);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- 1. DYNAMIC COLOR-FLOW STREAM (12,000 Particles) ---
  const flowCount = 12000;
  const flowGeometry = new THREE.BufferGeometry();
  const flowPositions = new Float32Array(flowCount * 3);
  const flowBasePositions = new Float32Array(flowCount * 3);
  const flowColors = new Float32Array(flowCount * 3);
  const flowPhases = new Float32Array(flowCount);

  const flowRadius = 24;

  for (let i = 0; i < flowCount; i++) {
    const u = Math.random();
    const theta = u * 2 * Math.PI;
    // Distribute with vertical continuity so particles flow through the midsection
    const v = Math.random();
    const phi = Math.acos(v * 0.85 + 0.1);

    // Height offset with gentle sine wave curve
    const waveOffset = Math.sin(theta * 3) * 2.5;
    const x = flowRadius * Math.sin(phi) * Math.cos(theta);
    const y = flowRadius * Math.cos(phi) - 10 + waveOffset;
    const z = flowRadius * Math.sin(phi) * Math.sin(theta);

    flowPositions[i * 3] = x;
    flowPositions[i * 3 + 1] = y;
    flowPositions[i * 3 + 2] = z;

    flowBasePositions[i * 3] = x;
    flowBasePositions[i * 3 + 1] = y;
    flowBasePositions[i * 3 + 2] = z;

    // Assign harmonic chromatic gradient along vertical and angular progression
    const colorIdx = Math.floor((u * 4 + v * 3) % COLOR_PALETTE.length);
    const nextIdx = (colorIdx + 1) % COLOR_PALETTE.length;
    const lerpFactor = (u * 4 + v * 3) % 1;
    const color = COLOR_PALETTE[colorIdx].clone().lerp(COLOR_PALETTE[nextIdx], lerpFactor);

    flowColors[i * 3] = color.r;
    flowColors[i * 3 + 1] = color.g;
    flowColors[i * 3 + 2] = color.b;

    flowPhases[i] = Math.random() * Math.PI * 2;
  }

  flowGeometry.setAttribute("position", new THREE.BufferAttribute(flowPositions, 3));
  flowGeometry.setAttribute("color", new THREE.BufferAttribute(flowColors, 3));

  const flowMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const flowParticles = new THREE.Points(flowGeometry, flowMaterial);
  scene.add(flowParticles);

  // --- 2. HYPNOTIC CENTRAL KINETIC CORE (Fills the center with vibrant life) ---
  const coreGroup = new THREE.Group();
  coreGroup.position.set(0, 1.5, 0);

  // A. Golden-Ratio Central Quantum Nucleus (2,000 dense luminous particles)
  const coreCount = 2000;
  const coreGeometry = new THREE.BufferGeometry();
  const corePositions = new Float32Array(coreCount * 3);
  const coreColors = new Float32Array(coreCount * 3);
  const coreRadius = 4.2;

  for (let i = 0; i < coreCount; i++) {
    const phi = Math.acos(1 - 2 * (i + 0.5) / coreCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = Math.cbrt(Math.random()) * coreRadius;

    corePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    corePositions[i * 3 + 1] = r * Math.cos(phi);
    corePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    // Warm radiant golden core with cyan perimeter
    const normR = r / coreRadius;
    const coreColor = new THREE.Color(0xf59e0b).lerp(new THREE.Color(0x06b6d4), normR * 0.9);
    coreColors[i * 3] = coreColor.r;
    coreColors[i * 3 + 1] = coreColor.g;
    coreColors[i * 3 + 2] = coreColor.b;
  }

  coreGeometry.setAttribute("position", new THREE.BufferAttribute(corePositions, 3));
  coreGeometry.setAttribute("color", new THREE.BufferAttribute(coreColors, 3));

  const coreMaterial = new THREE.PointsMaterial({
    size: 0.09,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const coreNucleus = new THREE.Points(coreGeometry, coreMaterial);
  coreGroup.add(coreNucleus);

  // B. Three Interlocking Gyroscopic Orbital Rings (Concentric Kinetic Rings)
  const ringMaterials = [
    new THREE.PointsMaterial({ size: 0.095, color: 0x06b6d4, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }),
    new THREE.PointsMaterial({ size: 0.095, color: 0x8b5cf6, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending }),
    new THREE.PointsMaterial({ size: 0.095, color: 0x38bdf8, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }),
  ];

  const ringRadii = [6.5, 8.2, 9.8];
  const orbitalRings: THREE.Points[] = [];

  ringRadii.forEach((radius, ringIdx) => {
    const ringCount = 600;
    const ringGeo = new THREE.BufferGeometry();
    const ringPos = new Float32Array(ringCount * 3);

    for (let i = 0; i < ringCount; i++) {
      const angle = (i / ringCount) * Math.PI * 2;
      const wobble = Math.sin(angle * 6) * 0.25;
      ringPos[i * 3] = Math.cos(angle) * (radius + wobble);
      ringPos[i * 3 + 1] = Math.sin(angle * 3) * 0.4;
      ringPos[i * 3 + 2] = Math.sin(angle) * (radius + wobble);
    }

    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
    const ring = new THREE.Points(ringGeo, ringMaterials[ringIdx]);
    
    // Initial distinct tilt angles for each ring
    ring.rotation.x = 0.4 + ringIdx * 0.6;
    ring.rotation.z = ringIdx * 0.8;
    
    coreGroup.add(ring);
    orbitalRings.push(ring);
  });

  scene.add(coreGroup);

  // --- 3. USER INTERACTIVITY: MOUSE TRACKING & VORTEX DISTORTION ---
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  const mouse3D = new THREE.Vector3(0, 0, 0);

  const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    targetMouse.x = (cx / rect.width) * 2 - 1;
    targetMouse.y = -(cy / rect.height) * 2 + 1;
  };

  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  let clock = new THREE.Clock();

  return {
    resize(width: number, height: number) {
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },

    render() {
      const options = getOptions();
      const elapsed = clock.getElapsedTime() * options.speed;

      // Smooth mouse interpolation (spring easing)
      mouse.x += (targetMouse.x - mouse.x) * 0.05;
      mouse.y += (targetMouse.y - mouse.y) * 0.05;

      // Dynamic 3D Camera Parallax (follows cursor gently)
      camera.position.x += (mouse.x * 4.5 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 2.8 + 3.0 - camera.position.y) * 0.04;
      camera.lookAt(0, 1.2, 0);

      // Project mouse coordinates into 3D space
      mouse3D.set(mouse.x * 14, mouse.y * 9 + 1.5, 4);

      // 1. Animate outer flow particles & apply mouse vortex distortion
      flowParticles.rotation.y += 0.0009 * options.speed;
      flowParticles.rotation.z += 0.0003 * options.speed;

      const posAttr = flowGeometry.attributes.position as THREE.BufferAttribute;
      const colorAttr = flowGeometry.attributes.color as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colorArray = colorAttr.array as Float32Array;

      // Wave pulsation and interactive ripple
      const repelDist = 6.0;
      for (let i = 0; i < flowCount; i += 2) { // optimize update step
        const i3 = i * 3;
        const bx = flowBasePositions[i3];
        const by = flowBasePositions[i3 + 1];
        const bz = flowBasePositions[i3 + 2];
        const phase = flowPhases[i];

        // Fluid harmonic undulation
        const waveY = Math.sin(elapsed * 1.5 + phase + bx * 0.2) * 0.8;
        const waveX = Math.cos(elapsed * 1.2 + phase + bz * 0.2) * 0.5;

        let curX = bx + waveX;
        let curY = by + waveY;
        let curZ = bz;

        // Interactive cursor repulsion / swirl
        const dx = curX - mouse3D.x;
        const dy = curY - mouse3D.y;
        const dz = curZ - mouse3D.z;
        const dSq = dx * dx + dy * dy + dz * dz;

        if (dSq < repelDist * repelDist) {
          const d = Math.sqrt(dSq);
          const force = (1.0 - d / repelDist) * 1.8;
          curX += (dx / (d + 0.1)) * force;
          curY += (dy / (d + 0.1)) * force;
          curZ += (dz / (d + 0.1)) * force;

          // Brighten color near cursor (chromatic response)
          colorArray[i3] = Math.min(1.0, colorArray[i3] + 0.04);
          colorArray[i3 + 1] = Math.min(1.0, colorArray[i3 + 1] + 0.06);
          colorArray[i3 + 2] = Math.min(1.0, colorArray[i3 + 2] + 0.08);
        }

        posArray[i3] = curX;
        posArray[i3 + 1] = curY;
        posArray[i3 + 2] = curZ;
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;

      // 2. Animate central core & gyroscopic rings
      const pulseScale = 1.0 + Math.sin(elapsed * 2.5) * 0.08;
      coreNucleus.scale.set(pulseScale, pulseScale, pulseScale);
      coreNucleus.rotation.y += 0.004 * options.speed;
      coreNucleus.rotation.x = Math.sin(elapsed * 0.8) * 0.15;

      // Rotate gyroscopic rings with staggered velocity
      if (orbitalRings[0]) {
        orbitalRings[0].rotation.y += 0.006 * options.speed;
        orbitalRings[0].rotation.x += 0.002 * options.speed;
      }
      if (orbitalRings[1]) {
        orbitalRings[1].rotation.z += 0.005 * options.speed;
        orbitalRings[1].rotation.y -= 0.003 * options.speed;
      }
      if (orbitalRings[2]) {
        orbitalRings[2].rotation.x -= 0.004 * options.speed;
        orbitalRings[2].rotation.z += 0.003 * options.speed;
      }

      // Tilt core towards mouse
      coreGroup.rotation.y = mouse.x * 0.4;
      coreGroup.rotation.x = -mouse.y * 0.3;

      // Apply dynamic size & opacity props
      flowMaterial.size = options.pointSize;
      flowMaterial.opacity = Math.min(1.0, options.opacity * 1.4);
      coreMaterial.size = options.pointSize * 1.15;

      renderer.render(scene, camera);
    },

    dispose() {
      window.removeEventListener("mousemove", handleMouseMove);
      flowGeometry.dispose();
      flowMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      orbitalRings.forEach(r => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      ringMaterials.forEach(m => m.dispose());
      scene.clear();
      renderer.dispose();
    },
  };
}
