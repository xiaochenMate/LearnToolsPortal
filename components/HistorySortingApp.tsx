
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, RotateCcw, CheckCircle, Clock, 
  History as HistoryIcon, Award, ScrollText,
  ChevronRight, Sparkles, Trophy, BookOpen, Layers,
  Compass, Feather, ShieldCheck, ArrowRight
} from 'lucide-react';
import { GRAND_CHRONICLES, HistoryEvent } from '../lib/historyData';

const HistorySortingApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentEra, setCurrentEra] = useState<'Ancient' | 'Imperial' | 'Modern'>('Ancient');
  const [pool, setPool] = useState<HistoryEvent[]>([]);
  const [sorted, setSorted] = useState<(HistoryEvent | null)[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDetail, setShowDetail] = useState<HistoryEvent | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const eraEvents = useMemo(() => 
    GRAND_CHRONICLES.filter(e => e.period === currentEra), 
  [currentEra]);

  const initEra = useCallback(() => {
    const events = GRAND_CHRONICLES.filter(e => e.period === currentEra);
    const shuffled = [...events].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setSorted(new Array(events.length).fill(null));
    setIsSuccess(false);
    setShowDetail(null);
  }, [currentEra]);

  useEffect(() => {
    initEra();
  }, [initEra]);

  const handleDragStart = (e: React.DragEvent, event: HistoryEvent, source: 'pool' | number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ event, source }));
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { event, source } = data;

    const newSorted = [...sorted];
    const newPool = [...pool];
    const existingInTarget = newSorted[targetIdx];

    if (source === 'pool') {
      newSorted[targetIdx] = event;
      setPool(newPool.filter(e => e.id !== event.id).concat(existingInTarget ? [existingInTarget] : []));
    } else {
      newSorted[source as number] = existingInTarget;
      newSorted[targetIdx] = event;
    }
    setSorted(newSorted);
  };

  // 移动端点击交互 fallback
  const handleItemClick = (event: HistoryEvent, source: 'pool' | number) => {
    if (isSuccess) return;
    
    if (source === 'pool') {
      // 找到第一个空位放入
      const firstEmptyIdx = sorted.findIndex(s => s === null);
      if (firstEmptyIdx !== -1) {
        const newSorted = [...sorted];
        newSorted[firstEmptyIdx] = event;
        setSorted(newSorted);
        setPool(pool.filter(e => e.id !== event.id));
      }
    } else {
      // 点击已排序的项，放回池子
      const newSorted = [...sorted];
      newSorted[source as number] = null;
      setSorted(newSorted);
      setPool([...pool, event]);
    }
  };

  const verifyOrder = () => {
    if (sorted.some(s => s === null)) return;
    
    const correctOrder = [...eraEvents].sort((a, b) => a.year - b.year);
    const isAllCorrect = sorted.every((s, i) => s?.id === correctOrder[i].id);

    if (isAllCorrect) {
      setIsSuccess(true);
      setScore(s => s + 100);
    } else {
      setAttempts(a => a + 1);
      const el = document.getElementById('sorting-gate');
      el?.classList.add('animate-shake');
      setTimeout(() => el?.classList.remove('animate-shake'), 400);
    }
  };

  const formatYear = (y: number) => {
    if (y < 0) return `前${Math.abs(y)}年`;
    return `${y}年`;
  };

  const rankTitle = useMemo(() => {
    if (score < 100) return '见习史官';
    if (score < 200) return '翰林学士';
    return '太史公';
  }, [score]);

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* 背景纹理层 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#cbd5e1_0%,transparent_70%)] animate-pulse"></div>
      </div>

      {/* 顶部 HUD - 移动端高度优化 */}
      <header className="h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-cyan-900 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-900/20 rotate-3 shrink-0">
            <Compass className="w-5 h-5 md:w-6 md:h-6 animate-spin-slow" />
          </div>
          <div className="truncate">
            <h1 className="text-base md:text-xl font-black tracking-tight text-cyan-950 flex items-center gap-2 truncate">
              华夏时空轴 <span className="hidden sm:inline text-[9px] md:text-[10px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-bold">史官模式</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">SYNC / {currentEra.toUpperCase()}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">RANK_STATUS</span>
            <span className="text-sm md:text-xl font-black text-cyan-800 italic leading-none">{rankTitle}</span>
          </div>
          <button onClick={onClose} className="p-2 md:p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-all text-slate-500">
            <X size={18}/>
          </button>
        </div>
      </header>

      {/* 断代切换器 - 横向滑动适配 */}
      <nav className="h-12 md:h-14 bg-white/50 border-b border-slate-200 flex justify-start sm:justify-center items-center gap-2 md:gap-4 px-4 overflow-x-auto no-scrollbar z-10 shrink-0 touch-pan-x">
        {[
          { id: 'Ancient', label: '上古先秦', icon: <Feather size={14}/> },
          { id: 'Imperial', label: '帝制鼎盛', icon: <ShieldCheck size={14}/> },
          { id: 'Modern', label: '近代风云', icon: <HistoryIcon size={14}/> }
        ].map(era => (
          <button 
            key={era.id}
            onClick={() => { if(!isSuccess) setCurrentEra(era.id as any); }}
            className={`px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap ${currentEra === era.id ? 'bg-cyan-900 text-white shadow-md' : 'text-slate-400 hover:text-cyan-800'}`}
          >
            {era.icon} {era.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 flex flex-col lg:flex-row p-3 md:p-6 gap-4 md:gap-8 overflow-hidden z-10">
        {/* 左侧/上方：时间线重构区 */}
        <section id="sorting-gate" className="flex-[1.2] flex flex-col bg-white/60 backdrop-blur-sm rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl p-4 md:p-8 overflow-y-auto no-scrollbar transition-all duration-300">
          <div className="flex items-center justify-between mb-4 md:mb-8 shrink-0">
             <div className="flex items-center gap-2 md:gap-3">
               <Layers className="text-cyan-800 w-4 h-4 md:w-5 md:h-5" />
               <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-slate-400">时间线重构区</h2>
             </div>
             <div className="text-[9px] md:text-[10px] font-bold text-cyan-600 flex items-center gap-2">
                <Clock size={10}/> {attempts > 0 ? `修复中 (${attempts})` : '时空稳定'}
             </div>
          </div>

          <div className="space-y-2 md:space-y-3 flex-1 min-h-0">
            {sorted.map((item, idx) => (
              <div 
                key={idx}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, idx)}
                onClick={() => item && handleItemClick(item, idx)}
                className={`
                  group relative h-14 md:h-16 rounded-xl md:rounded-[1.2rem] border-2 border-dashed transition-all flex items-center px-4 md:px-6 gap-3 md:gap-6 cursor-default
                  ${item ? 'bg-cyan-900 border-cyan-950 text-white shadow-xl translate-x-1' : 'bg-slate-50/50 border-slate-200 hover:border-cyan-300'}
                `}
              >
                <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[9px] md:text-xs shrink-0 ${item ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {idx + 1}
                </div>

                {item ? (
                  <>
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <div className="flex flex-col truncate">
                        <span className="font-black text-sm md:text-lg truncate">{item.name}</span>
                        <span className="text-[8px] md:text-[10px] opacity-60 font-mono tracking-widest uppercase">{formatYear(item.year)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:gap-3 shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowDetail(item); }} 
                        className="p-1.5 md:p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <BookOpen size={14} className="md:w-4 md:h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-[10px] md:text-xs text-slate-300 font-bold italic tracking-wider">等待拖入史实...</span>
                )}
              </div>
            ))}
          </div>
          
          <button 
            onClick={verifyOrder}
            disabled={sorted.some(s => s === null)}
            className="mt-4 md:mt-8 w-full py-4 md:py-5 bg-cyan-900 text-white font-black text-base md:text-xl rounded-2xl md:rounded-3xl flex items-center justify-center gap-3 md:gap-4 shadow-2xl disabled:opacity-30 transition-all active:scale-95 shrink-0"
          >
            <CheckCircle size={20} className="md:w-6 md:h-6" /> 封存断代
          </button>
        </section>

        {/* 右侧/下方：史料残卷池 */}
        <aside className="flex-1 lg:w-[400px] flex flex-col gap-3 md:gap-6 overflow-hidden">
           <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 border border-slate-200 shadow-xl flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center justify-between mb-3 md:mb-6 shrink-0">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ScrollText size={14} className="md:w-4 md:h-4" /> 待考史料 ({pool.length})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 md:space-y-4 pr-1 pb-2 touch-pan-y">
                {pool.map((event) => (
                  <div 
                    key={event.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, event, 'pool')}
                    onClick={() => handleItemClick(event, 'pool')}
                    className="bg-slate-50 hover:bg-white border border-slate-100 hover:border-cyan-800 p-4 md:p-5 rounded-2xl md:rounded-3xl cursor-grab active:cursor-grabbing transition-all group shadow-sm hover:shadow-lg active:scale-95"
                  >
                    <div className="flex justify-between items-start mb-1 md:mb-2">
                      <span className="font-black text-slate-800 text-sm md:text-lg group-hover:text-cyan-800">{event.name}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-cyan-800 md:w-4 md:h-4" />
                    </div>
                    <p className="text-[9px] md:text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">{event.description}</p>
                  </div>
                ))}
                {pool.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-8 opacity-20">
                      <Sparkles size={40} className="text-slate-300 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">已全数排布</p>
                   </div>
                )}
              </div>
           </div>

           {/* 统计状态条 - 移动端更精简 */}
           <div className="bg-cyan-950 rounded-[1.2rem] md:rounded-[2.5rem] p-4 md:p-8 text-white flex justify-between items-center shadow-2xl shrink-0">
              <div>
                 <div className="text-[7px] md:text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-0.5 md:mb-1">Score</div>
                 <div className="text-xl md:text-4xl font-black italic">{score}</div>
              </div>
              <div className="text-right">
                 <div className="text-[7px] md:text-[10px] font-black text-cyan-400 tracking-widest uppercase mb-0.5 md:mb-1">Sync_Rate</div>
                 <div className="text-sm md:text-lg font-black italic">98.4%</div>
              </div>
           </div>
        </aside>
      </main>

      {/* 详情弹窗 - 响应式尺寸 */}
      {showDetail && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6" onClick={() => setShowDetail(null)}>
           <div className="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                 <div className="px-3 md:px-4 py-1 bg-cyan-100 text-cyan-800 rounded-full text-[8px] md:text-[10px] font-black">{formatYear(showDetail.year)}</div>
                 <span className="text-[8px] md:text-[10px] font-black text-slate-400 tracking-widest uppercase">{showDetail.period}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 md:mb-6">{showDetail.name}</h2>
              <div className="space-y-4 md:space-y-6">
                 <section>
                    <h4 className="text-[8px] md:text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1 md:mb-2 italic">史实速览</h4>
                    <p className="text-slate-600 text-xs md:text-sm leading-relaxed">{showDetail.description}</p>
                 </section>
                 <section>
                    <h4 className="text-[8px] md:text-[10px] font-black text-cyan-600 uppercase tracking-widest mb-1 md:mb-2 italic">历史地位</h4>
                    <div className="p-3 md:p-4 bg-cyan-50 border-l-4 border-cyan-800 rounded-r-xl">
                      <p className="text-cyan-900 text-xs md:text-sm italic font-black">"{showDetail.significance}"</p>
                    </div>
                 </section>
              </div>
              <button onClick={() => setShowDetail(null)} className="mt-6 md:mt-10 w-full py-3 md:py-4 bg-slate-900 text-white font-black rounded-xl md:rounded-2xl shadow-xl active:scale-95 transition-all text-xs md:text-sm">
                研读完毕
              </button>
           </div>
        </div>
      )}

      {/* 成功过关结算 - 响应式字体 */}
      {isSuccess && (
        <div className="fixed inset-0 z-[110] bg-cyan-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
           <div className="max-w-4xl w-full text-center">
              <Trophy className="w-20 h-20 md:w-[120px] md:h-[120px] text-cyan-400 mx-auto mb-6 md:mb-8 animate-bounce" />
              <h2 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter mb-2 md:mb-4 uppercase">Chronicle_Restored</h2>
              <p className="text-cyan-300 text-base md:text-xl font-bold tracking-[0.2em] md:tracking-[0.4em] mb-10 md:mb-16 px-4">
                {currentEra === 'Ancient' ? '上古纪元 整理完毕' : currentEra === 'Imperial' ? '帝制辉煌 尽入史册' : '近代风云 悉数掌握'}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 px-4">
                 {currentEra !== 'Modern' ? (
                   <button 
                    onClick={() => {
                      if (currentEra === 'Ancient') setCurrentEra('Imperial');
                      else if (currentEra === 'Imperial') setCurrentEra('Modern');
                    }}
                    className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-cyan-400 text-cyan-950 font-black text-lg md:text-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 md:gap-4"
                   >
                     下一纪元 <ChevronRight size={24} className="md:w-7 md:h-7"/>
                   </button>
                 ) : (
                   <button onClick={onClose} className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-cyan-950 font-black text-lg md:text-2xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 md:gap-4">
                     功德圆满 <Sparkles size={24} className="md:w-7 md:h-7"/>
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-1deg); }
          75% { transform: translateX(8px) rotate(1deg); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        
        /* 增加对安全区域的底层填充 */
        .pb-safe {
          padding-bottom: calc(env(safe-area-inset-bottom) + 1rem);
        }
      `}</style>
    </div>
  );
};

export default HistorySortingApp;
