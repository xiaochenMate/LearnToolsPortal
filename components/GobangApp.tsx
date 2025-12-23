
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X, RotateCcw, Undo2, Users, Cpu, Trophy, Sparkles, BrainCircuit, Activity, BarChart3, Settings2, Info } from 'lucide-react';
import { Player, Board, checkWin, getBestMove, getScoreMap } from '../lib/gobangAI';

const BOARD_SIZE = 15;
const CANVAS_SIZE = 600;
const GRID_SIZE = CANVAS_SIZE / (BOARD_SIZE + 1);

type Difficulty = 'NOVICE' | 'EXPERT' | 'MASTER';

const GobangApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<Board>(Array(15).fill(null).map(() => Array(15).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1); 
  const [gameMode, setGameMode] = useState<'PvP' | 'PvE'>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('EXPERT');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [history, setHistory] = useState<Board[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContext = useRef<AudioContext | null>(null);

  const playStoneSound = useCallback(() => {
    if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContext.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }, []);

  const scoreMap = useMemo(() => {
    if (!showAnalysis || winner) return null;
    return getScoreMap(board, currentPlayer);
  }, [board, currentPlayer, showAnalysis, winner]);

  const drawBoard = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const bgGrad = ctx.createRadialGradient(CANVAS_SIZE/2, CANVAS_SIZE/2, 50, CANVAS_SIZE/2, CANVAS_SIZE/2, 400);
    bgGrad.addColorStop(0, '#f2d29b'); 
    bgGrad.addColorStop(1, '#deb887'); 
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= BOARD_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(GRID_SIZE, i * GRID_SIZE); ctx.lineTo(CANVAS_SIZE - GRID_SIZE, i * GRID_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, GRID_SIZE); ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE - GRID_SIZE);
      ctx.stroke();
    }
    const stars = [[3, 3], [3, 11], [11, 3], [11, 11], [7, 7]];
    ctx.fillStyle = '#333';
    stars.forEach(([r, c]) => {
      ctx.beginPath();
      ctx.arc((c + 1) * GRID_SIZE, (r + 1) * GRID_SIZE, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    if (scoreMap) {
      let maxS = 0;
      scoreMap.forEach(row => row.forEach(s => maxS = Math.max(maxS, s)));
      scoreMap.forEach((row, r) => {
        row.forEach((s, c) => {
          if (s > 0) {
            const alpha = Math.min(0.6, s / maxS);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.beginPath();
            ctx.arc((c + 1) * GRID_SIZE, (r + 1) * GRID_SIZE, GRID_SIZE * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    }
    board.forEach((row, r) => {
      row.forEach((cell, c) => { if (cell !== 0) drawStone(ctx, r, c, cell); });
    });
    if (lastMove) {
      const [r, c] = lastMove;
      const x = (c + 1) * GRID_SIZE;
      const y = (r + 1) * GRID_SIZE;
      ctx.strokeStyle = '#ff3b3b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, GRID_SIZE * 0.45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y);
      ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5);
      ctx.stroke();
    }
  }, [board, lastMove, scoreMap]);

  const drawStone = (ctx: CanvasRenderingContext2D, r: number, c: number, player: Player) => {
    const x = (c + 1) * GRID_SIZE;
    const y = (r + 1) * GRID_SIZE;
    const radius = GRID_SIZE * 0.4;
    ctx.save();
    ctx.shadowBlur = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, radius/10, x, y, radius);
    if (player === 1) { gradient.addColorStop(0, '#555'); gradient.addColorStop(1, '#111'); }
    else { gradient.addColorStop(0, '#fff'); gradient.addColorStop(1, '#ddd'); }
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = player === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) { const ctx = canvas.getContext('2d'); if (ctx) drawBoard(ctx); }
  }, [drawBoard]);

  const handlePlaceStone = (r: number, c: number) => {
    if (winner || board[r][c] !== 0 || isAiThinking) return;
    playStoneSound();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    setHistory(prev => [...prev, board.map(row => [...row])]);
    setBoard(newBoard);
    setLastMove([r, c]);
    if (checkWin(newBoard, r, c)) { setWinner(currentPlayer); return; }
    const nextPlayer = (currentPlayer === 1 ? 2 : 1) as Player;
    setCurrentPlayer(nextPlayer);
    if (gameMode === 'PvE' && nextPlayer === 2) {
      setIsAiThinking(true);
      const searchDepth = difficulty === 'NOVICE' ? 1 : difficulty === 'EXPERT' ? 2 : 4;
      setTimeout(() => {
        const [aiR, aiC] = getBestMove(newBoard, searchDepth);
        if (aiR !== -1) {
          playStoneSound();
          const aiBoard = newBoard.map(row => [...row]);
          aiBoard[aiR][aiC] = 2;
          setBoard(aiBoard);
          setLastMove([aiR, aiC]);
          if (checkWin(aiBoard, aiR, aiC)) { setWinner(2); } 
          else { setCurrentPlayer(1); }
        }
        setIsAiThinking(false);
      }, 600);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (winner || isAiThinking) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.round(x / (rect.width / (BOARD_SIZE + 1))) - 1;
    const r = Math.round(y / (rect.height / (BOARD_SIZE + 1))) - 1;
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) handlePlaceStone(r, c);
  };

  const resetGame = () => {
    setBoard(Array(15).fill(null).map(() => Array(15).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setHistory([]);
    setLastMove(null);
    setIsAiThinking(false);
  };

  const undoMove = () => {
    if (history.length === 0 || isAiThinking || winner) return;
    if (gameMode === 'PvE') {
      if (history.length < 2) return;
      setBoard(history[history.length - 2]);
      setHistory(prev => prev.slice(0, -2));
    } else {
      setBoard(history[history.length - 1]);
      setHistory(prev => prev.slice(0, -1));
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }
    setLastMove(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <header className="h-20 bg-slate-900/90 backdrop-blur-xl border-b border-emerald-500/30 flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
            <BrainCircuit className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tech-font text-white flex items-center gap-3 italic">
              ZST 五子棋 <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 tech-font">神经元 V2</span>
            </h1>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[9px] font-black text-emerald-500/70 uppercase tracking-[0.2em] flex items-center gap-1">
                 <Activity size={10} /> 引擎: 稳定运行
               </span>
               <div className="w-1 h-1 rounded-full bg-slate-700"></div>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">{isAiThinking ? 'AI 计算中...' : '系统待命'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
            <button onClick={() => {setGameMode('PvP'); resetGame();}} className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${gameMode === 'PvP' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              <Users size={14}/> 本地双人
            </button>
            <button onClick={() => {setGameMode('PvE'); resetGame();}} className={`px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all ${gameMode === 'PvE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
              <Cpu size={14}/> 人机对弈
            </button>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800/50 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-full transition-all text-slate-500 hover:text-red-500">
            <X size={20}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 relative z-10 overflow-y-auto no-scrollbar">
        <aside className="w-full lg:w-72 flex flex-col gap-4">
           <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-2xl">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Settings2 size={16} /> 对弈配置
              </h3>
              <div className="space-y-6">
                <div>
                   <label className="text-[10px] text-slate-500 font-black uppercase mb-3 block">AI 难度等级</label>
                   <div className="grid grid-cols-1 gap-2">
                      {(['NOVICE', 'EXPERT', 'MASTER'] as Difficulty[]).map(d => (
                        <button key={d} onClick={() => {setDifficulty(d); resetGame();}} className={`py-3 px-4 rounded-xl text-left text-[11px] font-black transition-all border ${difficulty === d ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                           {d === 'NOVICE' ? '◇ 初学者 (入门)' : d === 'EXPERT' ? '◈ 专家 (进阶)' : '◆ 大师 (极限)'}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="pt-4 border-t border-slate-800">
                   <button onClick={() => setShowAnalysis(!showAnalysis)} className={`w-full py-4 px-5 rounded-2xl flex items-center justify-between transition-all border ${showAnalysis ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                      <div className="flex items-center gap-3">
                         <BrainCircuit size={18}/>
                         <span className="text-[11px] font-black uppercase">神经分析热力图</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${showAnalysis ? 'bg-white/30' : 'bg-slate-700'}`}>
                         <div className={`absolute top-1 w-2 h-2 rounded-full transition-all ${showAnalysis ? 'right-1 bg-white' : 'left-1 bg-slate-500'}`}></div>
                      </div>
                   </button>
                   <p className="mt-3 text-[9px] text-slate-500 italic leading-relaxed font-medium">
                     * 开启后将实时显示落子点的战略评估，辅助战术学习。
                   </p>
                </div>
              </div>
           </div>
        </aside>

        <div className="flex flex-col items-center">
          <div className="mb-6 flex items-center gap-12">
            <div className={`flex items-center gap-4 transition-all duration-500 ${currentPlayer === 1 ? 'scale-110' : 'opacity-30 blur-[1px]'}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-black shadow-2xl border border-white/10" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-slate-500 uppercase">黑方</span>
                 <span className="text-white font-black tech-font">玩家 01</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className={`flex items-center gap-4 transition-all duration-500 ${currentPlayer === 2 ? 'scale-110' : 'opacity-30 blur-[1px]'}`}>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-500 uppercase">{gameMode === 'PvE' ? '引擎' : '白方'}</span>
                 <span className="text-white font-black tech-font uppercase">{gameMode === 'PvE' ? '神经元 AI' : '玩家 02'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-slate-300 shadow-2xl border border-black/10" />
            </div>
          </div>

          <div className="relative group p-3 bg-slate-800/30 rounded-[2.5rem] border border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} onClick={handleCanvasClick} className="relative bg-white border border-slate-900 rounded-[2rem] shadow-2xl max-w-full h-auto aspect-square cursor-crosshair transition-transform active:scale-[0.995]" />
            {winner && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 z-30">
                <div className="relative mb-6">
                   <div className="absolute -inset-8 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                   <Trophy size={120} className="text-emerald-400 relative animate-bounce" />
                </div>
                <h2 className="text-5xl font-black text-white italic tech-font mb-2 uppercase tracking-tighter">
                  {winner === 'Draw' ? '平局' : (winner === 1 ? '黑方获胜' : '白方获胜')}
                </h2>
                <p className="text-emerald-500 font-bold uppercase tracking-[0.4em] mb-12 text-sm">博弈序列已完成</p>
                <button onClick={resetGame} className="px-16 py-5 bg-emerald-600 text-white font-black text-xl rounded-2xl hover:bg-emerald-500 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] active:scale-95 tech-font uppercase italic tracking-widest">
                  开启新对弈
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center gap-4">
             <button onClick={undoMove} className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 rounded-2xl transition-all shadow-xl group">
                <Undo2 size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">悔棋</span>
             </button>
             <button onClick={resetGame} className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-500 hover:border-rose-500/50 rounded-2xl transition-all shadow-xl group">
                <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[11px] font-black uppercase tracking-widest">重置棋盘</span>
             </button>
          </div>
        </div>

        <aside className="w-full lg:w-72 flex flex-col gap-4">
           <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-6 rounded-[2rem] shadow-2xl">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BarChart3 size={16} /> 实时遥测
              </h3>
              <div className="space-y-4">
                 <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-black uppercase">总手数</span>
                    <span className="text-white font-mono font-black">{history.length}</span>
                 </div>
                 <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-black uppercase">胜算估值</span>
                    <span className="text-emerald-500 font-mono font-black">运行中...</span>
                 </div>
                 <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-2">
                       <Info size={12} className="text-blue-400" />
                       <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">战略手册</span>
                    </div>
                    <p className="text-[9px] text-slate-400 italic leading-relaxed font-medium">
                      五子棋讲究攻守平衡。在发起致命攻势前，请务必监测对手的潜在连五威胁。
                    </p>
                 </div>
              </div>
           </div>
        </aside>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-900 px-8 flex items-center justify-between z-20">
        <div className="flex gap-10">
          <span className="text-[9px] font-mono text-emerald-500/50 flex items-center gap-2 italic tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            神经核心: 活动中
          </span>
          <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest italic">
            Alpha-Beta 剪枝: 已启用
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em] flex items-center gap-3 italic">
          <Sparkles size={10} /> 难度系数: {difficulty}
        </div>
      </footer>
    </div>
  );
};

export default GobangApp;
