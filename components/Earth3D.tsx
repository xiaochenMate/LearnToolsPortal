
import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCw, Globe, ChevronRight, ChevronLeft, Move, Sun as SunIcon, Database, Crosshair, BarChart3, Radio, Scan, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

declare global {
  interface Window {
    THREE: any;
  }
}

interface Earth3DProps {
  onClose: () => void;
}

const PLANETS_DATA: Record<string, any> = {
  Galaxy: { name: '银河系', type: '星系', tex: 'starmap', size: 3000, dist: 0, speed: 0.00001, color: '#A5B4FC', isGalaxy: true },
  Sun: { name: '太阳', type: '恒星', desc: '太阳系核心，一颗黄矮星，其质量占整个系统的 99.86%。', tex: 'sun', size: 50, dist: 0, speed: 0, color: '#FFD700', status: '核聚变反应', isSun: true },
  Mercury: { name: '水星', type: '岩质', desc: '最靠近太阳的行星，大气层极其稀薄，昼夜温差悬殊。', tex: 'mercury', size: 4, dist: 100, speed: 0.008, color: '#9CA3AF', status: '地壳稳定' },
  Venus: { name: '金星', type: '岩质', desc: '太阳系中最热的行星，拥有极厚的高浓度硫酸大气层。', tex: 'venus_surface', size: 6.5, dist: 150, speed: 0.006, color: '#FCD34D', status: '极度高温' },
  Earth: { name: '地球', type: '生命', desc: '目前已知唯一存在生命的行星，拥有适宜的温度和充足的水分。', tex: 'earth_atmos_2048', size: 7.5, dist: 220, speed: 0.004, color: '#38BDF8', status: '生态活跃', hasAtmos: true },
  Moon: { name: '月球', type: '卫星', desc: '地球唯一的天然卫星，对地球的潮汐和自转轴稳定性起着关键作用。', tex: 'moon', size: 2, dist: 18, speed: 0.015, color: '#CBD5E1', isMoon: true, parent: '地球' },
  Mars: { name: '火星', type: '岩质', desc: '著名的红色星球，拥有稀薄的大气和太阳系最高的山峰。', tex: 'mars', size: 5.8, dist: 310, speed: 0.0035, color: '#FB7185', status: '局部沙尘暴' },
  Jupiter: { name: '木星', type: '气态', desc: '太阳系中体积最大的行星，它是一个巨大的气态巨行星。', tex: 'jupiter', size: 20, dist: 460, speed: 0.002, color: '#FDBA74', status: '强磁场环境' },
  Saturn: { name: '土星', type: '气态', desc: '以极其显著和壮丽的行星环系统而闻名于世。', tex: 'saturn', size: 17, dist: 640, speed: 0.0015, hasRing: true, color: '#FDE047', status: '环系波动' },
  Uranus: { name: '天王星', type: '冰巨', desc: '侧向自转的冰巨星，其自转轴几乎与公转轨道平面平行。', tex: 'uranus', size: 11, dist: 820, speed: 0.001, color: '#7DD3FC', status: '极度低温' },
  Neptune: { name: '海王星', type: '冰巨', desc: '离太阳最远的行星，其大气层中有剧烈风暴。', tex: 'neptune', size: 11, dist: 980, speed: 0.0008, color: '#6366F1', status: '超音速风' }
};

