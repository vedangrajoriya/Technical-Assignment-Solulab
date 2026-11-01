import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

interface BeanData {
  mesh: THREE.Mesh;
  initialPos: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  baseScale: number;
}

export const LoginBeansAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x080c14 : 0xedf2f7, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 16);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x223344 : 0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, isDark ? 2.5 : 1.8);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const mouseLight = new THREE.PointLight(0x06b6d4, isDark ? 4.0 : 2.5, 18);
    mouseLight.position.set(0, 0, 8);
    scene.add(mouseLight);

    const warmLight = new THREE.PointLight(0xf59e0b, isDark ? 2.5 : 1.5, 20);
    warmLight.position.set(-10, -8, 6);
    scene.add(warmLight);

    // 4. Bean Geometries & Metallic Materials
    // A capsule/bean geometry
    const beanGeo = new THREE.CapsuleGeometry(0.32, 0.65, 8, 16);

    const materials = [
      // Electric Cyan Bean
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        metalness: 0.85,
        roughness: 0.2,
      }),
      // Deep Precision Cobalt
      new THREE.MeshStandardMaterial({
        color: 0x2563eb,
        metalness: 0.9,
        roughness: 0.25,
      }),
      // Molten Amber / Heat Treated Spec
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.18,
      }),
      // Polished Chrome / Steel Pinion Alloy
      new THREE.MeshStandardMaterial({
        color: isDark ? 0xe2e8f0 : 0x94a3b8,
        metalness: 0.95,
        roughness: 0.12,
      }),
      // Emerald QA Cleared
      new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.82,
        roughness: 0.22,
      }),
      // Purple EDI Spec
      new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        metalness: 0.85,
        roughness: 0.2,
      })
    ];

    // 5. Spawn 160 Floating Interactive Beans
    const beanCount = 170;
    const beans: BeanData[] = [];

    for (let i = 0; i < beanCount; i++) {
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(beanGeo, mat);

      // Random distribution across a 3D volume
      const spreadX = 22;
      const spreadY = 14;
      const spreadZ = 10;

      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * spreadZ;

      mesh.position.set(x, y, z);
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const scale = 0.55 + Math.random() * 0.75;
      mesh.scale.set(scale, scale, scale);

      scene.add(mesh);

      beans.push({
        mesh,
        initialPos: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        baseScale: scale
      });
    }

    // 6. Interactive Mouse Tracking & Scatter Physics
    const mouse = new THREE.Vector2(-999, -999);
    const mouse3D = new THREE.Vector3(0, 0, 0);

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = (clientX / container.clientWidth) * 2 - 1;
      mouse.y = -(clientY / container.clientHeight) * 2 + 1;

      // Project mouse to z=0 in 3D world coords
      mouse3D.set(mouse.x * 10, mouse.y * 6.5, 2);
      mouseLight.position.set(mouse.x * 12, mouse.y * 8, 4);
    };

    window.addEventListener('mousemove', onMouseMove);

    // 7. Animation Loop with Scatter & Gravitational Recovery
    let reqId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Soft camera sway
      camera.position.x = Math.sin(elapsedTime * 0.25) * 0.8;
      camera.position.y = Math.cos(elapsedTime * 0.3) * 0.5;
      camera.lookAt(0, 0, 0);

      // Update all beans
      for (let i = 0; i < beans.length; i++) {
        const bean = beans[i];
        const m = bean.mesh;

        // Gentle floating harmonic oscillation
        const harmonicX = Math.sin(elapsedTime * 0.8 + i) * 0.005;
        const harmonicY = Math.cos(elapsedTime * 0.7 + i * 2) * 0.005;
        const harmonicZ = Math.sin(elapsedTime * 0.5 + i * 0.5) * 0.005;

        // Vector from mouse to bean
        const dx = m.position.x - mouse3D.x;
        const dy = m.position.y - mouse3D.y;
        const dz = m.position.z - mouse3D.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const dist = Math.sqrt(distSq);

        // Interactive SCATTER REPEL FORCE (Beans fly away when cursor approaches)
        const repelRadius = 5.5;
        if (dist < repelRadius && dist > 0.01) {
          const repelForce = (1.0 - dist / repelRadius) * 0.12;
          bean.velocity.x += (dx / dist) * repelForce;
          bean.velocity.y += (dy / dist) * repelForce;
          bean.velocity.z += (dz / dist) * repelForce;

          // Increase spin speed during scatter
          bean.rotSpeed.x += (Math.random() - 0.5) * 0.05;
          bean.rotSpeed.y += (Math.random() - 0.5) * 0.05;
        }

        // Restoring Spring Force back toward initial position (elastic recovery)
        const springK = 0.015;
        const toInitX = bean.initialPos.x - m.position.x;
        const toInitY = bean.initialPos.y - m.position.y;
        const toInitZ = bean.initialPos.z - m.position.z;

        bean.velocity.x += toInitX * springK + harmonicX;
        bean.velocity.y += toInitY * springK + harmonicY;
        bean.velocity.z += toInitZ * springK + harmonicZ;

        // Damping / Friction
        bean.velocity.multiplyScalar(0.93);

        // Apply velocity to position
        m.position.add(bean.velocity);

        // Apply rotation
        m.rotation.x += bean.rotSpeed.x;
        m.rotation.y += bean.rotSpeed.y;
        m.rotation.z += bean.rotSpeed.z;
        bean.rotSpeed.multiplyScalar(0.985);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
      beanGeo.dispose();
      materials.forEach((m) => m.dispose());
    };
  }, [isDark]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-auto select-none"
      style={{ zIndex: 0 }}
    />
  );
};

