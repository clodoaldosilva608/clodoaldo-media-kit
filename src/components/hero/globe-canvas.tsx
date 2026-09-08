"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — réplica pixel-perfect do globo do United Carriers.
 * Land points carregados via fetch() de /land-points.json (15K pontos de terra).
 *
 * Parâmetros extraídos do my-flights.js da referência:
 * pointSize: 0.005, tileDeg: 1.2, edgeColor: "#ffffff",
 * fillColor: "#e2e8f0", fillOpacity: 0.1, backOpacity: 0.15,
 * pinDotColor: "#F45300", arcColor: "#F45300", killBack: true,
 * pinSize: 0.006, pinAltitude: 0.008, haloScale: 7.5, cameraZ: 2.9
 */

interface GlobeCanvasProps {
  className?: string;
  speed?: number;
  tileDeg?: number;
  cameraZ?: number;
  scrollProgress?: number;
}

export default function GlobeCanvas({
  className = "",
  speed = 1,
  tileDeg = 1.2,
  cameraZ = 2.9,
  scrollProgress = 0,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollProgressRef = useRef(scrollProgress);

  useEffect(() => {
    scrollProgressRef.current = scrollProgress;
  }, [scrollProgress]);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    const canvas = canvasRef.current;

    import("three").then(async (THREE) => {
      (window as any).THREE = THREE;
      if (disposed || !canvasRef.current) return;

      // Fetch land points from public directory
      let landPoints: Array<[number, number]> = [];
      try {
        const resp = await fetch("/land-points.json");
        landPoints = await resp.json();
      } catch (e) {
        console.error("[globe-canvas] Failed to load land points:", e);
        return;
      }

      if (disposed || !canvasRef.current) return;
      const cleanup = initGlobe(THREE, canvasRef.current, {
        speed, tileDeg, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints,
      });
      cleanupRef.current = cleanup;
    }).catch((err) => {
      console.error("[globe-canvas] Failed to load Three.js:", err);
    });

    if (canvasRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => { isVisibleRef.current = entries[0]?.isIntersecting ?? true; },
        { rootMargin: "100px" },
      );
      observerRef.current.observe(canvasRef.current);
    }

    return () => {
      disposed = true;
      if (cleanupRef.current) cleanupRef.current();
      if (observerRef.current) observerRef.current.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, tileDeg, cameraZ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

interface InitOptions {
  speed: number;
  tileDeg: number;
  cameraZ: number;
  isVisibleRef: React.MutableRefObject<boolean>;
  rafRef: React.MutableRefObject<number>;
  scrollProgressRef: React.MutableRefObject<number>;
  landPoints: Array<[number, number]>;
}

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, opts: InitOptions): () => void {
  const { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints } = opts;

  // === Scene ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // === Dark opaque sphere — creates solid planet body, blocks back dots ===
  // This is what makes the globe look like a solid planet, not a transparent mesh
  const darkGeo = new THREE.SphereGeometry(0.97, 64, 48);
  const darkMat = new THREE.MeshBasicMaterial({
    color: 0x050508,     // very dark (almost black)
    transparent: false,
    opacity: 1.0,
  });
  globeGroup.add(new THREE.Mesh(darkGeo, darkMat));

  // === Fill sphere — subtle gray tint over the dark body (fillOpacity: 0.1) ===
  const fillGeo = new THREE.SphereGeometry(0.975, 48, 32);
  const fillMat = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,       // fillColor: "#e2e8f0"
    transparent: true,
    opacity: 0.08,         // fillOpacity: 0.1 (slightly lower)
    side: THREE.FrontSide,
    depthWrite: false,
  });
  globeGroup.add(new THREE.Mesh(fillGeo, fillMat));

  // === Land dots — white, depthTest=true so dark sphere blocks back dots ===
  const dotTexture = createDotTexture(THREE);
  const radius = 1.0;

  const dotPositions: number[] = [];
  const dotRadius = 0.975; // JUST outside the dark sphere (0.97) so depthTest passes
  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -dotRadius * Math.sin(phi) * Math.cos(theta);
    const y = dotRadius * Math.cos(phi);
    const z = dotRadius * Math.sin(phi) * Math.sin(theta);
    dotPositions.push(x, y, z);
  }

  // Single set of dots — dark sphere at 0.97 blocks back-facing ones via depthTest
  const dotMat = new THREE.PointsMaterial({
    size: 0.018,           // larger for visibility at cameraZ 2.9
    sizeAttenuation: true,
    map: dotTexture,
    transparent: true,
    color: 0xffffff,       // edgeColor: "#ffffff"
    opacity: 0.9,
    alphaTest: 0.05,
    depthWrite: false,
    depthTest: true,       // critical: dark sphere occludes back dots
    blending: THREE.AdditiveBlending, // additive makes dots glow on dark sphere
  });

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
  const dots = new THREE.Points(dotGeo, dotMat);
  globeGroup.add(dots);

  // === Pin markers — orange dots at key cities (pinDotColor: "#F45300") ===
  const pinCities = [
    { lat: -23.55, lng: -46.63 }, // São Paulo
    { lat: 40.71, lng: -74.0 },   // New York
    { lat: 51.5, lng: -0.13 },    // London
    { lat: 35.68, lng: 139.69 },  // Tokyo
    { lat: 1.35, lng: 103.82 },   // Singapore
    { lat: -33.87, lng: 151.21 }, // Sydney
    { lat: 25.2, lng: 55.27 },    // Dubai
    { lat: 48.85, lng: 2.35 },    // Paris
  ];

  const pinGeo = new THREE.SphereGeometry(0.008, 8, 8); // pinSize: 0.006
  const pinMat = new THREE.MeshBasicMaterial({
    color: 0xF45300, // pinDotColor
    transparent: true,
    opacity: 1.0,
  });

  // Halo — large, semi-transparent orange (haloScale: 7.5)
  const haloGeo = new THREE.SphereGeometry(0.045, 8, 8); // pinSize * haloScale
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xF45300,
    transparent: true,
    opacity: 0.2,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 0.985); // just outside dots
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.copy(v);
    globeGroup.add(pin);

    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(v);
    globeGroup.add(halo);
  });

  // === Flight arcs — orange (arcColor: "#F45300") ===
  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  const numArcs = 12;

  for (let i = 0; i < numArcs; i++) {
    const p1 = pinCities[i % pinCities.length];
    const p2 = pinCities[(i + 3) % pinCities.length];
    const start = latLngToVec3(p1.lat, p1.lng, 0.985);
    const end = latLngToVec3(p2.lat, p2.lng, 0.985);
    const arcPoints = buildArcCurve(start, end, 50);
    const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const material = new THREE.LineBasicMaterial({
      color: 0xF45300,      // arcColor
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const line = new THREE.Line(geometry, material);
    globeGroup.add(line);
    arcs.push({ line, duration: 2 + Math.random() * 2, delay: Math.random() * 5 });
  }

  // === Initial rotation (phi = 3.8) ===
  globeGroup.rotation.y = 3.8;

  // === Resize ===
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, true);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  requestAnimationFrame(() => { resize(); setTimeout(resize, 100); setTimeout(resize, 500); });

  const resizeObserver = new ResizeObserver(() => requestAnimationFrame(resize));
  resizeObserver.observe(canvas);
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

  // === Animation loop ===
  let lastTime = performance.now();
  const animate = (now: number) => {
    rafRef.current = requestAnimationFrame(animate);
    if (!isVisibleRef.current) return;

    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    const sp = scrollProgressRef.current;
    globeGroup.rotation.y += dt * 0.06 * speed * (1 + sp * 2);
    globeGroup.rotation.x = sp * -1.0;

    const t = now / 1000;
    arcs.forEach((arc) => {
      const cycle = (t + arc.delay) % (arc.duration * 2);
      if (cycle < arc.duration) {
        arc.line.material.opacity = Math.sin((cycle / arc.duration) * Math.PI);
      } else {
        arc.line.material.opacity = 0;
      }
    });

    renderer.render(scene, camera);
  };
  rafRef.current = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafRef.current);
    resizeObserver.disconnect();
    dotGeo.dispose(); dotMat.dispose();
    darkGeo.dispose(); darkMat.dispose();
    fillGeo.dispose(); fillMat.dispose();
    dotTexture.dispose();
    arcs.forEach((a) => { a.line.geometry.dispose(); (a.line.material as THREE.Material).dispose(); });
    pinGeo.dispose(); pinMat.dispose(); haloGeo.dispose(); haloMat.dispose();
    renderer.dispose();
  };
}

// === Helpers ===
function createDotTexture(THREE: typeof import("three")): THREE.Texture {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.7)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.Texture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const T = (window as any).THREE || require("three");
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new T.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArcCurve(start: any, end: any, segments: number): any[] {
  const T = (window as any).THREE || require("three");
  const points: any[] = [];
  const angle = start.angleTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  // arcAltBase: 0.02, arcAltMultiplier: 0.01
  const elevation = 1 + 0.02 + Math.sin(angle / 2) * 0.15;
  mid.normalize().multiplyScalar(elevation);
  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
