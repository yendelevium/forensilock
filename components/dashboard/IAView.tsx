'use client';
import { getAuditLog, getAccessLogs } from '@/actions/evidence-actions';
import { Lock, Activity, Eye, ShieldAlert, FileText, ArrowDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

export default function IAView() {
  const [activeTab, setActiveTab] = useState<'integrity' | 'access'>('integrity');
  
  const [integrityLogs, setIntegrityLogs] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);

  const runAudit = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 800)); 
    setIntegrityLogs(await getAuditLog());
    setScanning(false);
  };

  const runAccessLog = async () => {
    const logs = await getAccessLogs();
    setAccessLogs(logs);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-6 mb-8">
        <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Internal Affairs</h2>
          <p className="text-slate-500 text-sm mt-1">Oversight & Audit Dashboard.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/5 pb-1">
        <button 
          onClick={() => setActiveTab('integrity')}
          className={`px-6 py-3 rounded-t-xl text-sm font-bold transition-all border-b-2 ${activeTab === 'integrity' ? 'border-red-500 text-red-400 bg-red-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Integrity Scan
        </button>
        <button 
          onClick={() => { setActiveTab('access'); runAccessLog(); }}
          className={`px-6 py-3 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'access' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
        >
          Access Logs <Eye size={14} />
        </button>
      </div>

      {activeTab === 'integrity' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-b-2xl rounded-tr-2xl border border-white/5 overflow-hidden p-6 min-h-[400px]">
           <div className="flex justify-end mb-6">
             <button 
                onClick={runAudit} 
                disabled={scanning} 
                className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70"
             >
                {scanning ? <Activity className="animate-spin" /> : <Lock />}
                {scanning ? 'Verifying Chain...' : 'Run SHA-256 Verification'}
             </button>
           </div>
           
           <div className="bg-slate-950/30 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-20 align-top">ID</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cryptographic Hash Verification</th>
                  <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-40 align-top">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {integrityLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-white/[0.02] transition-colors group ${log.status === 'TAMPERED' ? 'bg-red-500/5' : ''}`}>
                    <td className="p-5 font-mono text-slate-500 group-hover:text-slate-300 transition-colors align-top">#{log.id}</td>
                    <td className="p-5">
                        {log.status === 'SECURE' ? (
                           <div className="space-y-1">
                              <span className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest block">Stored & Verified Match</span>
                              <div className="font-mono text-xs text-cyan-300/80 bg-black/40 px-3 py-2 rounded border border-white/5 break-all">
                                  {log.storedHash}
                              </div>
                           </div>
                        ) : (
                           <div className="space-y-3">
                              <div>
                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest block mb-1">Expected (Stored)</span>
                                <div className="font-mono text-xs text-emerald-400/70 bg-emerald-900/20 px-3 py-2 rounded border border-emerald-500/20 break-all select-all">
                                    {log.storedHash}
                                </div>
                              </div>
                              
                              <div className="flex justify-center -my-2 opacity-50">
                                <ArrowDown size={14} className="text-red-500" />
                              </div>

                              <div>
                                 <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block mb-1">Actual (Calculated)</span>
                                 <div className="font-mono text-xs text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500/20 break-all select-all shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                                     {log.currentHash}
                                 </div>
                              </div>
                           </div>
                        )}
                    </td>
                    <td className="p-5 text-right align-top">
                      {log.status === 'SECURE' ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          <CheckCircle size={12} /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                          <AlertTriangle size={12} /> Tampered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {integrityLogs.length === 0 && !scanning && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-600 text-sm">
                      Initialize scanner to verify database integrity.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
           </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-b-2xl rounded-tr-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
             <thead>
               <tr className="bg-white/5 border-b border-white/5">
                 <th className="p-4 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                 <th className="p-4 text-xs font-bold text-slate-400 uppercase">User</th>
                 <th className="p-4 text-xs font-bold text-slate-400 uppercase">Action Logged</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
               {accessLogs.map((log) => (
                 <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-xs font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4 text-sm font-bold text-white">{log.user}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 bg-cyan-950 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border border-cyan-500/20">
                        <FileText size={10} /> {log.action}
                      </span>
                    </td>
                 </tr>
               ))}
               {accessLogs.length === 0 && (
                 <tr><td colSpan={3} className="p-8 text-center text-slate-600 text-sm">No activity recorded yet.</td></tr>
               )}
             </tbody>
          </table>
        </div>
      )}
    </div>
  );
}