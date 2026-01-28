'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { RefreshCw, Database, AlertOctagon, FileWarning } from 'lucide-react';
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
        {data.map((e) => {
          const isCorrupted = e.description.startsWith("DECRYPTION_FAILURE");

          return (
            <div 
              key={e.id} 
              className={`group relative backdrop-blur-md rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg 
                ${isCorrupted 
                  ? 'bg-red-950/20 border-red-500/50 hover:shadow-red-900/20' 
                  : 'bg-slate-900/50 border-white/5 hover:border-emerald-500/30 hover:shadow-emerald-900/10'
                }`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isCorrupted ? 'bg-red-500/10 border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                <span className={`font-mono text-xs ${isCorrupted ? 'text-red-400' : 'text-slate-500'}`}>
                  ID: <span className={isCorrupted ? 'text-red-200 font-bold' : 'text-slate-300'}>#{e.id.toString().padStart(4, '0')}</span>
                </span>
                
                {/* --- CHANGED BADGE LOGIC HERE --- */}
                {isCorrupted ? (
                   <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-950 px-2 py-1 rounded border border-red-500/40 flex items-center gap-1 animate-pulse">
                     <AlertOctagon size={10} /> Tampered: {e.submitted_by}
                   </span>
                ) : (
                   <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                     Verified: {e.submitted_by}
                   </span>
                )}
              </div>
              
              <div className="p-6">
                {isCorrupted ? (
                  <div className="flex flex-col items-center text-center py-2">
                     <FileWarning className="w-10 h-10 text-red-500 mb-2" />
                     <p className="text-red-400 font-bold text-sm">DATA CORRUPTION DETECTED</p>
                     <p className="text-red-500/60 text-xs mt-1 font-mono">
                        Error: Block Padding Mismatch.<br/>Ciphertext has been modified.
                     </p>
                  </div>
                ) : (
                  <p className="font-mono text-emerald-100/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {e.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}