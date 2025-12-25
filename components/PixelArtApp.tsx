
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Pencil, Eraser, Pipette, PaintBucket, 
  RotateCcw, Trash2, Download, 
  Grid3X3, Undo2, Redo2, Plus, Minus
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

  // Function to save the current state to history - defined with 0 arguments
  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const snapshot = ctx.getImageData(0, 0, gridSize, gridSize);
    history.current.push(snapshot);
    if (history.current.length > 50) history.current.shift();
    redoStack.current = []; 
  }, [gridSize]);

  // Function to initialize the canvas
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

  // Handle undo action
  const undo = () => {
    if (history.current.length <= 1) return;
    const current = history.current.pop()!;
    redoStack.current.push(current);
    const last = history.current[history.current.length - 1];
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.putImageData(last, 0, 0);
  };

  // Handle redo action
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
    else { clientX = (e as React.MouseEvent).clientX; clientY = (e as React.MouseEvent).clientY; }
    const x = Math.floor(((clientX - rect.left) / rect.width) * gridSize);
    const y = Math.floor(((clientY - rect.top) / rect.height) * gridSize);
    return { x, y };
  };

  // Core drawing function
  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    if (tool === 'pencil') { ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1); }
    else if (tool === 'eraser') { ctx.clearRect(x, y, 1, 1); }
    else if (tool === 'picker') {
      const data = ctx.getImageData(x, y, 1, 1).data;
      if (data[3] === 0) return; 
      const hex = '#' + Array.from(data.slice(0, 3)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      setColor(hex);
    }
    else if (tool === 'bucket') { floodFill(ctx, x, y, color, gridSize); }
  };

  // Handle mouse down event
  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
    setIsDrawing(true); 
    draw(x, y);
    // Explicitly call saveHistory with no arguments and reset drawing state for one-click tools
    if (tool === 'bucket' || tool === 'picker') { 
      setIsDrawing(false); 
      saveHistory(); 
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e); 
    setHoverPos({ x, y });
    if (isDrawing && (tool === 'pencil' || tool === 'eraser')) { 
      draw(x, y); 
    }
  };

  // Fix: Added explicit event parameter to prevent "Expected 0 arguments, but got 1" when React passes the event
  const handleMouseUp = (e?: React.MouseEvent | React.TouchEvent) => { 
    if (isDrawing) { 
      setIsDrawing(false); 
      saveHistory(); 
    } 
  };

  const clearCanvas = () => {
    if (confirm('确定清空画布吗？')) initCanvas();
  };

  const handleExport = () => {
    if (canvasRef.current) {
      exportCanvas(canvasRef.current, exportScale, 'pixel-art');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans select-none overflow-hidden">
      <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-emerald-500/30 flex items-center justify-between px-6 z-20 shrink-0 pt-[env(safe-area-inset-top)]">
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
              <button key={size} onClick={() => { if(confirm('更改尺寸会清空画布，确定吗？')) setGridSize(size); }} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${gridSize === size ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-300'}`}>
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

        <aside className="w-20 bg-slate-950 border-r border-slate-900 flex flex-col items-center py-6 gap-4 z-10 overflow-y-auto no-scrollbar">
          <ToolButton icon={<Pencil size={20}/>} active={tool === 'pencil'} onClick={() => setTool('pencil')} label="铅笔" />
          <ToolButton icon={<Eraser size={20}/>} active={tool === 'eraser'} onClick={() => setTool('eraser')} label="橡皮" />
          <ToolButton icon={<PaintBucket size={20}/>} active={tool === 'bucket'} onClick={() => setTool('bucket')} label="填充" />
          <ToolButton icon={<Pipette size={20}/>} active={tool === 'picker'} onClick={() => setTool('picker')} label="吸管" />
          <div className="w-10 h-px bg-slate-800 my-2" />
          <ToolButton icon={<Undo2 size={20}/>} onClick={() => undo()} label="撤销" />
          <ToolButton icon={<Redo2 size={20}/>} onClick={() => redo()} label="重做" />
          <div className="w-10 h-px bg-slate-800 my-2" />
          <ToolButton icon={<Trash2 size={20}/>} onClick={() => clearCanvas()} label="清空" className="text-red-500 hover:bg-red-500/10" />
        </aside>

        <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-[#0a0a0f]">
          <div className="relative shadow-2xl overflow-hidden" style={{ width: 'min(80vh, 80vw)', aspectRatio: '1/1' }}>
            <canvas
              ref={canvasRef}
              width={gridSize}
              height={gridSize}
              className="absolute inset-0 w-full h-full image-pixelated bg-white cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            <canvas
              ref={gridCanvasRef}
              width={800}
              height={800}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
            />
            {hoverPos && (
              <div 
                className="absolute border border-emerald-500 pointer-events-none z-10 mix-blend-difference"
                style={{
                  left: `${(hoverPos.x / gridSize) * 100}%`,
                  top: `${(hoverPos.y / gridSize) * 100}%`,
                  width: `${100 / gridSize}%`,
                  height: `${100 / gridSize}%`
                }}
              />
            )}
          </div>
        </div>

        <aside className="w-64 bg-slate-950 border-l border-slate-900 flex flex-col p-6 gap-8 z-10 overflow-y-auto no-scrollbar">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">调色板</h3>
            <div className="grid grid-cols-4 gap-2">
              {PICO8_PALETTE.map(p => (
                <button
                  key={p}
                  onClick={() => setColor(p)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${color === p ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: p }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
               <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: color }} />
               <input 
                type="text" 
                value={color} 
                onChange={e => setColor(e.target.value.toUpperCase())}
                className="bg-transparent text-xs font-mono font-bold text-white w-24 outline-none"
               />
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">显示与导出</h3>
            <div className="space-y-4">
               <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`w-full py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${showGrid ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
               >
                 网格显示: {showGrid ? 'ON' : 'OFF'}
               </button>
               
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                    <span>导出倍率</span>
                    <span>{exportScale}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setExportScale(s => Math.max(1, s-4))} className="p-2 bg-slate-900 text-slate-400 rounded-lg border border-slate-800"><Minus size={14}/></button>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${(exportScale/64)*100}%` }} />
                    </div>
                    <button onClick={() => setExportScale(s => Math.min(64, s+4))} className="p-2 bg-slate-900 text-slate-400 rounded-lg border border-slate-800"><Plus size={14}/></button>
                  </div>
               </div>

               <button 
                onClick={() => handleExport()}
                className="w-full py-4 bg-white text-black font-black rounded-xl shadow-xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-3 text-xs uppercase"
               >
                 <Download size={16} /> 保存艺术品
               </button>
            </div>
          </section>
        </aside>
      </main>

      <footer className="h-8 bg-slate-950 border-t border-slate-900 px-6 flex items-center justify-between shrink-0 z-20">
         <div className="flex items-center gap-4 text-[9px] font-mono text-slate-700 italic">
            <span>COORDINATE: {hoverPos ? `${hoverPos.x}, ${hoverPos.y}` : '---, ---'}</span>
            <span>COLOR: {color}</span>
         </div>
         <div className="text-[9px] font-black uppercase tracking-widest text-emerald-500/50 italic">
            Artistic_Engine_Active
         </div>
      </footer>

      <style>{`
        .image-pixelated {
          image-rendering: -moz-crisp-edges;
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          image-rendering: pixelated;
        }
        .tech-font { font-family: 'Orbitron', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const ToolButton = ({ icon, active, onClick, label, className = '' }: any) => (
  <button 
    onClick={onClick}
    title={label}
    className={`w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all border ${active ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'} ${className}`}
  >
    {icon}
  </button>
);

export default PixelArtApp;
