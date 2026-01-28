import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import OfficerView from '@/components/dashboard/OfficerView';
import DetectiveView from '@/components/dashboard/DetectiveView';
import IAView from '@/components/dashboard/IAView';

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session) redirect('/');

  // FIX: Cast the role to a string so TypeScript allows it in JSX and comparisons
  const userRole = session.role as string;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <nav className="border-b border-slate-800 bg-slate-900/50 p-4 flex justify-between items-center backdrop-blur">
        <div className="font-bold text-xl text-cyan-400">ForensiLock <span className="text-xs text-slate-500 border border-slate-700 px-1 rounded ml-2">SECURE</span></div>
        <div className="flex items-center gap-4">
          {/* Now using userRole which is strictly typed as string */}
          <span className="text-xs uppercase tracking-wider text-slate-500">Identity: <span className="text-slate-200 font-bold">{userRole}</span></span>
        </div>
      </nav>

      <main className="p-8">
        {userRole === 'officer' && <OfficerView />}
        {userRole === 'detective' && <DetectiveView />}
        {userRole === 'ia' && <IAView />}
      </main>
    </div>
  );
}