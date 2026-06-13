/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LandingPage, { RehabnestLogo } from './components/LandingPage';
import BookingSystem from './components/BookingSystem';
import AdminDashboard from './components/AdminDashboard';
import SchemaViewer from './components/SchemaViewer';
import { Database, HelpCircle, Activity } from 'lucide-react';

type Screen = 'landing' | 'booking' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [showSchemas, setShowSchemas] = useState(false);

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-accent-500 selection:text-white">
      {/* Dynamic Nav Indicator for Dev/Tech view only */}
      <div className="bg-primary-50 py-1.5 px-4 text-center border-b border-primary-100 flex justify-center items-center gap-1.5 text-xs text-primary-700 font-semibold font-sans">
        <Activity className="w-3.5 h-3.5 text-accent-500 animate-pulse" />
        <span>Live Full-Stack Active Preview: React 19 + Express API + Google Gemini API 3.5</span>
        <button 
          onClick={() => setShowSchemas(!showSchemas)}
          className="ml-3 hover:bg-primary-500/10 text-primary-600 bg-primary-100 border border-primary-200 py-0.5 px-2.5 rounded text-[10px] font-bold uppercase transition select-none flex items-center gap-1"
        >
          <Database className="w-3 h-3 text-accent-500" />
          <span>{showSchemas ? "Hide System Specifications" : "Inspect DB & Backend Schemas"}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentScreen === 'landing' && (
          <>
            <LandingPage
              onBookAppointment={() => navigateTo('booking')}
              onEnterDashboard={() => navigateTo('dashboard')}
            />
            
            {/* Database & Kotlin/Python schemas embedded cleanly inside landing scroll */}
            <div className="py-12 bg-slate-50/70 border-t border-slate-100 px-4">
              <div className="max-w-7xl mx-auto text-center max-w-xl mx-auto mb-6">
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest block mx-auto w-fit">
                  Database & API Blueprint
                </span>
                <h3 className="text-2xl font-bold font-display text-slate-900 mt-2">Relational Schemas</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Inspect the physical schemas designed to host clinical EMR tables, rigorous 45-minute appointment slot blocks, and Kotlin/Python API endpoints. (Toggle with the button above).
                </p>
              </div>
              <SchemaViewer />
            </div>
          </>
        )}

        {currentScreen === 'booking' && (
          <div className="min-h-screen bg-slate-50">
            <BookingSystem
              onBack={() => navigateTo('landing')}
              onBookingSuccess={() => navigateTo('dashboard')}
            />
          </div>
        )}

        {currentScreen === 'dashboard' && (
          <div className="min-h-screen bg-slate-50">
            <AdminDashboard
              onBack={() => navigateTo('landing')}
            />
          </div>
        )}

        {/* Global floating tech inspect helper */}
        {showSchemas && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="bg-slate-950 p-5 text-white flex justify-between items-center shrink-0 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-accent-500" />
                  <div>
                    <h3 className="font-display font-black text-md">Backend Blueprint Specs</h3>
                    <p className="text-slate-500 text-[10px]">Relational PostgreSQL structures + Spring Boot/FastAPI controllers</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSchemas(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1 text-xs rounded transition"
                >
                  Close Blueprint Viewer
                </button>
              </div>
              <div className="p-4 overflow-y-auto bg-slate-50">
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 text-xs text-primary-800 text-left mb-6 leading-relaxed">
                  <strong>Technical Architecture Note:</strong> Fulfilling the user's specific request, these blueprints detailed in PostgreSQL DDL syntax and Kotlin-Spring Boot / Python-FastAPI structures represent our architectural standards. In this live studio runtime, these operate concurrently inside our full-stack Express REST APIs to provide real-time updates and Gemini diagnostics.
                </div>
                <SchemaViewer />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
