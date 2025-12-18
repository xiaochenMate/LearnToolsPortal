
import React, { useEffect, useRef, useState } from 'react';
import { X, Moon as MoonIcon, Sun, RotateCw, Telescope, Layers, Sparkles, Move, Radio, Compass, MapPin, Activity, Target, ChevronRight } from 'lucide-react';

declare global {
  interface Window {
    THREE: any;
  }
}

interface Earth3DProps {
  onClose: () => void;
}

const SCALES = {
  SURFACE: { id: 0, label: '星球表面', limit: 1.3 },
  PLANET: { id: 1, label: '轨道视角', limit: 8 },
  SOLAR: { id: 2, label: '太阳系', limit: 250 },
  GALAXY: { id: 3, label: '银河深空', limit: 1500 },
  UNIVERSE: { id: 4, label: '已知宇宙', limit: Infinity }
};

const CITY_MARKERS = [
  { name: '北京', lat: 39.9042, lon: 116.4074, pop: 21.5, desc: '千年古都，中国的政治、文化、国际交往中心。拥有长城、故宫等历史古迹。' },
  { name: '伦敦', lat: 51.5074, lon: -0.1278, pop: 8.9, desc: '大不列颠及北爱尔兰联合王国首都，世界顶级金融与文化枢纽。' },
  { name: '纽约', lat: 40.7128, lon: -74.0060, pop: 8.4, desc: '大苹果城，美国最大城市，全球经济枢纽。' },
  { name: '东京', lat: 35.6762, lon: 139.6503, pop: 14.0, desc: '全球人口最密集的都市圈，赛博霓虹之城的代表。' }
];

const PLANETS_INFO: Record<string, any> = {
  Mercury: { name: '水星', type: '岩质行星', radius: '2,439 km', extra: '温差最大', desc: '最靠近太阳的行星，表面布满了类似月球的环形山。', color: '#A5A5A5' },
  Venus: { name: '金星', type: '岩质行星', radius: '6,051 km', extra: '极端温室效应', desc: '太阳系中最热的行星，浓厚的大气层锁住了所有热量。', color: '#E3BB76' },
  Mars: { name: '火星', type: '岩质行星', radius: '3,389 km', extra: '红色星球', desc: '拥有太阳系最高的山脉奥林匹斯山，是人类未来的移民目标。', color: '#E27B58' },
  Jupiter: { name: '木星', type: '气态巨行星', radius: '69,911 km', extra: '行星之王', desc: '太阳系最大的行星，著名的大红斑是一个持续了数百年的风暴。', color: '#D39C7E' },
  Saturn: { name: '土星', type: '气态巨行星', radius: '58,232 km', extra: '壮丽光环', desc: '拥有最显著的行星环系统，主要由冰晶和尘埃组成。', color: '#C5AB6E' },
  Uranus: { name: '天王星', type: '冰巨星', radius: '25,362 km', extra: '侧向自转', desc: '大气中含有甲烷，使其呈现迷人的淡蓝色，且自转轴几乎与轨道面平行。', color: '#B5E3E3' },
  Neptune: { name: '海王星', type: '冰巨星', radius: '24,622 km', extra: '超音速强风', desc: '离太阳最远的行星，拥有太阳系中最猛烈的风暴。', color: '#4B70DD' }
};

const MOON_INFO = {
  name: '月球',
  type: '天然卫星',
  desc: '地球唯一的天然卫星，由于潮汐锁定，月球始终以同一面面向地球。',
  radius: '1,737 km',
  distance: '38.4万 km'
};

