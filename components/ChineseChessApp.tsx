
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, RotateCcw, Undo2, Lightbulb, Trophy, Bot, Users, Layout, Settings2, RefreshCw, Power, Swords } from 'lucide-react';
import { INITIAL_BOARD, ChessBoard, isLegalMove, isFacingKing, ChessColor, Piece, getMoveNotation } from '../lib/chessRules';
import { getBestMove } from '../lib/chessAI';

type GameMode = 'PvP' | 'PvE' | 'Sandbox';
type Difficulty = 'Novice' | 'Expert' | 'Master';

const ChineseChessApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<ChessBoard>(INITIAL_BOARD);
  const [turn, setTurn] = useState<ChessColor>('red');
  const [selected, setSelected] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<GameMode>('PvE');
  const [difficulty, setDifficulty] = useState<Difficulty>('Expert');
  const [historyStates, setHistoryStates] = useState<{ board: ChessBoard, turn: ChessColor, lastMove: [number, number] | null }[]>([]);
  const [gameOver, setGameOver] = useState<ChessColor | 'draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // 重置游戏逻辑 - 彻底清空所有相关状态
  const resetGame = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setTurn('red');
    setSelected(null);
    setLastMove(null);
    setHistoryStates([]);
    setGameOver(null);
    setHint(null);
    setIsAiThinking(false);
  }, []);

  // AI 响应逻辑
  useEffect(() => {
    if (mode === 'PvE' && turn === 'black' && !gameOver && !isAiThinking) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        try {
          const depth = difficulty === 'Novice' ? 1 : difficulty === 'Expert' ? 3 : 4;
          const [from, to] = getBestMove(board, 'black', depth);
          if (from !== -1) executeMove(from, to);
        } catch (e) {
          console.error("AI Decision Error:", e);
        } finally {
          setIsAiThinking(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, board, gameOver, difficulty]);

  // 执行移动的核心函数
  const executeMove = useCallback((from: number, to: number) => {
    const piece = board[from];
    if (!piece) return;

    const newBoard = [...board];
    newBoard[to] = newBoard[from];
    newBoard[from] = null;

    // 将军照面检查
    if (mode !== 'Sandbox' && isFacingKing(newBoard)) {
      alert("不能形成将帅照面！");
      return;
    }

    setHistoryStates(prev => [...prev, { board: [...board], turn, lastMove }]);
    setBoard(newBoard);
    setLastMove([from, to]);
    setTurn(turn === 'red' ? 'black' : 'red');
    setSelected(null);
    setHint(null);

    // 检查胜负
    const hasRedKing = newBoard.some(p => p?.type === 'king' && p.color === 'red');
    const hasBlackKing = newBoard.some(p => p?.type === 'king' && p.color === 'black');
    if (!hasRedKing) setGameOver('black');
    if (!hasBlackKing) setGameOver('red');
  }, [board, turn, mode, lastMove]);

  const handleCellClick = (idx: number) => {
    if (gameOver || isAiThinking) return;

    if (selected === null) {
      if (board[idx]) {
        if (mode === 'Sandbox' || board[idx]?.color === turn) {
          setSelected(idx);
        }
      }
    } else {
      if (board[idx]?.color === board[selected]?.color) {
        setSelected(idx);
      } else if (mode === 'Sandbox' || isLegalMove(board, selected, idx)) {
        executeMove(selected, idx);
      } else {
        setSelected(null);
      }
    }
  };

  const undoMove = () => {
    if (historyStates.length === 0 || isAiThinking) return;
    
    // 人机模式一次悔棋两步，沙盘和双人一次一步
    const steps = (mode === 'PvE' && historyStates.length >= 2) ? 2 : 1;
    const targetIdx = historyStates.length - steps;
    const targetState = historyStates[targetIdx];
    
    setBoard(targetState.board);
    setTurn(targetState.turn);
    setLastMove(targetState.lastMove);
    setHistoryStates(prev => prev.slice(0, targetIdx));
    setGameOver(null);
    setHint(null);
  };

  const getHint = () => {
    if (gameOver || isAiThinking) return;
    const [f, t] = getBestMove(board, turn, 3);
    if (f !== -1) setHint([f, t]);
  };

  const getPieceLabel = (p: Piece) => {
    const labels: Record<string, string[]> = {
      king: ['帅', '将'], advisor: ['仕', '士'], elephant: ['相', '象'],
      horse: ['马', '馬'], rook: ['车', '車'], cannon: ['炮', '砲'], soldier: ['兵', '卒']
    };
    return p.color === 'red' ? labels[p.type][0] : labels[p.type][1];
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#1a1c18] flex flex-col font-sans overflow-hidden select-none">
      {/* 极简氛围背景 */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(circle_at_center,#4d5e40_0%,transparent_70%)]"></div>

      {/* 顶部状态栏：移除头像，改为仪表盘风格 */}
      <header className="relative z-20 flex justify-between items-center px-8 pt-8 sm:pt-12 shrink-0">
        <div className={`flex flex-col gap-1 transition-all duration-500 ${turn === 'black' ? 'opacity-100 scale-105' : 'opacity-30 scale-95'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Black Force</span>
          </div>
          <span className="text-lg font-black text-white italic">{mode === 'PvE' ? `AI-${difficulty}` : 'Player 2'}</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-white/5 shadow-2xl flex items-center gap-3">
            <Swords size={14} className="text-emerald-500 animate-pulse" />
            <span className="text-white/60 text-[10px] font-black tracking-[0.3em] uppercase">
              {mode === 'Sandbox' ? 'Sandbox Simulation' : 'Active Engagement'}
            </span>
          </div>
        </div>

        <div className={`flex flex-col items-end gap-1 transition-all duration-500 ${turn === 'red' ? 'opacity-100 scale-105' : 'opacity-30 scale-95'}`}>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-right">Red Force</span>
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
          </div>
          <span className="text-lg font-black text-white italic">Commander</span>
        </div>

        {/* 极简悬浮式退出按钮 */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-500 border border-white/10 rounded-full transition-all group"
          title="退出对弈"
        >
          <Power size={18} />
        </button>
      </header>

      {/* 棋盘主体 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <div className="relative w-full max-w-[460px] aspect-[9/10] bg-[#c8d0c2] rounded-sm p-1.5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-[6px] border-[#939c8c]">
           <div className="w-full h-full relative border border-[#6b7562]/30 overflow-hidden">
             <svg className="w-full h-full stroke-[#6b7562]/60 fill-none" viewBox="-0.5 -0.5 9 10">
                {Array.from({ length: 10 }).map((_, i) => (<line key={`h${i}`} x1="0" y1={i} x2="8" y2={i} strokeWidth="0.04" />))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <React.Fragment key={`v${i}`}>
                    <line x1={i} y1="0" x2={i} y2="4" strokeWidth="0.04" />
                    <line x1={i} y1="5" x2={i} y2="9" strokeWidth="0.04" />
                    {(i===0||i===8) && <line x1={i} y1="4" x2={i} y2="5" strokeWidth="0.04" />}
                  </React.Fragment>
                ))}
                <line x1="3" y1="0" x2="5" y2="2" strokeWidth="0.04" /><line x1="5" y1="0" x2="3" y2="2" strokeWidth="0.04" />
                <line x1="3" y1="7" x2="5" y2="9" strokeWidth="0.04" /><line x1="5" y1="7" x2="3" y2="9" strokeWidth="0.04" />
             </svg>

             <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-around text-[#6b7562]/15 font-black text-5xl sm:text-7xl italic tracking-widest pointer-events-none uppercase">
                <span>楚河</span><span>汉界</span>
             </div>

             <div className="absolute inset-0 grid grid-cols-9 grid-rows-10">
                {Array.from({ length: 90 }).map((_, i) => {
                  const piece = board[i];
                  const isSelected = selected === i;
                  const isPossible = selected !== null && (mode === 'Sandbox' || isLegalMove(board, selected, i));
                  const isLast = lastMove?.includes(i);
                  const isHint = hint?.includes(i);
                  
                  return (
                    <div key={i} onClick={() => handleCellClick(i)} className="relative flex items-center justify-center cursor-pointer">
                      {isPossible && !piece && <div className="w-2 h-2 rounded-full bg-black/10 animate-pulse" />}
                      {isHint && <div className="absolute inset-1.5 border-[3px] border-emerald-500 rounded-full animate-ping z-10" />}
                      
                      {piece && (
                        <div className={`
                          w-[90%] h-[90%] rounded-full flex items-center justify-center transition-all duration-300 transform
                          shadow-[0_5px_0_#7a6549,0_8px_15px_rgba(0,0,0,0.5)]
                          ${piece.color === 'red' ? 'bg-gradient-to-b from-[#e6d3ba] to-[#c7ae8f] text-[#991b1b]' : 'bg-gradient-to-b from-[#e6d3ba] to-[#c7ae8f] text-[#1a1c18]'} 
                          ${isSelected ? '-translate-y-3 scale-110 ring-[3px] ring-yellow-400 z-40' : 'z-20'} 
                          ${isLast ? 'ring-2 ring-emerald-500/40' : ''}
                        `}>
                           <div className="w-[82%] h-[82%] rounded-full border border-black/5 flex items-center justify-center shadow-inner">
                             <span className="text-xl sm:text-3xl font-black italic">{getPieceLabel(piece)}</span>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>

             {/* 结算层 */}
             {gameOver && (
               <div className="absolute inset-0 bg-[#0f110e]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                  <Trophy className="text-yellow-500 w-16 h-16 mb-6 animate-bounce" />
                  <h2 className="text-3xl font-black text-white italic mb-2 uppercase">Battle Terminated</h2>
                  <p className="text-emerald-500 font-bold tracking-[0.4em] mb-12 text-xs">
                    {gameOver === 'red' ? '汉方大捷 · 战局封存' : '楚方奏凯 · 战局结束'}
                  </p>
                  <button 
                    onClick={resetGame} 
                    className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl active:scale-95 transition-all text-xs uppercase tracking-widest"
                  >
                    Re-Initialize Engine
                  </button>
               </div>
             )}
           </div>
        </div>
      </main>

      {/* 底部控制区 */}
      <footer className="relative z-20 flex flex-col items-center pb-12 shrink-0">
        <div className="flex items-center gap-6 px-8 mb-10">
           <ActionButton icon={<Layout size={18}/>} label="沙盘" active={mode === 'Sandbox'} onClick={() => setMode(mode === 'Sandbox' ? 'PvE' : 'Sandbox')} />
           <ActionButton icon={<Undo2 size={18}/>} label="悔棋" onClick={undoMove} />
           <ActionButton icon={<Lightbulb size={18}/>} label="支招" onClick={getHint} />
           <ActionButton icon={<RotateCcw size={18}/>} label="重来" onClick={resetGame} />
           <ActionButton icon={<Settings2 size={18}/>} label="对阵" onClick={() => setShowSettings(true)} />
        </div>

        <div className="px-6 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/5 flex items-center gap-3">
           <div className={`w-1.5 h-1.5 rounded-full ${isAiThinking ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
           <span className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">
             {isAiThinking ? 'System Computing Path...' : `${mode} Mode Active / ${difficulty} Protocol`}
           </span>
        </div>
      </footer>

      {/* 配置面板 */}
      {showSettings && (
        <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-[#1a1c18] border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Swords size={120}/></div>
             <h3 className="text-xl font-black text-white italic mb-8 flex items-center gap-3">
                <Settings2 size={20} className="text-emerald-500" /> 对弈参数配置
             </h3>
             
             <div className="space-y-8 relative z-10">
                <section>
                   <p className="text-[10px] text-white/40 font-black uppercase mb-4 tracking-widest">交战协议</p>
                   <div className="grid grid-cols-2 gap-3">
                      <ModeSwitch label="人机模式" active={mode === 'PvE'} icon={<Bot size={16}/>} onClick={() => setMode('PvE')} />
                      <ModeSwitch label="双人模式" active={mode === 'PvP'} icon={<Users size={16}/>} onClick={() => setMode('PvP')} />
                   </div>
                </section>

                {mode === 'PvE' && (
                  <section className="animate-in slide-in-from-top-4 duration-500">
                    <p className="text-[10px] text-white/40 font-black uppercase mb-4 tracking-widest">AI 运算深度</p>
                    <div className="grid grid-cols-3 gap-2">
                       {(['Novice', 'Expert', 'Master'] as Difficulty[]).map(d => (
                         <button 
                           key={d} 
                           onClick={() => { setDifficulty(d); resetGame(); }}
                           className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === d ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 text-white/60 hover:text-white'}`}
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                  </section>
                )}
             </div>

             <button 
              onClick={() => setShowSettings(false)} 
              className="w-full mt-10 py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl"
             >
                确认部署
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 group outline-none">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-lg ${active ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${active ? 'text-emerald-500' : 'text-white/20 group-hover:text-white/40'}`}>{label}</span>
  </button>
);

const ModeSwitch = ({ label, active, icon, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs transition-all border ${active ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 border-white/5 text-white/40'}`}>
    {icon} {label}
  </button>
);

export default ChineseChessApp;
