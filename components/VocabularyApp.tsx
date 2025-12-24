
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, GraduationCap, ChevronRight, BookOpen, 
  CheckCircle2, AlertCircle, RotateCcw, 
  BrainCircuit, TrendingUp, Award,
  Volume2, Eye, EyeOff, Loader2, Sparkles,
  Info, Database
} from 'lucide-react';
import sql from '../lib/neon';

interface Word {
  id: number;
  word: string;
  phonetic: string;
  definition: string;
  example_sentence: string;
  category_id: number;
  status?: 'New' | 'Learning' | 'Mastered';
}

interface Category {
  id: number;
  name: string;
  label: string;
}

const FALLBACK_WORDS: Record<string, Word[]> = {
  'ielts': [
    { id: 901, word: 'Envisage', phonetic: '/ɪnˈvɪz.ɪdʒ/', definition: '想象，设想', example_sentence: 'It\'s hard to envisage how it might happen.', category_id: 8 },
    { id: 902, word: 'Pragmatic', phonetic: '/præɡˈmæt.ɪk/', definition: '务实的，重实效的', example_sentence: 'A pragmatic approach to management.', category_id: 8 },
    { id: 903, word: 'Mitigate', phonetic: '/ˈmɪt.ɪ.ɡeɪt/', definition: '缓和，减轻', example_sentence: 'Drainage schemes have helped to mitigate this problem.', category_id: 8 }
  ],
  'primary': [
    { id: 101, word: 'Apple', phonetic: '/ˈæp.əl/', definition: '苹果', example_sentence: 'I like eating apples.', category_id: 1 },
    { id: 102, word: 'School', phonetic: '/skuːl/', definition: '学校', example_sentence: 'The kids are at school.', category_id: 1 }
  ]
};

