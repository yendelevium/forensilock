'use client';
import { submitEvidence } from '@/actions/evidence-actions';
import { FileText, Lock, Send, CheckCircle2 } from 'lucide-react';
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
      <div className="mb-8 border-l-4 border-cyan-500 pl-4">
        <h2 className="text-3xl font-bold text-white">Evidence Submission</h2>
        <p className="text-slate-400 text-sm mt-1">Securely encrypt and log physical evidence into the immutable ledger.</p>
      </div>

      <div className="bg-slate-900 p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl border border-slate-800">
        <div className="bg-slate-950 p-8 rounded-xl relative overflow-hidden">
          
          {/* Status Overlay */}
          {status === 'success' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 animate-in fade-in">
              <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
              <h3 className="text-xl font-bold text-white">Evidence Secured</h3>
              <p className="text-slate-400 text-sm">AES-256 Encryption Applied</p>
            </div>
          )}

          <form ref={formRef} action={handleSubmit} className="relative z-0">
            <div className="mb-6">
              <label className="block text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <FileText size={14} /> Description
              </label>
              <textarea 
                name="description" 
                className="w-full bg-slate-900 text-slate-200 p-4 rounded-lg border border-slate-800 h-40 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                placeholder="Enter detailed description of seized item..." 
                required 
              />
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-900">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock size={12} /> End-to-End Encrypted
              </div>
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95">
                <Send size={16} /> Submit Log
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}