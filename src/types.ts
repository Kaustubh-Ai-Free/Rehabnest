/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  doctorId: string; // 'dr-hrushikesh' | 'dr-leetali' | 'any'
  type: 'in-clinic' | 'home-visit';
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:15 AM"
  paymentStatus: 'paid' | 'pending';
  paymentId?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  medicalHistory: string;
  currentCondition: string;
  completedSessions: number;
  recommendedSessions: number;
  conditionStatus: 'improving' | 'stable' | 'active-rehab' | 'discharged';
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  username: string; // for doctor portal login
  role: string;
}

export interface DiagnosticResult {
  condition: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  estimatedSessions: number;
  treatmentPlan: string[];
  recommendedModality: string;
  homeCareAdvice: string[];
  contraindications: string[];
}
