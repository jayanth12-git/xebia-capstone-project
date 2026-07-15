import React, { useState, useEffect } from "react";
import { api } from "./api";
import { User } from "./types";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ProtocolGenerator } from "./components/ProtocolGenerator";
import { ProtocolLibrary } from "./components/ProtocolLibrary";
import { SampleSizeCalculator } from "./components/SampleSizeCalculator";
import { RiskMatrix } from "./components/RiskMatrix";
import { AdverseEvents } from "./components/AdverseEvents";
import { TimelinePlanner } from "./components/TimelinePlanner";
import { Checklist } from "./components/Checklist";
import { PeerReviews } from "./components/PeerReviews";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";

// Icon list
import { 
  LayoutDashboard, FileText, FolderGit, Calculator, ShieldAlert, AlertOctagon, 
  Calendar, CheckSquare, MessageSquare, FileDown, Settings as SettingsIcon, LogOut, Sun, Moon, Database
} from "lucide-react";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return (saved === "dark" || saved === "light") ? saved : "dark";
  });

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Router / Tab State
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  // Selected Active Protocol ID (used as global context)
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(() => {
    return localStorage.getItem("selectedProtocolId");
  });

  // Keep theme element updated
  useEffect(() => {
    localStorage.setItem("theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Handle active protocol selection state
  const handleSelectProtocol = (id: string) => {
    setSelectedProtocolId(id);
    localStorage.setItem("selectedProtocolId", id);
  };

  // Check existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.data?.user) {
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            // failed to load profile
            api.logout();
            setIsAuthenticated(false);
          }
        } catch {
          api.logout();
          setIsAuthenticated(false);
        }
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    localStorage.setItem("accessToken", token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab("Dashboard");
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSelectedProtocolId(null);
    localStorage.removeItem("selectedProtocolId");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-xs text-slate-400 gap-3 font-mono">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span>Authorizing clinical trial designer token gates...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} theme={theme} setTheme={setTheme} />;
  }

  // Navigation Items matching ALL requirements
  const navigationItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Protocol Generator", icon: FileText },
    { name: "Protocol Library", icon: FolderGit },
    { name: "Sample Size Calculator", icon: Calculator },
    { name: "Risk Matrix", icon: ShieldAlert },
    { name: "Adverse Events", icon: AlertOctagon },
    { name: "Timeline Planner", icon: Calendar },
    { name: "Regulatory Checklist", icon: CheckSquare },
    { name: "Peer Reviews", icon: MessageSquare },
    { name: "Reports", icon: FileDown },
    { name: "Settings", icon: SettingsIcon },
  ];

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-200 ${
      isDark ? "bg-slate-950 text-slate-300" : "bg-slate-50/70 text-slate-600"
    }`}>

      {/* Sidebar Navigation Panel */}
      <aside className={`w-64 border-r flex-shrink-0 flex flex-col justify-between transition-colors duration-200 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        
        <div className="p-6 space-y-6 flex-1 flex flex-col min-h-0">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-md shadow-blue-500/10">
              CT
            </span>
            <div>
              <span className={`block font-bold text-sm tracking-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                ClinicalAI
              </span>
              <span className="text-[9px] text-blue-600 dark:text-blue-400 font-bold tracking-wider font-mono uppercase block -mt-0.5">
                Protocol Suite
              </span>
            </div>
          </div>

          {/* Nav items list */}
          <nav className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? isDark 
                        ? "bg-blue-950/80 text-blue-400 font-bold border border-blue-900/40" 
                        : "bg-blue-50 text-blue-700 font-bold border border-blue-100"
                      : isDark 
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? (isDark ? "text-blue-400" : "text-blue-600") : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User bottom profile card & actions */}
        <div className={`p-4 border-t space-y-3 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left truncate">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : "DR"}
              </div>
              <div className="truncate max-w-[120px]">
                <span className={`block text-xs font-bold leading-none ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {currentUser?.name || "Dr. Carter"}
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                  {currentUser?.role || "RESEARCHER"}
                </span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              title="Logout session"
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer border border-transparent dark:border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick theme trigger */}
          <div className="flex gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
            <button
              onClick={() => setTheme("light")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                theme === "light" ? "bg-white text-slate-800 shadow-sm border border-slate-200/40" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex-1 py-1 text-[10px] font-bold rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer ${
                theme === "dark" ? "bg-slate-800 text-slate-200 shadow-sm border border-slate-700/40" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
          </div>
        </div>

      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Top Header Bar */}
        <header className={`h-16 px-8 border-b flex items-center justify-between transition-colors duration-200 ${
          isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
        }`}>
          
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Gateway Node Online
            </span>
          </div>

          {/* Global Study Protocol Picker (Crucial contextual synchronization) */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Context Study:</span>
            <span className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
              isDark ? "bg-slate-900 border-slate-800 text-blue-400" : "bg-slate-50 border-slate-200 text-blue-700"
            }`}>
              {selectedProtocolId || "NO ACTIVE PROTOCOL SELECTED"}
            </span>
          </div>

        </header>

        {/* Workspace Content Canvas */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === "Dashboard" && <Dashboard theme={theme} onSelectProtocol={handleSelectProtocol} />}
          {activeTab === "Protocol Generator" && <ProtocolGenerator theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Protocol Library" && (
            <ProtocolLibrary 
              theme={theme} 
              selectedProtocolId={selectedProtocolId} 
              onSelectProtocol={handleSelectProtocol}
              userRole={currentUser?.role || "CLINICAL_RESEARCHER"}
            />
          )}
          {activeTab === "Sample Size Calculator" && <SampleSizeCalculator theme={theme} />}
          {activeTab === "Risk Matrix" && <RiskMatrix theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Adverse Events" && <AdverseEvents theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Timeline Planner" && <TimelinePlanner theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Regulatory Checklist" && <Checklist theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Peer Reviews" && <PeerReviews theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Reports" && <Reports theme={theme} selectedProtocolId={selectedProtocolId} />}
          {activeTab === "Settings" && <Settings theme={theme} setTheme={setTheme} currentUser={currentUser} />}
        </main>

      </div>

    </div>
  );
}
