"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — réplica EXATA dos dois globos de referência:
 *
 * DESKTOP (Screenshot_20260908_165024_Chrome.jpg):
 *   - Esfera MARROM/LARANJA (warm tones, #E8A860 highlight → #7B4B2E mid → #2A1209 shadow)
 *   - Blue rim glow bottom-left
 *   - Fundo espaço escuro com estrelas
 *   - 5 pins: MÉXICO, COLÔMBIA, BRASIL, ARGENTINA, CHILE
 *   - 3 arcos laranja
 *   - cameraZ: 2.9, FOV: 55
 *
 * MOBILE (20260908_181803.jpg):
 *   - Esfera AZUL (#1E3A8A deep royal blue throughout)
 *   - Orange rim glow on top edge
 *   - Fundo claro/off-white
 *   - 13 pins: CANADA, UNITED STATES, MEXICO, COLOMBIA, BRAZIL, ARGENTINA,
 *     SOUTH AFRICA, KENYA, UNITED KINGDOM, SPAIN, ITALY, TURKEY, EGYPT
 *   - 3 arcos laranja
 *   - cameraZ: 3.2, globe occupies 50-60% of screen
 */

interface GlobeCanvasProps {
  className?: string;
  speed?: number;
  cameraZ?: number;
  scrollProgress?: number;
  isMobile?: boolean;
}

export default function GlobeCanvas({
  className = "", speed = 1, cameraZ = 2.9, scrollProgress = 0, isMobile = false,
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
      const cleanup = initGlobe(THREE, canvasRef.current, { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints, isMobile });
      cleanupRef.current = cleanup;
    }).catch((e) => console.error("[globe] three.js failed:", e));

    const obs = new IntersectionObserver((e) => { isVisibleRef.current = e[0]?.isIntersecting ?? true; }, { rootMargin: "100px" });
    if (canvasRef.current) obs.observe(canvasRef.current);

    return () => { disposed = true; if (cleanupRef.current) cleanupRef.current(); obs.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [speed, cameraZ, isMobile]);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />;
}

interface Opts {
  speed: number; cameraZ: number;
  isVisibleRef: React.MutableRefObject<boolean>;
  rafRef: React.MutableRefObject<number>;
  scrollProgressRef: React.MutableRefObject<number>;
  landPoints: Array<[number, number]>;
  isMobile: boolean;
}

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, o: Opts): () => void {
  const { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints, isMobile } = o;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, cameraZ);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const globeGroup = new THREE.Group();
  globeGroup.rotation.x = 0.15;
  globeGroup.rotation.z = 0.05;
  globeGroup.rotation.y = isMobile ? 4.8 : 5.2; // slightly different angle for mobile
  scene.add(globeGroup);

  // === SPHERE — different shader for mobile vs desktop ===
  const sphereGeo = new THREE.SphereGeometry(0.97, 64, 48);

  let sphereMat: THREE.ShaderMaterial;
  if (isMobile) {
    // MOBILE: Blue sphere (#1E3A8A) + orange rim on top
    sphereMat = new THREE.ShaderMaterial({
      uniforms: { uLightDir: { value: new THREE.Vector3(0.5, 0.6, 0.6).normalize() } },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uLightDir;
        varying vec3 vNormal; varying vec3 vWorldPos;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 L = normalize(uLightDir);
          float ndl = dot(N, L);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float rim = 1.0 - max(0.0, dot(N, viewDir));

          // Blue sphere body: #1E3A8A deep royal blue
          vec3 blueBase = vec3(0.12, 0.23, 0.54);
          // Brighter blue in center where lit
          vec3 blueLit = vec3(0.18, 0.35, 0.75);
          float lit = smoothstep(-0.2, 0.8, ndl);
          vec3 color = mix(blueBase, blueLit, lit * 0.6);

          // Orange rim glow on TOP edge (lit side)
          float orangeRim = pow(rim, 2.0) * smoothstep(0.0, 0.5, ndl);
          color += vec3(1.0, 0.55, 0.15) * orangeRim * 1.0;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  } else {
    // DESKTOP: Warm brown/orange sphere + blue rim bottom-left
    sphereMat = new THREE.ShaderMaterial({
      uniforms: { uLightDir: { value: new THREE.Vector3(0.6, 0.4, 0.7).normalize() } },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uLightDir;
        varying vec3 vNormal; varying vec3 vWorldPos;
        void main() {
          vec3 N = normalize(vNormal);
          vec3 L = normalize(uLightDir);
          float ndl = dot(N, L);
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float rim = 1.0 - max(0.0, dot(N, viewDir));

          // Warm sphere: #E8A860 highlight → #7B4B2E mid → #2A1209 shadow
          vec3 highlight = vec3(0.91, 0.66, 0.38);
          vec3 midTone = vec3(0.48, 0.29, 0.18);
          vec3 shadow = vec3(0.16, 0.07, 0.04);

          float lightAmount = smoothstep(-0.3, 0.95, ndl);
          vec3 color;
          if (lightAmount < 0.5) {
            color = mix(shadow, midTone, lightAmount * 2.0);
          } else {
            color = mix(midTone, highlight, (lightAmount - 0.5) * 2.0);
          }

          // Warm orange rim glow on lit side (top-right)
          float litSide = smoothstep(-0.1, 0.5, ndl);
          color += vec3(1.0, 0.55, 0.26) * pow(rim, 2.5) * litSide * 0.8;

          // Blue rim glow on shadow side (bottom-left)
          float shadowSide = 1.0 - litSide;
          color += vec3(0.31, 0.76, 0.97) * pow(rim, 2.5) * shadowSide * 0.6;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }
  globeGroup.add(new THREE.Mesh(sphereGeo, sphereMat));

  // === WHITE DOTS on land ===
  const dotTexture = createDotTexture(THREE);
  const dotRadius = 0.975;
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
    size: 0.012, sizeAttenuation: true, map: dotTexture,
    color: 0xFFFFFF, transparent: true, opacity: 0.9,
    depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
  });
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  globeGroup.add(new THREE.Points(dotGeo, dotMat));

  // === PIN MARKERS — different sets for mobile vs desktop ===
  const desktopPins = [
    { lat: 23.63, lng: -102.55 }, { lat: 4.57, lng: -74.30 },
    { lat: -14.24, lng: -51.93 }, { lat: -38.42, lng: -63.62 },
    { lat: -35.68, lng: -71.54 },
  ];
  const mobilePins = [
    { lat: 56.13, lng: -106.35 }, // CANADA
    { lat: 37.09, lng: -95.71 },  // UNITED STATES
    { lat: 23.63, lng: -102.55 }, // MEXICO
    { lat: 4.57, lng: -74.30 },   // COLOMBIA
    { lat: -14.24, lng: -51.93 }, // BRAZIL
    { lat: -38.42, lng: -63.62 }, // ARGENTINA
    { lat: -30.56, lng: 22.94 },  // SOUTH AFRICA
    { lat: -0.02, lng: 37.91 },   // KENYA
    { lat: 55.38, lng: -3.44 },   // UNITED KINGDOM
    { lat: 40.46, lng: -3.75 },   // SPAIN
    { lat: 41.87, lng: 12.57 },   // ITALY
    { lat: 38.96, lng: 35.24 },   // TURKEY
    { lat: 26.82, lng: 30.80 },   // EGYPT
  ];
  const pinCities = isMobile ? mobilePins : desktopPins;

  const pinGeo = new THREE.SphereGeometry(0.014, 8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xFF5722, depthTest: false, depthWrite: false });
  const haloGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xFF5722, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 0.99);
    const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(v); globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.position.copy(v); globeGroup.add(halo);
  });

  // === FLIGHT ARCS ===
  const arcPairs = isMobile
    ? [
        [mobilePins[2], mobilePins[4]], // Mexico → Brazil
        [mobilePins[5], mobilePins[3]], // Argentina → Colombia
        [mobilePins[8], mobilePins[10]], // UK → Italy
      ]
    : [
        [desktopPins[0], desktopPins[2]], // México → Brasil
        [desktopPins[3], desktopPins[1]], // Argentina → Colômbia
        [desktopPins[4], desktopPins[2]], // Chile → Brasil
      ];

  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  for (const [p1, p2] of arcPairs) {
    const start = latLngToVec3(p1.lat, p1.lng, 0.99);
    const end = latLngToVec3(p2.lat, p2.lng, 0.99);
    const arcPoints = buildArcCurve(start, end, 50);
    const geo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const mat = new THREE.LineBasicMaterial({
      color: 0xD84315, transparent: true, opacity: 0.7,
      blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    });
    const line = new THREE.Line(geo, mat);
    globeGroup.add(line);
    arcs.push({ line, duration: 3, delay: 0 });
  }

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
    globeGroup.rotation.y += dt * 0.05 * speed * (1 + sp * 2);
    globeGroup.rotation.x = 0.15 + sp * -0.6;

    const t = now / 1000;
    arcs.forEach((arc) => {
      const cycle = (t + arc.delay) % (arc.duration * 2);
      arc.line.material.opacity = cycle < arc.duration ? 0.4 + Math.sin((cycle / arc.duration) * Math.PI) * 0.4 : 0.2;
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
  const elevation = 1 + 0.08 + Math.sin(angle / 2) * 0.2;
  mid.normalize().multiplyScalar(elevation);
  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
