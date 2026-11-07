'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Tv,
  Globe,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Coins,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  Flame,
  CloudLightning,
  Sun,
  Building2,
  Gamepad2,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Award,
  Zap,
} from 'lucide-react';

const TABS = [
  { id: 'card', label: '1. Debit Card QR', icon: QrCode },
  { id: 'rewards', label: '2. Experiential Rewards', icon: Tv },
  { id: 'mf', label: '3. Mutual Funds & Bubble', icon: TrendingUp },
  { id: 'disaster', label: '4. Storms & Insurance', icon: ShieldCheck },
  { id: 'scam', label: '5. Scam Alley Trap', icon: ShieldAlert },
  { id: 'quiz', label: '6. Readiness Quiz', icon: Award },
];

export default function InstructionsPage() {
  const [activeTab, setActiveTab] = useState('card');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio refs
  const beepAudioRef = useRef(null);
  const chaChingAudioRef = useRef(null);

  const playBeep = () => {
    if (soundEnabled && beepAudioRef.current) {
      beepAudioRef.current.currentTime = 0;
      beepAudioRef.current.play().catch(() => {});
    }
  };

  const playChaChing = () => {
    if (soundEnabled && chaChingAudioRef.current) {
      chaChingAudioRef.current.currentTime = 0;
      chaChingAudioRef.current.play().catch(() => {});
    }
  };

  // =========================================================================
  // INTERACTIVE SIMULATOR STATES
  // =========================================================================

  // Tab 1: Card Simulator
  const [cardSimBalance, setCardSimBalance] = useState(1000);
  const [cardSimScanned, setCardSimScanned] = useState(false);

  // Tab 2: Experiential Rewards Simulator
  const [rewardWallet, setRewardWallet] = useState(1000);
  const [activeReward, setActiveReward] = useState(null);

  // Tab 3: Mutual Fund Simulator
  const [simLiquidWallet, setSimLiquidWallet] = useState(700);
  const [simMfAmount, setSimMfAmount] = useState(300);
  const [simMarketDelta, setSimMarketDelta] = useState(0);
  const [simHistory, setSimHistory] = useState(['Invested ₹300 into Mutual Funds.']);

  // Tab 4: Disaster Simulator
  const [hasInsurance, setHasInsurance] = useState(false);
  const [disasterWallet, setDisasterWallet] = useState(1000);
  const [disasterOutcome, setDisasterOutcome] = useState(null);

  // Tab 5: Scam Alley Simulator
  const [scamWagersCount, setScamWagersCount] = useState(0);
  const [scamSimWallet, setScamSimWallet] = useState(1000);
  const [scamMessage, setScamMessage] = useState(null);

  // Tab 6: Readiness Quiz State
  const [quizAnswers, setQuizAnswers] = useState({ q1: null, q2: null, q3: null });
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const currentIndex = TABS.findIndex((t) => t.id === activeTab);
      if (e.key === 'ArrowRight' && currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Fullscreen helper
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Quiz submission
  const handleQuizSubmit = () => {
    const isCorrect =
      quizAnswers.q1 === '1000' &&
      quizAnswers.q2 === 'fine150' &&
      quizAnswers.q3 === 'busted';

    setQuizSubmitted(true);
    setQuizPassed(isCorrect);
    if (isCorrect) {
      playChaChing();
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.12] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Audio Engine */}
      <audio ref={beepAudioRef} src="/sounds/beep.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />

      {/* Top Header */}
      <header className="px-6 md:px-12 py-4 border-b border-cyan-900/40 bg-[#0a0f1d]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-mono font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <span>SIM-CITY // PRE-GAME BRIEFING</span>
            </h1>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              INTERACTIVE RULES & TACTICAL PROTOCOLS FOR CITIZENS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
          </button>

          <Link
            href="/projector"
            target="_blank"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            <span>Launch Projector</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="px-6 md:px-12 py-3 border-b border-cyan-900/30 bg-[#0a0f1d]/60 backdrop-blur-sm z-20 flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center z-10">
        <AnimatePresence mode="wait">
          {/* ===================================================================
              SLIDE 1: YOUR DEBIT CARD & ₹1,000 STARTING CAPITAL
              =================================================================== */}
          {activeTab === 'card' && (
            <motion.div
              key="slide-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
                  RULE #1: CITIZEN REGISTRATION & CAPITAL
                </span>
                <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white">
                  Your Debit Card holds <span className="text-emerald-400">₹1,000</span> Starting Capital!
                </h2>
                <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                  Every citizen is issued a physical card printed with a unique QR code.
                  This is your <strong className="text-white">personal digital bank card</strong>.
                  Volunteers at experiential stations will scan your card using smartphone cameras.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Keep it safe:</strong> No cash is used in Sim-City. Your QR card is your entire wallet.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Instant Audio Feedback:</strong> Station scanners emit a sharp beep and confirmation cha-ching!</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Goal:</strong> Grow your net worth and budget wisely across 50 dynamic minutes!</span>
                  </div>
                </div>
              </div>

              {/* Interactive Card Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-2xl p-6 bg-gradient-to-br from-[#0c1a30] via-[#091322] to-[#040812] border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.15)] relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
                    <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider">
                      SIM-CITY DEBIT CARD
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <div className="my-6 text-center">
                    <div className="w-28 h-28 mx-auto bg-white p-2 rounded-xl shadow-lg flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 mt-2 block">
                      CARD-101 // AARAV SHARMA
                    </span>
                  </div>

                  <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400">Wallet Balance:</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">
                      ₹{cardSimBalance}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      playBeep();
                      setCardSimScanned(true);
                      setTimeout(() => {
                        playChaChing();
                        setCardSimBalance((prev) => (prev > 200 ? prev - 100 : 1000));
                        setCardSimScanned(false);
                      }, 700);
                    }}
                    className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>{cardSimScanned ? 'Scanner Reading...' : 'Simulate Card Scan (-₹100)'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 2: EXPERIENTIAL REWARDS (SPEND & ENJOY)
              =================================================================== */}
          {activeTab === 'rewards' && (
            <motion.div
              key="slide-rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="max-w-3xl">
                <span className="px-3 py-1 rounded bg-rose-950 border border-rose-500/40 text-rose-400 font-mono text-xs font-bold uppercase tracking-widest">
                  RULE #2: EXPERIENTIAL REWARDS
                </span>
                <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white mt-2">
                  No physical goods. Spend money on <span className="text-rose-400">Real Laptop Experiences</span>!
                </h2>
                <p className="text-base text-slate-300 mt-2">
                  Station volunteers have laptops ready to fulfill your digital requests. Tap each station below to preview its pricing and try the interactive checkout:
                </p>
              </div>

              {/* Station Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Entertainment */}
                <div
                  onClick={() => {
                    setActiveReward('Entertainment');
                    if (rewardWallet >= 200) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 200);
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Entertainment'
                      ? 'bg-rose-950/50 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                      : 'bg-[#0c1322] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                    <Tv className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-mono font-black text-white">Entertainment Shop</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Request any YouTube song or video to play live on the station laptop!
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono text-rose-400 font-bold">
                    -₹100 Short Reel • -₹200 Full Song
                  </div>
                </div>

                {/* Travel */}
                <div
                  onClick={() => {
                    setActiveReward('Travel');
                    if (rewardWallet >= 100) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 100);
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Travel'
                      ? 'bg-sky-950/50 border-sky-500 shadow-[0_0_25px_rgba(14,165,233,0.25)]'
                      : 'bg-[#0c1322] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-mono font-black text-white">Travel Arena</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Pick any country, landmark, or city for a high-definition 3D Google Earth tour!
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono text-sky-400 font-bold">
                    -₹100 City Flyover • -₹200 Safari
                  </div>
                </div>

                {/* Arcade */}
                <div
                  onClick={() => {
                    setActiveReward('Arcade');
                    if (rewardWallet >= 100) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 100);
                    }
                  }}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Arcade'
                      ? 'bg-purple-950/50 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
                      : 'bg-[#0c1322] border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-mono font-black text-white">Arcade Zone</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Jump into 5-minute laptop browser minigames and 1v1 multiplayer arena battles!
                  </p>
                  <div className="mt-3 pt-3 border-t border-white/10 text-xs font-mono text-purple-400 font-bold">
                    -₹100 Solo Game • +₹200 High Score
                  </div>
                </div>
              </div>

              {/* Wallet Feedback Strip */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-[#0c1a30] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300">
                  {activeReward
                    ? `Simulated Purchase at ${activeReward}! Tap again or try another station.`
                    : 'Tap any station above to test spending on experiential rewards.'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400 uppercase">Simulated Wallet:</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">
                    ₹{rewardWallet}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRewardWallet(1000);
                      setActiveReward(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Reset Wallet"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 3: MUTUAL FUNDS & 5-MIN BUBBLE CYCLE
              =================================================================== */}
          {activeTab === 'mf' && (
            <motion.div
              key="slide-mf"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded bg-amber-950 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest">
                  RULE #3: INVESTMENTS & LIQUIDATION
                </span>
                <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white">
                  Invest in Mutual Funds — but <span className="text-amber-400">Cash Out</span> before the Crash!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  Deposit your cash into Mutual Funds at the MF station. When the market surges (+10%, +20%), your fund units grow in value!
                </p>

                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 text-amber-200 text-sm font-semibold space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Flame className="w-4 h-4" />
                    <span>THE 5-MINUTE BUBBLE CYCLE:</span>
                  </div>
                  <p className="text-xs text-amber-100">
                    When the Game Master launches a 5-Minute Bubble (+25%), the Projector starts a 5:00 countdown. You MUST visit the MF station to <strong className="text-white">Cash Out (Liquidate)</strong> your units before the timer hits 00:00! If you wait too long, it bursts with a -30% crash!
                  </p>
                </div>
              </div>

              {/* Interactive Mutual Fund Simulator */}
              <div className="lg:col-span-5 bg-[#0c1626] border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
                  <span className="font-bold text-amber-400">MF INVESTMENT SIMULATOR</span>
                  <span className="text-slate-400">RATE: {simMarketDelta > 0 ? `+${simMarketDelta}%` : `${simMarketDelta}%`}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Liquid Cash</span>
                    <span className="text-2xl font-mono font-black text-emerald-400">₹{simLiquidWallet}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">MF Units</span>
                    <span className="text-2xl font-mono font-black text-amber-400">₹{simMfAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      playChaChing();
                      setSimMarketDelta(25);
                      setSimMfAmount((prev) => Math.round(prev * 1.25));
                      setSimHistory((prev) => ['🚀 +25% Bubble Surge! Units grew!', ...prev.slice(0, 2)]);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    1. Trigger +25% Bubble Rally
                  </button>

                  <button
                    type="button"
                    disabled={simMfAmount <= 0}
                    onClick={() => {
                      playChaChing();
                      setSimLiquidWallet((prev) => prev + simMfAmount);
                      setSimHistory((prev) => [`💸 Cashed out ₹${simMfAmount} to wallet! Safe from crash!`, ...prev.slice(0, 2)]);
                      setSimMfAmount(0);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black rounded-xl text-xs font-mono transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    2. Cash Out 100% (Smart Investor)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playBeep();
                      setSimMarketDelta(-30);
                      setSimMfAmount((prev) => Math.round(prev * 0.7));
                      setSimHistory((prev) => ['💥 -30% Bubble Burst! Held units lost value!', ...prev.slice(0, 2)]);
                    }}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-mono font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                  >
                    3. Trigger -30% Bubble Crash
                  </button>
                </div>

                <div className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-slate-300 divide-y divide-white/10">
                  {simHistory.map((h, i) => (
                    <p key={i} className="py-1">{h}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 4: STORMS & INSURANCE
              =================================================================== */}
          {activeTab === 'disaster' && (
            <motion.div
              key="slide-disaster"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded bg-red-950 border border-red-500/40 text-red-400 font-mono text-xs font-bold uppercase tracking-widest">
                  RULE #4: RISK MANAGEMENT & DISASTERS
                </span>
                <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white">
                  Severe Storms cause <span className="text-rose-400">₹150 Fine</span> — unless Insured!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  The Game Master can trigger a disaster calamity at any point during the event.
                  When thunder cracks and the projector turns red:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/30">
                    <span className="text-xs font-mono font-bold text-red-400 uppercase block">UNINSURED CITIZEN</span>
                    <p className="text-2xl font-mono font-black text-white mt-1">-₹150</p>
                    <p className="text-xs text-slate-300 mt-1">Direct fine deducted from wallet balance.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase block">INSURED CITIZEN</span>
                    <p className="text-2xl font-mono font-black text-emerald-400 mt-1">₹0 Fine</p>
                    <p className="text-xs text-slate-300 mt-1">100% protected. Insurance covers all damage.</p>
                  </div>
                </div>

                <p className="text-xs font-mono text-slate-400">
                  Storm Insurance costs <strong className="text-white">-₹150</strong> one-time at the Central Bank desk.
                </p>
              </div>

              {/* Interactive Disaster Simulator */}
              <div className="lg:col-span-5 bg-[#140c10] border-2 border-red-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
                  <span className="font-bold text-red-400">DISASTER SIMULATOR</span>
                  <span className={hasInsurance ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                    {hasInsurance ? 'STATUS: INSURED' : 'STATUS: UNPROTECTED'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                  <span className="text-xs font-mono text-slate-300">Your Wallet:</span>
                  <span className="text-2xl font-mono font-black text-emerald-400">₹{disasterWallet}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasInsurance && disasterWallet >= 150) {
                        playChaChing();
                        setHasInsurance(true);
                        setDisasterWallet((prev) => prev - 150);
                        setDisasterOutcome('Bought Insurance (-₹150). You are protected!');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl font-mono text-xs font-bold transition-all ${
                      hasInsurance
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {hasInsurance ? '✓ Insured Active' : 'Buy Insurance (-₹150)'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playBeep();
                      if (hasInsurance) {
                        playChaChing();
                        setDisasterOutcome('⚡ Storm hit! You had insurance: ₹0 fine deducted! 🛡️');
                      } else {
                        setDisasterWallet((prev) => Math.max(0, prev - 150));
                        setDisasterOutcome('⚡ Storm hit! You were uninsured: -₹150 damage fine! 🚨');
                      }
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CloudLightning className="w-4 h-4" />
                    <span>Trigger Storm</span>
                  </button>
                </div>

                {disasterOutcome && (
                  <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-white text-center">
                    {disasterOutcome}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 5: SCAM ALLEY TRAP
              =================================================================== */}
          {activeTab === 'scam' && (
            <motion.div
              key="slide-scam"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded bg-rose-950 border border-rose-500/40 text-rose-400 font-mono text-xs font-bold uppercase tracking-widest">
                  RULE #5: BEWARE OF SCAMS
                </span>
                <h2 className="text-3xl md:text-5xl font-mono font-black tracking-tight text-white">
                  Scam Alley is a <span className="text-rose-500">Rigged Carnival Trap</span>!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  In Scam Alley, they promise to &ldquo;Double Your Money&rdquo; on a wager. Here is the secret behind the curtain:
                </p>

                <div className="space-y-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs text-slate-200">
                    <strong className="text-emerald-400 uppercase font-mono block mb-0.5">THE BAIT (1st Play):</strong>
                    You WIN and double your money! They make you feel lucky and tell your friends.
                  </div>
                  <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/20 text-xs text-slate-200">
                    <strong className="text-red-400 uppercase font-mono block mb-0.5">THE TRAP (2nd Play & Beyond):</strong>
                    The house ALWAYS wins! The scanner recognizes your card and cuts your money immediately!
                  </div>
                  <div className="p-3.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 text-xs text-slate-200">
                    <strong className="text-cyan-400 uppercase font-mono block mb-0.5">HONEST REWARD (+₹100):</strong>
                    Citizens who report Scam Alley instead of gambling earn a +₹100 civic bounty!
                  </div>
                </div>
              </div>

              {/* Interactive Scam Alley Trap Simulator */}
              <div className="lg:col-span-5 bg-[#140a0e] border-2 border-rose-500/40 rounded-2xl p-6 shadow-xl space-y-4 text-center">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-xs">
                  <span className="font-bold text-rose-400">SCAM ALLEY TRAP TESTER</span>
                  <span className="text-slate-400">PLAYS: {scamWagersCount}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/10 flex items-center justify-between font-mono">
                  <span className="text-xs text-slate-400 uppercase">Wallet:</span>
                  <span className="text-2xl font-black text-emerald-400">₹{scamSimWallet}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (scamWagersCount === 0) {
                      playChaChing();
                      setScamWagersCount(1);
                      setScamSimWallet((prev) => prev + 100);
                      setScamMessage('🎉 JACKPOT! Beginner\'s Luck! You doubled your ₹100 wager! (Now you feel invincible...)');
                    } else {
                      playBeep();
                      setScamWagersCount((prev) => prev + 1);
                      setScamSimWallet((prev) => Math.max(0, prev - 100));
                      setScamMessage('🚨 BUSTED! The house wins! You lost your ₹100 wager! The trap was sprung!');
                    }
                  }}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
                >
                  Wager ₹100 (Double or Nothing)
                </button>

                {scamMessage && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-mono font-bold ${
                      scamWagersCount === 1
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                        : 'bg-rose-950/60 border-rose-500 text-rose-200'
                    }`}
                  >
                    {scamMessage}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setScamWagersCount(0);
                    setScamSimWallet(1000);
                    setScamMessage(null);
                  }}
                  className="text-xs font-mono text-slate-500 hover:text-slate-300 underline pt-1"
                >
                  Reset Trap Simulator
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 6: READINESS QUIZ & GAME CERTIFICATION
              =================================================================== */}
          {activeTab === 'quiz' && (
            <motion.div
              key="slide-quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
                  FINAL STEP: CITIZEN CERTIFICATION
                </span>
                <h2 className="text-3xl md:text-4xl font-mono font-black tracking-tight text-white">
                  Are You Ready for Sim-City?
                </h2>
                <p className="text-sm text-slate-300">
                  Answer the 3 questions below to unlock your official Citizen Certification before the clock starts:
                </p>
              </div>

              <div className="space-y-4">
                {/* Q1 */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0c1626] space-y-2">
                  <p className="text-sm font-mono font-bold text-white">
                    1. How much starting capital does each citizen get on their Debit Card?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['₹100', '₹500', '₹1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q1: amt.replace('₹', '') }))}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border transition-all ${
                          quizAnswers.q1 === amt.replace('₹', '')
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-black/30 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0c1626] space-y-2">
                  <p className="text-sm font-mono font-bold text-white">
                    2. What happens if a severe storm hits and you did NOT buy insurance?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'nothing', text: 'Nothing happens' },
                      { id: 'fine150', text: 'Deducts ₹150 damage fine' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q2: opt.id }))}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border text-left transition-all ${
                          quizAnswers.q2 === opt.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-black/30 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-xl border border-white/10 bg-[#0c1626] space-y-2">
                  <p className="text-sm font-mono font-bold text-white">
                    3. What happens if you scan your card for a second time at Scam Alley?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'double', text: 'You double your money again' },
                      { id: 'busted', text: 'You get busted and lose money' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q3: opt.id }))}
                        className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border text-left transition-all ${
                          quizAnswers.q3 === opt.id
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-black/30 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit Quiz */}
              <div className="text-center pt-2">
                {!quizPassed ? (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    disabled={!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3}
                    className="py-3 px-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-xl font-mono font-black text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
                  >
                    Verify Readiness
                  </button>
                ) : (
                  <div className="p-6 bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <Award className="w-8 h-8" />
                      <span className="text-xl font-mono font-black">CERTIFIED SIM-CITY CITIZEN!</span>
                    </div>
                    <p className="text-sm text-emerald-100">
                      All answers correct! You know how to manage capital, invest wisely, buy insurance, and avoid carnival scams.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/projector"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm uppercase tracking-wider rounded-xl shadow-xl active:scale-95 transition-all"
                      >
                        <span>Start Simulation // Open Projector</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                {quizSubmitted && !quizPassed && (
                  <p className="text-xs font-mono text-rose-400 font-bold mt-2">
                    Review your answers! Remember: Starting capital is ₹1,000, storms fine uninsured ₹150, and Scam Alley takes your money on repeat plays.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer Controls */}
      <footer className="px-6 md:px-12 py-4 border-t border-cyan-900/40 bg-[#0a0f1d]/90 backdrop-blur-md z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TABS.map((tab, idx) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_#38bdf8]'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={tab.label}
            />
          ))}
          <span className="text-xs font-mono text-slate-500 ml-2 hidden sm:inline">
            Press [←] or [→] arrow keys to navigate
          </span>
        </div>

        <div className="flex items-center gap-3">
          {activeTab !== 'card' && (
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          {activeTab !== 'quiz' ? (
            <button
              type="button"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
              }}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            >
              <span>Next Rule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/projector"
              target="_blank"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
            >
              <span>Launch Projector</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}
