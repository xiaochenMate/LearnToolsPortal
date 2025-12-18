import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, RotateCcw, CheckCircle, HelpCircle, Trophy, ArrowLeftRight, Clock } from 'lucide-react';

type Mode = 'practice' | 'challenge';

const ClockApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('practice');
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  
  // Challenge mode state
  const [targetTime, setTargetTime] = useState({ h: 12, m: 0 });
  const [inputH, setInputH] = useState('');
  const [inputM, setInputM] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'none', msg: string }>({ type: 'none', msg: '' });
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const clockRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<'hour' | 'minute' | null>(null);

  // Initialize challenge
  useEffect(() => {
    if (mode === 'challenge') {
      generateNewChallenge();
    }
  }, [mode]);

  const generateNewChallenge = () => {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5; // Multiples of 5 for easier learning
    setTargetTime({ h, m });
    setHours(h);
    setMinutes(m);
    setInputH('');
    setInputM('');
    setFeedback({ type: 'none', msg: '' });
  };

  const checkAnswer = () => {
    const h = parseInt(inputH);
    const m = parseInt(inputM);
    
    if (isNaN(h) || isNaN(m)) {
      setFeedback({ type: 'wrong', msg: '请输入完整的时间哦！' });
      return;
    }

    if (h === targetTime.h && m === targetTime.m) {
      setFeedback({ type: 'correct', msg: '太棒了！完全正确 ✅' });
      setScore(s => ({ correct: s.correct + 1, total: s.total + 1 }));
      setTimeout(generateNewChallenge, 2000);
    } else {
      setFeedback({ type: 'wrong', msg: `不对哦，正确答案是 ${targetTime.h}:${targetTime.m.toString().padStart(2, '0')} ❌` });
      setScore(s => ({ ...s, total: s.total + 1 }));
    }
  };

  // Drag Logic
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging.current || mode === 'challenge' || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate angle in degrees
    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Offset so 12 o'clock is 0deg

    if (isDragging.current === 'minute') {
      // Snap to minutes (6 degrees per minute)
      const newMinutes = Math.round(angle / 6) % 60;
      setMinutes(newMinutes);
    } else if (isDragging.current === 'hour') {
      // Snap to hours (30 degrees per hour)
      let newHours = Math.floor(angle / 30);
      newHours = newHours === 0 ? 12 : newHours;
      setHours(newHours);
    }
  }, [mode]);

  const onMouseDown = (type: 'hour' | 'minute') => {
    if (mode === 'challenge') return;
    isDragging.current = type;
  };

  useEffect(() => {
    const onGlobalMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onGlobalTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onGlobalUp = () => { isDragging.current = null; };

    window.addEventListener('mousemove', onGlobalMove);
    window.addEventListener('mouseup', onGlobalUp);
    window.addEventListener('touchmove', onGlobalTouchMove);
    window.addEventListener('touchend', onGlobalUp);

    return () => {
      window.removeEventListener('mousemove', onGlobalMove);
      window.removeEventListener('mouseup', onGlobalUp);
      window.removeEventListener('touchmove', onGlobalTouchMove);
      window.removeEventListener('touchend', onGlobalUp);
    };
  }, [handleMove]);

  // Visual rotations
  const minuteRotation = minutes * 6;
  const hourRotation = (hours % 12) * 30 + (minutes / 60) * 30;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col font-sans overflow-hidden select-none">
      {/* Navbar */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-lg text-white">
            <Clock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">互动钟表学习</h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-500" />
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 gap-8 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Left: Controls & Stats */}
        <div className="lg:w-80 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">学习模式</h2>
            <div className="flex flex-col gap-2">
              <ModeButton 
                active={mode === 'practice'} 
                onClick={() => setMode('practice')} 
                icon={<RotateCcw className="w-4 h-4" />}
                label="练习模式"
                desc="自由拖动指针，认识时间"
              />
              <ModeButton 
                active={mode === 'challenge'} 
                onClick={() => setMode('challenge')} 
                icon={<HelpCircle className="w-4 h-4" />}
                label="出题模式"
                desc="测试你的认钟能力"
              />
            </div>
          </div>

          {mode === 'challenge' && (
            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-indigo-500" /> 计分板
                </h3>
                <span className="text-xs font-mono bg-white px-2 py-1 rounded-full text-indigo-600 border border-indigo-200">Accuracy: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white p-3 rounded-2xl">
                  <div className="text-2xl font-bold text-emerald-500">{score.correct}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">正确</div>
                </div>
                <div className="bg-white p-3 rounded-2xl">
                  <div className="text-2xl font-bold text-slate-400">{score.total}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">总计</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Clock Face */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <div 
            ref={clockRef}
            className="relative w-72 h-72 md:w-96 md:h-96 rounded-full bg-white border-[12px] border-slate-800 shadow-2xl flex items-center justify-center transition-transform"
          >
            {/* Ticks */}
            {[...Array(60)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full h-full flex justify-center pointer-events-none"
                style={{ transform: `rotate(${i * 6}deg)` }}
              >
                <div className={`w-1 ${i % 5 === 0 ? 'h-5 bg-slate-800 w-1.5' : 'h-2 bg-slate-300'}`}></div>
              </div>
            ))}

            {/* Numbers */}
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-full h-full p-8 pointer-events-none"
                style={{ transform: `rotate(${(i + 1) * 30}deg)` }}
              >
                <div 
                  className="w-full flex justify-center text-2xl font-black text-slate-800"
                  style={{ transform: `rotate(-${(i + 1) * 30}deg)` }}
                >
                  {i + 1}
                </div>
              </div>
            ))}

            {/* Hands */}
            {/* Hour Hand */}
            <div 
              className={`absolute w-3 h-24 md:h-32 bg-slate-800 rounded-full origin-bottom cursor-pointer transition-transform duration-100 shadow-md ${mode === 'challenge' ? 'pointer-events-none' : 'hover:scale-y-105 active:scale-y-110'}`}
              style={{ 
                transform: `translateY(-50%) rotate(${hourRotation}deg)`,
                top: '50%'
              }}
              onMouseDown={(e) => { e.stopPropagation(); onMouseDown('hour'); }}
              onTouchStart={(e) => { e.stopPropagation(); onMouseDown('hour'); }}
            >
              <div className="absolute top-0 w-full h-4 bg-indigo-500 rounded-full"></div>
            </div>

            {/* Minute Hand */}
            <div 
              className={`absolute w-1.5 h-32 md:h-44 bg-slate-500 rounded-full origin-bottom cursor-pointer transition-transform duration-100 shadow-sm ${mode === 'challenge' ? 'pointer-events-none' : 'hover:scale-y-105 active:scale-y-110'}`}
              style={{ 
                transform: `translateY(-50%) rotate(${minuteRotation}deg)`,
                top: '50%'
              }}
              onMouseDown={(e) => { e.stopPropagation(); onMouseDown('minute'); }}
              onTouchStart={(e) => { e.stopPropagation(); onMouseDown('minute'); }}
            >
              <div className="absolute top-0 w-full h-6 bg-rose-500 rounded-full"></div>
            </div>

            {/* Center Pin */}
            <div className="absolute w-6 h-6 bg-slate-800 rounded-full border-4 border-white shadow-lg z-10"></div>
          </div>

          {/* Digital Display */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-slate-800 text-white px-8 py-4 rounded-3xl font-mono text-5xl md:text-7xl tracking-widest shadow-xl border-4 border-slate-700">
              {mode === 'challenge' ? '--:--' : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}
            </div>
            
            <div className="text-slate-500 font-medium">
              {mode === 'practice' ? '拖动指针来探索时间' : '观察表盘，在右侧/下方填写时间'}
            </div>
          </div>
        </div>

        {/* Right: Challenge Panel */}
        <div className={`lg:w-80 flex flex-col gap-6 transition-all ${mode === 'challenge' ? 'opacity-100 translate-x-0' : 'opacity-30 pointer-events-none translate-x-4'}`}>
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> 回答问题
              </h3>
              
              <div className="flex items-center gap-3 mb-8">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">小时 Hour</label>
                  <input 
                    type="number" 
                    value={inputH}
                    onChange={(e) => setInputH(e.target.value)}
                    placeholder="1-12"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 text-center text-xl font-bold outline-none transition-all"
                  />
                </div>
                <div className="text-3xl font-bold text-slate-300 pt-5">:</div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">分钟 Minute</label>
                  <input 
                    type="number" 
                    value={inputM}
                    onChange={(e) => setInputM(e.target.value)}
                    placeholder="0-59"
                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 rounded-2xl px-4 py-3 text-center text-xl font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={checkAnswer}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> 检查答案
                </button>
                <button 
                  onClick={generateNewChallenge}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                >
                  跳过此题
                </button>
              </div>

              {feedback.type !== 'none' && (
                <div className={`mt-6 p-4 rounded-2xl text-center text-sm font-medium border animate-in slide-in-from-top-2 duration-300 ${
                  feedback.type === 'correct' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {feedback.msg}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ModeButton = ({ active, onClick, icon, label, desc }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, desc: string }) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 text-left transition-all ${
      active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'
    }`}
  >
    <div className="flex items-center gap-3 mb-1">
      <div className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-indigo-100 text-indigo-500'}`}>{icon}</div>
      <span className="font-bold">{label}</span>
    </div>
    <p className={`text-[10px] leading-tight ${active ? 'text-white/70' : 'text-slate-400'}`}>{desc}</p>
  </button>
);

export default ClockApp;