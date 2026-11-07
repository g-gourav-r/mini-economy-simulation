'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Building2,
  QrCode,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Coins,
  ChevronDown,
  User,
  ArrowLeft,
} from 'lucide-react';

export default function MobileBankPage() {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedQrId, setScannedQrId] = useState('');
  const [kidName, setKidName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [manualQrInput, setManualQrInput] = useState('');
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  const html5QrCodeRef = useRef(null);
  const nameInputRef = useRef(null);

  // Initialize Camera Scanner
  useEffect(() => {
    const scannerId = 'bank-mobile-qr-reader';
    const qrScanner = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = qrScanner;

    const startCamera = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setCameraError('No camera found. Use manual card simulator below.');
          return;
        }

        const config = {
          fps: 12,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await qrScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleQrCodeDetected(decodedText);
          },
          () => {
            // Frame search (silent)
          }
        );
        setScannerStarted(true);
        setCameraError(null);
      } catch (err) {
        console.warn('Bank camera start error:', err);
        setCameraError('Camera access unavailable. Use manual card simulator below.');
        setScannerStarted(false);
      }
    };

    startCamera();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e) => console.error('Error stopping scanner:', e));
      }
    };
  }, []);

  // When QR code is detected
  const handleQrCodeDetected = (code) => {
    const cleanedCode = code.trim();
    if (!cleanedCode) return;

    // Haptic feedback
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(80);
    }

    setScannedQrId(cleanedCode);
    setToast(null);

    // Pause camera
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        html5QrCodeRef.current.pause(true);
      } catch (e) {
        console.warn('Could not pause camera:', e);
      }
    }

    // Auto-focus kid name input
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 150);
  };

  // Resume camera for next card
  const resumeScanner = () => {
    setScannedQrId('');
    setKidName('');
    setToast(null);
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch (e) {
        console.warn('Could not resume camera:', e);
      }
    }
  };

  // Submit Registration form
  const handleRegisterCitizen = async (e) => {
    e.preventDefault();

    if (!scannedQrId) {
      setToast({ type: 'error', message: 'Scan or enter a QR Code first.' });
      return;
    }

    if (!kidName.trim()) {
      setToast({ type: 'error', message: "Please enter the kid's name." });
      return;
    }

    setIsLoading(true);
    setToast(null);

    try {
      const res = await fetch('/api/citizens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrId: scannedQrId.trim(),
          name: kidName.trim(),
          startingBalance: 1000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Haptic failure
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
          window.navigator.vibrate([150, 80, 150]);
        }
        setToast({
          type: 'error',
          message: data.error || 'Failed to register citizen.',
          citizen: data.citizen,
        });
        return;
      }

      // Haptic success
      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      setToast({
        type: 'success',
        message: `Registered ${data.citizen.name} with ₹1,000 starting grant!`,
        citizen: data.citizen,
      });

      setRecentRegistrations((prev) => [data.citizen, ...prev.slice(0, 9)]);

      // Auto-reset and resume scanner after 2.5s
      setTimeout(() => {
        resumeScanner();
      }, 2500);

    } catch (err) {
      console.error('Registration fetch error:', err);
      setToast({ type: 'error', message: 'Network error connecting to Bank server.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans select-none shadow-xl border-x border-gray-200 relative">
      
      {/* Mobile Top App Bar */}
      <header className="p-3 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-gray-700 hover:text-black font-extrabold text-sm flex items-center gap-1 shrink-0 p-1 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </Link>
          <div className="flex items-center gap-1.5 ml-1">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <h1 className="text-base font-black text-gray-900 tracking-tight">
              Bank Desk
            </h1>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 font-mono">
          <span>₹1,000 Grant</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto">

        {/* Mobile Toast Banner */}
        {toast && (
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 shadow-sm text-xs ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-gray-900">
                {toast.type === 'success' ? 'Activated' : 'Error'}
              </p>
              <p className="mt-0.5">{toast.message}</p>
              {toast.citizen && (
                <div className="mt-1.5 bg-white rounded-lg p-2 font-mono flex items-center justify-between text-xs border border-gray-200">
                  <span className="text-gray-800 font-bold">{toast.citizen.name}</span>
                  <span className="font-bold text-emerald-600">₹{toast.citizen.balance}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-700 p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* QR Scanner Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Card Scanner</span>
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                scannerStarted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {scannerStarted ? 'Active' : 'Offline'}
            </span>
          </div>

          {/* Camera Viewport */}
          <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center">
            <div id="bank-mobile-qr-reader" className="w-full h-full" />

            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/50 rounded-xl m-6 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {cameraError && (
              <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
                <CameraOff className="w-7 h-7 text-amber-400 mb-1" />
                <p className="text-xs">{cameraError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Citizen Activation Form */}
        <form onSubmit={handleRegisterCitizen} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          
          {/* Card Status Indicator */}
          <div>
            {scannedQrId ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span className="font-mono text-xs font-bold text-emerald-800">{scannedQrId}</span>
                </div>
                <button
                  type="button"
                  onClick={resumeScanner}
                  className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-200 font-bold shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  Rescan
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center">
                <p className="text-xs text-gray-500 font-mono">
                  Scan Debit Card QR...
                </p>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="mobile-kid-name"
                ref={nameInputRef}
                type="text"
                placeholder="Full Name"
                value={kidName}
                onChange={(e) => setKidName(e.target.value)}
                disabled={!scannedQrId || isLoading}
                className="w-full bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:bg-white font-semibold transition-colors"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={!scannedQrId || !kidName.trim() || isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm shadow-[0_4px_0_#059669] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Registering...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>Activate Card (+₹1,000)</span>
              </>
            )}
          </button>
        </form>

        {/* Manual Test Fallback */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Simulate Card ID"
            value={manualQrInput}
            onChange={(e) => setManualQrInput(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 font-mono shadow-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (manualQrInput.trim()) {
                handleQrCodeDetected(manualQrInput.trim());
                setManualQrInput('');
              }
            }}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Simulate
          </button>
        </div>

        {/* Expandable Recent Registrations */}
        {recentRegistrations.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
            <button
              type="button"
              onClick={() => setShowRecent(!showRecent)}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-700"
            >
              <span>Recent Cards ({recentRegistrations.length})</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showRecent ? 'rotate-180' : ''}`} />
            </button>

            {showRecent && (
              <div className="mt-2 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {recentRegistrations.map((citizen) => (
                  <div key={citizen.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{citizen.name}</p>
                      <p className="text-[10px] font-mono text-gray-500">{citizen.qr_id}</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-600">₹{citizen.balance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
