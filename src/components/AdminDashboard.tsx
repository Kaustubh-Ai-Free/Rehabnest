/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Lock, Loader2, Calendar, ClipboardList, Brain, Plus, Search, Check, AlertCircle, RefreshCw, ChevronRight, CheckCircle2, ChevronDown, UserPlus, SlidersHorizontal } from 'lucide-react';
import { Patient, Appointment } from '../types';
import AiAssistant from './AiAssistant';

interface AdminDashboardProps {
  onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  // Secured Authorization State
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('dr-hrushikesh');
  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Core Data State loaded directly from full-stack API
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');

  // Active Sub-panel choices
  const [activeSubTab, setActiveSubTab] = useState<'emr' | 'schedule' | 'clinical-ai'>('emr');

  // EMR Interactions
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPatient, setIsAddingPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState(38);
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientHistory, setNewPatientHistory] = useState('');
  const [newPatientCondition, setNewPatientCondition] = useState('');
  const [newPatientRecommended, setNewPatientRecommended] = useState(10);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState<'improving' | 'stable' | 'active-rehab' | 'discharged'>('active-rehab');

  // Schedule Filters
  const [scheduleFilterDate, setScheduleFilterDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [scheduleFilterType, setScheduleFilterType] = useState<'all' | 'in-clinic' | 'home-visit'>('all');

  // 1. Fetch data from backend
  const refreshClinicData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Could not download clinic datasets.");
      const db = await res.json();
      setPatients(db.patients || []);
      setAppointments(db.appointments || []);
    } catch (err: any) {
      setDataError(err.message || "Failed to download database files.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      refreshClinicData();
    }
  }, [isAuthorized]);

  // 2. Validate Clinic authorization credentials
  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Simple robust pre-seeded PIN lock
    setTimeout(() => {
      if (pin === '1234') {
        setIsAuthorized(true);
      } else {
        setAuthError('Invalid Clinic practitioner PIN. (Hint: Use 1234 for demo verification)');
      }
      setAuthLoading(false);
    }, 600);
  };

  // 3. EMR: Increment Completed therapy session by 1 (+1)
  const handleIncrementSession = async (patient: Patient) => {
    if (patient.completedSessions >= patient.recommendedSessions) return;
    try {
      const nextCount = patient.completedSessions + 1;
      const payload: Partial<Patient> = {
        completedSessions: nextCount,
        conditionStatus: nextCount >= patient.recommendedSessions ? 'discharged' : patient.conditionStatus
      };

      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not update patient session quotients.");
      const updated = await res.json();
      
      // Update local state and trigger refresh
      setPatients(prev => prev.map(p => p.id === patient.id ? updated : p));
    } catch (err: any) {
      alert(err.message || 'Error executing incrementation');
    }
  };

  // 4. EMR: Update Patient details or diagnostic findings
  const handleUpdatePatientNotes = async (pId: string) => {
    try {
      const payload = {
        notes: editNotes,
        conditionStatus: editStatus
      };

      const res = await fetch(`/api/patients/${pId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to overwrite record.");
      const updated = await res.json();
      setPatients(prev => prev.map(p => p.id === pId ? updated : p));
      setEditingPatientId(null);
    } catch (err: any) {
      alert(err.message || "Could not synchronize case changes.");
    }
  };

  // 5. EMR: AI Assistant feedback handler (callback)
  const updateRecommendedSessionsFromAi = async (patientId: string, estimatedSessions: number) => {
    try {
      const payload = { recommendedSessions: estimatedSessions };
      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setPatients(prev => prev.map(p => p.id === patientId ? updated : p));
      }
    } catch (err) {
      console.error("Failed to feedback AI estimates", err);
    }
  };

  // 6. EMR: Add new patient record form
  const handleAddNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !newPatientEmail) return;

    try {
      const payload = {
        name: newPatientName,
        age: newPatientAge,
        gender: newPatientGender,
        email: newPatientEmail,
        phone: newPatientPhone,
        medicalHistory: newPatientHistory || "No historical pathology noted.",
        currentCondition: newPatientCondition || "Undergoing evaluation.",
        recommendedSessions: newPatientRecommended,
        completedSessions: 0,
        conditionStatus: "active-rehab"
      };

      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to insert patient EMR.");
      const added = await res.json();
      setPatients(prev => [...prev, added]);
      
      // Reset form
      setIsAddingPatient(false);
      setNewPatientName('');
      setNewPatientEmail('');
      setNewPatientPhone('');
      setNewPatientHistory('');
      setNewPatientCondition('');
    } catch (err: any) {
      alert(err.message || 'Error inserting patient record');
    }
  };

  // 7. Schedule: Process status transition (complete or cancel bookings)
  const handleUpdateAppointmentStatus = async (apt: Appointment, nextStatus: 'completed' | 'cancelled') => {
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) throw new Error("Could not update slot status.");
      const updatedApt = await res.json();
      setAppointments(prev => prev.map(a => a.id === apt.id ? updatedApt : a));

      // Elegant full-stack UX helper:
      // If therapist completes an appointment, check if we should auto-increment completedSessions for this patient EMR file!
      if (nextStatus === 'completed') {
        const matchingPatient = patients.find(p => p.email.toLowerCase() === apt.email.toLowerCase());
        if (matchingPatient) {
          const consent = window.confirm(`Appointment marked Completed! Double clinic index shows matching EMR record for "${matchingPatient.name}". Would you like to log this as a completed therapy session (+1)?`);
          if (consent) {
            handleIncrementSession(matchingPatient);
          }
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to update scheduling reservation.");
    }
  };

  // Filters patients list based on Search bar
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.currentCondition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filters appointments list based on schedule board selects
  const filteredAppointments = appointments.filter(apt => {
    const dMatches = apt.date === scheduleFilterDate;
    const tMatches = scheduleFilterType === 'all' || apt.type === scheduleFilterType;
    return dMatches && tMatches;
  });

  // Authorization Form Panel
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-slate-900 p-8 text-white text-center space-y-3">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto text-white font-extrabold font-display text-xl leading-none">
              R
            </div>
            <div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                Practitioner Login
              </span>
              <h2 className="text-2xl font-extrabold font-display mt-3 text-slate-100">Rehabnest Secured portal</h2>
              <p className="text-slate-400 text-xs mt-1">EMR Clinical tracking & AI Diagnostic assistant.</p>
            </div>
          </div>

          <form onSubmit={handleAuthorize} className="p-8 text-left space-y-6">
            {selectedDoctorId && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Consulting Specialist</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorId('dr-hrushikesh')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition ${
                      selectedDoctorId === 'dr-hrushikesh'
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Dr. H. Deshmukh
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorId('dr-leetali')}
                    className={`py-2 text-[11px] font-bold rounded-lg transition ${
                      selectedDoctorId === 'dr-leetali'
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Dr. L. Mahajan
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Clinical Authorization PIN</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter 4-digit EMR passcode..."
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength={4}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl py-3 pl-11 pr-3 text-sm text-center font-mono outline-none tracking-widest"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium text-center">
                {authError}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-normal">
              <strong>Security Protocol:</strong> EMR databases contain protected patient health documentation. Use pre-loaded security PIN <code className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono font-bold">1234</code> to access during this demonstration session.
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onBack}
                className="w-1/3 border border-slate-200 py-3 text-xs font-semibold rounded-xl hover:bg-slate-50 text-slate-700 uppercase tracking-wider text-center"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={authLoading}
                className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 text-xs rounded-xl uppercase tracking-wider text-center flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Access Clinical Dashboard</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Authorized Dashboard View
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 text-left">
      {/* Dashboard Top Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-emerald-600 text-xs font-bold font-mono tracking-widest uppercase">
              Clinical Session Active
            </span>
          </div>
          <h1 className="text-3xl font-black font-display text-slate-800 tracking-tight pt-1">
            Rehabnest EMR Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in: <strong className="text-slate-600 font-bold">{selectedDoctorId === 'dr-hrushikesh' ? 'Dr. Hrushikesh Deshmukh' : 'Dr. Leetali Mahajan'}</strong>
          </p>
        </div>

        {/* Navigation tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSubTab('emr')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeSubTab === 'emr'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>EMR Patients list</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeSubTab === 'schedule'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Slots schedule</span>
          </button>

          <button
            id="goto-ai-assistant-tab"
            onClick={() => setActiveSubTab('clinical-ai')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              activeSubTab === 'clinical-ai'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Brain className="w-4 h-4 text-accent-500" />
            <span>AI Diagnostic tool</span>
          </button>

          <button
            onClick={() => {
              setIsAuthorized(false);
              setPin('');
            }}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-widest transition"
          >
            Lock
          </button>
        </div>
      </div>

      {loadingData && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-mono text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
          <span>Synchronizing EMR data catalogs...</span>
        </div>
      )}

      {dataError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium mb-6">
          {dataError}
        </div>
      )}

      {/* Sub-panel Content */}
      {activeSubTab === 'emr' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Search filter */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient EMR files by name, condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2 pl-10 pr-3 text-xs outline-none"
              />
            </div>

            {/* Expand add form toggle */}
            <button
              onClick={() => setIsAddingPatient(!isAddingPatient)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isAddingPatient ? 'Close Form' : 'Register New Patient'}</span>
            </button>
          </div>

          {/* Add patient block */}
          {isAddingPatient && (
            <form onSubmit={handleAddNewPatient} className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 max-w-2xl">
              <h3 className="font-display font-bold text-slate-800 text-lg border-b border-slate-200 pb-2">
                Register New Electronic Medical Record (EMR)
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Patient Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Devendra Patil"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-primary-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Contact Email*</label>
                  <input
                    type="email"
                    required
                    placeholder="E.g., devendra@gmail.com"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Age</label>
                  <input
                    type="number"
                    value={newPatientAge}
                    onChange={(e) => setNewPatientAge(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Trans/Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Recommended Sessions</label>
                  <input
                    type="number"
                    value={newPatientRecommended}
                    onChange={(e) => setNewPatientRecommended(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Primary Diagnosis / Condition Description</label>
                <input
                  type="text"
                  placeholder="E.g., Chronic lower lumbar stiffness with radiating pain (Grade 5) post spine flexion..."
                  value={newPatientCondition}
                  onChange={(e) => setNewPatientCondition(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Secondary Medical History</label>
                <textarea
                  placeholder="Note passive pathology (e.g., bone mineral density loss, hypertensive records...)"
                  rows={2}
                  value={newPatientHistory}
                  onChange={(e) => setNewPatientHistory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none animate-none"
                />
              </div>

              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs px-5 py-2.5 rounded-xl uppercase tracking-widest"
              >
                Register Record
              </button>
            </form>
          )}

          {/* EMR Patient Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredPatients.map(p => {
              const completingRatio = p.completedSessions / p.recommendedSessions;
              const isEligibleForDischarge = p.completedSessions >= p.recommendedSessions;

              return (
                <div 
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow transition relative"
                >
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-display font-extrabold text-slate-800 text-lg leading-none">
                        {p.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block mt-1.5">
                        Patient ID: {p.id} | {p.age} Yrs | {p.gender}
                      </span>
                    </div>

                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                      p.conditionStatus === 'discharged'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : p.conditionStatus === 'active-rehab'
                          ? 'bg-blue-50 text-blue-600 border border-blue-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {p.conditionStatus}
                    </span>
                  </div>

                  {/* Conditions Copy */}
                  <div className="space-y-2 text-xs leading-normal">
                    <div>
                      <strong className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block font-mono">Current Injury Condition:</strong>
                      <p className="text-slate-700 bg-slate-50/50 p-2 border border-slate-100 rounded-lg mt-0.5">{p.currentCondition}</p>
                    </div>

                    <div>
                      <strong className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block font-mono">History/Pathologies:</strong>
                      <p className="text-slate-500 italic mt-0.5">{p.medicalHistory}</p>
                    </div>

                    {p.notes && (
                      <div>
                        <strong className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block font-mono">Specialist Case Notes:</strong>
                        <p className="text-slate-600 text-xs text-left mt-0.5">{p.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Progressive Session quotient Bar */}
                  <div className="space-y-2 bg-slate-50/60 border border-slate-100 p-3 rounded-xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Kinetics Session Ratio:</span>
                      <span className="text-slate-800">
                        {p.completedSessions} / {p.recommendedSessions} completed
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${isEligibleForDischarge ? 'bg-emerald-500' : 'bg-primary-500'}`}
                        style={{ width: `${Math.min(100, completingRatio * 100)}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      {isEligibleForDischarge ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 animate-pulse">
                          <Check className="w-3 h-3" /> Eligible for Discharge!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIncrementSession(p)}
                          className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-md flex items-center gap-1 transition"
                        >
                          <span>Log Session Complete (+1)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingPatientId(p.id);
                          setEditNotes(p.notes || '');
                          setEditStatus(p.conditionStatus);
                        }}
                        className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline"
                      >
                        Adjust notes
                      </button>
                    </div>
                  </div>

                  {/* Quick Inline Editing notes Overlay */}
                  {editingPatientId === p.id && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between border border-slate-200 z-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <h5 className="font-display font-bold text-slate-800">Adjust Case Notes: {p.name}</h5>
                          <button 
                            onClick={() => setEditingPatientId(null)}
                            className="text-xs text-slate-500 font-medium"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Status Indicator</label>
                            <select
                              value={editStatus}
                              onChange={(e: any) => setEditStatus(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 outline-none"
                            >
                              <option value="active-rehab">Active Rehabilitation</option>
                              <option value="improving">Improving Range</option>
                              <option value="stable">Stable / Static State</option>
                              <option value="discharged">Discharged / Rehab Complete</option>
                            </select>
                          </div>

                          <div className="space-y-1 text-left">
                            <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Therapist Notes</label>
                            <textarea
                              rows={3}
                              placeholder="Type progress symptoms, biomechanics changes..."
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded p-2 outline-none focus:border-slate-800"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          onClick={() => setEditingPatientId(null)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded text-xs font-semibold"
                        >
                          Quit
                        </button>
                        <button
                          onClick={() => handleUpdatePatientNotes(p.id)}
                          className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-bold"
                        >
                          Save Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'schedule' && (
        <div className="space-y-6">
          {/* Scheduling Filter Rails */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <h3 className="font-display font-bold text-sm text-slate-800 uppercase tracking-widest">Board Filter Metrics</h3>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-[10px] uppercase font-mono">Date:</span>
                <input
                  type="date"
                  value={scheduleFilterDate}
                  onChange={(e) => setScheduleFilterDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 roundedpx-2.5 py-1 px-2.5 rounded text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold text-[10px] uppercase font-mono">Type:</span>
                <select
                  value={scheduleFilterType}
                  onChange={(e: any) => setScheduleFilterType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 py-1 px-2 text-xs rounded outline-none"
                >
                  <option value="all">All appointments</option>
                  <option value="in-clinic">In-Clinic Consultations Only</option>
                  <option value="home-visit">Home visit blocks Only</option>
                </select>
              </div>

              <button
                onClick={refreshClinicData}
                className="bg-slate-100 text-slate-700 py-1 px-3 border border-slate-200 hover:bg-slate-200 rounded flex items-center gap-1 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync</span>
              </button>
            </div>
          </div>

          {/* Active Appointments timeline list */}
          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 border-dashed rounded-2xl p-12 text-center text-slate-400 text-sm">
                No patient slots booked on {new Date(scheduleFilterDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} matching filters.
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredAppointments.map(apt => (
                  <div 
                    key={apt.id}
                    className="bg-white border border-slate-100 shadow-sm rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
                      {/* Interval Icon Flag */}
                      <div className={`p-2.5 rounded-lg shrink-0 flex items-center justify-center font-bold ${
                        apt.type === 'in-clinic'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-orange-50 text-orange-600'
                      }`}>
                        <span>{apt.timeSlot}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-800 text-sm">{apt.patientName}</h5>
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            apt.type === 'in-clinic' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {apt.type === 'in-clinic' ? 'Clinic Slot' : 'Home visit Block'}
                          </span>
                        </div>
                        <div className="text-slate-500 font-mono text-[10px] mt-1 space-y-0.5">
                          <div>Contact: {apt.phone} | email: {apt.email}</div>
                          {apt.paymentId && <div className="text-emerald-600">Secure Receipt: {apt.paymentId} (PAID)</div>}
                          {apt.notes && <div className="italic text-slate-400 text-xs">Note: "{apt.notes}"</div>}
                        </div>
                      </div>
                    </div>

                    {/* Completion actions */}
                    <div className="flex gap-2 items-center">
                      <span className={`px-2.5 py-1 rounded font-bold uppercase text-[9px] tracking-wider ${
                        apt.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : apt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {apt.status}
                      </span>

                      {apt.status === 'scheduled' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt, 'completed')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded-md text-[10px] uppercase flex items-center gap-0.5 transition"
                            title="Log session complete"
                          >
                            <Check className="w-3.5 h-3.5" /> Complete
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(apt, 'cancelled')}
                            className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-1 px-2.5 rounded-md text-[10px] uppercase transition"
                            title="Release/Cancel time slot"
                          >
                            Release
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'clinical-ai' && (
        <AiAssistant 
          patientsList={patients}
          onUpdatePatientSessions={updateRecommendedSessionsFromAi}
        />
      )}
    </div>
  );
}
