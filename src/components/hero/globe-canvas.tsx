"use client";

import { useEffect, useRef } from "react";

/**
 * GlobeCanvas — réplica EXATA do globo do United Carriers.
 *
 * Código extraído diretamente de my-flights.js:
 * - Renderer: alpha:true, antialias:false, powerPreference:"low-power", clearColor(0,0)
 * - Camera: PerspectiveCamera(55, aspect, 0.1, 100), position.z = cameraZ (2.9)
 * - Globe group: rotation.x = 0.15, rotation.z = 0.05
 * - Fill sphere: SphereGeometry(0.99, 32, 32), MeshBasicMaterial({colorWrite:false, depthWrite:true})
 *   → invisible but writes depth → blocks back dots
 * - Dots: onBeforeCompile shader with KILL_BACK define
 *   → if nd <= 0.0: discard (back dots killed)
 *   → gl_PointSize *= mix(0.6, 1.0, smoothstep(0.0, 0.25, ndv))
 * - Pin markers: SphereGeometry(pinSize), color pinDotColor (#F45300)
 * - Arcs: QuadraticBezierCurve3, color arcColor (#F45300)
 * - Land data: fetched from world-atlas@2/land-110m.json
 * - Dot texture: 64x64 canvas, radial gradient, hard edge (0.82*a inner stop)
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

// EXACT config from reference
const CONFIG = {
  pointSize: 0.005,
  edgeColor: 0xffffff,
  fillColor: 0xe2e8f0,
  fillOpacity: 0.1,
  backOpacity: 0.15,
  pinDotColor: 0xF45300,
  arcColor: 0xF45300,
  killBack: true,
  pinSize: 0.006,
  pinAltitude: 0.008,
  haloScale: 7.5,
  showArcs: true,
  arcThickness: 0.002,
  arcAltBase: 0.02,
  arcAltMultiplier: 0.01,
};

function initGlobe(THREE: typeof import("three"), canvas: HTMLCanvasElement, o: Opts): () => void {
  const { speed, cameraZ, isVisibleRef, rafRef, scrollProgressRef, landPoints } = o;
  const M = { ...CONFIG };

  // === Renderer (EXACT match: alpha:true, antialias:false, low-power) ===
  const maxPixelRatio = canvas.clientWidth < 768 ? 1.5 : 2;
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha: true, antialias: false, powerPreference: "low-power",
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
  renderer.setClearColor(0x000000, 0);

  // === Scene ===
  const scene = new THREE.Scene();

  // === Camera (EXACT: FOV 55) ===
  const W = canvas.clientWidth || canvas.offsetWidth || 800;
  const H = canvas.clientHeight || canvas.offsetHeight || W;
  renderer.setSize(W, H, false);
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
  camera.position.set(0, 0, cameraZ);

  // === Globe group (EXACT: rotation.x=0.15, rotation.z=0.05) ===
  const globeGroup = new THREE.Group();
  globeGroup.position.set(0, 0, 0);
  globeGroup.scale.setScalar(1);
  globeGroup.rotation.x = 0.15;
  globeGroup.rotation.z = 0.05;
  scene.add(globeGroup);

  // === Fill sphere (EXACT: colorWrite=false, depthWrite=true, radius 0.99) ===
  // Invisible but writes depth → blocks back dots naturally
  const fillGeo = new THREE.SphereGeometry(0.99, 32, 32);
  const fillMat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true });
  const fillMesh = new THREE.Mesh(fillGeo, fillMat);
  fillMesh.renderOrder = -1;
  globeGroup.add(fillMesh);

  // === Dot texture (EXACT: 64x64, radial gradient, hard edge at 0.82) ===
  const dotTexture = createDotTexture(THREE);

  // === Edge dots (white, with KILL_BACK shader) ===
  const edgePositions: number[] = [];
  const radius = 1.0;
  for (const [lat, lng] of landPoints) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    edgePositions.push(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }

  // PointsMaterial with onBeforeCompile (EXACT replica of reference shader)
  const edgeMat = new THREE.PointsMaterial({
    color: M.edgeColor,       // #ffffff
    size: M.pointSize,        // 0.005
    sizeAttenuation: true,
    depthWrite: false,
    transparent: true,
    map: dotTexture,
    alphaTest: 0,
    opacity: 1,
  });

  // Inject shader: KILL_BACK + point size attenuation (EXACT from reference)
  (edgeMat as any).onBeforeCompile = (shader: any) => {
    shader.uniforms.uCamPos = { value: new THREE.Vector3() };
    shader.uniforms.uBackOpacity = { value: M.backOpacity };
    shader.defines = shader.defines || {};
    if (M.killBack) shader.defines.KILL_BACK = 1;

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nuniform vec3 uCamPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWorldPos = (modelMatrix * vec4(transformed,1.0)).xyz;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nfloat ndv = dot(normalize(uCamPos - vWorldPos), normalize(vWorldPos));\ngl_PointSize *= mix(0.6, 1.0, smoothstep(0.0, 0.25, ndv));");

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;\nuniform vec3 uCamPos;\nuniform float uBackOpacity;")
      .replace("#include <output_fragment>", `{
        vec3 viewDir = normalize(uCamPos - vWorldPos);
        vec3 normalDir = normalize(vWorldPos);
        float nd = dot(viewDir, normalDir);
        #ifdef KILL_BACK
          if (nd <= 0.0) discard;
        #else
          diffuseColor.a *= mix(uBackOpacity, 1.0, smoothstep(0.0, 0.25, nd));
        #endif
      }
      #include <output_fragment>`);

    (edgeMat as any).userData = { shader };
  };

  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgePositions, 3));
  globeGroup.add(new THREE.Points(edgeGeo, edgeMat));

  // === Pin markers (EXACT: pinSize, pinDotColor, pinAltitude, haloScale) ===
  const pinCities = [
    { lat: -23.55, lng: -46.63 }, { lat: 40.71, lng: -74.0 },
    { lat: 51.5, lng: -0.13 }, { lat: 35.68, lng: 139.69 },
    { lat: 1.35, lng: 103.82 }, { lat: -33.87, lng: 151.21 },
    { lat: 25.2, lng: 55.27 }, { lat: 48.85, lng: 2.35 },
  ];

  const pinGeo = new THREE.SphereGeometry(M.pinSize, 8, 8);
  const pinMat = new THREE.MeshBasicMaterial({ color: M.pinDotColor });
  const haloGeo = new THREE.SphereGeometry(M.pinSize * M.haloScale, 8, 8);
  const haloMat = new THREE.MeshBasicMaterial({
    color: M.pinDotColor, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });

  pinCities.forEach((c) => {
    const v = latLngToVec3(c.lat, c.lng, 1 + M.pinAltitude);
    const pin = new THREE.Mesh(pinGeo, pinMat); pin.position.copy(v); globeGroup.add(pin);
    const halo = new THREE.Mesh(haloGeo, haloMat); halo.position.copy(v); globeGroup.add(halo);
  });

  // === Flight arcs (EXACT: arcColor, arcAltBase, arcAltMultiplier) ===
  const arcs: Array<{ line: THREE.Line; duration: number; delay: number }> = [];
  for (let i = 0; i < 12; i++) {
    const p1 = pinCities[i % pinCities.length];
    const p2 = pinCities[(i + 3) % pinCities.length];
    const start = latLngToVec3(p1.lat, p1.lng, 1 + M.pinAltitude);
    const end = latLngToVec3(p2.lat, p2.lng, 1 + M.pinAltitude);
    const arcPoints = buildArcCurve(THREE, start, end, 50, M.arcAltBase, M.arcAltMultiplier);
    const geo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const mat = new THREE.LineBasicMaterial({
      color: M.arcColor, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    globeGroup.add(line);
    arcs.push({ line, duration: 2 + Math.random() * 2, delay: Math.random() * 5 });
  }

  // === Resize (EXACT: setSize with false = don't update style) ===
  const resize = () => {
    const w = canvas.clientWidth || canvas.offsetWidth || 800;
    const h = canvas.clientHeight || canvas.offsetHeight || w;
    if (w < 2 || h < 2) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
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
    globeGroup.rotation.x = 0.15 + sp * -0.8;

    // Update camera position uniform for shader
    const shader = (edgeMat as any).userData?.shader;
    if (shader) {
      shader.uniforms.uCamPos.value.copy(camera.position);
    }

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
    edgeGeo.dispose(); edgeMat.dispose(); dotTexture.dispose();
    fillGeo.dispose(); fillMat.dispose();
    arcs.forEach((a) => { a.line.geometry.dispose(); (a.line.material as THREE.Material).dispose(); });
    pinGeo.dispose(); pinMat.dispose(); haloGeo.dispose(); haloMat.dispose();
    renderer.dispose();
  };
}

// === EXACT dot texture from reference (64x64, radial gradient, hard edge at 0.82) ===
function createDotTexture(THREE: typeof import("three")): THREE.Texture {
  const t = 64;
  const c = document.createElement("canvas"); c.width = c.height = t;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, t, t);
  const a = t / 2;
  const g = ctx.createRadialGradient(a, a, 0.82 * a, a, a, a);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(a, a, a - 0.5, 0, 2 * Math.PI); ctx.closePath(); ctx.fill();
  const tex = new THREE.Texture(c);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

// === EXACT latLngToVec3 from reference ===
function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const T = (window as any).THREE;
  const a = (90 - lat) * (Math.PI / 180);
  const o = (lng + 180) * (Math.PI / 180);
  return new T.Vector3(-r * Math.sin(a) * Math.cos(o), r * Math.cos(a), r * Math.sin(a) * Math.sin(o));
}

// === Arc curve builder ===
function buildArcCurve(THREE: typeof import("three"), start: any, end: any, segments: number, altBase: number, altMult: number): any[] {
  const T = (window as any).THREE;
  const points: any[] = [];
  const angle = start.angleTo(end);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const elevation = 1 + altBase + Math.sin(angle / 2) * (altBase + altMult);
  mid.normalize().multiplyScalar(elevation);
  const curve = new T.QuadraticBezierCurve3(start, mid, end);
  for (let i = 0; i <= segments; i++) points.push(curve.getPoint(i / segments));
  return points;
}
