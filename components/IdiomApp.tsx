
import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Search, Sparkles, BookOpen, RefreshCw, 
  ChevronRight, Bookmark, Info, History, 
  Database, Loader2, Quote, ScrollText, 
  Feather, Languages, BookOpenCheck
} from 'lucide-react';
import sql from '../lib/neon';

interface Idiom {
  id: number;
  word: string;
  pinyin: string;
  abbreviation: string;
  derivation: string;
  explanation: string;
  example: string;
}

const IdiomApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Idiom[]>([]);
  const [randomIdiom, setRandomIdiom] = useState<Idiom | null>(null);
  const [selectedIdiom, setSelectedIdiom] = useState<Idiom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbMode, setDbMode] = useState<'NEON' | 'NONE'>('NONE');

  const fetchRandom = useCallback(async () => {
    if (!sql) return;
    try {
      const data = await sql`SELECT * FROM idioms ORDER BY RANDOM() LIMIT 1`;
      if (data && data.length > 0) {
        setRandomIdiom(data[0] as unknown as Idiom);
        setDbMode('NEON');
      }
    } catch (e) {
      console.warn("Neon random fetch failed", e);
    }
  }, []);

  const search = useCallback(async (q: string) => {
    if (!sql || !q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const searchPattern = `%${q.trim()}%`;
      const data = await sql`
        SELECT * FROM idioms 
        WHERE word ILIKE ${searchPattern} 
           OR pinyin ILIKE ${searchPattern} 
           OR abbreviation ILIKE ${searchPattern}
        ORDER BY word ASC
        LIMIT 20
      `;
      setResults(data as unknown as Idiom[]);
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sql) {
      setDbMode('NEON');
      fetchRandom();
    }
  }, [fetchRandom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) search(query);
      else setResults([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, search]);

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col font-serif text-[#2c3e50] overflow-hidden select-none">
      {/* Texture Layer */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 bg-[url('https://www.transparenttextures.com/patterns/rice-paper.png')]"></div>

      <header className="h-16 md:h-20 bg-white/90 backdrop-blur-md border-b border-[#e0d7c6] flex items-center justify-between px-4 md:px-8 z-20 shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#c0392b] text-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <Feather className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div className="truncate">
            <h1 className="text-base md:text-2xl font-black tracking-tight text-[#2c3e50] truncate">成语大辞典</h1>
            <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-1">
              <Database size={10} /> {dbMode === 'NEON' ? '云端' : '脱机'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6 shrink-0">
           <div className="hidden sm:relative sm:group sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-2.5 bg-[#f3efe6] border border-[#e0d7c6] rounded-full text-sm focus:outline-none focus:border-[#c0392b] transition-all"
              />
           </div>
           <button onClick={onClose} className="p-2 md:p-3 bg-[#f3efe6] hover:bg-red-50 text-slate-500 rounded-full transition-all">
             <X size={18}/>
           </button>
        </div>
      </header>

      {/* Mobile Search - Only on mobile */}
      <div className="sm:hidden px-4 py-3 bg-white/50 border-b border-[#e0d7c6] z-10 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="搜索成语、拼音、首字母..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#f3efe6] border border-[#e0d7c6] rounded-xl text-sm focus:outline-none"
          />
          {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-[#c0392b]" />}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-10 relative z-10 pb-safe">
        <div className="max-w-5xl mx-auto">
          
          {!query && randomIdiom && (
            <section className="mb-8 md:mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="flex items-center gap-3 mb-4 md:mb-6">
                  <Sparkles size={16} className="text-[#c0392b]" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">每日雅趣 / DISCOVERY</h2>
               </div>
               
               <div 
                onClick={() => setSelectedIdiom(randomIdiom)}
                className="relative bg-white border border-[#e0d7c6] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
                    <ScrollText size={120} className="md:w-[200px] md:h-[200px]" />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
                     <div className="text-6xl md:text-9xl font-black text-[#2c3e50] tracking-tighter leading-none shrink-0" style={{ fontFamily: 'serif' }}>
                        {randomIdiom.word}
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="text-sm md:text-xl font-mono italic text-[#c0392b] mb-3 md:mb-4 tracking-widest">{randomIdiom.pinyin}</div>
                        <p className="text-base md:text-lg text-slate-500 leading-relaxed italic mb-6 md:mb-8 max-w-lg line-clamp-3 md:line-clamp-none">
                          “{randomIdiom.explanation}”
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                          <button className="px-6 py-2.5 bg-[#2c3e50] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors flex items-center gap-2">
                            研读详情 <ChevronRight size={12} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); fetchRandom(); }}
                            className="p-2.5 text-slate-300 hover:text-[#c0392b] transition-colors bg-[#f3efe6] rounded-full"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          )}

          {query && (
            <section className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <History size={16} className="text-slate-400" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">检索结果 ({results.length})</h2>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-20">
                  {results.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedIdiom(item)}
                      className="bg-white border border-[#e0d7c6] p-6 md:p-8 rounded-2xl md:rounded-3xl hover:border-[#c0392b] transition-all cursor-pointer group flex flex-col"
                    >
                       <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl md:text-4xl font-black text-[#2c3e50] group-hover:text-[#c0392b] transition-colors">{item.word}</h3>
                          <span className="text-[9px] font-mono text-slate-300 uppercase">{item.abbreviation}</span>
                       </div>
                       <div className="text-[10px] font-mono text-slate-400 italic mb-3 tracking-widest">{item.pinyin}</div>
                       <p className="text-xs md:text-sm text-slate-500 line-clamp-2 leading-relaxed border-l-2 border-[#f3efe6] pl-3 italic">
                         {item.explanation}
                       </p>
                    </div>
                  ))}
                  
                  {results.length === 0 && !isLoading && (
                    <div className="col-span-full py-16 text-center">
                       <Quote size={32} className="mx-auto text-[#f3efe6] mb-4" />
                       <p className="text-slate-400 font-bold tracking-widest uppercase text-xs italic">未能在古籍中寻得相关词条</p>
                       <button onClick={() => setQuery('')} className="mt-4 text-[10px] font-black text-[#c0392b] hover:underline uppercase tracking-widest">重置检索</button>
                    </div>
                  )}
               </div>
            </section>
          )}
        </div>
      </main>

      {/* Detail Modal - Mobile Responsive */}
      {selectedIdiom && (
        <div className="fixed inset-0 z-[100] bg-[#2c3e50]/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-300">
           <div 
            className="bg-[#FDFBF7] w-full max-w-3xl h-[90dvh] md:h-auto rounded-t-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden border-t md:border border-[#e0d7c6] flex flex-col"
            onClick={e => e.stopPropagation()}
           >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#c0392b] to-transparent opacity-40"></div>
              
              <div className="flex md:hidden justify-center py-4 shrink-0">
                 <div className="w-12 h-1 bg-[#e0d7c6] rounded-full" />
              </div>

              <button 
                onClick={() => setSelectedIdiom(null)}
                className="absolute top-4 right-4 md:top-8 md:right-10 p-2 md:p-3 bg-[#f3efe6] text-slate-500 rounded-full transition-all z-10"
              >
                <X size={18}/>
              </button>

              <div className="flex-1 overflow-y-auto no-scrollbar p-8 md:p-16">
                 <div className="flex flex-col md:flex-row items-baseline gap-4 md:gap-6 mb-8 md:mb-10 border-b border-[#e0d7c6] pb-8 md:pb-10 text-center md:text-left">
                    <h2 className="text-5xl md:text-7xl font-black text-[#2c3e50] tracking-tighter w-full md:w-auto">{selectedIdiom.word}</h2>
                    <span className="text-lg md:text-xl font-mono italic text-[#c0392b] tracking-widest w-full md:w-auto">{selectedIdiom.pinyin}</span>
                 </div>

                 <div className="space-y-8 md:space-y-10">
                    <section>
                       <div className="flex items-center gap-3 mb-3 md:mb-4">
                          <BookOpenCheck size={16} className="text-[#c0392b]" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">释义 / MEANING</h4>
                       </div>
                       <p className="text-lg md:text-xl text-[#2c3e50] leading-relaxed font-bold italic">
                          {selectedIdiom.explanation}
                       </p>
                    </section>

                    <section>
                       <div className="flex items-center gap-3 mb-3 md:mb-4">
                          <Languages size={16} className="text-[#c0392b]" />
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">出处 / DERIVATION</h4>
                       </div>
                       <div className="p-5 md:p-6 bg-[#f3efe6] border-l-4 border-[#c0392b] rounded-r-xl">
                          <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
                            {selectedIdiom.derivation || "载于古籍，流传至今。"}
                          </p>
                       </div>
                    </section>

                    {selectedIdiom.example && (
                      <section>
                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <Quote size={16} className="text-[#c0392b]" />
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">用例 / EXAMPLE</h4>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-light italic">
                           “{selectedIdiom.example}”
                        </p>
                      </section>
                    )}
                 </div>

                 <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-[#f3efe6] flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] text-slate-300 font-mono tracking-widest uppercase">
                    <span>ENTRY_ID: {selectedIdiom.id.toString().padStart(6, '0')}</span>
                    <button onClick={() => setSelectedIdiom(null)} className="w-full md:w-auto px-10 py-4 bg-[#2c3e50] text-white rounded-full font-black text-xs">研读完毕</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="h-10 bg-white/90 border-t border-[#e0d7c6] px-4 md:px-10 flex items-center justify-between z-20 text-[8px] md:text-[10px] font-bold tracking-widest text-slate-400 italic shrink-0">
        <div className="flex gap-4 md:gap-8 truncate">
           <span className="flex items-center gap-1.5 whitespace-nowrap">
             <span className="w-1 h-1 bg-[#c0392b] rounded-full animate-pulse"></span>
             文化脉络: 在线
           </span>
           <span className="uppercase tracking-[0.1em] hidden xs:inline">Classical Database Integrated</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
           <Bookmark size={10} /> 收藏: 0
        </div>
      </footer>
    </div>
  );
};

export default IdiomApp;
