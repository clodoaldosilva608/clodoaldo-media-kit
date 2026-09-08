"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — globo com visual de "planeta iluminado":
 * - Esfera SÓLIDA com gradiente (laranja/dourado no topo, azul/preto embaixo)
 * - Pontos brancos como luzes de cidades (não continentes)
 * - Marcadores laranja com labels de países
 * - Arcos laranja brilhantes
 * - Rim light ciano/azul na borda
 * - Fundo espacial com estrelas
 */

interface GlobeCanvasProps {
  className?: string;
  speed?: number;
  cameraZ?: number;
  scrollProgress?: number;
}

export default function GlobeCanvas({
  className = "", speed = 1, cameraZ = 2.5, scrollProgress = 0,
}: GlobeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const cleanupRef = useRef<(() => void) | null>(null);
  const scrollProgressRef = useRef(scrollProgress);

  useEffect(() => { scrollProgressRef.current = scrollProgress; }, [scrollProgress]);

  useEffect(() => {
    if (!canvasRef.current) return;
    let disposed = false;

    import("three").then(async (THREE) => {
      (window as any).THREE = THREE;
      if (disposed || !canvasRef.current) return;

      let landPoints: Array<[number, number]> = [];
      try {
        const resp = await fetch("/land-points.json");
        landPoints = await resp.json();
      } catch (e) { console.error("[globe] land fetch failed:", e); return; }

      if (disposed || !canvasRef.current) return;
      const cleanup = initGlobe(THREE, canvasRef.current, { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints });
      cleanupRef.current = cleanup;
    }).catch((e) => console.error("[globe] three.js failed:", e));

    const obs = new IntersectionObserver((e) => { isVisibleRef.current = e[0]?.isIntersecting ?? true; }, { rootMargin: "100px" });
    if (canvasRef.current) obs.observe(canvasRef.current);

    return () => { disposed = true; if (cleanupRef.current) cleanupRef.current(); obs.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [speed, cameraZ]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />;
}

interface Opts { speed: number; cameraZ: number; isVisibleRef: React.MutableRefObject<boolean>; rafRef: React.MutableRefObject<number>; scrollProgressRef: React.MutableRefObject<number>; landPoints: Array<[number, number]>; }

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, o: Opts): () => void {
  const { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints } = o;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // === 1. SOLID SPHERE with gradient lighting ===
  // Custom shader: golden-orange top-right, dark blue/black bottom-left
  const sphereGeo = new THREE.SphereGeometry(0.95, 64, 48);
  const sphereMat = new THREE.ShaderMaterial({
    uniforms: {
      uLightDir: { value: new THREE.Vector3(0.7, 0.5, 0.5).normalize() }, // light from top-right
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      void main() {
        float ndl = dot(normalize(vNormal), normalize(uLightDir));
        // Lit side: warm golden-orange
        vec3 warmColor = vec3(0.35, 0.18, 0.05);
        // Dark side: deep blue-black
        vec3 darkColor = vec3(0.02, 0.03, 0.06);
        // Mix based on lighting
        float lightAmount = smoothstep(-0.3, 0.8, ndl);
        vec3 color = mix(darkColor, warmColor, lightAmount);
        // Add atmospheric rim glow (cyan/blue on edges)
        vec3 viewDir = normalize(cameraPosition - vWorldPos);
        float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
        rim = pow(rim, 2.5);
        vec3 rimColor = vec3(0.2, 0.5, 0.9) * rim * 0.6;
        color += rimColor;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // === 2. CITY LIGHTS — white/blue dots on land, like city lights at night ===
  const dotTexture = createDotTexture(THREE);
  const radius = 0.96;
  const positions: number[] = [];
  const colors: number[] = [];

  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    positions.push(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
    // Mostly white, some blue/cyan
    const isBlue = Math.random() < 0.15;
    if (isBlue) {
      colors.push(0.4, 0.7, 1.0); // blue/cyan
    } else {
      const v = 0.8 + Math.random() * 0.2;
      colors.push(v, v, v); // white
    }
  }

  const dotMat = new THREE.PointsMaterial({
    size: 0.015,
    sizeAttenuation: true,
    map: dotTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  globeGroup.add(new THREE.Points(dotGeo, dotMat));

  // === 3. PIN MARKERS — orange squares at South American countries ===
  const pinCities = [
    { lat: 23.63, lng: -102.55, name: "México" },
    { lat: 4.57, lng: -74.30, name: "Colômbia" },
    { lat: -14.24, lng: -51.93, name: "Brasil" },
    { lat: -38.42, lng: -63.62, name: "Argentina" },
    { lat: -23.55, lng: -46.63, name: "São Paulo" },
    { lat: 40.71, lng: -74.0, name: "New York" },
    { lat: 51.5, lng: -0.13, name: "London" },
    { lat: 35.68, lng: 139.69, name: "Tokyo" },
  ];

  const pinGeo = new THREE.SphereGeometry(0.016, 8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xFF5500, depthTest: false, depthWrite: false });
  const haloGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xFF5500, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 0.97);
    const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(v); globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.position.copy(v); globeGroup.add(halo);
  });

  // === 4. FLIGHT ARCS — orange, glowing ===
  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  for (let i = 0; i < 12; i++) {
    const p1 = pinCities[i % pinCities.length];
    const p2 = pinCities[(i + 3) % pinCities.length];
    const start = latLngToVec3(p1.lat, p1.lng, 0.97);
    const end = latLngToVec3(p2.lat, p2.lng, 0.97);
    const arcPoints = buildArcCurve(start, end, 50);
    const geo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const mat = new THREE.LineBasicMaterial({ color: 0xFF5500, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const line = new THREE.Line(geo, mat);
    globeGroup.add(line);
    arcs.push({ line, duration: 2 + Math.random() * 2, delay: Math.random() * 5 });
  }

  globeGroup.rotation.y = 3.8;

  // === Resize ===
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width)), h = Math.max(1, Math.floor(r.height));
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, true);
    canvas.style.width = "100%"; canvas.style.height = "100%"; canvas.style.display = "block";
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  requestAnimationFrame(() => { resize(); setTimeout(resize, 100); setTimeout(resize, 500); });
  const ro = new ResizeObserver(() => requestAnimationFrame(resize));
  ro.observe(canvas); if (canvas.parentElement) ro.observe(canvas.parentElement);

  // === Animation ===
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
      arc.line.material.opacity = cycle < arc.duration ? Math.sin((cycle / arc.duration) * Math.PI) : 0;
    });
    renderer.render(scene, camera);
  };
  rafRef.current = requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(rafRef.current); ro.disconnect();
    dotGeo.dispose(); dotMat.dispose(); dotTexture.dispose();
    sphereGeo.dispose(); sphereMat.dispose();
    arcs.forEach((a) => { a.line.geometry.dispose(); (a.line.material as THREE.Material).dispose(); });
    pinGeo.dispose(); pinMat.dispose(); haloGeo.dispose(); haloMat.dispose();
    renderer.dispose();
  };
}

function createDotTexture(THREE: typeof import("three")): THREE.Texture {
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

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const T = (window as any).THREE;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new T.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function buildArcCurve(start: any, end: any, segments: number): any[] {
  const T = (window as any).THREE;
  const points: any[] = [];
  const angle = start.angleTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const elevation = 1 + 0.05 + Math.sin(angle / 2) * 0.15;
  mid.normalize().multiplyScalar(elevation);
  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
