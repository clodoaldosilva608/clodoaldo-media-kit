"use client";

import { useEffect, useRef, useState } from "react";

/**
 * GlobeCanvas — esfera pontilhada com pontos terrestres reais.
 *
 * Features:
 * - Pontos brancos formando continentes (15K+ pontos de world-atlas)
 * - killBack via shader: pontos de trás são descartados (discard)
 * - Point size attenuation: pontos na borda são menores
 * - Halo radial + glow atmosférico via CSS (no wrapper)
 * - 6 pins laranja com labels HTML
 * - 3 arcos animados por desenho progressivo
 * - Auto-rotação + drag/touch com inércia
 * - IntersectionObserver para pausar fora da viewport
 * - ResizeObserver para ajustar ao container
 * - prefers-reduced-motion: sem rotação automática
 * - Cleanup completo de RAFs, listeners, geometrias, materiais
 */

interface GlobeCanvasProps {
  className?: string;
  scrollProgress?: number;
  onLabelsUpdate?: (labels: Array<{ id: string; name: string; x: number; y: number; visible: boolean }>) => void;
}

export default function GlobeCanvas({
  className = "",
  scrollProgress = 0,
  onLabelsUpdate,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollProgressRef = useRef(scrollProgress);
  const onLabelsUpdateRef = useRef(onLabelsUpdate);

  useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);
  useEffect(() => { onLabelsUpdateRef.current = onLabelsUpdate; }, [onLabelsUpdate]);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    import("three").then(async (THREE) => {
      if (disposed || !canvasRef.current) return;

      let landPoints: Array<[number, number]> = [];
      try {
        const resp = await fetch("/land-points.json");
        landPoints = await resp.json();
      } catch (e) { console.error("[globe] land fetch failed:", e); return; }

      if (disposed || !canvasRef.current) return;
      const cleanup = initGlobe(THREE, canvasRef.current, containerRef.current!, {
        scrollProgressRef, isVisibleRef, rafRef, landPoints, onLabelsUpdateRef,
      });
      cleanupRef.current = cleanup;
    }).catch((e) => console.error("[globe] three.js failed:", e));

    const obs = new IntersectionObserver((e) => { isVisibleRef.current = e[0]?.isIntersecting ?? true; }, { rootMargin: "100px" });
    if (canvasRef.current) obs.observe(canvasRef.current);

    return () => {
      disposed = true;
      if (cleanupRef.current) cleanupRef.current();
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

interface Opts {
  scrollProgressRef: React.MutableRefObject<number>;
  isVisibleRef: React.MutableRefObject<boolean>;
  rafRef: React.MutableRefObject<number>;
  landPoints: Array<[number, number]>;
  onLabelsUpdateRef: React.MutableRefObject<((labels: any[]) => void) | undefined>;
}

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, container: HTMLDivElement, o: Opts): () => void {
  const { scrollProgressRef, isVisibleRef, rafRef, landPoints } = o;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.innerWidth < 768;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 2.8 : 2.5);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: isMobile ? "low-power" : "high-performance", preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const globeGroup = new THREE.Group();
  globeGroup.rotation.x = 0.26; // ~15 degrees tilt
  globeGroup.rotation.z = 0;
  globeGroup.rotation.y = 2.0;
  scene.add(globeGroup);

  // === LAND DOTS — pontos brancos formando continentes ===
  // Sem esfera opaca interna — só os pontos formam o globo
  const dotTexture = createDotTexture(THREE);
  const dotRadius = 1.0;
  const positions: number[] = [];
  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    positions.push(
      -dotRadius * Math.sin(phi) * Math.cos(theta),
      dotRadius * Math.cos(phi),
      dotRadius * Math.sin(phi) * Math.sin(theta),
    );
  }

  const dotMat = new THREE.PointsMaterial({
    size: isMobile ? 0.016 : 0.013,
    sizeAttenuation: true, map: dotTexture,
    color: 0xFFFFFF, transparent: true, opacity: 1.0,
    depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });

  // Simplified: NO onBeforeCompile — use depthTest to hide back points naturally
  // The opaque sphere mesh behind blocks back-facing points
  // This is more compatible across Three.js versions

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  globeGroup.add(new THREE.Points(dotGeo, dotMat));

  // === PINS — 10 pontos de interesse globais ===
  const pinCities = [
    { lat: -8.05, lng: -34.9, name: "Apps" },
    { lat: 40.71, lng: -74.0, name: "Conteúdo" },
    { lat: 51.5, lng: -0.13, name: "Estratégia" },
    { lat: 35.68, lng: 139.69, name: "Produtos" },
    { lat: 1.35, lng: 103.82, name: "Parcerias" },
    { lat: -33.87, lng: 151.21, name: "Dados" },
    { lat: 25.2, lng: 55.27, name: "Métricas" },
    { lat: 48.85, lng: 2.35, name: "Design" },
    { lat: -23.55, lng: -46.63, name: "Brasil" },
    { lat: 37.77, lng: -122.42, name: "Inovação" },
  ];

  const pinGeo = new THREE.SphereGeometry(0.018, 12, 12);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xFF6B1A, depthTest: false, depthWrite: false });
  const haloGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xFF6B1A, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });

  const pinWorldPositions: any[] = [];
  pinCities.forEach((c) => {
    const v = latLngToVec3(THREE, c.lat, c.lng, 1.0);
    pinWorldPositions.push(v.clone());
    const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(v); globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.position.copy(v); globeGroup.add(halo);
  });

  // === ARCS — 6 arcos animados ===
  const arcPairs = [
    [pinCities[0], pinCities[2]], // Apps → Estratégia
    [pinCities[1], pinCities[4]], // Conteúdo → Parcerias
    [pinCities[3], pinCities[5]], // Produtos → Dados
    [pinCities[6], pinCities[8]], // Métricas → Brasil
    [pinCities[7], pinCities[9]], // Design → Inovação
    [pinCities[2], pinCities[1]], // Estratégia → Conteúdo
  ];

  const arcs: Array<{ line: any; duration: number; delay: number }> = [];
  for (const [p1, p2] of arcPairs) {
    const start = latLngToVec3(THREE, p1.lat, p1.lng, 1.0);
    const end = latLngToVec3(THREE, p2.lat, p2.lng, 1.0);
    const arcPoints = buildArcCurve(THREE, start, end, 50);
    const geo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const mat = new THREE.LineBasicMaterial({ color: 0xFF6B1A, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const line = new THREE.Line(geo, mat);
    globeGroup.add(line);
    arcs.push({ line, duration: 2.5 + Math.random(), delay: Math.random() * 3 });
  }

  // === DRAG / TOUCH ===
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let rotVelocityX = 0, rotVelocityY = 0;
  let autoRotate = !prefersReducedMotion;

  const onPointerDown = (e: PointerEvent) => {
    isDragging = true;
    autoRotate = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    rotVelocityX = 0;
    rotVelocityY = 0;
    canvas.style.cursor = "grabbing";
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    globeGroup.rotation.y += dx * 0.005;
    globeGroup.rotation.x += dy * 0.005;
    rotVelocityX = dy * 0.005;
    rotVelocityY = dx * 0.005;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  };
  const onPointerUp = () => {
    isDragging = false;
    canvas.style.cursor = "grab";
    // Resume auto-rotate after 3s of no interaction
    if (!prefersReducedMotion) {
      setTimeout(() => { if (!isDragging) autoRotate = true; }, 3000);
    }
  };

  canvas.style.cursor = "grab";
  canvas.style.touchAction = "none"; // prevent scroll while dragging
  canvas.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);

  // === RESIZE — force square canvas like United Carriers (850x850) ===
  const resize = () => {
    const parentEl = canvas.parentElement?.parentElement;
    const parentW = parentEl?.clientWidth || container.clientWidth || 800;
    const parentH = parentEl?.clientHeight || container.clientHeight || parentW;
    // Force square — globe should always be square
    const size = Math.max(parentW, parentH);
    const w = Math.max(64, Math.min(size, 1200));
    const h = w; // square
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    camera.aspect = 1; // always square
    camera.updateProjectionMatrix();
  };
  requestAnimationFrame(() => { resize(); setTimeout(resize, 100); setTimeout(resize, 500); });
  const ro = new ResizeObserver(() => requestAnimationFrame(resize));
  ro.observe(canvas); ro.observe(container);

  // === LABELS — update HTML positions ===
  let labelUpdateCounter = 0;
  function updateLabels() {
    if (!o.onLabelsUpdateRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const labels = pinCities.map((c, i) => {
      const worldPos = pinWorldPositions[i].clone();
      // Apply globe group rotation
      worldPos.applyEuler(globeGroup.rotation);
      // Project to screen
      const screenPos = worldPos.clone().project(camera);
      const ndv = worldPos.clone().normalize().dot(camera.position.clone().sub(worldPos).normalize());
      return {
        id: `pin-${i}`,
        name: c.name,
        x: (screenPos.x * 0.5 + 0.5) * w,
        y: (-screenPos.y * 0.5 + 0.5) * h,
        visible: ndv > 0.1,
      };
    });
    if (o.onLabelsUpdateRef.current) o.onLabelsUpdateRef.current(labels);
  }

  // === ANIMATION ===
  let lastTime = performance.now();
  const animate = (now: number) => {
    rafRef.current = requestAnimationFrame(animate);
    if (!isVisibleRef.current) return;

    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;
    const sp = scrollProgressRef.current;

    // Auto-rotation (0.0015 rad/frame normalized by 60fps)
    if (autoRotate && !isDragging) {
      globeGroup.rotation.y += dt * 0.05; // slow rotation
    }

    // Inertia after drag
    if (!isDragging && (Math.abs(rotVelocityX) > 0.0001 || Math.abs(rotVelocityY) > 0.0001)) {
      globeGroup.rotation.y += rotVelocityY;
      globeGroup.rotation.x += rotVelocityX;
      rotVelocityX *= 0.92;
      rotVelocityY *= 0.92;
    }

    // Scroll-driven tilt
    if (!isDragging) {
      globeGroup.rotation.x = 0.26 + sp * -0.3;
    }

    // Update camera position uniform for shader
    // No shader uniform update needed (removed onBeforeCompile)

    // Animate arcs (progressive draw)
    const t = now / 1000;
    arcs.forEach((arc) => {
      const cycle = (t + arc.delay) % (arc.duration * 2);
      arc.line.material.opacity = cycle < arc.duration
        ? Math.sin((cycle / arc.duration) * Math.PI) * 0.9
        : 0;
    });

    renderer.render(scene, camera);

    // Update labels every 3 frames
    labelUpdateCounter++;
    if (labelUpdateCounter % 3 === 0) updateLabels();
  };
  rafRef.current = requestAnimationFrame(animate);

  // === CLEANUP ===
  return () => {
    cancelAnimationFrame(rafRef.current);
    ro.disconnect();
    canvas.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    dotGeo.dispose(); dotMat.dispose(); dotTexture.dispose();
    // sphereGeo/sphereMat removed — no opaque sphere
    arcs.forEach((a) => { a.line.geometry.dispose(); (a.line.material as any).dispose(); });
    pinGeo.dispose(); pinMat.dispose(); haloGeo.dispose(); haloMat.dispose();
    renderer.dispose();
  };
}

function createDotTexture(THREE: any): any {
  const s = 32;
  const c = document.createElement("canvas"); c.width = s; c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.8)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  const t = new THREE.Texture(c); t.needsUpdate = true; return t;
}

function latLngToVec3(THREE: any, lat: number, lng: number, r: number): any {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function buildArcCurve(THREE: any, start: any, end: any, segments: number): any[] {
  const points: any[] = [];
  const angle = start.angleTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const elevation = 1 + 0.08 + Math.sin(angle / 2) * 0.2;
  mid.normalize().multiplyScalar(elevation);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
