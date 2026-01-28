'use client';

import { useActionState, useState } from 'react';
import { loginUser, verifyMfa } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, User, KeyRound, Fingerprint } from 'lucide-react';

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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-6 text-slate-200">
      
      {/* Glow Effect behind card */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      {/* Main Card - Exact matches to Register Page dimensions and borders */}
      <div className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 mb-5 shadow-lg group">
              <Shield className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ForensiLock</h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-2">Secure Access Portal</p>
          </div>

          {!state?.mfaRequired ? (
            /* --- STATE 1: CREDENTIALS --- */
            <form action={formAction} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-3">
                <div className="relative group">
                  <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    name="username" 
                    placeholder="Identity ID" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium" 
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute left-3.5 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Passphrase" 
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium" 
                  />
                </div>
              </div>

              <button 
                disabled={isPending} 
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(8,145,178,0.4)] disabled:opacity-50 disabled:grayscale group"
              >
                {isPending ? 'Verifying...' : 'Establish Connection'}
                {!isPending && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              
              {state?.error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-bold animate-in zoom-in-95">
                  {state.error}
                </div>
              )}
            </form>
          ) : (
            /* --- STATE 2: MFA --- */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                 <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Fingerprint className="text-cyan-400 w-8 h-8" />
                 </div>
                 <h2 className="text-white font-bold text-lg">2FA Verification</h2>
                 <p className="text-slate-500 text-xs mt-1">Enter TOTP from Authenticator</p>
              </div>

              <input 
                value={mfaCode} 
                onChange={e => setMfaCode(e.target.value)}
                placeholder="000000" 
                maxLength={6}
                className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl py-4 text-center text-3xl font-mono tracking-[0.5em] text-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-800 placeholder:tracking-normal"
                autoFocus
              />

              <button 
                onClick={handleMfa} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
              >
                <Lock size={16} /> Authenticate Session
              </button>
            </div>
          )}
        </div>

        <div className="bg-white/[0.02] p-4 text-center border-t border-white/5">
          <p className="text-xs text-slate-500">
            Unauthorized access is prohibited. <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors ml-1">Initialize ID</Link>
          </p>
        </div>
      </div>
    </div>
  );
}