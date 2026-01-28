import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/actions/auth-actions';
import OfficerView from '@/components/dashboard/OfficerView';
import DetectiveView from '@/components/dashboard/DetectiveView';
import IAView from '@/components/dashboard/IAView';
import { Shield, LogOut, UserCircle } from 'lucide-react';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) redirect('/');

  // FIX: Cast both properties to strings so TypeScript is happy
  const userRole = session.role as string;
  const username = session.username as string;

  // Role-Specific Theme Colors
  const themeColor = 
    userRole === 'officer' ? 'text-cyan-400' :
    userRole === 'detective' ? 'text-emerald-400' : 'text-red-400';

  const borderColor = 
    userRole === 'officer' ? 'border-cyan-500/20' :
    userRole === 'detective' ? 'border-emerald-500/20' : 'border-red-500/20';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-slate-800 border ${borderColor}`}>
            <Shield className={`w-6 h-6 ${themeColor}`} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-none">ForensiLock</h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Secure Chain of Custody</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className={`text-xs font-bold uppercase tracking-wider ${themeColor}`}>
              {userRole.replace('_', ' ')}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
              <UserCircle size={12} /> {username}
            </div>
          </div>

          <form action={logoutAction}>
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-700 hover:border-red-500/30">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {userRole === 'officer' && <OfficerView />}
        {userRole === 'detective' && <DetectiveView />}
        {userRole === 'ia' && <IAView />}
      </main>
    </div>
  );
}