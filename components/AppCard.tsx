import React from 'react';
import { AppItem } from '../types';
import { Play } from 'lucide-react';

interface AppCardProps {
  item: AppItem;
  onClick: (item: AppItem) => void;
}

const AppCard: React.FC<AppCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => onClick(item)}
    >
      {/* Image Container */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-300">
                <Play className="w-5 h-5 text-indigo-600 fill-indigo-600" />
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
            </h3>
        </div>
        <p className="text-xs text-slate-400 font-medium mb-3">{item.author}</p>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {item.tags.map((tag, idx) => (
            <span 
              key={idx} 
              className="inline-block px-2 py-1 text-[10px] font-medium text-slate-500 bg-slate-100 rounded-md"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppCard;
