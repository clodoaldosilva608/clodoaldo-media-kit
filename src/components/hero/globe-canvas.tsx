"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — réplica EXATA do globo do United Carriers.
 *
 * Técnica do original (extraída de my-flights.js):
 * - NÃO usa esfera escura opaca
 * - USA ShaderMaterial custom com killBack:
 *   vertex shader calcula ndv = dot(normal, viewDir)
 *   se ndv < 0 (ponto de trás): discard (mata o fragmento)
 *   se ndv > 0 (ponto da frente): renderiza branco
 * - Point size attenuation: gl_PointSize *= mix(0.6, 1.0, smoothstep(0.0, 0.25, ndv))
 * - Esfera fill translúcida (fillOpacity 0.1) para profundidade sutil
 * - cameraZ: 2.9, pointSize: 0.005
 */

interface GlobeCanvasProps {
  className?: string;
  speed?: number;
  cameraZ?: number;
  scrollProgress?: number;
}

export default function GlobeCanvas({
  className = "", speed = 1, cameraZ = 2.9, scrollProgress = 0,
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

  // === Fill sphere — translucent gray (fillColor: #e2e8f0, fillOpacity: 0.1) ===
  const fillGeo = new THREE.SphereGeometry(0.95, 48, 32);
  const fillMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.FrontSide });
  globeGroup.add(new THREE.Mesh(fillGeo, fillMat));

  // === Land dots — CUSTOM SHADER with killBack (exactly like reference) ===
  const radius = 1.0;
  const positions: number[] = [];
  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    positions.push(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }

  const dotTexture = createDotTexture(THREE);

  // Shader: killBack + point size attenuation (EXACT replica of reference)
  const dotMat = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: dotTexture },
      uCamPos: { value: camera.position.clone() },
      uPointSize: { value: 8.0 },
    },
    vertexShader: `
      uniform vec3 uCamPos;
      uniform float uPointSize;
      varying float vNdv;
      varying vec2 vUv;
      void main() {
        vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
        vec3 worldPos = worldPos4.xyz;
        vec3 normal = normalize(worldPos);
        vec3 viewDir = normalize(uCamPos - worldPos);
        float ndv = dot(normal, viewDir);
        vNdv = ndv;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // Point size attenuation near edges (exactly like reference)
        float sizeMult = mix(0.6, 1.0, smoothstep(0.0, 0.25, ndv));
        gl_PointSize = uPointSize * sizeMult * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying float vNdv;
      void main() {
        // killBack: discard if back-facing (ndv < 0)
        if (vNdv < 0.0) discard;
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        if (tex.a < 0.1) discard;
        // White dots (edgeColor: #ffffff)
        gl_FragColor = vec4(1.0, 1.0, 1.0, tex.a);
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  });

  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  globeGroup.add(new THREE.Points(dotGeo, dotMat));

  // === Pin markers — orange (pinDotColor: #F45300) ===
  const pinCities = [
    { lat: -23.55, lng: -46.63 }, { lat: 40.71, lng: -74.0 },
    { lat: 51.5, lng: -0.13 }, { lat: 35.68, lng: 139.69 },
    { lat: 1.35, lng: 103.82 }, { lat: -33.87, lng: 151.21 },
    { lat: 25.2, lng: 55.27 }, { lat: 48.85, lng: 2.35 },
  ];

  const pinGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xF45300, depthTest: false, depthWrite: false });
  const haloGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xF45300, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 1.0);
    const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(v); globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.position.copy(v); globeGroup.add(halo);
  });

  // === Flight arcs — orange, always visible ===
  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  for (let i = 0; i < 12; i++) {
    const p1 = pinCities[i % pinCities.length];
    const p2 = pinCities[(i + 3) % pinCities.length];
    const start = latLngToVec3(p1.lat, p1.lng, 1.0);
    const end = latLngToVec3(p2.lat, p2.lng, 1.0);
    const arcPoints = buildArcCurve(start, end, 50);
    const geo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const mat = new THREE.LineBasicMaterial({ color: 0xF45300, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
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

    // Update camera position uniform for shader
    dotMat.uniforms.uCamPos.value.copy(camera.position);

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
    fillGeo.dispose(); fillMat.dispose();
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
