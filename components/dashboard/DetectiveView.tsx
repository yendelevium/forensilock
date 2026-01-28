'use client';
import { getEvidence, submitAnalysis } from '@/actions/evidence-actions';
import { RefreshCw, Database, AlertOctagon, FileWarning, ShieldCheck, Send } from 'lucide-react';
import { useState } from 'react';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); 
    setData(await getEvidence());
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Case Files</h2>
           <p className="text-slate-500 text-sm mt-1">Decrypt evidence & add forensic notes.</p>
        </div>
        <button onClick={load} className="bg-white/5 text-slate-300 hover:text-emerald-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-white/10 hover:border-emerald-500/30 transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Decrypting...' : 'Fetch & Log Access'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.map((e) => {
          const isCorrupted = e.description.startsWith("DECRYPTION_FAILURE");

          return (
            <div key={e.id} className={`backdrop-blur-md rounded-2xl border overflow-hidden shadow-lg transition-all ${isCorrupted ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/50 border-white/5'}`}>
              
              {/* Header */}
              <div className={`p-4 border-b flex justify-between items-center ${isCorrupted ? 'bg-red-500/10 border-red-500/20' : 'bg-white/[0.02] border-white/5'}`}>
                 <span className="font-mono text-xs text-slate-500">#{e.id}</span>
                 {isCorrupted ? (
                    <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><AlertOctagon size={12}/> Tampered</span>
                 ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Submitted By: {e.submitted_by}</span>
                 )}
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 
                 {/* LEFT: EVIDENCE */}
                 <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Decrypted Evidence</h4>
                    {isCorrupted ? (
                       <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                          <FileWarning size={24} />
                          <div>
                             <p className="font-bold text-sm">DATA CORRUPTION</p>
                             <p className="text-xs opacity-70">Integrity check failed.</p>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl font-mono text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed">
                          {e.description}
                       </div>
                    )}
                 </div>

                 {/* RIGHT: NOTES (New Feature) */}
                 <div className="border-l border-white/5 pl-8">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <ShieldCheck size={14} className="text-indigo-400"/> Forensic Notes
                    </h4>

                    {e.analysis ? (
                       <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl relative">
                          <p className="text-sm text-indigo-200">{e.analysis}</p>
                          <div className="mt-3 pt-3 border-t border-indigo-500/20 text-[10px] text-indigo-400 font-bold uppercase text-right">
                             Signed: {e.analyzed_by}
                          </div>
                       </div>
                    ) : !isCorrupted ? (
                       <form action={async (formData) => { await submitAnalysis(formData); load(); }} className="relative">
                          <input type="hidden" name="id" value={e.id} />
                          <textarea 
                             name="analysis" rows={3} placeholder="Add findings..." required
                             className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-indigo-500/50 outline-none resize-none placeholder:text-slate-600"
                          />
                          <button className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-all shadow-lg">
                             <Send size={14} />
                          </button>
                       </form>
                    ) : (
                       <div className="text-xs text-slate-600 italic py-4 text-center">Cannot add notes to corrupted evidence.</div>
                    )}
                 </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}