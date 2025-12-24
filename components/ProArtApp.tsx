
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Pencil, Eraser, MousePointer2, PaintBucket, 
  Square, Circle, Minus, Undo2, Redo2, 
  Plus, Trash2, Download, Layers, Eye, EyeOff,
  Settings, Save, Maximize, ZoomIn, ZoomOut,
  Palette, MousePointer, Hand, Sliders, ChevronDown, ChevronUp
} from 'lucide-react';

type Tool = 'pencil' | 'eraser' | 'bucket' | 'line' | 'rect' | 'circle' | 'hand';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  canvas: HTMLCanvasElement;
}

const ProArtApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // State
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [tool, setTool] = useState<Tool>('pencil');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(1);
  const [color, setColor] = useState('#10b981');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  // Refs
  const viewportRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[][]>([]); // Array of arrays of dataURLs (per layer)
  const historyIndexRef = useRef(-1);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const initialLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      name: '图层 1',
      visible: true,
      canvas: canvas,
    };
    setLayers([initialLayer]);
    setActiveLayerId(initialLayer.id);
    saveHistory([initialLayer]);
  }, []);

  const saveHistory = (currentLayers: Layer[]) => {
    const snapshots = currentLayers.map(l => l.canvas.toDataURL());
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push(snapshots);
    if (newHistory.length > 30) newHistory.shift();
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    applyHistoryState(historyRef.current[historyIndexRef.current]);
  };

  const redo = () => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    applyHistoryState(historyRef.current[historyIndexRef.current]);
  };

  const applyHistoryState = (snapshots: string[]) => {
    const newLayers = layers.map((layer, i) => {
      const img = new Image();
      img.onload = () => {
        const ctx = layer.canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = snapshots[i];
      return layer;
    });
    setLayers([...newLayers]);
  };

  const addLayer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      name: `图层 ${layers.length + 1}`,
      visible: true,
      canvas,
    };
    const nextLayers = [newLayer, ...layers];
    setLayers(nextLayers);
    setActiveLayerId(newLayer.id);
    saveHistory(nextLayers);
  };

  const removeLayer = (id: string) => {
    if (layers.length <= 1) return;
    const nextLayers = layers.filter(l => l.id !== id);
    setLayers(nextLayers);
    if (activeLayerId === id) setActiveLayerId(nextLayers[0].id);
    saveHistory(nextLayers);
  };

  const toggleLayerVisibility = (id: string) => {
    setLayers(layers.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Convert screen coordinates to canvas coordinates accounting for zoom and pan
    const canvasLeft = (rect.width / 2) + panOffset.x - (1200 * zoom / 2);
    const canvasTop = (rect.height / 2) + panOffset.y - (800 * zoom / 2);
    
    const x = (clientX - rect.left - (rect.width / 2) - panOffset.x + (1200 * zoom / 2)) / zoom;
    const y = (clientY - rect.top - (rect.height / 2) - panOffset.y + (800 * zoom / 2)) / zoom;
    
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);
    
    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setLastPos({ x: e.clientX, y: e.clientY });
      return;
    }

    setIsDrawing(true);
    setLastPos({ x, y });

    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = brushSize;
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    if (tool === 'pencil') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (tool === 'bucket') {
      floodFill(activeLayer.canvas, Math.floor(x), Math.floor(y), color);
      saveHistory(layers);
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);

    if (isPanning) {
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing) return;

    const activeLayer = layers.find(l => l.id === activeLayerId);
    if (!activeLayer) return;
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer) {
        const ctx = activeLayer.canvas.getContext('2d');
        if (ctx) {
          ctx.globalCompositeOperation = 'source-over'; // Reset
        }
      }
      setIsDrawing(false);
      saveHistory(layers);
    }
    setIsPanning(false);
  };

  const floodFill = (canvas: HTMLCanvasElement, startX: number, startY: number, fillColor: string) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const stack = [[startX, startY]];
    
    const startPos = (startY * canvas.width + startX) * 4;
    const startR = pixels[startPos];
    const startG = pixels[startPos + 1];
    const startB = pixels[startPos + 2];
    const startA = pixels[startPos + 3];

    // Simple hex to rgb
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);

    if (startR === r && startG === g && startB === b && startA === 255) return;

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = (y * canvas.width + x) * 4;

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      if (pixels[pos] !== startR || pixels[pos + 1] !== startG || pixels[pos + 2] !== startB || pixels[pos + 3] !== startA) continue;

      pixels[pos] = r;
      pixels[pos + 1] = g;
      pixels[pos + 2] = b;
      pixels[pos + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imageData, 0, 0);
  };

  const clearCanvas = () => {
    if (confirm('确定清空当前图层吗？')) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (activeLayer) {
        const ctx = activeLayer.canvas.getContext('2d');
        ctx?.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        saveHistory(layers);
      }
    }
  };

  const downloadImage = () => {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1200;
    finalCanvas.height = 800;
    const finalCtx = finalCanvas.getContext('2d')!;

    // Composite from bottom to top
    [...layers].reverse().forEach(layer => {
      if (layer.visible) {
        finalCtx.drawImage(layer.canvas, 0, 0);
      }
    });

    const link = document.createElement('a');
    link.download = 'proart-masterpiece.png';
    link.href = finalCanvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e1e] flex flex-col font-sans text-slate-200 overflow-hidden select-none">
      {/* Top Menu Bar */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
              <Palette className="text-black w-5 h-5" />
            </div>
            <span className="text-sm font-black tech-font tracking-tighter uppercase italic">ProArt_Web</span>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
            <MenuButton icon={<Undo2 size={16} />} onClick={undo} title="撤销 (Ctrl+Z)" />
            <MenuButton icon={<Redo2 size={16} />} onClick={redo} title="重做 (Ctrl+Y)" />
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="flex items-center gap-1">
             <MenuButton icon={<Save size={16} />} onClick={downloadImage} title="导出 PNG" />
             <MenuButton icon={<Trash2 size={16} />} onClick={clearCanvas} title="清空当前层" className="text-red-400 hover:bg-red-500/10" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-[10px] font-mono text-slate-500 bg-black/30 px-3 py-1 rounded">
             ZOOM: {(zoom * 100).toFixed(0)}%
           </div>
           <button onClick={onClose} className="p-1.5 hover:bg-red-500 text-slate-400 hover:text-white rounded transition-colors">
             <X size={18} />
           </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <aside className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
          <ToolButton icon={<Pencil size={20} />} active={tool === 'pencil'} onClick={() => setTool('pencil')} title="画笔 (B)" />
          <ToolButton icon={<Eraser size={20} />} active={tool === 'eraser'} onClick={() => setTool('eraser')} title="橡皮 (E)" />
          <ToolButton icon={<PaintBucket size={20} />} active={tool === 'bucket'} onClick={() => setTool('bucket')} title="填充 (G)" />
          <ToolButton icon={<Hand size={20} />} active={tool === 'hand'} onClick={() => setTool('hand')} title="抓手 (H/Space)" />
          <div className="w-8 h-px bg-slate-800 my-2" />
          <ToolButton icon={<Square size={20} />} active={tool === 'rect'} onClick={() => setTool('rect')} title="矩形" disabled />
          <ToolButton icon={<Circle size={20} />} active={tool === 'circle'} onClick={() => setTool('circle')} title="圆" disabled />
          
          <div className="mt-auto flex flex-col items-center gap-3">
             <div className="w-8 h-8 rounded border border-slate-700 overflow-hidden">
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  className="w-full h-full cursor-pointer bg-transparent border-none scale-150" 
                />
             </div>
          </div>
        </aside>

        {/* Center Canvas Area */}
        <main 
          ref={viewportRef}
          className="flex-1 bg-[#121212] relative overflow-hidden cursor-crosshair outline-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          tabIndex={0}
          onWheel={(e) => {
            if (e.ctrlKey) {
              const delta = e.deltaY > 0 ? 0.9 : 1.1;
              setZoom(prev => Math.min(10, Math.max(0.1, prev * delta)));
              e.preventDefault();
            } else {
              setPanOffset(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
            }
          }}
        >
          {/* Working Canvas Wrapper */}
          <div 
            className="absolute pointer-events-none"
            style={{ 
              width: 1200, 
              height: 800,
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              boxShadow: '0 0 40px rgba(0,0,0,0.5)'
            }}
          >
            {/* Transparency Checkerboard Background */}
            <div className="absolute inset-0 bg-white" style={{ 
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }} />
            
            {/* Render Layers */}
            {[...layers].reverse().map((layer) => (
              <LayerCanvas key={layer.id} layer={layer} isActive={layer.id === activeLayerId} />
            ))}
          </div>

          {/* Canvas Indicator */}
          <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/50 backdrop-blur rounded text-[10px] font-mono text-slate-400 border border-white/5 pointer-events-none">
             DIM: 1200x800 | POS: {panOffset.x.toFixed(0)}, {panOffset.y.toFixed(0)} | ZOOM: {(zoom*100).toFixed(0)}%
          </div>
        </main>

        {/* Right Sidebar - Layers & Settings */}
        <aside className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col overflow-hidden">
          {/* Brush Settings */}
          <div className="p-5 border-b border-slate-800">
             <div className="flex items-center gap-2 mb-4">
                <Sliders size={14} className="text-emerald-500" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">工具属性</h3>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>画笔大小</span>
                      <span>{brushSize}px</span>
                   </div>
                   <input 
                    type="range" min="1" max="100" value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-500" 
                   />
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>不透明度</span>
                      <span>{(opacity * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                    type="range" min="0.01" max="1" step="0.01" value={opacity} 
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500" 
                   />
                </div>
             </div>
          </div>

          {/* Layer Management */}
          <div className="flex-1 flex flex-col min-h-0">
             <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Layers size={14} className="text-emerald-500" />
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">图层管理</h3>
                </div>
                <button onClick={addLayer} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-500 transition-all">
                  <Plus size={16} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                {layers.map((layer) => (
                  <div 
                    key={layer.id} 
                    onClick={() => setActiveLayerId(layer.id)}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all border ${activeLayerId === layer.id ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-transparent border-transparent hover:bg-slate-800'}`}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                      className={`transition-colors ${layer.visible ? 'text-slate-400 hover:text-white' : 'text-slate-700'}`}
                    >
                      {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <span className={`text-xs flex-1 truncate font-medium ${activeLayerId === layer.id ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {layer.name}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
             </div>
          </div>
          
          {/* Quick Palette */}
          <div className="p-4 bg-slate-950 border-t border-slate-800">
             <div className="grid grid-cols-6 gap-2">
                {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#10b981', '#3b82f6', '#8b5cf6'].map(c => (
                  <button 
                    key={c} 
                    onClick={() => setColor(c)}
                    className={`aspect-square rounded border border-white/5 hover:scale-110 transition-transform ${color === c ? 'ring-2 ring-emerald-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
          </div>
        </aside>
      </div>

      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          height: 4px;
          background: #334155;
          border-radius: 2px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          cursor: pointer;
        }
        .tech-font { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );
};

// Sub-components
const MenuButton = ({ icon, onClick, title, className = '' }: any) => (
  <button 
    onClick={onClick} 
    title={title} 
    className={`p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-200 transition-all ${className}`}
  >
    {icon}
  </button>
);

const ToolButton = ({ icon, active, onClick, title, disabled = false }: any) => (
  <button 
    onClick={disabled ? undefined : onClick}
    title={title}
    className={`w-10 h-10 flex items-center justify-center rounded transition-all ${disabled ? 'opacity-20 cursor-not-allowed' : active ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}
  >
    {icon}
  </button>
);

const LayerCanvas = React.memo(({ layer, isActive }: { layer: Layer, isActive: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    
    // This is the core trick: synchronize the display canvas with the layer's internal buffer
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(layer.canvas, 0, 0);
      requestAnimationFrame(update);
    };
    const id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [layer]);

  return (
    <canvas 
      ref={canvasRef}
      width={1200}
      height={800}
      className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${layer.visible ? 'opacity-100' : 'opacity-0'}`}
    />
  );
});

export default ProArtApp;
