/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Brain, Sparkles, Activity, ShieldAlert, HeartPulse, ClipboardList, Loader2, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { DiagnosticResult, Patient } from '../types';

interface AiAssistantProps {
  onUpdatePatientSessions?: (patientId: string, recommended: number) => void;
  patientsList?: Patient[];
}

const CLINICAL_PRESETS = [
  {
    title: "Post-Op ACL Tear (R), Week 4",
    notes: "Patient is 4 weeks post-anterior cruciate ligament reconstruction. Left quadriceps atrophy present. Hamstring harvest site healed well. Walking with active single crutch mobilization.",
    symptoms: "Mild joint effusion, Grade 4 stabbing pain during active flexion. Morning movement lock.",
    restrictions: "Knee flexion restricted to 70 degrees. Joint extension lacks 5 degrees. Non-weight-bearing without a stabilization brace."
  },
  {
    title: "Bilateral Knee Osteoarthritis",
    notes: "63-year-old female presenting with chronical mechanical knee pain on stairs. Crepitus audible in bilateral patellofemoral joints. Quadriceps holding index is weak.",
    symptoms: "Dull ache, stiffness during morning transitions lasting 45 mins. Grade 6 pain on deep knee loading.",
    restrictions: "Squatting is impossible. Limited passive knee range of motion in terminal flexion. Lateral gait translation."
  },
  {
    title: "Severe Cervicogenic Headache",
    notes: "Software developer sitting 10 hours daily. Pain radiates from suboccipital region to frontal orbit. Reports sporadic vertigo signs.",
    symptoms: "Throbbing orbital compression pain, muscle guard in upper trapezius. Grade 5 aching.",
    restrictions: "Cervical lateral extension blocked on left side. Bilateral rotation lacks 20 degrees. Shoulder protraction severe."
  }
];

