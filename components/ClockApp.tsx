
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Fix: Added missing 'Award' icon import from lucide-react
import { X, RotateCcw, CheckCircle, Trophy, Zap, Sun, Moon, Coffee, Utensils, MoonStar, Home, Bed, Save, Settings2, Eye, EyeOff, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'explore' | 'quiz';

const ClockApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('explore');
  const [totalMinutes, setTotalMinutes] = useState(600); // 10:00 default (10 * 60)
  const [targetMinutes, setTargetMinutes] = useState(480); // 08:00
  const [score, setScore] = useState({ correct: 0, streak: 0 });
  const [showDigital, setShowDigital] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const clockRef = useRef<HTMLDivElement>(null);
  const draggingHand = useRef<'hour' | 'minute' | null>(null);

  // 计算当前小时和分钟 (12小时制显示，24小时逻辑存储)
  const displayHours = useMemo(() => {
    let h = Math.floor(totalMinutes / 60) % 24;
    return h === 0 ? 12 : (h > 12 ? h - 12 : h);
  }, [totalMinutes]);
  
  const displayMinutes = useMemo(() => totalMinutes % 60, [totalMinutes]);
  const isPM = useMemo(() => (Math.floor(totalMinutes / 60) % 24) >= 12, [totalMinutes]);

  // 生活场景推断
  const lifeScene = useMemo(() => {
    const h = Math.floor(totalMinutes / 60) % 24;
    if (h >= 5 && h < 8) return { label: '早起晨练', icon: <Zap className="text-yellow-400" /> };
    if (h >= 8 && h < 11) return { label: '学习工作中', icon: <Coffee className="text-blue-400" /> };
    if (h >= 11 && h < 14) return { label: '美味午餐', icon: <Utensils className="text-orange-400" /> };
    if (h >= 14 && h < 18) return { label: '下午时光', icon: <Sun className="text-amber-400" /> };
    if (h >= 18 && h < 21) return { label: '温馨晚餐', icon: <Home className="text-indigo-400" /> };
    if (h >= 21 || h < 5) return { label: '深度睡眠', icon: <Bed className="text-purple-400" /> };
    return { label: '探索时间', icon: <Settings2 /> };
  }, [totalMinutes]);

  // 背景颜色动态计算 (24小时平滑过渡)
  const bgColor = useMemo(() => {
    const h = Math.floor(totalMinutes / 60) % 24;
    if (h >= 5 && h < 8) return 'from-orange-100 to-sky-200'; // 黎明
    if (h >= 8 && h < 16) return 'from-sky-100 to-blue-200';   // 白天
    if (h >= 16 && h < 19) return 'from-orange-200 to-purple-300'; // 黄昏
    return 'from-slate-900 via-indigo-950 to-black'; // 夜晚
  }, [totalMinutes]);

  const generateQuiz = useCallback(() => {
    const randomH = Math.floor(Math.random() * 12) + 1;
    const randomM = Math.floor(Math.random() * 12) * 5;
    setTargetMinutes(randomH * 60 + randomM);
    // 重置到随机起始点
    setTotalMinutes(Math.floor(Math.random() * 12) * 60);
  }, []);

  const handleVerify = async () => {
    // 比较 12 小时制下的时分
    const currentH12 = displayHours;
    const currentM = displayMinutes;
    
    const targetH = Math.floor(targetMinutes / 60);
    const targetM = targetMinutes % 60;

    const isCorrect = currentH12 === targetH && currentM === targetM;

    if (isCorrect) {
      const newStreak = score.streak + 1;
      setScore(s => ({ correct: s.correct + 1, streak: newStreak }));
      generateQuiz();
      
      if (supabase) {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_stats').upsert({ 
            user_id: user.id, 
            module: 'clock', 
            correct_count: score.correct + 1,
            last_streak: newStreak,
            updated_at: new Date().toISOString()
          });
        }
        setIsSaving(false);
      }
    } else {
      setScore(s => ({ ...s, streak: 0 }));
    }
  };

  const handlePointerMove = useCallback((e: any) => {
    if (!draggingHand.current || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const clientX = e.clientX || e.touches?.[0].clientX;
    const clientY = e.clientY || e.touches?.[0].clientY;
    
    const x = clientX - centerX;
    const y = clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (draggingHand.current === 'minute') {
      // 磁吸 5 分钟刻度
      const m = Math.round(angle / 6) % 60;
      const currentH = Math.floor(totalMinutes / 60);
      setTotalMinutes(currentH * 60 + m);
    } else {
      // 时针移动 (12小时区间)
      let h = Math.floor(angle / 30);
      if (h === 0) h = 12;
      const currentM = totalMinutes % 60;
      // 保持当前的 AM/PM 状态
      const ampmOffset = isPM ? 12 : 0;
      setTotalMinutes((h % 12 + ampmOffset) * 60 + currentM);
    }
  }, [totalMinutes, isPM]);

  useEffect(() => {
    const handleUp = () => { draggingHand.current = null; };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [handlePointerMove]);

  const isNight = useMemo(() => {
    const h = Math.floor(totalMinutes / 60) % 24;
    return h < 6 || h >= 19;
  }, [totalMinutes]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-gradient-to-b transition-all duration-1000 ${bgColor}`}>
      {/* 状态顶部 */}
      <header className="h-20 flex items-center justify-between px-8 bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shadow-lg transition-transform hover:scale-110 ${isNight ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'bg-yellow-400 text-slate-900 shadow-yellow-500/20'}`}>
            {isNight ? <MoonStar size={24} /> : <Sun size={24} className="animate-pulse" />}
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-xl font-black tech-font ${isNight ? 'text-white' : 'text-slate-800'}`}>CLOCK_SIMULATOR_v2</h1>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono tracking-widest ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>
                MODULE_ACTIVE // {isPM ? 'PM' : 'AM'} PHASE
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isNight ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
             <Trophy size={16} className="text-yellow-500" />
             <span className={`text-sm font-black tech-font ${isNight ? 'text-white' : 'text-slate-800'}`}>{score.correct}</span>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full hover:rotate-90 transition-all ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-slate-800'}`}>
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-8 max-w-7xl mx-auto w-full overflow-y-auto no-scrollbar">
        
        {/* 左侧控制板 */}
        <aside className="lg:w-80 space-y-6">
          <section className={`p-6 rounded-[32px] border backdrop-blur-xl ${isNight ? 'bg-slate-900/40 border-white/10' : 'bg-white/40 border-black/5 shadow-xl'}`}>
            <h2 className={`text-[10px] font-black uppercase tracking-widest mb-6 ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>Task_Configuration</h2>
            <div className="grid gap-3">
              <ModeButton 
                active={mode === 'explore'} 
                onClick={() => setMode('explore')} 
                label="自由探索" 
                sub="Free Movement" 
                icon={<Settings2 size={18}/>} 
                night={isNight} 
              />
              <ModeButton 
                active={mode === 'quiz'} 
                onClick={() => { setMode('quiz'); generateQuiz(); }} 
                label="等级挑战" 
                sub="Level Protocol" 
                icon={<Award size={18}/>} 
                night={isNight} 
              />
            </div>
          </section>

          <section className={`p-6 rounded-[32px] border backdrop-blur-xl ${isNight ? 'bg-slate-900/40 border-white/10' : 'bg-white/40 border-black/5 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-[10px] font-black uppercase tracking-widest ${isNight ? 'text-slate-500' : 'text-slate-400'}`}>Visual_Aids</h2>
              <button 
                onClick={() => setShowDigital(!showDigital)}
                className={`p-2 rounded-lg transition-colors ${showDigital ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}
              >
                {showDigital ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl flex items-center gap-4 ${isNight ? 'bg-white/5' : 'bg-black/5'}`}>
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">{lifeScene.icon}</div>
                <div>
                  <div className={`text-xs font-bold ${isNight ? 'text-white' : 'text-slate-800'}`}>{lifeScene.label}</div>
                  <div className="text-[9px] text-slate-500 uppercase font-mono">Current Scene</div>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* 核心时钟区域 */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px]">
          {/* 装饰性大数字背景 */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black opacity-[0.03] pointer-events-none select-none ${isNight ? 'text-white' : 'text-black'}`}>
            {displayHours}
          </div>

          <div 
            ref={clockRef}
            className={`relative w-72 h-72 md:w-[440px] md:h-[440px] rounded-full border-[12px] transition-all duration-700 shadow-[0_40px_100px_rgba(0,0,0,0.2)]
              ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            {/* 刻度渲染 */}
            {[...Array(60)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex justify-center pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                <div className={`transition-all ${i % 5 === 0 
                  ? `h-6 w-1 rounded-full mt-2 ${isNight ? 'bg-slate-700' : 'bg-slate-300'}` 
                  : `h-2 w-0.5 mt-2 bg-slate-500 opacity-20`}`} 
                />
              </div>
            ))}
            
            {/* 数字渲染 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
              <div key={n} className="absolute inset-0 p-10 pointer-events-none" style={{ transform: `rotate(${n * 30}deg)` }}>
                <div className={`w-full flex justify-center text-3xl font-black tech-font ${isNight ? 'text-white/80' : 'text-slate-800'}`} style={{ transform: `rotate(-${n * 30}deg)` }}>
                  {n}
                </div>
              </div>
            ))}

            {/* 时针 (联动) */}
            <div 
              className="absolute left-1/2 top-1/2 w-4 h-28 md:h-36 -mt-28 md:-mt-36 -ml-2 rounded-full origin-bottom cursor-grab active:cursor-grabbing transition-shadow"
              style={{ 
                transform: `rotate(${(totalMinutes / 60) * 30}deg)`,
                backgroundColor: isNight ? '#fff' : '#1e293b',
                boxShadow: draggingHand.current === 'hour' ? '0 0 20px rgba(255,255,255,0.4)' : 'none'
              }}
              onMouseDown={(e) => { e.stopPropagation(); draggingHand.current = 'hour'; }}
              onTouchStart={(e) => { e.stopPropagation(); draggingHand.current = 'hour'; }}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-6 bg-emerald-500 rounded-full opacity-50" />
            </div>

            {/* 分针 */}
            <div 
              className="absolute left-1/2 top-1/2 w-2 h-36 md:h-48 -mt-36 md:-mt-48 -ml-1 rounded-full origin-bottom cursor-grab active:cursor-grabbing transition-shadow"
              style={{ 
                transform: `rotate(${(totalMinutes % 60) * 6}deg)`,
                backgroundColor: '#10b981',
                boxShadow: draggingHand.current === 'minute' ? '0 0 30px rgba(16,185,129,0.5)' : 'none'
              }}
              onMouseDown={(e) => { e.stopPropagation(); draggingHand.current = 'minute'; }}
              onTouchStart={(e) => { e.stopPropagation(); draggingHand.current = 'minute'; }}
            >
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-transparent to-white/30 rounded-full" />
            </div>

            {/* 中心支柱 */}
            <div className={`absolute left-1/2 top-1/2 -ml-4 -mt-4 w-8 h-8 rounded-full border-4 shadow-xl z-20 transition-colors ${isNight ? 'bg-slate-800 border-white' : 'bg-white border-slate-900'}`} />
          </div>

          {/* 信息交互区 */}
          <div className="mt-12 flex flex-col items-center gap-6">
            {mode === 'quiz' ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`px-12 py-6 rounded-[2.5rem] border-4 shadow-2xl mb-6 transition-colors ${isNight ? 'bg-slate-900 border-white/20' : 'bg-white border-slate-800'}`}>
                   <span className="text-[10px] block mb-2 text-center font-black tracking-[0.4em] text-emerald-500">TARGET_OBJECTIVE</span>
                   <span className={`text-6xl font-black tech-font italic ${isNight ? 'text-white' : 'text-slate-800'}`}>
                    {Math.floor(targetMinutes / 60).toString().padStart(2, '0')}:{ (targetMinutes % 60).toString().padStart(2, '0') }
                   </span>
                </div>
                <button 
                  onClick={handleVerify}
                  className="px-16 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black tech-font rounded-2xl flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  <CheckCircle size={20} /> CONFIRM_SUBMISSION
                </button>
              </div>
            ) : (
              showDigital && (
                <div className={`px-12 py-6 rounded-[2.5rem] border backdrop-blur-xl transition-all ${isNight ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-slate-800'}`}>
                  <span className="text-7xl font-black tech-font italic tracking-widest">
                    {displayHours.toString().padStart(2, '0')}:{displayMinutes.toString().padStart(2, '0')}
                    <span className="text-xl ml-4 opacity-50 font-sans font-bold">{isPM ? 'PM' : 'AM'}</span>
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* 底部进度记录 */}
      <footer className="h-10 px-8 flex items-center justify-between bg-black/20 text-[9px] font-mono tracking-widest text-slate-500 uppercase">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><RotateCcw size={10} /> SYSTEM_READY</span>
          <span className="flex items-center gap-1"><Zap size={10} className="text-yellow-500" /> ENERGY_OPTIMIZED</span>
        </div>
        {isSaving && <span className="flex items-center gap-2 text-emerald-500 animate-pulse"><Save size={10} /> SYNCING_TO_CLOUD...</span>}
      </footer>

      <style>{`
        .tech-font { font-family: 'Orbitron', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

const ModeButton = ({ active, onClick, label, sub, icon, night }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${
      active 
        ? (night ? 'bg-white border-white text-slate-900 shadow-xl' : 'bg-slate-900 border-slate-900 text-white shadow-xl') 
        : (night ? 'bg-white/5 border-transparent text-slate-400 hover:border-white/20' : 'bg-black/5 border-transparent text-slate-500 hover:border-black/10')
    }`}
  >
    <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${active ? 'bg-emerald-500 text-white' : 'bg-slate-700/50'}`}>{icon}</div>
    <div className="text-left">
      <div className="text-sm font-black uppercase leading-none tracking-tight">{label}</div>
      <div className={`text-[8px] font-mono mt-1 ${active ? 'opacity-60' : 'opacity-40'}`}>{sub}</div>
    </div>
  </button>
);

export default ClockApp;
