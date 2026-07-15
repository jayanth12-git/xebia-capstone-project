import React, { useEffect, useState } from "react";
import { api } from "../api";
import { ChecklistItem } from "../types";
import { CheckSquare, Plus, Trash2, CheckCircle2, AlertOctagon, Loader2 } from "lucide-react";

interface ChecklistProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const Checklist: React.FC<ChecklistProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState("REGULATORY");
  const [newOrder, setNewOrder] = useState(0);
  const [addLoading, setAddLoading] = useState(false);

  const fetchChecklist = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getChecklist(selectedProtocolId);
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setCompletionPercentage(res.data.completionPercentage || 0);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load study checklist catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [selectedProtocolId]);

  const handleToggle = async (id: string, isCompleted: boolean) => {
    try {
      const res = await api.updateChecklistItem(id, { isCompleted: !isCompleted });
      if (res.success) {
        fetchChecklist();
      }
    } catch (err: any) {
      setErrorMsg("Failed to update checklist item state.");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolId || !newLabel) return;
    setAddLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.createChecklistItem(selectedProtocolId, {
        label: newLabel,
        category: newCategory,
        order: newOrder,
      });

      if (res.success) {
        setSuccessMsg("Checklist parameters registered.");
        setNewLabel("");
        setNewOrder(0);
        fetchChecklist();
      }
    } catch (err: any) {
      setErrorMsg("Failed to add checklist item.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteChecklistItem(id);
      if (res.success) {
        setSuccessMsg("Checklist parameter removed.");
        fetchChecklist();
      }
    } catch (err: any) {
      setErrorMsg("Failed to delete item.");
    }
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <CheckSquare className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to maintain regulatory compliance checklists.</p>
        </div>
      </div>
    );
  }

  // Group items by category
  const categories = ["DESIGN", "ELIGIBILITY", "SAFETY", "REGULATORY"];

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Regulatory Checklist & Compliance Gates
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Verify safety guidelines, eligibility metrics, design validations, and regulatory checklists compliance.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-300">
          <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Progress Card */}
      <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="space-y-1 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Audit Checklist Metrics Progress
          </span>
          <h3 className={`text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Study Protocol Compliance Index
          </h3>
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        <div className="text-center p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-w-[120px] flex-shrink-0">
          <span className="block text-3xl font-black font-mono text-emerald-500">{completionPercentage}%</span>
          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Approved Gates</span>
        </div>
      </div>

      {/* Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Checklist Lists (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-[11px] text-slate-400">Loading checklist data...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border rounded-xl border-dashed">
              No parameters listed. Append guidelines on the right sidebar.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = items.filter(i => i.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className={`p-5 rounded-xl border space-y-3 shadow-sm transition-all duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                  <h4 className={`font-bold tracking-widest text-[9px] uppercase font-mono ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                    {cat} Requirements Gate ({catItems.filter(i => i.isCompleted).length}/{catItems.length})
                  </h4>

                  <div className="space-y-2">
                    {catItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-lg border flex items-center justify-between gap-4 transition ${
                          item.isCompleted 
                            ? "bg-emerald-500/5 border-emerald-500/10 text-slate-400 line-through" 
                            : isDark ? "bg-slate-950 border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggle(item.id, item.isCompleted)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 bg-slate-900 focus:ring-offset-slate-900 cursor-pointer"
                          />
                          <span className="text-xs font-sans font-medium">{item.label}</span>
                        </div>

                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

        </div>

        {/* Append Sidebar Form */}
        <div className={`p-5 rounded-xl border space-y-4 shadow-sm transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-xs font-semibold border-b pb-3 flex items-center gap-2 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Append Guidelines Parameter</span>
          </h3>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Requirement Label</label>
              <textarea
                rows={2} required placeholder="E.g. Confirm informed consent form includes genetic marker disclosures..."
                value={newLabel} onChange={e => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Requirement Category</label>
                <select
                  value={newCategory} onChange={e => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
                >
                  <option value="DESIGN">Design Validation</option>
                  <option value="ELIGIBILITY">Patient Eligibility</option>
                  <option value="SAFETY">Safety Limits</option>
                  <option value="REGULATORY">Regulatory Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Order Weight</label>
                <input
                  type="number" required placeholder="0"
                  value={newOrder} onChange={e => setNewOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
                />
              </div>
            </div>

            <button
              type="submit" disabled={addLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Append Guideline Gate</span>}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
