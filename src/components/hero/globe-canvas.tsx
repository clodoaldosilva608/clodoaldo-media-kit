"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — Three.js dot-globe with flight arcs.
 *
 * Replicação do globo do United Carriers (unitedcarriers.com):
 * - Esfera de pontos (dot-globe) com densidade configurável
 * - Arcos de "voo" (curvas quadráticas) entre pontos aleatórios
 * - Auto-rotação contínua (phi inicial = 3.8)
 * - Sombras coloridas atrás (orange + blue + blue-plus + orange-plus)
 * - IntersectionObserver para pausar quando off-screen
 * - Mobile: cameraZ maior (2.8), tileDeg maior (1.5)
 *
 * Não depende de nenhum serviço externo — tudo client-side.
 * Three.js é carregado via dynamic import no parent para evitar SSR issues.
 */

interface GlobeCanvasProps {
  className?: string;
  /** Velocidade da rotação automática (0 = parado, 1 = padrão) */
  speed?: number;
  /** Densidade dos pontos (graus entre pontos) — menor = mais denso */
  tileDeg?: number;
  /** Distância da câmera */
  cameraZ?: number;
}

export default function GlobeCanvas({
  className = "",
  speed = 1,
  tileDeg = 1.2,
  cameraZ = 2.45,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;
    const canvas = canvasRef.current;

    // Lazy-load Three.js only on client
    import("three")
      .then((THREE) => {
        // Store globally so helper functions can access it
        (window as any).THREE = THREE;
        if (disposed || !canvasRef.current) return;
        const cleanup = initGlobe(THREE, canvasRef.current, {
          speed,
          tileDeg,
          cameraZ,
          isVisibleRef,
          rafRef,
        });
        cleanupRef.current = cleanup;
      })
      .catch((err) => {
        console.error("[globe-canvas] Failed to load Three.js:", err);
      });

    // Intersection observer to pause when off-screen
    if (canvasRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          isVisibleRef.current = entries[0]?.isIntersecting ?? true;
        },
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
}

function initGlobe(
  THREE: typeof import("three"),
  canvas: HTMLCanvasElement,
  opts: InitOptions,
): () => void {
  const { speed, tileDeg, cameraZ, isVisibleRef, rafRef } = opts;

  // === Scene setup ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // Set transparent clear color (alpha 0) so background CSS shows through
  renderer.setClearColor(0x000000, 0);

  // === Globe group (rotates) ===
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // === Dark sphere with 3D lighting — creates depth + atmospheric rim ===
  const darkSphereGeo = new THREE.SphereGeometry(0.97, 64, 48);
  const darkSphereMat = new THREE.MeshPhongMaterial({
    color: 0x0d0d14,
    shininess: 15,
    specular: 0x222233,
    emissive: 0x050508,
  });
  const darkSphere = new THREE.Mesh(darkSphereGeo, darkSphereMat);
  globeGroup.add(darkSphere);

  // === Lighting — orange from top-right, blue from bottom-left ===
  // This creates the dramatic atmospheric rim lighting like United Carriers
  const orangeLight = new THREE.DirectionalLight(0xff4400, 2.0);
  orangeLight.position.set(5, 3, 2);
  scene.add(orangeLight);

  const blueLight = new THREE.DirectionalLight(0x4dabff, 1.5);
  blueLight.position.set(-3, -5, 1);
  scene.add(blueLight);

  // Blue rim light — positioned close to bottom-left edge for dramatic blue glow
  const blueRim = new THREE.PointLight(0x4dabff, 2.0, 5);
  blueRim.position.set(-2, -1.5, 1.5);
  scene.add(blueRim);

  // Orange rim light — positioned close to top-right edge for warm orange glow
  const orangeRim = new THREE.PointLight(0xff3300, 4.0, 5);
  orangeRim.position.set(2, 1.5, 1.5);
  scene.add(orangeRim);

  const ambientLight = new THREE.AmbientLight(0x111122, 0.3);
  scene.add(ambientLight);

  // === Dot sphere ===
  const dotPositions: number[] = [];
  const dotColors: number[] = [];
  const radius = 1;
  const step = tileDeg * (Math.PI / 180);

  for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += step) {
    const circumference = 2 * Math.PI * Math.cos(lat);
    const numLng = Math.max(1, Math.round(circumference / step));
    for (let i = 0; i < numLng; i++) {
      const lng = (i / numLng) * 2 * Math.PI - Math.PI;
      const x = radius * Math.cos(lat) * Math.cos(lng);
      const y = radius * Math.sin(lat);
      const z = radius * Math.cos(lat) * Math.sin(lng);
      dotPositions.push(x, y, z);
      const isAccent = Math.random() < 0.08;
      if (isAccent) {
        dotColors.push(1.0, 0.48, 0.0);
      } else {
        const v = 0.6 + Math.random() * 0.4;
        dotColors.push(v * 0.8, v * 0.9, v);
      }
    }
  }

  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(dotPositions, 3),
  );
  dotGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(dotColors, 3),
  );

  const dotTexture = createDotTexture(THREE);

  const dotMaterial = new THREE.PointsMaterial({
    size: 0.03,
    sizeAttenuation: true,
    map: dotTexture,
    transparent: true,
    vertexColors: true,
    alphaTest: 0.05,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.9,
  });

  const dots = new THREE.Points(dotGeometry, dotMaterial);
  globeGroup.add(dots);

  // === Flight arcs ===
  const arcGroup = new THREE.Group();
  globeGroup.add(arcGroup);

  const arcs: Array<{
    line: THREE.Line;
    duration: number;
    delay: number;
  }> = [];

  const numArcs = 15;
  for (let i = 0; i < numArcs; i++) {
    const start = randomSpherePoint(1.005);
    const end = randomSpherePoint(1.005);
    const arcPoints = buildArcCurve(start, end, 50);
    const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const material = new THREE.LineBasicMaterial({
      color: 0xff7a00,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      linewidth: 2,
    });
    const line = new THREE.Line(geometry, material);
    arcGroup.add(line);
    arcs.push({
      line,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 5,
    });
  }

  // === Pin markers (highlighted cities) ===
  const pinPositions = [
    { lat: -23.55, lng: -46.63 },
    { lat: 40.71, lng: -74.0 },
    { lat: 51.5, lng: -0.13 },
    { lat: 35.68, lng: 139.69 },
    { lat: 1.35, lng: 103.82 },
    { lat: -33.87, lng: 151.21 },
  ];

  const pinGeometry = new THREE.SphereGeometry(0.012, 8, 8);
  const pinMaterial = new THREE.MeshBasicMaterial({
    color: 0x4dabff,
    transparent: true,
    opacity: 0.9,
  });

  pinPositions.forEach((p) => {
    const v = latLngToVec3(p.lat, p.lng, 1.005);
    const pin = new THREE.Mesh(pinGeometry, pinMaterial);
    pin.position.copy(v);
    globeGroup.add(pin);

    const haloGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x4dabff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(v);
    globeGroup.add(halo);
  });

  // === Initial rotation (phi = 3.8 like United Carriers) ===
  globeGroup.rotation.y = 3.8;

  // === Resize handling ===
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

  requestAnimationFrame(() => {
    resize();
    setTimeout(resize, 100);
    setTimeout(resize, 500);
  });

  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(resize);
  });
  resizeObserver.observe(canvas);
  if (canvas.parentElement) {
    resizeObserver.observe(canvas.parentElement);
  }

  // === Animation loop ===
  let lastTime = performance.now();
  const animate = (now: number) => {
    rafRef.current = requestAnimationFrame(animate);
    if (!isVisibleRef.current) return;

    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    globeGroup.rotation.y += dt * 0.08 * speed;

    const t = now / 1000;
    arcs.forEach((arc) => {
      const cycle = (t + arc.delay) % (arc.duration * 2);
      if (cycle < arc.duration) {
        const p = cycle / arc.duration;
        arc.line.material.opacity = Math.sin(p * Math.PI) * 1.0;
      } else {
        arc.line.material.opacity = 0;
      }
    });

    renderer.render(scene, camera);
  };
  rafRef.current = requestAnimationFrame(animate);

  // === Cleanup ===
  return () => {
    cancelAnimationFrame(rafRef.current);
    resizeObserver.disconnect();
    dotGeometry.dispose();
    dotMaterial.dispose();
    dotTexture.dispose();
    arcs.forEach((arc) => {
      arc.line.geometry.dispose();
      (arc.line.material as THREE.Material).dispose();
    });
    pinGeometry.dispose();
    pinMaterial.dispose();
    renderer.dispose();
  };
}

// === Helpers ===

function createDotTexture(THREE: typeof import("three")): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function randomSpherePoint(
  r: number,
): import("three").Vector3 {
  // Use global THREE (loaded via dynamic import in initGlobe)
  const T = (window as any).THREE || require("three");
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  return new T.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function latLngToVec3(
  lat: number,
  lng: number,
  r: number,
): import("three").Vector3 {
  const T = (window as any).THREE || require("three");
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new T.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function buildArcCurve(
  start: import("three").Vector3,
  end: import("three").Vector3,
  segments: number,
): import("three").Vector3[] {
  const T = (window as any).THREE || require("three");
  const points: import("three").Vector3[] = [];
  const angle = start.angleTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const elevation = 1 + Math.sin(angle / 2) * 0.3;
  mid.normalize().multiplyScalar(elevation);

  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) {
    points.push(curve.getPoint(i / segments));
  }
  return points;
}
