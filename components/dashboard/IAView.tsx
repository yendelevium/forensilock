'use client';
import { getAuditLog } from '@/actions/evidence-actions';
import { Lock, AlertTriangle, CheckCircle, ShieldAlert, Activity, ArrowDown } from 'lucide-react';
import { useState } from 'react';

export default function IAView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, tampered: 0 });
  const [scanning, setScanning] = useState(false);

  const runAudit = async () => {
    setScanning(true);
    await new Promise(r => setTimeout(r, 800)); 
    const rows = await getAuditLog();
    const tamperedCount = rows.filter(r => r.status === 'TAMPERED').length;
    setLogs(rows);
    setStats({ total: rows.length, tampered: tamperedCount });
    setScanning(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 flex items-center gap-6">
          <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 shadow-[0_0_30px_-10px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Integrity Audit</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time SHA-256 hash chain verification.</p>
          </div>
        </div>
        
        <div className="flex items-center justify-end">
           <button 
            onClick={runAudit} 
            disabled={scanning}
            className="w-full lg:w-auto bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale"
          >
            {scanning ? <Activity className="animate-spin" /> : <Lock />}
            {scanning ? 'Verifying Chain...' : 'Run Integrity Scan'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8 animate-in slide-in-from-bottom-4">
          <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-6 rounded-2xl">
            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Records</div>
            <div className="text-3xl font-mono text-white">{stats.total}</div>
          </div>
          <div className={`p-6 rounded-2xl border backdrop-blur transition-colors ${stats.tampered > 0 ? 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : 'bg-emerald-500/10 border-emerald-500/30 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'}`}>
            <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${stats.tampered > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              System Status
            </div>
            <div className={`text-3xl font-bold flex items-center gap-3 ${stats.tampered > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {stats.tampered > 0 ? 'INTEGRITY FAIL' : 'SECURE'}
              {stats.tampered > 0 && <AlertTriangle className="animate-pulse" />}
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest w-20 align-top">ID</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cryptographic Hash Verification</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right w-40 align-top">Verdict</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className={`hover:bg-white/[0.02] transition-colors group ${log.status === 'TAMPERED' ? 'bg-red-500/5' : ''}`}>
                <td className="p-5 font-mono text-slate-500 group-hover:text-slate-300 transition-colors align-top">#{log.id}</td>
                <td className="p-5">
                    {log.status === 'SECURE' ? (
                       /* SECURE VIEW */
                       <div className="space-y-1">
                          <span className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-widest block">Stored & Verified Match</span>
                          <div className="font-mono text-xs text-cyan-300/80 bg-black/40 px-3 py-2 rounded border border-white/5 break-all">
                              {log.storedHash}
                          </div>
                       </div>
                    ) : (
                       /* TAMPERED VIEW - THE DIFF */
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
                                 {log.calculatedHash}
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
            {logs.length === 0 && !scanning && (
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
  );
}