
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, RotateCcw, Undo2, Trophy, Swords, Zap, Info, Lightbulb, History, Target, Eye, EyeOff } from 'lucide-react';
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

  // 记录吃子动效的目标位置
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

  // AI 逻辑
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

  // 渲染星位十字标记
  const renderStarMarker = (x: number, y: number) => {
    const gap = 0.08;
    const len = 0.2;
    return (
      <g key={`star-${x}-${y}`} className="stroke-amber-950/60 stroke-[1.5] fill-none">
        {x > 0 && (
          <>
            <path d={`M ${x-gap} ${y-gap-len} L ${x-gap} ${y-gap} L ${x-gap-len} ${y-gap}`} />
            <path d={`M ${x-gap} ${y+gap+len} L ${x-gap} ${y+gap} L ${x-gap-len} ${y+gap}`} />
          </>
        )}
        {x < 8 && (
          <>
            <path d={`M ${x+gap} ${y-gap-len} L ${x+gap} ${y-gap} L ${x+gap-len} ${y-gap}`} />
            <path d={`M ${x+gap} ${y+gap+len} L ${x+gap} ${y+gap} L ${x+gap-len} ${y+gap}`} />
          </>
        )}
      </g>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans overflow-hidden">
      <header className="h-16 bg-slate-900/95 border-b border-amber-500/30 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg">
            <Swords className="text-white w-6 h-6" />
          </div>
          <div>
             <h1 className="text-xl font-black tech-font text-white italic tracking-tighter">CHESS_PRO_V2.2</h1>
             <p className="text-[9px] text-amber-500 font-bold uppercase tracking-[0.3em]">{isAiThinking ? 'AI 正在深度博弈...' : '系统已就绪'}</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button onClick={() => { setMode('PvP'); reset(); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'PvP' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>本地对弈</button>
              <button onClick={() => { setMode('PvE'); reset(); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'PvE' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>挑战引擎</button>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-800 border border-slate-700 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-500 transition-all"><X size={20}/></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 lg:p-10 gap-10 relative overflow-hidden">
        
        {/* 左侧：信息面板 */}
        <aside className="hidden xl:flex w-72 flex-col gap-4">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2"><History size={16} /> 实时记谱</h3>
              <div className="h-64 overflow-y-auto pr-2 no-scrollbar space-y-2">
                 {moveHistory.map((m, i) => (
                   <div key={i} className={`p-2 rounded-lg text-xs font-bold border ${i % 2 === 0 ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-slate-100/5 border-white/10 text-slate-300'}`}>
                     <span className="opacity-40 mr-2">{(i/2 + 1).toFixed(0)}</span> {m}
                   </div>
                 )).reverse()}
              </div>
           </div>
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
              <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={16} /> 引擎数据</h3>
              <div className="space-y-3">
                 <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500 uppercase">深度</span><span className="text-white">03_PRUNING</span></div>
                 <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500 uppercase">胜率评估</span><span className="text-emerald-400">稳定_NORMAL</span></div>
              </div>
           </div>
        </aside>

        {/* 中央：棋盘主区 */}
        <div className="relative group">
          {/* 坐标刻度 */}
          <div className="absolute -top-10 left-0 right-0 flex justify-between px-10 text-[11px] font-black text-slate-600 font-mono italic">
             <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span>
          </div>
          <div className="absolute -bottom-10 left-0 right-0 flex justify-between px-10 text-[11px] font-black text-slate-600 font-mono italic">
             <span>九</span><span>八</span><span>七</span><span>六</span><span>五</span><span>四</span><span>三</span><span>二</span><span>一</span>
          </div>

          {/* 棋盘主体 */}
          <div className="w-[360px] h-[400px] sm:w-[500px] sm:h-[550px] bg-[#e3a857] rounded-xl shadow-[0_0_80px_rgba(227,168,87,0.2)] border-[8px] border-amber-900/50 relative p-5 overflow-hidden">
             {/* 材质贴图 */}
             <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
             
             {/* 棋盘线 SVG - 核心改进点 */}
             <svg className="w-full h-full stroke-amber-950/80 fill-none" viewBox="-0.5 -0.5 9 10">
                {/* 1. 绘制 10 条横线 */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i} x2="8" y2={i} strokeWidth={i === 0 || i === 9 ? "0.05" : "0.03"} />
                ))}
                
                {/* 2. 绘制 9 条纵线（注意楚河汉界断开） */}
                {Array.from({ length: 9 }).map((_, i) => (
                  <React.Fragment key={`v${i}`}>
                    {/* 上半部 */}
                    <line x1={i} y1="0" x2={i} y2="4" strokeWidth={i === 0 || i === 8 ? "0.05" : "0.03"} />
                    {/* 下半部 */}
                    <line x1={i} y1="5" x2={i} y2="9" strokeWidth={i === 0 || i === 8 ? "0.05" : "0.03"} />
                    {/* 左右边线在中间是连通的 */}
                    {(i === 0 || i === 8) && <line x1={i} y1="4" x2={i} y2="5" strokeWidth="0.05" />}
                  </React.Fragment>
                ))}

                {/* 3. 九宫格斜交叉线 */}
                <line x1="3" y1="0" x2="5" y2="2" strokeWidth="0.03" />
                <line x1="5" y1="0" x2="3" y2="2" strokeWidth="0.03" />
                <line x1="3" y1="7" x2="5" y2="9" strokeWidth="0.03" />
                <line x1="5" y1="7" x2="3" y2="9" strokeWidth="0.03" />

                {/* 4. 星位标记 (炮位与兵卒位) */}
                {[
                  [1, 2], [7, 2], [1, 7], [7, 7], // 炮位
                  [0, 3], [2, 3], [4, 3], [6, 3], [8, 3], // 红兵位
                  [0, 6], [2, 6], [4, 6], [6, 6], [8, 6], // 黑卒位
                ].map(([x, y]) => renderStarMarker(x, y))}
             </svg>

             {/* 楚河汉界文字 */}
             <div className="absolute top-[45%] left-0 w-full flex justify-around text-amber-950/40 font-black text-2xl sm:text-4xl italic tracking-[1.5em] pointer-events-none select-none">
                <span>楚河</span><span>汉界</span>
             </div>

             {/* 交互落子层 */}
             <div className="absolute inset-5 grid grid-cols-9 grid-rows-10">
                {Array.from({ length: 90 }).map((_, i) => {
                  const piece = board[i];
                  const isSelected = selected === i;
                  const isHint = hint?.includes(i);
                  const isPossible = selected !== null && isLegalMove(board, selected, i);
                  const isLast = lastMove?.includes(i);
                  const isCapturing = capturePos === i;

                  return (
                    <div 
                      key={i} 
                      onClick={() => handleCellClick(i)}
                      className="relative cursor-pointer flex items-center justify-center group"
                    >
                      {/* 上一步轨迹 */}
                      {isLast && <div className="absolute inset-2 bg-amber-900/10 rounded-full animate-pulse" />}
                      
                      {/* 可移动提示点 */}
                      {isPossible && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white/40 ring-4 ring-white/10 z-10" />
                      )}

                      {/* AI 提示闪烁 */}
                      {isHint && (
                        <div className="absolute inset-0 border-2 border-emerald-400 rounded-full animate-ping z-0" />
                      )}

                      {/* 棋子主体渲染 */}
                      {piece && (
                        <div 
                          className={`
                            w-[88%] h-[88%] rounded-full flex items-center justify-center text-xl sm:text-3xl font-black select-none transition-all duration-300 transform
                            ${piece.color === 'red' ? 'bg-[#fff5f5] text-red-700 border-[3px] border-red-800' : 'bg-[#262626] text-slate-100 border-[3px] border-black'}
                            ${isSelected ? '-translate-y-4 scale-110 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border-amber-400 ring-4 ring-amber-400/20' : 'shadow-[0_6px_0_rgba(0,0,0,0.4)]'}
                            ${isCapturing ? 'animate-bounce scale-125' : ''}
                            hover:brightness-110 z-20
                          `}
                        >
                          <div className={`w-[85%] h-[85%] rounded-full border border-current flex items-center justify-center`}>
                            {getPieceLabel(piece)}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>

             {/* 胜负结算层 */}
             {gameOver && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500 rounded-lg">
                  <Trophy className="text-amber-500 w-24 h-24 mb-6 animate-bounce" />
                  <h2 className="text-5xl font-black text-white italic tracking-tighter mb-2">END_OF_BATTLE</h2>
                  <p className="text-amber-500 font-bold uppercase tracking-[0.4em] mb-12">{gameOver === 'red' ? '红方 凯旋而归' : '黑方 智取江山'}</p>
                  <button onClick={reset} className="px-12 py-5 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 transition-all shadow-xl active:scale-95">重整旗鼓</button>
               </div>
             )}
          </div>
        </div>

        {/* 右侧：操作区 */}
        <aside className="w-full lg:w-72 flex flex-col gap-5">
           <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
              <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Zap size={16} /> 局势掌控</h3>
              <div className="space-y-4">
                 <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${turn === 'red' ? 'bg-red-500/10 border-red-500' : 'bg-slate-800/50 border-transparent opacity-40'}`}>
                    <span className="text-[10px] font-black text-red-400">红方当前回合</span>
                    {turn === 'red' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                 </div>
                 <div className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all ${turn === 'black' ? 'bg-blue-500/10 border-blue-500' : 'bg-slate-800/50 border-transparent opacity-40'}`}>
                    <span className="text-[10px] font-black text-blue-400">黑方当前回合</span>
                    {turn === 'black' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <button onClick={undo} className="py-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 rounded-2xl transition-all flex flex-col items-center gap-2 group">
                 <Undo2 size={20} className="group-hover:-translate-x-1" />
                 <span className="text-[10px] font-black">悔棋</span>
              </button>
              <button onClick={reset} className="py-5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-500 rounded-2xl transition-all flex flex-col items-center gap-2 group">
                 <RotateCcw size={20} className="group-hover:rotate-90" />
                 <span className="text-[10px] font-black">重置</span>
              </button>
              <button onClick={requestHint} disabled={isAiThinking || !!gameOver} className="col-span-2 py-5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-30">
                 <Lightbulb size={20} />
                 <span className="text-[11px] font-black uppercase tracking-widest">寻求 AI 锦囊</span>
              </button>
           </div>

           <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] mt-auto">
              <div className="flex items-center gap-2 mb-2">
                 <Info size={14} className="text-blue-400" />
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">规则备忘</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                纵线在河界处断开，唯有左右两条边线贯通全局。九宫格仅限将帅与士穿行，不得出圈。
              </p>
           </div>
        </aside>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-900 px-8 flex items-center justify-between z-20 text-[9px] font-mono text-slate-700 italic">
        <span>BOARD_RENDER_ENGINE: VECTOR_PRECISION_V1</span>
        <span className="uppercase tracking-[0.2em]">Authentic Chinese Chess Layout Active</span>
      </footer>
    </div>
  );
};

export default ChineseChessApp;
