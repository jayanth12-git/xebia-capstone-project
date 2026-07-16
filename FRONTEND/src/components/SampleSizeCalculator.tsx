import React, { useState } from "react";
import { api } from "../api";
import { Calculator, CheckCircle2, RefreshCw, AlertCircle, Loader2 } from "lucide-react";

interface SampleSizeProps {
  theme: "light" | "dark";
}

export const SampleSizeCalculator: React.FC<SampleSizeProps> = ({ theme }) => {
  const isDark = theme === "dark";
  const [effectSize, setEffectSize] = useState(0.5);
  const [power, setPower] = useState(0.80);
  const [alpha, setAlpha] = useState(0.05);
  const [dropoutRate, setDropoutRate] = useState(0.15);
  const [population, setPopulation] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await api.calculateSampleSize({
        effectSize,
        power,
        alpha,
        dropoutRate,
        population: population ? Number(population) : null,
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setErrorMsg("Failed to process calculation.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during statistical calculations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Sample Size & Statistical Power Calculator
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Perform statistical power analysis to establish minimum patient cohort bounds.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Parameters Form */}
        <form onSubmit={handleCalculate} className={`p-6 rounded-xl border space-y-4 ${isDark ? "bg-slate-900/35 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
            <Calculator className="w-4 h-4 text-sky-500" />
            <span>Statistical Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Expected Effect Size (Cohen's d)
            </label>
            <span className="text-[10px] text-slate-400 block mb-1.5">
              Approximate difference magnitude. 0.2 is Small, 0.5 is Medium, 0.8 is Large.
            </span>
            <input
              type="number"
              step="0.01"
              min="0.05"
              max="3.0"
              required
              value={effectSize}
              onChange={(e) => setEffectSize(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Power (1 - Beta)
              </label>
              <select
                value={power}
                onChange={(e) => setPower(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-semibold"
              >
                <option value="0.80">0.80 (Standard)</option>
                <option value="0.85">0.85</option>
                <option value="0.90">0.90 (High)</option>
                <option value="0.95">0.95 (Ultra)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Alpha Level (Significance)
              </label>
              <select
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-semibold"
              >
                <option value="0.01">0.01 (Very Strict)</option>
                <option value="0.05">0.05 (Standard)</option>
                <option value="0.10">0.10 (Exploratory)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Expected Attrition / Dropout Rate
              </label>
              <select
                value={dropoutRate}
                onChange={(e) => setDropoutRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono font-semibold"
              >
                <option value="0.00">0% Attrition</option>
                <option value="0.05">5%</option>
                <option value="0.10">10%</option>
                <option value="0.15">15% Standard</option>
                <option value="0.20">20% High</option>
                <option value="0.25">25% Max</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Finite Population Size
              </label>
              <span className="text-[9px] text-slate-400 block mb-1">Optional. E.g. rare diseases.</span>
              <input
                type="number"
                placeholder="E.g. 5000 (Omit for infinite)"
                value={population}
                onChange={(e) => setPopulation(e.target.value !== "" ? Number(e.target.value) : "")}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Power Iteration...</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>Calculate Power & Cohort Size</span>
              </>
            )}
          </button>
        </form>

        {/* Calculation Outputs */}
        <div className={`p-6 rounded-xl border flex flex-col justify-between ${isDark ? "bg-slate-900/10 border-slate-800/80" : "bg-slate-50 border-slate-200"}`}>
          <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-200"}`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" />
            <span>Statistical Calculation Outputs</span>
          </h3>

          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 gap-2">
              <Calculator className="w-8 h-8 text-slate-300" />
              <p>Configure parameters on the left and calculate cohort sizes safely.</p>
            </div>
          ) : (
            <div className="flex-1 py-4 space-y-6 text-xs text-slate-600 dark:text-slate-300">
              
              {/* Highlight metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/20 text-center">
                  <span className={`block text-2xl font-black font-mono tracking-tight text-sky-500`}>
                    {result.sampleSizePerGroup}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Participants per Group
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <span className={`block text-2xl font-black font-mono tracking-tight text-emerald-500`}>
                    {result.adjustedSampleSizeTotal}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Total Participants Required
                  </span>
                </div>
              </div>

              {/* Method info */}
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 border dark:border-slate-800/40 font-mono text-[10px] space-y-1">
                <p><span className="text-slate-400">Calculation Method:</span> {result.explanation}</p>
                <p><span className="text-slate-400">Alpha Value:</span> {result.inputs.alpha}</p>
                <p><span className="text-slate-400">Power Bound (1 - Beta):</span> {result.inputs.power}</p>
                <p><span className="text-slate-400">Attrition Adjustment:</span> Inflated for {result.inputs.dropoutRate * 100}% dropouts</p>
                {result.inputs.population&& (
                  <p><span className="text-slate-400">Finite Population size:</span> {result.inputs.population}</p>
                )}
              </div>

              {/* Statistical definitions explanation */}
              <div className="space-y-3 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <h4 className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Statistical Variables Definitions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] leading-relaxed">
                  <p>
                    <strong className="text-sky-500">Cohen's d:</strong> Standardized mean difference. 0.5 implies the treatment group mean differs from control by 0.5 standard deviations.
                  </p>
                  <p>
                    <strong className="text-emerald-500">Power (1 - Beta):</strong> Probability of correctly rejecting a false null hypothesis (avoiding type II false-negative error).
                  </p>
                  <p>
                    <strong className="text-amber-500">Significance Level (Alpha):</strong> Probability of rejecting a true null hypothesis (type I false-positive error rate). Usually set to 0.05.
                  </p>
                  <p>
                    <strong className="text-violet-500">Dropout Inflation:</strong> Compensates for non-compliance, withdrawals, and loss-to-follow-up ratios to preserve statistical power.
                  </p>
                </div>
              </div>

            </div>
          )}

          <div className="p-3 rounded bg-slate-100 dark:bg-slate-900 text-[10px] text-slate-400 leading-relaxed text-center font-mono border dark:border-slate-800/40">
            Parallel group power approximations calculated utilizing standard non-centrality parameters.
          </div>

        </div>

      </div>

    </div>
  );
};
