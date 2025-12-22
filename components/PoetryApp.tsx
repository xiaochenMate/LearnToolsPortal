
import React, { useState, useEffect, useCallback } from 'react';
import { X, RotateCcw, CheckCircle, Volume2, Award, ArrowRight, Play, Info, Sparkles } from 'lucide-react';

interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  lines: string[];
  meaning: string;
  image: string;
}

const POEMS: Poem[] = [
  {
    id: 'p1',
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    lines: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    meaning: '这首诗表达了诗人深夜看到明月时触发的浓浓思乡之情。',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80'
  },
  {
    id: 'p2',
    title: '咏鹅',
    author: '骆宾王',
    dynasty: '唐',
    lines: ['鹅鹅鹅', '曲项向天歌', '白毛浮绿水', '红掌拨清波'],
    meaning: '生动地描绘了鹅戏水时的优美姿态，色彩对比鲜明。',
    image: 'https://images.unsplash.com/photo-1549114848-372070371424?w=800&q=80'
  },
  {
    id: 'p3',
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    lines: ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'],
    meaning: '通过登楼远眺，表达了积极向上、追求更高境界的豪情。',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
  }
];

const PoetryApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);

  const poem = POEMS[currentIdx];

  const initPoem = useCallback((idx: number) => {
    const p = POEMS[idx];
    setLines([]);
    setShuffled([...p.lines].sort(() => Math.random() - 0.5));
    setIsSuccess(false);
  }, []);

  useEffect(() => {
    initPoem(currentIdx);
  }, [currentIdx, initPoem]);

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
    if (lines.join('') === poem.lines.join('')) {
      setIsSuccess(true);
      setScore(s => s + 1);
    } else {
      alert('顺序不对哦，再仔细思考一下！');
      // 重置到当前题目
      initPoem(currentIdx);
    }
  };

  const speakPoem = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`${poem.title}, ${poem.author}, ${poem.lines.join(', ')}`);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col font-serif">
      <header className="h-16 flex items-center justify-between px-8 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg"><Play className="w-4 h-4 text-amber-700" /></div>
          <h1 className="text-xl font-bold text-slate-800">古诗排序挑战</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-200">
            <Award size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-800">{score}</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"><X size={24}/></button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 lg:p-12 gap-10 max-w-7xl mx-auto w-full overflow-hidden">
        {/* 左侧：题库与状态 */}
        <aside className="lg:w-80 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Sparkles size={64}/></div>
            <h2 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 italic">Current Selection</h2>
            <div className="text-4xl font-bold mb-1">{poem.title}</div>
            <div className="text-slate-500 mb-6">{poem.dynasty} · {poem.author}</div>
            <div className="p-4 bg-slate-50 rounded-2xl text-sm leading-relaxed text-slate-600 italic border border-slate-100">
              {poem.meaning}
            </div>
          </div>

          <div className="mt-auto grid grid-cols-1 gap-2">
            <button onClick={() => setCurrentIdx((currentIdx + 1) % POEMS.length)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              换一首诗 <ArrowRight size={18}/>
            </button>
          </div>
        </aside>

        {/* 右侧：交互区 */}
        <div className="flex-1 flex flex-col gap-8 relative">
          {/* 排序槽位 */}
          <div className="flex-1 bg-white/50 border-4 border-dashed border-slate-100 rounded-[40px] p-8 flex flex-col justify-center items-center gap-4 transition-all overflow-y-auto">
            {lines.length === 0 && !isSuccess && <div className="text-slate-300 text-xl italic font-light">点击下方诗句进行排序...</div>}
            {lines.map((line, idx) => (
              <button 
                key={idx} 
                onClick={() => handleRemove(line)}
                className={`px-12 py-4 bg-white border-2 border-slate-100 rounded-2xl text-2xl font-bold shadow-sm hover:border-amber-400 hover:text-amber-600 transition-all animate-in slide-in-from-bottom-2 duration-300 ${isSuccess ? 'border-amber-500 bg-amber-50' : ''}`}
              >
                {line}
              </button>
            ))}
          </div>

          {/* 候选诗句 */}
          <div className="flex flex-wrap justify-center gap-4">
            {shuffled.map((line, idx) => (
              <button 
                key={idx} 
                onClick={() => handlePick(line)}
                className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-lg font-medium text-slate-600 hover:border-amber-500 hover:text-amber-700 shadow-sm active:scale-95 transition-all"
              >
                {line}
              </button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4">
            <button onClick={() => initPoem(currentIdx)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all">
              <RotateCcw size={18}/> 重置
            </button>
            <button 
              onClick={handleVerify}
              disabled={lines.length !== poem.lines.length}
              className={`px-12 py-3 rounded-xl font-black text-lg flex items-center gap-3 transition-all ${lines.length === poem.lines.length ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <CheckCircle size={20}/> 验证顺序
            </button>
          </div>

          {/* 成功图层 */}
          {isSuccess && (
            <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-md rounded-[40px] flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
               <div className="w-full h-48 rounded-3xl overflow-hidden mb-8 shadow-2xl">
                 <img src={poem.image} className="w-full h-full object-cover" alt="意境图" />
               </div>
               <div className="text-center mb-8">
                 <h3 className="text-2xl font-bold text-amber-700 mb-2">恭喜！完全正确</h3>
                 <p className="text-slate-500">感受这首诗的意境吧</p>
               </div>
               <div className="flex gap-4">
                 <button onClick={speakPoem} className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-blue-500/20"><Volume2 size={20}/> 朗读全诗</button>
                 <button onClick={() => setCurrentIdx((currentIdx + 1) % POEMS.length)} className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-amber-500/20">下一首诗 <ArrowRight size={20}/></button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PoetryApp;
