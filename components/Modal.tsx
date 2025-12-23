
import React, { useEffect, useState } from 'react';
import { X, Heart, Share2, Info, PlayCircle, Cpu } from 'lucide-react';
import { AppItem } from '../types';

interface ModalProps {
  item: AppItem;
  onClose: () => void;
  onRun: (item: AppItem) => void;
}

const Modal: React.FC<ModalProps> = ({ item, onClose, onRun }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleRunClick = () => {
    onRun(item);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 transition-all duration-300 ${isVisible ? 'bg-black/80 backdrop-blur-md' : 'bg-black/0 pointer-events-none'}`}>
      
      {/* Modal Container */}
      <div 
        className={`relative w-full max-w-3xl bg-slate-900 border border-slate-700 shadow-[0_0_50px_rgba(0,255,255,0.1)] clip-tech-border overflow-hidden transform transition-all duration-300 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Scanning Line (Decoration) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 animate-pulse z-20"></div>

        {/* Header Image Area */}
        <div className="relative h-72 bg-slate-800 group">
           <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover opacity-80"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
           
           <button 
             onClick={handleClose}
             className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-yellow-500 hover:text-black border border-slate-600 text-white clip-button transition-all z-30 group-hover:rotate-90 duration-300"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="absolute bottom-6 left-8 text-white z-10">
             <div className="flex items-center space-x-2 mb-3">
                <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-black tracking-widest uppercase clip-button tech-font">
                    {item.category === 'education' ? 'Level: EDU' : item.category === 'entertainment' ? 'Level: FUN' : 'Level: UTIL'}
                </span>
                <span className="text-cyan-400 text-xs font-mono animate-pulse">● SYSTEM ONLINE</span>
             </div>
             <h2 className="text-4xl font-bold mb-2 tech-font tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{item.title}</h2>
           </div>
        </div>

        {/* Body */}
        <div className="p-8 relative">
            {/* Background Tech Lines */}
            <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                <Cpu className="w-64 h-64 text-cyan-500" />
            </div>

            <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 z-10">
                    <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2 tech-font">
                        <Info className="w-5 h-5" />
                        MISSION BRIEFING
                    </h3>
                    <div className="bg-slate-800/50 p-4 border-l-2 border-yellow-500 mb-6">
                        <p className="text-slate-300 leading-relaxed font-light">
                            {item.description}
                        </p>
                    </div>
                    
                    <div className="mb-4">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="w-full md:w-56 flex flex-col gap-4 z-10">
                    <button 
                        onClick={handleRunClick}
                        className="w-full py-4 px-6 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg tracking-wider clip-button shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all flex items-center justify-center gap-2 group"
                    >
                        <PlayCircle className="w-6 h-6 group-hover:animate-spin" />
                        START MISSION
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-3 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm clip-button transition-all flex items-center justify-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500" />
                            SAVE
                        </button>
                        <button className="py-3 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-sm clip-button transition-all flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4 text-cyan-500" />
                            SHARE
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
