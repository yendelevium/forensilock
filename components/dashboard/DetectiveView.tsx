'use client';
import { getEvidence } from '@/actions/evidence-actions';
import { saveEscrowKey, savePrivateNote, getPrivateNotes } from '@/actions/note-actions';
import { generateNotebookKey, wrapKeyForServer, encryptNote, decryptNote } from '@/lib/client-crypto';
import { RefreshCw, AlertOctagon, FileWarning, ImageIcon, Lock, Shield, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import NotesList from './NotesList';

export default function DetectiveView() {
  const [activeTab, setActiveTab] = useState<'cases' | 'notebook'>('cases');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Notebook State
  const [notebookKey, setNotebookKey] = useState<CryptoKey | null>(null);
  const [keyStatus, setKeyStatus] = useState('Initializing Secure Enclave...');
  const [privateNotes, setPrivateNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [decryptedNoteContent, setDecryptedNoteContent] = useState<Record<number, string>>({});

  const currentUser = "detective_holmes"; 

  // 1. HYBRID CRYPTO SETUP (Runs once on mount)
  useEffect(() => {
    const setupCrypto = async () => {
      try {
         // A. Generate AES-256 Session Key
         const key = await generateNotebookKey();
         setNotebookKey(key);
         
         // B. Wrap with Server RSA Key (Escrow)
         const wrappedKeyBlob = await wrapKeyForServer(key);
         await saveEscrowKey(wrappedKeyBlob);
         
         setKeyStatus('AES-256 Active • RSA Escrowed');
      } catch (e) {
         console.error(e);
         setKeyStatus('Crypto Error: Check Environment Keys');
      }
    };
    setupCrypto();
  }, []);

  // 2. DATA LOADING
  const load = async () => {
    setLoading(true);
    const rows = await getEvidence();
    setData(rows);
    
    // Load Private Notes
    const pNotes = await getPrivateNotes();
    setPrivateNotes(pNotes);
    
    // Auto-Decrypt Notes if Key exists
    if (notebookKey) {
        pNotes.forEach(async (n: any) => {
            const text = await decryptNote(n.content_enc, notebookKey);
            setDecryptedNoteContent(prev => ({...prev, [n.id]: text}));
        });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [notebookKey]); // Reload when key is ready

  // 3. SAVE NOTE HANDLER
  const handleSaveNote = async () => {
     if (!newNote || !notebookKey) return;
     const encrypted = await encryptNote(newNote, notebookKey);
     await savePrivateNote(encrypted);
     setNewNote('');
     load();
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* HEADER & TABS */}
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-0">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Case Management</h2>
           <p className="text-slate-500 text-sm mt-1 mb-6">Collaborative Forensic Analysis.</p>
           
           <div className="flex gap-6">
              <button onClick={() => setActiveTab('cases')} className={`pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'cases' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400'}`}>
                  Active Cases
              </button>
              <button onClick={() => setActiveTab('notebook')} className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'notebook' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400'}`}>
                  <Lock size={14} /> Private Notebook
              </button>
           </div>
        </div>
        
        <button onClick={load} className="mb-6 bg-white/5 text-emerald-400 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-white/10 hover:bg-emerald-500/10 transition-all">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* VIEW: CASES */}
      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 gap-6">
          {data.map((e) => {
            const isDescCorrupted = e.description.startsWith("DECRYPTION_FAILURE");
            const isTotalCorruption = isDescCorrupted || e.isImageCorrupted;

            return (
              <div key={e.id} className={`backdrop-blur-md rounded-2xl border overflow-hidden shadow-lg transition-all ${isTotalCorruption ? 'bg-red-950/20 border-red-500/50' : 'bg-slate-900/40 border-white/5'}`}>
                {/* ... (Keep existing Evidence Card UI) ... */}
                <div className={`p-4 border-b flex justify-between items-center ${isTotalCorruption ? 'bg-red-500/10 border-red-500/20' : 'bg-black/20 border-white/5'}`}>
                  <span className={`font-mono text-xs ${isTotalCorruption ? 'text-red-400' : 'text-slate-500'}`}>Case ID #{e.id}</span>
                  {isTotalCorruption ? (
                      <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1 animate-pulse"><AlertOctagon size={12}/> Evidence Tampered</span>
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
                            <div><p className="font-bold text-sm">TEXT INTEGRITY FAIL</p><p className="text-xs opacity-70">Decryption Key Mismatch</p></div>
                        </div>
                      ) : (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 p-5 rounded-xl font-mono text-sm text-emerald-100/90 whitespace-pre-wrap leading-relaxed mb-6">{e.description}</div>
                      )}
                      
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2"><ImageIcon size={12} /> Visual Attachment</h4>
                      {e.isImageCorrupted ? (
                          <div className="flex items-center gap-3 text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20 h-[200px] justify-center flex-col text-center">
                              <AlertOctagon size={32} />
                              <div><p className="font-bold text-sm">IMAGE FILE CORRUPTED</p><p className="text-xs opacity-70">AES Padding Check Failed.</p></div>
                          </div>
                      ) : e.imageUrl ? (
                          <div className="rounded-xl overflow-y-auto max-h-[300px] border border-white/10 relative group bg-black/50 custom-scrollbar">
                              <img src={e.imageUrl} alt="Evidence" className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          </div>
                      ) : (
                          <div className="text-xs text-slate-600 italic p-4 border border-dashed border-white/5 rounded-xl text-center">No visual evidence attached.</div>
                      )}
                  </div>
                  <div className="p-6 bg-slate-950/30">
                      <NotesList evidenceId={e.id} notes={e.notes} userRole="detective" currentUser={currentUser} onUpdate={load} /> 
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: PRIVATE NOTEBOOK */}
      {activeTab === 'notebook' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-2">
            {/* WRITE */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-fit">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-500/10 p-2 rounded-lg"><Shield size={20} className="text-purple-500"/></div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Secure Enclave</h3>
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">{keyStatus}</p>
                  </div>
               </div>
               <textarea 
                  value={newNote} onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter confidential notes..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-purple-500/50 outline-none h-[150px] resize-none mb-4 font-mono"
               />
               <button onClick={handleSaveNote} disabled={!newNote || !notebookKey} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={16} /> Encrypt (AES-256)
               </button>
            </div>

            {/* READ */}
            <div className="lg:col-span-2 space-y-4">
               {privateNotes.map(note => (
                  <div key={note.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all group">
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(note.timestamp).toLocaleString()}</span>
                        <Lock size={12} className="text-slate-600 group-hover:text-purple-500 transition-colors"/>
                     </div>
                     {decryptedNoteContent[note.id] ? (
                        <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap">{decryptedNoteContent[note.id]}</p>
                     ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 italic"><span className="animate-spin w-3 h-3 border-2 border-slate-600 border-t-transparent rounded-full"/> Decrypting...</div>
                     )}
                  </div>
               ))}
               {privateNotes.length === 0 && <div className="text-center py-12 text-slate-600 italic">No private notes found.</div>}
            </div>
         </div>
      )}
    </div>
  );
}