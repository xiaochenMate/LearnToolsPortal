import React, { useEffect, useState } from 'react';
import { X, Heart, Share2, Info, User, PlayCircle } from 'lucide-react';
import { AppItem } from '../types';

interface ModalProps {
  item: AppItem;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ item, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Prevent scrolling on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 transition-all duration-300 ${isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'}`}>
      
      {/* Modal Content */}
      <div 
        className={`bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 bg-slate-200">
           <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <button 
             onClick={handleClose}
             className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
           >
             <X className="w-6 h-6" />
           </button>
           
           <div className="absolute bottom-6 left-6 text-white">
             <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-[10px] font-bold tracking-wider uppercase">
                    {item.category === 'education' ? '教育学习' : item.category === 'entertainment' ? '娱乐互动' : '实用工具'}
                </span>
             </div>
             <h2 className="text-3xl font-bold mb-1">{item.title}</h2>
             <p className="text-white/80 flex items-center gap-2">
               <User className="w-4 h-4" /> {item.author}
             </p>
           </div>
        </div>

        {/* Body */}
        <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5 text-indigo-500" />
                        应用简介
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-6">
                        {item.description}
                        <br/><br/>
                        这是一个非常棒的{item.category === 'education' ? '学习工具' : '应用'}，旨在帮助用户通过交互式体验掌握核心概念。该应用由社区开发者 <strong>{item.author}</strong> 精心制作，深受用户喜爱。
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                        {item.tags.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="w-full md:w-48 flex flex-col gap-3">
                    <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        开始运行
                    </button>
                    <button className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />
                        收藏
                    </button>
                     <button className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-5 h-5 text-sky-500" />
                        分享
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
