import React, { useEffect, useRef, useState } from "react";
import {
  Color,
  Scene,
  PerspectiveCamera,
  Vector3,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  PointLight,
  Group,
  Mesh,
  CylinderGeometry,
  SphereGeometry,
  RingGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DoubleSide,
  AdditiveBlending,
  Raycaster,
  Vector2,
  Clock
} from "three";
import ThreeGlobe from "three-globe";
import countries from "../../data/globe.json";

export interface Position {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string;
}

export interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  city?: string;
  state?: string;
  isHQ?: boolean;
  beds?: string;
}

export type GlobeConfig = {
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  arcTime?: number;
  arcLength?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  rotationDelaySeconds?: number;
};

export interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
  points?: GlobePoint[];
  onSelectPoint?: (point: GlobePoint) => void;
}

// Convert Lat/Lng to Vector3 on sphere of radius R
function getGlobeVector(lat: number, lng: number, altitude: number = 0, radius: number = 100): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const r = radius * (1 + altitude);
  const x = -(r * Math.sin(phi) * Math.cos(theta));
  const z = r * Math.sin(phi) * Math.sin(theta);
  const y = r * Math.cos(phi);
  return new Vector3(x, y, z);
}

export function GlobeView({ globeConfig, data, points = [], onSelectPoint }: WorldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: GlobePoint;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new Scene();
    scene.background = new Color(globeConfig.globeColor || "#030712");

    const camera = new PerspectiveCamera(38, width / height, 1, 2000);
    // Camera framing focused on India
    camera.position.set(0, 20, 270);
    camera.lookAt(0, 0, 0);

    // 2. WebGL Renderer
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambient = new AmbientLight(new Color(globeConfig.ambientLight || "#ffffff"), 1.4);
    scene.add(ambient);

    const dirLeft = new DirectionalLight(new Color(globeConfig.directionalLeftLight || "#f97316"), 2.2);
    dirLeft.position.set(-300, 200, 300);
    scene.add(dirLeft);

    const dirTop = new DirectionalLight(new Color(globeConfig.directionalTopLight || "#ffffff"), 2.0);
    dirTop.position.set(200, 400, 200);
    scene.add(dirTop);

    // 4. ThreeGlobe Instance with Hexagonal Polygons
    const globe = new ThreeGlobe()
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.62)
      .showAtmosphere(globeConfig.showAtmosphere !== false)
      .atmosphereColor(globeConfig.atmosphereColor || "#F97316")
      .atmosphereAltitude(globeConfig.atmosphereAltitude || 0.16)
      .hexPolygonColor((d: any) => {
        // HIGHLIGHT INDIA IN VIBRANT SANKARA ORANGE
        const iso = d?.properties?.ISO_A3 || d?.properties?.ADM0_A3 || d?.properties?.SOV_A3;
        const name = d?.properties?.ADMIN || d?.properties?.NAME || d?.properties?.SOVEREIGNT;
        if (iso === "IND" || name === "India") {
          return "#EA580C"; // Vibrant Sankara Orange for Indian Subcontinent
        }
        return globeConfig.polygonColor || "rgba(255, 255, 255, 0.22)";
      });

    // Globe Material setup
    const globeMaterial = globe.globeMaterial() as any;
    globeMaterial.color = new Color(globeConfig.globeColor || "#030712");
    globeMaterial.emissive = new Color(globeConfig.emissive || "#050B1A");
    globeMaterial.emissiveIntensity = globeConfig.emissiveIntensity || 0.2;
    globeMaterial.shininess = globeConfig.shininess || 0.95;

    // Glowing Connection Arcs from Coimbatore HQ
    if (data && data.length > 0) {
      globe
        .arcsData(data)
        .arcStartLat((d: any) => d.startLat)
        .arcStartLng((d: any) => d.startLng)
        .arcEndLat((d: any) => d.endLat)
        .arcEndLng((d: any) => d.endLng)
        .arcColor((d: any) => d.color || "#f97316")
        .arcAltitude((d: any) => d.arcAlt || 0.22)
        .arcStroke(() => 0.4)
        .arcDashLength(globeConfig.arcLength || 0.85)
        .arcDashInitialGap((d: any) => d.order || 1)
        .arcDashGap(10)
        .arcDashAnimateTime(() => globeConfig.arcTime || 1400);
    }

    scene.add(globe);

    // 5. PROPER 3D LOCATION MAP PINS (Tapered stem + Beacon head + Base wave ring)
    const pinObjects: { group: Group; mesh: Mesh; ring: Mesh; point: GlobePoint }[] = [];
    const pinsContainer = new Group();
    globe.add(pinsContainer);

    points.forEach((p) => {
      const isHQ = p.isHQ;
      const basePos = getGlobeVector(p.lat, p.lng, 0, 100);

      const pinGroup = new Group();
      pinGroup.position.copy(basePos);
      pinGroup.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), basePos.clone().normalize());

      // 3D Tapered Pin Needle (Cylinder)
      const pinHeight = isHQ ? 5.5 : 3.8;
      const stemGeo = new CylinderGeometry(isHQ ? 0.35 : 0.25, 0.08, pinHeight, 16);
      const stemMat = new MeshStandardMaterial({
        color: isHQ ? 0xffffff : 0xf97316,
        emissive: isHQ ? 0xfba04b : 0xea580c,
        emissiveIntensity: isHQ ? 1.8 : 1.2,
        metalness: 0.2,
        roughness: 0.2
      });
      const stemMesh = new Mesh(stemGeo, stemMat);
      stemMesh.position.set(0, pinHeight / 2, 0);
      pinGroup.add(stemMesh);

      // 3D Spherical Map Pin Beacon Head
      const headRadius = isHQ ? 1.4 : 0.95;
      const headGeo = new SphereGeometry(headRadius, 16, 16);
      const headMat = new MeshStandardMaterial({
        color: isHQ ? 0xffffff : 0xfba04b,
        emissive: isHQ ? 0xffffff : 0xf97316,
        emissiveIntensity: isHQ ? 2.5 : 1.8,
        roughness: 0.1
      });
      const headMesh = new Mesh(headGeo, headMat);
      headMesh.position.set(0, pinHeight, 0);
      headMesh.userData = { point: p };
      pinGroup.add(headMesh);

      // Pulsing Base Wave Ring
      const ringGeo = new RingGeometry(0.3, isHQ ? 2.8 : 1.8, 32);
      const ringMat = new MeshBasicMaterial({
        color: isHQ ? 0xfba04b : 0xf97316,
        side: DoubleSide,
        transparent: true,
        opacity: 0.85,
        blending: AdditiveBlending
      });
      const ringMesh = new Mesh(ringGeo, ringMat);
      ringMesh.position.copy(getGlobeVector(p.lat, p.lng, 0.005, 100));
      ringMesh.lookAt(new Vector3(0, 0, 0));
      globe.add(ringMesh);

      pinsContainer.add(pinGroup);
      pinObjects.push({ group: pinGroup, mesh: headMesh, ring: ringMesh, point: p });
    });

    // 6. DEFAULT POSITION: CENTERED DIRECTLY ON INDIA
    // Longitude 78.96° E -> Y rotation
    const targetLng = globeConfig.initialPosition?.lng ?? 78.96;
    const targetLat = globeConfig.initialPosition?.lat ?? 20.59;
    
    // Exact orientation facing India to the user
    const initialRotY = -((targetLng + 90) * Math.PI) / 180;
    const initialRotX = 0.28;

    globe.rotation.y = initialRotY;
    globe.rotation.x = initialRotX;

    // 7. Mouse Drag, Raycasting & Inertia
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };
    let isHovering = false;

    const raycaster = new Raycaster();
    const mouse = new Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        dragVelocity = { x: dx * 0.005, y: dy * 0.005 };
        globe.rotation.y += dragVelocity.x;
        globe.rotation.x = Math.max(-0.75, Math.min(0.75, globe.rotation.x + dragVelocity.y));
        prevMouse = { x: e.clientX, y: e.clientY };
        setHoveredPoint(null);
      } else {
        // Raycast against pin heads
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pinObjects.map((p) => p.mesh), false);

        if (intersects.length > 0) {
          const hitObj = intersects[0].object;
          const pt = hitObj.userData.point as GlobePoint;
          if (pt) {
            isHovering = true;
            container.style.cursor = "pointer";
            setHoveredPoint({
              point: pt,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
            return;
          }
        }

        isHovering = false;
        container.style.cursor = "grab";
        setHoveredPoint(null);
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = () => {
      if (hoveredPoint && onSelectPoint) {
        onSelectPoint(hoveredPoint.point);
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);

    // 8. Animation Loop with Initial Pause on India
    const clock = new Clock();
    const rotationDelay = globeConfig.rotationDelaySeconds ?? 2.5; // Stay on India for first 2.5s
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Start auto-rotation only after initial pause on India
      if (elapsed > rotationDelay && !isDragging && !isHovering && globeConfig.autoRotate !== false) {
        const speed = globeConfig.autoRotateSpeed || 0.0012;
        // Smoothly accelerate into rotation
        const ramp = Math.min(1, (elapsed - rotationDelay) / 1.5);
        globe.rotation.y += speed * ramp;
      }

      // Drag inertia damping
      if (!isDragging) {
        dragVelocity.x *= 0.92;
        dragVelocity.y *= 0.92;
        globe.rotation.y += dragVelocity.x;
      }

      // Animate pulsing base rings on each hospital pin
      pinObjects.forEach((p, idx) => {
        const pulse = (Math.sin(elapsed * 3.5 + idx * 0.8) + 1) / 2;
        const scale = 1 + pulse * 0.9;
        p.ring.scale.set(scale, scale, scale);
        (p.ring.material as MeshBasicMaterial).opacity = 0.85 - pulse * 0.6;
      });

      renderer.render(scene, camera);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [globeConfig, data, points, onSelectPoint]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Hover Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute z-40 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y - 12}px` }}
        >
          <div className="bg-slate-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-orange-500/50 text-xs min-w-[220px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                Sankara Eye Hospital
              </span>
            </div>
            
            <h4 className="font-extrabold text-sm text-white leading-tight">
              {hoveredPoint.point.label}
            </h4>
            
            <div className="text-[11px] text-slate-300 mt-1 font-medium">
              {hoveredPoint.point.city}, {hoveredPoint.point.state}
            </div>

            {hoveredPoint.point.beds && (
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-amber-300 font-semibold">
                <span>{hoveredPoint.point.beds}</span>
                {hoveredPoint.point.isHQ && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white font-black text-[9px]">
                    HQ
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
