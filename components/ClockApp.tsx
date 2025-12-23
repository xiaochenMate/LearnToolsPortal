
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, RotateCcw, CheckCircle, Trophy, Zap, Sun, Coffee, 
  Utensils, MoonStar, Home, Settings2, Eye, EyeOff, 
  Award, Volume2, ArrowRightLeft, HelpCircle, ChevronUp, ChevronDown, Menu
} from 'lucide-react';

type Mode = 'explore' | 'quiz';
type Difficulty = 'simple' | 'medium' | 'hard';

const ClockApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('explore');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [totalMinutes, setTotalMinutes] = useState(600); // 当前时钟状态
  const [targetMinutes, setTargetMinutes] = useState(480); // 目标时间
  const [targetIsPM, setTargetIsPM] = useState(false); // 目标AM/PM
  const [showDigital, setShowDigital] = useState(true);
  const [isPM, setIsPM] = useState(false); // 用户当前AM/PM状态
  const [score, setScore] = useState(0);
  const [isDragging, setIsDragging] = useState<'hour' | 'minute' | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // 移动端侧边栏控制

  const clockRef = useRef<HTMLDivElement>(null);

  // --- 核心计算 ---
  const hours = useMemo(() => {
    let h = Math.floor(totalMinutes / 60) % 12;
    return h === 0 ? 12 : h;
  }, [totalMinutes]);
  
  const minutes = useMemo(() => {
    let m = totalMinutes % 60;
    return m < 0 ? 60 + m : m;
  }, [totalMinutes]);
  
  const displayH = useMemo(() => (isPM ? (hours === 12 ? 12 : hours + 12) : (hours === 12 ? 0 : hours)), [hours, isPM]);

  // --- 场景色彩系统 ---
  const sceneConfig = useMemo(() => {
    const h = displayH;
    if (h >= 5 && h < 8) return { label: '清晨：该起床啦', icon: <Zap className="text-yellow-400" />, theme: 'from-orange-200 to-blue-300' };
    if (h >= 8 && h < 12) return { label: '上午：元气满满', icon: <Coffee className="text-blue-400" />, theme: 'from-blue-200 to-indigo-300' };
    if (h >= 12 && h < 14) return { label: '中午：美味午餐', icon: <Utensils className="text-orange-400" />, theme: 'from-yellow-100 to-orange-200' };
    if (h >= 14 && h < 18) return { label: '下午：学习运动', icon: <Sun className="text-amber-500" />, theme: 'from-blue-100 to-amber-100' };
    if (h >= 18 && h < 21) return { label: '晚上：温馨时刻', icon: <Home className="text-indigo-400" />, theme: 'from-indigo-300 to-purple-500' };
    return { label: '深夜：静谧美梦', icon: <MoonStar className="text-purple-400" />, theme: 'from-slate-900 to-indigo-900' };
  }, [displayH]);

  const isNight = displayH < 6 || displayH >= 19;

  // --- 交互逻辑 ---
  const handlePointerDown = (e: React.PointerEvent, type: 'hour' | 'minute') => {
    e.preventDefault();
    const target = e.currentTarget as HTMLDivElement;
    target.setPointerCapture(e.pointerId);
    setIsDragging(type);
  };

  const calculateAngle = (clientX: number, clientY: number) => {
    if (!clockRef.current) return 0;
    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return angle;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const angle = calculateAngle(e.clientX, e.clientY);
    
    if (isDragging === 'minute') {
      const newMinutes = Math.round(angle / 6) % 60;
      const currentH = Math.floor(totalMinutes / 60);
      const oldM = totalMinutes % 60;

      let hOffset = 0;
      if (oldM > 45 && newMinutes < 15) hOffset = 1;
      if (oldM < 15 && newMinutes > 45) hOffset = -1;

      setTotalMinutes((currentH + hOffset) * 60 + newMinutes);
    } else {
      const newHours = Math.floor(angle / 30) % 12;
      setTotalMinutes(newHours * 60 + (totalMinutes % 60));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(null);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // --- 题目生成与校验 ---
  const generateQuiz = useCallback(() => {
    let h = Math.floor(Math.random() * 12) + 1; // 1-12
    let m = 0;
    if (difficulty === 'simple') m = Math.random() > 0.5 ? 0 : 30;
    else if (difficulty === 'medium') m = Math.floor(Math.random() * 12) * 5;
    else m = Math.floor(Math.random() * 60);
    
    setTargetMinutes(h * 60 + m);
    setTargetIsPM(Math.random() > 0.5);
    // 重置用户时钟到随机位置
    setTotalMinutes(Math.floor(Math.random() * 12) * 60);
    setIsPM(Math.random() > 0.5);
  }, [difficulty]);

  const checkAnswer = () => {
    const targetH = Math.floor(targetMinutes / 60) % 12 || 12;
    const targetM = targetMinutes % 60;
    
    // 关键修复：同时校验 小时、分钟 和 AM/PM
    const isCorrect = hours === targetH && minutes === targetM && isPM === targetIsPM;
    
    if (isCorrect) {
      setScore(s => s + 10);
      // 成功动效提示（此处简化为alert，实际可增加烟花效果）
      const successMsg = new SpeechSynthesisUtterance("太棒了，完全正确！积分加十");
      successMsg.lang = 'zh-CN';
      window.speechSynthesis.speak(successMsg);
      generateQuiz();
    } else {
      alert(`不对哦。目标是 ${targetIsPM ? '下午' : '上午'} ${targetH}:${targetM.toString().padStart(2, '0')}，再检查一下吧！`);
    }
  };

  const speakTime = () => {
    const text = `现在是${isPM ? '下午' : '上午'}${hours}点${minutes === 0 ? '整' : minutes + '分'}`;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'zh-CN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-y-auto no-scrollbar transition-all duration-1000 bg-gradient-to-br ${sceneConfig.theme}`}>
      
      {/* 顶部 HUD - 响应式优化 */}
      <header className="sticky top-0 h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/10 backdrop-blur-md border-b border-white/20 z-40 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2 text-white bg-white/10 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="p-2 md:p-3 bg-white/20 rounded-xl md:rounded-2xl shadow-inner">
            {sceneConfig.icon}
          </div>
          <div className="hidden sm:block">
            <h1 className={`text-sm md:text-xl font-black tech-font uppercase ${isNight ? 'text-white' : 'text-slate-800'}`}>Time_Master_v2</h1>
            <p className={`text-[8px] md:text-[10px] font-bold opacity-60 ${isNight ? 'text-blue-200' : 'text-slate-500'}`}>{sceneConfig.label}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          {mode === 'quiz' && (
            <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full font-black text-xs md:text-sm shadow-lg">
              SCORE: {score}
            </div>
          )}
          <button onClick={onClose} className={`p-2 rounded-full hover:bg-black/5 transition-colors ${isNight ? 'text-white' : 'text-slate-800'}`}>
            <X size={24}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 gap-6 lg:gap-8 max-w-7xl mx-auto w-full items-center lg:items-start">
        
        {/* 控制台 - 移动端抽屉式/平铺展示 */}
        <aside className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 lg:w-72 bg-slate-900/90 lg:bg-transparent backdrop-blur-2xl lg:backdrop-blur-none z-50 lg:z-0 p-6 lg:p-0 space-y-4 transition-transform duration-300`}>
          <div className="flex lg:hidden justify-between items-center mb-6">
            <span className="text-white font-black tech-font tracking-widest">CONTROL_CENTER</span>
            <button onClick={() => setShowSidebar(false)} className="text-slate-400"><X /></button>
          </div>
          
          <div className="bg-white/30 lg:bg-white/30 backdrop-blur-xl border border-white/20 p-5 rounded-[28px] shadow-xl">
            <h2 className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">模式切换</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => {setMode('explore'); setShowSidebar(false);}} className={`p-3 rounded-xl flex items-center gap-3 font-bold transition-all text-sm ${mode === 'explore' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/50 text-slate-600'}`}>
                <Settings2 size={16}/> 自由探索
              </button>
              <button onClick={() => {setMode('quiz'); generateQuiz(); setShowSidebar(false);}} className={`p-3 rounded-xl flex items-center gap-3 font-bold transition-all text-sm ${mode === 'quiz' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white/50 text-slate-600'}`}>
                <Award size={16}/> 闯关模式
              </button>
            </div>
          </div>

          <div className="bg-white/30 backdrop-blur-xl border border-white/20 p-5 rounded-[28px] shadow-xl">
            <h2 className="text-[10px] font-black uppercase opacity-40 mb-4 tracking-widest">辅助功能</h2>
            <div className="space-y-2">
              <button onClick={() => setShowDigital(!showDigital)} className="w-full p-2.5 rounded-lg bg-white/50 flex justify-between items-center text-xs font-bold text-slate-700">
                数字显示 {showDigital ? <Eye size={14}/> : <EyeOff size={14}/>}
              </button>
              <button onClick={speakTime} className="w-full p-2.5 rounded-lg bg-blue-500 text-white flex justify-center items-center gap-2 font-bold text-xs shadow-lg">
                <Volume2 size={14}/> 语音播报
              </button>
              <button onClick={() => setIsPM(!isPM)} className={`w-full p-2.5 rounded-lg font-bold flex justify-center items-center gap-2 border-2 transition-all text-xs ${isPM ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-amber-400 border-amber-300 text-amber-950'}`}>
                <ArrowRightLeft size={14}/> {isPM ? '下午 PM' : '上午 AM'}
              </button>
            </div>
          </div>
        </aside>

        {/* 钟表主体 - 增加响应式缩放 */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full py-4 min-h-[500px]">
          <div 
            ref={clockRef}
            className={`relative rounded-full border-[8px] md:border-[12px] shadow-[10px_10px_40px_rgba(0,0,0,0.1),-10px_-10px_40px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all duration-500 
            w-64 h-64 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] lg:w-[460px] lg:h-[460px]
            ${isNight ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-50'}`}
          >
            {/* 刻度 */}
            {[...Array(60)].map((_, i) => (
              <div key={i} className="absolute inset-0 flex justify-center py-1 md:py-2 pointer-events-none" style={{ transform: `rotate(${i * 6}deg)` }}>
                <div className={`transition-all ${i % 5 === 0 ? `h-4 md:h-6 w-0.5 md:w-1 rounded-full ${isNight ? 'bg-slate-500' : 'bg-slate-300'}` : `h-1 md:h-2 w-0.5 opacity-30 ${isNight ? 'bg-slate-600' : 'bg-slate-400'}`}`} />
              </div>
            ))}
            {/* 数字 */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => (
              <div key={n} className="absolute inset-0 p-6 sm:p-8 md:p-10 pointer-events-none" style={{ transform: `rotate(${i * 30}deg)` }}>
                <div className={`w-full text-center text-lg sm:text-2xl md:text-3xl font-black tech-font ${isNight ? 'text-white/80' : 'text-slate-800'}`} style={{ transform: `rotate(-${i * 30}deg)` }}>{n}</div>
              </div>
            ))}

            {/* 时针交互层 */}
            <div 
              className="absolute inset-0 z-10"
              style={{ transform: `rotate(${(totalMinutes / 60) * 30}deg)` }}
            >
              <div 
                className="absolute left-1/2 bottom-1/2 w-8 h-20 sm:h-28 md:h-40 lg:h-48 -ml-4 cursor-grab active:cursor-grabbing group"
                onPointerDown={(e) => handlePointerDown(e, 'hour')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-3 md:w-4 h-full rounded-full shadow-lg transition-all group-hover:ring-4 group-hover:ring-blue-500/20 ${isNight ? 'bg-white' : 'bg-slate-800'}`} />
              </div>
            </div>

            {/* 分针交互层 */}
            <div 
              className="absolute inset-0 z-20"
              style={{ transform: `rotate(${(totalMinutes % 60) * 6}deg)` }}
            >
              <div 
                className="absolute left-1/2 bottom-1/2 w-10 h-28 sm:h-36 md:h-48 lg:h-56 -ml-5 cursor-grab active:cursor-grabbing group"
                onPointerDown={(e) => handlePointerDown(e, 'minute')}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 md:w-2 h-full rounded-full bg-emerald-500 shadow-xl transition-all group-hover:ring-4 group-hover:ring-emerald-500/20" />
              </div>
            </div>

            {/* 中心轴 */}
            <div className={`absolute w-6 h-6 md:w-8 md:h-8 rounded-full border-2 md:border-4 z-30 shadow-2xl ${isNight ? 'bg-slate-800 border-white' : 'bg-white border-slate-900'}`} />
          </div>

          {/* 信息展示区域 - 移动端增加外间距 */}
          <div className="mt-8 md:mt-12 w-full max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {mode === 'quiz' ? (
              <div className="bg-white/40 backdrop-blur-2xl border-4 border-white/30 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl flex flex-col items-center">
                 <span className="text-[9px] md:text-[10px] font-black text-emerald-600 mb-2 uppercase tracking-widest text-center">请拨动到以下时间</span>
                 <div className="text-4xl md:text-6xl font-black tech-font italic text-slate-800 mb-6 md:mb-8 flex items-baseline">
                   {(Math.floor(targetMinutes / 60) % 12 || 12).toString().padStart(2, '0')}:{ (targetMinutes % 60).toString().padStart(2, '0') }
                   <span className="text-sm md:text-xl ml-3 md:ml-4 opacity-40 font-sans">{targetIsPM ? 'PM' : 'AM'}</span>
                 </div>
                 <button onClick={checkAnswer} className="w-full py-4 md:py-5 bg-emerald-500 text-white font-black text-lg md:text-xl rounded-2xl flex items-center justify-center gap-3 md:gap-4 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                    <CheckCircle size={20} /> 确认提交
                 </button>
              </div>
            ) : (
              showDigital && (
                <div className="bg-white/20 backdrop-blur-3xl border border-white/20 rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col items-center shadow-2xl">
                  <div className={`text-5xl md:text-7xl font-black tech-font italic tracking-widest flex items-baseline ${isNight ? 'text-white' : 'text-slate-900'}`}>
                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                    <span className="text-sm md:text-2xl ml-3 md:ml-4 opacity-40 font-sans font-bold uppercase">{isPM ? 'PM' : 'AM'}</span>
                  </div>
                  <div className="mt-4 md:mt-6 flex gap-4 md:gap-6">
                     <button onClick={() => setTotalMinutes(m => m - 1)} className="p-2.5 bg-black/10 rounded-full hover:bg-black/20 text-slate-700"><ChevronDown size={24}/></button>
                     <button onClick={() => setTotalMinutes(m => m + 1)} className="p-2.5 bg-black/10 rounded-full hover:bg-black/20 text-slate-700"><ChevronUp size={24}/></button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <style>{`
        .tech-font { font-family: 'Orbitron', sans-serif; }
        /* 针对超小屏设备的适配 */
        @media (max-height: 700px) {
          main { padding-top: 1rem; }
          .clock-container { scale: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default ClockApp;
