'use client';
import { getAuditLog } from '@/actions/evidence-actions';
import { Lock, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function IAView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, tampered: 0 });

  const runAudit = async () => {
    const rows = await getAuditLog();
    const tamperedCount = rows.filter(r => r.status === 'TAMPERED').length;
    setLogs(rows);
    setStats({ total: rows.length, tampered: tamperedCount });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <ShieldCheck className="text-red-500" /> Integrity Audit
          </h2>
          <p className="text-slate-400 text-sm">Verify cryptographic hash chains for all evidence logs.</p>
        </div>
        
        <div className="flex gap-4 md:justify-end items-end">
           <button 
            onClick={runAudit} 
            className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <Lock size={18} /> Verify Chain
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {logs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <div className="text-slate-500 text-xs uppercase font-bold">Total Records</div>
            <div className="text-2xl font-mono text-white">{stats.total}</div>
          </div>
          <div className={`p-4 rounded-lg border ${stats.tampered > 0 ? 'bg-red-900/20 border-red-900/50' : 'bg-emerald-900/20 border-emerald-900/50'}`}>
            <div className={`text-xs uppercase font-bold ${stats.tampered > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              Integrity Status
            </div>
            <div className={`text-2xl font-bold flex items-center gap-2 ${stats.tampered > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {stats.tampered > 0 ? 'BREACH DETECTED' : 'SECURE'}
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="p-4 w-24 border-b border-slate-800">ID</th>
              <th className="p-4 border-b border-slate-800">Stored Hash (SHA-256)</th>
              <th className="p-4 w-48 border-b border-slate-800 text-right">Verification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-slate-500">#{log.id}</td>
                <td className="p-4 font-mono text-xs text-slate-600 truncate max-w-md">
                  <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all">
                    {log.storedHash}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {log.status === 'SECURE' ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
                      <CheckCircle size={12} /> VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-medium border border-red-500/20 animate-pulse">
                      <AlertTriangle size={12} /> TAMPERED
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-slate-600 text-sm">
                  Click "Verify Chain" to audit the immutable ledger.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}