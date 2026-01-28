'use client';

import { useState, useRef, useEffect } from 'react';
import { addNote, editNote } from '@/actions/evidence-actions';
import { Edit2, Save, X, MessageSquarePlus } from 'lucide-react';

export default function NotesList({ evidenceId, notes, userRole, currentUser, onUpdate }: any) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes.length]);

  const startEdit = (note: any) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleAddNote = async (formData: FormData) => {
    await addNote(formData);
    if (onUpdate) onUpdate(); 
  };

  const handleEditNote = async (formData: FormData) => {
    await editNote(formData);
    cancelEdit();
    if (onUpdate) onUpdate();
  };

  return (
    <div className="flex flex-col h-full max-h-[400px]">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2 shrink-0">
         Case Notes <span className="bg-slate-800 text-slate-400 px-1.5 rounded-full text-[10px]">{notes.length}</span>
      </h4>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4 custom-scrollbar min-h-[150px]">
        {notes.length === 0 && (
           <div className="text-center py-8 text-slate-600 text-xs italic">
              No notes added yet.
           </div>
        )}

        {notes.map((note: any) => (
          <div key={note.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-3 relative group">
            <div className="flex justify-between items-start mb-2">
               <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${note.author === currentUser ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                     {note.author.substring(0,2)}
                  </div>
                  <span className={`text-xs font-bold ${note.author === currentUser ? 'text-indigo-300' : 'text-slate-400'}`}>
                     {note.author}
                  </span>
               </div>
               <span className="text-[10px] text-slate-600 font-mono">
                  {new Date(note.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>

            {editingId === note.id ? (
              <form action={handleEditNote}>
                 <input type="hidden" name="note_id" value={note.id} />
                 <textarea 
                    name="note_text" 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg p-2 text-xs text-white focus:outline-none resize-none mb-2"
                    rows={3}
                 />
                 <div className="flex justify-end gap-2">
                    <button type="button" onClick={cancelEdit} className="text-xs text-slate-500 hover:text-white"><X size={14}/></button>
                    <button type="submit" className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded flex items-center gap-1">
                       <Save size={12} /> Save
                    </button>
                 </div>
              </form>
            ) : (
              <>
                 <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.text}
                 </p>
                 {userRole === 'detective' && note.author === currentUser && (
                    <button onClick={() => startEdit(note)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-indigo-400">
                       <Edit2 size={12} />
                    </button>
                 )}
              </>
            )}
          </div>
        ))}
      </div>

      {userRole === 'detective' ? (
         <form action={handleAddNote} className="mt-auto relative shrink-0">
            <input type="hidden" name="evidence_id" value={evidenceId} />
            <input name="note_text" type="text" placeholder="Add forensic finding..." className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-600" required autoComplete="off" />
            <button className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-all shadow-lg">
               <MessageSquarePlus size={16} />
            </button>
         </form>
      ) : (
         <div className="text-center text-[10px] text-slate-600 bg-slate-900/30 py-2 rounded-lg border border-white/5 shrink-0">
            Read-Only Access
         </div>
      )}
    </div>
  );
}