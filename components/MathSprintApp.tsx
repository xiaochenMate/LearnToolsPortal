
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Zap, Trophy, Timer, RefreshCcw, Sparkles } from 'lucide-react';

const MathSprintApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'result'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [question, setQuestion] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [userAns, setUserAns] = useState('');
  const [combo, setCombo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateQuestion = useCallback(() => {
    const a = Math.floor(Math.random() * 90) + 10;
    const b = Math.floor(Math.random() * 80) + 10;
    const op = Math.random() > 0.5 ? '+' : '-';
    let ans = op === '+' ? a + b : a - b;
    if (ans < 0) { // 确保结果为正
        setQuestion({ a: b, b: a, op: '-', ans: b - a });
    } else {
        setQuestion({ a, b, op, ans });
    }
    setUserAns('');
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setGameState('playing');
    generateQuestion();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    let timer: number;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = window.setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setGameState('result');
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserAns(val);
    if (parseInt(val) === question.ans) {
      setScore(s => s + 10 + combo);
      setCombo(c => c + 1);
      generateQuestion();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A] flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 text-white">
        <div className="flex items-center gap-4">
          <Zap className="text-yellow-400 w-6 h-6" />
          <h1 className="text-xl font-black tech-font uppercase italic tracking-tighter">Math_Sprint_x100</h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={28} /></button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {gameState === 'idle' && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-yellow-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-yellow-500/20">
               <Zap size={64} className="text-black fill-current" />
            </div>
            <h2 className="text-4xl font-black text-white tech-font mb-4 uppercase">加减速算王</h2>
            <p className="text-slate-500 font-mono text-sm tracking-widest mb-10 italic">100以内限时心算挑战 // 连击可获双倍积分</p>
            <button onClick={startGame} className="px-12 py-5 bg-white text-black font-black text-xl rounded-2xl flex items-center gap-4 hover:bg-emerald-500 transition-all active:scale-95 shadow-xl">
              <Play fill="black" /> INITIALIZE_GAME
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="w-full max-w-2xl">
            <div className="flex justify-between items-center mb-12">
               <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                 <Timer className="text-emerald-400" />
                 <span className="text-3xl font-black tech-font text-white">{timeLeft}s</span>
               </div>
               <div className="flex flex-col items-end">
                 <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Score_Matrix</span>
                 <span className="text-4xl font-black tech-font text-yellow-400 italic">{score}</span>
               </div>
            </div>

            <div className="bg-slate-900 border-4 border-slate-800 rounded-[3rem] p-16 flex flex-col items-center relative shadow-inner">
               {combo > 2 && (
                 <div className="absolute -top-6 bg-emerald-500 text-black px-4 py-1 rounded-full font-black italic text-sm animate-bounce shadow-lg flex items-center gap-2">
                   <Sparkles size={14}/> COMBO X{combo}
                 </div>
               )}
               
               <div className="text-8xl font-black tech-font italic text-white flex items-center gap-10 mb-12">
                  <span>{question.a}</span>
                  <span className="text-emerald-500">{question.op}</span>
                  <span>{question.b}</span>
                  <span className="text-slate-700">=</span>
               </div>

               <input 
                 ref={inputRef}
                 type="number"
                 value={userAns}
                 onChange={handleInput}
                 className="w-full max-w-xs bg-slate-800 border-none rounded-3xl py-8 text-center text-6xl font-black tech-font italic text-emerald-400 focus:ring-4 focus:ring-emerald-500/30 transition-all placeholder:text-slate-700"
                 placeholder="??"
               />
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
             <Trophy size={80} className="text-yellow-400 mx-auto mb-8 animate-pulse" />
             <h3 className="text-2xl font-black text-white tech-font mb-2 uppercase">挑战结束</h3>
             <div className="text-7xl font-black tech-font italic text-white mb-10 tracking-tighter">FINAL_SCORE: {score}</div>
             <div className="flex gap-4 justify-center">
               <button onClick={startGame} className="px-10 py-4 bg-emerald-500 text-black font-black rounded-xl flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                 <RefreshCcw size={20}/> 再来一局
               </button>
               <button onClick={onClose} className="px-10 py-4 bg-slate-800 text-white font-black rounded-xl border border-slate-700">
                 退出系统
               </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MathSprintApp;
