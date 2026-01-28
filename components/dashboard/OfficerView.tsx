'use client';
import { useActionState, useEffect, useState } from 'react';
import { submitEvidence, getEvidence } from '@/actions/evidence-actions';
import { Shield, Save, FolderOpen, PlusCircle } from 'lucide-react';
import NotesList from './NotesList'; 

export default function OfficerView() {
  const [state, formAction, isPending] = useActionState(submitEvidence, null);
  const [myEvidence, setMyEvidence] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'cases'>('log'); // NEW: Tabs state

  const loadEvidence = async () => {
    const data = await getEvidence();
    setMyEvidence(data);
  };

  useEffect(() => {
    loadEvidence();
    if (state?.success) {
       setActiveTab('cases'); // Auto-switch to list after submit
    }
  }, [state]);

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* TAB NAVIGATION */}
      <div className="flex gap-4 mb-6 border-b border-white/5 pb-1">
         <button 
           onClick={() => setActiveTab('log')}
           className={`px-6 py-3 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'log' ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
         >
            <PlusCircle size={16} /> Log Evidence
         </button>
         <button 
           onClick={() => setActiveTab('cases')}
           className={`px-6 py-3 rounded-t-xl text-sm font-bold transition-all flex items-center gap-2 border-b-2 ${activeTab === 'cases' ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-white'}`}
         >
            <FolderOpen size={16} /> Active Cases <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs">{myEvidence.length}</span>
         </button>
      </div>

      {/* TAB 1: SUBMIT FORM */}
      {activeTab === 'log' && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-b-3xl rounded-tr-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
              <Shield className="text-cyan-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Secure Intake</h2>
              <p className="text-slate-500 text-sm">Log new evidence into the immutable chain.</p>
            </div>
          </div>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
              <textarea 
                name="description" rows={5} required placeholder="Describe item (Serial No, Condition, Location)..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-cyan-500/50 outline-none font-mono text-sm resize-none"
              />
            </div>
            <button disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(8,145,178,0.4)]">
              {isPending ? 'Encrypting & Signing...' : <>Secure Log <Save size={18}/></>}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: SCROLLABLE CASE LIST */}
      {activeTab === 'cases' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
           {/* SCROLLABLE CONTAINER */}
           <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
             {myEvidence.length === 0 && <div className="text-center py-12 text-slate-500 italic">No cases logged yet.</div>}
             
             {myEvidence.map((e) => (
               <div key={e.id} className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400">#{e.id}</span>
                        <span className="text-[10px] text-indigo-300 font-bold uppercase bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{e.category}</span>
                     </div>
                     <span className="text-[10px] text-slate-500 font-mono">{new Date(e.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="p-5">
                     <p className="text-sm text-slate-300 mb-4 font-mono leading-relaxed">{e.description}</p>
                     
                     <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <NotesList 
                           evidenceId={e.id} 
                           notes={e.notes} 
                           userRole="officer" // Read-only
                           currentUser="" 
                        />
                     </div>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}