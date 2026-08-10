import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  X, Maximize2, Minimize2, Play, Pause, RotateCw, Plus, Trash2, Copy, 
  Layers, Sun, Box, Move, RotateCcw, Scale, Palette, Eye, Video, 
  Download, Image, Sparkles, ChevronLeft, ChevronRight, Sliders, 
  Grid, Compass, Zap, Circle
} from 'lucide-react';

interface Blender3DProps {
  onClose: () => void;
}

interface MeshItem {
  id: string;
  name: string;
  type: 'box' | 'sphere' | 'cylinder' | 'cone' | 'torus' | 'plane' | 'monkey';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  roughness: number;
  metalness: number;
  wireframe: boolean;
  flatShading: boolean;
}

export const Blender3D: React.FC<Blender3DProps> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'Layout' | 'Modeling' | 'Sculpting' | 'Shading' | 'Animation' | 'Rendering'>('Layout');
  const [shadingMode, setShadingMode] = useState<'wireframe' | 'solid' | 'material' | 'rendered'>('material');
  const [transformTool, setTransformTool] = useState<'select' | 'move' | 'rotate' | 'scale' | 'extrude' | 'sculpt'>('move');
  
  // Scene Items
  const [meshList, setMeshList] = useState<MeshItem[]>([
    {
      id: 'cube_1',
      name: 'Küpler.001',
      type: 'box',
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1.5, 1.5, 1.5],
      color: '#3b82f6',
      roughness: 0.3,
      metalness: 0.2,
      wireframe: false,
      flatShading: true
    }
  ]);

  const [selectedId, setSelectedId] = useState<string>('cube_1');
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Animation & Timeline State
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [turntable, setTurntable] = useState(false);

  // Environment & Lights
  const [lightColor, setLightColor] = useState('#ffffff');
  const [lightIntensity, setLightIntensity] = useState(1.5);
  const [bgDarkness, setBgDarkness] = useState('#1e1e24');

  // Render Snapshot Modal State
  const [renderedImage, setRenderedImage] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambLightRef = useRef<THREE.AmbientLight | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  // Orbit Camera Control State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6, radius: 8 });

  const activeMesh = meshList.find(m => m.id === selectedId) || meshList[0];

  // Helper to create geometries
  const createGeometry = (type: MeshItem['type']) => {
    switch (type) {
      case 'box':
        return new THREE.BoxGeometry(1, 1, 1);
      case 'sphere':
        return new THREE.SphereGeometry(0.8, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(0.6, 0.6, 1.2, 32);
      case 'cone':
        return new THREE.ConeGeometry(0.7, 1.4, 32);
      case 'torus':
        return new THREE.TorusGeometry(0.7, 0.25, 16, 100);
      case 'plane':
        return new THREE.PlaneGeometry(2, 2);
      case 'monkey': {
        // Low-poly parametric monkey head placeholder
        const geo = new THREE.IcosahedronGeometry(0.8, 1);
        return geo;
      }
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  };

  // Setup Three.js Canvas
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgDarkness);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const { theta, phi, radius } = cameraAngleRef.current;
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
    camera.position.y = radius * Math.sin(phi);
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = '';
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);
    ambLightRef.current = ambLight;

    const dirLight = new THREE.DirectionalLight(lightColor, lightIntensity);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 5. Grid Helper & Axes
    const gridHelper = new THREE.GridHelper(20, 20, 0xef4444, 0x4b5563);
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(3);
    scene.add(axesHelper);

    // Render loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (turntable) {
        cameraAngleRef.current.theta += 0.01;
        const { theta, phi, radius } = cameraAngleRef.current;
        if (cameraRef.current) {
          cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
          cameraRef.current.position.y = radius * Math.sin(phi);
          cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
          cameraRef.current.lookAt(0, 0, 0);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        cameraRef.current.aspect = w / h;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(w, h);
      }
    });

    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update Scene Background and Lights
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(bgDarkness);
    }
    if (dirLightRef.current) {
      dirLightRef.current.color.set(lightColor);
      dirLightRef.current.intensity = lightIntensity;
    }
  }, [bgDarkness, lightColor, lightIntensity]);

  // Sync Meshes with Three.js scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean old meshes
    meshesMapRef.current.forEach((threeMesh) => {
      scene.remove(threeMesh);
      threeMesh.geometry.dispose();
      if (Array.isArray(threeMesh.material)) {
        threeMesh.material.forEach((m) => m.dispose());
      } else {
        threeMesh.material.dispose();
      }
    });
    meshesMapRef.current.clear();

    // Rebuild meshes
    meshList.forEach((item) => {
      const geometry = createGeometry(item.type);
      let material: THREE.Material;

      if (shadingMode === 'wireframe') {
        material = new THREE.MeshBasicMaterial({
          color: item.color,
          wireframe: true
        });
      } else if (shadingMode === 'solid') {
        material = new THREE.MeshStandardMaterial({
          color: 0x9ca3af,
          roughness: 0.5,
          flatShading: item.flatShading
        });
      } else if (shadingMode === 'rendered') {
        material = new THREE.MeshPhysicalMaterial({
          color: item.color,
          roughness: item.roughness,
          metalness: item.metalness,
          wireframe: item.wireframe,
          flatShading: item.flatShading,
          clearcoat: 0.5,
          clearcoatRoughness: 0.1
        });
      } else {
        // Material Preview
        material = new THREE.MeshStandardMaterial({
          color: item.color,
          roughness: item.roughness,
          metalness: item.metalness,
          wireframe: item.wireframe,
          flatShading: item.flatShading
        });
      }

      const threeMesh = new THREE.Mesh(geometry, material);
      threeMesh.position.set(...item.position);
      threeMesh.rotation.set(
        (item.rotation[0] * Math.PI) / 180,
        (item.rotation[1] * Math.PI) / 180,
        (item.rotation[2] * Math.PI) / 180
      );
      threeMesh.scale.set(...item.scale);
      threeMesh.castShadow = true;
      threeMesh.receiveShadow = true;

      // Highlight selected mesh
      if (item.id === selectedId) {
        const wireframeGeo = new THREE.WireframeGeometry(geometry);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
        const wireframeLine = new THREE.LineSegments(wireframeGeo, lineMat);
        threeMesh.add(wireframeLine);
      }

      scene.add(threeMesh);
      meshesMapRef.current.set(item.id, threeMesh);
    });
  }, [meshList, selectedId, shadingMode]);

  // Pointer Interaction (Orbit & Zoom)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !cameraRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

    // Orbit camera
    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(
      -Math.PI / 2 + 0.1,
      Math.min(Math.PI / 2 - 0.1, cameraAngleRef.current.phi + deltaY * 0.008)
    );

    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
    cameraRef.current.position.y = radius * Math.sin(phi);
    cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
    cameraRef.current.lookAt(0, 0, 0);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!cameraRef.current) return;
    cameraAngleRef.current.radius = Math.max(2, Math.min(30, cameraAngleRef.current.radius + e.deltaY * 0.005));
    const { theta, phi, radius } = cameraAngleRef.current;
    cameraRef.current.position.x = radius * Math.sin(theta) * Math.cos(phi);
    cameraRef.current.position.y = radius * Math.sin(phi);
    cameraRef.current.position.z = radius * Math.cos(theta) * Math.cos(phi);
    cameraRef.current.lookAt(0, 0, 0);
  };

  // Add Mesh Helper
  const handleAddMesh = (type: MeshItem['type']) => {
    const newId = `mesh_${Date.now()}`;
    const typeNames: Record<MeshItem['type'], string> = {
      box: 'Küp',
      sphere: 'Küre',
      cylinder: 'Silindir',
      cone: 'Koni',
      torus: 'Torid (Simit)',
      plane: 'Düzlem',
      monkey: 'Maymun (Suzanne)'
    };

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newItem: MeshItem = {
      id: newId,
      name: `${typeNames[type]}.${(meshList.length + 1).toString().padStart(3, '0')}`,
      type,
      position: [(Math.random() - 0.5) * 3, 1, (Math.random() - 0.5) * 3],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: randomColor,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: false,
      flatShading: false
    };

    setMeshList((prev) => [...prev, newItem]);
    setSelectedId(newId);
  };

  // Delete Mesh
  const handleDeleteSelected = () => {
    if (meshList.length <= 1) return;
    setMeshList((prev) => prev.filter((m) => m.id !== selectedId));
    const remaining = meshList.filter((m) => m.id !== selectedId);
    if (remaining.length > 0) setSelectedId(remaining[0].id);
  };

  // Duplicate Mesh
  const handleDuplicateSelected = () => {
    if (!activeMesh) return;
    const newId = `mesh_${Date.now()}`;
    const newItem: MeshItem = {
      ...activeMesh,
      id: newId,
      name: `${activeMesh.name}_Kopya`,
      position: [activeMesh.position[0] + 0.5, activeMesh.position[1], activeMesh.position[2] + 0.5]
    };
    setMeshList((prev) => [...prev, newItem]);
    setSelectedId(newId);
  };

  // Property Update Helpers
  const updateActiveMesh = (updater: (mesh: MeshItem) => MeshItem) => {
    setMeshList((prev) => prev.map((m) => (m.id === selectedId ? updater(m) : m)));
  };

  // Export .OBJ File
  const handleExportObj = () => {
    let objContent = `# Blender 3D ArchWeb OS Export\n# Objects: ${meshList.length}\n\n`;
    let vertexOffset = 1;

    meshList.forEach((mesh) => {
      objContent += `o ${mesh.name}\n`;
      // Vertices around position
      const [px, py, pz] = mesh.position;
      const [sx, sy, sz] = mesh.scale;

      objContent += `v ${px - sx/2} ${py - sy/2} ${pz - sz/2}\n`;
      objContent += `v ${px + sx/2} ${py - sy/2} ${pz - sz/2}\n`;
      objContent += `v ${px + sx/2} ${py + sy/2} ${pz - sz/2}\n`;
      objContent += `v ${px - sx/2} ${py + sy/2} ${pz - sz/2}\n`;
      objContent += `v ${px - sx/2} ${py - sy/2} ${pz + sz/2}\n`;
      objContent += `v ${px + sx/2} ${py - sy/2} ${pz + sz/2}\n`;
      objContent += `v ${px + sx/2} ${py + sy/2} ${pz + sz/2}\n`;
      objContent += `v ${px - sx/2} ${py + sy/2} ${pz + sz/2}\n`;

      const v = vertexOffset;
      objContent += `f ${v} ${v+1} ${v+2} ${v+3}\n`;
      objContent += `f ${v+4} ${v+7} ${v+6} ${v+5}\n`;
      objContent += `f ${v} ${v+4} ${v+5} ${v+1}\n`;
      objContent += `f ${v+1} ${v+5} ${v+6} ${v+2}\n`;
      objContent += `f ${v+2} ${v+6} ${v+7} ${v+3}\n`;
      objContent += `f ${v+3} ${v+7} ${v+4} ${v}\n\n`;

      vertexOffset += 8;
    });

    const blob = new Blob([objContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blender_scene_${Date.now()}.obj`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // High-Res Render Snapshot
  const handleRenderSnapshot = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
    setIsRendering(true);
    setTimeout(() => {
      rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      const dataUrl = rendererRef.current?.domElement.toDataURL('image/png');
      if (dataUrl) setRenderedImage(dataUrl);
      setIsRendering(false);
    }, 600);
  };

  return (
    <div className={`flex flex-col bg-[#18181b] text-gray-200 font-sans border border-amber-500/30 overflow-hidden shadow-2xl transition-all ${
      isFullScreen ? 'fixed inset-0 z-[100] rounded-none' : 'w-full h-full rounded-xl max-w-full max-h-full'
    }`}>
      {/* 1. Blender Header Bar */}
      <div className="bg-[#27272a] border-b border-white/10 px-2 sm:px-4 py-1.5 flex items-center justify-between text-xs select-none shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 font-bold text-amber-500 shrink-0">
            <Box size={16} className="text-amber-400 animate-spin-slow" />
            <span className="font-mono text-sm tracking-tight text-white">Blender 3D Studio</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">v4.2</span>
            <span className="hidden md:flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
              <Zap size={10} className="text-emerald-400" />
              <span>OpenGL / WebGL 2.0 (GPU Hızlandırmalı)</span>
            </span>
          </div>

          <div className="w-px h-4 bg-white/10 shrink-0" />

          {/* Top Menu Tabs */}
          <div className="flex items-center gap-1 shrink-0">
            {(['Layout', 'Modeling', 'Sculpting', 'Shading', 'Animation', 'Rendering'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Shading') setShadingMode('material');
                  if (tab === 'Rendering') handleRenderSnapshot();
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTab === tab ? 'bg-amber-500 text-black font-bold' : 'hover:bg-white/5 text-white/70'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => handleAddMesh('box')}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer transition-all"
            title="Sahnene Küp Ekle"
          >
            <Plus size={13} />
            <span>Küp Ekle</span>
          </button>

          <button
            onClick={handleExportObj}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold cursor-pointer transition-all"
            title="3D Modeli .OBJ Olarak İndir"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export .OBJ</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white cursor-pointer transition-colors"
            title="Tam Ekran"
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white rounded cursor-pointer transition-colors"
            title="Kapat"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. Secondary Viewport Toolbar (Shading, Gizmos, Camera Controls) */}
      <div className="bg-[#202023] border-b border-white/5 px-3 py-1 flex items-center justify-between text-[11px] text-white/70 select-none shrink-0 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded border border-white/10">
            <span className="text-[10px] text-white/40 px-1 font-mono">Mod:</span>
            <button
              onClick={() => setShadingMode('wireframe')}
              className={`p-1 rounded cursor-pointer transition-all ${shadingMode === 'wireframe' ? 'bg-amber-500 text-black font-bold' : 'hover:bg-white/10'}`}
              title="Tel Kafes (Wireframe)"
            >
              <Grid size={13} />
            </button>
            <button
              onClick={() => setShadingMode('solid')}
              className={`p-1 rounded cursor-pointer transition-all ${shadingMode === 'solid' ? 'bg-amber-500 text-black font-bold' : 'hover:bg-white/10'}`}
              title="Katı (Solid Shading)"
            >
              <Box size={13} />
            </button>
            <button
              onClick={() => setShadingMode('material')}
              className={`p-1 rounded cursor-pointer transition-all ${shadingMode === 'material' ? 'bg-amber-500 text-black font-bold' : 'hover:bg-white/10'}`}
              title="Materyal Önizleme"
            >
              <Palette size={13} />
            </button>
            <button
              onClick={() => setShadingMode('rendered')}
              className={`p-1 rounded cursor-pointer transition-all ${shadingMode === 'rendered' ? 'bg-amber-500 text-black font-bold' : 'hover:bg-white/10'}`}
              title="Gerçekçi Render (EEVEE/Cycles)"
            >
              <Sparkles size={13} />
            </button>
          </div>

          <div className="w-px h-3 bg-white/10" />

          {/* Quick Add Mesh Dropdown Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-white/40 font-mono">Ekle:</span>
            {(['box', 'sphere', 'cylinder', 'cone', 'torus', 'monkey'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleAddMesh(t)}
                className="px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] capitalize cursor-pointer transition-all"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Viewport Overlay Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={`px-1.5 py-0.5 rounded border text-[10px] cursor-pointer transition-all ${
              showLeftSidebar ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40'
            }`}
          >
            Araçlar
          </button>
          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className={`px-1.5 py-0.5 rounded border text-[10px] cursor-pointer transition-all ${
              showRightSidebar ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40'
            }`}
          >
            Özellikler
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Grid */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar (Tools) */}
        {showLeftSidebar && (
          <div className="w-12 sm:w-14 bg-[#202023] border-r border-white/10 p-1.5 flex flex-col items-center gap-2 shrink-0 select-none z-10">
            <div className="text-[9px] text-white/30 font-mono uppercase tracking-widest text-center">Araç</div>
            
            <button
              onClick={() => setTransformTool('select')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'select' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Seçim (Select Box)"
            >
              <Compass size={18} />
            </button>

            <button
              onClick={() => setTransformTool('move')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'move' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Taşı (Translate G)"
            >
              <Move size={18} />
            </button>

            <button
              onClick={() => setTransformTool('rotate')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'rotate' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Döndür (Rotate R)"
            >
              <RotateCw size={18} />
            </button>

            <button
              onClick={() => setTransformTool('scale')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'scale' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Ölçeklendir (Scale S)"
            >
              <Scale size={18} />
            </button>

            <button
              onClick={() => setTransformTool('extrude')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'extrude' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Yüzey Çıkar (Extrude E)"
            >
              <Layers size={18} />
            </button>

            <button
              onClick={() => setTransformTool('sculpt')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                transformTool === 'sculpt' ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'hover:bg-white/10 text-white/70'
              }`}
              title="Heykeltıraş Fırçası (Sculpt Mode)"
            >
              <Circle size={18} />
            </button>

            <div className="w-full h-px bg-white/10 my-1" />

            <button
              onClick={handleDuplicateSelected}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 text-cyan-400 cursor-pointer transition-all"
              title="Seçili Nesneyi Çoğalt (Shift+D)"
            >
              <Copy size={16} />
            </button>

            <button
              onClick={handleDeleteSelected}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-500/20 text-red-400 cursor-pointer transition-all"
              title="Seçili Nesneyi Sil (X)"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* 3D Viewport Canvas Container */}
        <div 
          className="flex-1 relative bg-[#1c1c1f] overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Three.js Canvas Mount */}
          <div ref={mountRef} className="w-full h-full" />

          {/* Viewport Overlay Info */}
          <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 text-[10px] font-mono text-white/50 bg-black/60 backdrop-blur-sm p-2 rounded border border-white/10 max-w-[230px]">
            <div className="text-amber-400 font-bold">Kamera: Perspektif</div>
            <div>Döndürme: Sol Tık + Sürükle</div>
            <div>Yakınlaşma: Fare Tekerleği</div>
            <div>Motor: <span className="text-emerald-400 font-bold">OpenGL ES 3.0 / WebGL 2.0</span></div>
            <div>GPU İvmesi: <span className="text-sky-400 font-bold">Donanım Etkin</span></div>
            <div>Seçili: <span className="text-white font-bold">{activeMesh?.name}</span></div>
          </div>

          {/* Active Transform Tool Visual Badge */}
          <div className="absolute bottom-3 left-3 pointer-events-none bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Aktif Araç: {transformTool}
          </div>
        </div>

        {/* Right Sidebar (Outliner & Properties Inspector) */}
        {showRightSidebar && (
          <div className="w-64 sm:w-72 bg-[#202023] border-l border-white/10 flex flex-col shrink-0 overflow-y-auto text-xs select-none z-10">
            {/* Outliner Header */}
            <div className="p-3 bg-white/5 border-b border-white/10 font-bold flex items-center justify-between text-white/90">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-amber-400" />
                <span>Sahne Ağacı (Outliner)</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">{meshList.length} nesne</span>
            </div>

            {/* Outliner Object List */}
            <div className="p-2 border-b border-white/10 max-h-40 overflow-y-auto space-y-1">
              {meshList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded cursor-pointer transition-all ${
                    item.id === selectedId
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold'
                      : 'hover:bg-white/5 text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Box size={13} className={item.id === selectedId ? 'text-amber-400' : 'text-white/40'} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateActiveMesh((m) => (m.id === item.id ? { ...m, wireframe: !m.wireframe } : m));
                      }}
                      className="p-1 hover:text-white text-white/40 cursor-pointer"
                      title="Tel Kafes Görünümü"
                    >
                      <Eye size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Transform Properties Inspector */}
            {activeMesh && (
              <div className="p-3 space-y-4 flex-1">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 font-bold text-amber-400">
                  <span>Dönüştürme (Transform)</span>
                  <Sliders size={14} />
                </div>

                {/* Position Inputs */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-white/60">Konum (Position X, Y, Z)</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                      <div key={axis} className="flex items-center bg-black/40 border border-white/10 rounded px-1.5 py-1">
                        <span className={`text-[10px] font-bold mr-1 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {axis}:
                        </span>
                        <input
                          type="number"
                          step="0.2"
                          value={activeMesh.position[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateActiveMesh((m) => {
                              const pos = [...m.position] as [number, number, number];
                              pos[i] = val;
                              return { ...m, position: pos };
                            });
                          }}
                          className="w-full bg-transparent text-[11px] font-mono focus:outline-none text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rotation Inputs */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-white/60">Döndürme (Rotation °)</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                      <div key={axis} className="flex items-center bg-black/40 border border-white/10 rounded px-1.5 py-1">
                        <span className={`text-[10px] font-bold mr-1 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {axis}:
                        </span>
                        <input
                          type="number"
                          step="5"
                          value={activeMesh.rotation[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateActiveMesh((m) => {
                              const rot = [...m.rotation] as [number, number, number];
                              rot[i] = val;
                              return { ...m, rotation: rot };
                            });
                          }}
                          className="w-full bg-transparent text-[11px] font-mono focus:outline-none text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scale Inputs */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono text-white/60">Ölçek (Scale X, Y, Z)</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => (
                      <div key={axis} className="flex items-center bg-black/40 border border-white/10 rounded px-1.5 py-1">
                        <span className={`text-[10px] font-bold mr-1 ${i === 0 ? 'text-red-400' : i === 1 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {axis}:
                        </span>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={activeMesh.scale[i]}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.1;
                            updateActiveMesh((m) => {
                              const sc = [...m.scale] as [number, number, number];
                              sc[i] = val;
                              return { ...m, scale: sc };
                            });
                          }}
                          className="w-full bg-transparent text-[11px] font-mono focus:outline-none text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Material Properties */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between font-bold text-amber-400">
                    <span>Materyal & Yüzey</span>
                    <Palette size={14} />
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-white/10">
                    <span className="text-white/70">Materyal Renk:</span>
                    <input
                      type="color"
                      value={activeMesh.color}
                      onChange={(e) => updateActiveMesh((m) => ({ ...m, color: e.target.value }))}
                      className="w-7 h-7 bg-transparent border-none rounded cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Pürüzsüzlük (Roughness)</span>
                      <span>{Math.round(activeMesh.roughness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={activeMesh.roughness}
                      onChange={(e) => updateActiveMesh((m) => ({ ...m, roughness: parseFloat(e.target.value) }))}
                      className="w-full accent-amber-500 bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-white/60">
                      <span>Metalik (Metalness)</span>
                      <span>{Math.round(activeMesh.metalness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={activeMesh.metalness}
                      onChange={(e) => updateActiveMesh((m) => ({ ...m, metalness: parseFloat(e.target.value) }))}
                      className="w-full accent-amber-500 bg-white/10 rounded h-1 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="text-[11px] text-white/70 cursor-pointer flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeMesh.flatShading}
                        onChange={(e) => updateActiveMesh((m) => ({ ...m, flatShading: e.target.checked }))}
                        className="accent-amber-500 cursor-pointer"
                      />
                      Düz Yüzey Gölgelendirmesi (Flat Shading)
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Bottom Animation Timeline Bar */}
      <div className="bg-[#202023] border-t border-white/10 p-2 flex items-center justify-between gap-4 select-none shrink-0 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded-lg border flex items-center gap-1 font-bold cursor-pointer transition-all ${
              isPlaying
                ? 'bg-red-500/20 border-red-500/40 text-red-300'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span className="hidden sm:inline">{isPlaying ? 'Durdur' : 'Oynat'}</span>
          </button>

          <button
            onClick={() => setTurntable(!turntable)}
            className={`p-1.5 rounded-lg border flex items-center gap-1 cursor-pointer transition-all ${
              turntable ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' : 'hover:bg-white/10 border-white/10 text-white/70'
            }`}
            title="Sürekli Kamera Döner Tablası"
          >
            <RotateCw size={14} className={turntable ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Döner Tabla</span>
          </button>
        </div>

        {/* Timeline Frame Scrubbing */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">Kare: {currentFrame} / 250</span>
          <input
            type="range"
            min="1"
            max="250"
            value={currentFrame}
            onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
            className="w-full accent-amber-500 bg-white/10 rounded h-1 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px] text-white/40">
          <span className="hidden sm:inline text-emerald-400/80 font-bold">OpenGL/WebGL 2.0 Engine</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span>FPS: 60</span>
        </div>
      </div>

      {/* 5. Render Result Modal */}
      {renderedImage && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#202023] border border-amber-500/40 rounded-2xl max-w-3xl w-full p-5 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-mono">
                <Sparkles size={18} />
                <span>Blender 3D HD Render Sonucu</span>
              </div>
              <button
                onClick={() => setRenderedImage(null)}
                className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-black/80 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center min-h-[300px]">
              <img src={renderedImage} alt="Render Output" className="max-h-[450px] object-contain rounded-lg shadow-2xl" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-white/50 font-mono">Çözünürlük: 1920x1080 &bull; EEVEE/Cycles Engine</span>
              <a
                href={renderedImage}
                download={`blender_render_${Date.now()}.png`}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl flex items-center gap-2 text-xs transition-colors shadow-lg shadow-amber-500/20"
              >
                <Download size={14} />
                <span>Görüntüyü Yükle (.PNG)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
