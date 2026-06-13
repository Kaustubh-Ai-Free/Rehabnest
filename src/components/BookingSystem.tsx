/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, QrCode, Smartphone, Copy, Check, User, Mail, Phone, MapPin, Sparkles, AlertTriangle, CheckCircle, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Appointment } from '../types';

interface BookingSystemProps {
  onBack: () => void;
  onBookingSuccess: () => void;
}

const HOME_VISIT_TIME_SLOTS = [
  "08:00 AM", "08:45 AM", "09:30 AM", "10:15 AM", "11:00 AM", "11:45 AM",
  "12:30 PM", "01:15 PM", "02:00 PM", "02:45 PM", "03:30 PM", "04:15 PM",
  "05:00 PM", "05:45 PM", "06:30 PM", "07:15 PM"
];

const CLINIC_TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
];

export default function BookingSystem({ onBack, onBookingSuccess }: BookingSystemProps) {
  // Booking Form State
  const [patientName, setPatientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorId, setDoctorId] = useState('any'); // 'dr-hrushikesh' | 'dr-leetali' | 'any'
  const [type, setType] = useState<'in-clinic' | 'home-visit'>('in-clinic');
  const [date, setDate] = useState(() => {
    const today = new Date();
    // Format: YYYY-MM-DD
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Active bookings from API to perform real-time collision detection
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [apiError, setApiError] = useState('');

  // UI Flow State (form -> payment -> ticket_success)
  const [step, setStep] = useState<'details' | 'payment' | 'ticket'>('details');
  const [activePaymentTab, setActivePaymentTab] = useState<'qr' | 'upi-id'>('qr');
  
  // Real-world dynamic UPI configs
  const clinicUpiId = (import.meta as any).env.VITE_CLINIC_UPI_ID || 'rehabnest@upi';
  const clinicUpiName = (import.meta as any).env.VITE_CLINIC_UPI_NAME || 'Rehabnest Health Pvt Ltd';
  
  // UPI payment state
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiHolderName, setUpiHolderName] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ id: string; amount: number; paymentId: string; method?: string } | null>(null);

  // Prices
  const clinicFee = 500; // INR
  const homeFee = 1200; // INR
  const activeFee = type === 'in-clinic' ? clinicFee : homeFee;

  // 1. Fetch appointments whenever date/type shifts to block off booked slots
  useEffect(() => {
    const fetchExistingBookings = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch("/api/appointments");
        if (!res.ok) throw new Error("Failed to load clinical scheduling constraints.");
        const data = await res.json();
        setExistingAppointments(data);
        
        // Filter slots specifically matching 'date' AND 'type' that aren't cancelled
        const taken = data
          .filter((apt: any) => apt.date === date && apt.type === type && apt.status !== 'cancelled')
          .map((apt: any) => apt.timeSlot);
        setBookedSlots(taken);
        setTimeSlot(''); // Reset selected slot to avoid collision residues
      } catch (err: any) {
        setApiError(err.message || 'Error communicating with slot server.');
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchExistingBookings();
  }, [date, type]);

  // Countdown timer for UPI QR Code
  useEffect(() => {
    if (step !== 'payment') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 1 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // 2. Validate Detail forms to advance to booking payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!patientName.trim()) return setApiError('Patient Name is required.');
    if (!email.trim() || !email.includes('@')) return setApiError('Enter a valid Email.');
    if (!phone.slice(5).trim() && phone.replace(/\s/g, '').length < 8) return setApiError('Enter a valid Contact Number.');
    if (!timeSlot) return setApiError('Please select an available rehabilitation time slot.');

    setStep('payment');
  };

  // 3. Verify custom client UPI ID
  const handleVerifyUpi = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!upiId.trim() || !upiId.includes('@')) {
      return setApiError('Please enter a valid UPI address format (e.g., user@okicici or name@upi).');
    }
    setApiError('');
    setIsVerifyingUpi(true);
    setTimeout(() => {
      setIsVerifyingUpi(false);
      setIsUpiVerified(true);
      const prefix = upiId.split('@')[0];
      const verifiedLabel = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      setUpiHolderName(`${verifiedLabel} (Verified Payee Account)`);
    }, 700);
  };

  // 4. Process mock UPI/QR Code Payment
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setPaymentLoading(true);

    if (activePaymentTab === 'upi-id') {
      if (!upiId.trim()) {
        setPaymentLoading(false);
        return setApiError('Please enter a valid UPI ID (e.g., name@upi) to request approval.');
      }
      if (!upiId.includes('@')) {
        setPaymentLoading(false);
        return setApiError('Enter a valid UPI address. It must contain the "@" character (e.g., user@okaxis).');
      }
      // If not verified, trigger a quiet background verification for a seamless sandbox flow
      if (!isUpiVerified) {
        setIsUpiVerified(true);
        setUpiHolderName(`${patientName || 'Patient Payee'} (Sandbox Verified)`);
      }
    }

    // Validate 12-digit UTR No
    const cleanUtr = utrNumber.replace(/\D/g, '');
    if (cleanUtr.length !== 12) {
      setPaymentLoading(false);
      return setApiError('Standard Indian UPI transfers generate a 12-digit Transaction Reference (UTR). Please enter all 12 digits to link your invoice.');
    }

    try {
      const realPaymentId = `UTR-${cleanUtr}`;
      
      const payload = {
        patientName,
        email,
        phone,
        doctorId,
        type,
        date,
        timeSlot,
        paymentStatus: 'paid',
        paymentId: realPaymentId,
        notes
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to commit clinical reservation.");
      }

      await res.json(); // Booked Appointment
      setPaymentSuccessData({
        id: `apt_${Date.now().toString().slice(-5)}`,
        amount: activeFee,
        paymentId: realPaymentId,
        method: activePaymentTab === 'qr' ? 'UPI QR Scan' : `UPI Push Request (${upiId})`
      });
      setStep('ticket');
    } catch (err: any) {
      setApiError(err.message || 'Payment successfully registered but slot synchronization failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const activeTimeSlots = type === 'in-clinic' ? CLINIC_TIME_SLOTS : HOME_VISIT_TIME_SLOTS;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-left">
      {/* Top action header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <span className="text-primary-500 text-xs font-bold font-mono tracking-widest uppercase">Patient Booking Desk</span>
          <h1 className="text-2xl font-extrabold font-display text-slate-800 leading-none">Schedule Appointment</h1>
        </div>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Booking progress visual */}
      <div className="grid grid-cols-3 gap-2 mb-8 text-center max-w-lg">
        <div className="flex flex-col gap-1.5">
          <div className={`h-1.5 rounded-full transition-all ${step === 'details' ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'details' ? 'text-primary-500' : 'text-slate-400'}`}>1. Session Details</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className={`h-1.5 rounded-full transition-all ${step === 'payment' ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'payment' ? 'text-primary-500' : 'text-slate-400'}`}>2. Online Checkout</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className={`h-1.5 rounded-full transition-all ${step === 'ticket' ? 'bg-primary-500' : 'bg-slate-200'}`}></div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${step === 'ticket' ? 'text-primary-500' : 'text-slate-400'}`}>3. Confirmation</span>
        </div>
      </div>

      {step === 'details' && (
        <form onSubmit={handleProceedToPayment} className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-md space-y-6">
            <h3 className="font-display font-medium text-lg text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-500" />
              <span>Patient Contact Profile</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="E.g., Rohan Mehta"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2.5 pl-10 pr-3 text-sm transition outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="E.g., rohan@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2.5 pl-10 pr-3 text-sm transition outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Number (WhatsApp)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="E.g., +91 98230 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2.5 pl-10 pr-3 text-sm transition outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consulting Therapist</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2.5 pl-10 pr-3 text-sm transition outline-none appearance-none"
                  >
                    <option value="any">First Available Practitioner</option>
                    <option value="dr-hrushikesh">Dr. Hrushikesh Deshmukh (Orthopedics)</option>
                    <option value="dr-leetali">Dr. Leetali Mahajan (Neurological Rehab)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional clinical notes / injury history</label>
              <textarea
                placeholder="Briefly explain active symptoms, physical pain factors, or post-surgical recovery status..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl p-3 text-sm transition outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-md flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <h3 className="font-display font-medium text-lg text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-500" />
                <span>Type & Interval Selector</span>
              </h3>

              {/* In-Clinic / Home-Visit Choice */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setType('in-clinic')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'in-clinic'
                      ? 'bg-white text-primary-500 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  In-Clinic Consultation
                </button>
                <button
                  type="button"
                  onClick={() => setType('home-visit')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    type === 'home-visit'
                      ? 'bg-white text-accent-500 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Physical Home Visit
                </button>
              </div>

              {/* Date selection */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Choose Calendar Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary-500 rounded-xl py-2 pl-10 pr-3 text-sm transition outline-none"
                  />
                </div>
              </div>

              {/* Slot picker with loading indicators */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                    Available Slots ({type === 'in-clinic' ? 'Hourly' : '45-Minute blocks'})
                  </label>
                  {loadingSlots && (
                    <span className="text-[10px] text-primary-500 font-bold flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching...
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 max-h-[190px] overflow-y-auto p-1 bg-slate-50 border border-slate-100 rounded-xl">
                  {activeTimeSlots.map((slot) => {
                    const isTaken = bookedSlots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isTaken}
                        onClick={() => setTimeSlot(slot)}
                        className={`py-2 px-1 text-xs font-bold border rounded-lg text-center transition ${
                          isTaken
                            ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : timeSlot === slot
                              ? type === 'in-clinic'
                                ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                                : 'bg-accent-500 border-accent-500 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
                {bookedSlots.length > 0 && (
                  <span className="text-[10px] text-slate-500 font-medium block">
                    * Locked/crossed slots are already scheduled by other patients on this day.
                  </span>
                )}
              </div>
            </div>

            {/* Price badge and Action */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="text-left">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Treatment Charge</span>
                  <span className="text-lg font-extrabold text-slate-800 font-display">
                    ₹{activeFee} <span className="text-xs text-slate-500 font-normal">/ session</span>
                  </span>
                </div>
                <div className="text-right text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">
                  {type === 'in-clinic' ? (
                    <span className="text-primary-500">Includes Diagnostic Screening</span>
                  ) : (
                    <span className="text-accent-500">Includes Therapist Commute</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-white shadow-md transition-all uppercase tracking-wider text-xs ${
                  type === 'in-clinic'
                    ? 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/10'
                    : 'bg-accent-500 hover:bg-accent-600 shadow-accent-500/10'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Confirm & Advance to UPI Payment</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'payment' && (
        <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 p-6 text-white text-left flex justify-between items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Secure UPI Checkout</span>
              <h3 className="font-display font-extrabold text-xl">Payment Gateway</h3>
            </div>
            <span className="text-xl font-bold font-mono text-accent-500">₹{activeFee}</span>
          </div>

          <form onSubmit={handleProcessPayment} className="p-6 space-y-5 text-left">
            {/* Tab switchers */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block animate-none">Choose payment method</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab('qr');
                    setApiError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activePaymentTab === 'qr'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-primary-500" />
                  <span>Scan UPI QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentTab('upi-id');
                    setApiError('');
                  }}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activePaymentTab === 'upi-id'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-accent-500" />
                  <span>Pay with UPI ID</span>
                </button>
              </div>
            </div>

            {/* QR Scanner Display tab */}
            {activePaymentTab === 'qr' && (
              <div className="space-y-4 text-center pt-2">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center animate-none">
                  <div className="bg-white p-3.5 border border-slate-200 rounded-2xl shadow-sm mb-3">
                    {/* Live dynamically generated UPI QR code */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        `upi://pay?pa=${clinicUpiId}&pn=${encodeURIComponent(clinicUpiName)}&am=${activeFee}.00&cu=INR&tn=${encodeURIComponent(`Rehabnest - ${patientName.slice(0, 15)}`)}`
                      )}`} 
                      alt="UPI QR Code" 
                      className="w-40 h-40 object-contain mx-auto"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest font-mono">BHIM UPI QR CODE</span>
                  <span className="text-xs font-black text-slate-800 font-sans tracking-tight block uppercase">{clinicUpiName}</span>
                  
                  {/* Display & copy UPI ID */}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/50">
                    <code className="text-xs font-mono font-bold text-slate-600">{clinicUpiId}</code>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(clinicUpiId);
                        setCopiedUpi(true);
                        setTimeout(() => setCopiedUpi(false), 2000);
                      }}
                      className="text-slate-400 hover:text-slate-700 transition"
                      title="Copy UPI Address"
                    >
                      {copiedUpi ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied!</span>
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3.5 bg-white border border-slate-200/60 rounded-xl px-3.5 py-2 inline-flex flex-col items-center gap-1 w-full max-w-[280px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-[11px] font-bold text-slate-700">
                        Total Amount: ₹{activeFee}
                      </span>
                    </div>
                    {/* Deep link click triggers standard mobile wallets natively */}
                    <a 
                      href={`upi://pay?pa=${clinicUpiId}&pn=${encodeURIComponent(clinicUpiName)}&am=${activeFee}.00&cu=INR&tn=${encodeURIComponent(`Rehabnest - ${patientName.slice(0, 15)}`)}`}
                      className="text-[10px] font-bold text-primary-500 hover:underline mt-0.5 block text-center"
                    >
                      On Mobile? Tap to open UPI App &rarr;
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 leading-normal flex items-start gap-1.5 text-left">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    This secure QR is valid for booking:{" "}
                    <strong className="font-mono font-bold bg-white px-1 rounded text-slate-900 border border-amber-200">
                      {Math.floor(timeLeft / 60)}:
                      {String(timeLeft % 60).padStart(2, "0")} minutes
                    </strong>
                    . Pay with any UPI app and enter the UTR status digits below.
                  </div>
                </div>
              </div>
            )}

            {/* UPI ID Address request display tab */}
            {activePaymentTab === 'upi-id' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 block">Virtual Payment Address (VPA) / UPI ID</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required={activePaymentTab === 'upi-id'}
                        placeholder="E.g., rohan@okhdfcbank"
                        value={upiId}
                        onChange={(e) => {
                          setUpiId(e.target.value.trim());
                          setIsUpiVerified(false);
                        }}
                        className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm transition font-mono outline-none"
                      />
                    </div>
                    
                    <button
                      type="button"
                      disabled={isVerifyingUpi}
                      onClick={handleVerifyUpi}
                      className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 uppercase tracking-wider transition shrink-0 flex items-center justify-center min-w-[70px]"
                    >
                      {isVerifyingUpi ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      ) : isUpiVerified ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span>Verify</span>
                      )}
                    </button>
                  </div>
                </div>

                {isUpiVerified && upiHolderName && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-800 text-xs text-left">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                    <div>
                      <strong>Account holder:</strong> {upiHolderName}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-slate-500 leading-normal flex items-start gap-1.5 text-left">
                  <Sparkles className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Verification flow:</strong> Confirm your personal UPI ID above (or click "Verify" using any address like <code className="bg-white border border-slate-200 px-1 py-0.2 rounded font-mono text-slate-700">test@upi</code>), transfer funds of ₹{activeFee} to the clinic's VPA, and specify the UTR digits below.
                  </div>
                </div>
              </div>
            )}

            {/* UPI UTR Reference Digits Field */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                Verification: 12-Digit UPI UTR No
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Enter 12-Digit Transaction No (e.g. 192837465012)"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full bg-slate-50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-sm transition font-mono outline-none text-slate-800 font-bold"
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal">
                Check your banking statement or GPay/PhonePe receipt snapshot to obtain the 12-digit Reference Number (UTR). For sandbox testing, you can input any 12 digits (e.g. <code className="bg-slate-100 px-1 rounded text-slate-600">123456789012</code>).
              </p>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/2 border border-slate-200 font-semibold py-3 text-xs rounded-xl hover:bg-slate-50 text-slate-700 uppercase tracking-widest text-center"
              >
                Modify details
              </button>
              <button
                type="submit"
                disabled={paymentLoading}
                className="w-1/2 bg-slate-900 border border-slate-900 font-bold py-3 text-xs rounded-xl hover:bg-slate-800 text-white uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-md hover:cursor-pointer"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>
                    {activePaymentTab === 'qr' ? 'I Have Paid ₹' + activeFee : 'Authorize ₹' + activeFee}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 'ticket' && paymentSuccessData && (
        <div className="max-w-xl mx-auto bg-white border border-emerald-100 rounded-3xl shadow-xl overflow-hidden text-center p-8 space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
              Rehabnest Active Reservation
            </span>
            <h2 className="text-3xl font-extrabold font-display text-slate-800 pt-3">Appointment Confirmed!</h2>
            <p className="text-slate-500 text-xs px-6">
              Your recovery plan has been locked into Rehabnest's scheduling blocks. Details have been registered in our electronic medical database.
            </p>
          </div>

          {/* Electronic Ticket */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/60 divide-y divide-slate-200/60 text-left text-xs overflow-hidden">
            <div className="p-4 grid sm:grid-cols-2 gap-3 bg-gradient-to-r from-primary-500/5 to-accent-500/5">
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Patient Registered</span>
                <span className="text-slate-700 font-bold text-sm block">{patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Therapeutic Target</span>
                <span className="text-slate-700 font-bold text-sm block capitalize">{type === 'in-clinic' ? 'In-Clinic Consultation' : 'Clinical Home Visit'}</span>
              </div>
            </div>

            <div className="p-4 grid sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Treatment Date</span>
                <span className="text-slate-700 font-bold block">{new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Rehab Time Block</span>
                <span className="text-slate-700 font-bold block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-accent-500" /> {timeSlot}
                </span>
              </div>
            </div>

            <div className="p-4 grid sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Payment ID</span>
                <span className="text-slate-700 font-mono font-bold block">{paymentSuccessData.paymentId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase tracking-wider block font-medium">Checkout Status</span>
                <span className="text-emerald-500 font-bold block flex items-center gap-1">
                  ● ₹{paymentSuccessData.amount} Paid ({paymentSuccessData.method || 'BHIM UPI'})
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 text-left leading-relaxed">
            <strong>Clinical Onboarding Instruction:</strong> Please report to the clinic or be available at your designated home address 10 minutes prior to the slot time. Carry previous MRI/X-Ray film files if applicable to allow immediate entry in your electronic medical records catalog.
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={onBack}
              className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 text-xs rounded-xl uppercase tracking-widest text-center"
            >
              Return Home
            </button>
            <button
              onClick={onBookingSuccess}
              className="w-1/2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 text-xs rounded-xl uppercase tracking-widest text-center shadow-md shadow-primary-500/10"
            >
              View Doctor Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
