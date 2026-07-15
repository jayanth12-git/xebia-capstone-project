import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Review } from "../types";
import { MessageSquare, Plus, Trash2, CheckCircle2, AlertOctagon, Loader2 } from "lucide-react";

interface PeerReviewsProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const PeerReviews: React.FC<PeerReviewsProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState<"APPROVED" | "MINOR_REVISION" | "MAJOR_REVISION" | "REJECTED">("MINOR_REVISION");
  const [score, setScore] = useState(80);
  const [formLoading, setFormLoading] = useState(false);

  const fetchReviews = async () => {
    if (!selectedProtocolId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.listReviews(selectedProtocolId);
      if (res.success && res.data?.reviews) {
        setReviews(res.data.reviews);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load study peer evaluations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [selectedProtocolId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocolId) return;
    setFormLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.createReview(selectedProtocolId, {
        comments,
        decision: recommendation,
        score,
      });

      if (res.success) {
        setSuccessMsg("Peer evaluation filed successfully!");
        setShowAddForm(false);
        fetchReviews();
        // reset
        setComments("");
        setRecommendation("MINOR_REVISION");
        setScore(80);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Could not register review evaluation.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this peer review assessment record?")) return;
    try {
      const res = await api.deleteReview(id);
      if (res.success) {
        setSuccessMsg("Review record removed successfully.");
        fetchReviews();
      }
    } catch (err: any) {
      setErrorMsg("Failed to remove review.");
    }
  };

  if (!selectedProtocolId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 p-8 text-center text-xs text-slate-500 gap-4">
        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="max-w-xs space-y-1">
          <p className="font-bold">No Study Selected</p>
          <p className="leading-relaxed">Go to the Protocol Library tab and select an active trial protocol to evaluate peer reviews and reviewer checklists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Board Review & Peer Evaluations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Conduct panel assessments, score methodologies, and file recommendations.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "View Board Comments" : "Evaluate Protocol Draft"}</span>
        </button>
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

      {showAddForm ? (
        /* Evaluation Form */
        <form onSubmit={handleSubmit} className={`p-6 rounded-xl border max-w-xl mx-auto space-y-4 shadow-sm transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className="text-sm font-semibold border-b pb-3 text-slate-800 dark:text-slate-200">
            Submit Peer Evaluation Record
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Recommendation Decision</label>
              <select
                value={recommendation} onChange={e => setRecommendation(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-semibold transition-all"
              >
                <option value="APPROVED">Approved</option>
                <option value="MINOR_REVISION">Minor Revision Required</option>
                <option value="MAJOR_REVISION">Major Revision Required</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Quality Evaluation Score (1-100)</label>
              <input
                type="number" required min="1" max="100"
                value={score} onChange={e => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono font-bold transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Methodology Review Comments</label>
            <textarea
              rows={4} required placeholder="State methodology weaknesses, sample size integrity concerns, design ambiguities, or safety remarks..."
              value={comments} onChange={e => setComments(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans leading-relaxed transition-all"
            />
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
              {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Confirm Evaluation</span>}
            </button>
          </div>
        </form>
      ) : (
        /* Reviews List */
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-xs text-slate-400">Loading evaluation reports...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-12 text-center text-slate-500 border rounded-xl border-dashed">
              No evaluation panels reported yet. Use the review form above to file methodology feedback.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((r) => {
                const badgeColor = 
                  r.recommendation === "APPROVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-500/20" :
                  r.recommendation === "MINOR_REVISION" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-500/20" :
                  r.recommendation === "MAJOR_REVISION" ? "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-500/20" :
                  "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-500/20";

                return (
                  <div 
                    key={r.id}
                    className={`p-5 rounded-xl border text-xs space-y-3 flex flex-col justify-between relative group transition duration-200 shadow-sm hover:shadow-md ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] uppercase font-bold border ${badgeColor}`}>
                          {r.decision?.replace(/_/g, " ") || "No Recommendation"}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Score Index
                          </span>
                          <span className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">
                            {r.score}/100
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        "{r.comments}"
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Evaluated: {new Date(r.createdAt).toLocaleDateString()}</span>
                      <span>By: {r.reviewer?.name || "Anonymous Panelist"}</span>
                    </div>

                    {/* Hover delete */}
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="absolute right-3 bottom-3 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