const VocabularyApp: React.FC<{ onClose: () => void, userEmail?: string }> = ({ onClose, userEmail }) => {
  const [view, setView] = useState<'selection' | 'learning' | 'complete'>('selection');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbMode, setDbMode] = useState<'NEON' | 'LOCAL'>('LOCAL');

  // Load Categories
  useEffect(() => {
    const init = async () => {
      if (sql) {
        try {
          const data = await sql`SELECT * FROM vocab_categories ORDER BY id ASC`;
          setCategories(data as any);
          setDbMode('NEON');
        } catch (e) {
          console.warn("Neon failed, using local categories");
          setCategories([
            { id: 1, name: 'primary', label: '小学英语' },
            { id: 4, name: 'cet4', label: '四级核心' },
            { id: 8, name: 'ielts', label: '雅思高频' }
          ]);
        }
      }
    };
    init();
  }, []);

  const startLearning = async (cat: Category) => {
    setIsLoading(true);
    setSelectedCat(cat);
    if (sql) {
      try {
        // Simple logic: Fetch words in category. If logged in, join with progress.
        const data = userEmail 
          ? await sql`
              SELECT w.*, p.status 
              FROM vocab_words w 
              LEFT JOIN vocab_progress p ON w.id = p.word_id AND p.user_email = ${userEmail}
              WHERE w.category_id = ${cat.id}
              ORDER BY COALESCE(p.next_review_date, '1970-01-01') ASC
              LIMIT 15
            `
          : await sql`SELECT * FROM vocab_words WHERE category_id = ${cat.id} LIMIT 10`;
        
        if (data && data.length > 0) {
          setWords(data as any);
        } else {
          setWords(FALLBACK_WORDS[cat.name] || FALLBACK_WORDS['ielts']);
        }
      } catch (e) {
        setWords(FALLBACK_WORDS[cat.name] || FALLBACK_WORDS['ielts']);
      }
    } else {
      setWords(FALLBACK_WORDS[cat.name] || FALLBACK_WORDS['ielts']);
    }
    setCurrentIndex(0);
    setIsRevealed(false);
    setView('learning');
    setIsLoading(false);
  };

  const handleResponse = async (known: boolean) => {
    const word = words[currentIndex];
    if (userEmail && sql) {
      try {
        const nextDate = known 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
          : new Date(Date.now() + 60 * 60 * 1000);    // 1 hour later
        
        const status = known ? 'Learning' : 'New';

        await sql`
          INSERT INTO vocab_progress (user_email, word_id, status, next_review_date, correct_count)
          VALUES (${userEmail}, ${word.id}, ${status}, ${nextDate}, ${known ? 1 : 0})
          ON CONFLICT (user_email, word_id) DO UPDATE SET
            status = CASE WHEN ${known} THEN 'Learning' ELSE 'New' END,
            next_review_date = ${nextDate},
            correct_count = vocab_progress.correct_count + ${known ? 1 : 0}
        `;
      } catch (e) { console.error("Update failed", e); }
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsRevealed(false);
    } else {
      setView('complete');
    }
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'en-US';
      window.speechSynthesis.speak(msg);
    }
  };

  const currentWord = words[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col font-sans text-slate-200 overflow-hidden">
      <header className="h-16 bg-slate-900/95 border-b border-blue-500/20 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tech-font text-white italic tracking-tighter">LINGO_FLOW v1.0</h1>
            <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
              <Database size={10} /> 系统源: {dbMode} {userEmail ? `| 已同步: ${userEmail}` : '| 游客模式'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-full text-slate-500 hover:text-red-500 transition-all"><X size={24}/></button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px]"></div>

        {view === 'selection' && (
          <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-12">
               <h2 className="text-4xl font-black text-white tech-font mb-4 uppercase tracking-tighter italic">选择你的学习航线</h2>
               <p className="text-slate-500 font-medium italic">精准匹配不同难度，开启高效词汇增量</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => startLearning(cat)}
                  className="group relative h-32 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500 hover:bg-blue-500/5 transition-all"
                >
                  <BookOpen className="text-slate-700 group-hover:text-blue-500 transition-colors" size={24} />
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">{cat.name}</div>
                    <div className="text-lg font-bold text-white">{cat.label}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-12 bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl flex items-center gap-6">
               <div className="p-4 bg-blue-600/10 rounded-2xl"><TrendingUp className="text-blue-400" /></div>
               <div>
                  <h4 className="text-sm font-black text-blue-400 uppercase tracking-widest mb-1">间隔复习算法 (SRS)</h4>
                  <p className="text-xs text-slate-400 leading-relaxed italic">系统会自动分析你的记忆曲线。对于“不认识”的单词，1小时后将再次出现；对于“认识”的单词，复习周期将延长。科学复习，终生不忘。</p>
               </div>
            </div>
          </div>
        )}

        {view === 'learning' && currentWord && (
          <div className="w-full max-w-xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8 px-4">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">学习进度: {currentIndex + 1} / {words.length}</div>
               <div className="flex gap-1">
                  {words.map((_, i) => (
                    <div key={i} className={`h-1 w-6 rounded-full transition-all ${i === currentIndex ? 'bg-blue-500' : i < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                  ))}
               </div>
            </div>

            <div 
              className={`w-full aspect-[4/3] relative perspective-1000 group cursor-pointer transition-all duration-700 ${isRevealed ? 'rotate-y-180' : ''}`}
              onClick={() => { setIsRevealed(!isRevealed); speakWord(currentWord.word); }}
            >
               {/* Card Front */}
               <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-slate-800 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-12 group-hover:border-blue-500/50 transition-colors">
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                    <Sparkles size={12} /> Target_Word
                  </div>
                  <h3 className="text-6xl font-black text-white italic tracking-tighter mb-4">{currentWord.word}</h3>
                  <div className="text-slate-500 font-mono italic text-lg">{currentWord.phonetic}</div>
                  <div className="mt-12 text-slate-600 text-xs font-black uppercase tracking-[0.2em] animate-pulse">点击翻转释义</div>
               </div>

               {/* Card Back */}
               <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border-2 border-blue-500 rounded-[3rem] shadow-2xl flex flex-col p-10">
                  <div className="flex justify-between items-start mb-6">
                    <button onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word); }} className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 hover:bg-blue-500 hover:text-white transition-all"><Volume2 size={20}/></button>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{currentWord.word}</div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="text-2xl font-black text-white mb-6 border-l-4 border-blue-500 pl-4">{currentWord.definition}</div>
                    <div className="space-y-3">
                       <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">经典例句</div>
                       <p className="text-lg text-slate-300 italic leading-relaxed font-serif">"{currentWord.example_sentence}"</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                     <span className="text-[9px] font-bold text-slate-500 uppercase italic">ID: W_{currentWord.id.toString().padStart(4, '0')}</span>
                     <span className="text-[9px] font-bold text-emerald-500 uppercase italic flex items-center gap-1"><CheckCircle2 size={10}/> 数据已加密</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-10">
               <button 
                onClick={() => handleResponse(false)}
                className="py-5 bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-500 border border-slate-700 hover:border-red-500/30 rounded-3xl transition-all flex flex-col items-center gap-1 group"
               >
                  <AlertCircle size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">陌生 / 错题</span>
               </button>
               <button 
                onClick={() => handleResponse(true)}
                className="py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl transition-all shadow-xl shadow-blue-600/20 flex flex-col items-center gap-1 group"
               >
                  <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">认识 / 记住了</span>
               </button>
            </div>
          </div>
        )}

        {view === 'complete' && (
          <div className="text-center animate-in fade-in zoom-in duration-700">
             <div className="w-32 h-32 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <Award size={64} className="text-emerald-500" />
             </div>
             <h2 className="text-5xl font-black text-white tech-font mb-4 uppercase tracking-tighter italic">航程阶段达成</h2>
             <p className="text-slate-500 font-medium italic mb-12">你已完成本次词汇流同步。大脑突触正在建立新的连接。</p>
             
             <div className="flex gap-4 justify-center">
                <button onClick={() => setView('selection')} className="px-10 py-5 bg-white text-black font-black text-lg rounded-[2rem] flex items-center gap-3 hover:bg-emerald-400 transition-all shadow-xl">
                   <RotateCcw size={20}/> 切换其他航线
                </button>
                <button onClick={onClose} className="px-10 py-5 bg-slate-800 text-white font-black text-lg rounded-[2rem] border border-slate-700 hover:bg-slate-700 transition-all">
                   完成训练
                </button>
             </div>
          </div>
        )}
      </main>

      <footer className="h-10 bg-slate-950 border-t border-slate-900 px-8 flex items-center justify-between z-20">
         <div className="flex gap-10">
           <span className="text-[9px] font-mono text-blue-500/50 flex items-center gap-2 italic tracking-[0.2em]">
             <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
             认知引擎: 活动中
           </span>
           <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest italic flex items-center gap-2">
             <BrainCircuit size={10} /> 神经突触模拟模式
           </span>
         </div>
         <div className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.4em] flex items-center gap-3 italic">
           <Info size={10} /> 安全通讯链路已建立
         </div>
      </footer>

      <style>{`
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .perspective-1000 { perspective: 1000px; }
        .tech-font { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );
};

export default VocabularyApp;
