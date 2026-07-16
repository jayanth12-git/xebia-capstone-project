import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Risk } from "../types";
import { ShieldAlert, Plus, Trash2, Edit2, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface RiskMatrixProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SAFETY");
  const [probability, setProbability] = useState(3);
  const [impact, setImpact] = useState(3);
  const [mitigationPlan, setMitigationPlan] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchRisks = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.listRisks(selectedProtocolId);
      if (res.success && res.data?.risks) {
        setRisks(res.data.risks);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load protocol risks catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [selectedProtocolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolId) return;
    setFormLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (editingId) {
        const res = await api.updateRisk(editingId, {
          title,
          description,
          category,
          probability,
          impact,
          mitigationPlan,
        });
        if (res.success) {
          setSuccessMsg("Risk assessment updated successfully.");
          setEditingId(null);
          setShowAddForm(false);
          fetchRisks();
          resetForm();
        }
      } else {
        const res = await api.createRisk(selectedProtocolId, {
          title,
          description,
          category,
          probability,
          impact,
          mitigationPlan,
        });
        if (res.success) {
          setSuccessMsg("New trial risk mapped successfully.");
          setShowAddForm(false);
          fetchRisks();
          resetForm();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during risk registration.");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("SAFETY");
    setProbability(3);
    setImpact(3);
    setMitigationPlan("");
    setEditingId(null);
  };

  const handleEdit = (r: Risk) => {
    setTitle(r.title);
    setDescription(r.description);
    setCategory(r.category);
    setProbability(r.probability);
    setImpact(r.impact);
    setMitigationPlan(r.mitigationPlan);
    setEditingId(r.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this risk assessment log?")) return;
    try {
      const res = await api.deleteRisk(id);
      if (res.success) {
        setSuccessMsg("Risk log deleted successfully.");
        fetchRisks();
      }
    } catch (err: any) {
      setErrorMsg("Failed to delete risk log.");
    }
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to evaluate its risk matrix heatmaps.</p>
        </div>
      </div>
    );
  }

  // 5x5 grid generation
  const gridCells = [];
  for (let prob = 5; prob >= 1; prob--) {
    for (let imp = 1; imp <= 5; imp++) {
      const score = prob * imp;
      let heatBg = "bg-emerald-500/10 border-emerald-500/25"; // Low
      if (score >= 15) heatBg = "bg-rose-500/40 dark:bg-rose-500/20 border-rose-500/40"; // Critical
      else if (score >= 10) heatBg = "bg-orange-500/30 dark:bg-orange-500/20 border-orange-500/30"; // High
      else if (score >= 5) heatBg = "bg-amber-500/20 border-amber-500/20"; // Medium

      // Find risks matching this coordinate
      const matchingRisks = risks.filter(r => r.probability === prob && r.impact === imp);

      gridCells.push(
        <div 
          key={`${prob}-${imp}`} 
          className={`h-12 border relative flex items-center justify-center text-[10px] font-mono group transition hover:brightness-105 rounded-sm ${heatBg}`}
        >
          {matchingRisks.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center justify-center p-1">
              {matchingRisks.map(r => (
                <span 
                  key={r.id} 
                  title={r.title}
                  className="w-4 h-4 rounded-full bg-slate-950 text-white font-sans font-bold flex items-center justify-center text-[8px] cursor-pointer"
                  onClick={() => handleEdit(r)}
                >
                  {risks.indexOf(r) + 1}
                </span>
              ))}
            </div>
          )}
          {/* Coordinate label on hover */}
          <div className="absolute opacity-0 group-hover:opacity-100 bg-slate-950 text-white text-[8px] px-1 rounded pointer-events-none z-10 font-mono -bottom-4">
            P:{prob}, I:{imp}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Trial Risk Heat Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Map clinical, operational, and safety risks onto a 5x5 probability vs impact coordinate grid.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-md shadow-sky-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "View Risks List" : "Add Risk Assessment"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {showAddForm ? (
        /* Form View */
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border max-w-xl mx-auto space-y-4 ${isDark ? "bg-slate-900/35 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className="text-sm font-semibold border-b pb-3 text-slate-800 dark:text-slate-200">
            {editingId ? "Edit Risk Assessment log" : "Map New Study Risk"}
          </h3>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Risk Title / Event</label>
            <input
              type="text" required placeholder="E.g. Delayed Site Recruitment"
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Description</label>
            <textarea
              rows={2} required placeholder="Describe triggering events or causal parameters..."
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Category</label>
              <select
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="SAFETY">Patient Safety</option>
                <option value="OPERATIONAL">Operational</option>
                <option value="REGULATORY">Regulatory</option>
                <option value="DATA_INTEGRITY">Data Integrity</option>
                <option value="FINANCIAL">Financial</option>
                <option value="RECRUITMENT">Recruitment</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Probability (1-5)</label>
              <select
                value={probability} onChange={e => setProbability(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-bold"
              >
                <option value="1">1 - Remote</option>
                <option value="2">2 - Unlikely</option>
                <option value="3">3 - Possible</option>
                <option value="4">4 - Highly Probable</option>
                <option value="5">5 - Near Certainty</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Impact Severity (1-5)</label>
              <select
                value={impact} onChange={e => setImpact(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-bold"
              >
                <option value="1">1 - Negligible</option>
                <option value="2">2 - Minor</option>
                <option value="3">3 - Moderate</option>
                <option value="4">4 - Critical</option>
                <option value="5">5 - Catastrophic / Fatal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Mitigation & Containment Plan</label>
            <textarea
              rows={3} required placeholder="Detailed contingency measures and site directives..."
              value={mitigationPlan} onChange={e => setMitigationPlan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 text-xs font-semibold cursor-pointer text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={formLoading}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Risk Entry</span>}
            </button>
          </div>
        </form>
      ) : (
        /* Workspace split: Grid on left, List on right */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Grid Layout Map */}
          <div className={`p-6 rounded-xl border space-y-6 ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            <h3 className={`text-sm font-semibold border-b pb-3 text-slate-800 dark:text-slate-200`}>
              Grid Visual Mapping
            </h3>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-3">
                <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                <span className="text-xs text-slate-400">Loading risk map...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start">
                  {/* Y Axis Label */}
                  <div className="h-60 flex items-center justify-center mr-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 origin-center -rotate-90">
                      Probability (5 to 1)
                    </span>
                  </div>

                  {/* Matrix */}
                  <div className="flex-1 space-y-1">
                    <div className="grid grid-cols-5 gap-1">
                      {gridCells}
                    </div>

                    {/* X Axis Label */}
                    <div className="text-center mt-3 text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                      Impact Severity (1 to 5)
                    </div>
                  </div>
                </div>

                {/* Heatmap Legends */}
                <div className="flex gap-4 items-center justify-center text-[10px] font-mono font-semibold text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/20" />
                    <span>Low</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/30" />
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-orange-500/30 border border-orange-500/30" />
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500/40 border border-rose-500/40" />
                    <span>Critical</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Risks List */}
          <div className="space-y-4">
            <h3 className={`text-sm font-semibold text-slate-800 dark:text-slate-200`}>
              Registered Risk Logs ({risks.length})
            </h3>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : risks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 border rounded-xl border-dashed">
                No risks registered yet. Use the add form button to begin mapping.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {risks.map((r, idx) => {
                  const ratingColor = 
                    r.riskLevel === "CRITICAL" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                    r.riskLevel === "HIGH" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    r.riskLevel === "MEDIUM" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

                  return (
                    <div 
                      key={r.id} 
                      className={`p-4 rounded-xl border text-xs space-y-2 relative group transition ${
                        isDark ? "bg-slate-900/35 border-slate-800" : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-950 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className={`font-mono text-[10px] font-bold text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase`}>
                            {r.category}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${ratingColor}`}>
                          {r.riskLevel} (Score: {r.riskScore})
                        </span>
                      </div>

                      <div>
                        <h4 className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                          {r.title}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-[11px]">
                          {r.description}
                        </p>
                      </div>

                      <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 text-[10px] leading-relaxed text-slate-500 dark:text-slate-300 font-sans border border-slate-200/50 dark:border-slate-800/40">
                        <strong className="text-slate-700 dark:text-slate-200">Mitigation:</strong> {r.mitigationPlan}
                      </div>

                      {/* Hover action bar */}
                      <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(r)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-sky-500 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 rounded bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
