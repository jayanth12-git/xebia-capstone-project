import React from "react";
import { User } from "../types";
import { Settings as SettingsIcon, Sun, Moon, Shield, Info, Database } from "lucide-react";

interface SettingsProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  currentUser: User | null;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme, currentUser }) => {
  const isDark = theme === "dark";

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          System Settings & Profiles
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure interface presets, inspect user authorization keys, and review database connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left column - Theme & Preferences */}
        <div className={`p-6 rounded-xl border space-y-6 shadow-sm transition-all duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          
          <div>
            <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
              <Sun className="w-4 h-4 text-blue-600" />
              <span>Interface Customization</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-950 border dark:border-slate-800 text-xs">
              <div className="space-y-0.5">
                <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>Global Appearance Theme</span>
                <p className="text-[10px] text-slate-400">Toggle dark mode background palettes across all dashboard pages.</p>
              </div>

              <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                    theme === "light" 
                      ? "bg-white text-slate-800 shadow" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition ${
                    theme === "dark" 
                      ? "bg-slate-950 text-slate-200 shadow" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
              <Shield className="w-4 h-4 text-blue-600" />
              <span>User Credentials & Roles</span>
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-950 border dark:border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">User Identity</span>
                  <span className={`text-xs font-bold font-mono mt-1 block ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {currentUser?.name || "Dr. Alice Carter"}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-950 border dark:border-slate-800">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Access Scope Role</span>
                  <span className={`text-xs font-bold font-mono mt-1 block ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    {currentUser?.role || "CLINICAL_RESEARCHER"}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-950 border dark:border-slate-800 text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Email Record</span>
                <span className={`text-xs font-bold font-mono mt-1 block ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {currentUser?.email || "alice.carter@glycomed.com"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right column - Server Info */}
        <div className={`p-6 rounded-xl border space-y-6 shadow-sm transition-all duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          
          <div>
            <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
              <Database className="w-4 h-4 text-blue-600" />
              <span>Database Connection & Status</span>
            </h3>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-between">
                <span>Database Status: Connected</span>
                <span className="w-2 bg-emerald-500 h-2 rounded-full relative flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-100 dark:bg-slate-950 border dark:border-slate-800 space-y-2 text-slate-500 dark:text-slate-400">
                <p><span className="text-slate-400">Server Host:</span> 0.0.0.0 (Reverse Ingress Proxy)</p>
                <p><span className="text-slate-400">Target Ingress Port:</span> 3000</p>
                <p><span className="text-slate-400">Engine Node:</span> v20+ Custom Sandboxed Container</p>
                <p><span className="text-slate-400">ORM Schema Framework:</span> Prisma / Drizzle Client Wrapper</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
              <Info className="w-4 h-4 text-blue-600" />
              <span>Compliance Disclosures</span>
            </h3>

            <p className="text-[11px] leading-relaxed text-slate-400 font-sans">
              This application prototype is modeled strictly according to GCP (Good Clinical Practice), FDA CFR Title 21 Part 11, and EMA guidelines for digital clinical trials management. All data layers represent clinical simulation patterns.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
