import React, { useEffect, useState } from "react";
import { api } from "../api";
import { DashboardStats } from "../types";
import { ThemeAwareBarChart, ThemeAwareDoughnutChart } from "./Charts";
import { 
  FileText, ShieldAlert, Award, AlertOctagon, Activity, 
  Calendar, CheckSquare, RefreshCw, Loader2, Users 
} from "lucide-react";

interface DashboardProps {
  theme: "light" | "dark";
  onSelectProtocol: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ theme, onSelectProtocol }) => {
  const isDark = theme === "dark";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.getDashboardStats();
      if (res.success && res.data?.stats) {
        setStats(res.data.stats);
      } else {
        setErrorMsg("Failed to retrieve metrics.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to fetch dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs text-slate-500">Retrieving Clinical Database Metrics...</span>
      </div>
    );
  }

  if (errorMsg || !stats) {
    return (
      <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm max-w-lg mx-auto mt-8 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <span className="font-semibold">Error Loading Statistics</span>
        </div>
        <p className="text-xs">{errorMsg}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer max-w-max transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { totals } = stats;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
            Workstation Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time aggregate data and clinical metrics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition ${
            isDark 
              ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" 
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
          <span>Synchronize Data</span>
        </button>
      </div>

      {/* Grid of totals cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Protocols */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all shadow-sm ${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"}`}>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-xl font-bold tracking-tight font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {totals.protocols}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Total Studies
            </span>
          </div>
        </div>

        {/* Risks */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all shadow-sm ${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"}`}>
          <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-xl font-bold tracking-tight font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {totals.risks}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Assessed Risks
            </span>
          </div>
        </div>

        {/* Adverse Events */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all shadow-sm ${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"}`}>
          <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-xl font-bold tracking-tight font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {totals.adverseEvents}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Adverse Events
            </span>
          </div>
        </div>

        {/* Reviews */}
        <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all shadow-sm ${isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md"}`}>
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className={`block text-xl font-bold tracking-tight font-mono ${isDark ? "text-slate-100" : "text-slate-800"}`}>
              {totals.reviews}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
              Peer Evaluations
            </span>
          </div>
        </div>

      </div>

      {/* Secondary Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Milestones Roadmap</span>
          </div>
          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            {totals.milestones} Registered
          </span>
        </div>

        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="font-semibold">Pending IRB Reviews</span>
          </div>
          <span className="font-mono font-bold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">
            {totals.pendingReviews} Action Needed
          </span>
        </div>

        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600 shadow-sm"}`}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-500" />
            <span className="font-semibold">Active Trial Investigators</span>
          </div>
          <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            {totals.users} Profiles
          </span>
        </div>

      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemeAwareBarChart 
          data={stats.protocolsByStatus} 
          theme={theme} 
          title="Protocols Count by Workflow Status" 
        />
        <ThemeAwareDoughnutChart 
          data={stats.protocolsByPhase} 
          theme={theme} 
          title="Clinical Trials Phase Distribution" 
        />
        <ThemeAwareBarChart 
          data={stats.risksByLevel} 
          theme={theme} 
          title="Assessed Risk Levels Heat Density" 
        />
        <ThemeAwareDoughnutChart 
          data={stats.adverseEventsBySeverity} 
          theme={theme} 
          title="Adverse Event Severity Distribution" 
        />
      </div>

      {/* Recent Protocols */}
      <div className={`rounded-xl border shadow-sm overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Recently Added Protocols
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-bold px-2 py-0.5 rounded">
            Latest Metrics
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/40 dark:border-slate-800/40 text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50/30 dark:bg-slate-900/20">
                <th className="px-6 py-3.5">Study Code</th>
                <th className="px-6 py-3.5">Protocol / Title</th>
                <th className="px-6 py-3.5">Phase</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
              {stats.recentProtocols.map((p) => {
                const statusColor = 
                  p.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                  p.status === "IN_REVIEW" ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" :
                  p.status === "REJECTED" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

                return (
                  <tr 
                    key={p.id} 
                    onClick={() => onSelectProtocol(p.id)}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {p.studyCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-xs font-semibold truncate max-w-xs md:max-w-md ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {p.title}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Registered {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        {p.phase}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
