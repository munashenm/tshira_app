"use client";

import { useState, useRef } from "react";
import { X, FileUp, CheckCircle2, Loader2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";
import { Role } from "@prisma/client";

export default function UploadDocumentModal({ 
  caseId
}: { 
  caseId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("Data Form");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !currentPersona) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", docType);
    formData.append("uploadedBy", currentPersona.name);

    try {
      const res = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setIsOpen(false);
        setFile(null);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const getAvailableDocTypes = () => {
    if (!currentPersona) return [];
    const role = currentPersona.role;
    
    if (role === Role.ADMIN_OFFICER) return ["Data Form", "Draft Plan", "Final Plan", "Proof of Approval"];
    if (role === Role.DATA_COLLECTION_OFFICER) return ["Data Form"];
    if (role === Role.BUSINESS_CONSULTANT) return ["Draft Plan"];
    if (role === Role.REVIEWER) return ["Final Plan"];
    if (role === Role.FINANCE) return ["Proof of Approval"];
    
    return [];
  };

  const availableTypes = getAvailableDocTypes();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-4 py-2 rounded-lg transition-colors border border-blue-100 dark:border-blue-900/30"
      >
        <FileUp className="w-4 h-4" />
        Upload Deliverable
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Upload Project Document</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <form onSubmit={handleUpload} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Document Type</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {availableTypes.length > 0 ? (
                availableTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))
              ) : (
                <option value="">No types available for your role</option>
              )}
            </select>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${
              file 
                ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10" 
                : "border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" 
            />
            {file ? (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{file.name}</p>
                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(1)} KB • Ready to upload</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center mx-auto">
                  <FileUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Click to browse or drag file here</p>
                <p className="text-xs text-zinc-400">PDF, DOCX, or Image (Max 10MB)</p>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={!file || isUploading || availableTypes.length === 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
              !file || isUploading || availableTypes.length === 0
                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 shadow-none cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-[0.98]"
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading to Cloud...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Submit Document
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
