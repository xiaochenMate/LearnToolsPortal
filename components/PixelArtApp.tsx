
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Pencil, Eraser, Pipette, PaintBucket, 
  RotateCcw, RotateCw, Trash2, Download, 
  Grid3X3, Grid3X3 as GridIcon, Layers, 
  ChevronDown, Save, Image as ImageIcon,
  Minus, Plus, Undo2, Redo2, Cpu, Sparkles
} from 'lucide-react';
import { floodFill, exportCanvas } from '../lib/pixelUtils';

type Tool = 'pencil' | 'eraser' | 'picker' | 'bucket';
type GridSize = 16 | 32 | 64;

const PICO8_PALETTE = [
  '#000000', '#1D2B53', '#7E2553', '#008751', 
  '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
  '#FF004D', '#FFA300', '#FFEC27', '#00E436', 
  '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
];

const PixelArtApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [gridSize, setGridSize] = useState<GridSize>(32);
  const [tool, setTool] = useState<Tool>('pencil');
  const [color, setColor] = useState('#FFEC27');
  const [showGrid, setShowGrid] = useState(true);
  const [exportScale, setExportScale] = useState(16);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<ImageData[]>([]);
  const redoStack = useRef<ImageData[]>([]);

  // Moved saveHistory before its usage and wrapped in useCallback
  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const snapshot = ctx.getImageData(0, 0, gridSize, gridSize);
    history.current.push(snapshot);
    if (history.current.length > 50) history.current.shift();
    redoStack.current = []; 
  }, [gridSize]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.clearRect(0, 0, gridSize, gridSize);
    saveHistory();
  }, [gridSize, saveHistory]);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!showGrid) return;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    const cellSide = canvas.width / gridSize;
    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellSide, 0); ctx.lineTo(i * cellSide, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSide); ctx.lineTo(canvas.width, i * cellSide); ctx.stroke();
    }
  }, [gridSize, showGrid]);

  const undo = () => {
    if (history.current.length <= 1) return;
    const current = history.current.pop()!;
    redoStack.current.push(current);
    const last = history.current[history.current.length - 1];
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(last, 0, 0);
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    history.current.push(next);
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(next, 0, 0);
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const x = Math.floor(((clientX - rect.left) / rect.width) * gridSize);
    const y = Math.floor(((clientY - rect.top) / rect.height) * gridSize);
    return { x, y };
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    if (tool === 'pencil') { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); }
    else if (tool === 'eraser') { ctx.clearRect(x, y, 1, 1); }
    else if (tool === 'picker') {
      const data = ctx.getImageData(x, y, 1, 1).data;
      if (data[3] === 0) return; 
      const hex = '#' + Array.from(data.slice(0, 3)).map(b => b.toString(16).padStart(2, '0')).join('');
      setColor(hex.toUpperCase());
    }
    else if (tool === 'bucket') { floodFill(ctx, x, y, color, gridSize); }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true); const { x, y } = getMousePos(e); draw(x, y);
    // Fix: Explicitly calling saveHistory with no arguments to match its definition
    if (tool === 'bucket' || tool === 'picker') { setIsDrawing(false); saveHistory(); }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e); setHoverPos({ x, y });
    if (isDrawing && (tool === 'pencil' || tool === 'eraser')) { draw(x, y); }
  };

  const handleMouseUp = () => { if (isDrawing) { setIsDrawing(false); saveHistory(); } };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans select-none overflow-hidden">
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/30 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-600 clip-button flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Grid3X3 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tech-font text-white italic tracking-tighter uppercase">像素画实验室</h1>
            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[0.3em] italic">艺术生成模块 v1.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            {( [16, 32, 64] as GridSize[]).map(size => (
              <button key={size} onClick={() => { if(confirm('更改尺寸会清空画布，确定吗？')) setGridSize(size); }} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${gridSize === size ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                {size}x{size}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2.5 bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-full text-slate-500 hover:text-red-500 transition-all">
            <X size={20}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px]"></div>
        </div>

        <aside className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-6 gap-4 z-10">
          <ToolButton icon={<Pencil size={20}/>} active={tool === 'pencil'} onClick={() => setTool('pencil')} label="铅笔 (P)" />
          <ToolButton icon={<Eraser size={20}/>} active={tool === 'eraser'} onClick={() => setTool('eraser')} label="橡皮 (E)" />
          <ToolButton icon={<PaintBucket size={20}/>} active={tool === 'bucket'} onClick={() => setTool('bucket')} label="填充 (B)" />
          <ToolButton icon={<Pipette size={20}/>} active={tool === 'picker'} onClick={() => setTool('picker')} label="吸管 (I)" />
          <div className="w-10 h-px bg-slate-800 my-2" />
          <ToolButton icon={<Undo2 size={20}/>} onClick={undo} label="撤销 (Ctrl+Z)" />
          <ToolButton icon={<Redo2 size={20}/>} onClick={redo} label="重做 (Ctrl+Y)" />
          <ToolButton icon={<Trash2 size={20}/>} onClick={initCanvas} label="清空" className="text-rose-500 hover:bg-rose-500/10" />
        </aside>

        <section className="flex-1 flex items-center justify-center p-8 bg-black/40 relative overflow-hidden">
           <div className="relative shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div className="absolute inset-0 z-0" style={{ backgroundImage: `linear-gradient(45deg, #222 25%, transparent 25%), linear-gradient(-45deg, #222 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #222 75%), linear-gradient(-45deg, transparent 75%, #222 75%)`, backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}></div>
              <canvas ref={canvasRef} width={gridSize} height={gridSize} className="relative z-10 w-[512px] h-[512px] image-pixelated cursor-none" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => setHoverPos(null)} />
              <canvas ref={gridCanvasRef} width={512} height={512} className="absolute inset-0 z-20 pointer-events-none" />
              {hoverPos && (
                <div className="absolute z-30 pointer-events-none border border-white/50 bg-white/10" style={{ width: 512 / gridSize, height: 512 / gridSize, left: hoverPos.x * (512 / gridSize), top: hoverPos.y * (512 / gridSize) }} />
              )}
           </div>
        </section>

        <aside className="w-72 bg-slate-950 border-l border-slate-900 p-6 flex flex-col gap-8 z-10">
          <div>
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={14} /> 颜色矩阵
            </h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {PICO8_PALETTE.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`aspect-square rounded-lg border-2 transition-transform hover:scale-110 ${color === c ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
               <input type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} className="w-10 h-10 rounded bg-transparent border-none cursor-pointer" />
               <span className="text-xs font-mono font-bold text-slate-400">{color}</span>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">视图配置</h3>
            <button onClick={() => setShowGrid(!showGrid)} className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all border ${showGrid ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`} >
              <div className="flex items-center gap-3">
                <GridIcon size={16}/>
                <span className="text-[11px] font-black uppercase tracking-widest">显示辅助网格</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative ${showGrid ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${showGrid ? 'right-1' : 'left-1'}`} />
              </div>
            </button>
          </div>

          <div className="mt-auto">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">导出引擎</h3>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 mb-4">
               <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] text-slate-400 font-bold uppercase">放大倍数: {exportScale}x</span>
                 <div className="flex gap-2">
                   <button onClick={() => setExportScale(Math.max(1, exportScale - 4))} className="p-1 hover:text-emerald-500"><Minus size={14}/></button>
                   <button onClick={() => setExportScale(Math.min(64, exportScale + 4))} className="p-1 hover:text-emerald-500"><Plus size={14}/></button>
                 </div>
               </div>
               <p className="text-[9px] text-slate-600 italic">输出尺寸: {gridSize * exportScale} x {gridSize * exportScale} px</p>
            </div>
            <button onClick={() => exportCanvas(canvasRef.current!, exportScale, `pixel-art-${gridSize}`)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95">
              <Download size={20}/>
              <span className="text-sm font-black tech-font italic uppercase tracking-widest">导出图像数据</span>
            </button>
          </div>
        </aside>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-900 px-8 flex items-center justify-between z-20">
        <div className="flex gap-10">
          <span className="text-[9px] font-mono text-emerald-500/50 flex items-center gap-2 italic tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            像素渲染核心: 活动中
          </span>
          <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest italic">
            历史缓冲区: {history.current.length}/50
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em] flex items-center gap-3 italic">
          <ImageIcon size={10} /> 模式: {gridSize}px_无损渲染
        </div>
      </footer>

      <style>{`
        .image-pixelated { image-rendering: pixelated; image-rendering: crisp-edges; }
        .tech-font { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );
};

interface ToolButtonProps { icon: React.ReactNode; active?: boolean; onClick: () => void; label: string; className?: string; }
const ToolButton: React.FC<ToolButtonProps> = ({ icon, active, onClick, label, className }) => (
  <button onClick={onClick} title={label} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all border ${active ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : `bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600 ${className || ''}`}`} >
    {icon}
  </button>
);

export default PixelArtApp;
