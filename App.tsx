import React, { useState } from 'react';
import { EDUCATION_ITEMS, ENTERTAINMENT_ITEMS, UTILITIES_ITEMS } from './constants';
import { AppItem, Category } from './types';
import AppCard from './components/AppCard';
import Modal from './components/Modal';
import { BookOpen, Gamepad2, Wrench, Search, Menu, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('education');
  const [selectedItem, setSelectedItem] = useState<AppItem | null>(null);
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                智识通
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
              <NavButton 
                isActive={activeTab === 'education'} 
                onClick={() => setActiveTab('education')} 
                icon={<BookOpen className="w-4 h-4" />}
                label="教育学习"
              />
              <NavButton 
                isActive={activeTab === 'entertainment'} 
                onClick={() => setActiveTab('entertainment')} 
                icon={<Gamepad2 className="w-4 h-4" />}
                label="娱乐互动"
              />
              <NavButton 
                isActive={activeTab === 'utilities'} 
                onClick={() => setActiveTab('utilities')} 
                icon={<Wrench className="w-4 h-4" />}
                label="实用工具"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="搜索应用..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-500 transition-all w-48"
                />
              </div>
              <button className="md:hidden p-2 text-slate-500">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Tab Bar (Visible only on small screens) */}
        <div className="md:hidden px-4 pb-3 flex space-x-2 overflow-x-auto no-scrollbar">
           <MobileNavButton 
             isActive={activeTab === 'education'} 
             onClick={() => setActiveTab('education')} 
             label="教育学习"
           />
           <MobileNavButton 
             isActive={activeTab === 'entertainment'} 
             onClick={() => setActiveTab('entertainment')} 
             label="娱乐互动"
           />
           <MobileNavButton 
             isActive={activeTab === 'utilities'} 
             onClick={() => setActiveTab('utilities')} 
             label="实用工具"
           />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {activeTab === 'education' && '探索知识的海洋'}
            {activeTab === 'entertainment' && '享受互动的乐趣'}
            {activeTab === 'utilities' && '提升效率的利器'}
          </h1>
          <p className="text-slate-500 max-w-2xl">
            {activeTab === 'education' && '精选 K12 及通识教育互动课件，让学习变得生动有趣。'}
            {activeTab === 'entertainment' && '工作学习之余的放松选择，激发创意与灵感。'}
            {activeTab === 'utilities' && '简单好用的小工具集合，解决生活工作中的实际问题。'}
          </p>
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
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">未找到相关应用</h3>
            <p className="text-slate-500">换个关键词试试看吧</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
          <p className="mb-2">© 2024 Zhishitong Platform. All rights reserved.</p>
          <p className="text-sm">Designed for interactive learning and productivity.</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

// Nav Button Component
const NavButton = ({ isActive, onClick, icon, label }: { isActive: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300
      ${isActive 
        ? 'bg-white text-indigo-600 shadow-md shadow-slate-200' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
      }
    `}
  >
    {icon}
    {label}
  </button>
);

const MobileNavButton = ({ isActive, onClick, label }: { isActive: boolean; onClick: () => void; label: string }) => (
    <button
    onClick={onClick}
    className={`
      flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
      ${isActive 
        ? 'bg-indigo-600 text-white' 
        : 'bg-white text-slate-600 border border-slate-200'
      }
    `}
  >
    {label}
  </button>
)

export default App;
