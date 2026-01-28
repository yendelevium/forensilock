'use client';

import { useActionState, useState } from 'react';
import { loginUser, verifyMfa } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, KeyRound, User, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const [mfaCode, setMfaCode] = useState('');
  const router = useRouter();

  const handleMfa = async () => {
    if (state?.userId) {
      const res = await verifyMfa(state.userId, mfaCode);
      if (res.success) router.push('/dashboard');
      else alert('Invalid MFA Code');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4 text-slate-200">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 opacity-75"></div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700 mb-4 shadow-inner">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ForensiLock</h1>
            <p className="text-slate-500 text-sm mt-1">Secure Chain of Custody System</p>
          </div>

          {!state?.mfaRequired ? (
            /* --- STEP 1: CREDENTIALS --- */
            <form action={formAction} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    name="username" 
                    placeholder="Username" 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-900/20 transition-all placeholder:text-slate-600" 
                  />
                </div>
                
                <div className="relative group">
                  <KeyRound className="absolute left-3 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-900/20 transition-all placeholder:text-slate-600" 
                  />
                </div>
              </div>

              <button 
                disabled={isPending} 
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-900/20"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Authenticate <ArrowRight size={18} /></>
                )}
              </button>
              
              {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium animate-in zoom-in-95">
                  {state.error}
                </div>
              )}
            </form>
          ) : (
            /* --- STEP 2: MFA --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center p-4 bg-slate-950/30 rounded-lg border border-slate-800/50">
                <p className="text-slate-400 text-xs mb-2 uppercase tracking-wider font-semibold">Authenticator Code</p>
                <input 
                  value={mfaCode} 
                  onChange={e => setMfaCode(e.target.value)}
                  placeholder="000 000" 
                  maxLength={6}
                  className="w-full bg-transparent text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none placeholder:text-slate-700"
                  autoFocus
                />
              </div>

              <button 
                onClick={handleMfa} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <Lock size={18} /> Verify Identity
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950/50 p-4 text-center border-t border-slate-800">
          <p className="text-xs text-slate-500">
            New Personnel? <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">Initialize ID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}