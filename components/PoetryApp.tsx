
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, RotateCcw, CheckCircle, Volume2, Award, ArrowRight, Play, 
  Sparkles, Search, Filter, BookOpen, ChevronRight, Bookmark, 
  Settings2, Music, Languages, Info, History, Trophy, Loader2,
  AlertCircle, DatabaseZap, Database, RefreshCw
} from 'lucide-react';
import sql from '../lib/neon';
import { Poem, POEM_LIBRARY } from '../lib/poems';

const PoetryApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(() => Number(localStorage.getItem('poem_score') || 0));
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [showLibrary, setShowLibrary] = useState(false);
  const [dataSource, setDataSource] = useState<'NEON' | 'LOCAL' | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    
    try {
      if (sql) {
        // 执行查询
        const data = categoryFilter === 'all' 
          ? await sql`SELECT * FROM poems ORDER BY id ASC LIMIT 500`
          : await sql`SELECT * FROM poems WHERE category = ${categoryFilter} ORDER BY id ASC LIMIT 500`;
        
        if (data && data.length > 0) {
          const formattedData = data.map(p => ({
            ...p,
            // 关键修复：Neon 的 text[] 已经是数组，但如果是字符串则尝试解析
            lines: Array.isArray(p.lines) ? p.lines : (typeof p.lines === 'string' ? JSON.parse(p.lines) : []),
            image: p.image_url || p.image || `https://picsum.photos/800/600?nature,${p.id}`
          }));
          setPoems(formattedData as any);
          setDataSource('NEON');
          setCurrentIdx(Math.floor(Math.random() * formattedData.length));
          setLoading(false);
          return;
        } else if (data && data.length === 0 && categoryFilter !== 'all') {
           // 如果特定分类没数据，提示用户
           setDbError(`云端数据库中尚未发现分类为 '${categoryFilter}' 的诗词。`);
        } else if (data && data.length === 0) {
           setDbError("云端数据库 'poems' 表目前是空的。");
        }
      } else {
        setDbError("未检测到数据库配置变量 (VITE_DATABASE_URL)。");
      }
    } catch (err: any) {
      console.error("[Neon] Database connection error:", err);
      setDbError(err.message || "连接云端数据库时发生未知错误");
    }

    // 回退到本地
    const localData = categoryFilter === 'all' 
      ? POEM_LIBRARY 
      : POEM_LIBRARY.filter(p => p.category === categoryFilter);
    
    setPoems(localData);
    setDataSource('LOCAL');
    setCurrentIdx(Math.floor(Math.random() * localData.length));
    setLoading(false);
  }, [categoryFilter]);

  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);

  const poem = useMemo(() => {
    if (poems.length === 0) return null;
    const pool = poems.filter(p => 
      p.title.includes(searchQuery) || p.author.includes(searchQuery)
    );
    return pool[currentIdx % pool.length] || poems[0];
  }, [poems, currentIdx, searchQuery]);

  const initPoem = useCallback(() => {
    if (!poem) return;
    setLines([]);
    setShuffled([...poem.lines].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
  }, [poem]);

  useEffect(() => {
    initPoem();
  }, [initPoem]);

  const handlePick = (line: string) => {
    if (isSuccess) return;
    setLines(prev => [...prev, line]);
    setShuffled(prev => prev.filter(l => l !== line));
  };

  const handleRemove = (line: string) => {
    if (isSuccess) return;
    setShuffled(prev => [...prev, line]);
    setLines(prev => prev.filter(l => l !== line));
  };

  const handleVerify = () => {
    if (!poem) return;
    if (lines.join('') === poem.lines.join('')) {
      setIsSuccess(true);
      const newScore = score + 1;
      setScore(newScore);
      localStorage.setItem('poem_score', String(newScore));
      playTTS(`${poem.title}, ${poem.author}, ${poem.lines.join(', ')}`);
    } else {
      alert('顺序不对哦，再仔细思考一下！');
      initPoem();
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }
  };

  const handleNext = () => {
    setCurrentIdx(Math.floor(Math.random() * poems.length));
    setIsSuccess(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#FDFBF7] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-rose-600 animate-spin mb-4" />
        <p className="text-stone-400 font-bold tracking-widest italic animate-pulse">正在同步云端诗藏...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#FDFBF7] flex flex-col h-full overflow-hidden select-none font-serif">
      {dbError && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center justify-between animate-in slide-in-from-top duration-300">
           <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
             <AlertCircle size={14} />
             <span>云端连接提示：{dbError} (当前使用本地数据)</span>
           </div>
           <button onClick={() => fetchPoems()} className="text-[10px] font-black text-amber-600 flex items-center gap-1 hover:underline">
             <RefreshCw size={10} /> 刷新数据库
           </button>
        </div>
      )}

      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-stone-200 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-rose-600 rounded-xl shadow-lg shadow-rose-100 flex items-center justify-center">
            <Bookmark className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 tracking-tight">中华诗词库</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`text-[10px] font-bold uppercase tracking-widest italic ${dataSource === 'NEON' ? 'text-blue-500' : 'text-stone-400'}`}>
                 {dataSource === 'NEON' ? 'NEON CLOUD' : 'LOCAL CACHE'} / {poems.length} Items
               </span>
               <div className="w-1 h-1 rounded-full bg-stone-300"></div>
               <span className="text-[10px] font-bold text-stone-400">SYNC: {sql ? 'READY' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100 shadow-sm">
            <Trophy size={16} className="text-rose-600" />
            <span className="text-xs font-black text-rose-800">{score}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors">
            <X size={24}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="hidden lg:flex w-80 flex-col p-8 border-r border-stone-100 overflow-y-auto no-scrollbar bg-stone-50/30">
          <section className="mb-10">
             <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <Filter size={14} /> 题材分类
             </h3>
             <div className="grid grid-cols-1 gap-2">
               {/* 这里的 ID 必须匹配你数据库中的 category 字段值 */}
               {[
                 { id: 'all', label: '全部诗篇' },
                 { id: 'nature', label: '写景咏物' },
                 { id: 'homesick', label: '羁旅思乡' },
                 { id: 'farewell', label: '友人送别' },
                 { id: 'motivation', label: '壮志抱负' },
                 { id: 'festival', label: '节日节令' },
                 { id: 'history', label: '咏史怀古' },
                 { id: 'spring', label: '春日气息' },
                 { id: 'autumn', label: '秋日私语' }
               ].map(cat => (
                 <button 
                  key={cat.id} 
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`group px-5 py-3 rounded-2xl text-sm transition-all flex justify-between items-center ${categoryFilter === cat.id ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 font-bold' : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-100'}`}
                 >
                   <span>{cat.label}</span>
                   <ChevronRight size={14} className={categoryFilter === cat.id ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'} />
                 </button>
               ))}
             </div>
          </section>

          {poem && (
            <section className="mt-auto">
               <div className="bg-white p-6 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] rotate-12"><History size={64}/></div>
                  <h2 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 italic">学而时习之</h2>
                  <div className="text-2xl font-black text-stone-800 mb-1">{poem.title}</div>
                  <div className="text-stone-400 text-xs mb-4">{poem.dynasty} · {poem.author}</div>
                  <div className="p-4 bg-stone-50 rounded-2xl text-[11px] leading-relaxed text-stone-500 italic border border-stone-100">
                    {poem.meaning}
                  </div>
               </div>
            </section>
          )}
        </aside>

        <div className="flex-1 flex flex-col p-4 sm:p-10 gap-6 relative overflow-hidden">
          {poem ? (
            <>
              <div className="flex-1 bg-white/40 border-4 border-dashed border-stone-200 rounded-[3rem] p-6 sm:p-10 flex flex-col justify-center items-center gap-6 overflow-y-auto no-scrollbar relative">
                {lines.length === 0 && !isSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none text-center">
                    {dataSource === 'NEON' ? <DatabaseZap size={100} className="text-blue-200 mb-4 mx-auto" /> : <Sparkles size={100} className="text-stone-200 mb-4 mx-auto" />}
                    <p className="text-stone-400 font-bold italic tracking-widest text-lg">数据库连接成功<br/>请点选诗句重塑华章</p>
                  </div>
                )}
                <div className="w-full max-w-2xl flex flex-col gap-4">
                  {lines.map((line, idx) => (
                    <button key={idx} onClick={() => handleRemove(line)} className={`w-full px-8 py-5 bg-white border-2 border-stone-200 rounded-[2rem] text-xl sm:text-3xl font-black text-stone-800 shadow-sm transition-all hover:scale-[1.02] hover:border-rose-300 ${isSuccess ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-rose-100' : ''}`}>
                      {line}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 shrink-0">
                {shuffled.map((line, idx) => (
                  <button key={idx} onClick={() => handlePick(line)} className="px-6 sm:px-10 py-3 sm:py-4 bg-white border-2 border-stone-100 rounded-2xl text-lg sm:text-xl font-bold text-stone-600 hover:border-rose-500 hover:text-rose-700 shadow-sm active:scale-90 transition-all">
                    {line}
                  </button>
                ))}
              </div>

              <div className="flex justify-center gap-4 shrink-0">
                <button onClick={initPoem} className="px-6 py-4 bg-stone-100 border border-stone-200 text-stone-500 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-stone-200 transition-all active:scale-95">
                  <RotateCcw size={18} /> 重置
                </button>
                <button onClick={() => setShowLibrary(true)} className="px-6 py-4 bg-stone-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-black transition-all active:scale-95 shadow-xl">
                  <BookOpen size={18} /> 查阅百科
                </button>
                <button onClick={handleVerify} disabled={lines.length !== poem.lines.length} className={`px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-3 transition-all ${lines.length === poem.lines.length ? 'bg-rose-600 text-white shadow-xl shadow-rose-200 hover:bg-rose-500 scale-105' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
                  <CheckCircle size={22}/> 完卷呈阅
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <AlertCircle size={48} className="text-stone-200 mb-4" />
              <p className="text-stone-400 font-bold uppercase tracking-widest">该分类下暂无内容</p>
              <button onClick={() => setCategoryFilter('all')} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold">返回全部</button>
            </div>
          )}

          {isSuccess && poem && (
            <div className="fixed inset-0 z-[100] bg-[#FDFBF7]/98 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-700">
               <div className="w-full max-w-3xl flex flex-col items-center">
                 <div className="relative w-full h-48 sm:h-80 rounded-[3rem] overflow-hidden mb-8 shadow-2xl border-4 border-white bg-stone-200">
                   <img src={poem.image_url || poem.image} className="w-full h-full object-cover" alt="意境" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/800/600?nature')} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                     <div className="text-white text-3xl sm:text-5xl font-black tracking-tight mb-2">{poem.title}</div>
                     <div className="text-white/80 text-xl font-bold">{poem.dynasty} · {poem.author}</div>
                   </div>
                 </div>
                 <p className="text-stone-800 text-lg sm:text-2xl font-bold leading-relaxed mb-10 italic text-center px-4">“{poem.meaning}”</p>
                 <div className="flex gap-4 w-full max-w-md">
                   <button onClick={() => playTTS(`${poem.title}, ${poem.author}, ${poem.lines.join(', ')}`)} className="flex-1 py-4 sm:py-5 bg-stone-900 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl">
                     <Volume2 size={24}/> 聆听吟诵
                   </button>
                   <button onClick={handleNext} className="flex-1 py-4 sm:py-5 bg-rose-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-rose-500 transition-all active:scale-95">
                     下一挑战 <ArrowRight size={24}/>
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {showLibrary && (
        <div className="fixed inset-0 z-[110] bg-[#FDFBF7] flex flex-col p-4 sm:p-12 animate-in slide-in-from-right duration-500 overflow-hidden">
           <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-5">
                   <div className="p-4 bg-stone-900 rounded-[1.5rem] text-white shadow-2xl"><BookOpen size={40}/></div>
                   <div>
                     <h2 className="text-2xl sm:text-5xl font-black text-stone-900 tracking-tighter">古诗百科辞典</h2>
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mt-2 italic">Database: {dataSource} / {poems.length} Items</p>
                   </div>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-4 bg-white border border-stone-200 rounded-full text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                  <X size={32} />
                </button>
             </div>
             <div className="relative mb-10 shrink-0">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-stone-300" size={28} />
                <input type="text" placeholder="从云端诗藏中检索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-stone-100 rounded-[2.5rem] py-6 pl-20 pr-10 text-xl font-bold shadow-sm focus:outline-none focus:border-rose-500/30 transition-all placeholder:text-stone-200" />
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {poems.filter(p => p.title.includes(searchQuery) || p.author.includes(searchQuery)).map((p, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[3rem] border border-stone-100 hover:border-rose-200 transition-all shadow-sm group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-rose-600/10 group-hover:bg-rose-600 transition-colors"></div>
                        <div className="flex justify-between items-start mb-6">
                           <div>
                             <div className="text-3xl font-black text-stone-900 mb-1">{p.title}</div>
                             <div className="text-xs font-bold text-rose-500 uppercase tracking-widest">{p.dynasty} · {p.author}</div>
                           </div>
                           <button onClick={() => playTTS(p.lines.join('，'))} className="p-3 bg-stone-50 text-stone-300 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Volume2 size={20} /></button>
                        </div>
                        <div className="space-y-1 mb-6">
                           {p.lines.map(line => <p key={line} className="text-stone-600 text-sm font-medium">{line}</p>)}
                        </div>
                        <p className="text-stone-400 text-[11px] leading-relaxed italic border-t border-stone-50 pt-4 line-clamp-2">{p.meaning}</p>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PoetryApp;
