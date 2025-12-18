import React, { useState, useEffect, useCallback } from 'react';
import { X, Volume2, RotateCcw, Lightbulb, BookOpen, ChevronRight, Eraser, Info } from 'lucide-react';

// --- Types ---
interface CharacterDetail {
  candidate: string;
  result: string;
  pinyin: string;
  meaning: string;
  examples: string[];
}

interface QuestionSet {
  id: number;
  radical: string;
  radicalName: string;
  radicalPinyin: string;
  meaningHint: string;
  options: string[];
  results: Record<string, CharacterDetail>;
}

// --- Question Bank ---
const QUESTIONS: QuestionSet[] = [
  {
    id: 1, radical: '氵', radicalName: '三点水', radicalPinyin: 'sān diǎn shuǐ', meaningHint: '常与水、液体有关',
    options: ['工', '羊', '青'],
    results: {
      '工': { candidate: '工', result: '江', pinyin: 'jiāng', meaning: '江河，大河的通称。', examples: ['江河', '长江'] },
      '羊': { candidate: '羊', result: '洋', pinyin: 'yáng', meaning: '比海更大的水域，宏大。', examples: ['海洋', '洋流'] },
      '青': { candidate: '青', result: '清', pinyin: 'qīng', meaning: '纯净透明，没有杂质。', examples: ['清水', '清洁'] }
    }
  },
  {
    id: 2, radical: '口', radicalName: '口字旁', radicalPinyin: 'kǒu zì páng', meaningHint: '常与嘴巴、呼喊有关',
    options: ['丁', '马', '巴'],
    results: {
      '丁': { candidate: '丁', result: '叮', pinyin: 'dīng', meaning: '再三嘱咐，或模拟金属撞击声。', examples: ['叮当', '叮嘱'] },
      '马': { candidate: '马', result: '吗', pinyin: 'ma', meaning: '疑问助词，用在句末。', examples: ['好吗', '你好吗'] },
      '巴': { candidate: '巴', result: '吧', pinyin: 'ba', meaning: '语气助词，表示商量、提议。', examples: ['走吧', '好吧'] }
    }
  },
  {
    id: 3, radical: '女', radicalName: '女字旁', radicalPinyin: 'nǚ zì páng', meaningHint: '常与女性或身份有关',
    options: ['子', '马', '也'],
    results: {
      '子': { candidate: '子', result: '好', pinyin: 'hǎo', meaning: '优点多，使人满意。', examples: ['友好', '好学'] },
      '马': { candidate: '马', result: '妈', pinyin: 'mā', meaning: '对母亲的称呼。', examples: ['妈妈', '母亲'] },
      '也': { candidate: '也', result: '她', pinyin: 'tā', meaning: '用于女性的代词。', examples: ['她们', '她的'] }
    }
  },
  {
    id: 4, radical: '忄', radicalName: '竖心旁', radicalPinyin: 'shù xīn páng', meaningHint: '常与心情、情感有关',
    options: ['青', '白', '少'],
    results: {
      '青': { candidate: '青', result: '情', pinyin: 'qíng', meaning: '外界刺激引起的心理状态。', examples: ['感情', '情绪'] },
      '白': { candidate: '白', result: '怕', pinyin: 'pà', meaning: '心中恐惧，畏惧。', examples: ['害怕', '恐怕'] },
      '少': { candidate: '少', result: '忙', pinyin: 'máng', meaning: '事情多，没时间休息。', examples: ['忙碌', '繁忙'] }
    }
  },
  {
    id: 5, radical: '扌', radicalName: '提手旁', radicalPinyin: 'tí shǒu páng', meaningHint: '常与动作、手部有关',
    options: ['丁', '斤', '合'],
    results: {
      '丁': { candidate: '丁', result: '打', pinyin: 'dǎ', meaning: '击，敲击，击中。', examples: ['打球', '打字'] },
      '斤': { candidate: '斤', result: '折', pinyin: 'zhé', meaning: '弄断，或者打折扣。', examples: ['折叠', '打折'] },
      '合': { candidate: '合', result: '拾', pinyin: 'shí', meaning: '拿起，从地上捡。', examples: ['拾起', '收拾'] }
    }
  },
  {
    id: 6, radical: '讠', radicalName: '言字旁', radicalPinyin: 'yán zì páng', meaningHint: '常与说话、语言有关',
    options: ['人', '午', '青'],
    results: {
      '人': { candidate: '人', result: '认', pinyin: 'rèn', meaning: '辨别，认可。', examples: ['认识', '确认'] },
      '午': { candidate: '午', result: '许', pinyin: 'xǔ', meaning: '应允，许可，或者也许。', examples: ['许可', '也许'] },
      '青': { candidate: '青', result: '请', pinyin: 'qǐng', meaning: '礼貌请求，邀请。', examples: ['请问', '邀请'] }
    }
  },
  {
    id: 7, radical: '木', radicalName: '木字旁', radicalPinyin: 'mù zì páng', meaningHint: '常与树木、植物有关',
    options: ['子', '目', '寸'],
    results: {
      '子': { candidate: '子', result: '李', pinyin: 'lǐ', meaning: '一种落叶小乔木及其果实。', examples: ['李子', '李先生'] },
      '目': { candidate: '目', result: '相', pinyin: 'xiāng', meaning: '交互，互相，或者容貌。', examples: ['相同', '相片'] },
      '寸': { candidate: '寸', result: '村', pinyin: 'cūn', meaning: '乡下聚居的地方。', examples: ['村庄', '农村'] }
    }
  },
  {
    id: 8, radical: '钅', radicalName: '金字旁', radicalPinyin: 'jīn zì páng', meaningHint: '常与金属、器具有关',
    options: ['今', '少', '中'],
    results: {
      '今': { candidate: '今', result: '钦', pinyin: 'qīn', meaning: '指帝王，也表示敬佩。', examples: ['钦佩', '钦点'] },
      '少': { candidate: '少', result: '钞', pinyin: 'chāo', meaning: '纸币，货币。', examples: ['纸钞', '钞票'] },
      '中': { candidate: '中', result: '钟', pinyin: 'zhōng', meaning: '计时的仪器。', examples: ['时钟', '钟表'] }
    }
  },
  {
    id: 9, radical: '亻', radicalName: '单人旁', radicalPinyin: 'dān rén páng', meaningHint: '常与人、行为有关',
    options: ['可', '主', '言'],
    results: {
      '可': { candidate: '可', result: '何', pinyin: 'hé', meaning: '疑问代词，什么，为什么。', examples: ['为何', '如何'] },
      '主': { candidate: '主', result: '住', pinyin: 'zhù', meaning: '长期居留，停止。', examples: ['居住', '住在'] },
      '言': { candidate: '言', result: '信', pinyin: 'xìn', meaning: '诚实，信息，函件。', examples: ['写信', '相信'] }
    }
  },
  {
    id: 10, radical: '辶', radicalName: '走之旁', radicalPinyin: 'zǒu zhī páng', meaningHint: '常与行走、道路有关',
    options: ['斤', '寸', '文'],
    results: {
      '斤': { candidate: '斤', result: '近', pinyin: 'jìn', meaning: '距离短。', examples: ['接近', '靠近'] },
      '寸': { candidate: '寸', result: '过', pinyin: 'guò', meaning: '经过，走过。', examples: ['经过', '过河'] },
      '文': { candidate: '文', result: '这', pinyin: 'zhè', meaning: '指示代词，代指近处。', examples: ['这个', '这边'] }
    }
  }
];

const CharacterApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [hintedIndex, setHintedIndex] = useState<number | null>(null);

  const question = QUESTIONS[currentIdx];

  const handleNext = () => {
    let next;
    do {
      next = Math.floor(Math.random() * QUESTIONS.length);
    } while (next === currentIdx);
    setCurrentIdx(next);
    setSelection(null);
    setIsSuccess(false);
    setHintedIndex(null);
  };

  const handleClear = () => {
    setSelection(null);
    setIsSuccess(false);
    setHintedIndex(null);
  };

  const handleCompose = (char: string) => {
    setSelection(char);
    if (question.results[char]) {
      setIsSuccess(true);
      setHintedIndex(null);
    } else {
      setIsSuccess(false);
    }
  };

  const playTTS = (text: string, pinyin: string) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`${text}, ${pinyin}`);
      msg.lang = 'zh-CN';
      msg.rate = 0.8;
      window.speechSynthesis.speak(msg);
    }
  };

  const handleHint = () => {
    const validKeys = Object.keys(question.results);
    if (validKeys.length > 0) {
      const randomKey = validKeys[Math.floor(Math.random() * validKeys.length)];
      const idx = question.options.indexOf(randomKey);
      setHintedIndex(idx);
      setSelection(randomKey);
    }
  };

  // Drag and Drop
  const onDragStart = (e: React.DragEvent, char: string) => {
    e.dataTransfer.setData('text/plain', char);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const char = e.dataTransfer.getData('text/plain');
    if (char) handleCompose(char);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] pb-12 font-sans selection:bg-[#2E7D32]/20">
      
      {/* Header Container */}
      <header className="max-w-[1120px] mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-4">
           <div>
             <h1 className="text-3xl font-bold text-[#1F2937] mb-2 tracking-tight">偏旁部首拼汉字</h1>
             <p className="text-slate-500 max-w-2xl text-base leading-relaxed">
               汉字由偏旁部首和其他部件组成，认识常见部件有助于识字与书写。通过组合偏旁来解锁新汉字吧！
             </p>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-colors shadow-sm">
             <X className="w-6 h-6 text-slate-400" />
           </button>
        </div>
      </header>

      <main className="max-w-[1120px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Left Side: Radical Info */}
        <section className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100 flex flex-col items-center h-full">
            <span className="text-xs font-bold text-[#2E7D32] uppercase tracking-[0.2em] mb-4">当前偏旁</span>
            <div className="w-32 h-32 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-center text-7xl font-bold text-[#2E7D32] mb-6 shadow-inner">
              {question.radical}
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-1">{question.radicalName}</h2>
              <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">{question.radicalPinyin}</p>
              <p className="mt-4 text-sm text-slate-500 italic bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{question.meaningHint}</p>
            </div>
            <button 
              onClick={handleNext}
              className="mt-auto w-full py-4 bg-white border-2 border-[#2E7D32] text-[#2E7D32] font-bold rounded-xl hover:bg-[#2E7D32] hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              更换一题
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>

        {/* Right Side: Composer & Candidates */}
        <section className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Action Bar */}
          <div className="flex justify-end gap-3 mb-2">
            <ActionButton icon={<Eraser className="w-4 h-4" />} label="清除" onClick={handleClear} />
            <ActionButton icon={<Lightbulb className="w-4 h-4" />} label="提示" onClick={handleHint} />
            <ActionButton icon={<BookOpen className="w-4 h-4" />} label="查看字库" onClick={() => setShowLibrary(true)} />
          </div>

          {/* Composition Zone */}
          <div 
            onDragOver={onDragOver}
            onDrop={onDrop}
            className={`
              bg-white rounded-2xl border-2 border-dashed h-64 flex items-center justify-center transition-all duration-500
              ${isSuccess ? 'border-[#2E7D32] bg-[#F0FDF4] shadow-[0_0_40px_rgba(46,125,50,0.1)]' : 'border-slate-200'}
            `}
          >
            <div className="flex items-center text-8xl font-bold tracking-tighter">
              <span className="text-slate-300 mr-2">{question.radical}</span>
              <span className="text-[#0EA5E9]">+</span>
              <div className="min-w-[120px] ml-2 flex items-center justify-center border-b-4 border-slate-100 pb-2">
                 {selection ? (
                   <span className={`animate-in fade-in zoom-in duration-300 ${isSuccess ? 'text-[#2E7D32]' : 'text-[#0EA5E9]'}`}>
                    {selection}
                   </span>
                 ) : (
                   <div className="w-16 h-1 bg-slate-100 rounded-full animate-pulse"></div>
                 )}
              </div>
            </div>
          </div>

          {/* Candidates */}
          <div className="grid grid-cols-3 gap-6">
            {question.options.map((char, i) => (
              <button
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, char)}
                onClick={() => handleCompose(char)}
                className={`
                  relative h-32 bg-white rounded-xl shadow-sm border-2 text-4xl font-bold transition-all duration-300
                  ${selection === char 
                    ? (isSuccess ? 'border-[#2E7D32] text-[#2E7D32] scale-105 shadow-md' : 'border-[#0EA5E9] text-[#0EA5E9] scale-105') 
                    : 'border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50'
                  }
                  ${hintedIndex === i ? 'ring-4 ring-yellow-400/30' : ''}
                `}
              >
                {char}
                {hintedIndex === i && <span className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 text-white rounded-full flex items-center justify-center text-xs animate-bounce shadow-sm"><Lightbulb className="w-4 h-4" /></span>}
              </button>
            ))}
          </div>

        </section>
      </main>

      {/* Learning Zone Footer */}
      <footer className="max-w-[1120px] mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-100">
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             <BookOpen className="w-6 h-6 text-[#2E7D32]" />
             识字小课堂
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-[#2E7D32] mb-3">常用偏旁说明</h4>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2"><strong>氵</strong> 三点水：常与水、海洋、洗涤或液体有关。</li>
                  <li className="flex gap-2"><strong>讠</strong> 言字旁：常与说话、语言、礼貌或思维有关。</li>
                  <li className="flex gap-2"><strong>扌</strong> 提手旁：常与手部动作、力气或操作有关。</li>
                  <li className="flex gap-2"><strong>女</strong> 女字旁：常与女性、亲属或称呼有关。</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-[#2E7D32] mb-3">汉字结构简述</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <StructureBox label="左右结构" example="江" />
                  <StructureBox label="上下结构" example="李" />
                  <StructureBox label="半包围" example="这" />
                  <StructureBox label="全包围" example="国" />
                  <StructureBox label="品字结构" example="森" />
                  <StructureBox label="独体字" example="人" />
                </div>
              </div>
           </div>
        </div>
      </footer>

      {/* Success Modal */}
      {isSuccess && selection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="h-2 bg-[#2E7D32] w-full"></div>
            <div className="p-8 text-center relative">
              <button onClick={() => setIsSuccess(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="mb-6">
                <div className="text-8xl font-bold text-[#2E7D32] mb-4">
                  {question.results[selection].result}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl text-slate-400 font-mono tracking-widest">{question.results[selection].pinyin}</span>
                  <button 
                    onClick={() => playTTS(question.results[selection].result, question.results[selection].pinyin)}
                    className="p-2 text-[#0EA5E9] hover:bg-[#0EA5E9]/10 rounded-full transition-colors"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left mb-8">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">基本释义</h4>
                 <p className="text-slate-700 leading-relaxed mb-4">{question.results[selection].meaning}</p>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">常用词组</h4>
                 <div className="flex gap-2">
                   {question.results[selection].examples.map(ex => (
                     <span key={ex} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium text-[#2E7D32]">{ex}</span>
                   ))}
                 </div>
              </div>

              <button 
                onClick={handleNext}
                className="w-full py-4 bg-[#2E7D32] text-white font-bold rounded-xl shadow-lg shadow-[#2E7D32]/20 hover:bg-[#25632d] transition-all"
              >
                继续下一题
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5" /> 汉字组合字库</h2>
                <button onClick={() => setShowLibrary(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-0 overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-100 sticky top-0 z-10">
                     <tr>
                        <th className="p-4 font-bold text-xs uppercase text-slate-500">偏旁</th>
                        <th className="p-4 font-bold text-xs uppercase text-slate-500">右侧汉字</th>
                        <th className="p-4 font-bold text-xs uppercase text-slate-500">合成汉字</th>
                        <th className="p-4 font-bold text-xs uppercase text-slate-500">拼音</th>
                        <th className="p-4 font-bold text-xs uppercase text-slate-500">释义与词组</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                      {QUESTIONS.flatMap(q => Object.values(q.results)).map((item, idx) => {
                        const q = QUESTIONS.find(qu => qu.results[item.candidate]);
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-4 text-2xl font-bold text-[#2E7D32]">{q?.radical}</td>
                            <td className="p-4 text-xl text-slate-700">{item.candidate}</td>
                            <td className="p-4 text-3xl font-bold text-[#2E7D32]">{item.result}</td>
                            <td className="p-4 font-mono text-slate-400">{item.pinyin}</td>
                            <td className="p-4">
                               <p className="text-sm text-slate-600 mb-1">{item.meaning}</p>
                               <div className="flex gap-1">
                                 {item.examples.map(ex => <span key={ex} className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">{ex}</span>)}
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
  >
    {icon}
    {label}
  </button>
);

const StructureBox = ({ label, example }: { label: string, example: string }) => (
  <div className="bg-slate-50 p-2 rounded border border-slate-100">
    <div className="text-xs text-slate-400 mb-1">{label}</div>
    <div className="text-xl font-bold text-slate-700">{example}</div>
  </div>
);

export default CharacterApp;