'use client';
import { getAuditLog } from '@/actions/evidence-actions';
import { Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function IAView() {
  const [logs, setLogs] = useState<any[]>([]);

  const runAudit = async () => {
    const rows = await getAuditLog();
    setLogs(rows);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-red-500 flex items-center gap-2"><Lock /> Integrity Audit</h2>
        <button onClick={runAudit} className="bg-red-900/20 text-red-400 border border-red-900/50 px-6 py-2 rounded font-bold hover:bg-red-900/40">Verify Hash Chain</button>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-left bg-slate-900">
          <thead className="bg-slate-950 text-slate-500">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Stored Hash (SHA-256)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/50 transition">
                <td className="p-4 font-mono text-slate-400">{log.id}</td>
                <td className="p-4 font-mono text-xs text-slate-600 truncate max-w-xs">{log.storedHash}</td>
                <td className="p-4">
                  {log.status === 'SECURE' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-900">
                      <CheckCircle size={12} /> SECURE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-950 text-red-400 px-2 py-1 rounded text-xs border border-red-900 animate-pulse">
                      <AlertTriangle size={12} /> TAMPERED
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}