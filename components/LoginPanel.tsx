import React, { useState } from 'react';

export const LoginPanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [msg, setMsg] = useState('');

  const handleSubmit = async () => {
    try {
      if (!username || !password) { setMsg('Masukkan username dan password'); return; }
      if (mode === 'register') {
        const { registerUser } = await import('../services/authService');
        const u = await registerUser(username, password);
        setMsg(`✅ Terdaftar & login sebagai ${u.name}`);
      } else {
        const { loginWithPassword } = await import('../services/authService');
        const u = await loginWithPassword(username, password);
        if (u) setMsg(`✅ Login sebagai ${u.name}`); else setMsg('⚠️ Username/password salah');
      }
    } catch (e: any) { setMsg(`⚠️ Error: ${e?.message||'gagal'}`); }
  };

  return (
    <div className="p-6 md:p-10 text-white max-w-md mx-auto">
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
        <div className="text-xl font-bold mb-3">Login ke WILI AI</div>
        <div className="space-y-3">
          <input value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-primary-500" />
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-primary-500" />
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <label className="flex items-center gap-2"><input type="radio" checked={mode==='login'} onChange={()=>setMode('login')} /> Login</label>
            <label className="flex items-center gap-2"><input type="radio" checked={mode==='register'} onChange={()=>setMode('register')} /> Register</label>
          </div>
          <button onClick={handleSubmit} className="w-full bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95">{mode==='login'?'Login':'Register'}</button>
          {msg && (<div className="text-xs text-slate-300">{msg}</div>)}
        </div>
      </div>
    </div>
  );
};

