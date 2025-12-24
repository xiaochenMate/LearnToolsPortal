
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

      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#e0d7c6] flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-[#c0392b] text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20 rotate-3">
            <Feather className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#2c3e50]">成语大辞典</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[10px] font-bold text-[#c0392b] uppercase tracking-widest">Idiom_Master v1.0</span>
               <div className="w-1 h-1 rounded-full bg-[#e0d7c6]"></div>
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-1">
                 <Database size={10} /> 链路状态: {dbMode === 'NEON' ? '云端直连' : '脱机模式'}
               </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="relative group w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索成语、拼音、首字母..." 
                value={query} 
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-3 bg-[#f3efe6] border border-[#e0d7c6] rounded-full text-sm focus:outline-none focus:border-[#c0392b] transition-all"
              />
              {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#c0392b]" />}
           </div>
           <button onClick={onClose} className="p-3 bg-[#f3efe6] hover:bg-red-50 text-slate-500 hover:text-[#c0392b] rounded-full transition-all">
             <X size={20}/>
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-10 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          {!query && randomIdiom && (
            <section className="mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
               <div className="flex items-center gap-3 mb-6">
                  <Sparkles size={18} className="text-[#c0392b]" />
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">每日雅趣 / Discovery</h2>
               </div>
               
               <div 
                onClick={() => setSelectedIdiom(randomIdiom)}
                className="relative bg-white border border-[#e0d7c6] rounded-[3rem] p-12 shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.04] group-hover:rotate-12 transition-transform duration-1000">
                    <ScrollText size={200} />
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                     <div className="text-8xl md:text-9xl font-black text-[#2c3e50] tracking-tighter leading-none" style={{ fontFamily: 'serif' }}>
                        {randomIdiom.word}
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="text-xl font-mono italic text-[#c0392b] mb-4 tracking-widest">{randomIdiom.pinyin}</div>
                        <p className="text-lg text-slate-500 leading-relaxed italic mb-8 max-w-lg">
                          “{randomIdiom.explanation}”
                        </p>
                        <button className="px-8 py-3 bg-[#2c3e50] text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#c0392b] transition-colors flex items-center gap-3 mx-auto md:mx-0">
                          研读详情 <ChevronRight size={14} />
                        </button>
                     </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); fetchRandom(); }}
                    className="absolute bottom-8 right-10 p-3 text-slate-300 hover:text-[#c0392b] transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
               </div>
            </section>
          )}

          {query && (
            <section className="animate-in fade-in duration-500">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <History size={18} className="text-slate-400" />
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">检索结果 / Search Results ({results.length})</h2>
                  </div>
                  <div className="text-[10px] text-slate-300 italic">按词、拼音、简称模糊检索</div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {results.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedIdiom(item)}
                      className="bg-white border border-[#e0d7c6] p-8 rounded-3xl hover:border-[#c0392b] hover:shadow-xl transition-all cursor-pointer group flex flex-col"
                    >
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="text-4xl font-black text-[#2c3e50] group-hover:text-[#c0392b] transition-colors">{item.word}</h3>
                          <span className="text-[10px] font-mono text-slate-300 uppercase">{item.abbreviation}</span>
                       </div>
                       <div className="text-xs font-mono text-slate-400 italic mb-4 tracking-widest">{item.pinyin}</div>
                       <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed border-l-2 border-[#f3efe6] pl-4 italic">
                         {item.explanation}
                       </p>
                    </div>
                  ))}
                  
                  {results.length === 0 && !isLoading && (
                    <div className="col-span-full py-24 text-center">
                       <Quote size={48} className="mx-auto text-[#f3efe6] mb-6" />
                       <p className="text-slate-400 font-bold tracking-widest uppercase text-sm italic">未能在古籍中寻得相关词条</p>
                       <button onClick={() => setQuery('')} className="mt-6 text-xs font-black text-[#c0392b] hover:underline uppercase tracking-widest">重置检索</button>
                    </div>
                  )}
               </div>
            </section>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedIdiom && (
        <div className="fixed inset-0 z-[100] bg-[#2c3e50]/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div 
            className="bg-[#FDFBF7] w-full max-w-3xl rounded-[3rem] shadow-2xl relative overflow-hidden border border-[#e0d7c6]"
            onClick={e => e.stopPropagation()}
           >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#c0392b] to-transparent opacity-30"></div>
              
              <button 
                onClick={() => setSelectedIdiom(null)}
                className="absolute top-8 right-10 p-3 bg-[#f3efe6] text-slate-500 hover:text-[#c0392b] rounded-full transition-all z-10"
              >
                <X size={20}/>
              </button>

              <div className="p-12 md:p-16">
                 <div className="flex flex-col md:flex-row items-baseline gap-6 mb-10 border-b border-[#e0d7c6] pb-10">
                    <h2 className="text-7xl font-black text-[#2c3e50] tracking-tighter">{selectedIdiom.word}</h2>
                    <span className="text-xl font-mono italic text-[#c0392b] tracking-widest">{selectedIdiom.pinyin}</span>
                 </div>

                 <div className="space-y-10">
                    <section>
                       <div className="flex items-center gap-3 mb-4">
                          <BookOpenCheck size={18} className="text-[#c0392b]" />
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">释义 / Meaning</h4>
                       </div>
                       <p className="text-xl text-[#2c3e50] leading-relaxed font-bold italic">
                          {selectedIdiom.explanation}
                       </p>
                    </section>

                    <section>
                       <div className="flex items-center gap-3 mb-4">
                          <Languages size={18} className="text-[#c0392b]" />
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">出处 / Derivation</h4>
                       </div>
                       <div className="p-6 bg-[#f3efe6] border-l-4 border-[#c0392b] rounded-r-2xl">
                          <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {selectedIdiom.derivation || "载于古籍，流传至今。"}
                          </p>
                       </div>
                    </section>

                    {selectedIdiom.example && (
                      <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Quote size={18} className="text-[#c0392b]" />
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest italic">用例 / Example</h4>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed font-light italic">
                           “{selectedIdiom.example}”
                        </p>
                      </section>
                    )}
                 </div>

                 <div className="mt-12 pt-8 border-t border-[#f3efe6] flex justify-between items-center text-[10px] text-slate-300 font-mono tracking-widest uppercase">
                    <span>Entry_ID: {selectedIdiom.id.toString().padStart(6, '0')}</span>
                    <button onClick={() => setSelectedIdiom(null)} className="px-10 py-4 bg-[#2c3e50] text-white rounded-full font-black hover:bg-[#c0392b] transition-all">研读完毕</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <footer className="h-12 bg-white/90 border-t border-[#e0d7c6] px-10 flex items-center justify-between z-20 text-[10px] font-bold tracking-widest text-slate-400 italic">
        <div className="flex gap-8">
           <span className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full animate-pulse"></span>
             文化脉络: 活跃中
           </span>
           <span className="uppercase tracking-[0.2em]">Classical Idioms Database Integrated</span>
        </div>
        <div className="flex items-center gap-2">
           <Bookmark size={12} /> 我的藏书: 0 条
        </div>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default IdiomApp;
