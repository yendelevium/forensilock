'use client';
import { submitEvidence } from '@/actions/evidence-actions';
import { FileText } from 'lucide-react';
import { useRef } from 'react';

export default function OfficerView() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    await submitEvidence(formData);
    alert('Evidence Encrypted & Logged');
    formRef.current?.reset();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-cyan-500 mb-6 flex items-center gap-2"><FileText /> Evidence Submission</h2>
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
        <form ref={formRef} action={handleSubmit}>
          <textarea name="description" className="w-full bg-slate-950 text-white p-4 rounded-lg border border-slate-800 h-40 mb-4 focus:ring-1 focus:ring-cyan-500 outline-none" placeholder="Enter sensitive evidence details..." required />
          <button className="bg-cyan-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-cyan-500 w-full">Secure Log</button>
        </form>
      </div>
    </div>
  );
}