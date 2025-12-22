
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, CheckCircle, Trophy, Zap, Sun, Moon, ArrowRight, Award, BarChart3, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'explore' | 'quiz' | 'zen';

const ClockApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('explore');
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [targetTime, setTargetTime] = useState({ h: 10, m: 10 });
  const [score, setScore] = useState({ correct: 0, streak: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [dayNightFactor, setDayNightFactor] = useState(1); // 0: Night, 1: Day

  const clockRef = useRef<HTMLDivElement>(null);
  const draggingHand = useRef<'hour' | 'minute' | null>(null);

  // 物理联动：拨动分针带动时针
  const updateTime = (h: number, m: number) => {
    setHours(h);
    setMinutes(m);
    setDayNightFactor(h >= 6 && h < 18 ? 1 : 0);
  };

  const generateQuiz = () => {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5;
    setTargetTime({ h, m });
    setHours(12);
    setMinutes(0);
  };

  const handleVerify = async () => {
    const isCorrect = hours === targetTime.h && minutes === targetTime.m;
    if (isCorrect) {
      const newStreak = score.streak + 1;
      setScore({ correct: score.correct + 1, streak: newStreak });
      generateQuiz();
      
      // 同步到 Supabase
      if (supabase) {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('user_stats').upsert({ 
            user_id: user.id, 
            module: 'clock', 
            correct_count: score.correct + 1,
            last_streak: newStreak
          });
        }
        setIsSaving(false);
      }
    } else {
      setScore({ ...score, streak: 0 });
    }
  };

  const handlePointerMove = useCallback((e: any) => {
    if (!draggingHand.current || !clockRef.current || mode === 'quiz' && draggingHand.current === null) return;

    const rect = clockRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - (rect.left + rect.width / 2);
    const y = (e.clientY || e.touches?.[0].clientY) - (rect.top + rect.height / 2);
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (draggingHand.current === 'minute') {
      const newM = Math.round(angle / 6) % 60;
      updateTime(hours, newM);
    } else {
      let newH = Math.floor(angle / 30);
      newH = newH === 0 ? 12 : newH;
      updateTime(newH, minutes);
    }
  }, [hours, minutes, mode]);

  useEffect(() => {
    const up = () => draggingHand.current = null;
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', up);
    };
  }, [handlePointerMove]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-1000 ${dayNightFactor ? 'bg-sky-50' : 'bg-slate-950'}`}>
      {/* 顶部状态栏 */}
      <div className={`h-20 flex items-center justify-between px-8 backdrop-blur-md border-b ${dayNightFactor ? 'border-sky-200' : 'border-slate-800'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${dayNightFactor ? 'bg-yellow-400 text-white' : 'bg-blue-600 text-white'}`}>
            {dayNightFactor ? <Sun className="animate-spin-slow" /> : <Moon />}
          </div>
          <div>
            <h1 className={`text-xl font-black tech-font ${dayNightFactor ? 'text-slate-800' : 'text-white'}`}>TIME_TELLER_OS</h1>
            <span className={`text-[10px] font-mono tracking-widest ${dayNightFactor ? 'text-slate-400' : 'text-slate-500'}`}>SESSION_ACTIVE: {score.correct} COMPLETED</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           {isSaving && <Save className="w-4 h-4 text-cyan-500 animate-pulse" />}
           <button onClick={onClose} className={`p-2 rounded-full transition-all ${dayNightFactor ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'}`}>
            <X size={28} />
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-8 gap-12 max-w-7xl mx-auto w-full">
        {/* 控制侧边栏 */}
        <div className="lg:w-80 space-y-6">
          <div className={`p-6 rounded-[32px] border transition-all ${dayNightFactor ? 'bg-white border-sky-100' : 'bg-slate-900 border-slate-800'}`}>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Operation_Modes</h2>
            <div className="grid gap-3">
              <ModeBtn active={mode === 'explore'} onClick={() => setMode('explore')} label="探索空间" sub="Free Movement" icon={<Zap size={16}/>} light={dayNightFactor} />
              <ModeBtn active={mode === 'quiz'} onClick={() => { setMode('quiz'); generateQuiz(); }} label="分秒必争" sub="Quiz Protocol" icon={<Award size={16}/>} light={dayNightFactor} />
            </div>
          </div>

          <div className={`p-6 rounded-[32px] border transition-all ${dayNightFactor ? 'bg-white border-sky-100 shadow-xl shadow-sky-100/50' : 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50'}`}>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Learning_Telemetry</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatBox label="Correct" val={score.correct} color="text-emerald-500" light={dayNightFactor} />
              <StatBox label="Streak" val={score.streak} color="text-orange-500" light={dayNightFactor} />
            </div>
          </div>
        </div>

        {/* 钟表核心区域 */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <div 
            ref={clockRef}
            className={`relative w-80 h-80 md:w-[480px] md:h-[480px] rounded-full border-[16px] transition-all duration-700 shadow-2xl
              ${dayNightFactor ? 'bg-white border-slate-800 shadow-sky-200' : 'bg-slate-900 border-cyan-500/50 shadow-black'}`}
          >
            {/* 刻度渲染 */}
            {[...Array(60)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex justify-center pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                <div className={`w-1 rounded-full ${i % 5 === 0 ? `h-6 ${dayNightFactor ? 'bg-slate-800' : 'bg-cyan-400'}` : 'h-2 bg-slate-300 opacity-30'}`}></div>
              </div>
            ))}
            
            {/* 数字渲染 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
              <div key={n} className="absolute inset-0 p-10 pointer-events-none" style={{ transform: `rotate(${n * 30}deg)` }}>
                <div className={`w-full flex justify-center text-3xl font-black tech-font ${dayNightFactor ? 'text-slate-800' : 'text-white'}`} style={{ transform: `rotate(-${n * 30}deg)` }}>
                  {n}
                </div>
              </div>
            ))}

            {/* 指针 - 时针 */}
            <div 
              className={`absolute left-1/2 top-1/2 w-4 h-32 md:h-40 -mt-32 md:-mt-40 -ml-2 rounded-full origin-bottom cursor-grab active:cursor-grabbing transition-transform duration-150
                ${dayNightFactor ? 'bg-slate-800' : 'bg-white shadow-[0_0_15px_white]'}`}
              style={{ transform: `rotate(${(hours % 12) * 30 + minutes * 0.5}deg)` }}
              onMouseDown={() => draggingHand.current = 'hour'}
              onTouchStart={() => draggingHand.current = 'hour'}
            />

            {/* 指针 - 分针 */}
            <div 
              className={`absolute left-1/2 top-1/2 w-2 h-40 md:h-52 -mt-40 md:-mt-52 -ml-1 rounded-full origin-bottom cursor-grab active:cursor-grabbing transition-transform duration-100
                ${dayNightFactor ? 'bg-cyan-600' : 'bg-cyan-400 shadow-[0_0_20px_#22d3ee]'}`}
              style={{ transform: `rotate(${minutes * 6}deg)` }}
              onMouseDown={() => draggingHand.current = 'minute'}
              onTouchStart={() => draggingHand.current = 'minute'}
            />

            {/* 中心圆点 */}
            <div className={`absolute left-1/2 top-1/2 -ml-4 -mt-4 w-8 h-8 rounded-full border-4 ${dayNightFactor ? 'bg-slate-800 border-white' : 'bg-cyan-400 border-slate-900'} shadow-lg`}></div>
          </div>

          {/* 数字显示 & 答题控制 */}
          <div className="mt-16 flex flex-col items-center gap-6">
            {mode === 'quiz' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center">
                <div className={`px-10 py-5 rounded-[2rem] border-4 ${dayNightFactor ? 'bg-white border-slate-800' : 'bg-slate-900 border-cyan-400'} shadow-2xl mb-6`}>
                   <span className={`text-[10px] block mb-1 text-center font-black tracking-[0.3em] ${dayNightFactor ? 'text-slate-400' : 'text-slate-500'}`}>TARGET_TIME</span>
                   <span className={`text-6xl font-black tech-font ${dayNightFactor ? 'text-slate-800' : 'text-white'}`}>
                    {targetTime.h.toString().padStart(2, '0')}:{targetTime.m.toString().padStart(2, '0')}
                   </span>
                </div>
                <button 
                  onClick={handleVerify}
                  className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black tech-font rounded-2xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/20"
                >
                  <CheckCircle /> SUBMIT_SYNC
                </button>
              </div>
            ) : (
              <div className={`px-12 py-6 rounded-3xl border ${dayNightFactor ? 'bg-white border-sky-100 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'}`}>
                <span className="text-7xl font-black tech-font tracking-widest italic">
                  {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
};

const ModeBtn = ({ active, onClick, label, sub, icon, light }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
    active 
      ? (light ? 'bg-slate-800 border-slate-800 text-white' : 'bg-cyan-500 border-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]') 
      : (light ? 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100' : 'bg-slate-800/50 border-transparent text-slate-400 hover:border-slate-700')
  }`}>
    <div className={`p-2 rounded-lg ${active ? 'bg-white/20' : (light ? 'bg-slate-200' : 'bg-slate-700')}`}>{icon}</div>
    <div className="text-left">
      <div className="text-sm font-black uppercase leading-none">{label}</div>
      <div className={`text-[9px] font-mono mt-1 ${active ? 'opacity-60' : 'opacity-40'}`}>{sub}</div>
    </div>
  </button>
);

const StatBox = ({ label, val, color, light }: any) => (
  <div className={`p-4 rounded-2xl border ${light ? 'bg-slate-50 border-slate-100' : 'bg-slate-800/50 border-slate-700/50'}`}>
    <div className={`text-2xl font-black tech-font ${color}`}>{val}</div>
    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">{label}</div>
  </div>
);

export default ClockApp;
