
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
  const [totalMinutes, setTotalMinutes] = useState(600); // 10:00 (10 * 60)
  const [targetMinutes, setTargetMinutes] = useState(480); // 08:00
  const [score, setScore] = useState({ correct: 0, currentStreak: 0 });
  const [showDigital, setShowDigital] = useState(true);
  const [isPM, setIsPM] = useState(false);
  
  const clockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);

  // 计算逻辑
  const hours = useMemo(() => {
    let h = Math.floor(totalMinutes / 60) % 12;
    return h === 0 ? 12 : h;
  }, [totalMinutes]);
  
  const minutes = useMemo(() => totalMinutes % 60, [totalMinutes]);
  const timeString = useMemo(() => `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`, [hours, minutes]);

  // 背景与场景
  const fullH = useMemo(() => (Math.floor(totalMinutes / 60) % 12) + (isPM ? 12 : 0), [totalMinutes, isPM]);
  
  const scene = useMemo(() => {
    if (fullH >= 5 && fullH < 8) return { label: '清晨：起床', icon: <Zap className="text-yellow-400" /> };
    if (fullH >= 8 && fullH < 12) return { label: '上午：学习', icon: <Coffee className="text-blue-400" /> };
    if (fullH >= 12 && fullH < 14) return { label: '中午：午餐', icon: <Utensils className="text-orange-400" /> };
    if (fullH >= 14 && fullH < 18) return { label: '下午：运动', icon: <Sun className="text-amber-500" /> };
    if (fullH >= 18 && fullH < 21) return { label: '晚上：团聚', icon: <Home className="text-indigo-400" /> };
    return { label: '深夜：美梦', icon: <MoonStar className="text-purple-400" /> };
  }, [fullH]);

  const isNight = fullH < 6 || fullH >= 19;

  // 交互逻辑
  const handlePointerDown = (e: React.PointerEvent, type: 'hour' | 'minute') => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(type);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (isDragging === 'minute') {
      const newMinutes = Math.round(angle / 6) % 60;
      const oldMinutes = totalMinutes % 60;
      const currentHours = Math.floor(totalMinutes / 60);

      let hourAdjust = 0;
      if (oldMinutes > 45 && newMinutes < 15) hourAdjust = 1;
      else if (oldMinutes < 15 && newMinutes > 45) hourAdjust = -1;

      setTotalMinutes((currentHours + hourAdjust) * 60 + newMinutes);
    } else {
      let newHours = Math.floor(angle / 30);
      if (newHours === 0) newHours = 12;
      setTotalMinutes((newHours % 12) * 60 + (totalMinutes % 60));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(null);
    }
  };

  const generateQuiz = useCallback(() => {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5;
    setTargetMinutes(h * 60 + m);
    setTotalMinutes(Math.floor(Math.random() * 12) * 60);
  }, []);

  const handleVerify = () => {
    if (hours === Math.floor(targetMinutes / 60) && minutes === targetMinutes % 60) {
      setScore(s => ({ correct: s.correct + 1, currentStreak: s.currentStreak + 1 }));
      generateQuiz();
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
    <div className={`fixed inset-0 z-50 flex flex-col transition-colors duration-1000 bg-gradient-to-br ${isNight ? 'from-slate-900 to-black' : 'from-blue-50 to-indigo-100'}`}>
      <header className="h-20 flex items-center justify-between px-8 bg-white/10 backdrop-blur-xl border-b border-white/10 z-30">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isNight ? 'bg-indigo-600' : 'bg-amber-400'}`}>
            {isNight ? <MoonStar size={24} className="text-white"/> : <Sun size={24} className="text-amber-950"/>}
          </div>
          <h1 className={`text-xl font-black tech-font uppercase ${isNight ? 'text-white' : 'text-slate-800'}`}>Clock_Lab_v2</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 ${isNight ? 'text-white' : 'text-slate-800'}`}><X size={28}/></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-10 max-w-7xl mx-auto w-full overflow-hidden">
        <aside className="lg:w-80 space-y-4">
          <div className="bg-white/40 backdrop-blur-2xl border border-white/20 p-6 rounded-[32px] shadow-xl">
            <h2 className="text-[10px] font-black uppercase opacity-40 mb-4">Mode_Select</h2>
            <div className="space-y-2">
              <button onClick={() => setMode('explore')} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${mode === 'explore' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white/50 border-transparent text-slate-600'}`}>
                <Settings2 size={18}/> 自由探索
              </button>
              <button onClick={() => { setMode('quiz'); generateQuiz(); }} className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${mode === 'quiz' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white/50 border-transparent text-slate-600'}`}>
                <Award size={18}/> 计时应战
              </button>
            </div>
          </div>
          
          <div className="bg-white/40 backdrop-blur-2xl border border-white/20 p-6 rounded-[32px] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-black uppercase opacity-40">Environment</h2>
              <div className="flex gap-2">
                <button onClick={() => setShowDigital(!showDigital)} className="p-2 bg-white/50 rounded-xl text-slate-600">{showDigital ? <Eye size={16}/> : <EyeOff size={16}/>}</button>
                <button onClick={speakTime} className="p-2 bg-blue-500 text-white rounded-xl"><Volume2 size={16}/></button>
              </div>
            </div>
            <div className="p-4 bg-white/50 rounded-2xl flex items-center gap-4 mb-4">
              <div className="p-2 bg-white/50 rounded-lg">{scene.icon}</div>
              <div className="text-sm font-bold text-slate-800">{scene.label}</div>
            </div>
            <button onClick={() => setIsPM(!isPM)} className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 font-black border-2 ${isPM ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-amber-400 border-amber-500 text-amber-950'}`}>
              <ArrowRightLeft size={16}/> {isPM ? '下午 PM' : '上午 AM'}
            </button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col items-center justify-center relative select-none">
          <div 
            ref={clockRef}
            className={`relative w-80 h-80 md:w-[480px] md:h-[480px] rounded-full border-[16px] shadow-2xl flex items-center justify-center transition-all duration-700
              ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            {[...Array(60)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex justify-center py-2 pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                <div className={`transition-all ${i % 5 === 0 ? `h-8 w-1.5 rounded-full ${isNight ? 'bg-slate-700' : 'bg-slate-200'}` : `h-3 w-0.5 opacity-20 bg-slate-500`}`} />
              </div>
            ))}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
              <div key={n} className="absolute inset-0 p-12 pointer-events-none" style={{ transform: `rotate(${n * 30}deg)` }}>
                <div className={`w-full text-center text-4xl font-black tech-font ${isNight ? 'text-white/80' : 'text-slate-800'}`} style={{ transform: `rotate(-${n * 30}deg)` }}>{n}</div>
              </div>
            ))}

            {/* 时针 */}
            <div 
              className={`absolute left-1/2 bottom-1/2 w-4 h-32 md:h-44 -ml-2 rounded-full origin-bottom cursor-grab active:cursor-grabbing z-10 shadow-lg ${isDragging === 'hour' ? 'ring-8 ring-blue-500/20' : ''}`}
              style={{ transform: `rotate(${(totalMinutes / 60) * 30}deg)`, backgroundColor: isNight ? '#fff' : '#1e293b' }}
              onPointerDown={(e) => handlePointerDown(e, 'hour')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-blue-500 rounded-full opacity-60" />
            </div>

            {/* 分针 */}
            <div 
              className={`absolute left-1/2 bottom-1/2 w-2 h-40 md:h-56 -ml-1 rounded-full origin-bottom cursor-grab active:cursor-grabbing z-20 shadow-xl ${isDragging === 'minute' ? 'ring-8 ring-emerald-500/20' : ''}`}
              style={{ transform: `rotate(${(totalMinutes % 60) * 6}deg)`, backgroundColor: '#10b981' }}
              onPointerDown={(e) => handlePointerDown(e, 'minute')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
               <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-t from-transparent to-white/30 rounded-full" />
            </div>

            <div className={`absolute w-10 h-10 rounded-full border-[6px] shadow-2xl z-30 ${isNight ? 'bg-slate-800 border-white' : 'bg-white border-slate-900'}`} />
          </div>

          <div className="mt-12 w-full max-w-md">
            {mode === 'quiz' ? (
              <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className={`w-full p-8 rounded-[40px] border-4 shadow-2xl mb-8 flex flex-col items-center ${isNight ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-900'}`}>
                   <span className="text-[10px] font-black text-emerald-500 mb-2 uppercase tracking-widest">Target_Goal</span>
                   <div className={`text-7xl font-black tech-font italic ${isNight ? 'text-white' : 'text-slate-800'}`}>
                    {Math.floor(targetMinutes / 60).toString().padStart(2, '0')}:{ (targetMinutes % 60).toString().padStart(2, '0') }
                   </div>
                </div>
                <button onClick={handleVerify} className="w-full py-6 bg-emerald-500 text-slate-950 font-black text-xl tech-font rounded-[2.5rem] flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                  <CheckCircle size={24} /> 确认提交
                </button>
              </div>
            ) : (
              showDigital && (
                <div className={`w-full p-8 rounded-[40px] border backdrop-blur-2xl flex flex-col items-center transition-all ${isNight ? 'bg-white/5 border-white/10 text-white' : 'bg-black/5 border-black/10 text-slate-900 shadow-xl'}`}>
                  <div className="text-7xl font-black tech-font italic tracking-widest flex items-baseline">
                    {timeString}
                    <span className="text-2xl ml-4 opacity-40 font-sans font-bold uppercase">{isPM ? 'PM' : 'AM'}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClockApp;
