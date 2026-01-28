'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { RefreshCw, AlertOctagon, FileWarning } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotesList from './NotesList';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>(''); 

  const load = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); 
    const rows = await getEvidence();
    setData(rows);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Case Management</h2>
           <p className="text-slate-500 text-sm mt-1">Collaborative Forensic Analysis.</p>
        </div>
        <button onClick={load} className="bg-white/5 text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-white/10 hover:bg-emerald-500/10 transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {data.map((e) => {
          const isCorrupted = e.description.startsWith("DECRYPTION_FAILURE");

          return (
            <div key={e.id} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-lg">
              
              {/* Header */}
              <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                 <span className="font-mono text-xs text-slate-500">Case ID #{e.id}</span>
                 {isCorrupted ? (
                    <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><AlertOctagon size={12}/> Evidence Corrupted</span>
                 ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Submitter: {e.submitted_by}</span>
                 )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                 {/* LEFT: EVIDENCE */}
                 <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Evidence</h4>
                    {isCorrupted ? (
                       <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                          <FileWarning size={24} />
                          <div>
                             <p className="font-bold text-sm">DATA INTEGRITY FAIL</p>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-xl font-mono text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed min-h-[150px]">
                          {e.description}
                       </div>
                    )}
                 </div>

                 {/* RIGHT: COLLABORATIVE NOTES */}
                <div className="p-6 bg-slate-950/30">
                    <NotesList 
                        evidenceId={e.id} 
                        notes={e.notes} 
                        userRole="detective" 
                        currentUser="detective_holmes"
                        onUpdate={load}
                    /> 
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}