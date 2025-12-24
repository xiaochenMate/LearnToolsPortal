
import React, { useState, useEffect } from 'react';
import { EDUCATION_ITEMS, ENTERTAINMENT_ITEMS, UTILITIES_ITEMS } from './constants';
import { AppItem } from './types';
import { supabase } from './lib/supabase';
import AppCard from './components/AppCard';
import Modal from './components/Modal';
import Earth3D from './components/Earth3D';
import FoodChainApp from './components/FoodChainApp';
import CharacterApp from './components/CharacterApp';
import ClockApp from './components/ClockApp';
import WaveApp from './components/WaveApp';
import MathSprintApp from './components/MathSprintApp';
import HistorySortingApp from './components/HistorySortingApp';
import BrainTeaseApp from './components/BrainTeaseApp';
import GobangApp from './components/GobangApp';
import PixelArtApp from './components/PixelArtApp';
import ChineseChessApp from './components/ChineseChessApp';
import ProArtApp from './components/ProArtApp';
import VocabularyApp from './components/VocabularyApp';
import HeroSpotlight from './components/HeroSpotlight';
import ActivityTicker from './components/ActivityTicker';
import AuthUI from './components/AuthUI';
import { Search, Cpu, Loader2, Terminal, LayoutGrid, Book, Gamepad2, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [runningAppId, setRunningAppId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootingAppTitle, setBootingAppTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  
  const [allModules, setAllModules] = useState<AppItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const staticModules = [...EDUCATION_ITEMS, ...ENTERTAINMENT_ITEMS, ...UTILITIES_ITEMS];

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) setShowAuthModal(false);
      });
    }
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setIsLoading(true);
    if (!supabase) {
      setAllModules(staticModules);
      setIsLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('modules').select('*');
      if (data && !error && data.length > 0) {
        setAllModules(data as any);
      } else {
        setAllModules(staticModules);
      }
    } catch (e) {
      setAllModules(staticModules);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModules = allModules.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || item.category.toUpperCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRunApp = (item: AppItem) => {
    setSelectedItem(null); 
    setBootingAppTitle(item.title);
    setIsBooting(true);
    setTimeout(() => {
      setIsBooting(false);
      setRunningAppId(item.id);
    }, 1200);
  };

  const categories = [
    { id: 'ALL', label: '全部模块', icon: LayoutGrid },
    { id: 'EDUCATION', label: '知识教育', icon: Book },
    { id: 'ENTERTAINMENT', label: '休闲娱乐', icon: Gamepad2 },
    { id: 'UTILITIES', label: '实用工具', icon: Settings },
  ];

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-emerald-500 clip-tech-border flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <Cpu className="w-12 h-12 text-black animate-spin" />
          </div>
        </div>
        <h2 className="mt-8 text-xl font-black tech-font text-white italic tracking-widest uppercase">正在初始化链接: {bootingAppTitle}</h2>
        <div className="mt-4 w-48 h-1 bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_1.2s_linear_infinite]"></div>
        </div>
      </div>
    );
  }

  const renderApp = () => {
    switch (runningAppId) {
      case 'e1': return <Earth3D onClose={() => setRunningAppId(null)} />;
      case 'e2': return <FoodChainApp onClose={() => setRunningAppId(null)} />;
      case 'e3': return <WaveApp onClose={() => setRunningAppId(null)} />;
      case 'e4': return <CharacterApp onClose={() => setRunningAppId(null)} />;
      case 'e6': return <HistorySortingApp onClose={() => setRunningAppId(null)} />;
      case 'e7': return <ClockApp onClose={() => setRunningAppId(null)} />;
      case 'e18': return <MathSprintApp onClose={() => setRunningAppId(null)} />;
      case 'ent3': return <BrainTeaseApp onClose={() => setRunningAppId(null)} />;
      case 'ent4': return <GobangApp onClose={() => setRunningAppId(null)} />;
      case 'ent5': return <ChineseChessApp onClose={() => setRunningAppId(null)} />;
      case 'ent1': return <PixelArtApp onClose={() => setRunningAppId(null)} />;
      case 'u1': return <ProArtApp onClose={() => setRunningAppId(null)} />;
      case 'u2': return <VocabularyApp onClose={() => setRunningAppId(null)} userEmail={user?.email} />;
      default: return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center">
          <Terminal className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
          <h1 className="text-2xl font-bold text-white mb-2 tech-font uppercase">系统待机模式</h1>
          <p className="text-slate-500 mb-8 font-mono text-xs tracking-widest">模块 ID: {runningAppId} / 开发中</p>
          <button onClick={() => setRunningAppId(null)} className="px-8 py-3 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white transition-all font-black tracking-[0.2em] uppercase italic">终止进程</button>
        </div>
      );
    }
  };

  if (runningAppId) return renderApp();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 pb-20">
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveCategory('ALL')}>
            <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center clip-button">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <span className="text-2xl font-black italic tech-font text-white tracking-tighter uppercase">知识通门户</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" placeholder="全局搜索模块..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-6 py-2.5 bg-slate-900 border border-slate-800 text-xs font-mono focus:outline-none focus:border-emerald-500 w-48 transition-all focus:w-64"
              />
            </div>
            {user ? <AuthUI user={user} onClose={() => setShowAuthModal(false)} /> : (
              <button onClick={() => setShowAuthModal(true)} className="text-[10px] font-black uppercase text-emerald-500 border border-emerald-500/20 px-6 py-2.5 hover:bg-emerald-500 hover:text-black transition-all">链接数字身份</button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!searchQuery && activeCategory === 'ALL' && allModules.length > 0 && (
          <HeroSpotlight item={allModules.find(m => m.id === 'ent5') || allModules[0]} onRun={handleRunApp} />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-slate-900 pb-8">
          <div className="flex items-center gap-4">
             <LayoutGrid className="text-emerald-500 w-5 h-5" />
             <h2 className="text-2xl font-black text-white tech-font uppercase tracking-tight italic">已部署模块</h2>
          </div>

          <div className="flex bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/50 backdrop-blur-sm self-start overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[11px] font-black tech-font uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                    ${isActive 
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                  `}
                >
                  <Icon size={14} className={isActive ? 'text-black' : 'text-slate-500'} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModules.length > 0 ? (
            filteredModules.map(item => <AppCard key={item.id} item={item} onClick={setSelectedItem} />)
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center opacity-30">
              <Loader2 className="w-12 h-12 mb-4 animate-spin" />
              <p className="tech-font text-sm uppercase tracking-widest">当前扇区未发现匹配模块</p>
            </div>
          )}
        </div>
      </main>

      <ActivityTicker />
      {selectedItem && <Modal item={selectedItem} onClose={() => setSelectedItem(null)} onRun={handleRunApp} />}
      {showAuthModal && <AuthUI user={user} onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
