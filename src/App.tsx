/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import BookingSystem from './components/BookingSystem';
import AdminDashboard from './components/AdminDashboard';

type Screen = 'landing' | 'booking' | 'dashboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased selection:bg-accent-500 selection:text-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {currentScreen === 'landing' && (
          <LandingPage
            onBookAppointment={() => navigateTo('booking')}
            onEnterDashboard={() => navigateTo('dashboard')}
          />
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
      </main>
    </div>
  );
}

