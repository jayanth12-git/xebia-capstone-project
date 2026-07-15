import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Milestone } from "../types";
import { Calendar, Plus, Trash2, Edit2, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

interface TimelineProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const TimelinePlanner: React.FC<TimelineProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED">("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [order, setOrder] = useState(0);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMilestones = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.listMilestones(selectedProtocolId);
      if (res.success && res.data?.milestones) {
        setMilestones(res.data.milestones);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load study milestones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, [selectedProtocolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolId) return;
    setFormLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        title,
        description,
        status,
        dueDate: dueDate || null,
        order,
      };

      if (editingId) {
        const res = await api.updateMilestone(editingId, payload);
        if (res.success) {
          setSuccessMsg("Milestone schedule updated.");
          setShowAddForm(false);
          fetchMilestones();
          resetForm();
        }
      } else {
        const res = await api.createMilestone(selectedProtocolId, payload);
        if (res.success) {
          setSuccessMsg("Milestone checkpoint appended to study pipeline.");
          setShowAddForm(false);
          fetchMilestones();
          resetForm();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not register milestone.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (m: Milestone) => {
    setTitle(m.title);
    setDescription(m.description);
    setStatus(m.status);
    setDueDate(m.dueDate || "");
    setOrder(m.order);
    setEditingId(m.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this milestone checkpoint?")) return;
    try {
      const res = await api.deleteMilestone(id);
      if (res.success) {
        setSuccessMsg("Checkpoint removed from study timeline.");
        fetchMilestones();
      }
    } catch (err: any) {
      setErrorMsg("Failed to remove milestone.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setDueDate("");
    setOrder(0);
    setEditingId(null);
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <Calendar className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to plan or review timeline milestones.</p>
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
            Study Timeline & Milestones Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure checkpoints, track trial progressions, and evaluate roadmap compliance.
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
          <span>{showAddForm ? "View Timeline Roadmap" : "Create Milestone"}</span>
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
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {showAddForm ? (
        /* Form View */
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border max-w-xl mx-auto space-y-4 shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className="text-sm font-semibold border-b pb-3 text-slate-800 dark:text-slate-200">
            {editingId ? "Modify Milestone Parameters" : "Create Study Pipeline Milestone"}
          </h3>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Milestone Title</label>
              <input
                type="text" required placeholder="E.g. First Patient In (FPI)"
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Order / Position</label>
              <input
                type="number" required placeholder="1"
                value={order} onChange={e => setOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Description & Objectives</label>
            <textarea
              rows={2} required placeholder="Detail milestones objectives, required documentation, or clinical criteria..."
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Target Due Date</label>
              <input
                type="date" required
                value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Status</label>
              <select
                value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
              >
                <option value="PENDING">Pending Checkpoint</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
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
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Checkpoint</span>}
            </button>
          </div>
        </form>
      ) : (
        /* Timeline List Roadmap */
        <div className={`p-6 rounded-xl border shadow-sm transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-400">Loading trial timeline...</span>
            </div>
          ) : milestones.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No timeline checkpoints configured. Click Create Milestone to start scheduling study tasks.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-4 space-y-8">
              {milestones.map((m) => {
                const statusColor = 
                  m.status === "COMPLETED" ? "bg-emerald-500 text-white" :
                  m.status === "IN_PROGRESS" ? "bg-blue-600 text-white animate-pulse" :
                  m.status === "DELAYED" ? "bg-rose-500 text-white" :
                  "bg-slate-200 dark:bg-slate-800 text-slate-500";

                const pillColor = 
                  m.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20" :
                  m.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-500/20" :
                  m.status === "DELAYED" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-500/20" :
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-500/10";

                return (
                  <div key={m.id} className="relative group text-xs text-slate-600 dark:text-slate-300">
                    {/* Circle Node */}
                    <span className={`absolute -left-[35px] top-1.5 w-4 h-4 rounded-full border-4 border-white dark:border-slate-950 flex items-center justify-center font-mono font-bold text-[8px] ${statusColor}`}>
                      {m.order}
                    </span>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className={`text-sm font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                            {m.title}
                          </h4>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold border ${pillColor}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl text-[11px]">
                          {m.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 font-mono text-[10px] text-slate-400 flex-shrink-0">
                        <div>
                          <div>Due: <span className="font-semibold text-slate-500 dark:text-slate-300">{m.dueDate}</span></div>
                          {m.completedAt && (
                            <div className="text-emerald-500 font-semibold">Done: {new Date(m.completedAt).toLocaleDateString()}</div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-20 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
