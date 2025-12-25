
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Brain, Zap, Key, Eye, RefreshCw, 
  ChevronRight, ShieldAlert, Terminal, 
  Lock, Unlock, Sparkles, Share2, Loader2, Database
} from 'lucide-react';
import { BRAIN_TEASE_LIBRARY, BrainTease } from '../lib/brainTeaseData';
import sql from '../lib/neon';

const BrainTeaseApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [teasers, setTeasers] = useState<BrainTease[]>([]);
  const [currentTease, setCurrentTease] = useState<BrainTease | null>(null);
  const [revealedHints, setRevealedHints] = useState<number>(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [mode, setMode] = useState<'DAILY' | 'RANDOM'>('DAILY');
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'NEON' | 'LOCAL'>('LOCAL');

  // 获取数据
  const fetchTeasers = useCallback(async () => {
    setLoading(true);
    try {
      if (sql) {
        const data = await sql`SELECT * FROM brain_teasers ORDER BY id ASC`;
        if (data && data.length > 0) {
          // 格式化 hints 字段（如果是字符串则解析 JSON）
          const formatted = data.map(t => ({
            ...t,
            hints: Array.isArray(t.hints) ? t.hints : JSON.parse(t.hints)
          })) as BrainTease[];
          setTeasers(formatted);
          setDataSource('NEON');
          return formatted;
        }
      }
    } catch (err) {
      console.warn("[Neon] Database connection failed, using local library.", err);
    }
    
    // 降级使用本地数据
    setTeasers(BRAIN_TEASE_LIBRARY);
    setDataSource('LOCAL');
    return BRAIN_TEASE_LIBRARY;
  }, []);

  const initGame = useCallback((gameMode: 'DAILY' | 'RANDOM', dataPool: BrainTease[]) => {
    if (dataPool.length === 0) return;
    
    setIsAnswerRevealed(false);
    setRevealedHints(0);
    setMode(gameMode);
    
    if (gameMode === 'DAILY') {
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      const index = seed % dataPool.length;
      setCurrentTease(dataPool[index]);
    } else {
      const available = dataPool.filter(t => !history.includes(t.id));
      const pool = available.length > 0 ? available : dataPool;
      const random = pool[Math.floor(Math.random() * pool.length)];
      setCurrentTease(random);
      setHistory(prev => [...prev.slice(-10), random.id]);
    }
  }, [history]);

  useEffect(() => {
    fetchTeasers().then(data => {
      initGame('DAILY', data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-purple-500/20 rounded-full animate-ping opacity-20"></div>
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin absolute inset-0 m-auto" />
        </div>
        <p className="text-purple-400 text-xs md:text-sm font-black tech-font tracking-[0.3em] animate-pulse">DECRYPTING_DATABASE...</p>
      </div>
    );
  }

  if (!currentTease) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col font-sans overflow-hidden">
      {/* 赛博网格背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }}></div>
      </div>

      {/* 顶部导航 - 移动端高度优化 */}
      <header className="h-16 md:h-20 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/30 flex items-center justify-between px-4 md:px-8 z-20 shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Brain className="text-white w-5 h-5 md:w-6 md:h-6 animate-pulse" />
          </div>
          <div className="truncate">
            <h1 className="text-sm md:text-xl font-black tech-font text-white flex items-center gap-2 truncate">
              NEURAL_DECODER <span className="hidden xs:inline-block text-[8px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">v4.5</span>
            </h1>
            <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.2em] truncate">{dataSource === 'NEON' ? 'CLOUD' : 'CACHE'} / SYNC_STABLE</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <button onClick={onClose} className="p-2 md:p-3 bg-slate-800 border border-slate-700 rounded-full transition-all text-slate-500 hover:text-red-500">
            <X size={18}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-12 relative z-10 overflow-y-auto no-scrollbar">
        <div className="w-full max-w-3xl flex flex-col gap-4 md:gap-8 py-4 md:py-0">
          
          {/* 题目卡片 - 移动端调整间距与字体 */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-[1.5rem] md:rounded-[2.5rem] blur-sm"></div>
            <div className="relative bg-slate-900 border border-purple-500/30 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-6 md:p-8 opacity-5"><Terminal size={80} className="md:w-[120px] md:h-[120px]" /></div>
               
               <div className="flex items-center gap-2 mb-6 md:mb-8">
                 <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-[8px] md:text-[10px] font-black text-purple-400 rounded tracking-widest">
                   ID: {currentTease.id}
                 </span>
                 <div className="flex gap-1 ml-auto">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${i < (currentTease.difficulty === 'EASY' ? 1 : currentTease.difficulty === 'MEDIUM' ? 2 : 3) ? 'bg-purple-500' : 'bg-slate-800'}`}></div>
                   ))}
                 </div>
               </div>

               <h2 className="text-xl md:text-4xl font-black text-white leading-relaxed mb-6 md:mb-10 min-h-[80px] md:min-h-[120px]">
                 {currentTease.question}
               </h2>

               <div className="h-0.5 md:h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" style={{ width: '100%' }}></div>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
            {/* 提示区 */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-purple-400" /> 解密密钥
                </h3>
                <span className="text-[8px] md:text-[10px] font-mono text-slate-600">{revealedHints}/{currentTease.hints.length}</span>
              </div>

              <div className="space-y-3">
                {currentTease.hints.map((hint, idx) => (
                  <div key={idx} className={`transition-all duration-500 ${revealedHints > idx ? 'opacity-100' : 'opacity-40'}`}>
                    {revealedHints > idx ? (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-3 md:p-4 rounded-xl text-xs md:text-sm text-purple-200 italic animate-in slide-in-from-left">
                        {hint}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRevealedHints(idx + 1)}
                        disabled={revealedHints !== idx}
                        className="w-full bg-slate-800/80 border border-slate-700 p-3 md:p-4 rounded-xl text-[10px] md:text-xs font-black text-slate-500 flex items-center justify-between transition-all disabled:opacity-50"
                      >
                        <span className="flex items-center gap-2"><Lock size={12} /> HINT_0{idx + 1}</span>
                        <Zap size={10} className="text-purple-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 答案区与操作 */}
            <div className="flex flex-col gap-4">
              <div className={`min-h-[120px] md:flex-1 bg-slate-900/50 backdrop-blur-md border rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all duration-700 ${isAnswerRevealed ? 'border-emerald-500/50' : 'border-slate-800'}`}>
                {!isAnswerRevealed ? (
                  <button 
                    onClick={() => setIsAnswerRevealed(true)}
                    className="w-full md:w-auto px-8 py-4 bg-white text-black font-black text-xs rounded-xl hover:bg-emerald-400 active:scale-95 shadow-xl"
                  >
                    INITIALIZE_DECODE
                  </button>
                ) : (
                  <div className="animate-in zoom-in duration-500">
                    <div className="text-[8px] md:text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-3 flex items-center justify-center gap-2">
                      <Unlock size={10} /> DATA_UNCOVERED
                    </div>
                    <p className="text-xl md:text-2xl font-black text-white italic leading-relaxed">
                      {currentTease.answer}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => initGame('RANDOM', teasers)}
                  className="py-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all active:bg-slate-800"
                >
                  <RefreshCw size={16} className="text-purple-400" />
                  <span className="text-[9px] md:text-[10px] font-black text-slate-300">NEXT_PACKET</span>
                </button>
                <button 
                  onClick={() => {
                    const text = `【脑筋急转弯挑战】\n${currentTease.question}\n你猜得到吗？`;
                    navigator.clipboard.writeText(text);
                    alert("数据已复制。");
                  }}
                  className="py-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center gap-2 transition-all active:bg-slate-800"
                >
                  <Share2 size={16} className="text-blue-400" />
                  <span className="text-[9px] md:text-[10px] font-black text-slate-300">SHARE_LINK</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-8 md:h-10 bg-slate-950 border-t border-slate-900 px-4 md:px-8 flex items-center justify-between z-20 shrink-0 text-[7px] md:text-[9px] font-mono text-slate-700 italic">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-1 h-1 bg-purple-500 rounded-full"></span>CONNECTED</span>
          <span>RECORDS: {teasers.length}</span>
        </div>
        <div className="uppercase tracking-widest">NEURAL_DECODER_PRO_V4</div>
      </footer>
    </div>
  );
};

export default BrainTeaseApp;
