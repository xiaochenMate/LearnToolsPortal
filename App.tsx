
import React, { useState, useEffect } from 'react';
import { EDUCATION_ITEMS, ENTERTAINMENT_ITEMS, UTILITIES_ITEMS } from './constants';
import { AppItem, Category } from './types';
import AppCard from './components/AppCard';
import Modal from './components/Modal';
import Earth3D from './components/Earth3D';
import FoodChainApp from './components/FoodChainApp';
import CharacterApp from './components/CharacterApp';
import ClockApp from './components/ClockApp';
import { BookOpen, Gamepad2, Wrench, Search, Menu, Cpu, Rocket, Shield, Loader2, Zap, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('education');
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
  const [runningAppId, setRunningAppId] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(false);
  const [bootingAppTitle, setBootingAppTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const getItems = () => {
    switch (activeTab) {
      case 'education': return EDUCATION_ITEMS;
      case 'entertainment': return ENTERTAINMENT_ITEMS;
      case 'utilities': return UTILITIES_ITEMS;
      default: return [];
    }
  };

  const filteredItems = getItems().filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRunApp = (item: AppItem) => {
    setSelectedItem(null); 
    setBootingAppTitle(item.title);
    setIsBooting(true);
    
    // 模拟系统自检与挂载过程 (1.8s)
    setTimeout(() => {
      setIsBooting(false);
      setRunningAppId(item.id);
    }, 1800);
  };

  // --- 启动序列组件 ---
  const BootingScreen = () => (
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
      {/* 扫描线效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
      
      {/* 背景装饰网格 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none border-[40px] border-slate-900 flex items-center justify-center">
        <div className="w-full h-full border border-cyan-500/20 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-20 flex flex-col items-center">
        {/* 中心核心 */}
        <div className="relative mb-10 group">
          <div className="absolute -inset-8 bg-yellow-500/20 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative w-24 h-24 bg-yellow-500 flex items-center justify-center clip-tech-border shadow-[0_0_30px_rgba(234,179,8,0.4)]">
            <Cpu className="w-12 h-12 text-black animate-[spin_3s_linear_infinite]" />
          </div>
          {/* 环绕轨道 */}
          <div className="absolute -inset-4 border-2 border-dashed border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute -inset-10 border border-slate-800 rounded-full"></div>
        </div>

        {/* 状态文字 */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-black tech-font text-white italic tracking-widest mb-2 flex items-center gap-4">
            <Zap className="w-6 h-6 text-yellow-500 animate-bounce" />
            SYSTEM ENGAGED
          </h2>
          <div className="h-1 w-64 bg-slate-800 mx-auto rounded-full overflow-hidden relative border border-slate-700">
            <div className="absolute h-full bg-cyan-500 animate-[loading_1.8s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
          <p className="mt-6 text-cyan-500/60 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
            &gt;&gt; Mount Module: {bootingAppTitle}...
          </p>
        </div>

        {/* 底部终端日志 */}
        <div className="absolute bottom-12 left-12 font-mono text-[10px] text-slate-600 space-y-1 hidden md:block">
          <p>&gt; CHECKING NEURAL LINKS... [OK]</p>
          <p>&gt; SYNCHRONIZING CORE DATABASE... [98%]</p>
          <p>&gt; BYPASSING FIREWALL... [DONE]</p>
          <p>&gt; INITIALIZING 3D RENDER ENGINE... [READY]</p>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        .tech-font { font-family: 'Orbitron', sans-serif; }
      `}</style>
    </div>
  );

  // --- Route Handlers ---
  
  if (isBooting) {
    return <BootingScreen />;
  }

  // 1. Earth 3D
  if (runningAppId === 'e1') {
    return <Earth3D onClose={() => setRunningAppId(null)} />;
  }

  // 2. Food Chain
  if (runningAppId === 'e2') {
    return <FoodChainApp onClose={() => setRunningAppId(null)} />;
  }

  // 4. Character Composition
  if (runningAppId === 'e4') {
    return <CharacterApp onClose={() => setRunningAppId(null)} />;
  }

  // 7. Clock Learning
  if (runningAppId === 'e7') {
    return <ClockApp onClose={() => setRunningAppId(null)} />;
  }

  // Handle other running apps (placeholders for now)
  if (runningAppId) {
    const currentApp = [...EDUCATION_ITEMS, ...ENTERTAINMENT_ITEMS, ...UTILITIES_ITEMS].find(i => i.id === runningAppId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse"></div>
          <Terminal className="w-16 h-16 text-cyan-400 relative z-10" />
        </div>
        <h1 className="text-2xl font-bold tech-font text-white mb-2 italic">MODULE STANDBY</h1>
        <p className="text-slate-500 mb-8 font-mono text-xs tracking-widest uppercase px-4 py-1 bg-slate-900 border border-slate-800 rounded">
          {currentApp?.title || runningAppId}
        </p>
        <div className="max-w-md text-center px-6 mb-10">
          <p className="text-slate-400 text-sm leading-relaxed">
            该模块目前处于开发阶段。系统正在努力构建其核心逻辑与交互接口。请耐心等待未来的固件更新。
          </p>
        </div>
        <button 
          onClick={() => setRunningAppId(null)}
          className="px-10 py-3 bg-red-600/10 border border-red-500/50 text-red-500 hover:bg-red-600 hover:text-white font-bold clip-button tracking-widest transition-all"
        >
          终止任务 / ABORT
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-yellow-500 selection:text-black">
      
      {/* Top Tech Bar */}
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-yellow-400 to-purple-600 fixed top-0 w-full z-50"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 bg-yellow-500 flex items-center justify-center clip-button shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                <Cpu className="w-6 h-6 text-black" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-400 animate-ping rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black italic tracking-tighter text-white tech-font leading-none">
                  ZHISHITONG
                </span>
                <span className="text-[10px] text-cyan-500 font-mono tracking-[0.2em] leading-none mt-1">
                  CYBER LEARNING HUB
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NavButton 
                isActive={activeTab === 'education'} 
                onClick={() => setActiveTab('education')} 
                icon={<Rocket className="w-4 h-4" />}
                label="训练基地"
                subLabel="EDUCATION"
              />
              <NavButton 
                isActive={activeTab === 'entertainment'} 
                onClick={() => setActiveTab('entertainment')} 
                icon={<Gamepad2 className="w-4 h-4" />}
                label="娱乐特区"
                subLabel="FUN ZONE"
              />
              <NavButton 
                isActive={activeTab === 'utilities'} 
                onClick={() => setActiveTab('utilities')} 
                icon={<Shield className="w-4 h-4" />}
                label="武器库"
                subLabel="UTILITIES"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-yellow-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索模组..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-cyan-500 focus:bg-slate-800 transition-all w-48 clip-button font-mono placeholder-slate-600"
                />
              </div>
              <button className="md:hidden p-2 text-yellow-500">
                <Menu className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Hero / Header Section */}
        <div className="mb-12 relative">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 border-l-4 border-yellow-500 pl-6 py-2">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tech-font tracking-wide uppercase italic">
              {activeTab === 'education' && <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">KNOWLEDGE BASE</span>}
              {activeTab === 'entertainment' && <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">RECREATION DECK</span>}
              {activeTab === 'utilities' && <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">ARMORY & TOOLS</span>}
            </h1>
            <p className="text-slate-400 max-w-2xl font-mono text-sm md:text-base border-t border-slate-700/50 pt-2 mt-2 inline-block">
              {activeTab === 'education' && '>> 初始化学习模块... 准备载入 K12 核心数据与通识课程。'}
              {activeTab === 'entertainment' && '>> 警告：检测到高能娱乐反应。请做好放松准备。'}
              {activeTab === 'utilities' && '>> 战术工具已就绪。提升效率，解决任务障碍。'}
            </p>
          </div>
        </div>

        {/* Tab Bar for Mobile */}
         <div className="md:hidden mb-8 flex space-x-2 overflow-x-auto no-scrollbar pb-2">
           <MobileNavButton 
             isActive={activeTab === 'education'} 
             onClick={() => setActiveTab('education')} 
             label="训练基地"
           />
           <MobileNavButton 
             isActive={activeTab === 'entertainment'} 
             onClick={() => setActiveTab('entertainment')} 
             label="娱乐特区"
           />
           <MobileNavButton 
             isActive={activeTab === 'utilities'} 
             onClick={() => setActiveTab('utilities')} 
             label="武器库"
           />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <AppCard 
              key={item.id} 
              item={item} 
              onClick={setSelectedItem} 
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-24 border border-slate-800 border-dashed rounded-xl bg-slate-900/50">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6 animate-pulse">
                <Search className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white tech-font mb-2">NO DATA FOUND</h3>
            <p className="text-slate-500 font-mono">请重新校准搜索参数...</p>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          onRun={handleRunApp}
        />
      )}
    </div>
  );
};

// Nav Button Component
const NavButton = ({ isActive, onClick, icon, label, subLabel }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string; subLabel: string }) => (
  <button
    onClick={onClick}
    className={`
      relative group flex items-center gap-3 px-6 py-2 clip-button transition-all duration-300 overflow-hidden
      ${isActive 
        ? 'bg-yellow-500 text-black' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
      }
    `}
  >
    {/* Active indicator line */}
    {isActive && <div className="absolute left-0 top-0 h-full w-1 bg-white"></div>}
    
    <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
    </div>
    <div className="flex flex-col items-start">
        <span className="font-bold text-sm leading-none">{label}</span>
        <span className={`text-[9px] font-mono leading-none mt-1 ${isActive ? 'text-black/70' : 'text-slate-600'}`}>{subLabel}</span>
    </div>
  </button>
);

const MobileNavButton = ({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) => (
    <button
    onClick={onClick}
    className={`
      flex-shrink-0 px-4 py-2 text-sm font-bold clip-button transition-all whitespace-nowrap border
      ${isActive 
        ? 'bg-yellow-500 text-black border-yellow-500' 
        : 'bg-slate-800 text-slate-400 border-slate-700'
      }
    `}
  >
    {label}
  </button>
)

export default App;
