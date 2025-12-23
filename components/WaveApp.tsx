
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, Play, Pause, RotateCcw, Radio, ChevronDown, 
  ChevronUp, Grid, Activity, Layers, Info, Sparkles, Zap
} from 'lucide-react';

interface WaveConfig {
  amplitude: number;
  frequency: number;
  phase: number;
}

const WaveApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // --- 状态管理 ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [wave1, setWave1] = useState<WaveConfig>({ amplitude: 1.0, frequency: 1.0, phase: 0 });
  const [wave2, setWave2] = useState<WaveConfig>({ amplitude: 1.0, frequency: 1.0, phase: 0 });
  const [isW1Expanded, setIsW1Expanded] = useState(true);
  const [isW2Expanded, setIsW2Expanded] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Added initial value undefined to satisfy useRef signature requirement (Expected 1 arguments, but got 0)
  const requestRef = useRef<number | undefined>(undefined);
  const timeRef = useRef<number>(0);
  const scaleYRef = useRef<number>(60); // 用于平滑缩放缓存

  // --- 物理指标计算 ---
  const phaseDiff = useMemo(() => {
    let diff = Math.abs(wave1.phase - wave2.phase) % 360;
    return diff > 180 ? 360 - diff : diff;
  }, [wave1.phase, wave2.phase]);

  const interferenceType = useMemo(() => {
    if (wave1.frequency !== wave2.frequency) return '非相干叠加';
    if (phaseDiff < 20) return '相长干涉 (加强)';
    if (phaseDiff > 160) return '相消干涉 (减弱)';
    return '部分干涉';
  }, [phaseDiff, wave1.frequency, wave2.frequency]);

  // --- 高清渲染逻辑 ---
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 高清适配
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    // 动态 Y 轴缩放 (Lerp 平滑化)
    const targetMaxAmp = wave1.amplitude + wave2.amplitude;
    const targetScaleY = (height / 2.8) / Math.max(1.5, targetMaxAmp);
    scaleYRef.current += (targetScaleY - scaleYRef.current) * 0.1; // 缓动
    
    const scaleY = scaleYRef.current;
    const centerY = height / 2;
    const scaleX = width / (6 * Math.PI); // x 轴跨度 6π

    // 1. 绘制网格
    if (showGrid) {
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -5; i <= 5; i++) {
        const y = centerY + i * (scaleY * 0.5);
        ctx.moveTo(0, y); ctx.lineTo(width, y);
      }
      for (let i = 0; i <= 12; i++) {
        const x = i * (width / 12);
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
      }
      ctx.stroke();
    }

    // 2. 坐标轴
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY); ctx.lineTo(width, centerY);
    ctx.moveTo(30, 20); ctx.lineTo(30, height - 20);
    ctx.stroke();

    // 3. 波形绘制函数
    const drawWave = (config: WaveConfig, color: string, lineWidth: number, isDash: boolean = false, time: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      if (isDash) ctx.setLineDash([5, 5]);
      else ctx.setLineDash([]);
      
      const phaseRad = (config.phase * Math.PI) / 180;
      
      ctx.beginPath();
      for (let px = 0; px <= width; px += 2) {
        const x = px / scaleX;
        // y = A * sin(x - 2πft + φ)
        const yVal = config.amplitude * Math.sin(x - 2 * Math.PI * config.frequency * time + phaseRad);
        const py = centerY - yVal * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    const t = timeRef.current;

    // 波1 (蓝)
    drawWave(wave1, 'rgba(59, 130, 246, 0.4)', 2, true, t);
    // 波2 (橙)
    drawWave(wave2, 'rgba(249, 115, 22, 0.4)', 2, true, t);
    
    // 合成波 (绿) - 增加外发光效果
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.3)';
    drawWave({
        amplitude: 0, // 占位
        frequency: 0,
        phase: 0
    }, '#10B981', 4, false, 0); // 绘制路径准备

    // 实际合成逻辑重新绘制（为了性能优化及精确控制）
    ctx.beginPath();
    for (let px = 0; px <= width; px += 2) {
        const x = px / scaleX;
        const y1 = wave1.amplitude * Math.sin(x - 2 * Math.PI * wave1.frequency * t + (wave1.phase * Math.PI / 180));
        const y2 = wave2.amplitude * Math.sin(x - 2 * Math.PI * wave2.frequency * t + (wave2.phase * Math.PI / 180));
        const py = centerY - (y1 + y2) * scaleY;
        if (px === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. 实时图例与数值显示
    ctx.font = 'bold 11px Inter, system-ui';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Y-Scale: ${scaleY.toFixed(1)}px/unit`, 40, height - 30);
    
    if (isPlaying) {
      timeRef.current += 0.006;
      requestRef.current = requestAnimationFrame(render);
    }
  }, [isPlaying, wave1, wave2, showGrid]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [render]);

  // --- 交互处理 ---
  const setPreset = (type: 'same' | 'oppo' | 'beat' | 'standing') => {
    setIsPlaying(true);
    timeRef.current = 0;
    switch(type) {
      case 'same':
        setWave1({ amplitude: 1, frequency: 1, phase: 0 });
        setWave2({ amplitude: 1, frequency: 1, phase: 0 });
        break;
      case 'oppo':
        setWave1({ amplitude: 1, frequency: 1, phase: 0 });
        setWave2({ amplitude: 1, frequency: 1, phase: 180 });
        break;
      case 'beat':
        setWave1({ amplitude: 1, frequency: 1.0, phase: 0 });
        setWave2({ amplitude: 1, frequency: 1.15, phase: 0 });
        break;
      case 'standing':
        setWave1({ amplitude: 1, frequency: 1, phase: 0 });
        setWave2({ amplitude: 1, frequency: -1, phase: 0 }); // 模拟反向波
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] flex flex-col overflow-y-auto no-scrollbar selection:bg-blue-100">
      {/* 头部导航 */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-6 z-30">
        <div className="max-w-[1120px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
              <Radio className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">波的叠加和干涉仿真</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Physics Lab v3.0</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 左侧控制面板 */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* 实时干涉状态指示 */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={80}/></div>
             <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">Interference Status</h4>
                <div className="text-2xl font-black mb-1">{interferenceType}</div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  相位差: <span className="text-white font-mono">{phaseDiff.toFixed(1)}°</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500" 
                    style={{ width: `${(1 - phaseDiff/180) * 100}%` }}
                   />
                </div>
             </div>
          </div>

          {/* 波形参数 */}
          <div className="space-y-4">
             <CollapsibleCard 
              title="波源 1 (Blue)" 
              expanded={isW1Expanded} 
              onToggle={() => setIsW1Expanded(!isW1Expanded)}
              themeColor="blue"
             >
                <div className="space-y-5 p-5 pt-2">
                  <ControlSlider label="振幅 A" value={wave1.amplitude} min={0} max={2} step={0.1} onChange={v => setWave1({...wave1, amplitude: v})} />
                  <ControlSlider label="频率 f" value={wave1.frequency} min={0.2} max={5} step={0.1} unit="Hz" onChange={v => setWave1({...wave1, frequency: v})} />
                  <ControlSlider label="相位 φ" value={wave1.phase} min={0} max={360} step={1} unit="°" onChange={v => setWave1({...wave1, phase: v})} />
                </div>
             </CollapsibleCard>

             <CollapsibleCard 
              title="波源 2 (Orange)" 
              expanded={isW2Expanded} 
              onToggle={() => setIsW2Expanded(!isW2Expanded)}
              themeColor="orange"
             >
                <div className="space-y-5 p-5 pt-2">
                  <ControlSlider label="振幅 A" value={wave2.amplitude} min={0} max={2} step={0.1} onChange={v => setWave2({...wave2, amplitude: v})} />
                  <ControlSlider label="频率 f" value={wave2.frequency} min={0.2} max={5} step={0.1} unit="Hz" onChange={v => setWave2({...wave2, frequency: v})} />
                  <ControlSlider label="相位 φ" value={wave2.phase} min={0} max={360} step={1} unit="°" onChange={v => setWave2({...wave2, phase: v})} />
                </div>
             </CollapsibleCard>
          </div>

          {/* 交互按钮组 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
             <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className={`py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${isPlaying ? 'bg-slate-100 text-slate-900' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}
               >
                 {isPlaying ? <Pause size={18} fill="currentColor"/> : <Play size={18} fill="currentColor"/>}
                 {isPlaying ? 'PAUSE' : 'PLAY'}
               </button>
               <button 
                onClick={() => { setWave1({amplitude:1, frequency:1, phase:0}); setWave2({amplitude:1, frequency:1, phase:0}); setIsPlaying(false); timeRef.current=0; }}
                className="py-3.5 bg-slate-50 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-100 flex items-center justify-center gap-2"
               >
                 <RotateCcw size={18} /> RESET
               </button>
             </div>
             
             <div className="flex flex-wrap gap-2">
                <PresetTag label="相长干涉" onClick={() => setPreset('same')} />
                <PresetTag label="相消干涉" onClick={() => setPreset('oppo')} />
                <PresetTag label="拍频演示" onClick={() => setPreset('beat')} />
                <PresetTag label="驻波现象" onClick={() => setPreset('standing')} />
             </div>
          </div>
        </aside>

        {/* 右侧绘图区 */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 min-h-[500px] flex flex-col relative overflow-hidden group">
             {/* 装饰性背景 */}
             <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

             <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Layers size={14}/> Dynamic Interference Field
                </h3>
                <div className="flex gap-4">
                  <LegendItem color="#3B82F6" label="Wave 1" />
                  <LegendItem color="#F97316" label="Wave 2" />
                  <LegendItem color="#10B981" label="Combined" />
                </div>
             </div>

             <div className="flex-1 rounded-3xl bg-slate-50/50 border border-slate-100 relative overflow-hidden">
                <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
                {!isPlaying && timeRef.current === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none transition-opacity duration-500">
                    <div className="text-center">
                       <Sparkles className="mx-auto text-blue-400 mb-3 animate-bounce" size={32}/>
                       <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">点击播放开始仿真实验</p>
                    </div>
                  </div>
                )}
             </div>

             <div className="mt-6 flex justify-between items-center relative z-10">
               <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border transition-all ${showGrid ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-slate-200 text-slate-400'}`}
               >
                 <Grid size={12} /> Grid {showGrid ? 'ON' : 'OFF'}
               </button>
               <div className="text-[10px] text-slate-400 font-mono tracking-tighter">
                 Y = A₁sin(x-ω₁t+φ₁) + A₂sin(x-ω₂t+φ₂)
               </div>
             </div>
          </div>

          {/* 底部说明卡片 */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 grid md:grid-cols-2 gap-10 shadow-sm">
             <div className="space-y-4">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tight">
                  <Info className="text-blue-500" size={24}/> 实验观察指南
                </h3>
                <div className="space-y-3">
                   <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-sm text-emerald-800">
                      <strong>相长干涉：</strong>当两列波相位差为 0° 时，振幅相加，亮度最强。这是无线通信中波束成形的基础。
                   </div>
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800">
                      <strong>相消干涉：</strong>当相位差为 180° 时，波峰对波谷。这正是“主动降噪耳机”的工作机制。
                   </div>
                </div>
             </div>
             <div className="bg-slate-50 rounded-3xl p-6 flex flex-col justify-center border border-slate-100">
                <h4 className="font-black text-slate-800 mb-2 uppercase text-xs tracking-widest">进阶挑战：驻波现象</h4>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  将两列波的频率设为相同，但将其中一列波的频率滑块向左滑动至负值（或点击“驻波”预设）。
                  此时你会发现合成波在某些位置（波节）始终不动，而在某些位置（波腹）剧烈震荡。这模拟了乐器琴弦的物理振动规律。
                </p>
             </div>
          </div>
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=range] {
          accent-color: #3B82F6;
          -webkit-appearance: none;
          background: transparent;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 6px;
          cursor: pointer;
          background: #e2e8f0;
          border-radius: 10px;
        }
        input[type=range]::-webkit-slider-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #3B82F6;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -6px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
      `}</style>
    </div>
  );
};

// --- 子组件 ---

const CollapsibleCard = ({ title, expanded, onToggle, themeColor, children }: any) => {
  const bgColor = themeColor === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700';
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      <button 
        onClick={onToggle}
        className={`w-full px-5 py-4 flex justify-between items-center font-black text-xs uppercase tracking-widest transition-colors ${bgColor}`}
      >
        <span className="flex items-center gap-2"><Activity size={14}/> {title}</span>
        {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {expanded && children}
    </div>
  );
};

const ControlSlider = ({ label, value, min, max, step, unit = '', onChange }: any) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
      <span>{label}</span>
      <span className="text-slate-900 font-mono">{value.toFixed(1)}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} max={max} step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full"
    />
  </div>
);

const PresetTag = ({ label, onClick }: any) => (
  <button 
    onClick={onClick}
    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-all"
  >
    {label}
  </button>
);

const LegendItem = ({ color, label }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-1 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default WaveApp;
