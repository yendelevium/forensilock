import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/actions/auth-actions';
import OfficerView from '@/components/dashboard/OfficerView';
import DetectiveView from '@/components/dashboard/DetectiveView';
import IAView from '@/components/dashboard/IAView';
import { Shield, LogOut, User, CircleDot } from 'lucide-react';

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect('/');

  const userRole = session.role as string;
  const username = session.username as string;

  // Dynamic Theme Colors based on Role
  const theme = {
    officer: { text: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'shadow-cyan-900/20' },
    detective: { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'shadow-emerald-900/20' },
    ia: { text: 'text-red-400', border: 'border-red-500/30', bg: 'shadow-red-900/20' }
  }[userRole as 'officer' | 'detective' | 'ia'];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 selection:bg-cyan-500/30">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl bg-slate-900/50 border ${theme.border} shadow-[0_0_15px_-3px_rgba(0,0,0,0.1)]`}>
            <Shield className={`w-6 h-6 ${theme.text}`} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">ForensiLock</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${theme.text.replace('text-', 'bg-')} animate-pulse`}></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">System Secure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block group cursor-default">
            <div className={`text-xs font-bold uppercase tracking-widest ${theme.text} mb-0.5`}>
              {userRole.replace('_', ' ')}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-end gap-1.5 group-hover:text-slate-300 transition-colors">
              <User size={12} /> {username}
            </div>
          </div>

          <form action={logoutAction}>
            <button className="flex items-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-slate-400 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-white/5 hover:border-red-500/20">
              <LogOut size={14} />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </form>
        </div>
      </nav>

      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        {userRole === 'officer' && <OfficerView />}
        {userRole === 'detective' && <DetectiveView />}
        {userRole === 'ia' && <IAView />}
      </main>
    </div>
  );
}