"use client";

import { useEffect, useRef } from "react";
import landPoints from "@/lib/land-points.json";

/**
 * GlobeCanvas — Three.js dot-globe with REAL continent outlines.
 * Replica pixel-perfect do globo do United Carriers:
 * - Dots apenas em terra (continentes visíveis)
 * - killBack: dots de trás da esfera são ocultos (profundidade 3D)
 * - Shader de atenuação: dots na borda são menores (perspectiva atmosférica)
 * - Pin markers laranja com labels
 * - Arcos de voo entre pins
 * - Auto-rotação + scroll-driven tilt
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
  cameraZ = 2.0,
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

    import("three").then((THREE) => {
      (window as any).THREE = THREE;
      if (disposed || !canvasRef.current) return;
      const cleanup = initGlobe(THREE, canvasRef.current, {
        speed, tileDeg, cameraZ, isVisibleRef, rafRef, scrollProgressRef,
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
}

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, opts: InitOptions): () => void {
  const { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef } = opts;

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

  // === Dark sphere for 3D depth (killBack visual) ===
  const darkSphereGeo = new THREE.SphereGeometry(0.97, 64, 48);
  const darkSphereMat = new THREE.MeshPhongMaterial({
    color: 0x080810, shininess: 20, specular: 0x222244, emissive: 0x040408,
  });
  globeGroup.add(new THREE.Mesh(darkSphereGeo, darkSphereMat));

  // === Lighting — orange top-right, blue bottom-left ===
  scene.add(new THREE.DirectionalLight(0xff4400, 1.8).translateX(5).translateY(3));
  scene.add(new THREE.DirectionalLight(0x4dabff, 1.2).translateX(-3).translateY(-5));
  const orangeRim = new THREE.PointLight(0xff3300, 3.5, 5);
  orangeRim.position.set(2, 1.5, 1.5);
  scene.add(orangeRim);
  const blueRim = new THREE.PointLight(0x4dabff, 2.5, 5);
  blueRim.position.set(-2, -1.5, 1.5);
  scene.add(blueRim);
  scene.add(new THREE.AmbientLight(0x111122, 0.3));

  // === Land dot sphere — using REAL geographic data ===
  const dotPositions: number[] = [];
  const dotColors: number[] = [];
  const dotSizes: number[] = [];
  const radius = 1.0;

  // Convert lat/lng to 3D position and add land points
  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    dotPositions.push(x, y, z);

    // Color: mostly white with slight blue tint, some orange accents
    const isAccent = Math.random() < 0.02;
    if (isAccent) {
      dotColors.push(1.0, 0.48, 0.0); // orange
    } else {
      const v = 0.7 + Math.random() * 0.3;
      dotColors.push(v, v, v * 1.05); // white with slight blue
    }
    dotSizes.push(1.0);
  }

  // Create custom shader material with killBack + point size attenuation
  const dotTexture = createDotTexture(THREE);
  const dotMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: dotTexture },
      uCamPos: { value: camera.position },
      uPointSize: { value: 3.0 },
    },
    vertexShader: `
      uniform vec3 uCamPos;
      uniform float uPointSize;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vFacing;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        vec3 normal = normalize(worldPos);
        vec3 viewDir = normalize(uCamPos - worldPos);
        float ndv = dot(normal, viewDir);
        vFacing = ndv;
        // Kill back-facing points (ndv < 0 means pointing away from camera)
        if (ndv < 0.0) {
          gl_Position = vec4(0.0, 0.0, -9999.0, 1.0); // off-screen
          gl_PointSize = 0.0;
          return;
        }
        // Attenuate point size near edges (atmospheric perspective)
        float sizeMult = mix(0.4, 1.0, smoothstep(0.0, 0.35, ndv));
        gl_PointSize = uPointSize * sizeMult * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      varying float vFacing;
      void main() {
        if (vFacing < 0.0) discard;
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        if (tex.a < 0.1) discard;
        gl_FragColor = vec4(vColor, tex.a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
  dotGeometry.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));

  const dots = new THREE.Points(dotGeometry, dotMaterial);
  globeGroup.add(dots);

  // === Flight arcs ===
  const arcGroup = new THREE.Group();
  globeGroup.add(arcGroup);

  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  const numArcs = 12;

  for (let i = 0; i < numArcs; i++) {
    const p1 = landPoints[Math.floor(Math.random() * landPoints.length)];
    const p2 = landPoints[Math.floor(Math.random() * landPoints.length)];
    const start = latLngToVec3(p1[0], p1[1], 1.002);
    const end = latLngToVec3(p2[0], p2[1], 1.002);
    const arcPoints = buildArcCurve(start, end, 50);
    const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const material = new THREE.LineBasicMaterial({
      color: 0xff5500, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    arcGroup.add(line);
    arcs.push({ line, duration: 2 + Math.random() * 2, delay: Math.random() * 5 });
  }

  // === Pin markers — key cities with orange dots + halos ===
  const pinCities = [
    { lat: -23.55, lng: -46.63, name: "São Paulo" },
    { lat: 40.71, lng: -74.0, name: "New York" },
    { lat: 51.5, lng: -0.13, name: "London" },
    { lat: 35.68, lng: 139.69, name: "Tokyo" },
    { lat: 1.35, lng: 103.82, name: "Singapore" },
    { lat: -33.87, lng: 151.21, name: "Sydney" },
    { lat: 25.2, lng: 55.27, name: "Dubai" },
    { lat: 48.85, lng: 2.35, name: "Paris" },
  ];

  const pinGeo = new THREE.SphereGeometry(0.015, 8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
  const haloGeo = new THREE.SphereGeometry(0.03, 8, 8);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xff5500, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending,
  });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 1.005);
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.copy(v);
    globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.copy(v);
    globeGroup.add(halo);
  });

  // === Initial rotation ===
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

    // Update camera position uniform for shader
    dotMaterial.uniforms.uCamPos.value.copy(camera.position);

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
    dotGeometry.dispose();
    dotMaterial.dispose();
    dotTexture.dispose();
    arcs.forEach((a) => { a.line.geometry.dispose(); (a.line.material as THREE.Material).dispose(); });
    pinGeo.dispose(); pinMat.dispose(); haloGeo.dispose(); haloMat.dispose();
    darkSphereGeo.dispose(); darkSphereMat.dispose();
    renderer.dispose();
  };
}

// === Helpers ===
function createDotTexture(THREE: typeof import("three")): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.8)");
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
  const elevation = 1 + Math.sin(angle / 2) * 0.35;
  mid.normalize().multiplyScalar(elevation);
  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
