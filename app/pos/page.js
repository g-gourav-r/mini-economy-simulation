'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Tv,
  Globe,
  ShieldAlert,
  TrendingUp,
  Gamepad2,
  Building2,
  CheckCircle2,
  XCircle,
  CameraOff,
  User,
  ArrowLeft,
  RefreshCw,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  Flame,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const STATIONS = {
  Entertainment: {
    name: 'Entertainment Shop',
    tagline: 'Media & Streaming',
    icon: Tv,
    type: 'standard',
    actions: [
      { label: '-₹ 100', desc: 'Short Video / Reel', amount: -100, type: 'debit' },
      { label: '-₹ 200', desc: 'Full Song / Music Video', amount: -200, type: 'debit' },
      { label: '-₹ 300', desc: 'Gaming Stream Session', amount: -300, type: 'debit' },
      { label: '+₹ 100', desc: 'Music Trivia Win', amount: 100, type: 'credit' },
    ],
  },
  Travel: {
    name: 'Travel Arena',
    tagline: 'Virtual Tours & Exploration',
    icon: Globe,
    type: 'standard',
    actions: [
      { label: '-₹ 100', desc: 'City 3D Flyover', amount: -100, type: 'debit' },
      { label: '-₹ 200', desc: 'Safari & Wonders', amount: -200, type: 'debit' },
      { label: '-₹ 300', desc: 'Space / Ocean Dive', amount: -300, type: 'debit' },
      { label: '+₹ 100', desc: 'Capital Quiz Reward', amount: 100, type: 'credit' },
    ],
  },
  Scam: {
    name: 'Scam Alley',
    tagline: 'Risk & Probability Game',
    icon: ShieldAlert,
    type: 'scam',
    actions: [
      { label: 'Wager ₹ 100', desc: 'Double or Nothing', wager: 100, type: 'wager' },
      { label: 'Wager ₹ 200', desc: 'High Roller Wager', wager: 200, type: 'wager' },
      { label: '+₹ 100', desc: 'Report Scam Bounty', amount: 100, type: 'credit', span: true },
    ],
  },
  MF: {
    name: 'Mutual Funds',
    tagline: 'Investment & Liquidation',
    icon: TrendingUp,
    type: 'mutual_fund',
    actions: [],
  },
  Arcade: {
    name: 'Arcade Zone',
    tagline: 'Minigames & Tournaments',
    icon: Gamepad2,
    type: 'standard',
    actions: [
      { label: '-₹ 100', desc: '5-Min Solo Session', amount: -100, type: 'debit' },
      { label: '-₹ 200', desc: '1v1 Arena Match', amount: -200, type: 'debit' },
      { label: '+₹ 200', desc: 'High Score Bounty', amount: 200, type: 'credit', span: true },
    ],
  },
  Bank: {
    name: 'Central Bank',
    tagline: 'Insurance & Wages',
    icon: Building2,
    type: 'standard',
    actions: [
      { label: '-₹ 150', desc: 'Storm Insurance', amount: -150, type: 'debit' },
      { label: '+₹ 300', desc: 'Hourly Wages', amount: 300, type: 'credit' },
      { label: '-₹ 50', desc: 'Maintenance Fee', amount: -50, type: 'debit', span: true },
    ],
  },
};

