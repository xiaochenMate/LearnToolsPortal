
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, RotateCcw, CheckCircle, Trophy, Zap, Sun, Coffee, 
  Utensils, MoonStar, Home, Bed, Settings2, Eye, EyeOff, 
  Award, Sparkles, Volume2, ArrowRightLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'explore' | 'quiz';

const ClockApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('explore');
  const [totalMinutes, setTotalMinutes] = useState(600); // 默认 10:00 (10 * 60)
  const [targetMinutes, setTargetMinutes] = useState(480); // 08:00
  const [score, setScore] = useState({ correct: 0, bestStreak: 0, currentStreak: 0 });
  const [showDigital, setShowDigital] = useState(true);
  const [isPM, setIsPM] = useState(false);
  
  const clockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);

  // --- 核心逻辑计算 ---
  const hours = useMemo(() => {
    let h = Math.floor(totalMinutes / 60) % 12;
    return h === 0 ? 12 : h;
  }, [totalMinutes]);
  
  const minutes = useMemo(() => totalMinutes % 60, [totalMinutes]);
  const timeString = useMemo(() => `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, [hours, minutes]);

  // 生活场景数据
  const scene = useMemo(() => {
    const fullH = (Math.floor(totalMinutes / 60) % 12) + (isPM ? 12 : 0);
    if (fullH >= 5 && fullH < 8) return { label: '清晨：起床洗漱', icon: <Zap className="text-yellow-400" /> };
    if (fullH >= 8 && fullH < 12) return { label: '上午：认真上课', icon: <Coffee className="text-blue-400" /> };
    if (fullH >= 12 && fullH < 14) return { label: '中午：营养午餐', icon: <Utensils className="text-orange-400" /> };
    if (fullH >= 14 && fullH < 18) return { label: '下午：户外运动', icon: <Sun className="text-amber-500" /> };
    if (fullH >= 18 && fullH < 21) return { label: '晚上：家庭时光', icon: <Home className="text-indigo-400" /> };
    return { label: '深夜：甜美梦乡', icon: <MoonStar className="text-purple-400" /> };
  }, [totalMinutes, isPM]);

  // 背景色彩计算
  const bgStyle = useMemo(() => {
    const fullH = (Math.floor(totalMinutes / 60) % 12) + (isPM ? 12 : 0);
    if (fullH >= 6 && fullH < 17) return 'from-cyan-50 via-blue-50 to-indigo-100'; // 白天
    if (fullH >= 17 && fullH < 19) return 'from-orange-100 via-rose-100 to-purple-200'; // 傍晚
    return 'from-slate-900 via-indigo-950 to-black'; // 夜晚
  }, [totalMinutes, isPM]);

  const isNight = useMemo(() => {
    const fullH = (Math.floor(totalMinutes / 60) % 12) + (isPM ? 12 : 0);
    return fullH < 6 || fullH >= 19;
  }, [totalMinutes, isPM]);

  // --- 交互处理 ---
  const handlePointerDown = (e: React.PointerEvent, type: 'hour' | 'minute') => {
    e.stopPropagation();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setIsDragging(type);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // 基础角度计算 (0度在12点方向)
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (isDragging === 'minute') {
      // 分针逻辑：直接映射到 60 分钟，并实现 5 分钟智能吸附（仅在非探索模式更强）
      const newMinutes = Math.round(angle / 6) % 60;
      const oldMinutes = totalMinutes % 60;
      const currentHours = Math.floor(totalMinutes / 60);

      // 跨 12 点检测 (从 59 到 0 或 0 到 59)
      let hourAdjust = 0;
      if (oldMinutes > 45 && newMinutes < 15) hourAdjust = 1;
      else if (oldMinutes < 15 && newMinutes > 45) hourAdjust = -1;

      setTotalMinutes((currentHours + hourAdjust) * 60 + newMinutes);
    } else {
      // 时针逻辑：直接映射到 12 小时区间
      let newHours = Math.floor(angle / 30);
      if (newHours === 0) newHours = 12;
      const currentMinutes = totalMinutes % 60;
      setTotalMinutes((newHours % 12) * 60 + currentMinutes);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
      setIsDragging(null);
    }
  };

  // --- 业务功能 ---
  const generateQuiz = useCallback(() => {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5;
    setTargetMinutes(h * 60 + m);
    // 重置当前时间到一个随机整数小时
    setTotalMinutes(Math.floor(Math.random() * 12) * 60);
  }, []);

  const handleVerify = async () => {
    const currentH12 = hours;
    const currentM = minutes;
    const targetH = Math.floor(targetMinutes / 60);
    const targetM = targetMinutes % 60;

    if (currentH12 === targetH && currentM === targetM) {
      const nextStreak = score.currentStreak + 1;
      setScore(s => ({
        correct: s.correct + 1,
        currentStreak: nextStreak,
        bestStreak: Math.max(s.bestStreak, nextStreak)
      }));
      generateQuiz();
      
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_stats').upsert({
            user_id: user.id,
            module: 'clock_v2',
            correct_count: score.correct + 1,
            last_streak: nextStreak
          });
        }
      }
    } else {
      setScore(s => ({ ...s, currentStreak: 0 }));
    }
  };

  const speakTime = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`现在是${isPM ? '下午' : '上午'}${hours}点${minutes === 0 ? '整' : minutes + '分'}`);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-1000 bg-gradient-to-br ${bgStyle}`}>
      {/* 顶部状态栏 */}
      <header className="h-20 flex items-center justify-between px-8 bg-white/10 backdrop-blur-xl border-b border-white/10 shadow-sm z-30">
        <div className="flex items-center gap-6">
          <div className={`p-4 rounded-3xl transition-all duration-500 shadow-lg ${isNight ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-amber-400 text-amber-950 shadow-amber-500/30'}`}>
            {isNight ? <MoonStar size={24} /> : <Sun size={24} className="animate-spin-slow" />}
          </div>
          <div className="hidden md:block">
            <h1 className={`text-xl font-black tech-font tracking-tighter ${isNight ? 'text-white' : 'text-slate-800'}`}>
              认识钟表 <span className="text-[10px] ml-2 opacity-50 uppercase tracking-[0.3em]">Smart_Learning_Hub</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className={`text-[9px] font-mono tracking-widest ${isNight ? 'text-slate-400' : 'text-slate-500'}`}>STATUS: ACTIVE_LINK_SYNCED</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mode === 'quiz' && (
            <div className={`flex items-center gap-4 px-6 py-2 rounded-2xl border ${isNight ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
               <div className="flex flex-col items-center">
                 <span className="text-[8px] opacity-50 font-black uppercase">Correct</span>
                 <span className={`font-black tech-font ${isNight ? 'text-white' : 'text-slate-900'}`}>{score.correct}</span>
               </div>
               <div className="w-px h-6 bg-current opacity-10"></div>
               <div className="flex flex-col items-center text-orange-500">
                 <span className="text-[8px] font-black uppercase">Streak</span>
                 <span className="font-black tech-font">{score.currentStreak}</span>
               </div>
            </div>
          )}
          <button onClick={onClose} className={`p-3 rounded-full transition-all hover:rotate-90 ${isNight ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-slate-800'}`}>
            <X size={28} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-10 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* 左侧：控制与辅助面板 */}
        <aside className="lg:w-80 space-y-6 flex flex-col justify-center">
          <section className={`p-8 rounded-[40px] border backdrop-blur-3xl shadow-2xl ${isNight ? 'bg-slate-900/60 border-white/5' : 'bg-white/60 border-black/5'}`}>
            <h2 className={`text-[10px] font-black uppercase tracking-widest mb-8 opacity-40 ${isNight ? 'text-white' : 'text-black'}`}>Learning_Control</h2>
            <div className="grid gap-4">
              <ControlButton 
                active={mode === 'explore'} 
                onClick={() => setMode('explore')} 
                label="自由探索" 
                sub="Free Mode" 
                icon={<Settings2 size={18}/>} 
                night={isNight} 
              />
              <ControlButton 
                active={mode === 'quiz'} 
                onClick={() => { setMode('quiz'); generateQuiz(); }} 
                label="等级应战" 
                sub="Challenge" 
                icon={<Award size={18}/>} 
                night={isNight} 
              />
            </div>
          </section>

          <section className={`p-8 rounded-[40px] border backdrop-blur-3xl shadow-2xl ${isNight ? 'bg-slate-900/60 border-white/5' : 'bg-white/60 border-black/5'}`}>
            <div className="flex justify-between items-center mb-8">
               <h2 className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${isNight ? 'text-white' : 'text-black'}`}>Environment</h2>
               <div className="flex gap-2">
                 <button onClick={() => setShowDigital(!showDigital)} className={`p-2 rounded-xl ${showDigital ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                   {showDigital ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
                 <button onClick={speakTime} className={`p-2 rounded-xl bg-blue-500 text-white hover:bg-blue-400 transition-colors`}>
                   <Volume2 size={16} />
                 </button>
               </div>
            </div>
            
            <div className={`p-6 rounded-3xl flex items-center gap-5 ${isNight ? 'bg-white/5' : 'bg-black/5'}`}>
              <div className="p-3 bg-white/10 rounded-2xl">{scene.icon}</div>
              <div className="flex-1 overflow-hidden">
                <div className={`text-sm font-bold truncate ${isNight ? 'text-white' : 'text-slate-800'}`}>{scene.label}</div>
                <div className="text-[9px] opacity-40 uppercase font-mono mt-1">Life Context</div>
              </div>
            </div>

            <div className="mt-6">
              <button 
                onClick={() => setIsPM(!isPM)}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2 ${
                  isPM 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-amber-400 border-amber-300 text-amber-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                <ArrowRightLeft size={16} />
                {isPM ? 'PM 下午/晚上' : 'AM 上午/凌晨'}
              </button>
            </div>
          </section>
        </aside>

        {/* 核心时钟交互区 */}
        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          {/* 巨型背景数字 */}
          <div className={`absolute pointer-events-none text-[30vw] font-black tech-font opacity-[0.03] transition-colors ${isNight ? 'text-white' : 'text-black'}`}>
            {hours}
          </div>

          <div 
            ref={clockRef}
            className={`relative w-80 h-80 md:w-[500px] md:h-[500px] rounded-full border-[16px] transition-all duration-700 shadow-2xl flex items-center justify-center
              ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            {/* 刻度渲染 */}
            {[...Array(60)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex justify-center py-2 pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                <div className={`transition-all ${i % 5 === 0 
                  ? `h-8 w-1.5 rounded-full ${isNight ? 'bg-slate-700' : 'bg-slate-200'}` 
                  : `h-3 w-0.5 opacity-20 bg-slate-500`}`} 
                />
              </div>
            ))}
            
            {/* 数字显示 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
              <div key={n} className="absolute inset-0 p-12 pointer-events-none" style={{ transform: `rotate(${n * 30}deg)` }}>
                <div className={`w-full text-center text-4xl font-black tech-font ${isNight ? 'text-white/80' : 'text-slate-800'}`} style={{ transform: `rotate(-${n * 30}deg)` }}>
                  {n}
                </div>
              </div>
            ))}

            {/* 时针 */}
            <div 
              className={`absolute left-1/2 bottom-1/2 w-4 h-32 md:h-44 -ml-2 rounded-full origin-bottom cursor-grab active:cursor-grabbing z-10 shadow-lg transition-colors
                ${isDragging === 'hour' ? 'ring-8 ring-blue-500/20' : ''}`}
              style={{ 
                transform: `rotate(${(totalMinutes / 60) * 30}deg)`,
                backgroundColor: isNight ? '#fff' : '#1e293b'
              }}
              onPointerDown={(e) => handlePointerDown(e, 'hour')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-blue-500 rounded-full opacity-60" />
              {/* 时针触摸热区 */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full pointer-events-auto" />
            </div>

            {/* 分针 */}
            <div 
              className={`absolute left-1/2 bottom-1/2 w-2 h-40 md:h-56 -ml-1 rounded-full origin-bottom cursor-grab active:cursor-grabbing z-20 shadow-xl transition-colors
                ${isDragging === 'minute' ? 'ring-8 ring-emerald-500/20' : ''}`}
              style={{ 
                transform: `rotate(${(totalMinutes % 60) * 6}deg)`,
                backgroundColor: '#10b981'
              }}
              onPointerDown={(e) => handlePointerDown(e, 'minute')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-transparent to-white/30 rounded-full" />
               {/* 分针触摸热区 */}
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full pointer-events-auto" />
            </div>

            {/* 中心圆柱轴 */}
            <div className={`absolute w-10 h-10 rounded-full border-[6px] shadow-2xl z-30 transition-colors ${isNight ? 'bg-slate-800 border-white' : 'bg-white border-slate-900'}`} />
          </div>

          {/* 信息展示板 */}
          <div className="mt-12 w-full max-w-md">
            {mode === 'quiz' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className={`w-full p-8 rounded-[40px] border-4 shadow-2xl mb-8 flex flex-col items-center ${isNight ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-900'}`}>
                   <span className="text-[10px] font-black tracking-[0.4em] text-emerald-500 mb-4 uppercase">Target_Goal</span>
                   <div className={`text-7xl font-black tech-font italic ${isNight ? 'text-white' : 'text-slate-800'}`}>
                    {Math.floor(targetMinutes / 60).toString().padStart(2, '0')}:{ (targetMinutes % 60).toString().padStart(2, '0') }
                   </div>
                </div>
                <button 
                  onClick={handleVerify}
                  className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xl tech-font rounded-[2.5rem] flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20"
                >
                  <CheckCircle size={24} /> 完成挑战
                </button>
              </div>
            ) : (
              showDigital && (
                <div className={`w-full p-8 rounded-[40px] border backdrop-blur-2xl flex flex-col items-center transition-all ${isNight ? 'bg-white/5 border-white/10 text-white shadow-2xl' : 'bg-black/5 border-black/10 text-slate-900 shadow-xl'}`}>
                  <span className="text-[10px] font-black tracking-[0.4em] opacity-40 mb-4 uppercase">Live_Clock_Sync</span>
                  <div className="text-8xl font-black tech-font italic tracking-widest flex items-baseline">
                    {timeString}
                    <span className="text-2xl ml-6 opacity-40 font-sans font-bold uppercase">{isPM ? 'PM' : 'AM'}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <style>{`
        .tech-font { font-family: 'Orbitron', sans-serif; }
        .animate-spin-slow { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const ControlButton = ({ active, onClick, label, sub, icon, night }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-5 p-5 rounded-3xl border-2 transition-all group ${
      active 
        ? (night ? 'bg-white border-white text-slate-950 shadow-2xl' : 'bg-slate-900 border-slate-900 text-white shadow-2xl') 
        : (night ? 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10' : 'bg-black/5 border-transparent text-slate-500 hover:bg-black/10')
    }`}
  >
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-emerald-500 text-white scale-110' : 'bg-slate-800'}`}>{icon}</div>
    <div className="text-left flex-1">
      <div className="text-base font-black uppercase leading-none tracking-tight">{label}</div>
      <div className={`text-[9px] font-mono mt-1 opacity-50`}>{sub}</div>
    </div>
    {active && <Sparkles size={14} className="text-emerald-500 animate-pulse" />}
  </button>
);

export default ClockApp;
