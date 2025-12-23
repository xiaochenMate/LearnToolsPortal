
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
        <p className="text-purple-400 font-black tech-font tracking-[0.3em] animate-pulse">DECRYPTING_NEURAL_DATABASE...</p>
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

      {/* 顶部导航 */}
      <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/30 flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] rotate-3">
            <Brain className="text-white w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tech-font text-white flex items-center gap-2">
              NEURAL_DECODER <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/30">v4.5</span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={`text-[9px] font-black uppercase tracking-widest ${dataSource === 'NEON' ? 'text-blue-400' : 'text-slate-500'}`}>
                 SOURCE: {dataSource === 'NEON' ? 'CLOUD_NEON' : 'LOCAL_CACHE'}
               </span>
               <div className="w-1 h-1 rounded-full bg-slate-700"></div>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">Status: Sync_Stable</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button 
              onClick={() => initGame('DAILY', teasers)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'DAILY' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              PROT-DAILY
            </button>
            <button 
              onClick={() => initGame('RANDOM', teasers)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${mode === 'RANDOM' ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              RAND-LOOP
            </button>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/50 rounded-full transition-all text-slate-500 hover:text-red-500">
            <X size={20}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-3xl">
          
          {/* 题目卡片 */}
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-purple-500/30 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Terminal size={120} /></div>
               
               <div className="flex items-center gap-3 mb-8">
                 <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-[10px] font-black text-purple-400 rounded-md tracking-widest">
                   ID: {currentTease.id}
                 </span>
                 <span className="px-3 py-1 bg-slate-800 text-[10px] font-black text-slate-400 rounded-md tracking-widest">
                   CAT: {currentTease.category}
                 </span>
                 <div className="flex gap-1 ml-auto">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className={`w-2 h-2 rounded-full ${i < (currentTease.difficulty === 'EASY' ? 1 : currentTease.difficulty === 'MEDIUM' ? 2 : 3) ? 'bg-purple-500' : 'bg-slate-800'}`}></div>
                   ))}
                 </div>
               </div>

               <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4 min-h-[120px]">
                 {currentTease.question}
               </h2>

               <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 animate-pulse" style={{ width: '100%' }}></div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-[2rem] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Key size={14} className="text-purple-400" /> 解密密钥
                </h3>
                <span className="text-[10px] font-mono text-slate-600">{revealedHints}/{currentTease.hints.length}</span>
              </div>

              <div className="space-y-4">
                {currentTease.hints.map((hint, idx) => (
                  <div key={idx} className={`relative group transition-all duration-500 ${revealedHints > idx ? 'opacity-100' : 'opacity-40'}`}>
                    {revealedHints > idx ? (
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl text-sm text-purple-200 italic animate-in slide-in-from-left duration-300">
                        {hint}
                      </div>
                    ) : (
                      <button 
                        onClick={() => setRevealedHints(idx + 1)}
                        disabled={revealedHints !== idx}
                        className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-xl text-xs font-black text-slate-500 flex items-center justify-between transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="flex items-center gap-2">
                           <Lock size={12} /> HINT_0{idx + 1}
                        </span>
                        <Zap size={12} className="text-purple-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className={`flex-1 bg-slate-900/50 backdrop-blur-md border rounded-[2rem] p-8 flex flex-col items-center justify-center text-center transition-all duration-700 ${isAnswerRevealed ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-800'}`}>
                {!isAnswerRevealed ? (
                  <>
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                      <Eye size={24} className="text-slate-500" />
                    </div>
                    <button 
                      onClick={() => setIsAnswerRevealed(true)}
                      className="px-8 py-3 bg-white text-black font-black text-xs rounded-xl hover:bg-emerald-400 transition-all active:scale-95 shadow-xl"
                    >
                      INITIALIZE_DECODE
                    </button>
                  </>
                ) : (
                  <div className="animate-in zoom-in duration-500">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-4 flex items-center justify-center gap-2">
                      <Unlock size={12} /> Data_Uncovered
                    </div>
                    <p className="text-2xl font-black text-white italic leading-relaxed">
                      {currentTease.answer}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => initGame('RANDOM', teasers)}
                  className="py-4 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                >
                  <RefreshCw size={18} className="text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[10px] font-black text-slate-300">NEXT_PACKET</span>
                </button>
                <button 
                  onClick={() => {
                    const text = `【脑筋急转弯】\n题目：${currentTease.question}\n你猜得到吗？`;
                    navigator.clipboard.writeText(text);
                    alert("加密数据已复制，可前往通讯频道分享。");
                  }}
                  className="py-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                >
                  <Share2 size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black text-slate-300">SHARE_LINK</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-900 px-8 flex items-center justify-between z-20">
        <div className="flex gap-6">
          <span className="text-[9px] font-mono text-purple-500/50 flex items-center gap-2 italic">
            <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
            NEURAL_DATABASE: CONNECTED
          </span>
          <span className="text-[9px] font-mono text-slate-700 flex items-center gap-2 italic">
            RECORDS_IN_HUB: {teasers.length}
          </span>
        </div>
        <div className="text-[9px] font-mono text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <Database size={10} /> {dataSource}_GRID_ACTIVE
        </div>
      </footer>
    </div>
  );
};

export default BrainTeaseApp;
