'use client';
import { submitEvidence } from '@/actions/evidence-actions';
import { FileText, Lock, Send, CheckCircle2, Shield } from 'lucide-react';
import { useRef, useState } from 'react';

export default function OfficerView() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = async (formData: FormData) => {
    await submitEvidence(formData);
    setStatus('success');
    formRef.current?.reset();
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header - Cleaner, less glow */}
      <div className="mb-8 flex items-end gap-4 border-b border-slate-800 pb-6">
        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-cyan-500">
            <FileText className="w-8 h-8" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Evidence Log</h2>
            <p className="text-slate-400 text-sm mt-1">Secure intake for physical evidence.</p>
        </div>
      </div>

      {/* Main Card - High contrast, solid background */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          
          {/* Success Overlay */}
          {status === 'success' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center z-20 animate-in fade-in duration-300">
              <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-white">Log Secured</h3>
              <p className="text-slate-400 text-xs mt-2 font-mono bg-slate-900 px-3 py-1 rounded border border-slate-800">
                AES-256 ENCRYPTED
              </p>
            </div>
          )}

          <form ref={formRef} action={handleSubmit} className="p-8">
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Shield size={12} className="text-cyan-600" /> Evidence Description
              </label>
              
              {/* Text Area - White text on dark background for maximum readability */}
              <textarea 
                name="description" 
                className="w-full bg-slate-950 text-white p-5 rounded-xl border border-slate-700 h-48 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600 resize-none font-mono text-sm leading-relaxed"
                placeholder="TYPE: HARD DRIVE&#10;SN: 8X99-221&#10;LOC: SERVER ROOM B..." 
                required 
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                <Lock size={10} /> End-to-End Encrypted
              </div>
              
              <button className="bg-cyan-700 hover:bg-cyan-600 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95">
                <span>Secure Log</span>
                <Send size={16} />
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}