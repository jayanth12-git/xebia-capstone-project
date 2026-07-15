import React, { useState } from "react";
import { api } from "../api";
import { User } from "../types";
import { ShieldAlert, HeartPulse, UserPlus, LogIn, Loader2 } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  theme: "light" | "dark";
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, theme }) => {
  const isDark = theme === "dark";
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"RESEARCHER" | "ADMIN" | "REVIEWER">("RESEARCHER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({ name, email, password, role });
        if (res.success) {
          // Auto login after registration
          const loginRes = await api.login({ email, password });
          if (loginRes.success && loginRes.data?.user) {
            onLoginSuccess(loginRes.data.user);
          }
        }
      } else {
        const loginRes = await api.login({ email, password });
        if (loginRes.success && loginRes.data?.user) {
          onLoginSuccess(loginRes.data.user, loginRes.data.accessToken);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white"
      style={{
        backgroundImage: "radial-gradient(ellipse at top right, rgba(37, 99, 235, 0.12) 0%, rgba(15, 23, 42, 1) 75%)"
      }}
    >
      <div className={`w-full max-w-md p-8 rounded-2xl border transition-all shadow-2xl ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-900 border-slate-700"}`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/20">
            <HeartPulse className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">
            AI Clinical Trial Protocol Designer
          </h2>
          <p className="text-xs text-blue-400 font-bold tracking-wider mt-1.5 uppercase">
            Clinical Trial Workstation
          </p>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-xs text-rose-300">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name / Title
              </label>
              <input
                type="text"
                required
                placeholder="Dr. John Doe, MD"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Work Email Address
            </label>
            <input
              type="email"
              required
              placeholder="name@institution.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Secure Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Institutional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              >
                <option value="RESEARCHER">Researcher / Investigator</option>
                <option value="REVIEWER">IRB Reviewer / Evaluator</option>
                <option value="ADMIN">System Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/15 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Professional Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In to Trial Station</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center border-t border-slate-800 pt-6">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold"
          >
            {isRegister
              ? "Already registered? Sign In with credentials"
              : "Need access? Setup a new trialist profile"}
          </button>
        </div>

        {/* Admin Credential Hints */}
        <div className="mt-8 p-3 rounded-lg bg-slate-900/40 border border-slate-800/50 text-[10px] text-slate-500 font-mono space-y-1">
          <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px] mb-1">
            Testing profiles
          </p>
          <p>Admin: admin@example.com / admin123</p>
          <p>Reviewer: reviewer@example.com / reviewer123</p>
          <p>Researcher: researcher@example.com / researcher123</p>
        </div>

      </div>
    </div>
  );
};
