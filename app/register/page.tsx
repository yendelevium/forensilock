'use client';

import { useActionState } from 'react';
import { registerUser } from '@/actions/auth-actions';
import Link from 'next/link';
import { Shield, UserPlus, QrCode, CheckCircle2, ChevronLeft, CreditCard, Info } from 'lucide-react';

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-6 text-slate-200">
      
      {/* Background Accent */}
      <div className="absolute w-full h-[1px] bottom-0 bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>

      <div className="w-full max-w-[420px] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/5">
        
        {!state?.success ? (
          /* --- STATE 1: FORM --- */
          <div className="p-8 animate-in fade-in zoom-in-95 duration-500">
            <Link href="/" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors mb-6 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Return to Login
            </Link>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white tracking-tight">New Clearance</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Create a digital identity for the ledger.</p>
            </div>

            <form action={formAction} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Username</label>
                <input name="username" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-700" placeholder="e.g. officer_doe" required />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Passphrase</label>
                <input type="password" name="password" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-700" placeholder="••••••••" required />
                
                {/* --- NIST COMPLIANCE HINT ADDED HERE --- */}
                <div className="flex items-start gap-1.5 pt-1 pl-1">
                  <Info size={12} className="text-slate-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-tight">
                    NIST Compliant: Must be at least <strong>8 characters</strong>. Common passwords (e.g. 'password123') and your username are prohibited.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Clearance Role</label>
                <div className="relative">
                  <select name="role" className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none appearance-none cursor-pointer hover:bg-slate-900 transition-colors">
                    <option value="officer">Field Officer (Evidence Writer)</option>
                    <option value="detective">Detective (Evidence Reader)</option>
                    <option value="ia">Internal Affairs (System Auditor)</option>
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-slate-500">
                    <CreditCard size={16} />
                  </div>
                </div>
              </div>

              <button disabled={isPending} className="w-full bg-white text-slate-950 font-bold py-3.5 rounded-xl mt-4 transition-all hover:bg-cyan-50 hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                {isPending ? <span className="animate-pulse">Processing...</span> : (
                  <>Generate ID <UserPlus size={16} /></>
                )}
              </button>
              
              {state?.error && <div className="text-red-400 text-xs text-center font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{state.error}</div>}
            </form>
          </div>
        ) : (
          /* --- STATE 2: SUCCESS --- */
          <div className="p-8 text-center animate-in slide-in-from-right duration-500 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="text-emerald-400 w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Registration Complete</h2>
            <p className="text-slate-500 text-xs font-medium mb-8 max-w-[250px] mx-auto">
              Your digital identity is active. Scan the QR code below to bind your MFA device.
            </p>

            <div className="bg-white p-3 rounded-2xl inline-block mb-8 shadow-2xl ring-4 ring-emerald-500/20">
              <img src={state.qr} alt="MFA QR Code" className="w-40 h-40 mix-blend-multiply opacity-90" />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 mb-6">
              <QrCode size={12} /> Scan with Authenticator
            </div>

            <Link 
              href="/" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] block"
            >
              Proceed to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}