export default function PosPage() {
  const [stationKey, setStationKey] = useState('Entertainment');
  const [citizen, setCitizen] = useState(null);
  const [citizenName, setCitizenName] = useState('Aarav Sharma');
  const [balance, setBalance] = useState(1000);
  const [mfInvested, setMfInvested] = useState(0);
  const [qrId, setQrId] = useState('CARD-101');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successOverlay, setSuccessOverlay] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const html5QrCodeRef = useRef(null);
  const beepAudioRef = useRef(null);
  const chaChingAudioRef = useRef(null);

  const activeStation = STATIONS[stationKey];
  const StationIcon = activeStation.icon;

  const playBeep = () => {
    if (beepAudioRef.current) {
      beepAudioRef.current.currentTime = 0;
      beepAudioRef.current.play().catch(() => {});
    }
  };

  const playChaChing = () => {
    if (chaChingAudioRef.current) {
      chaChingAudioRef.current.currentTime = 0;
      chaChingAudioRef.current.play().catch(() => {});
    }
  };

  // Start real HTML5 camera scanner
  useEffect(() => {
    const scannerId = 'pos-mobile-qr-reader';
    const qrScanner = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = qrScanner;

    const startCamera = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setCameraError('No camera found');
          return;
        }

        const config = {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        };

        await qrScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            handleCardScanned(decodedText);
          },
          () => {}
        );
        setScannerStarted(true);
        setCameraError(null);
      } catch (err) {
        console.warn('POS camera error:', err);
        setCameraError('Camera access unavailable');
        setScannerStarted(false);
      }
    };

    startCamera();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Fetch citizen details
  const fetchCitizenDetails = async (cleanId) => {
    try {
      const res = await fetch(`/api/citizens?qrId=${encodeURIComponent(cleanId)}`);
      const data = await res.json();
      if (data.success && data.citizen) {
        setCitizen(data.citizen);
        setCitizenName(data.citizen.name);
        setBalance(data.citizen.balance);
        setMfInvested(data.citizen.mf_invested_amount || 0);
        return data.citizen;
      } else {
        setCitizen(null);
        setCitizenName(`Card ${cleanId}`);
        setErrorMessage(`Unregistered Card: ${cleanId}. Register at Bank first.`);
        return null;
      }
    } catch (e) {
      setCitizen(null);
      setCitizenName(`Card ${cleanId}`);
      return null;
    }
  };

  // Card scanned callback
  const handleCardScanned = async (code) => {
    const cleaned = code.trim();
    if (!cleaned) return;

    playBeep();
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(60);
    }

    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        html5QrCodeRef.current.pause(true);
      } catch (e) {}
    }
    setIsPaused(true);
    setQrId(cleaned);
    setErrorMessage(null);

    await fetchCitizenDetails(cleaned);
  };

  const resumeScanner = () => {
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
        setIsPaused(false);
      } catch (e) {}
    }
  };

  // Generic Transaction Handler
  const executeTransaction = async (payload) => {
    setIsProcessing(true);
    setErrorMessage(null);

    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(40);
    }

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrId,
          station: stationKey,
          ...payload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Transaction failed');
        if (typeof window !== 'undefined' && window.navigator?.vibrate) {
          window.navigator.vibrate([150, 80, 150]);
        }
        return;
      }

      playChaChing();

      if (data.newBalance !== undefined) {
        setBalance(data.newBalance);
      }
      if (data.mfInvested !== undefined) {
        setMfInvested(data.mfInvested);
      }
      if (data.citizen) {
        setCitizen(data.citizen);
      }

      setSuccessOverlay({
        amount: data.amount ?? payload.amount ?? 0,
        citizenName: data.citizenName || citizenName,
        newBalance: data.newBalance ?? balance,
        mfInvested: data.mfInvested ?? mfInvested,
        message: data.message,
        scamResult: data.scamResult,
      });

      setTimeout(() => {
        setSuccessOverlay(null);
        resumeScanner();
      }, 2000);
    } catch (err) {
      setErrorMessage('Network error during transaction');
    } finally {
      setIsProcessing(false);
    }
  };

  // Standard debit/credit
  const handleStandardTransaction = (amount, description) => {
    if (balance + amount < 0) {
      setErrorMessage(`Insufficient funds. Citizen balance is ₹${balance}.`);
      return;
    }
    executeTransaction({
      amount,
      description: `${activeStation.name}: ${description}`,
    });
  };

  // Scam Alley Wager
  const handleScamWager = (wager) => {
    if (balance < wager) {
      setErrorMessage(`Cannot wager ₹${wager}. Balance is ₹${balance}.`);
      return;
    }
    executeTransaction({
      actionType: 'scam_wager',
      wager,
      description: `Scam Alley: Wagered ₹${wager}`,
    });
  };

  // Mutual Fund Invest
  const handleMfInvest = (amount) => {
    if (balance < amount) {
      setErrorMessage(`Insufficient liquid funds. Wallet balance is ₹${balance}.`);
      return;
    }
    executeTransaction({
      actionType: 'mf_invest',
      amount,
    });
  };

  // Mutual Fund Withdraw / Cash Out
  const handleMfWithdraw = (withdrawMode) => {
    if (mfInvested <= 0) {
      setErrorMessage('No mutual funds available to liquidate.');
      return;
    }
    executeTransaction({
      actionType: 'mf_withdraw',
      withdrawMode,
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col justify-between relative select-none shadow-sm border-x border-neutral-200">
      {/* Audio Engine */}
      <audio ref={beepAudioRef} src="/sounds/beep.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />

      {/* Success Takeover */}
      {successOverlay && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center animate-in zoom-in-95 duration-200 ${
            successOverlay.scamResult === 'bust'
              ? 'bg-neutral-900'
              : 'bg-neutral-900'
          }`}
        >
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
            {successOverlay.scamResult === 'bust' ? (
              <XCircle className="w-10 h-10 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            )}
          </div>

          <h1 className="text-4xl font-bold font-mono tracking-tight my-2">
            {successOverlay.scamResult === 'bust'
              ? `- ₹ ${Math.abs(successOverlay.amount)}`
              : successOverlay.amount < 0
              ? `- ₹ ${Math.abs(successOverlay.amount)}`
              : `+ ₹ ${successOverlay.amount}`}
          </h1>

          <p className="text-xl font-semibold text-neutral-100 mt-1">
            {successOverlay.citizenName}
          </p>

          {successOverlay.message && (
            <p className="text-xs text-neutral-300 mt-2 max-w-xs">
              {successOverlay.message}
            </p>
          )}

          <div className="mt-5 bg-white/10 rounded-xl p-4 border border-white/10 w-full max-w-xs text-left">
            <div className="flex justify-between items-center text-xs text-neutral-300 mb-1">
              <span>Liquid Wallet:</span>
              <span className="font-mono text-lg text-white font-bold">
                ₹ {successOverlay.newBalance}
              </span>
            </div>
            {successOverlay.mfInvested > 0 && (
              <div className="flex justify-between items-center text-xs text-neutral-300 pt-1 border-t border-white/10">
                <span>Mutual Funds:</span>
                <span className="font-mono text-sm text-neutral-100 font-bold">
                  ₹ {successOverlay.mfInvested}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header: Back & Station Switcher */}
      <header className="p-3 bg-white border-b border-neutral-200 sticky top-0 z-20 flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild className="p-2 h-8">
          <Link href="/" className="flex items-center gap-1 text-xs font-semibold">
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </Link>
        </Button>

        <div className="relative flex-1 max-w-[220px]">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-neutral-600">
            <StationIcon className="w-4 h-4" />
          </div>
          <select
            value={stationKey}
            onChange={(e) => setStationKey(e.target.value)}
            className="w-full bg-neutral-100 border border-neutral-300 text-neutral-900 font-semibold text-xs rounded-md pl-8 pr-6 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
          >
            {Object.keys(STATIONS).map((key) => (
              <option key={key} value={key} className="bg-white text-neutral-900">
                {STATIONS[key].name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-neutral-400 text-[10px]">
            ▼
          </div>
        </div>

        {isPaused ? (
          <Button
            size="sm"
            variant="outline"
            onClick={resumeScanner}
            className="h-8 px-2.5 text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Next
          </Button>
        ) : (
          <Badge variant="outline" className="text-[10px] font-medium">
            Scanning
          </Badge>
        )}
      </header>

      {/* Main Viewport */}
      <main className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800 p-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Proper Live Camera QR Scanner Viewport */}
        <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-300 flex items-center justify-center">
          <div id="pos-mobile-qr-reader" className="w-full h-full" />

          {/* Reticle Guide */}
          {!isPaused && (
            <div className="absolute inset-0 pointer-events-none border border-neutral-400/50 rounded-lg m-8 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && (
            <div
              onClick={resumeScanner}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center cursor-pointer z-10"
            >
              <Button size="sm" variant="secondary" className="shadow-md">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Tap to Scan Next Card
              </Button>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
              <CameraOff className="w-7 h-7 text-neutral-400 mb-1" />
              <p className="text-xs text-neutral-400">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Scanned Citizen Display */}
        <Card className="border-neutral-200">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 leading-tight">
                    {citizenName}
                  </h2>
                  <span className="text-[11px] font-mono text-neutral-500">
                    {qrId}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-semibold text-neutral-400 block leading-none">
                  Balance
                </span>
                <span className="text-2xl font-bold font-mono tracking-tight text-neutral-900">
                  ₹{balance}
                </span>
              </div>
            </div>

            {/* Mutual Fund Dual Balance Row (if MF station or has investment) */}
            {(stationKey === 'MF' || mfInvested > 0) && (
              <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-600 flex items-center gap-1 font-medium">
                  <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
                  Invested in Mutual Funds:
                </span>
                <span className="font-mono font-bold text-neutral-900 text-xs">
                  ₹ {mfInvested}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Controls by Station Type */}

        {/* 1. SCAM ALLEY: Double or Nothing Wagers */}
        {activeStation.type === 'scam' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => handleScamWager(100)}
                className="h-auto py-3 flex flex-col items-center justify-center border-neutral-300"
              >
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-neutral-700" />
                  <span className="text-base font-bold font-mono">Wager ₹100</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  Double or Nothing
                </span>
              </Button>

              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => handleScamWager(200)}
                className="h-auto py-3 flex flex-col items-center justify-center border-neutral-300"
              >
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-neutral-700" />
                  <span className="text-base font-bold font-mono">Wager ₹200</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  High Risk Wager
                </span>
              </Button>
            </div>

            <Button
              variant="secondary"
              disabled={isProcessing}
              onClick={() => handleStandardTransaction(100, 'Report Scam Bounty')}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <Coins className="w-3.5 h-3.5 text-neutral-600" />
              <span>+₹ 100 Report Scam Bounty</span>
            </Button>
          </div>
        )}

        {/* 2. MUTUAL FUNDS: Deposit & Retrieval (Cash Out) */}
        {activeStation.type === 'mutual_fund' && (
          <div className="space-y-2">
            {/* Deposit Row */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => handleMfInvest(200)}
                className="h-auto py-3 flex flex-col items-center justify-center"
              >
                <div className="flex items-center gap-1">
                  <ArrowDownToLine className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-base font-bold font-mono">Invest ₹200</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  Buy Fund Units
                </span>
              </Button>

              <Button
                variant="outline"
                disabled={isProcessing}
                onClick={() => handleMfInvest(500)}
                className="h-auto py-3 flex flex-col items-center justify-center"
              >
                <div className="flex items-center gap-1">
                  <ArrowDownToLine className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-base font-bold font-mono">Invest ₹500</span>
                </div>
                <span className="text-[10px] text-neutral-500 mt-0.5">
                  Large Investment
                </span>
              </Button>
            </div>

            {/* Retrieval / Cash Out Row */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                disabled={isProcessing || mfInvested <= 0}
                onClick={() => handleMfWithdraw('half')}
                className="h-auto py-2.5 flex flex-col items-center justify-center"
              >
                <div className="flex items-center gap-1">
                  <ArrowUpFromLine className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-xs font-bold">Liquidate 50%</span>
                </div>
                <span className="text-[10px] text-neutral-500">Withdraw Half</span>
              </Button>

              <Button
                variant="secondary"
                disabled={isProcessing || mfInvested <= 0}
                onClick={() => handleMfWithdraw('all')}
                className="h-auto py-2.5 flex flex-col items-center justify-center"
              >
                <div className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="text-xs font-bold">Liquidate All</span>
                </div>
                <span className="text-[10px] text-neutral-500">100% Cash Out</span>
              </Button>
            </div>
          </div>
        )}

        {/* 3. STANDARD STATIONS: Clean Buttons */}
        {activeStation.type === 'standard' && (
          <div className="grid grid-cols-2 gap-2">
            {activeStation.actions.map((act, idx) => {
              const isDebit = act.type === 'debit';
              return (
                <Button
                  key={idx}
                  variant={isDebit ? 'outline' : 'secondary'}
                  disabled={isProcessing}
                  onClick={() => handleStandardTransaction(act.amount, act.desc)}
                  className={`h-auto py-3 flex flex-col items-center justify-center ${
                    act.span ? 'col-span-2' : ''
                  }`}
                >
                  <span className="text-xl font-bold font-mono tracking-tight leading-tight">
                    {act.label}
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 font-normal">
                    {act.desc}
                  </span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Manual Test Fallback */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="text"
            placeholder="Simulate Card ID"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="h-8 font-mono text-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (manualInput.trim()) {
                handleCardScanned(manualInput.trim());
                setManualInput('');
              }
            }}
            className="h-8 text-xs"
          >
            Simulate
          </Button>
        </div>
      </main>
    </div>
  );
}
