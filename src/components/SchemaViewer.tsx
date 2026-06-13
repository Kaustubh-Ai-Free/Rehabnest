/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Code, BookOpen, Layers, Check } from 'lucide-react';

export default function SchemaViewer() {
  const [activeTab, setActiveTab] = useState<'postgres' | 'kotlin' | 'python' | 'structure'>('postgres');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postgresSchema = `-- Rehabnest Physiotherapy Clinic Schema (PostgreSQL)
-- Fully optimized for patient EMR & rigorous session tracking

CREATE TABLE patients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(20),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    medical_history TEXT,
    current_condition TEXT,
    completed_sessions INT DEFAULT 0,
    recommended_sessions INT DEFAULT 10,
    condition_status VARCHAR(50) DEFAULT 'active-rehab' 
        CHECK (condition_status IN ('improving', 'stable', 'active-rehab', 'discharged')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id VARCHAR(50) PRIMARY KEY,
    patient_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    doctor_id VARCHAR(50) NOT NULL,
    type VARCHAR(30) CHECK (type IN ('in-clinic', 'home-visit')),
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' 
        CHECK (payment_status IN ('paid', 'pending')),
    payment_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_diagnostic_records (
    id VARCHAR(50) PRIMARY KEY,
    patient_id VARCHAR(50) REFERENCES patients(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    symptoms TEXT NOT NULL,
    mobility_restrictions TEXT,
    condition VARCHAR(255) NOT NULL,
    severity VARCHAR(30) NOT NULL,
    estimated_sessions INT NOT NULL,
    treatment_plan JSONB NOT NULL, -- Holds phase lists
    recommended_modality VARCHAR(100),
    home_care_advice JSONB,
    contraindications JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for appointment times (collides/availability lookup speedup)
CREATE UNIQUE INDEX idx_appointments_collision 
ON appointments(date, time_slot, type) 
WHERE status != 'cancelled';

-- Indexing for active tracking of clinical EMR sessions
CREATE INDEX idx_patients_treatment_tracking 
ON patients(id) 
WHERE completed_sessions < recommended_sessions;
`;

  const kotlinBackend = `// Kotlin (Spring Boot / JPA / Hibernate) Entity & Service Implementation
// High-efficiency appointment scheduling & 45-minute block partition algorithm

package com.rehabnest.clinic.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalTime

@Entity
@Table(name = "patients")
class Patient(
    @Id val id: String,
    var name: String,
    var email: String,
    var completedSessions: Int = 0,
    var recommendedSessions: Int = 10,
    var conditionStatus: String = "active-rehab"
)

@Service
class AppointmentService(
    private val appointmentRepository: AppointmentRepository,
    private val patientRepository: PatientRepository
) {
    // Generate standard 45-minute intervals strictly for home visits (8:00 AM - 8:00 PM)
    fun generateHomeVisitSlots(): List<LocalTime> {
        val slots = mutableListOf<LocalTime>()
        var current = LocalTime.of(8, 0)
        val end = LocalTime.of(20, 0)
        while (current.plusMinutes(45).isBefore(end) || current.plusMinutes(45) == end) {
            slots.add(current)
            current = current.plusMinutes(45)
        }
        return slots
    }

    // Book an appointment, checking strict time slot availability
    @Transactional
    fun bookAppointment(appointmentRequest: AppointmentRequest): Appointment {
        val hasCollision = appointmentRepository.existsByDateAndTimeSlotAndTypeAndStatusNot(
            appointmentRequest.date, 
            appointmentRequest.timeSlot, 
            appointmentRequest.type,
            "cancelled"
        )
        if (hasCollision) {
            throw SlotCollisionException("The 45-minute appointment slot is already locked.")
        }
        
        return appointmentRepository.save(appointmentRequest.toEntity())
    }
}`;

  const pythonBackend = `# Python (FastAPI / SQLModel / Pydantic) Service Logic
# Implements robust clinical treatment generation logic and 45-minute scheduler checks

from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import SQLModel, Field, Session, create_engine, select
from datetime import datetime, date, time, timedelta
from typing import List, Optional

class Appointment(SQLModel, table=True):
    __tablename__ = "appointments"
    id: str = Field(primary_key=True)
    patient_name: str
    email: str
    type: str # "in-clinic" | "home-visit"
    date: date
    time_slot: str
    status: str = "scheduled"

def check_or_reserve_slot(session: Session, new_apt: Appointment) -> bool:
    # Query database to confirm no matching slot collisions exist
    statement = select(Appointment).where(
        Appointment.date == new_apt.date,
        Appointment.time_slot == new_apt.time_slot,
        Appointment.type == new_apt.type,
        Appointment.status != "cancelled"
    )
    existing = session.exec(statement).first()
    if existing:
        return False
    return True

def generate_45min_intervals(start_hr: int = 8, end_hr: int = 20) -> List[str]:
    # Calculates the hardcoded 45-minute blocks required by the practitioners
    intervals = []
    curr = datetime.strptime(f"{start_hr}:00", "%H:%M")
    end = datetime.strptime(f"{end_hr}:00", "%H:%M")
    while curr + timedelta(minutes=45) <= end:
        intervals.append(curr.strftime("%I:%M %p"))
        curr += timedelta(minutes=45)
    return intervals
`;

  const visualStructure = [
    { title: "Root (full-stack template)", desc: "Overall layout", path: "/" },
    { title: "server.ts", desc: "Express environment serving files and hosting secure Gemini and database handlers", path: "/server.ts" },
    { title: "src/db.json", desc: "Database representation containing pre-loaded patient files & scheduling list", path: "/src/db.json" },
    { title: "src/types.ts", desc: "Patient, Diagnostic, and Appointment clinical interfaces", path: "/src/types.ts" },
    { title: "src/App.tsx", desc: "Router controlling secure panels, patient lists, and clinic views", path: "/src/App.tsx" },
    { title: "src/components/LandingPage.tsx", desc: "Patient landing page, credentials block, and location frame", path: "/src/components/LandingPage.tsx" },
    { title: "src/components/BookingSystem.tsx", desc: "Slot calculator, Stripe/Razorpay modal & booking validation", path: "/src/components/BookingSystem.tsx" },
    { title: "src/components/AdminDashboard.tsx", desc: "EMR management, session increments, status panel, doctor logs", path: "/src/components/AdminDashboard.tsx" },
    { title: "src/components/AiAssistant.tsx", desc: "Doctor's AI rehab diagnostician interfacing with Gemini 3.5", path: "/src/components/AiAssistant.tsx" }
  ];

  const currentCode = activeTab === 'postgres' ? postgresSchema : activeTab === 'kotlin' ? kotlinBackend : pythonBackend;

  return (
    <div id="rehabnest-schema-panel" className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 max-w-5xl mx-auto my-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 text-primary-500 font-semibold text-sm tracking-wider uppercase mb-1">
            <Database className="w-4 h-4" />
            <span>Infrastructure Specifications</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-800">
            System Architecture & DB Schemas
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Review production-ready physical database schemas and high-efficiency medical scheduling algorithms.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('postgres')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'postgres'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PostgreSQL SQL
          </button>
          <button
            onClick={() => setActiveTab('kotlin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'kotlin'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kotlin Spring
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'python'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Python FastAPI
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'structure'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Folder Maps
          </button>
        </div>
      </div>

      {activeTab !== 'structure' ? (
        <div className="relative">
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => handleCopy(currentCode)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 text-xs font-medium rounded-md border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner max-h-[420px] overflow-y-auto">
            <pre className="p-5 font-mono text-xs text-emerald-400 text-left leading-relaxed whitespace-pre font-medium">
              {currentCode}
            </pre>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
            <h3 className="font-display font-medium text-slate-800 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-500" />
              <span>Full-Stack Directory Topology</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time directory structure active inside this Google AI Studio sandbox container.
            </p>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {visualStructure.map((v, i) => (
                <div key={i} className="flex flex-col bg-white border border-slate-200 p-2.5 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">{v.path}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold uppercase">{i < 4 ? 'core backend' : 'react frontend'}</span>
                  </div>
                  <span className="text-slate-500 text-xs mt-1">{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="font-display font-medium text-slate-800 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-500" />
                <span>Physiotherapy EMR Mechanics</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed space-y-2">
                The rehabilitation lifecycle operates on strict quantitative session ratios:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>
                  <strong className="text-slate-800">Session Counting:</strong> The patient record has a ratio of <code className="bg-white px-1 py-0.5 rounded border border-slate-200">completed / recommended</code> sessions.
                </li>
                <li>
                  <strong className="text-slate-800">Auto-Registration:</strong> Guest bookings instantly trigger an EMR shell, seeding age, gender, and injury intent.
                </li>
                <li>
                  <strong className="text-slate-800">Collision Avoidance:</strong> Distinct 45-minute timestamps prevent therapist transit overlaps.
                </li>
                <li>
                  <strong className="text-slate-800">AI Synced Plan:</strong> Generates modular pain-phase progressions immediately available in the practitioner board.
                </li>
              </ul>
            </div>
            
            <div className="bg-white border border-slate-200 p-3 rounded-lg text-[11px] text-slate-500 leading-normal mt-4">
              <strong>Database Compliance Note:</strong> In accordance with healthcare standards, database partitions require distinct index locks on active rehabilitation sessions. Click the SQL tab to view index constraints.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
