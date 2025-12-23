
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, RotateCcw, CheckCircle, Volume2, Award, ArrowRight, Play, 
  Sparkles, Search, Filter, BookOpen, ChevronRight, Bookmark, 
  Settings2, Music, Languages, Info, History, Trophy, Loader2,
  AlertCircle, DatabaseZap, Database, RefreshCw, Lightbulb, Copy,
  Clock, Hash, Map, Feather
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
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(() => Number(localStorage.getItem('poem_score') || 0));
  const [searchQuery, setSearchQuery] = useState('');
  const [dynastyFilter, setDynastyFilter] = useState<'all' | string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [showLibrary, setShowLibrary] = useState(false);
  const [dataSource, setDataSource] = useState<'NEON' | 'LOCAL' | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchPoems = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    
    try {
      if (sql) {
        const data = categoryFilter === 'all' 
          ? await sql`SELECT * FROM poems ORDER BY id ASC LIMIT 500`
          : await sql`SELECT * FROM poems WHERE category = ${categoryFilter} ORDER BY id ASC LIMIT 500`;
        
        if (data && data.length > 0) {
          const formattedData = data.map(p => ({
            ...p,
            lines: Array.isArray(p.lines) ? p.lines : (typeof p.lines === 'string' ? JSON.parse(p.lines) : []),
            image: p.image_url || p.image || `https://picsum.photos/800/600?nature,${p.id}`
          }));
          setPoems(formattedData as any);
          setDataSource('NEON');
          setCurrentIdx(Math.floor(Math.random() * formattedData.length));
          setLoading(false);
          return;
        } else if (data && data.length === 0 && categoryFilter !== 'all') {
           setDbError(`云端尚未发现 '${categoryFilter}' 分类的诗篇。`);
        }
      }
    } catch (err: any) {
      console.error("[Neon] Error:", err);
      setDbError(err.message || "连接失败");
    }

    // Fallback
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
    return poems[currentIdx % poems.length] || poems[0];
  }, [poems, currentIdx]);

  const initPoem = useCallback(() => {
    if (!poem) return;
    setLines([]);
    setShuffled([...poem.lines].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
    setShowHint(false);
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
      // 错误抖动反馈
      const el = document.getElementById('puzzle-area');
      el?.classList.add('animate-shake');
      setTimeout(() => el?.classList.remove('animate-shake'), 500);
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      msg.rate = 0.85;
      window.speechSynthesis.speak(msg);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('诗词已复制到剪贴板');
  };

  const handleNext = () => {
    setCurrentIdx(prev => (prev + 1) % poems.length);
    setIsSuccess(false);
  };

  const filteredLibrary = useMemo(() => {
    return poems.filter(p => {
      const matchesSearch = p.title.includes(searchQuery) || p.author.includes(searchQuery);
      const matchesDynasty = dynastyFilter === 'all' || p.dynasty === dynastyFilter;
      return matchesSearch && matchesDynasty;
    });
  }, [poems, searchQuery, dynastyFilter]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[70] bg-[#FDFBF7] flex flex-col items-center justify-center">
        <div className="relative mb-8">
           <div className="w-20 h-20 bg-rose-50 rounded-full animate-ping opacity-20"></div>
           <Loader2 className="w-12 h-12 text-rose-600 animate-spin absolute inset-0 m-auto" />
        </div>
        <p className="text-stone-400 font-bold tracking-[0.3em] italic animate-pulse uppercase text-xs">Synchronizing Heritage...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#FDFBF7] flex flex-col h-full overflow-hidden select-none font-serif">
      {/* 顶部警告 */}
      {dbError && (
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center justify-between text-[10px] font-black animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-2 text-amber-700">
             <AlertCircle size={14} />
             <span>云端检索受限: {dbError} (已启用本地诗库镜像)</span>
           </div>
           <button onClick={() => fetchPoems()} className="text-amber-600 hover:underline flex items-center gap-1">
             <RefreshCw size={10} /> 重试同步
           </button>
        </div>
      )}

      {/* 导航栏 */}
      <header className="h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md border-b border-stone-200 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-stone-900 rounded-2xl shadow-lg flex items-center justify-center">
            <Feather className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 tracking-tight">中华诗词馆</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
               <span className={`text-[9px] font-bold uppercase tracking-widest italic ${dataSource === 'NEON' ? 'text-blue-500' : 'text-stone-400'}`}>
                 {dataSource === 'NEON' ? 'NEON CLOUD' : 'LOCAL CACHE'} / {poems.length} Items
               </span>
               <div className="w-1 h-1 rounded-full bg-stone-300"></div>
               <span className="text-[9px] font-bold text-stone-400">READY_STATE: SYNCED</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-stone-50 rounded-2xl border border-stone-100 shadow-sm">
            <Trophy size={16} className="text-amber-500" />
            <span className="text-xs font-black text-stone-800 tracking-tighter">{score} 分</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors">
            <X size={24}/>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 背景虚化层：随诗词而动 */}
        {poem && (
          <div className="absolute inset-0 z-0 opacity-5 pointer-events-none transition-all duration-1000 overflow-hidden">
             <img src={poem.image_url || poem.image} className="w-full h-full object-cover scale-110 blur-3xl" alt="bg" />
          </div>
        )}

        {/* 侧边分类栏 */}
        <aside className="hidden lg:flex w-72 flex-col p-8 border-r border-stone-100 overflow-y-auto no-scrollbar bg-white/40 backdrop-blur-sm z-10">
          <section className="mb-10">
             <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
               <Filter size={14} /> 题材分类
             </h3>
             <div className="grid grid-cols-1 gap-1.5">
               {[
                 { id: 'all', label: '全部诗篇' },
                 { id: 'nature', label: '写景咏物' },
                 { id: 'homesick', label: '羁旅思乡' },
                 { id: 'farewell', label: '友人送别' },
                 { id: 'motivation', label: '壮志抱负' },
                 { id: 'festival', label: '节日节令' },
                 { id: 'spring', label: '春日气息' },
                 { id: 'autumn', label: '秋日私语' }
               ].map(cat => (
                 <button 
                  key={cat.id} 
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`group px-5 py-3 rounded-2xl text-[13px] transition-all flex justify-between items-center ${categoryFilter === cat.id ? 'bg-stone-900 text-white shadow-xl shadow-stone-200 font-bold' : 'bg-transparent text-stone-600 hover:bg-stone-100'}`}
                 >
                   <span>{cat.label}</span>
                   <ChevronRight size={14} className={categoryFilter === cat.id ? 'opacity-100' : 'opacity-20 group-hover:opacity-100'} />
                 </button>
               ))}
             </div>
          </section>

          {poem && (
            <section className="mt-auto">
               <div className="bg-white/80 p-6 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:rotate-45 transition-transform"><Clock size={64}/></div>
                  <h2 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 italic">当前解析</h2>
                  <div className="text-xl font-black text-stone-800 mb-1 leading-tight">{poem.title}</div>
                  <div className="text-stone-400 text-[10px] mb-4 font-bold uppercase tracking-widest">{poem.dynasty} · {poem.author}</div>
                  <div className={`p-4 rounded-2xl text-[11px] leading-relaxed transition-all ${showHint ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-stone-50 text-stone-300 blur-sm grayscale'}`}>
                    {poem.meaning}
                  </div>
                  <button onClick={() => setShowHint(!showHint)} className="mt-4 w-full py-2 bg-stone-100 text-stone-500 text-[10px] font-black rounded-xl hover:bg-stone-200 flex items-center justify-center gap-2">
                    <Lightbulb size={12}/> {showHint ? '隐藏锦囊' : '查看锦囊'}
                  </button>
               </div>
            </section>
          )}
        </aside>

        {/* 解密挑战区 */}
        <div className="flex-1 flex flex-col p-4 sm:p-10 gap-6 relative z-10 overflow-hidden">
          {poem ? (
            <>
              <div 
                id="puzzle-area"
                className="flex-1 bg-white/60 border-2 border-stone-100 rounded-[3.5rem] p-6 sm:p-10 flex flex-col justify-center items-center gap-6 overflow-y-auto no-scrollbar relative shadow-inner shadow-stone-100/50"
              >
                {lines.length === 0 && !isSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none text-center">
                    <Database size={120} className="text-stone-400 mb-4 mx-auto" />
                    <p className="text-stone-400 font-black italic tracking-[0.5em] text-2xl uppercase">Zen Poetry Space</p>
                  </div>
                )}
                <div className="w-full max-w-2xl flex flex-col gap-5">
                  {lines.map((line, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => handleRemove(line)} 
                      className={`w-full px-8 py-5 bg-white border-2 border-stone-100 rounded-[2.2rem] text-xl sm:text-3xl font-black text-stone-800 shadow-sm transition-all hover:scale-[1.02] hover:border-rose-300 ${isSuccess ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-rose-100' : 'active:scale-95'}`}
                    >
                      {line}
                    </button>
                  ))}
                </div>
              </div>

              {/* 候选区 */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 shrink-0 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {shuffled.map((line, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handlePick(line)} 
                    className="px-6 sm:px-10 py-3 sm:py-4 bg-white border border-stone-200 rounded-2xl text-lg sm:text-xl font-bold text-stone-600 hover:border-rose-500 hover:text-rose-700 shadow-sm active:scale-90 transition-all hover:-translate-y-1"
                  >
                    {line}
                  </button>
                ))}
              </div>

              {/* 操作区 */}
              <div className="flex justify-center gap-4 shrink-0">
                <button onClick={initPoem} className="px-6 py-4 bg-white border border-stone-200 text-stone-400 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-stone-50 transition-all active:scale-95">
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
              <p className="text-stone-400 font-black tracking-widest uppercase">该分类下暂无内容</p>
              <button onClick={() => setCategoryFilter('all')} className="mt-6 px-8 py-3 bg-stone-900 text-white rounded-2xl text-xs font-black shadow-lg">回到全部</button>
            </div>
          )}

          {/* 成功结算页 */}
          {isSuccess && poem && (
            <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-700">
               <div className="w-full max-w-4xl flex flex-col items-center">
                 <div className="relative w-full aspect-video rounded-[3.5rem] overflow-hidden mb-10 shadow-2xl border-8 border-white group">
                   <img src={poem.image_url || poem.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s]" alt="意境" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/1200/800?nature')} />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-10">
                     <div className="text-white text-4xl sm:text-6xl font-black tracking-tighter mb-4">{poem.title}</div>
                     <div className="text-white/80 text-xl font-bold tracking-[0.2em]">{poem.dynasty} · {poem.author}</div>
                   </div>
                   {/* “完卷”印章装饰 */}
                   <div className="absolute top-10 right-10 w-24 h-24 border-4 border-rose-600 rounded-full flex items-center justify-center rotate-12 opacity-80 animate-in zoom-in delay-300">
                      <div className="text-rose-600 font-black text-2xl border-2 border-rose-600 rounded px-2">已完卷</div>
                   </div>
                 </div>
                 
                 <div className="relative mb-12 max-w-2xl">
                    <span className="absolute -top-6 -left-8 text-6xl text-stone-100 font-black">“</span>
                    <p className="text-stone-800 text-xl sm:text-3xl font-bold leading-relaxed italic text-center px-4">{poem.meaning}</p>
                    <span className="absolute -bottom-6 -right-8 text-6xl text-stone-100 font-black">”</span>
                 </div>

                 <div className="flex gap-5 w-full max-w-md">
                   <button onClick={() => playTTS(`${poem.title}, ${poem.author}, ${poem.lines.join(', ')}`)} className="flex-1 py-5 bg-stone-900 text-white rounded-[2.2rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all">
                     <Volume2 size={24}/> 聆听吟诵
                   </button>
                   <button onClick={handleNext} className="flex-1 py-5 bg-rose-600 text-white rounded-[2.2rem] font-black flex items-center justify-center gap-3 shadow-xl hover:bg-rose-500 transition-all active:scale-95">
                     下一挑战 <ArrowRight size={24}/>
                   </button>
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* 增强版百科库 */}
      {showLibrary && (
        <div className="fixed inset-0 z-[110] bg-[#FDFBF7] flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
           <div className="h-20 border-b border-stone-100 bg-white flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-stone-900 rounded-2xl text-white"><BookOpen size={24}/></div>
                   <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">中华诗词百科</h2>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-2.5 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-full transition-all">
                  <X size={28} />
                </button>
           </div>

           <div className="flex-1 flex overflow-hidden">
              {/* 侧边筛选 */}
              <aside className="w-64 border-r border-stone-100 p-8 hidden md:flex flex-col gap-8 bg-stone-50/50">
                <div>
                   <h3 className="text-[10px] font-black text-stone-300 uppercase tracking-widest mb-4">朝代索引</h3>
                   <div className="flex flex-col gap-1">
                      {['all', '唐', '宋', '清', '南北朝'].map(d => (
                        <button key={d} onClick={() => setDynastyFilter(d)} className={`px-4 py-2 rounded-xl text-left text-xs font-black transition-all ${dynastyFilter === d ? 'bg-rose-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}>
                           {d === 'all' ? '全部朝代' : d}
                        </button>
                      ))}
                   </div>
                </div>
              </aside>

              {/* 列表区 */}
              <div className="flex-1 flex flex-col p-6 sm:p-10 overflow-hidden">
                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={24} />
                    <input type="text" placeholder="检索诗题、诗人或名句..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border-2 border-stone-100 rounded-full py-5 pl-16 pr-8 text-lg font-bold shadow-sm focus:outline-none focus:border-rose-300/30 transition-all placeholder:text-stone-200" />
                </div>
                
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLibrary.map((p, idx) => (
                          <div key={idx} className="bg-white p-8 rounded-[3rem] border border-stone-100 hover:border-rose-200 transition-all shadow-sm group relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <div className="text-2xl font-black text-stone-900 mb-1 leading-tight">{p.title}</div>
                                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">{p.dynasty} · {p.author}</div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => copyToClipboard(`${p.title}\n${p.author}\n${p.lines.join('\n')}`)} className="p-2 text-stone-200 hover:text-stone-600 transition-colors"><Copy size={16}/></button>
                                <button onClick={() => playTTS(p.lines.join('，'))} className="p-2 text-stone-200 hover:text-rose-600 transition-colors"><Volume2 size={16}/></button>
                              </div>
                            </div>
                            <div className="space-y-1.5 mb-8 flex-1">
                              {p.lines.map(line => <p key={line} className="text-stone-600 text-sm font-bold tracking-wide">{line}</p>)}
                            </div>
                            <p className="text-stone-400 text-[10px] leading-relaxed italic border-t border-stone-50 pt-4 line-clamp-3">{p.meaning}</p>
                          </div>
                      ))}
                    </div>
                </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default PoetryApp;