export default function AiAssistant({ onUpdatePatientSessions, patientsList = [] }: AiAssistantProps) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [mobilityRestrictions, setMobilityRestrictions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState('');

  // Handle Preset Quick Click
  const handleApplyPreset = (preset: typeof CLINICAL_PRESETS[0]) => {
    setNotes(preset.notes);
    setSymptoms(preset.symptoms);
    setMobilityRestrictions(preset.restrictions);
    setError('');
  };

  // Sync state if doctor selects an existing EMR patient directly
  const handleSelectPatient = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedPatientId(pId);
    if (!pId) return;

    const pat = patientsList.find(p => p.id === pId);
    if (pat) {
      setNotes(`Case review for ${pat.name}. Age: ${pat.age}, Gender: ${pat.gender}. Undergoing EMR session evaluation.`);
      setSymptoms(pat.currentCondition);
      setMobilityRestrictions(pat.medicalHistory);
    }
  };

  // Run AI Clinician screening
  const handleSubmitAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || !symptoms.trim()) {
      return setError("Please fill in current clinic observations and symptoms before generating diagnosis.");
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes,
          symptoms,
          mobilityRestrictions
        })
      });

      if (!res.ok) {
        const errDetails = await res.json();
        throw new Error(errDetails.error || "Failed to parse clinical AI output.");
      }

      const diagnosticData: DiagnosticResult = await res.json();
      setResult(diagnosticData);

      // If an existing patient is selected, optionally feedback recommended sessions into the EMR!
      if (selectedPatientId && onUpdatePatientSessions && diagnosticData.estimatedSessions) {
        onUpdatePatientSessions(selectedPatientId, diagnosticData.estimatedSessions);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred with the clinical assistant. Confirm your GEMINI_API_KEY.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1.5">
          <Brain className="w-4 h-4 text-primary-500" />
          <span>Secured Practitioner Brain</span>
        </div>
        <h1 className="text-2xl font-extrabold font-display text-slate-800">
          Doctor's AI Diagnostic Assistant
        </h1>
        <p className="text-slate-500 text-sm">
          A secure machine-learning framework utilized exclusively by Rehabnest clinical practitioners to screen musculoskeletal kinematics and compile customized physical rehab plans.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Clinician Entry Form */}
        <div className="lg:col-span-6 bg-white border border-slate-100 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-display font-medium text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-500" />
              <span>Diagnostic Screen Specs</span>
            </h3>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Gemini 3.5 Active
            </span>
          </div>

          {/* Quick Case Presets - extremely helpful for demoing */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Clinic Demo Profiles</span>
            <div className="flex flex-wrap gap-1.5">
              {CLINICAL_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyPreset(p)}
                  type="button"
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 py-1 px-2.5 rounded-lg text-xs font-semibold select-none transition"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmitAnalysis} className="space-y-4">
            {/* Direct Patient Linking Optional */}
            {patientsList.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Link to Existing Patient EMR</label>
                <select
                  value={selectedPatientId}
                  onChange={handleSelectPatient}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2 px-3 text-xs outline-none"
                >
                  <option value="">-- Optional: Fetch details from active EMR file --</option>
                  {patientsList.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - {p.currentCondition.slice(0, 45)}...</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Notes / Case Observations</label>
              <textarea
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., Week 4 ACL post-op ligament checkup, severe unilateral quadriceps muscle guarding, patellar glide limited..."
                rows={3}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl p-3 text-sm transition outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Reported Symptoms & Pain Index</label>
              <textarea
                required
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="E.g., Throbbing joint stiffness, pain scales Grade 6/10 on light loading, morning joints locks..."
                rows={2}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl p-3 text-sm transition outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Range of Motion / Kinetic Limitations</label>
              <input
                type="text"
                value={mobilityRestrictions}
                onChange={(e) => setMobilityRestrictions(e.target.value)}
                placeholder="E.g., Shoulder abduction restricted to 95 degrees, lumbar extension lacks terminal 10..."
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2 px-3 text-sm transition outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 font-bold py-3 text-xs text-white rounded-xl shadow hover:shadow-md transition uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
                  <span>AI Modeling in Process...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 text-accent-500" />
                  <span>Execute Diagnostic Screen</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Screening Output Result */}
        <div className="lg:col-span-6">
          {loading ? (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-8 shadow-lg border border-slate-800 flex flex-col items-center justify-center min-h-[460px] text-center space-y-4">
              <div className="relative">
                <Brain className="w-16 h-16 text-accent-500 animate-pulse" />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-medium text-lg">Synthesizing Rehabilitation Metrics</h4>
                <p className="text-slate-400 text-xs max-w-sm">
                  Leveraging clinical libraries to extract injury conditions, safe therapeutic ranges, and calculate optimal recovery visit quotients...
                </p>
              </div>
              <div className="text-xs bg-slate-800 text-slate-300 font-mono px-3.5 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping"></span>
                <span>Connecting to Google GenAI server</span>
              </div>
            </div>
          ) : result ? (
            <div className="bg-white border border-indigo-100/50 rounded-2xl shadow-lg border border-slate-100 overflow-hidden divide-y divide-slate-100 text-left">
              {/* Header Badge */}
              <div className="bg-slate-900 p-6 text-white text-left flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-accent-500" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Clinical AI Assessment Report</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-indigo-100 pt-1 leading-tight">{result.condition}</h3>
                </div>
                
                <span className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                  result.severity === 'Severe' 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/25'
                    : result.severity === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'
                }`}>
                  {result.severity}
                </span>
              </div>

              {/* Sessions estimate and modality indicators */}
              <section className="p-5 grid grid-cols-2 gap-4 bg-slate-50">
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 leading-tight">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Rehab Visit Quotient</span>
                  <span className="text-2xl font-black text-slate-800 font-display">
                    {result.estimatedSessions} <span className="text-xs text-slate-500 font-medium font-sans">sessions</span>
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/60 leading-tight">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Critical Modality Focus</span>
                  <span className="text-xs font-bold text-primary-500 block truncate mt-1">
                    {result.recommendedModality || "Manual Decompression"}
                  </span>
                </div>
              </section>

              {/* Treatment Phase Progression */}
              <section className="p-5 space-y-3">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary-500" />
                  <span>Phase-by-Phase Physical Rehab Plan</span>
                </h4>
                <div className="space-y-2.5">
                  {result.treatmentPlan.map((step, index) => (
                    <div key={index} className="flex gap-3 text-xs leading-normal">
                      <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-slate-600 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Home Care Advice */}
              <section className="p-5 space-y-3 bg-slate-50/50">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Recommended Passive Home Care</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {result.homeCareAdvice.map((advice, index) => (
                    <div key={index} className="flex items-start gap-2 text-slate-600">
                      <span className="text-emerald-500 select-none font-bold">✓</span>
                      <p>{advice}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Contraindications Warning */}
              <section className="p-5 space-y-3 border-t-2 border-rose-100 bg-rose-50/15">
                <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Patient Contraindications (Avoid Strictly)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {result.contraindications.map((warning, index) => (
                    <div key={index} className="flex items-start gap-2 text-rose-700 leading-normal">
                      <span className="text-rose-500 text-base font-bold shrink-0 leading-none">!</span>
                      <p className="font-semibold">{warning}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* EMR Feedback advice */}
              {selectedPatientId && (
                <div className="p-4 bg-emerald-50/10 text-emerald-600 border-t border-slate-100 text-[10px] text-center font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <span>✓ Automatically updated Patient Recommended Session Index in EMR</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200/50 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center min-h-[460px] text-center space-y-3">
              <Brain className="w-12 h-12 text-slate-300" />
              <div>
                <h4 className="font-display font-medium text-slate-700 text-sm">Awaiting Diagnostic Input</h4>
                <p className="text-slate-400 text-xs max-w-xs mt-1">
                  Select a clinical preset or type patient observations into the form to execute artificial cognitive rehabilitation diagnostics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
