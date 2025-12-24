
import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, Undo2, Swords, Zap, Info, Lightbulb, History, Target, Trophy } from 'lucide-react';
import { INITIAL_BOARD, ChessBoard, isLegalMove, isFacingKing, ChessColor, Piece, getMoveNotation } from '../lib/chessRules';
import { getBestMove } from '../lib/chessAI';

const ChineseChessApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [board, setBoard] = useState<ChessBoard>(INITIAL_BOARD);
  const [turn, setTurn] = useState<ChessColor>('red');
  const [selected, setSelected] = useState<number | null>(null);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'PvP' | 'PvE'>('PvE');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [historyStates, setHistoryStates] = useState<{ board: ChessBoard, turn: ChessColor }[]>([]);
  const [gameOver, setGameOver] = useState<ChessColor | 'draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hint, setHint] = useState<[number, number] | null>(null);
  const [capturePos, setCapturePos] = useState<number | null>(null);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  const handleMove = useCallback((from: number, to: number) => {
    const piece = board[from];
    if (!piece) return;

    const notation = getMoveNotation(board, from, to);
    const newBoard = [...board];
    const isCapture = !!newBoard[to];
    
    if (isCapture) {
      setCapturePos(to);
      setTimeout(() => setCapturePos(null), 500);
    }

    newBoard[to] = newBoard[from];
    newBoard[from] = null;

    if (isFacingKing(newBoard)) {
      alert("老将照面！移动无效");
      return;
    }

    setHistoryStates(prev => [...prev, { board, turn }]);
    setMoveHistory(prev => [...prev, notation]);
    setBoard(newBoard);
    const nextTurn = turn === 'red' ? 'black' : 'red';
    setTurn(nextTurn);
    setLastMove([from, to]);
    setSelected(null);
    setHint(null);
    if (isCapture) triggerHaptic();

    const hasRedKing = newBoard.some(p => p?.type === 'king' && p.color === 'red');
    const hasBlackKing = newBoard.some(p => p?.type === 'king' && p.color === 'black');
    if (!hasRedKing) setGameOver('black');
    if (!hasBlackKing) setGameOver('red');
  }, [board, turn]);

  useEffect(() => {
    if (mode === 'PvE' && turn === 'black' && !gameOver) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const [from, to] = getBestMove(board, 'black', 3);
        if (from !== -1) handleMove(from, to);
        setIsAiThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turn, mode, board, gameOver, handleMove]);

  const requestHint = () => {
    const [from, to] = getBestMove(board, turn, 3);
    if (from !== -1) setHint([from, to]);
  };

  const handleCellClick = (idx: number) => {
    if (gameOver || isAiThinking) return;
    if (selected === null) {
      if (board[idx]?.color === turn) setSelected(idx);
    } else {
      if (board[idx]?.color === turn) {
        setSelected(idx);
      } else if (isLegalMove(board, selected, idx)) {
        handleMove(selected, idx);
      } else {
        setSelected(null);
      }
    }
  };

  const undo = () => {
    if (historyStates.length === 0 || isAiThinking) return;
    const last = historyStates[historyStates.length - 1];
    setBoard(last.board);
    setTurn(last.turn);
    setHistoryStates(prev => prev.slice(0, -1));
    setMoveHistory(prev => prev.slice(0, -1));
    setLastMove(null);
    setGameOver(null);
    setHint(null);
  };

  const reset = () => {
    setBoard(INITIAL_BOARD);
    setTurn('red');
    setSelected(null);
    setLastMove(null);
    setMoveHistory([]);
    setHistoryStates([]);
    setGameOver(null);
    setHint(null);
  };

  const getPieceLabel = (p: Piece) => {
    const labels: Record<string, string[]> = {
      king: ['帅', '将'], advisor: ['仕', '士'], elephant: ['相', '象'],
      horse: ['马', '马'], rook: ['车', '车'], cannon: ['炮', '炮'], soldier: ['兵', '卒']
    };
    return p.color === 'red' ? labels[p.type][0] : labels[p.type][1];
  };

  const renderStarMarker = (x: number, y: number) => {
    const gap = 0.08;
    const len = 0.2;
    return (
      <g key={`star-${x}-${y}`} className="stroke-amber-950/60 stroke-[1.5] fill-none">
        {x > 0 && (
          <><path d={`M ${x-gap} ${y-gap-len} L ${x-gap} ${y-gap} L ${x-gap-len} ${y-gap}`} /><path d={`M ${x-gap} ${y+gap+len} L ${x-gap} ${y+gap} L ${x-gap-len} ${y+gap}`} /></>
        )}
        {x < 8 && (
          <><path d={`M ${x+gap} ${y-gap-len} L ${x+gap} ${y-gap} L ${x+gap-len} ${y-gap}`} /><path d={`M ${x+gap} ${y+gap+len} L ${x+gap} ${y+gap} L ${x+gap-len} ${y+gap}`} /></>
        )}
      </g>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans overflow-hidden">
      {/* 顶部导航 - 移动端优化 */}
      <header className="h-14 md:h-16 bg-slate-900/95 border-b border-amber-500/20 flex items-center justify-between px-4 md:px-6 z-30 shrink-0">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Swords className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="truncate">
             <h1 className="text-sm md:text-xl font-black tech-font text-white italic tracking-tighter truncate uppercase">Chess_Pro</h1>
             <p className="text-[7px] md:text-[9px] text-amber-500 font-bold uppercase tracking-[0.2em] truncate">{isAiThinking ? 'AI 思考中...' : '系统就绪'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <div className="flex bg-slate-800 p-0.5 md:p-1 rounded-lg border border-slate-700">
              <button onClick={() => { setMode('PvP'); reset(); }} className={`px-2 md:px-4 py-1 rounded-md text-[9px] md:text-[10px] font-black transition-all ${mode === 'PvP' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>PVP</button>
              <button onClick={() => { setMode('PvE'); reset(); }} className={`px-2 md:px-4 py-1 rounded-md text-[9px] md:text-[10px] font-black transition-all ${mode === 'PvE' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>PVE</button>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-800 border border-slate-700 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-500 transition-all shrink-0"><X size={18}/></button>
        </div>
      </header>

      {/* 主体布局 - 适配移动端滚动 */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-start lg:justify-center p-2 md:p-6 lg:p-10 gap-4 lg:gap-10 overflow-y-auto no-scrollbar pb-safe">
        
        {/* PC 端信息面板 - 移动端隐藏 */}
        <aside className="hidden xl:flex w-72 flex-col gap-4">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={16} /> 记谱</h3>
              <div className="h-64 overflow-y-auto pr-2 no-scrollbar space-y-2">
                 {moveHistory.map((m, i) => (
                   <div key={i} className={`p-2 rounded-lg text-xs font-bold border ${i % 2 === 0 ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-slate-100/5 border-white/10 text-slate-300'}`}>
                     <span className="opacity-40 mr-2">{(i/2 + 1).toFixed(0)}</span> {m}
                   </div>
                 )).reverse()}
              </div>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={16} /> 引擎</h3>
              <div className="space-y-3 text-[10px] font-mono"><div className="flex justify-between"><span className="text-slate-500 uppercase">深度</span><span className="text-white">03_PRUNING</span></div></div>
           </div>
        </aside>

        {/* 棋盘主区 - 移动端响应式缩放 */}
        <div className="relative group w-full max-w-[360px] sm:max-w-[500px] flex flex-col items-center">
          {/* 顶部坐标 (移动端可选隐藏) */}
          <div className="w-full flex justify-between px-8 text-[9px] md:text-[11px] font-black text-slate-600 font-mono italic mb-1">
             <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
          </div>

          <div className="w-full aspect-[9/10] bg-[#e3a857] rounded-lg shadow-2xl border-[4px] md:border-[8px] border-amber-900/50 relative p-2 md:p-5 overflow-hidden">
             <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
             <svg className="w-full h-full stroke-amber-950/80 fill-none" viewBox="-0.5 -0.5 9 10">
                {Array.from({ length: 10 }).map((_, i) => (<line key={`h${i}`} x1="0" y1={i} x2="8" y2={i} strokeWidth={i === 0 || i === 9 ? "0.05" : "0.03"} />))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <React.Fragment key={`v${i}`}>
                    <line x1={i} y1="0" x2={i} y2="4" strokeWidth={i === 0 || i === 8 ? "0.05" : "0.03"} />
                    <line x1={i} y1="5" x2={i} y2="9" strokeWidth={i === 0 || i === 8 ? "0.05" : "0.03"} />
                    {(i === 0 || i === 8) && <line x1={i} y1="4" x2={i} y2="5" strokeWidth="0.05" />}
                  </React.Fragment>
                ))}
                <line x1="3" y1="0" x2="5" y2="2" strokeWidth="0.03" /><line x1="5" y1="0" x2="3" y2="2" strokeWidth="0.03" />
                <line x1="3" y1="7" x2="5" y2="9" strokeWidth="0.03" /><line x1="5" y1="7" x2="3" y2="9" strokeWidth="0.03" />
                {[[1, 2], [7, 2], [1, 7], [7, 7], [0, 3], [2, 3], [4, 3], [6, 3], [8, 3], [0, 6], [2, 6], [4, 6], [6, 6], [8, 6]].map(([x, y]) => renderStarMarker(x, y))}
             </svg>

             <div className="absolute top-[45%] left-0 w-full flex justify-around text-amber-950/30 font-black text-xl sm:text-4xl italic tracking-[1em] pointer-events-none select-none">
                <span>楚河</span><span>汉界</span>
             </div>

             <div className="absolute inset-2 md:inset-5 grid grid-cols-9 grid-rows-10">
                {Array.from({ length: 90 }).map((_, i) => {
                  const piece = board[i];
                  const isSelected = selected === i;
                  const isHint = hint?.includes(i);
                  const isPossible = selected !== null && isLegalMove(board, selected, i);
                  const isLast = lastMove?.includes(i);
                  const isCapturing = capturePos === i;
                  return (
                    <div key={i} onClick={() => handleCellClick(i)} className="relative cursor-pointer flex items-center justify-center group">
                      {isLast && <div className="absolute inset-1 bg-amber-900/10 rounded-full" />}
                      {isPossible && <div className="w-1.5 md:w-2.5 h-1.5 md:h-2.5 rounded-full bg-white/40 z-10" />}
                      {isHint && <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping z-0" />}
                      {piece && (
                        <div className={`w-[90%] h-[90%] rounded-full flex items-center justify-center text-lg sm:text-3xl font-black select-none transition-all transform ${piece.color === 'red' ? 'bg-[#fff5f5] text-red-700 border-[2px] md:border-[3px] border-red-800' : 'bg-[#262626] text-slate-100 border-[2px] md:border-[3px] border-black'} ${isSelected ? '-translate-y-2 md:-translate-y-4 scale-110 shadow-2xl border-amber-400 ring-2 md:ring-4 ring-amber-400/20' : 'shadow-md'} ${isCapturing ? 'animate-bounce scale-125' : ''} z-20`}>
                          <div className={`w-[85%] h-[85%] rounded-full border border-current flex items-center justify-center`}>{getPieceLabel(piece)}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>

             {gameOver && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in rounded-lg p-6">
                  <Trophy className="text-amber-500 w-16 h-16 md:w-24 md:h-24 mb-4 animate-bounce" />
                  <h2 className="text-2xl md:text-5xl font-black text-white italic tech-font mb-2">Game_Over</h2>
                  <p className="text-amber-500 font-bold uppercase tracking-[0.2em] mb-8 text-sm">{gameOver === 'red' ? '红方 凯旋而归' : '黑方 智取江山'}</p>
                  <button onClick={reset} className="w-full max-w-xs py-4 bg-amber-600 text-white font-black rounded-xl hover:bg-amber-500 shadow-xl">重整旗鼓</button>
               </div>
             )}
          </div>

          <div className="w-full flex justify-between px-8 text-[9px] md:text-[11px] font-black text-slate-600 font-mono italic mt-1">
             <span>九</span><span>八</span><span>七</span><span>六</span><span>五</span><span>四</span><span>三</span><span>二</span><span>一</span>
          </div>
        </div>

        {/* 底部操作区 - 移动端精简 */}
        <aside className="w-full max-w-[360px] sm:max-w-none lg:w-72 flex flex-col gap-3 md:gap-5">
           <div className="bg-slate-900/80 border border-slate-800 p-4 md:p-8 rounded-2xl md:rounded-[2.5rem] shadow-xl">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 md:mb-6 flex items-center gap-2"><Zap size={14} /> 局势</h3>
              <div className="flex flex-row lg:flex-col gap-2">
                 <div className={`flex-1 p-3 rounded-xl flex items-center justify-between border-2 transition-all ${turn === 'red' ? 'bg-red-500/10 border-red-500' : 'bg-slate-800/50 border-transparent opacity-40'}`}>
                    <span className="text-[9px] font-black text-red-400">红方回合</span>
                    {turn === 'red' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                 </div>
                 <div className={`flex-1 p-3 rounded-xl flex items-center justify-between border-2 transition-all ${turn === 'black' ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/50 border-transparent opacity-40'}`}>
                    <span className="text-[9px] font-black text-blue-400">黑方回合</span>
                    {turn === 'black' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2">
              <button onClick={undo} className="py-3 md:py-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 rounded-xl transition-all flex flex-col items-center gap-1 group">
                 <Undo2 size={16} /><span className="text-[9px] font-black uppercase tracking-widest">悔棋</span>
              </button>
              <button onClick={reset} className="py-3 md:py-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all flex flex-col items-center gap-1 group">
                 <RotateCcw size={16} /><span className="text-[9px] font-black uppercase tracking-widest">重置</span>
              </button>
              <button onClick={requestHint} disabled={isAiThinking || !!gameOver} className="col-span-2 py-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-30">
                 <Lightbulb size={18} />
                 <span className="text-[10px] font-black uppercase tracking-widest">寻求 AI 锦囊</span>
              </button>
           </div>
        </aside>
      </main>

      <footer className="h-8 md:h-10 bg-slate-950 border-t border-slate-900 px-4 md:px-8 flex items-center justify-between z-20 text-[7px] md:text-[9px] font-mono text-slate-700 shrink-0 italic">
        <span>BOARD_V1.1_MOBILE_READY</span>
        <span className="uppercase tracking-widest">AUTHENTIC LAYOUT</span>
      </footer>
    </div>
  );
};

export default ChineseChessApp;
