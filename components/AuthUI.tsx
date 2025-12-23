
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, LogIn, LogOut, Shield, Key, Loader2, X, Github } from 'lucide-react';

interface AuthUIProps {
  user: any;
  onClose?: () => void;
}

const AuthUI: React.FC<AuthUIProps> = ({ user, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: authError } = isLoginView
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (authError) setError(authError.message);
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (!supabase) {
    return (
      <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono rounded">
        认证配置缺失
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="text-right hidden sm:block">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">神经身份已激活</div>
          <div className="text-xs text-emerald-400 font-mono">{user.email?.split('@')[0].toUpperCase()}</div>
        </div>
        <button onClick={handleSignOut} className="w-10 h-10 bg-slate-900 border border-slate-700 clip-button flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/50 transition-all group">
          <LogOut className="text-slate-500 group-hover:text-red-500 w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md clip-tech-border p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center clip-button">
            <Key className="text-black w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tech-font italic tracking-tighter uppercase">身份链路</h2>
            <p className="text-[10px] text-emerald-500 font-mono tracking-widest uppercase">加密状态: 已启用</p>
          </div>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">神经链路 (邮箱)</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 clip-button font-mono" placeholder="operator@link.net" />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-widest">安全密钥 (密码)</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 clip-button font-mono" placeholder="••••••••" />
          </div>
          {error && <p className="text-red-500 text-[10px] font-mono italic">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center gap-3 clip-button transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLoginView ? '初始化链接' : '创建数字身份')}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-4">
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-[10px] text-emerald-500/50 hover:text-emerald-400 font-bold uppercase tracking-[0.2em] transition-all text-center">
            {isLoginView ? "申请新身份" : "已有身份？点击接入门户"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
