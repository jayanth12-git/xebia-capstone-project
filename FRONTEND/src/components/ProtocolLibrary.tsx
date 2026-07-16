import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Protocol, ProtocolVersion } from "../types";
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronRight, 
  Copy, Trash2, FolderGit, History, Plus, X, Loader2, CheckCircle, AlertCircle 
} from "lucide-react";

interface ProtocolLibraryProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
  onSelectProtocol: (id: string) => void;
  userRole: string;
}

export const ProtocolLibrary: React.FC<ProtocolLibraryProps> = ({ 
  theme, 
  selectedProtocolId, 
  onSelectProtocol,
  userRole
}) => {
  const isDark = theme === "dark";
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & Sorting States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [phase, setPhase] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detailed view of selected protocol
  const [detailedProtocol, setDetailedProtocol] = useState<Protocol | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [versions, setVersions] = useState<ProtocolVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // Create Protocol Dialog
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newPhase, setNewPhase] = useState("PHASE_I");
  const [newTherapeuticArea, setNewTherapeuticArea] = useState("Oncology");
  const [newSponsor, setNewSponsor] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newInclusion, setNewInclusion] = useState("");
  const [newExclusion, setNewExclusion] = useState("");
  const [newDesign, setNewDesign] = useState("");
  const [newPopulation, setNewPopulation] = useState("");
  const [newDuration, setNewDuration] = useState(12);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProtocols = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.listProtocols({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        status,
        phase,
      });

      console.log("===== Protocol API Response =====");
      console.log("Full Response:", res);
      console.log("Response Data:", res.data);
      console.log("Protocols:", res.data?.protocols);
      console.log("Is protocols array?", Array.isArray(res.data?.protocols));

      if (res.success) {
        setProtocols(
          Array.isArray(res.data?.protocols)
            ? res.data.protocols
            : []
        );

        setTotalItems(res.meta?.total ?? 0);
        setTotalPages(res.meta?.totalPages ?? 1);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || "Could not retrieve clinical protocols catalog."
      );
    } finally {
      setLoading(false);
    }
};

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    setVersionsLoading(true);
    try {
      const res = await api.getProtocol(id);
      if (res.success && res.data?.protocol) {
        setDetailedProtocol(res.data.protocol);
      }
      const verRes = await api.getVersionHistory(id);

      console.log("===== Versions API Response =====");
      console.log(verRes);
      console.log(verRes.data);
      console.log(verRes.data?.versions);
      console.log(Array.isArray(verRes.data?.versions));

      if (verRes.success) {
          setVersions(Array.isArray(verRes.data?.versions) ? verRes.data.versions : []);
      }
    } catch (err: any) {
      setErrorMsg("Failed to load details for " + id);
    } finally {
      setDetailLoading(false);
      setVersionsLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, [page, sortBy, sortOrder, search, status, phase]);

  const handleSelect = (id: string) => {
    onSelectProtocol(id);
    fetchDetail(id);
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.duplicateProtocol(id);
      if (res.success) {
        setSuccessMsg("Protocol copy successfully registered!");
        fetchProtocols();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to copy protocol.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this study protocol?")) return;
    try {
      const res = await api.deleteProtocol(id);
      if (res.success) {
        setSuccessMsg("Protocol record removed successfully.");
        if (selectedProtocolId === id) {
          setDetailedProtocol(null);
        }
        fetchProtocols();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove protocol.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.createProtocol({
        title: newTitle,
        studyCode: newCode,
        phase: newPhase as any,
        therapeuticArea: newTherapeuticArea,
        sponsor: newSponsor,
        condition: newCondition,
        objective: newObjective,
        inclusionCriteria: newInclusion,
        exclusionCriteria: newExclusion,
        studyDesign: newDesign,
        population: newPopulation ? Number(newPopulation) : null,
        durationWeeks: newDuration,
      });

      if (res.success) {
        setSuccessMsg("New clinical study protocol created!");
        setShowCreateModal(false);
        fetchProtocols();
        // Reset form
        setNewTitle("");
        setNewCode("");
        setNewSponsor("");
        setNewCondition("");
        setNewObjective("");
        setNewInclusion("");
        setNewExclusion("");
        setNewDesign("");
        setNewPopulation("");
        setNewDuration(12);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred creating the protocol.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Study Protocol Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Maintain, evaluate, duplicate, and select trial protocol repositories.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-md shadow-blue-500/10"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Study</span>
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-xs text-emerald-300">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Workspace Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Protocol Table & Controls (Col span 2) */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className={`p-4 rounded-xl border flex flex-wrap gap-4 items-center justify-between ${isDark ? "bg-slate-900/45 border-slate-800" : "bg-white border-slate-200"}`}>
            
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, conditions, sponsors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 border border-transparent dark:border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="MINOR_REVISION">Minor Revision</option>
                  <option value="MAJOR_REVISION">Major Revision</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <select
                value={phase}
                onChange={e => setPhase(e.target.value)}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-300 focus:outline-none"
              >
                <option value="">All Phases</option>
                <option value="PHASE_I">Phase I</option>
                <option value="PHASE_II">Phase II</option>
                <option value="PHASE_III">Phase III</option>
                <option value="PHASE_IV">Phase IV</option>
              </select>

              <button
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 text-[10px] font-semibold text-slate-500 dark:text-slate-300 border border-transparent dark:border-slate-800"
              >
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort {sortOrder.toUpperCase()}</span>
              </button>

            </div>

          </div>

          {/* Protocols List Table */}
          <div className={`rounded-xl border overflow-hidden ${isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
            {loading ? (
              <div className="p-12 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                <span className="text-xs text-slate-400">Loading catalog...</span>
              </div>
            ) : protocols.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No clinical trials matched the query filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      <th className="px-5 py-3">Code</th>
                      <th className="px-5 py-3">Title / Sponsor</th>
                      <th className="px-5 py-3">Phase / Area</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                    {protocols.map((p) => {
                      const isSelected = selectedProtocolId === p.id;
                      const statusColor = 
                        p.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                        p.status === "IN_REVIEW" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                        p.status === "REJECTED" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                        "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400";

                      return (
                        <tr
                          key={p.id}
                          onClick={() => handleSelect(p.id)}
                          className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition ${
                            isSelected ? "bg-blue-500/5 dark:bg-blue-500/5 font-medium" : ""
                          }`}
                        >
                          <td className="px-5 py-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {p.studyCode}
                          </td>
                          <td className="px-5 py-4">
                            <div className={`font-semibold truncate max-w-xs ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                              {p.title}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              Sponsor: {p.sponsor || "Internal"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`block font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              {p.phase}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.therapeuticArea}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition">
                              <button
                                onClick={(e) => handleDuplicate(p.id, e)}
                                title="Duplicate Protocol"
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDelete(p.id, e)}
                                title="Delete Record"
                                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Showing Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Detailed Panel Sidebar */}
        <div className="space-y-6">
          <div className={`p-6 rounded-xl border shadow-sm transition-all duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            
            <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
              <FolderGit className="w-4 h-4 text-blue-600" />
              <span>Study Focus Panel</span>
            </h3>

            {detailLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="text-[10px] text-slate-400">Mapping study tree...</span>
              </div>
            ) : !detailedProtocol ? (
              <div className="text-center text-xs text-slate-400 py-12">
                Select a protocol from the list to view version trees, objectives, and detailed parameters.
              </div>
            ) : (
              <div className="space-y-5 text-xs">
                
                {/* Core parameters */}
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 font-mono tracking-wider">{detailedProtocol.studyCode}</span>
                  <h4 className={`text-sm font-bold tracking-tight mt-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                    {detailedProtocol.title}
                  </h4>
                  <p className="text-slate-400 text-[10px] mt-1 font-sans">
                    Condition: <span className="font-semibold text-slate-500 dark:text-slate-300">{detailedProtocol.condition}</span>
                  </p>
                </div>

                <div className="space-y-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Objective:</strong> {detailedProtocol.objective || "N/A"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Inclusion:</strong> {detailedProtocol.inclusionCriteria || "N/A"}
                  </p>
                  <p>
                    <strong className="text-slate-700 dark:text-slate-300">Exclusion:</strong> {detailedProtocol.exclusionCriteria || "N/A"}
                  </p>
                </div>

                {/* Subcounts */}
                {detailedProtocol._count && (
                  <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-200/50 dark:border-slate-800/50 py-3 text-center text-[10px]">
                    <div>
                      <span className="block font-bold font-mono text-slate-800 dark:text-slate-200">{detailedProtocol._count.risks}</span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Risks</span>
                    </div>
                    <div>
                      <span className="block font-bold font-mono text-slate-800 dark:text-slate-200">{detailedProtocol._count.adverseEvents}</span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Events</span>
                    </div>
                    <div>
                      <span className="block font-bold font-mono text-slate-800 dark:text-slate-200">{detailedProtocol._count.reviews}</span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Reviews</span>
                    </div>
                  </div>
                )}

                {/* Version History Trees */}
                <div className="space-y-3">
                  <h5 className={`font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    <History className="w-3.5 h-3.5" />
                    <span>Protocol Version Tree</span>
                  </h5>

                  {versionsLoading ? (
                    <div className="py-2 flex justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {versions.map((v) => (
                        <div key={v.id} className="p-2 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 text-[10px]">
                          <div className="flex items-center justify-between font-mono font-bold text-blue-600 dark:text-blue-400">
                            <span>V{v.versionNumber}.0</span>
                            <span className="text-slate-400 font-normal text-[9px]">{new Date(v.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{v.changeSummary}</p>
                          <span className="text-[8px] block text-slate-400 text-right mt-1">By {v.createdBy?.name || "System"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 flex items-center justify-center p-6 z-50 overflow-y-auto backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 transition-all shadow-2xl space-y-4 my-8 ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
          }`}>
            
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className={`text-sm font-bold flex items-center gap-2 uppercase tracking-wide ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                <Plus className="w-4 h-4 text-blue-600" />
                <span>Study Protocol Registration</span>
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Study Title</label>
                  <input
                    type="text" required placeholder="E.g. Phase I study of..."
                    value={newTitle} onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Study Code (Unique Identifier)</label>
                  <input
                    type="text" required placeholder="E.g. XYZ-2026-01"
                    value={newCode} onChange={e => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Clinical Phase</label>
                  <select
                    value={newPhase} onChange={e => setNewPhase(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  >
                    <option value="PHASE_I">Phase I</option>
                    <option value="PHASE_II">Phase II</option>
                    <option value="PHASE_III">Phase III</option>
                    <option value="PHASE_IV">Phase IV</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Therapeutic Area</label>
                  <input
                    type="text" required placeholder="E.g. Oncology, Neurology"
                    value={newTherapeuticArea} onChange={e => setNewTherapeuticArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Trial Sponsor</label>
                  <input
                    type="text" required placeholder="E.g. BioThera Laboratories"
                    value={newSponsor} onChange={e => setNewSponsor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Condition</label>
                  <input
                    type="text" required placeholder="E.g. Breast Cancer"
                    value={newCondition} onChange={e => setNewCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Duration (Weeks)</label>
                  <input
                    type="number" required
                    value={newDuration} onChange={e => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Trial Population</label>
                  <input
                    type="text" required placeholder="E.g. 150 randomized patients"
                    value={newPopulation} onChange={e => setNewPopulation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Trial Objectives</label>
                <textarea
                  rows={2} required placeholder="Describe objectives..."
                  value={newObjective} onChange={e => setNewObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Inclusion Criteria</label>
                  <textarea
                    rows={2} required placeholder="E.g. Adults over 18..."
                    value={newInclusion} onChange={e => setNewInclusion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Exclusion Criteria</label>
                  <textarea
                    rows={2} required placeholder="E.g. Chronic illness..."
                    value={newExclusion} onChange={e => setNewExclusion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider text-[9px]">Study Design</label>
                <input
                  type="text" required placeholder="E.g. Double-blind randomized parallel..."
                  value={newDesign} onChange={e => setNewDesign(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Execute Creation Blueprint</span>}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