const Earth3D: React.FC<Earth3DProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const [selectedName, setSelectedName] = useState<string | null>('地球');
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  const engine = useRef({
    scene: null as any,
    camera: null as any,
    renderer: null as any,
    planets: new Map<string, any>(),
    raycaster: null as any,
    mouse: null as any,
    targetName: '地球' as string | null,
    isAutoRotating: true,
    maxAnisotropy: 1,
    vec_targetPos: null as any,
    vec_camPos: null as any,
    controls: {
      theta: 0, phi: Math.PI / 2.5,
      radius: 200, targetRadius: 200,
      isDragging: false,
      lastX: 0, lastY: 0
    }
  });

  const createLabelTexture = (name: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 512, 128);
    ctx.font = `900 72px "Orbitron", "Inter", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 25;
    ctx.shadowColor = color;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name.toUpperCase(), 256, 64);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name.toUpperCase(), 256, 64);
    const tex = new window.THREE.CanvasTexture(canvas);
    tex.anisotropy = engine.current.maxAnisotropy;
    return tex;
  };

  const createSunTexture = (color: string, opacity = 1) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.1, '#fffceb');
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.6, 'rgba(255, 100, 0, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = opacity;
    ctx.fillRect(0, 0, 512, 512);
    return new window.THREE.CanvasTexture(canvas);
  };

  useEffect(() => {
    if (initialized.current || !window.THREE || !containerRef.current) return;
    initialized.current = true;
    const THREE = window.THREE;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100000000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, stencil: false });
    engine.current.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    containerRef.current.appendChild(renderer.domElement);
    engine.current.scene = scene;
    engine.current.camera = camera;
    engine.current.renderer = renderer;
    engine.current.raycaster = new THREE.Raycaster();
    engine.current.mouse = new THREE.Vector2();
    engine.current.vec_targetPos = new THREE.Vector3();
    engine.current.vec_camPos = new THREE.Vector3();
    const textureLoader = new THREE.TextureLoader();
    const createStars = (count: number, size: number, color: number, range: number) => {
        const geo = new THREE.BufferGeometry();
        const pos = [];
        for (let i = 0; i < count; i++) {
            const r = range * (0.8 + Math.random() * 0.4);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            pos.push(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return new THREE.Points(geo, new THREE.PointsMaterial({ size, color, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));
    };
    scene.add(createStars(40000, 1.2, 0xffffff, 8000000));
    scene.add(createStars(8000, 4.0, 0x88ccff, 5000000));
    scene.add(new THREE.AmbientLight(0xffffff, 0.01)); 
    const sunLight = new THREE.PointLight(0xffffff, 6, 400000);
    scene.add(sunLight);
    Object.keys(PLANETS_DATA).forEach(key => {
      const data = PLANETS_DATA[key];
      if (data.isGalaxy || data.isMoon) return;
      const pivot = new THREE.Group();
      scene.add(pivot);
      const mat = data.isSun 
        ? new THREE.MeshBasicMaterial({ color: 0xffffff }) 
        : new THREE.MeshStandardMaterial({ color: new THREE.Color(data.color), roughness: 0.95, metalness: 0 });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(data.size, 64, 64), mat);
      mesh.position.set(data.dist, 0, 0);
      mesh.userData = { name: data.name };
      pivot.add(mesh);
      textureLoader.load(`https://threejs.org/examples/textures/planets/${data.tex}.jpg`, (t: any) => {
        t.encoding = THREE.sRGBEncoding;
        t.anisotropy = engine.current.maxAnisotropy;
        mat.map = t;
        mat.needsUpdate = true;
      });
      if (data.isSun) {
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: createSunTexture('#ffcc00', 0.8), blending: THREE.AdditiveBlending }));
        glow.scale.set(data.size * 6, data.size * 6, 1);
        mesh.add(glow);
      }
      if (data.hasAtmos) {
        const atmos = new THREE.Mesh(new THREE.SphereGeometry(data.size * 1.04, 64, 64), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.1, side: THREE.BackSide }));
        mesh.add(atmos);
      }
      if (data.hasRing) {
        const ringGeo = new THREE.RingGeometry(data.size * 1.6, data.size * 2.8, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x887766, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.3;
        mesh.add(ring);
      }
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: createLabelTexture(data.name, data.color), transparent: true, depthTest: false }));
      label.scale.set(data.size * 4.5, data.size * 1.1, 1);
      label.position.set(0, data.size * 1.8, 0);
      mesh.add(label);
      if (!data.isSun) {
        const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, data.dist, data.dist).getPoints(500)), new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.02 }));
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
      }
      engine.current.planets.set(data.name, { pivot, mesh, data });
    });
    const earthObj = engine.current.planets.get('地球');
    if (earthObj) {
      const moonData = PLANETS_DATA.Moon;
      const moonPivot = new THREE.Group();
      earthObj.mesh.add(moonPivot); 
      const moonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 1 });
      const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moonData.size, 32, 32), moonMat);
      moonMesh.position.set(moonData.dist, 0, 0);
      moonMesh.userData = { name: moonData.name };
      moonPivot.add(moonMesh);
      textureLoader.load('https://threejs.org/examples/textures/planets/moon.jpg', (t: any) => {
        moonMat.map = t; moonMat.needsUpdate = true;
      });
      const moonLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: createLabelTexture(moonData.name, '#ffffff'), transparent: true, depthTest: false }));
      moonLabel.scale.set(moonData.size * 8, moonData.size * 2, 1);
      moonLabel.position.set(0, moonData.size * 2.5, 0);
      moonMesh.add(moonLabel);
      engine.current.planets.set(moonData.name, { pivot: moonPivot, mesh: moonMesh, data: moonData });
    }
    const handlePointerDown = (e: any) => {
      if (e.target.closest('button') || e.target.closest('.pointer-events-auto')) return;
      engine.current.controls.isDragging = true;
      const x = e.clientX || e.touches?.[0].clientX;
      const y = e.clientY || e.touches?.[0].clientY;
      engine.current.controls.lastX = x; engine.current.controls.lastY = y;
      const mouseX = (x / window.innerWidth) * 2 - 1;
      const mouseY = -(y / window.innerHeight) * 2 + 1;
      engine.current.raycaster.setFromCamera({ x: mouseX, y: mouseY }, engine.current.camera);
      const hits = engine.current.raycaster.intersectObjects(scene.children, true);
      const hit = hits.find((h: any) => h.object.userData.name);
      if (hit) handleSelect(hit.object.userData.name);
    };
    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    containerRef.current?.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', (e) => {
      if (!engine.current.controls.isDragging) return;
      engine.current.controls.theta -= (e.clientX - engine.current.controls.lastX) * 0.005;
      engine.current.controls.phi = Math.max(0.1, Math.min(Math.PI - 0.1, engine.current.controls.phi - (e.clientY - engine.current.controls.lastY) * 0.005));
      engine.current.controls.lastX = e.clientX; engine.current.controls.lastY = e.clientY;
    });
    window.addEventListener('mouseup', () => engine.current.controls.isDragging = false);
    containerRef.current?.addEventListener('wheel', (e) => {
      const step = engine.current.controls.targetRadius * 0.15;
      engine.current.controls.targetRadius = Math.max(5, Math.min(2000000, engine.current.controls.targetRadius + (e.deltaY > 0 ? step : -step)));
    }, { passive: false });
    const animate = () => {
      const { camera, renderer, scene, planets, targetName, controls, isAutoRotating, vec_targetPos } = engine.current;
      planets.forEach(p => { 
        p.pivot.rotation.y += p.data.speed; 
        const rotationSpeed = p.data.name === '地球' ? 0.005 : 0.0015;
        p.mesh.rotation.y += rotationSpeed; 
      });
      if (isAutoRotating && !controls.isDragging) controls.theta += 0.0006;
      vec_targetPos.set(0, 0, 0);
      if (targetName && planets.has(targetName)) { planets.get(targetName).mesh.getWorldPosition(vec_targetPos); }
      controls.radius = THREE.MathUtils.lerp(controls.radius, controls.targetRadius, 0.08);
      const camX = vec_targetPos.x + controls.radius * Math.sin(controls.phi) * Math.cos(controls.theta);
      const camY = vec_targetPos.y + controls.radius * Math.cos(controls.phi);
      const camZ = vec_targetPos.z + controls.radius * Math.sin(controls.phi) * Math.sin(controls.theta);
      camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.1);
      camera.lookAt(vec_targetPos);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const handleSelect = (name: string | null) => {
    setSelectedName(name);
    if (name) setIsPanelVisible(true);
    engine.current.targetName = name;
    if (name) {
      const p = Object.values(PLANETS_DATA).find(x => x.name === name);
      engine.current.controls.targetRadius = p ? p.size * 4 : 500;
    } else { engine.current.controls.targetRadius = 5000; }
  };

  const current = Object.values(PLANETS_DATA).find(p => p.name === selectedName);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 overflow-hidden cursor-grab active:cursor-grabbing font-orbitron text-white">
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start pointer-events-none z-[60]">
        <div className="bg-black/20 backdrop-blur-xl px-8 py-4 border border-white/5 rounded-3xl pointer-events-auto shadow-2xl">
            <div className="flex items-center gap-5">
              <Cpu className="text-cyan-400 w-6 h-6 animate-pulse" />
              <div>
                <h1 className="text-sm font-black tracking-[0.4em] uppercase text-white/90">深空遥测系统</h1>
                <span className="text-[7px] text-cyan-500 font-bold uppercase tracking-[0.6em] block mt-1">状态: 在线 / 链路 ID: {Math.random().toString(16).slice(2,8).toUpperCase()}</span>
              </div>
            </div>
        </div>
        <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 hover:bg-red-500 transition-all rounded-full pointer-events-auto">
          <X className="w-6 h-6 opacity-60 hover:opacity-100" />
        </button>
      </div>

      <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-1000 z-[55] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%-1.5rem)]'}`}>
        <div className="w-56 h-[60vh] bg-black/30 backdrop-blur-2xl border-y border-r border-white/10 rounded-r-[40px] p-6 flex flex-col pointer-events-auto">
          <div className="text-[9px] font-black text-white/30 tracking-[0.4em] uppercase mb-8 italic px-2">星图档案</div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            {Object.values(PLANETS_DATA).map(p => !p.isMoon && !p.isGalaxy && (
              <button key={p.name} onClick={() => handleSelect(p.name)} className={`w-full text-left px-5 py-3 rounded-2xl text-[10px] font-bold tracking-[0.2em] transition-all uppercase ${selectedName === p.name ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-white/30 hover:text-white hover:bg-white/5'}`}>
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-6 h-20 bg-white/5 backdrop-blur-3xl rounded-r-2xl flex items-center justify-center text-cyan-400/30 hover:text-cyan-400 transition-colors pointer-events-auto">
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {selectedName && current && (
        <div className={`absolute right-8 bottom-32 w-[340px] z-[50] pointer-events-auto transition-all duration-700 ${isPanelVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
           <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
              <button onClick={() => setIsPanelVisible(false)} className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors">
                <ChevronDown size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[8px] text-emerald-500 font-black uppercase tracking-[0.4em]">实时遥测数据</span>
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase" style={{ color: current.color }}>{current.name}</h2>
              <p className="text-white/60 text-[12px] leading-relaxed font-light italic mb-8 line-clamp-3">{current.desc}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[7px] text-white/20 font-bold uppercase block mb-1">星体类型</span>
                  <div className="text-white text-[10px] font-bold uppercase">{current.type}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[7px] text-white/20 font-bold uppercase block mb-1">系统状态</span>
                  <div className="text-emerald-400 text-[10px] font-bold uppercase">{current.status || '运行中'}</div>
                </div>
              </div>
           </div>
        </div>
      )}

      {selectedName && !isPanelVisible && (
        <button onClick={() => setIsPanelVisible(true)} className="absolute right-12 bottom-36 p-5 bg-cyan-500/10 backdrop-blur-3xl border border-cyan-400/30 rounded-full text-cyan-400 animate-in fade-in zoom-in duration-300 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <BarChart3 size={24} />
        </button>
      )}

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-white/5 backdrop-blur-2xl px-12 py-5 border border-white/10 rounded-full shadow-2xl z-[60] pointer-events-auto">
          <button onClick={() => setIsAutoRotating(!isAutoRotating)} className={`flex items-center gap-4 transition-all ${isAutoRotating ? 'text-cyan-400' : 'text-white/20 hover:text-white'}`}>
            <RotateCw size={16} className={isAutoRotating ? 'animate-[spin_12s_linear_infinite]' : ''} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">自动巡航</span>
          </button>
          <div className="w-px h-6 bg-white/10"></div>
          <button onClick={() => handleSelect(null)} className={`flex items-center gap-4 transition-all ${!selectedName ? 'text-white' : 'text-white/20 hover:text-white'}`}>
            <Move size={16} />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase italic">手动探索</span>
          </button>
      </div>
    </div>
  );
};

export default Earth3D;
