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
  QrCode,
  CheckCircle2,
  XCircle,
  CameraOff,
  User,
  ArrowLeft,
  RefreshCw,
  Coins,
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  Flame,
} from 'lucide-react';

const STATIONS = {
  Entertainment: {
    name: 'Entertainment Shop',
    tagline: 'YouTube on Laptop',
    icon: Tv,
    theme: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    type: 'standard',
    actions: [
      { label: '-₹ 100', desc: 'Short Video / Reel', amount: -100, type: 'debit' },
      { label: '-₹ 200', desc: 'Full Song / Music Video', amount: -200, type: 'debit' },
      { label: '-₹ 300', desc: 'VIP Gaming Stream', amount: -300, type: 'debit' },
      { label: '+₹ 100', desc: 'Music Trivia Win', amount: 100, type: 'credit' },
    ],
  },
  Travel: {
    name: 'Travel Arena',
    tagline: '3D Google Earth / 4K Tours',
    icon: Globe,
    theme: 'sky',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
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
    tagline: 'Double or Nothing Trap',
    icon: ShieldAlert,
    theme: 'red',
    badgeClass: 'bg-red-50 text-red-700 border-red-200',
    type: 'scam',
    actions: [
      { label: 'Wager ₹ 100', desc: 'Double or Nothing', wager: 100, type: 'wager' },
      { label: 'Wager ₹ 200', desc: 'High Roller Wager', wager: 200, type: 'wager' },
      { label: '+₹ 100', desc: 'Report Scam Bounty', amount: 100, type: 'credit', span: true },
    ],
  },
  MF: {
    name: 'Mutual Funds',
    tagline: 'Invest & Liquidate',
    icon: TrendingUp,
    theme: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    type: 'mutual_fund',
    actions: [],
  },
  Arcade: {
    name: 'Arcade Zone',
    tagline: 'Browser Minigames',
    icon: Gamepad2,
    theme: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    type: 'standard',
    actions: [
      { label: '-₹ 100', desc: '5-Min Solo Session', amount: -100, type: 'debit' },
      { label: '-₹ 200', desc: '1v1 Arena Battle', amount: -200, type: 'debit' },
      { label: '+₹ 200', desc: 'Beat High Score Prize', amount: 200, type: 'credit', span: true },
    ],
  },
  Bank: {
    name: 'Central Bank',
    tagline: 'Insurance & Wages',
    icon: Building2,
    theme: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

  // Fetch full citizen details
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
      setErrorMessage(`Insufficient funds! Citizen has only ₹${balance}.`);
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
      setErrorMessage(`Cannot wager ₹${wager}! Balance is only ₹${balance}.`);
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
      setErrorMessage(`Insufficient liquid cash! Wallet only has ₹${balance}.`);
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
      setErrorMessage('No mutual funds available to cash out!');
      return;
    }
    executeTransaction({
      actionType: 'mf_withdraw',
      withdrawMode,
    });
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col justify-between relative select-none shadow-xl border-x border-gray-200">
      {/* Audio Engine */}
      <audio ref={beepAudioRef} src="/sounds/beep.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />

      {/* Success Takeover */}
      {successOverlay && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white text-center animate-in zoom-in-95 duration-200 ${
            successOverlay.scamResult === 'bust'
              ? 'bg-rose-600'
              : 'bg-emerald-600'
          }`}
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
            {successOverlay.scamResult === 'bust' ? (
              <XCircle className="w-12 h-12 text-white" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-5xl font-black font-mono tracking-tight my-2">
            {successOverlay.scamResult === 'bust'
              ? `- ₹ ${Math.abs(successOverlay.amount)}`
              : successOverlay.amount < 0
              ? `- ₹ ${Math.abs(successOverlay.amount)}`
              : `+ ₹ ${successOverlay.amount}`}
          </h1>

          <p className="text-2xl font-black text-white/95 mt-1">
            {successOverlay.citizenName}
          </p>

          {successOverlay.message && (
            <p className="text-sm font-bold text-white/90 mt-2 max-w-xs">
              {successOverlay.message}
            </p>
          )}

          <div className="mt-5 bg-black/20 rounded-2xl p-4 border border-white/20 w-full max-w-xs shadow-xl">
            <div className="flex justify-between items-center text-left text-xs uppercase font-extrabold tracking-wider text-white/80 mb-1">
              <span>Liquid Wallet:</span>
              <span className="font-mono text-xl text-white font-black">
                ₹ {successOverlay.newBalance}
              </span>
            </div>
            {successOverlay.mfInvested > 0 && (
              <div className="flex justify-between items-center text-left text-xs uppercase font-extrabold tracking-wider text-white/80 pt-1 border-t border-white/10">
                <span>Invested MF:</span>
                <span className="font-mono text-base text-yellow-300 font-black">
                  ₹ {successOverlay.mfInvested}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header: Back & Station Switcher */}
      <header className="p-3 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm flex items-center justify-between gap-2">
        <Link
          href="/"
          className="text-gray-700 hover:text-black font-extrabold text-sm flex items-center gap-1 shrink-0 p-1 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Hub</span>
        </Link>

        <div className="relative flex-1 max-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-700">
            <StationIcon className="w-4 h-4" />
          </div>
          <select
            value={stationKey}
            onChange={(e) => setStationKey(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 font-extrabold text-xs rounded-xl pl-8 pr-6 py-2 appearance-none focus:outline-none focus:border-blue-500 focus:bg-white cursor-pointer shadow-xs"
          >
            {Object.keys(STATIONS).map((key) => (
              <option key={key} value={key} className="bg-white text-gray-900">
                {STATIONS[key].name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-gray-400 text-[10px]">
            ▼
          </div>
        </div>

        {isPaused ? (
          <button
            type="button"
            onClick={resumeScanner}
            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Next</span>
          </button>
        ) : (
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
            Scanning
          </span>
        )}
      </header>

      {/* Main Viewport */}
      <main className="p-3 flex-1 flex flex-col gap-2.5 overflow-y-auto">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-800 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Proper Live Camera QR Scanner Viewport */}
        <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden border border-gray-300 shadow-inner flex items-center justify-center">
          <div id="pos-mobile-qr-reader" className="w-full h-full" />

          {/* Reticle Guide */}
          {!isPaused && (
            <div className="absolute inset-0 pointer-events-none border-2 border-emerald-400/60 rounded-2xl m-6 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}

          {/* Paused Overlay */}
          {isPaused && (
            <div
              onClick={resumeScanner}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center cursor-pointer z-10"
            >
              <div className="px-4 py-2 bg-white text-gray-900 font-black text-sm rounded-xl shadow-lg flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Tap to Scan Next Card</span>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
              <CameraOff className="w-8 h-8 text-amber-400 mb-2" />
              <p className="text-xs">{cameraError}</p>
            </div>
          )}
        </div>

        {/* Scanned Citizen Display */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 leading-tight">
                  {citizenName}
                </h2>
                <span className="text-xs font-mono text-gray-500 font-bold">
                  {qrId}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-extrabold text-gray-400 block leading-none">
                Wallet
              </span>
              <span className="text-3xl font-black font-mono tracking-tight text-gray-900">
                ₹{balance}
              </span>
            </div>
          </div>

          {/* Mutual Fund Dual Balance Row (if MF station or has investment) */}
          {(stationKey === 'MF' || mfInvested > 0) && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Invested in Mutual Funds:
              </span>
              <span className="font-mono font-black text-amber-600 text-sm">
                ₹ {mfInvested}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls by Station Type */}

        {/* 1. SCAM ALLEY: Double or Nothing Wagers */}
        {activeStation.type === 'scam' && (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleScamWager(100)}
                className="min-h-[76px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-3 bg-red-600 hover:bg-red-700 text-white shadow-[0_4px_0_#b91c1c] border border-red-700"
              >
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-yellow-300" />
                  <span className="text-xl font-black font-mono tracking-tight">
                    Wager ₹100
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-100 mt-1">
                  Double or Nothing
                </span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleScamWager(200)}
                className="min-h-[76px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-3 bg-rose-700 hover:bg-rose-800 text-white shadow-[0_4px_0_#881337] border border-rose-800"
              >
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xl font-black font-mono tracking-tight">
                    Wager ₹200
                  </span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-100 mt-1">
                  High Roller
                </span>
              </button>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleStandardTransaction(100, 'Report Scam Bounty')}
              className="w-full min-h-[52px] rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_#059669] border border-emerald-600 font-bold"
            >
              <Coins className="w-4 h-4" />
              <span className="text-sm font-black">+₹ 100 Report Scam Bounty</span>
            </button>
          </div>
        )}

        {/* 2. MUTUAL FUNDS: Deposit & Retrieval (Cash Out) */}
        {activeStation.type === 'mutual_fund' && (
          <div className="space-y-3">
            {/* Deposit Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleMfInvest(200)}
                className="min-h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-2 bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_0_#1d4ed8] border border-blue-700"
              >
                <div className="flex items-center gap-1">
                  <ArrowDownToLine className="w-4 h-4 text-blue-200" />
                  <span className="text-xl font-black font-mono tracking-tight">
                    Invest ₹200
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                  -Wallet +MF Units
                </span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleMfInvest(500)}
                className="min-h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_4px_0_#4338ca] border border-indigo-700"
              >
                <div className="flex items-center gap-1">
                  <ArrowDownToLine className="w-4 h-4 text-indigo-200" />
                  <span className="text-xl font-black font-mono tracking-tight">
                    Invest ₹500
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                  Large Deposit
                </span>
              </button>
            </div>

            {/* Retrieval / Cash Out Row */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isProcessing || mfInvested <= 0}
                onClick={() => handleMfWithdraw('half')}
                className="min-h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_4px_0_#047857] border border-emerald-700"
              >
                <div className="flex items-center gap-1">
                  <ArrowUpFromLine className="w-4 h-4 text-emerald-200" />
                  <span className="text-lg font-black tracking-tight">
                    Cash Out 50%
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                  Liquidate Half
                </span>
              </button>

              <button
                type="button"
                disabled={isProcessing || mfInvested <= 0}
                onClick={() => handleMfWithdraw('all')}
                className="min-h-[64px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed text-white shadow-[0_4px_0_#d97706] border border-amber-600"
              >
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-100" />
                  <span className="text-lg font-black tracking-tight">
                    Cash Out ALL
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
                  100% Liquidation
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 3. STANDARD STATIONS: 3D Tactile Buttons */}
        {activeStation.type === 'standard' && (
          <div className="grid grid-cols-2 gap-2.5">
            {activeStation.actions.map((act, idx) => {
              const isDebit = act.type === 'debit';
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStandardTransaction(act.amount, act.desc)}
                  className={`min-h-[68px] rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer select-none active:translate-y-1 active:shadow-none p-2 ${
                    act.span ? 'col-span-2' : ''
                  } ${
                    isDebit
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_4px_0_#dc2626] border border-red-600'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_4px_0_#059669] border border-emerald-600'
                  }`}
                >
                  <span className="text-2xl font-black font-mono tracking-tight leading-tight">
                    {act.label}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90 mt-0.5">
                    {act.desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Manual Test Fallback */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="Simulate Card ID"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (manualInput.trim()) {
                handleCardScanned(manualInput.trim());
                setManualInput('');
              }
            }}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl shadow-xs cursor-pointer active:scale-95"
          >
            Simulate
          </button>
        </div>
      </main>
    </div>
  );
}