const Earth3D: React.FC<Earth3DProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const requestRef = useRef<number>(0);
  
  const [zoomLevel, setZoomLevel] = useState(3.5); 
  const [activeScale, setActiveScale] = useState(SCALES.PLANET.id);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);

  const groupsRef = useRef<{
    universe: any,
    nebula: any,
    solar: any,
    earth: any,
    moon: any,
    moonOrbit: any,
    stars: any,
    labels: any,
    selectionRing: any,
    planets: any[],
    orbitalPaths: any
  }>({ universe: null, nebula: null, solar: null, earth: null, moon: null, moonOrbit: null, stars: null, labels: null, selectionRing: null, planets: [], orbitalPaths: null });

  useEffect(() => {
    if (!window.THREE || !containerRef.current) return;
    const THREE = window.THREE;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();

    // 1. 宇宙背景
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);
    groupsRef.current.universe = universeGroup;
    const universeMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load('https://threejs.org/examples/textures/planets/galaxy.png'),
      side: THREE.BackSide, transparent: true, opacity: 0.4, color: 0x555588
    });
    universeGroup.add(new THREE.Mesh(new THREE.SphereGeometry(40000, 32, 32), universeMat));

    // 2. 星云与恒星
    const starsGroup = new THREE.Group();
    scene.add(starsGroup);
    groupsRef.current.stars = starsGroup;
    const starGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 20000; i++) {
      positions.push(THREE.MathUtils.randFloatSpread(20000), THREE.MathUtils.randFloatSpread(20000), THREE.MathUtils.randFloatSpread(20000));
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starsGroup.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1.2, color: 0xffffff, transparent: true, opacity: 0.8 })));

    // 3. 太阳
    const solarGroup = new THREE.Group();
    scene.add(solarGroup);
    groupsRef.current.solar = solarGroup;
    const sun = new THREE.Group();
    sun.position.set(-1500, 500, -2000);
    solarGroup.add(sun);
    sun.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff })));

    // 4. 地球
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);
    groupsRef.current.earth = earthGroup;
    const earthMat = new THREE.MeshPhongMaterial({
      map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
      bumpMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
      bumpScale: 0.02,
      specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
      emissiveMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.png'),
      emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.8, shininess: 10
    });
    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMat));
    earthGroup.add(new THREE.Mesh(new THREE.SphereGeometry(1.03, 128, 128), new THREE.MeshBasicMaterial({ color: 0x3388ff, transparent: true, opacity: 0.2, side: THREE.BackSide, blending: THREE.AdditiveBlending })));

    // 5. 城市标记
    const labelGroup = new THREE.Group();
    groupsRef.current.labels = labelGroup;
    earthGroup.add(labelGroup);
    CITY_MARKERS.forEach(city => {
      const phi = (90 - city.lat) * (Math.PI / 180);
      const theta = (city.lon + 180) * (Math.PI / 180);
      const pos = new THREE.Vector3(-(Math.sin(phi) * Math.cos(theta)), Math.cos(phi), Math.sin(phi) * Math.sin(theta));
      const cityContainer = new THREE.Group();
      cityContainer.position.copy(pos);
      cityContainer.lookAt(0,0,0);
      cityContainer.userData = { isCity: true, ...city, pos };
      labelGroup.add(cityContainer);
      cityContainer.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 16), new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.6 })));
    });

    // 6. 轨道线组
    const orbitalPaths = new THREE.Group();
    scene.add(orbitalPaths);
    groupsRef.current.orbitalPaths = orbitalPaths;

    // 7. 太阳系行星系统
    const planetsList = [
      { key: 'Mercury', dist: 30, size: 0.38, speed: 0.008, tex: 'mercury' },
      { key: 'Venus', dist: 50, size: 0.95, speed: 0.005, tex: 'venus' },
      { key: 'Mars', dist: 90, size: 0.53, speed: 0.003, tex: 'mars' },
      { key: 'Jupiter', dist: 150, size: 3.5, speed: 0.001, tex: 'jupiter' },
      { key: 'Saturn', dist: 220, size: 3.0, speed: 0.0007, tex: 'saturn', hasRing: true },
      { key: 'Uranus', dist: 300, size: 1.5, speed: 0.0004, tex: 'uranus' },
      { key: 'Neptune', dist: 380, size: 1.45, speed: 0.0002, tex: 'neptune' }
    ];

    planetsList.forEach(p => {
      // 轨道圆环
      const curve = new THREE.EllipseCurve(0, 0, p.dist, p.dist, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(128);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.1 });
      const orbitLine = new THREE.LineLoop(geometry, material);
      orbitLine.rotation.x = Math.PI / 2;
      orbitalPaths.add(orbitLine);

      // 行星公转组
      const orbit = new THREE.Group();
      scene.add(orbit);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(p.size, 64, 64),
        new THREE.MeshPhongMaterial({ map: textureLoader.load(`https://threejs.org/examples/textures/planets/${p.tex === 'venus' ? 'venus_atmosphere' : p.tex === 'uranus' ? 'uranus' : p.tex}.jpg`) })
      );
      mesh.position.set(p.dist, 0, 0);
      mesh.userData = { isPlanet: true, ...PLANETS_INFO[p.key] };
      orbit.add(mesh);
      
      // 全息追踪标签
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.font = 'Bold 32px "Orbitron", sans-serif';
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'center';
      ctx.fillText(PLANETS_INFO[p.key].name, 128, 45);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, opacity: 0.8 }));
      sprite.scale.set(p.size * 5 + 2, p.size * 1.5 + 0.6, 1);
      sprite.position.set(0, p.size + 2, 0);
      mesh.add(sprite);

      if (p.hasRing) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.4, p.size * 2.2, 64);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x888877, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);
      }

      groupsRef.current.planets.push({ orbit, mesh, speed: p.speed, key: p.key });
    });

    // 8. 月球
    const moonOrbitGroup = new THREE.Group();
    scene.add(moonOrbitGroup);
    groupsRef.current.moonOrbit = moonOrbitGroup;
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.27, 64, 64),
      new THREE.MeshPhongMaterial({ map: textureLoader.load('https://threejs.org/examples/textures/planets/moon_1024.jpg') })
    );
    moon.position.set(5, 0, 0);
    moon.userData = { isMoon: true, ...MOON_INFO };
    moonOrbitGroup.add(moon);
    groupsRef.current.moon = moon;

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.copy(sun.position).normalize().multiplyScalar(10);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const targets = [
        ...labelGroup.children, 
        groupsRef.current.moon, 
        ...groupsRef.current.planets.map(p => p.mesh)
      ];
      const intersects = raycaster.intersectObjects(targets, true);
      if (intersects.length > 0) {
        let t = intersects[0].object;
        while(t.parent && !t.userData.name) t = t.parent;
        setSelectedTarget(t.userData);
      } else setSelectedTarget(null);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('wheel', (e: WheelEvent) => {
      camera.position.z = Math.max(1.05, Math.min(camera.position.z + e.deltaY * camera.position.z * 0.001, 50000));
      setZoomLevel(camera.position.z);
    }, { passive: true });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      earthGroup.rotation.y += (e.clientX - prevMouse.x) * 0.004;
      earthGroup.rotation.x += (e.clientY - prevMouse.y) * 0.004;
      prevMouse = { x: e.clientX, y: e.clientY };
      setAutoRotate(false);
    });
    window.addEventListener('mouseup', () => isDragging = false);

    const animate = () => {
      const z = camera.position.z;
      if (autoRotate && !isDragging) earthGroup.rotation.y += 0.0012;
      groupsRef.current.moonOrbit.rotation.y += 0.002;
      groupsRef.current.planets.forEach(p => {
        p.orbit.rotation.y += p.speed;
        p.mesh.rotation.y += 0.01;
      });
      groupsRef.current.universe.rotation.y += 0.00004;
      groupsRef.current.stars.rotation.y += 0.00008;

      if (z < SCALES.SURFACE.limit) setActiveScale(SCALES.SURFACE.id);
      else if (z < SCALES.PLANET.limit) setActiveScale(SCALES.PLANET.id);
      else if (z < SCALES.SOLAR.limit) setActiveScale(SCALES.SOLAR.id);
      else if (z < SCALES.GALAXY.limit) setActiveScale(SCALES.GALAXY.id);
      else setActiveScale(SCALES.UNIVERSE.id);

      groupsRef.current.labels.visible = z < 4.5;
      groupsRef.current.moonOrbit.visible = z < 100;
      groupsRef.current.orbitalPaths.visible = z > 15;
      groupsRef.current.planets.forEach(p => {
        p.orbit.visible = z > 10;
        // 远距离标签大小补偿，确保能被发现
        const sprite = p.mesh.children.find((c: any) => c.isSprite);
        if (sprite) {
           const distToCam = camera.position.distanceTo(p.mesh.getWorldPosition(new THREE.Vector3()));
           const scaleFactor = Math.max(1, distToCam / 200);
           sprite.scale.set((p.size * 5 + 2) * scaleFactor, (p.size * 1.5 + 0.6) * scaleFactor, 1);
        }
      });

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      if (rendererRef.current && containerRef.current) containerRef.current.removeChild(rendererRef.current.domElement);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-[#000105] z-50 overflow-hidden select-none cursor-crosshair">
      
      {/* 行星感应器列表 - 左侧悬浮面板 */}
      <div className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto z-20">
        <h3 className="text-cyan-500 font-bold tech-font text-xs uppercase tracking-[0.3em] mb-4 bg-cyan-500/10 px-4 py-2 border-l-2 border-cyan-500">Planetary Sensors</h3>
        {Object.entries(PLANETS_INFO).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setSelectedTarget(info)}
            className={`flex items-center gap-4 px-5 py-3 rounded-r-full border-l-4 transition-all group ${
              selectedTarget?.name === info.name 
              ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
              : 'bg-black/40 border-white/10 text-slate-500 hover:border-cyan-500/50 hover:bg-black/60'
            }`}
          >
            <div className={`w-3 h-3 rounded-full transition-transform duration-500 ${selectedTarget?.name === info.name ? 'bg-cyan-400 scale-125 shadow-[0_0_10px_cyan]' : 'bg-slate-700 group-hover:bg-cyan-800'}`}></div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-black tech-font uppercase tracking-widest">{info.name}</span>
              <span className="text-[9px] font-mono text-cyan-400/50">{info.type}</span>
            </div>
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${selectedTarget?.name === info.name ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
          </button>
        ))}
        <button
          onClick={() => setSelectedTarget(MOON_INFO)}
          className={`flex items-center gap-4 px-5 py-3 rounded-r-full border-l-4 transition-all mt-4 ${
            selectedTarget?.name === MOON_INFO.name ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-black/40 border-white/10 text-slate-500'
          }`}
        >
          <MoonIcon className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-black tech-font uppercase tracking-widest">{MOON_INFO.name}</span>
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none p-6 md:p-12 flex flex-col justify-between border-[2px] border-white/5 m-4 md:m-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-4xl md:text-6xl font-black italic tech-font flex items-center gap-5">
              <Telescope className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_20px_cyan]" /> GAIA OBSERVER
            </h1>
            <div className="flex items-center gap-6 text-[11px] font-mono text-cyan-400/80 uppercase tracking-[0.4em] bg-white/5 px-6 py-2 rounded-full border border-white/10 backdrop-blur-xl">
               <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> 探测深度: {(zoomLevel/100).toFixed(4)} AU</span>
               <span className="animate-pulse text-emerald-400 flex items-center gap-2"><Radio className="w-4 h-4" /> 全系定位系统已激活</span>
            </div>
          </div>
          <div className="flex gap-4 pointer-events-auto items-center">
             <div className="hidden lg:flex gap-6 items-center">
                {Object.values(SCALES).map(s => (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 transition-all duration-1000 ${activeScale === s.id ? 'bg-cyan-400 border-cyan-400 scale-125 shadow-[0_0_25px_cyan]' : 'border-white/20 bg-transparent opacity-20'}`}></div>
                    <span className={`text-[10px] font-black tech-font tracking-tighter uppercase ${activeScale === s.id ? 'text-cyan-400' : 'text-white/30'}`}>{s.label}</span>
                  </div>
                ))}
             </div>
             <button onClick={onClose} className="p-5 bg-red-600/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all rounded-2xl ml-8 backdrop-blur-md group">
                <X className="w-8 h-8 group-hover:rotate-90 transition-transform" />
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-12">
            <div className={`w-full md:w-[480px] bg-black/95 backdrop-blur-3xl border-l-[6px] border-cyan-400 p-10 pointer-events-auto transition-all duration-700 shadow-2xl ${selectedTarget ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                {selectedTarget && (
                  <div className="animate-in fade-in slide-in-from-left-6 duration-700">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-4xl font-black text-white tech-font italic tracking-widest uppercase mb-1 flex items-center gap-4">
                              <Target className="w-8 h-8 text-cyan-400 animate-pulse" />
                              {selectedTarget.name}
                            </h3>
                            <p className="text-cyan-400 text-xs font-mono tracking-widest uppercase">
                                分类: {selectedTarget.type} / 核心半径: {selectedTarget.radius}
                            </p>
                        </div>
                        <div className="px-3 py-1 bg-cyan-400/20 text-cyan-400 text-[10px] font-black border border-cyan-400/40 rounded-sm uppercase italic">Locked On</div>
                    </div>
                    <p className="text-slate-200 text-lg leading-relaxed mb-10 font-light border-t border-white/10 pt-8 opacity-90 italic">
                      “{selectedTarget.desc}”
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">环境特征 / Features</p>
                        <p className="text-cyan-300 font-mono text-base">{selectedTarget.extra || (selectedTarget.isCity ? `人口: ${selectedTarget.pop}M` : '稳定')}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">监测距离 / Distance</p>
                        <p className="text-emerald-400 font-mono text-base flex items-center gap-2"><Activity className="w-4 h-4" /> 链路实时同步</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedTarget(null)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 uppercase text-xs font-black tracking-widest group">
                      释放锁定 / RELEASE <X className="w-4 h-4 group-hover:rotate-90 transition-transform"/>
                    </button>
                  </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-8 pointer-events-auto">
               <div className="flex gap-4 bg-black/80 p-3 rounded-[2rem] border border-white/10 backdrop-blur-3xl shadow-xl">
                  <ControlButton active={autoRotate} onClick={() => setAutoRotate(!autoRotate)} icon={<RotateCw className={`w-6 h-6 ${autoRotate ? 'animate-[spin_12s_linear_infinite]' : ''}`} />} label="轨道同步" />
                  <div className="w-[1px] h-12 bg-white/10"></div>
                  <ControlButton active={true} onClick={() => {}} icon={<Sparkles className="w-6 h-6 text-cyan-400" />} label="导航已就绪" />
               </div>
               <div className="flex flex-col items-end gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-2xl">
                  <div className="flex items-center gap-3 text-xs font-mono text-cyan-400/60 uppercase tracking-tighter"><Move className="w-4 h-4" /> 侧边栏：一键锁定行星</div>
                  <div className="flex items-center gap-3 text-xs font-mono text-cyan-400/60 uppercase tracking-tighter"><Compass className="w-4 h-4" /> 滚轮：进行星际跃迁</div>
               </div>
            </div>
        </div>
      </div>
      <style>{`.tech-font { font-family: 'Orbitron', 'Microsoft YaHei', sans-serif; }`}</style>
    </div>
  );
};

const ControlButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button onClick={onClick} className={`px-8 py-4 flex items-center gap-4 transition-all rounded-[1.5rem] text-xs font-black tech-font uppercase tracking-[0.2em] ${active ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_30px_rgba(6,182,212,0.15)]' : 'text-slate-500 hover:text-slate-300'}`}>
        {icon} {label}
    </button>
);

export default Earth3D;
