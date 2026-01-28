'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { Eye } from 'lucide-react';
import { useState } from 'react';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);

  const load = async () => {
    const rows = await getEvidence();
    setData(rows);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-emerald-500 flex items-center gap-2"><Eye /> Case Files</h2>
        <button onClick={load} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-sm transition">Decrypt & Fetch</button>
      </div>
      <div className="grid gap-4">
        {data.map((e) => (
          <div key={e.id} className="bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-emerald-500/30 transition">
            <div className="text-xs text-slate-500 mb-2">ID: {e.id} | Agent: {e.submitted_by}</div>
            <div className="font-mono text-emerald-100">{e.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}