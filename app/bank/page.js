'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Building2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  User,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          () => {}
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
      setToast({ type: 'error', message: "Please enter the citizen's name." });
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

      if (typeof window !== 'undefined' && window.navigator?.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      setToast({
        type: 'success',
        message: `Registered ${data.citizen.name} with ₹1,000 starting balance.`,
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
    <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans select-none shadow-sm border-x border-neutral-200 relative">
      
      {/* Mobile Top App Bar */}
      <header className="p-3 bg-white border-b border-neutral-200 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="p-2 h-8">
            <Link href="/" className="flex items-center gap-1 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" />
              <span>Hub</span>
            </Link>
          </Button>
          <div className="flex items-center gap-1.5 ml-1">
            <Building2 className="w-4 h-4 text-neutral-700" />
            <h1 className="text-sm font-bold text-neutral-900 tracking-tight">
              Bank Desk
            </h1>
          </div>
        </div>

        <Badge variant="secondary" className="font-mono text-xs font-semibold">
          ₹1,000 Grant
        </Badge>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto">

        {/* Notification Banner */}
        {toast && (
          <Alert
            variant={toast.type === 'error' ? 'destructive' : 'default'}
            className="flex items-start justify-between"
          >
            <div className="flex items-start gap-2">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <AlertDescription className="text-xs font-medium">
                <p className="font-bold text-neutral-900 mb-0.5">
                  {toast.type === 'success' ? 'Activated' : 'Notice'}
                </p>
                <p>{toast.message}</p>
                {toast.citizen && (
                  <div className="mt-1.5 bg-white rounded p-1.5 font-mono flex items-center justify-between text-xs border border-neutral-200">
                    <span className="font-semibold text-neutral-800">{toast.citizen.name}</span>
                    <span className="font-bold text-emerald-600">₹{toast.citizen.balance}</span>
                  </div>
                )}
              </AlertDescription>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-neutral-400 hover:text-neutral-700 p-1 text-xs"
            >
              ✕
            </button>
          </Alert>
        )}

        {/* QR Scanner Card */}
        <Card>
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-neutral-600" />
              <span>Card Scanner</span>
            </span>
            <Badge variant="outline" className="text-[10px] font-medium">
              {scannerStarted ? 'Camera Active' : 'Camera Inactive'}
            </Badge>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {/* Camera Viewport */}
            <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-lg overflow-hidden border border-neutral-200 flex items-center justify-center">
              <div id="bank-mobile-qr-reader" className="w-full h-full" />

              <div className="absolute inset-0 pointer-events-none border border-neutral-400/50 rounded-lg m-8 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              {cameraError && (
                <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
                  <CameraOff className="w-6 h-6 text-neutral-400 mb-1" />
                  <p className="text-xs text-neutral-400">{cameraError}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Citizen Activation Form */}
        <Card>
          <CardContent className="p-3.5">
            <form onSubmit={handleRegisterCitizen} className="flex flex-col gap-3">
              {/* Card Status Indicator */}
              <div>
                {scannedQrId ? (
                  <div className="flex items-center justify-between p-2.5 bg-neutral-100 border border-neutral-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-neutral-700" />
                      <span className="font-mono text-xs font-bold text-neutral-900">{scannedQrId}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resumeScanner}
                      className="h-7 px-2 text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Rescan
                    </Button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-neutral-50 border border-dashed border-neutral-300 rounded-lg text-center">
                    <p className="text-xs text-neutral-500 font-mono">
                      Scan Debit Card QR...
                    </p>
                  </div>
                )}
              </div>

              {/* Name Field */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="mobile-kid-name"
                    ref={nameInputRef}
                    type="text"
                    placeholder="Citizen Full Name"
                    value={kidName}
                    onChange={(e) => setKidName(e.target.value)}
                    disabled={!scannedQrId || isLoading}
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <Button
                type="submit"
                disabled={!scannedQrId || !kidName.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activate Card (+₹1,000)</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Manual Test Fallback */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Simulate Card ID"
            value={manualQrInput}
            onChange={(e) => setManualQrInput(e.target.value)}
            className="h-8 font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (manualQrInput.trim()) {
                handleQrCodeDetected(manualQrInput.trim());
                setManualQrInput('');
              }
            }}
            className="h-8 text-xs"
          >
            Simulate
          </Button>
        </div>

        {/* Expandable Recent Registrations */}
        {recentRegistrations.length > 0 && (
          <Card>
            <CardContent className="p-3">
              <button
                type="button"
                onClick={() => setShowRecent(!showRecent)}
                className="w-full flex items-center justify-between text-xs font-medium text-neutral-700"
              >
                <span>Recent Activations ({recentRegistrations.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRecent ? 'rotate-180' : ''}`} />
              </button>

              {showRecent && (
                <div className="mt-2.5 divide-y divide-neutral-100 max-h-48 overflow-y-auto">
                  {recentRegistrations.map((citizen) => (
                    <div key={citizen.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-neutral-900">{citizen.name}</p>
                        <p className="text-[10px] font-mono text-neutral-400">{citizen.qr_id}</p>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">₹{citizen.balance}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}
