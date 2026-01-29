'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { RefreshCw, AlertOctagon, FileWarning, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import NotesList from './NotesList';

export default function DetectiveView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const currentUser = "detective_holmes"; 

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
          const isDescCorrupted = e.description.startsWith("DECRYPTION_FAILURE");
          const isTotalCorruption = isDescCorrupted || e.isImageCorrupted;

          return (
            <div key={e.id} className={`backdrop-blur-md rounded-2xl border overflow-hidden shadow-lg transition-all ${isTotalCorruption ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/40 border-white/5'}`}>
              
              <div className={`p-4 border-b flex justify-between items-center ${isTotalCorruption ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-white/5'}`}>
                 <span className={`font-mono text-xs ${isTotalCorruption ? 'text-red-400' : 'text-slate-500'}`}>Case ID #{e.id}</span>
                 {isTotalCorruption ? (
                    <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 animate-pulse">
                        <AlertOctagon size={12}/> Evidence Tampered
                    </span>
                 ) : (
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Submitter: {e.submitted_by}</span>
                 )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                 <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Evidence</h4>
                    
                    {isDescCorrupted ? (
                       <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20 mb-6">
                          <FileWarning size={24} />
                          <div>
                             <p className="font-bold text-sm">TEXT INTEGRITY FAIL</p>
                             <p className="text-xs opacity-70">Decryption Key Mismatch</p>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-xl font-mono text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed mb-6">
                          {e.description}
                       </div>
                    )}
                    
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                       <ImageIcon size={12} /> Visual Attachment
                    </h4>

                    {e.isImageCorrupted ? (
                        <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20 h-[200px] justify-center flex-col text-center">
                            <AlertOctagon size={32} />
                            <div>
                                <p className="font-bold text-sm">IMAGE FILE CORRUPTED</p>
                                <p className="text-xs opacity-70">AES Padding Check Failed.</p>
                            </div>
                        </div>
                    ) : e.imageUrl ? (
                        /* SCROLLABLE IMAGE CONTAINER */
                        <div className="rounded-xl overflow-y-auto max-h-[300px] border border-white/10 relative group bg-black/50 custom-scrollbar">
                             <img 
                               src={e.imageUrl} 
                               alt="Evidence" 
                               className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                             />
                             {e.image_caption && (
                                <div className="sticky bottom-0 left-0 right-0 bg-black/70 p-3 text-xs text-white backdrop-blur-sm border-t border-white/10">
                                   <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wide mr-2">Caption:</span> 
                                   {e.image_caption}
                                </div>
                             )}
                             <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-emerald-500 border border-emerald-500/30 font-bold uppercase shadow-lg">
                                AES-256 Decrypted
                             </div>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-600 italic p-4 border border-dashed border-white/5 rounded-xl text-center">
                            No visual evidence attached.
                        </div>
                    )}
                 </div>

                <div className="p-6 bg-slate-950/30">
                    <NotesList 
                        evidenceId={e.id} 
                        notes={e.notes} 
                        userRole="detective" 
                        currentUser={currentUser}
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