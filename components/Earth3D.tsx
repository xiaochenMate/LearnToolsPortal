import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

declare global {
  interface Window {
    THREE: any;
  }
}

interface Earth3DProps {
  onClose: () => void;
}

const Earth3D: React.FC<Earth3DProps> = ({ onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!window.THREE || !containerRef.current) return;
    const THREE = window.THREE;

    // 1. 初始化场景、相机
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    // 2. 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. 创建地球模型
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    const material = new THREE.MeshPhongMaterial({
      map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
      bumpMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
      bumpScale: 0.05,
      specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
      specular: new THREE.Color(0x808080),
      shininess: 5
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 4. 灯光系统
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 1, 3).normalize();
    scene.add(directionalLight);

    // 5. 交互控制状态
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // 鼠标事件处理
    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      // 水平移动控制绕 Y 轴旋转
      earth.rotation.y += deltaMove.x * 0.01;
      // 垂直移动控制绕 X 轴旋转
      earth.rotation.x += deltaMove.y * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // 绑定事件到 Canvas 或 Window
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseleave', onMouseUp);

    // 6. 响应式调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 7. 动画循环
    const animate = () => {
      if (!isDragging) {
        earth.rotation.y += 0.001; // 自动旋转
      }
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    // 清理函数
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseleave', onMouseUp);
      
      if (rendererRef.current && containerRef.current) {
        rendererRef.current.domElement.removeEventListener('mousedown', onMouseDown);
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // 释放资源
      geometry.dispose();
      material.dispose();
      // 纹理释放
      material.map?.dispose();
      material.bumpMap?.dispose();
      material.specularMap?.dispose();
    };
  }, []);

  return (
    <div 
      id="container" 
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 提示文字 */}
      <div className="absolute top-0 left-0 w-full flex flex-col items-center pt-8 pointer-events-none z-10">
        <h1 className="text-white text-2xl font-bold mb-2 tracking-wide">3D地球模型</h1>
        <p 
          className="text-white text-[14px] font-[Arial]" 
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
        >
          拖动地球旋转 | Drag to rotate the Earth
        </p>
      </div>

      {/* 关闭按钮 */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-20 backdrop-blur-sm group"
      >
        <X className="w-8 h-8 opacity-80 group-hover:opacity-100" />
      </button>
    </div>
  );
};

export default Earth3D;