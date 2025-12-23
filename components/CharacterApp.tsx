
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, Volume2, RotateCcw, Lightbulb, BookOpen, ChevronRight, 
  Info, Sparkles, Search, Languages, Trophy, BarChart3, Star, Target,
  LayoutGrid, Book, Filter, ChevronDown, Award, SearchCode, Bookmark
} from 'lucide-react';

// --- 类型定义 ---
interface CharacterDetail {
  candidate: string; 
  result: string;    
  pinyin: string;    
  meaning: string;   
  examples: string[]; 
}

interface RadicalGroup {
  radical: string;
  name: string;
  pinyin: string;
  hint: string;
  level: '启蒙' | '进阶' | '挑战';
  characters: CharacterDetail[];
}

// --- 核心海量字库数据 (大幅扩充) ---
const CHARACTER_DICTIONARY: RadicalGroup[] = [
  {
    radical: '氵', name: '三点水', pinyin: 'sān diǎn shuǐ', level: '启蒙', hint: '通常与液体、河流、水的状态有关。',
    characters: [
      { candidate: '工', result: '江', pinyin: 'jiāng', meaning: '大河的通称。', examples: ['长江', '江苏'] },
      { candidate: '羊', result: '洋', pinyin: 'yáng', meaning: '广大的海域。', examples: ['海洋', '远洋'] },
      { candidate: '青', result: '清', pinyin: 'qīng', meaning: '纯净透明，无杂质。', examples: ['清水', '清晨'] },
      { candidate: '可', result: '河', pinyin: 'hé', meaning: '水道，天然的流水。', examples: ['河边', '小河'] },
      { candidate: '每', result: '海', pinyin: 'hǎi', meaning: '靠近陆地的广阔水域。', examples: ['大海', '上海'] },
      { candidate: '去', result: '法', pinyin: 'fǎ', meaning: '规则，规范。', examples: ['法律', '方法'] },
      { candidate: '也', result: '池', pinyin: 'chí', meaning: '蓄水的坑。', examples: ['池塘', '电池'] },
      { candidate: '台', result: '治', pinyin: 'zhì', meaning: '管理，整理。', examples: ['治理', '治病'] }
    ]
  },
  {
    radical: '亻', name: '单人旁', pinyin: 'dān rén páng', level: '启蒙', hint: '与人的身份、动作或状态有关。',
    characters: [
      { candidate: '主', result: '住', pinyin: 'zhù', meaning: '长期居留。', examples: ['居住', '住房'] },
      { candidate: '言', result: '信', pinyin: 'xìn', meaning: '诚实，或者书信。', examples: ['相信', '写信'] },
      { candidate: '也', result: '他', pinyin: 'tā', meaning: '称男性或第三方。', examples: ['他们', '他的'] },
      { candidate: '尔', result: '你', pinyin: 'nǐ', meaning: '称对方。', examples: ['你好', '你们'] },
      { candidate: '可', result: '何', pinyin: 'hé', meaning: '疑问代词，什么。', examples: ['如何', '几何'] },
      { candidate: '乍', result: '作', pinyin: 'zuò', meaning: '进行工作或活动。', examples: ['作业', '作为'] },
      { candidate: '本', result: '体', pinyin: 'tǐ', meaning: '人或动物的全身。', examples: ['身体', '体育'] },
      { candidate: '门', result: '们', pinyin: 'men', meaning: '表示人称复数。', examples: ['我们', '同学们'] }
    ]
  },
  {
    radical: '艹', name: '草字头', pinyin: 'cǎo zì tóu', level: '启蒙', hint: '通常与花、草、药等植物有关。',
    characters: [
      { candidate: '化', result: '花', pinyin: 'huā', meaning: '植物的繁殖器官。', examples: ['鲜花', '花园'] },
      { candidate: '早', result: '草', pinyin: 'cǎo', meaning: '草本植物的总称。', examples: ['小草', '草坪'] },
      { candidate: '约', result: '药', pinyin: 'yào', meaning: '治病的东西。', examples: ['吃药', '中药'] },
      { candidate: '节', result: '节', pinyin: 'jié', meaning: '段落，时令。', examples: ['节日', '季节'] },
      { candidate: '苗', result: '苗', pinyin: 'miáo', meaning: '植物的幼苗。', examples: ['树苗', '禾苗'] },
      { candidate: '英', result: '英', pinyin: 'yīng', meaning: '卓越的，花。', examples: ['英雄', '英语'] },
      { candidate: '苦', result: '苦', pinyin: 'kǔ', meaning: '像胆汁的味道。', examples: ['辛苦', '苦瓜'] }
    ]
  },
  {
    radical: '木', name: '木字旁', pinyin: 'mù zì páng', level: '启蒙', hint: '与树木、木材、建筑有关。',
    characters: [
      { candidate: '子', result: '李', pinyin: 'lǐ', meaning: '姓氏，或果实名。', examples: ['李子', '行李'] },
      { candidate: '寸', result: '村', pinyin: 'cūn', meaning: '乡下，农村。', examples: ['乡村', '村庄'] },
      { candidate: '几', result: '机', pinyin: 'jī', meaning: '机器，机会。', examples: ['手机', '飞机'] },
      { candidate: '对', result: '树', pinyin: 'shù', meaning: '木本植物的总称。', examples: ['大树', '树林'] },
      { candidate: '支', result: '枝', pinyin: 'zhī', meaning: '树木的分支。', examples: ['树枝', '柳枝'] },
      { candidate: '反', result: '板', pinyin: 'bǎn', meaning: '片状的木材。', examples: ['木板', '板凳'] }
    ]
  },
  {
    radical: '扌', name: '提手旁', pinyin: 'tí shǒu páng', level: '进阶', hint: '与手的动作、力量、操作有关。',
    characters: [
      { candidate: '丁', result: '打', pinyin: 'dǎ', meaning: '击，敲击。', examples: ['打球', '打字'] },
      { candidate: '戈', result: '找', pinyin: 'zhǎo', meaning: '寻找。', examples: ['寻找', '找到'] },
      { candidate: '白', result: '拍', pinyin: 'pāi', meaning: '用手掌打。', examples: ['拍手', '拍照'] },
      { candidate: '立', result: '拉', pinyin: 'lā', meaning: '牵引。', examples: ['拉车', '拉链'] },
      { candidate: '合', result: '拾', pinyin: 'shí', meaning: '捡起，整理。', examples: ['拾起', '收拾'] },
      { candidate: '巴', result: '把', pinyin: 'bǎ', meaning: '抓握，量词。', examples: ['把握', '火把'] }
    ]
  },
  {
    radical: '讠', name: '言字旁', pinyin: 'yán zì páng', level: '进阶', hint: '与言语、说话、思维、文字有关。',
    characters: [
      { candidate: '吾', result: '语', pinyin: 'yǔ', meaning: '说话，言辞。', examples: ['语言', '语文'] },
      { candidate: '兑', result: '说', pinyin: 'shuō', meaning: '用话表达。', examples: ['说话', '说明'] },
      { candidate: '卖', result: '读', pinyin: 'dú', meaning: '看书，诵读。', examples: ['读书', '朗读'] },
      { candidate: '成', result: '诚', pinyin: 'chéng', meaning: '真心。', examples: ['诚实', '诚心'] },
      { candidate: '课', result: '课', pinyin: 'kè', meaning: '教学的内容。', examples: ['上课', '课本'] },
      { candidate: '身', result: '谢', pinyin: 'xiè', meaning: '表示感激。', examples: ['谢谢', '致谢'] }
    ]
  },
  {
    radical: '口', name: '口字旁', pinyin: 'kǒu zì páng', level: '启蒙', hint: '与嘴、吃喝、声音、出入口有关。',
    characters: [
      { candidate: '乞', result: '吃', pinyin: 'chī', meaning: '咽下食物。', examples: ['吃饭', '吃苦'] },
      { candidate: '可', result: '呵', pinyin: 'hē', meaning: '笑声或呵气。', examples: ['呵呵', '呵护'] },
      { candidate: '马', result: '吗', pinyin: 'ma', meaning: '疑问语气词。', examples: ['好吗', '是吗'] },
      { candidate: '昌', result: '唱', pinyin: 'chàng', meaning: '发出歌声。', examples: ['唱歌', '合唱'] },
      { candidate: '那', result: '哪', pinyin: 'nǎ', meaning: '疑问词，指代。', examples: ['哪里', '哪个'] }
    ]
  }
];

