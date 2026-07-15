import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Report } from "../types";
import { FileDown, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ReportsProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const Reports: React.FC<ReportsProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.listReports(selectedProtocolId);
      if (res.success && res.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load study reports logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedProtocolId]);

  const handleExport = (report: Report, format: "PDF" | "MARKDOWN") => {
    setSuccessMsg(`Initiating export stream for report: "${report.type}" in ${format} format.`);
    setTimeout(() => {
      setSuccessMsg(null);
      // Simulate raw asset trigger
      alert(`Success! Simulated ${format} file stream of "${report.type}" compiled and transferred to user browser memory cache.`);
    }, 1200);
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to export compiled drafts or study logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Trial Report Exports & Draft Logs
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review generated report documents, draft sections, and download validated regulatory templates.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-emerald-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400">Compiling report trees...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border rounded-xl border-dashed">
          No generated drafts registered for this protocol yet. Go to the "Protocol Generator" tab to draft sections with AI tools.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((rep) => (
            <div 
              key={rep.id} 
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-sm transition-all duration-200 ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="space-y-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                  {rep.format} Report
                </span>
                <h3 className={`text-sm font-bold tracking-tight pt-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {rep.type}
                </h3>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 max-h-24 overflow-y-auto">
                  {rep.content.substring(0, 180)}...
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono">
                  Compiled: {new Date(rep.createdAt).toLocaleDateString()}
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport(rep, "MARKDOWN")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-300 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>MD</span>
                  </button>
                  <button
                    onClick={() => handleExport(rep, "PDF")}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 cursor-pointer transition-colors shadow-sm"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
