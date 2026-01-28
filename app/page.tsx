'use client';

// 1. Change Import: useActionState from 'react'
import { useActionState, useState } from 'react';
import { loginUser, verifyMfa } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  // 2. Update Hook Usage: useActionState replaces useFormState
  // It also returns 'isPending' as the 3rd argument (optional but useful)
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

        <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Shield className="text-cyan-500" /> ForensiLock
        </h1>

        {!state?.mfaRequired ? (
          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 uppercase font-bold tracking-wider">Credentials</label>
              <input name="username" placeholder="Username" className="w-full bg-slate-950 p-3 rounded border border-slate-700 focus:border-cyan-500 outline-none transition" />
              <input type="password" name="password" placeholder="Password" className="w-full bg-slate-950 p-3 rounded border border-slate-700 focus:border-cyan-500 outline-none transition" />
            </div>

            {/* Added disabled state for better UX */}
            <button disabled={isPending} className="w-full bg-cyan-600 p-3 rounded font-bold hover:bg-cyan-500 transition flex justify-between items-center group disabled:opacity-50">
              <span>{isPending ? 'Authenticating...' : 'Authenticate'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
            </button>
            
            {state?.error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">{state.error}</p>}

            <div className="text-center text-xs mt-4 pt-4 border-t border-slate-800">
              <Link href="/register" className="text-slate-400 hover:text-cyan-400 transition">Initialize New ID (Register)</Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-cyan-400 mb-2">
                <Lock size={24} />
              </div>
              <h2 className="text-lg font-bold">MFA Verification</h2>
              <p className="text-xs text-slate-400">Enter the 6-digit code from your authenticator app.</p>
            </div>

            <input 
              value={mfaCode} 
              onChange={e => setMfaCode(e.target.value)}
              placeholder="000 000" 
              className="w-full bg-slate-950 p-4 rounded text-center text-2xl tracking-[0.5em] font-mono border border-slate-700 focus:border-cyan-500 outline-none" 
              maxLength={6}
            />

            <button onClick={handleMfa} className="w-full bg-emerald-600 p-3 rounded font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
              Verify Identity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}