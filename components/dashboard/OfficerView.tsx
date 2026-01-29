'use client';
import { useActionState, useEffect, useState } from 'react';
import { submitEvidence, getEvidence } from '@/actions/evidence-actions';
import { Shield, Save, FolderOpen, PlusCircle, Camera, UploadCloud, ImageIcon } from 'lucide-react';
import NotesList from './NotesList'; 

export default function OfficerView() {
  const [state, formAction, isPending] = useActionState(submitEvidence, null);
  const [myEvidence, setMyEvidence] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'cases'>('log');
  const [fileName, setFileName] = useState<string | null>(null);

  const loadEvidence = async () => {
    const data = await getEvidence();
    setMyEvidence(data);
  };

  useEffect(() => {
    loadEvidence();
    if (state?.success) {
       setActiveTab('cases');
       setFileName(null);
    }
  }, [state]);

  return (
    <div className="max-w-5xl mx-auto"> {/* Width increased for side-by-side view */}
      
      {/* TABS */}
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

      {/* TAB 1: LOG FORM */}
      {activeTab === 'log' && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-b-3xl rounded-tr-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-2 max-w-3xl mx-auto">
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
                name="description" rows={4} required placeholder="Describe item (Serial No, Condition, Location)..."
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-cyan-500/50 outline-none font-mono text-sm resize-none"
              />
            </div>

            <div className="p-5 rounded-xl bg-slate-950/30 border border-white/5 space-y-3">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Camera size={14} /> Attach Visual Evidence (Optional)
               </label>
               
               <div className="flex gap-4 items-center">
                  <div className="flex-1">
                     <input 
                       name="caption" 
                       type="text" 
                       placeholder="Image Caption (e.g. Weapon found on floor)..." 
                       className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500/50 outline-none placeholder:text-slate-600"
                     />
                  </div>
                  <div className="shrink-0 relative">
                     <input 
                       type="file" 
                       name="image" 
                       accept="image/*"
                       onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     />
                     <button type="button" className={`px-4 py-3 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${fileName ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-white/10'}`}>
                        <UploadCloud size={16} /> {fileName ? 'File Selected' : 'Upload File'}
                     </button>
                  </div>
               </div>
               {fileName && <p className="text-[10px] text-cyan-500 font-mono pl-1">Selected: {fileName}</p>}
               <p className="text-[10px] text-slate-500 italic pl-1">Images are converted to binary, AES-256 Encrypted, and hashed.</p>
            </div>

            <button disabled={isPending} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(8,145,178,0.4)]">
              {isPending ? 'Encrypting Binary Data...' : <>Secure Log <Save size={18}/></>}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: CASES LIST (SIDE BY SIDE LAYOUT) */}
      {activeTab === 'cases' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
           <div className="max-h-[700px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
             {myEvidence.length === 0 && <div className="text-center py-12 text-slate-500 italic">No cases logged yet.</div>}
             
             {myEvidence.map((e) => (
               <div key={e.id} className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                  {/* Header */}
                  <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-slate-400">#{e.id}</span>
                        <span className="text-[10px] text-indigo-300 font-bold uppercase bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{e.category}</span>
                     </div>
                     <span className="text-[10px] text-slate-500 font-mono">{new Date(e.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Side by Side Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                      {/* Left: Evidence & Image */}
                      <div className="p-6 border-b lg:border-b-0 lg:border-r border-white/5">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Primary Evidence</h4>
                         <p className="text-sm text-slate-300 mb-6 font-mono leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-white/5">
                            {e.description}
                         </p>
                         
                         {e.imageUrl ? (
                            <div className="space-y-2">
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <ImageIcon size={12} /> Visual Attachment
                               </h4>
                               {/* SCROLLABLE IMAGE CONTAINER */}
                               <div className="rounded-xl overflow-y-auto max-h-[300px] border border-white/10 relative group bg-black/50 custom-scrollbar">
                                  <img src={e.imageUrl} alt="Evidence" className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  <div className="sticky bottom-0 left-0 right-0 bg-black/80 p-2 text-[10px] text-white backdrop-blur-sm border-t border-white/10">
                                     {e.image_caption || 'Attached Evidence'}
                                  </div>
                               </div>
                            </div>
                         ) : (
                            <div className="text-xs text-slate-600 italic p-4 border border-dashed border-white/5 rounded-xl text-center">
                               No visual evidence attached.
                            </div>
                         )}
                      </div>

                      {/* Right: Notes */}
                      <div className="p-6 bg-slate-950/30">
                         <NotesList 
                            evidenceId={e.id} 
                            notes={e.notes} 
                            userRole="officer"
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