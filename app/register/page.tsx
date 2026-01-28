'use client';

// 1. Change Import
import { useActionState } from 'react';
import { registerUser } from '@/actions/auth-actions';
import Link from 'next/link';
import { Shield, UserPlus, QrCode } from 'lucide-react';

export default function RegisterPage() {
  // 2. Update Hook
  const [state, formAction, isPending] = useActionState(registerUser, null);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200">
      <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 w-96 shadow-2xl">
        <h1 className="text-2xl font-bold text-cyan-500 mb-2 flex items-center gap-2">
          <Shield /> ForensiLock
        </h1>
        <p className="text-slate-500 mb-6 text-sm">Secure Personnel Registration</p>

        {!state?.success ? (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400">Username</label>
              <input name="username" className="w-full bg-slate-800 p-2 rounded border border-slate-700 focus:border-cyan-500 outline-none" required />
            </div>
            
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <input type="password" name="password" className="w-full bg-slate-800 p-2 rounded border border-slate-700 focus:border-cyan-500 outline-none" required />
            </div>

            <div>
              <label className="text-xs text-slate-400">Clearance Role</label>
              <select name="role" className="w-full bg-slate-800 p-2 rounded border border-slate-700 focus:border-cyan-500 outline-none">
                <option value="officer">Field Officer (Writer)</option>
                <option value="detective">Detective (Reader)</option>
                <option value="ia">Internal Affairs (Auditor)</option>
              </select>
            </div>

            <button disabled={isPending} className="w-full bg-cyan-600 p-3 rounded font-bold hover:bg-cyan-500 transition flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus size={18} /> {isPending ? 'Creating...' : 'Create ID'}
            </button>
            
            {state?.error && <p className="text-red-400 text-sm text-center">{state.error}</p>}
            
            <div className="text-center text-xs mt-4">
              <Link href="/" className="text-slate-400 hover:text-cyan-400">Already have an ID? Login</Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white p-4 rounded-lg inline-block">
              <img src={state.qr} alt="MFA QR Code" className="w-48 h-48" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                <QrCode size={18} /> Scan Required
              </h3>
              <p className="text-sm text-slate-400">
                Open Google Authenticator and scan this code. You will need it to login.
              </p>
            </div>

            <Link 
              href="/" 
              className="block w-full bg-emerald-600 p-3 rounded font-bold hover:bg-emerald-500 transition"
            >
              Proceed to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}