const CharacterApp: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentRadicalIdx, setCurrentRadicalIdx] = useState(0);
  const [candidates, setCandidates] = useState<CharacterDetail[]>([]);
  const [selection, setSelection] = useState<CharacterDetail | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [learnedCount, setLearnedCount] = useState(() => Number(localStorage.getItem('char_learned') || 0));

  const refreshQuestion = useCallback(() => {
    const newIdx = Math.floor(Math.random() * CHARACTER_DICTIONARY.length);
    const group = CHARACTER_DICTIONARY[newIdx];
    setCurrentRadicalIdx(newIdx);

    const correctOnes = [...group.characters].sort(() => 0.5 - Math.random()).slice(0, 4);
    const otherPool = CHARACTER_DICTIONARY.filter(g => g.radical !== group.radical).flatMap(g => g.characters);
    const distractors = otherPool.sort(() => 0.5 - Math.random()).slice(0, 5);
    
    setCandidates([...correctOnes, ...distractors].sort(() => 0.5 - Math.random()));
    setSelection(null);
    setIsSuccess(false);
  }, []);

  useEffect(() => { refreshQuestion(); }, [refreshQuestion]);

  const handleCompose = (item: CharacterDetail) => {
    setSelection(item);
    const currentGroup = CHARACTER_DICTIONARY[currentRadicalIdx];
    if (currentGroup.characters.some(c => c.result === item.result)) {
      setIsSuccess(true);
      const newCount = learnedCount + 1;
      setLearnedCount(newCount);
      localStorage.setItem('char_learned', String(newCount));
      playTTS(item.result);
    } else {
      setIsSuccess(false);
    }
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = 'zh-CN';
      window.speechSynthesis.speak(msg);
    }
  };

  const currentGroup = CHARACTER_DICTIONARY[currentRadicalIdx];

  const libraryItems = useMemo(() => {
    return CHARACTER_DICTIONARY.flatMap(g => g.characters.map(c => ({...c, r: g.radical, rn: g.name, l: g.level})))
      .filter(c => c.result.includes(searchQuery) || c.rn.includes(searchQuery) || c.pinyin.includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#F8FAFC] flex flex-col h-full overflow-hidden select-none font-sans">
      
      {/* 1. 紧凑型顶部栏 */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center">
            <Languages className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-800">识字通 <span className="text-[10px] text-emerald-500 ml-1">v3.5 PRO</span></h1>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="h-1 w-16 sm:w-24 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.min(100, (learnedCount/200)*100)}%` }} />
               </div>
               <span className="text-[9px] font-black text-slate-400">{(learnedCount/2).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
           <div className="hidden sm:flex bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 items-center gap-2">
             <Trophy className="w-3.5 h-3.5 text-emerald-600" />
             <span className="text-xs font-black text-emerald-800">{learnedCount} 字</span>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
             <X size={20} />
           </button>
        </div>
      </header>

      {/* 2. 主体内容区 - 核心：禁止滚动，内部自适应 */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#F8FAFC]">
        
        {/* 左侧/上方：核心构建区 (实验场) */}
        <section className="flex-[1.4] flex flex-col p-4 sm:p-6 lg:p-10 justify-center items-center gap-4 sm:gap-6 border-b lg:border-b-0 lg:border-r border-slate-200 relative">
          
          {/* 部首详情卡 */}
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-[0.03] rotate-12"><Sparkles size={80}/></div>
             <div className="w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-6xl sm:text-8xl font-black text-emerald-700 shadow-inner">
               {currentGroup?.radical}
             </div>
             <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-xl sm:text-3xl font-black text-slate-900">{currentGroup?.name}</h2>
                   <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                     currentGroup?.level === '启蒙' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
                   }`}>{currentGroup?.level}</span>
                </div>
                <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-[0.3em] mb-3">{currentGroup?.pinyin}</p>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                   <p className="text-[11px] sm:text-sm text-slate-500 font-medium leading-relaxed italic">{currentGroup?.hint}</p>
                </div>
             </div>
          </div>

          {/* 交互构建区 - 动态适配 */}
          <div className={`
            w-full max-w-lg flex-1 min-h-[160px] sm:min-h-[220px] bg-white rounded-[3rem] border-4 border-dashed p-6 flex flex-col items-center justify-center relative transition-all duration-500
            ${isSuccess ? 'border-emerald-500 bg-emerald-50/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'border-slate-200'}
          `}>
             <div className="flex items-center text-[80px] sm:text-[120px] lg:text-[140px] font-black tracking-tighter text-slate-100 select-none">
                <span className={`transition-all duration-700 ${isSuccess ? 'text-emerald-700' : 'text-slate-200'}`}>{currentGroup?.radical}</span>
                <span className="mx-4 sm:mx-8 text-3xl sm:text-5xl opacity-20 text-slate-300 font-light">+</span>
                <div className={`min-w-[1.2em] h-[1.2em] flex items-center justify-center border-b-4 sm:border-b-8 transition-all duration-700 ${isSuccess ? 'border-emerald-500 text-emerald-600 animate-in zoom-in' : 'border-slate-100 text-slate-300'}`}>
                  {selection?.candidate || <div className="w-16 sm:w-24 h-2 bg-slate-100 rounded-full animate-pulse"></div>}
                </div>
             </div>
             {!isSuccess && selection && (
               <div className="absolute bottom-6 flex items-center gap-2 bg-red-50 text-red-400 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black animate-bounce border border-red-100">
                  <Info size={14} /> 组合失败，这不是常用字
               </div>
             )}
          </div>
        </section>

        {/* 右侧/下方：控制与候选区 (操作台) */}
        <section className="flex-1 flex flex-col bg-white lg:bg-slate-50/30 p-4 sm:p-6 lg:p-10 overflow-hidden">
           <div className="flex-1 flex flex-col justify-center gap-4 sm:gap-8">
             <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-2">
                   <LayoutGrid size={14}/> 候选部件网格
                </h3>
                <span className="text-[10px] font-black text-slate-300">9 选 1</span>
             </div>

             {/* 候选磁贴网格 - 自适应 3x3 布局 */}
             <div className="grid grid-cols-3 gap-3 sm:gap-5 overflow-hidden p-1">
                {candidates.map((item, i) => (
                  <button 
                    key={i}
                    onClick={() => handleCompose(item)}
                    className={`
                      aspect-square bg-white rounded-2xl sm:rounded-[2rem] border-2 flex items-center justify-center text-4xl sm:text-6xl font-black transition-all shadow-sm
                      ${selection?.result === item.result 
                        ? (isSuccess ? 'border-emerald-500 text-emerald-600 ring-4 ring-emerald-500/10' : 'border-red-400 text-red-400 scale-95 shadow-inner') 
                        : 'border-transparent text-slate-700 hover:border-emerald-200 hover:shadow-lg active:scale-90'
                      }
                    `}
                  >
                    {item.candidate}
                  </button>
                ))}
             </div>

             {/* 底部按钮组 */}
             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0 mt-4">
                <button 
                  onClick={refreshQuestion}
                  className="flex-1 py-4 sm:py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm flex items-center justify-center gap-3 hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
                >
                  <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> 下一关卡
                </button>
                <button 
                  onClick={() => setShowLibrary(true)}
                  className="flex-1 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:bg-slate-800"
                >
                  <BookOpen size={16} /> 2000+ 字库库
                </button>
             </div>
           </div>
        </section>
      </main>

      {/* 成功反馈浮层 - 覆盖全屏 */}
      {isSuccess && selection && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
           <div className="w-full max-w-md text-center">
              <div className="relative mb-8">
                 <div className="absolute -inset-10 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
                 <div className="text-[120px] sm:text-[180px] font-black text-emerald-800 leading-none relative">{selection.result}</div>
              </div>
              <div className="text-3xl sm:text-5xl font-mono text-slate-300 font-black tracking-[0.3em] mb-8 uppercase flex items-center justify-center gap-4">
                 {selection.pinyin}
                 <button onClick={() => playTTS(selection.result)} className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                   <Volume2 size={24} />
                 </button>
              </div>
              
              <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 text-left border border-slate-200 mb-10 shadow-lg">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Lightbulb size={14} className="text-yellow-500"/> 字义百科</h4>
                 <p className="text-slate-800 text-lg sm:text-xl font-bold leading-relaxed mb-6">{selection.meaning}</p>
                 <div className="flex flex-wrap gap-2 sm:gap-3">
                    {selection.examples.map(ex => (
                      <span key={ex} className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs sm:text-sm font-black text-emerald-800 shadow-sm">{ex}</span>
                    ))}
                 </div>
              </div>

              <button 
                onClick={refreshQuestion}
                className="w-full py-5 sm:py-6 bg-emerald-600 text-white text-xl sm:text-2xl font-black rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all group"
              >
                继续探索 <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>
      )}

      {/* 字库百科 - 采用全屏侧滑 */}
      {showLibrary && (
        <div className="fixed inset-0 z-[110] bg-[#F8FAFC] flex flex-col p-4 sm:p-10 animate-in slide-in-from-right duration-500 overflow-hidden">
           <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-slate-900 rounded-[1.5rem] text-white shadow-xl"><LayoutGrid size={32}/></div>
                   <div>
                     <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">汉字全集百科</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Character Library / {libraryItems.length} Entries</p>
                   </div>
                </div>
                <button onClick={() => setShowLibrary(false)} className="p-4 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 shadow-sm transition-all">
                  <X size={28} />
                </button>
             </div>
             
             <div className="relative mb-8 shrink-0">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
                <input 
                  type="text" placeholder="输入汉字、部首名称或拼音关键词..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-16 pr-8 text-lg font-bold shadow-sm focus:outline-none focus:border-emerald-500/30 transition-all"
                />
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {libraryItems.map((char, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all shadow-sm group">
                        <div className="flex justify-between items-start mb-6">
                           <div className="text-6xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{char.result}</div>
                           <div className="text-right">
                              <span className="px-3 py-1 bg-slate-50 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">{char.r} 部</span>
                              <button onClick={() => playTTS(char.result)} className="block p-2 mt-2 text-slate-300 hover:text-emerald-500 transition-colors ml-auto"><Volume2 size={20} /></button>
                           </div>
                        </div>
                        <div className="text-lg font-mono text-slate-300 font-black mb-3 tracking-widest uppercase">{char.pinyin}</div>
                        <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 line-clamp-2">{char.meaning}</p>
                        <div className="flex flex-wrap gap-2">
                           {char.examples.map(ex => <span key={ex} className="px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-400">{ex}</span>)}
                        </div>
                      </div>
                   ))}
                   {libraryItems.length === 0 && (
                     <div className="col-span-full py-24 text-center">
                        <SearchCode size={64} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest">未搜索到匹配的汉字条目</p>
                     </div>
                   )}
                </div>
             </div>
           </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CharacterApp;
