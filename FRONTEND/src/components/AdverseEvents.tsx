import React, { useEffect, useState } from "react";
import { api } from "../api";
import { AdverseEvent } from "../types";
import { AlertOctagon, Plus, Trash2, Edit2, CheckCircle, Loader2 } from "lucide-react";

interface AdverseEventsProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const AdverseEvents: React.FC<AdverseEventsProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [events, setEvents] = useState<AdverseEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [subjectCode, setSubjectCode] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING" | "FATAL">("MILD");
  const [causality, setCausality] = useState<"NOT_RELATED" | "UNLIKELY" | "POSSIBLE" | "PROBABLE" | "DEFINITE">("POSSIBLE");
  const [status, setStatus] = useState<"REPORTED" | "ONGOING" | "RESOLVED">("REPORTED");
  const [onsetDate, setOnsetDate] = useState("");
  const [resolvedDate, setResolvedDate] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchEvents = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.listAdverseEvents(selectedProtocolId);
      if (res.success && res.data?.adverseEvents) {
        setEvents(res.data.adverseEvents);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load Adverse Event logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedProtocolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolId) return;
    setFormLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        subjectCode,
        description,
        severity,
        causality,
        status,
        onsetDate: onsetDate || null,
        resolvedDate: resolvedDate || null,
        reportedBy,
      };

      if (editingId) {
        const res = await api.updateAdverseEvent(editingId, payload);
        if (res.success) {
          setSuccessMsg("Adverse event record updated successfully.");
          setShowAddForm(false);
          fetchEvents();
          resetForm();
        }
      } else {
        const res = await api.createAdverseEvent(selectedProtocolId, payload);
        if (res.success) {
          setSuccessMsg("Adverse event registered successfully.");
          setShowAddForm(false);
          fetchEvents();
          resetForm();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not register adverse event log.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (ae: AdverseEvent) => {
    setSubjectCode(ae.subjectCode);
    setDescription(ae.description);
    setSeverity(ae.severity);
    setCausality(ae.causality);
    setStatus(ae.status);
    setOnsetDate(ae.onsetDate || "");
    setResolvedDate(ae.resolvedDate || "");
    setReportedBy(ae.reportedBy);
    setEditingId(ae.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this adverse event log from archives?")) return;
    try {
      const res = await api.deleteAdverseEvent(id);
      if (res.success) {
        setSuccessMsg("Event record removed.");
        fetchEvents();
      }
    } catch (err: any) {
      setErrorMsg("Failed to remove adverse event log.");
    }
  };

  const resetForm = () => {
    setSubjectCode("");
    setDescription("");
    setSeverity("MILD");
    setCausality("POSSIBLE");
    setStatus("REPORTED");
    setOnsetDate("");
    setResolvedDate("");
    setReportedBy("");
    setEditingId(null);
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to log or review adverse event records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Adverse Events (AE) Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track and classify patient safety events, severity parameters, and causality indices.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(!showAddForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "View Event Registry" : "Report Adverse Event"}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-xs text-rose-300">
          <AlertOctagon className="w-4 h-4 flex-shrink-0 text-rose-400" />
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
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border max-w-xl mx-auto space-y-4 shadow-sm transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className="text-sm font-semibold border-b pb-3 text-slate-800 dark:text-slate-200">
            {editingId ? "Modify Adverse Event Record" : "Report New Safety Adverse Event"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Subject Identifier Code</label>
              <input
                type="text" required placeholder="E.g. SUB-1025"
                value={subjectCode} onChange={e => setSubjectCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Reported By / Investigator</label>
              <input
                type="text" required placeholder="Dr. Alice Smith"
                value={reportedBy} onChange={e => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Event Clinical Description</label>
            <textarea
              rows={2} required placeholder="Detail patient symptoms, clinical readouts, and medical interventions..."
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Severity Tier</label>
              <select
                value={severity} onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
              >
                <option value="MILD">Mild</option>
                <option value="MODERATE">Moderate</option>
                <option value="SEVERE">Severe</option>
                <option value="LIFE_THREATENING">Life Threatening</option>
                <option value="FATAL">Fatal</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Causality Assessment</label>
              <select
                value={causality} onChange={e => setCausality(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
              >
                <option value="NOT_RELATED">Not Related</option>
                <option value="UNLIKELY">Unlikely</option>
                <option value="POSSIBLE">Possible</option>
                <option value="PROBABLE">Probable</option>
                <option value="DEFINITE">Definite</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Event Status</label>
              <select
                value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
              >
                <option value="REPORTED">Reported</option>
                <option value="ONGOING">Ongoing</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Onset Date</label>
              <input
                type="date" required
                value={onsetDate} onChange={e => setOnsetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Resolved Date (Optional)</label>
              <input
                type="date"
                value={resolvedDate} onChange={e => setResolvedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button" onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-semibold cursor-pointer text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={formLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md shadow-blue-500/10"
            >
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Event Entry</span>}
            </button>
          </div>
        </form>
      ) : (
        /* Table / List View */
        <div className={`rounded-xl border shadow-sm overflow-hidden transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-400">Loading AE logs...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
              No adverse events reported for this study. Use the report form to add items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="px-5 py-3">Subject ID</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">Causality</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Onset / Resolution</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {events.map((ae) => {
                    const severityColors = 
                      ae.severity === "FATAL" || ae.severity === "LIFE_THREATENING" 
                        ? "bg-rose-500/10 text-rose-500 font-bold border-rose-500/20" 
                        : ae.severity === "SEVERE" 
                          ? "bg-orange-500/10 text-orange-500 border-orange-500/20" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20";

                    const statusColors = 
                      ae.status === "RESOLVED" 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-amber-500/10 text-amber-500";

                    return (
                      <tr key={ae.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition">
                        <td className="px-5 py-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {ae.subjectCode}
                        </td>
                        <td className="px-5 py-4 max-w-xs md:max-w-md">
                          <p className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {ae.description}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Reported by: {ae.reportedBy}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase border ${severityColors}`}>
                            {ae.severity}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-slate-500 dark:text-slate-400">
                            {ae.causality}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusColors}`}>
                            {ae.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                          <div>Onset: {ae.onsetDate}</div>
                          {ae.resolvedDate ? <div>Resolved: {ae.resolvedDate}</div> : <div className="text-amber-500 font-semibold">Ongoing</div>}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => handleEdit(ae)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sky-500 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(ae.id)}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
