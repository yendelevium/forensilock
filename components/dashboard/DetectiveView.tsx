'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { RefreshCw, Database } from 'lucide-react';
import { useState } from 'react';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); 
    const rows = await getEvidence();
    setData(rows);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div className="flex gap-4 items-center">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                <Database className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Case Files</h2>
                <p className="text-slate-500 text-sm mt-1">Decrypt evidence from the vault.</p>
            </div>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 text-slate-300 border border-white/10 hover:border-emerald-500/30 px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 backdrop-blur-md"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Decrypting...' : 'Fetch & Decrypt'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.map((e) => (
          <div key={e.id} className="group relative bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 overflow-hidden">
            {/* Removed the Unlock Icon Overlay here */}
            
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <span className="font-mono text-xs text-slate-500">ID: <span className="text-slate-300">#{e.id.toString().padStart(4, '0')}</span></span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                Verified: {e.submitted_by}
              </span>
            </div>
            
            <div className="p-6">
              <p className="font-mono text-emerald-100/80 text-sm leading-relaxed whitespace-pre-wrap">
                {e.description}
              </p>
            </div>
          </div>
        ))}
        
        {data.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <Database className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Vault locked. Authenticate to decrypt files.</p>
          </div>
        )}
      </div>
    </div>
  );
}