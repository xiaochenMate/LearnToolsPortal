
import React, { useEffect, useState } from 'react';
import { X, Heart, Share2, Info, PlayCircle, Cpu, Loader2, CheckCircle2 } from 'lucide-react';
import { AppItem } from '../types';
import sql from '../lib/neon';

interface ModalProps {
  item: AppItem;
  onClose: () => void;
  onRun: (item: AppItem) => void;
  user: { email: string } | null;
}

const Modal: React.FC<ModalProps> = ({ item, onClose, onRun, user }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    checkFavoriteStatus();
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [item.id, user]);

  const checkFavoriteStatus = async () => {
    if (!user || !sql) return;
    try {
      const data = await sql`
        SELECT * FROM portal_favorites 
        WHERE user_email = ${user.email} 
          AND module_id = ${item.id}
        LIMIT 1
      `;
      setIsFavorited(data && data.length > 0);
    } catch (e) {
      console.warn("Neon favorites check failed", e);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user || !sql) return;

    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        await sql`
          DELETE FROM portal_favorites 
          WHERE user_email = ${user.email} 
            AND module_id = ${item.id}
        `;
        setIsFavorited(false);
      } else {
        await sql`
          INSERT INTO portal_favorites (user_email, module_id)
          VALUES (${user.email}, ${item.id})
          ON CONFLICT (user_email, module_id) DO NOTHING
        `;
        setIsFavorited(true);
      }
    } catch (e) {
      console.error("Favorite toggle failed:", e);
      alert("云端链路同步异常，请检查数据库配置。");
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `知识通 - ${item.title}`,
      text: `我在知识通门户发现了一个超赞的模块：${item.title}。${item.description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        console.log("Share cancelled");
      }
    } else {
      try {
        const textToCopy = `${shareData.title}\n${shareData.text}\n链接: ${shareData.url}`;
        await navigator.clipboard.writeText(textToCopy);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      } catch (e) {
        alert("浏览器不支持快速分享，请手动复制链接。");
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end md:items-center justify-center transition-all duration-300 ${isVisible ? 'bg-black/80 backdrop-blur-md' : 'bg-black/0 pointer-events-none'}`}>
      <div 
        className={`relative w-full md:max-w-3xl h-[92dvh] md:h-auto md:max-h-[85vh] bg-slate-900 md:border md:border-slate-700 shadow-[0_0_50px_rgba(16,185,129,0.1)] rounded-t-[2rem] md:rounded-[2rem] overflow-hidden transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 md:scale-95 md:translate-y-8'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle Bar */}
        <div className="md:hidden flex justify-center py-4 absolute top-0 left-0 w-full z-30 pointer-events-none">
          <div className="w-12 h-1 bg-white/10 rounded-full"></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 animate-pulse z-20"></div>

        <div className="relative h-56 sm:h-72 bg-slate-800 shrink-0">
           <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover opacity-80"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
           
           <button 
             onClick={handleClose}
             className="absolute top-4 right-4 p-3 md:p-2 bg-black/50 hover:bg-emerald-500 hover:text-black border border-slate-600 text-white rounded-full md:clip-button transition-all z-30"
           >
             <X className="w-5 h-5 md:w-6 md:h-6" />
           </button>
           
           <div className="absolute bottom-6 left-6 md:left-8 text-white z-10 pr-6">
             <div className="flex items-center space-x-2 mb-3">
                <span className="px-2 md:px-3 py-1 bg-emerald-500 text-black text-[8px] md:text-[9px] font-black tracking-widest uppercase clip-button tech-font">
                    {item.category === 'education' ? '知识' : item.category === 'entertainment' ? '娱乐' : '工具'}
                </span>
                <span className="text-emerald-400 text-[8px] md:text-[10px] font-mono animate-pulse uppercase tracking-wider">● 系统稳定</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-bold mb-1 tech-font tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase italic leading-tight">
               {item.title}
             </h2>
           </div>
        </div>

        <div className="overflow-y-auto h-[calc(92dvh-224px)] md:h-auto no-scrollbar pb-safe">
          <div className="p-6 md:p-8 relative">
              <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none translate-x-1/4 translate-y-1/4">
                  <Cpu className="w-48 h-48 md:w-64 md:h-64 text-emerald-500" />
              </div>

              <div className="flex flex-col md:flex-row gap-8 md:gap-10">
                  <div className="flex-1 z-10">
                      <h3 className="text-[10px] md:text-xs font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                          <Info className="w-4 h-4" /> 模块简报
                      </h3>
                      <div className="bg-slate-800/50 p-4 md:p-5 border-l-2 border-emerald-500 mb-6 backdrop-blur-sm">
                          <p className="text-slate-300 leading-relaxed font-light italic text-sm md:text-base">
                              {item.description}
                          </p>
                      </div>
                      
                      <div className="mb-4">
                          <h4 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">技术标签</h4>
                          <div className="flex flex-wrap gap-2">
                              {item.tags.map(tag => (
                                  <span key={tag} className="px-3 py-1 bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 text-[9px] md:text-[10px] font-mono tracking-tighter">
                                      #{tag}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>

                  <div className="w-full md:w-56 flex flex-col gap-3 md:gap-4 z-10 sticky bottom-0 pt-4 md:pt-0 bg-slate-900/80 backdrop-blur-md md:bg-transparent">
                      <button 
                          onClick={() => onRun(item)}
                          className="w-full h-14 md:h-auto py-4 px-6 bg-white text-black font-black text-base md:text-lg tracking-wider clip-button shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 group active:scale-95"
                      >
                          <PlayCircle className="w-5 h-5 md:w-6 md:h-6" />
                          启动程序
                      </button>
                      
                      <div className="grid grid-cols-2 gap-3 mb-2 md:mb-0">
                          <button 
                            onClick={handleToggleFavorite}
                            disabled={isFavoriteLoading}
                            className={`h-12 md:h-auto py-3 px-2 border border-slate-700 font-bold text-[10px] md:text-[11px] clip-button transition-all flex items-center justify-center gap-2 ${isFavorited ? 'bg-rose-500/20 text-rose-500 border-rose-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                          >
                              {isFavoriteLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500 animate-pulse' : ''}`} />
                              )}
                              {isFavorited ? '已收藏' : '收藏'}
                          </button>
                          <button 
                            onClick={handleShare}
                            className="h-12 md:h-auto py-3 px-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold text-[10px] md:text-[11px] clip-button transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                          >
                              {copyFeedback ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-in zoom-in" />
                              ) : (
                                  <Share2 className="w-4 h-4 text-emerald-500" />
                              )}
                              {copyFeedback ? '已复制' : '分享'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
