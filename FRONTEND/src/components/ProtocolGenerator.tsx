import React, { useState } from "react";
import { api } from "../api";
import { FileText, Cpu, CheckCircle, AlertOctagon, Loader2, ArrowRight } from "lucide-react";

interface ProtocolGeneratorProps {
  theme: "light" | "dark";
  selectedProtocolId: string | null;
}

export const ProtocolGenerator: React.FC<ProtocolGeneratorProps> = ({ theme, selectedProtocolId }) => {
  const isDark = theme === "dark";
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedDoc, setGeneratedDoc] = useState<any | null>(null);

  // Form Fields
  const [title, setTitle] = useState("Phase II Study of GlycoStop in Adult Type-2 Diabetics");
  const [therapeuticArea, setTherapeuticArea] = useState("Endocrinology");
  const [phase, setPhase] = useState("PHASE_II");
  const [condition, setCondition] = useState("Type 2 Diabetes Mellitus");
  const [sponsor, setSponsor] = useState("GlycoMed Laboratories Inc.");
  const [objective, setObjective] = useState("To evaluate safety, dosing tolerability, and glycated hemoglobin (HbA1c) reduction over 16 weeks.");
  const [inclusionCriteria, setInclusionCriteria] = useState("Adults 18-65 with HbA1c between 7.5% and 9.5%, stable metformin treatment.");
  const [exclusionCriteria, setExclusionCriteria] = useState("History of severe diabetic ketoacidosis, chronic renal impairment, or pregnancy.");
  const [studyDesign, setStudyDesign] = useState("Randomized, double-blind, placebo-controlled, dose-escalation parallel study.");
  const [population, setPopulation] = useState("180 randomized subjects split evenly among three dosage arms (10mg, 20mg, placebo).");
  const [durationWeeks, setDurationWeeks] = useState(16);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedDoc(null);

    try {
      const res = await api.generateProtocol({
        title,
        therapeuticArea,
        phase,
        condition,
        sponsor,
        objective,
        inclusionCriteria,
        exclusionCriteria,
        studyDesign,
        population,
        durationWeeks,
        protocolId: selectedProtocolId || undefined, // optionally saves the generated draft as a full-protocol report attached to current study
      });

      if (res.success && res.data?.generatedDocument) {
        setGeneratedDoc(res.data.generatedDocument);
        setSuccessMsg(
          res.data.savedReportId 
            ? "Protocol generated successfully and saved as a study report draft!" 
            : "Protocol generated successfully! Review draft outputs below."
        );
      } else {
        setErrorMsg("Failed to generate study document.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during generative trial drafting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Generative Protocol Builder
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Draft fully structured study documentation with AI-driven structuring patterns.
        </p>
      </div>

      {/* Selected Protocol Hint */}
      {selectedProtocolId && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 flex items-center justify-between">
          <span className="font-semibold">Linked Active Study: {selectedProtocolId}</span>
          <span className="text-[10px] uppercase font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
            Output Will Autosave to Study Reports
          </span>
        </div>
      )}

      {/* Alert Callouts */}
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

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Input Parameters */}
        <form onSubmit={handleGenerate} className={`p-6 rounded-xl border space-y-4 shadow-sm transition-colors duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-100"}`}>
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Trial Parameters Input</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Study Title</label>
            <input 
              type="text" 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Therapeutic Area</label>
              <input 
                type="text" 
                required
                value={therapeuticArea} 
                onChange={e => setTherapeuticArea(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Clinical Phase</label>
              <select 
                value={phase} 
                onChange={e => setPhase(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all font-semibold"
              >
                <option value="PHASE_I">Phase I</option>
                <option value="PHASE_II">Phase II</option>
                <option value="PHASE_III">Phase III</option>
                <option value="PHASE_IV">Phase IV</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
              <input 
                type="text" 
                required
                value={condition} 
                onChange={e => setCondition(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Trial Sponsor</label>
              <input 
                type="text" 
                required
                value={sponsor} 
                onChange={e => setSponsor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Primary Objective</label>
            <textarea 
              rows={2}
              required
              value={objective} 
              onChange={e => setObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Inclusion Criteria</label>
            <textarea 
              rows={2}
              required
              value={inclusionCriteria} 
              onChange={e => setInclusionCriteria(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Exclusion Criteria</label>
            <textarea 
              rows={2}
              required
              value={exclusionCriteria} 
              onChange={e => setExclusionCriteria(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Duration (Weeks)</label>
              <input 
                type="number" 
                required
                value={durationWeeks} 
                onChange={e => setDurationWeeks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-mono transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Target Cohorts / Population</label>
              <input 
                type="text" 
                required
                value={population} 
                onChange={e => setPopulation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Study Design Method</label>
            <input 
              type="text" 
              required
              value={studyDesign} 
              onChange={e => setStudyDesign(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-950 border border-transparent dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-sans transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Document Sections...</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                <span>Execute AI Protocol Blueprint Drafting</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Document View */}
        <div className={`p-6 rounded-xl border flex flex-col h-[700px] shadow-sm transition-all duration-200 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
          <h3 className={`text-sm font-semibold border-b pb-3 flex items-center gap-2 mb-4 ${isDark ? "text-slate-200 border-slate-800" : "text-slate-800 border-slate-200"}`}>
            <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>Clinical Trial Draft Output</span>
          </h3>

          {!generatedDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-500 p-8 gap-3">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400">
                <FileText className="w-8 h-8" />
              </div>
              <p className="max-w-xs leading-relaxed">
                Provide parameters and initiate the AI protocol drafting sequence. Fully structured reports outputs will be generated here.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/30">
                  Clinical Draft Document
                </span>
                <h2 className={`text-base font-bold tracking-tight mt-3 ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                  {generatedDoc.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 font-mono">
                  <span>Therapeutic Area: {generatedDoc.therapeuticArea}</span>
                  <span>•</span>
                  <span>Phase: {generatedDoc.phase}</span>
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-200/50 dark:border-slate-800/50 pt-5">
                {generatedDoc.sections?.map((sec: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <h4 className={`text-xs font-bold tracking-wide font-mono ${isDark ? "text-blue-400" : "text-blue-600"}`}>
                      {sec.title}
                    </h4>
                    <p className={`text-xs leading-relaxed text-justify ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 leading-relaxed text-center font-sans font-medium">
                Educational project prototype draft document, not certified for official medical use.
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
