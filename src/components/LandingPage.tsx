/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, Heart, Award, ArrowRight, Activity, Calendar } from 'lucide-react';

interface LandingPageProps {
  onBookAppointment: () => void;
  onEnterDashboard: () => void;
}

// Custom vector logo mimicking the uploaded JPEG branding
export function RehabnestLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Blue Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#0d47a1" />
      
      {/* Spine Dotted Chain */}
      <circle cx="50" cy="22" r="2.5" fill="#ffffff" />
      <circle cx="48" cy="28" r="3" fill="#ffffff" />
      <circle cx="46" cy="34" r="3.5" fill="#ffffff" />
      <circle cx="44" cy="40" r="4" fill="#ffffff" />
      <circle cx="46" cy="46" r="4.5" fill="#ffffff" />
      <circle cx="50" cy="52" r="5" fill="#ffffff" />
      <circle cx="53" cy="59" r="4.5" fill="#ffffff" />
      <circle cx="55" cy="67" r="4" fill="#ffffff" />
      <circle cx="53" cy="74" r="3.5" fill="#ffffff" />
      <circle cx="50" cy="81" r="3" fill="#ffffff" />
      <circle cx="50" cy="87" r="2.5" fill="#ffffff" />
      <circle cx="50" cy="93" r="1.5" fill="#ffffff" />

      {/* Top Abstract Person in Orange (Leftward lean, upper right position) */}
      <path 
        d="M82 15C67 17 55 24 51 52C53 43 56 30 75 19C79 17 81 16 82 15Z" 
        fill="#ff6d00" 
      />
      <circle cx="58" cy="9" r="7" fill="#ff6d00" />
      {/* Small spine white accents for top person */}
      <circle cx="78" cy="18" r="1.5" fill="#ffffff" />
      <circle cx="75" cy="20" r="1.5" fill="#ffffff" />
      <circle cx="71" cy="23" r="1.5" fill="#ffffff" />
      <circle cx="67" cy="27" r="1.5" fill="#ffffff" />
      <circle cx="64" cy="31" r="1.5" fill="#ffffff" />
      <circle cx="62" cy="36" r="1.5" fill="#ffffff" />
      <circle cx="60" cy="41" r="1.5" fill="#ffffff" />
      <circle cx="59" cy="47" r="1.5" fill="#ffffff" />

      {/* Bottom Abstract Person in Orange (Rightward lean, lower left position) */}
      <path 
        d="M11 55C26 55 38 60 43 89C40 80 37 66 18 58C14 56 12 56 11 55Z" 
        fill="#ff6d00" 
      />
      <circle cx="34" cy="49" r="7" fill="#ff6d00" />
      {/* Small spine white accents for bottom person */}
      <circle cx="15" cy="57" r="1.5" fill="#ffffff" />
      <circle cx="18" cy="59" r="1.5" fill="#ffffff" />
      <circle cx="21" cy="62" r="1.5" fill="#ffffff" />
      <circle cx="25" cy="66" r="1.5" fill="#ffffff" />
      <circle cx="28" cy="71" r="1.5" fill="#ffffff" />
      <circle cx="30" cy="76" r="1.5" fill="#ffffff" />
      <circle cx="32" cy="81" r="1.5" fill="#ffffff" />
      <circle cx="33" cy="87" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export default function LandingPage({ onBookAppointment, onEnterDashboard }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Banner Contact Bar */}
      <div className="bg-slate-900 text-slate-300 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent-500" />
              <span>KBT circle, Gangapur Road, Nashik</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent-500" />
              <span>+91 91580 12345 / +91 94222 98765</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-accent-500" />
              <span>In-Clinic: 10AM - 9PM | Home-Visit: 8AM - 8PM</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header / Nav */}
      <header className="sticky top-0 bg-white shadow-sm border-b border-slate-100 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <RehabnestLogo className="w-11 h-11" />
            <div>
              <div className="font-display font-extrabold text-xl text-primary-500 tracking-tight leading-tight">
                REHABNEST
              </div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Physiotherapy Clinic
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              id="goto-dashboard-btn"
              onClick={onEnterDashboard}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-500 border border-slate-200 hover:border-primary-500 rounded-lg transition"
            >
              Doctor Portal
            </button>
            <button
              id="book-main-btn"
              onClick={onBookAppointment}
              className="bg-accent-500 hover:bg-accent-600 text-white px-5 py-2 text-sm font-semibold rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0d47a1]/5 via-[#0d47a1]/0 to-[#ff6d00]/5 py-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-500 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Elite Rehabilitation & Spine Care</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight leading-none">
              Reclaim Your <span className="text-primary-500">Mobility</span>, Live Pain Free.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              At Rehabnest Physiotherapy Clinic, we specialized in evidence-based musculoskeletal rehab, cardiac kinetics, cervical decompression, and pediatric neuro-rehabilitation. Meet your Nashik clinic experts or book an intensive home-care therapist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                id="book-hero-btn"
                onClick={onBookAppointment}
                className="bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-md flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 hover:scale-[1.01] transition-all"
              >
                <span>Book Instant Consultation</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                id="view-schemas-btn"
                onClick={() => {
                  const el = document.getElementById('rehabnest-schema-panel');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-4 rounded-xl text-md border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition"
              >
                <span>View System Specifications</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 max-w-lg">
              <div>
                <span className="block text-2xl font-bold text-primary-500 font-display">1k+</span>
                <span className="text-xs text-slate-500 font-medium">Rehabbed Patients</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-primary-500 font-display">15+</span>
                <span className="text-xs text-slate-500 font-medium">Clinical Years</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-primary-500 font-display">99%</span>
                <span className="text-xs text-slate-500 font-medium">Patient Recovery Rate</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {/* Beautiful visual representing physical therapist assistance */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200/50 shadow-xl group">
              {/* Abstract decorative grid */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0d47a1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="z-10 p-10 text-center flex flex-col items-center">
                <div className="p-5 bg-gradient-to-tr from-primary-500 to-indigo-600 rounded-full shadow-lg shadow-primary-500/30 text-white mb-6">
                  <RehabnestLogo className="w-24 h-24" />
                </div>
                <h4 className="font-display font-extrabold text-slate-800 text-xl tracking-tight">Rehabnest Physiotherapy</h4>
                <p className="text-slate-500 text-xs mt-1 font-medium tracking-widest uppercase">Trusted Clinical Spine Specialists</p>
                <div className="mt-4 flex gap-1.5 justify-center">
                  <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 px-2.5 py-1 rounded-full font-bold">● ISO 9001 Certified</span>
                  <span className="text-xs bg-primary-500/10 text-primary-500 border border-primary-500/10 px-2.5 py-1 rounded-full font-bold">★ 4.9 Map Rating</span>
                </div>
              </div>

              {/* Decorative side badge */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-3 shadow-md flex items-center gap-3">
                <div className="p-2 bg-accent-500/10 rounded-lg text-accent-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">Advanced EMG Diagnosis</div>
                  <div className="text-[10px] text-slate-500">Dual consulting doctors in Nashik</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialists Section */}
      <section className="py-16 px-4 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Our Lead Clinical Experts</h2>
            <p className="text-slate-500 text-sm mt-2">
              Our practitioners are certified physiotherapists representing top academic and rehabilitation institutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Dr. Hrushikesh Deshmukh */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shrink-0">
                HD
              </div>
              <div className="text-left space-y-2">
                <div className="inline-block bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Lead Physiotherapist
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Dr. Hrushikesh Deshmukh</h3>
                <p className="text-xs text-slate-500 font-medium font-mono">B.P.Th, M.P.Th (Neuro),Urologist </p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Specializes in post-surgical rehab (ACL & Meniscus), joint mobilizations, advanced trigger point release, and intensive back spine decompression. Known for dynamic diagnostic tracking.
                </p>
                <div className="flex gap-2 pt-2 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-accent-500" /> 8+ Yrs Experience</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-accent-500" /> Ortho Specialist</span>
                </div>
              </div>
            </div>

            {/* Dr. Leetali Mahajan */}
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row gap-6 items-start hover:shadow-md transition">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent-500 fill-white flex items-center justify-center text-white text-2xl font-bold font-display shadow-lg shrink-0">
                LM
              </div>
              <div className="text-left space-y-2">
                <div className="inline-block bg-accent-50 text-accent-600 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Neurological Co-Director
                </div>
                <h3 className="text-lg font-bold text-slate-800 font-display">Dr. Leetali Mahajan</h3>
                <p className="text-xs text-slate-500 font-medium font-mono">B.P.Th, Neuro rehab expert</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Specializes in cervical spondylosis, stroke recoveries, facial palsy, osteoarthritic knee protocols, and neurological active movement restoration. Expert in managing critical home care.
                </p>
                <div className="flex gap-2 pt-2 text-[11px] font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-primary-500" /> Yrs Experience</span>
                  <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-primary-500" /> Neuro & Spine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services At a Glance */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Our Care Modalities</h2>
            <p className="text-slate-500 text-sm mt-2">
              Whether you book an appointment in our state-of-the-art Nashik clinic or choose clinical home visits.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-slate-800">In-Clinic consultations</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Treatment at our advanced facility with full access to mechanical traction, ultrasound units, and therapeutic gyms.
              </p>
              <span className="text-[11px] text-primary-500 font-bold bg-primary-50 px-2 py-0.5 rounded">10:00 AM - 9:00 PM Daily</span>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-500 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-slate-800">Clinical Home Visits</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Personalized physical rehabilitation in the comfort of your home. Rigid 45-minute booking blocks to guarantee session fidelity.
              </p>
              <span className="text-[11px] text-accent-500 font-bold bg-accent-50 px-2 py-0.5 rounded">08:00 AM - 8:00 PM Daily</span>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-slate-800">Real-time EMR Tracking</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Never lose track of your progress. Our portal monitors active session quotients, tracking exact completed vs. recommended therapy indices.
              </p>
              <span className="text-[11px] text-emerald-500 font-bold bg-emerald-50 px-2 py-0.5 rounded">Practitioner Synchronized</span>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-display font-bold text-slate-800">AI Clinical Diagnostic</h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Our lead physiotherapists utilize diagnostic screening tools to map raw symptoms onto phase-by-phase physical rehab plans.
              </p>
              <span className="text-[11px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">Gemini Powered Assistant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Location Map Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 text-left space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
              <MapPin className="w-3.5 h-3.5 text-accent-500" />
              <span>Clinic Location</span>
            </div>
            <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight leading-none">
              Visit Our Nashik Clinic
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              We are strategically located at KBT Circle, Gangapur Road, which is fully accessible with support and parking access for patients with physical mobility restrictions.
            </p>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-3 text-slate-600">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Address:</strong> Rehabnest Physiotherapy Clinic, KBT circle, Gangapur Road, Nashik, Maharashtra 422005.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                <span>+91 8669191616 / +91 7776914665</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500 shrink-0" />
                <span>Monday - Sunday: 10:00 AM - 9:00 PM</span>
              </div>
            </div>

            <button
              onClick={onBookAppointment}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-3 rounded-lg text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Get Directions & Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="w-full h-[350px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative">
              {/* Responsive Embedded IFrame Google Maps Pointing exactly to KBT Circle, Gangapur Road, Nashik, India */}
              <iframe
                id="gmap_canvas"
                className="w-full h-full opacity-90 hover:opacity-100 transition"
                src="https://maps.google.com/maps?q=Rehabnest%20Physiotherapy%20Clinic,%20KBT%20circle,%20Gangapur%20road,%20Nashik&t=&z=16&ie=UTF8&iwloc=&output=embed"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                title="Rehabnest Physiotherapy Clinic Location Map"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 text-left mt-auto">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <RehabnestLogo className="w-8 h-8" />
              <div className="font-display font-extrabold text-white text-lg tracking-tight leading-none">
                REHABNEST
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Dedicated rehabilitative medicine, orthopedics, physical motion tracking, and tailored clinical sports injury therapies. Available for both in-clinic and direct home critical visits.
            </p>
          </div>

          <div>
            <h5 className="font-display font-semibold text-white text-sm mb-4">Therapy Timings</h5>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>In-Clinic Consultations: 10:00 AM - 9:00 PM</li>
              <li>Home physical visits: 8:00 AM - 8:00 PM</li>
              <li>Emergency Spine Assessment: On call 24x7</li>
            </ul>
          </div>

          <div>
            <h5 className="font-display font-semibold text-white text-sm mb-4">Clinic Locations</h5>
            <div className="text-xs space-y-2 leading-relaxed text-slate-400">
              <p>Rehabnest Physiotherapy Clinic</p>
              <p>Near KBT Circle, Gangapur Road, Nashik, MH 422005</p>
            </div>
          </div>

          <div>
            <h5 className="font-display font-semibold text-white text-sm mb-4">Staff & Portals</h5>
            <div className="space-y-3">
              <div>
                <span className="block text-xs font-bold text-slate-300">Dr. Hrushikesh Deshmukh</span>
                <span className="text-[10px] text-slate-500">Lead Neuro Rehab</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-300">Dr. Leetali Mahajan</span>
                <span className="text-[10px] text-slate-500">Neurological Coordinator</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-600">
          <span>&copy; {new Date().getFullYear()} Rehabnest Physiotherapy Clinic. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">HIPAA Compliant</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">Clinical Consent Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
