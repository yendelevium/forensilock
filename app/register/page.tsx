'use client';

import { useActionState } from 'react';
import { registerUser } from '@/actions/auth-actions';
import Link from 'next/link';
import { Shield, UserPlus, QrCode, CheckCircle2, ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4 text-slate-200">
      
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {!state?.success ? (
          /* --- STATE 1: REGISTRATION FORM --- */
          <div className="p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-colors">
              <Link href="/" className="flex items-center text-xs font-medium"><ChevronLeft size={14} /> Back to Login</Link>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Personnel Registration</h2>
            <p className="text-slate-500 text-sm mb-6">Create a secure identity for the chain of custody.</p>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Username</label>
                <input name="username" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all" required />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Password</label>
                <input type="password" name="password" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all" required />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Clearance Level</label>
                <div className="relative">
                  <select name="role" className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-sm focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer">
                    <option value="officer">Field Officer (Evidence Submission)</option>
                    <option value="detective">Detective (Case Review)</option>
                    <option value="ia">Internal Affairs (Audit)</option>
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none text-slate-500">
                    <Shield size={14} />
                  </div>
                </div>
              </div>

              <button disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-lg mt-4 transition-all active:scale-[0.98] disabled:opacity-50">
                {isPending ? 'Processing...' : 'Generate Identity'}
              </button>
              
              {state?.error && <p className="text-red-400 text-xs text-center mt-2">{state.error}</p>}
            </form>
          </div>
        ) : (
          /* --- STATE 2: QR CODE SCAN --- */
          <div className="p-8 text-center animate-in slide-in-from-right duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 className="text-emerald-500 w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2">Identity Created</h2>
            <p className="text-slate-500 text-sm mb-6">Scan this TOTP code to enable Multi-Factor Auth.</p>

            <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-xl">
              <img src={state.qr} alt="MFA QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>

            <div className="bg-slate-950/50 rounded-lg p-3 mb-6 border border-slate-800">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <QrCode size={14} />
                <span>Open <strong>Google Authenticator</strong> to scan</span>
              </div>
            </div>

            <Link 
              href="/" 
              className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20"
            >
              Proceed to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}