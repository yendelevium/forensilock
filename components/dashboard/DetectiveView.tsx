'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { Eye, Unlock, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    // Simulate decryption delay for effect
    await new Promise(r => setTimeout(r, 600)); 
    const rows = await getEvidence();
    setData(rows);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Eye className="text-emerald-500" /> Case Files
          </h2>
          <p className="text-slate-400 text-sm mt-1">Decrypt and view evidence logs.</p>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="bg-slate-800 hover:bg-emerald-900/30 hover:text-emerald-400 text-slate-300 border border-slate-700 hover:border-emerald-500/50 px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Decrypting...' : 'Fetch & Decrypt'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((e) => (
          <div key={e.id} className="group bg-slate-900 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-emerald-900/10">
            <div className="bg-slate-950/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">REF-ID: <span className="text-slate-300">#{e.id.toString().padStart(4, '0')}</span></span>
              <span className="text-[10px] uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-1 rounded">
                Agnt: {e.submitted_by}
              </span>
            </div>
            
            <div className="p-5 relative">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Unlock size={16} className="text-emerald-500" />
              </div>
              <p className="font-mono text-emerald-100/90 text-sm leading-relaxed whitespace-pre-wrap">
                {e.description}
              </p>
            </div>
          </div>
        ))}
        
        {data.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
            No active case files loaded.
          </div>
        )}
      </div>
    </div>
  );
}