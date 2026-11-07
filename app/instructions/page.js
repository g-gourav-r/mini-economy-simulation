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
  { id: 'card', label: '1. Debit Card', icon: QrCode },
  { id: 'rewards', label: '2. Experience Stores', icon: Tv },
  { id: 'mf', label: '3. Mutual Funds', icon: TrendingUp },
  { id: 'disaster', label: '4. Storms & Insurance', icon: ShieldCheck },
  { id: 'scam', label: '5. Scam Alley', icon: ShieldAlert },
  { id: 'quiz', label: '6. Quick Quiz', icon: Award },
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
  const [simHistory, setSimHistory] = useState(['You invested ₹300 in Mutual Funds.']);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      {/* Audio Engine */}
      <audio ref={beepAudioRef} src="/sounds/beep.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />

      {/* Top Header */}
      <header className="px-6 md:px-12 py-4 border-b border-slate-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </Link>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Sim-City: How to Play & Win</span>
            </h1>
            <span className="text-xs text-slate-400 font-medium block">
              Interactive 5-Minute Student Briefing
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4 text-slate-300" />
          </button>

          <Link
            href="/projector"
            target="_blank"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Launch Projector</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="px-6 md:px-12 py-3 border-b border-slate-800 bg-[#111827]/60 backdrop-blur-sm z-20 flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center z-10">
        <AnimatePresence mode="wait">
          {/* ===================================================================
              SLIDE 1: YOUR DEBIT CARD & ₹1,000 STARTING MONEY
              =================================================================== */}
          {activeTab === 'card' && (
            <motion.div
              key="slide-card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Step 1: Your Money
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  You start with <span className="text-emerald-400">₹1,000</span> on your Debit Card!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  Every student gets a printed card with a unique QR code. There is no paper cash in Sim-City — your card is your digital wallet. Volunteers at each station will scan it using their phone cameras.
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Keep your card safe:</strong> Don&apos;t lose it! It tracks your balance and investments.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Instant Scanning:</strong> Every time your card is scanned, you&apos;ll hear a beep and see your new balance.</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span><strong>Goal:</strong> Spend on fun experiences, invest in stocks, protect against storms, and have the highest Net Worth at 50 minutes!</span>
                  </div>
                </div>
              </div>

              {/* Interactive Card Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-3xl p-6 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-slate-700 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Student Debit Card
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>

                  <div className="my-6 text-center">
                    <div className="w-28 h-28 mx-auto bg-white p-2.5 rounded-2xl shadow-md flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 mt-2 block">
                      CARD-101 • Aarav Sharma
                    </span>
                  </div>

                  <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700 flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-400">Wallet Balance:</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">
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
                      }, 600);
                    }}
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-md"
                  >
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>{cardSimScanned ? 'Scanner Reading Card...' : 'Test Card Scan (-₹100)'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 2: EXPERIENTIAL REWARDS
              =================================================================== */}
          {activeTab === 'rewards' && (
            <motion.div
              key="slide-rewards"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="max-w-2xl">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  Step 2: Experiential Rewards
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mt-2">
                  Spend your money on <span className="text-rose-400">Laptop Experiences</span>!
                </h2>
                <p className="text-base text-slate-300 mt-2">
                  There are no physical items to buy. Station volunteers have laptops ready for you to request videos, explore the earth in 3D, or play minigames. Tap each store to preview:
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
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Entertainment'
                      ? 'bg-rose-950/40 border-rose-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                    <Tv className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">YouTube Jukebox</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Request your favorite YouTube song or music video on the station laptop!
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-rose-400 font-bold">
                    -₹100 Short Video • -₹200 Full Song
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
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Travel'
                      ? 'bg-sky-950/40 border-sky-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Travel Arena</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Choose any country, city, or wonder for a 3D Google Earth flyover!
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-sky-400 font-bold">
                    -₹100 City Tour • -₹200 Safari
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
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer select-none active:scale-95 ${
                    activeReward === 'Arcade'
                      ? 'bg-purple-950/40 border-purple-500 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Arcade Zone</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Play quick 5-minute browser minigames and 1v1 challenges!
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-purple-400 font-bold">
                    -₹100 Play Session • +₹200 High Score
                  </div>
                </div>
              </div>

              {/* Feedback strip */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {activeReward
                    ? `Tested purchase at ${activeReward}! Notice how your balance deducted.`
                    : 'Tap any store card above to simulate spending.'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 uppercase">Test Wallet:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    ₹{rewardWallet}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRewardWallet(1000);
                      setActiveReward(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 3: MUTUAL FUNDS & BUBBLE CYCLE
              =================================================================== */}
          {activeTab === 'mf' && (
            <motion.div
              key="slide-mf"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  Step 3: Making Your Money Grow
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  Invest in Mutual Funds — and <span className="text-amber-400">Cash Out</span> before the Crash!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  Visit the Mutual Fund station to deposit your cash. When markets boom (+10%, +25%), your units grow automatically!
                </p>

                <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 text-amber-100 text-sm space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Watch Out for the 5-Minute Bubble:</span>
                  </div>
                  <p className="text-xs text-amber-200 leading-relaxed">
                    When the Game Master announces a 5-Minute Bubble (+25%), the Projector starts a countdown from 05:00. You MUST visit the Mutual Fund station to <strong className="text-white">Cash Out (Liquidate)</strong> your units before the clock hits zero. If you don&apos;t, the bubble bursts with a -30% crash!
                  </p>
                </div>
              </div>

              {/* Simulator */}
              <div className="lg:col-span-5 bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-bold text-amber-400">Try the Investment Simulator:</span>
                  <span className="font-mono text-slate-400">Delta: {simMarketDelta > 0 ? `+${simMarketDelta}%` : `${simMarketDelta}%`}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-black/40 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Wallet Cash</span>
                    <span className="text-2xl font-black font-mono text-emerald-400">₹{simLiquidWallet}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Invested in Funds</span>
                    <span className="text-2xl font-black font-mono text-amber-400">₹{simMfAmount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      playChaChing();
                      setSimMarketDelta(25);
                      setSimMfAmount((prev) => Math.round(prev * 1.25));
                      setSimHistory((prev) => ['🚀 +25% Bubble Surge! Your units grew from ₹300 to ₹375!', ...prev.slice(0, 2)]);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    1. Trigger +25% Bubble Surge
                  </button>

                  <button
                    type="button"
                    disabled={simMfAmount <= 0}
                    onClick={() => {
                      playChaChing();
                      setSimLiquidWallet((prev) => prev + simMfAmount);
                      setSimHistory((prev) => [`💰 Smart move! Cashed out ₹${simMfAmount} safely back to your wallet!`, ...prev.slice(0, 2)]);
                      setSimMfAmount(0);
                    }}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    2. Cash Out 100% (Lock in Profits)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playBeep();
                      setSimMarketDelta(-30);
                      setSimMfAmount((prev) => Math.round(prev * 0.7));
                      setSimHistory((prev) => ['💥 -30% Bubble Burst! Any held units lost value!', ...prev.slice(0, 2)]);
                    }}
                    className="w-full py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    3. Trigger -30% Bubble Burst
                  </button>
                </div>

                <div className="p-3 bg-black/50 rounded-xl text-xs text-slate-300 divide-y divide-slate-800">
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  Step 4: Protecting Your Money
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  Severe Storms cause <span className="text-rose-400">₹150 Fine</span> — unless Insured!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  Natural disasters can strike Sim-City at any moment. When thunder rumbles and the projector turns red:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20">
                    <span className="text-xs font-bold text-rose-400 uppercase block">UNINSURED CITIZEN</span>
                    <p className="text-2xl font-black font-mono text-white mt-1">-₹150</p>
                    <p className="text-xs text-slate-300 mt-1">Direct repair damage deducted from wallet.</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                    <span className="text-xs font-bold text-emerald-400 uppercase block">INSURED CITIZEN</span>
                    <p className="text-2xl font-black font-mono text-emerald-400 mt-1">₹0 Fine</p>
                    <p className="text-xs text-slate-300 mt-1">100% protected. Insurance covers the damage.</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Buy Storm Insurance for <strong className="text-white">-₹150</strong> one-time at the Central Bank desk.
                </p>
              </div>

              {/* Simulator */}
              <div className="lg:col-span-5 bg-slate-900 border-2 border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                  <span className="text-rose-400">Disaster Test:</span>
                  <span className={hasInsurance ? 'text-emerald-400' : 'text-slate-400'}>
                    {hasInsurance ? '🛡️ Protected by Insurance' : '⚠️ No Insurance'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-300">Your Wallet:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">₹{disasterWallet}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!hasInsurance && disasterWallet >= 150) {
                        playChaChing();
                        setHasInsurance(true);
                        setDisasterWallet((prev) => prev - 150);
                        setDisasterOutcome('You bought Insurance (-₹150). You are now protected!');
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      hasInsurance
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 shadow-sm'
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
                        setDisasterOutcome('⚡ Storm hit! Because you had insurance, you paid ₹0 fine! 🛡️');
                      } else {
                        setDisasterWallet((prev) => Math.max(0, prev - 150));
                        setDisasterOutcome('⚡ Storm hit! You were uninsured: -₹150 fine deducted! 🚨');
                      }
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CloudLightning className="w-4 h-4" />
                    <span>Trigger Storm</span>
                  </button>
                </div>

                {disasterOutcome && (
                  <div className="p-3 bg-black/60 rounded-xl text-xs text-white text-center font-medium">
                    {disasterOutcome}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 5: SCAM ALLEY
              =================================================================== */}
          {activeTab === 'scam' && (
            <motion.div
              key="slide-scam"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  Step 5: Avoiding Traps
                </span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                  Scam Alley is a <span className="text-rose-500">Rigged Carnival Trap</span>!
                </h2>
                <p className="text-base text-slate-300 leading-relaxed">
                  In Scam Alley, they promise to &ldquo;Double Your Money&rdquo; on a wager. Here is how the trap works:
                </p>

                <div className="space-y-2.5 pt-1">
                  <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 text-xs text-slate-200">
                    <strong className="text-emerald-400 font-bold block mb-0.5">1. The Bait (First Play):</strong>
                    You win and double your money (+₹100)! This makes you feel lucky so you come back again.
                  </div>
                  <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-xs text-slate-200">
                    <strong className="text-rose-400 font-bold block mb-0.5">2. The Hook (Second Play & Beyond):</strong>
                    The scanner remembers your card — and the house ALWAYS wins and cuts your money (-₹100)!
                  </div>
                  <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-950/20 text-xs text-slate-200">
                    <strong className="text-blue-400 font-bold block mb-0.5">3. The Smart Choice (+₹100):</strong>
                    Citizens who report Scam Alley instead of gambling earn a +₹100 civic bounty reward!
                  </div>
                </div>
              </div>

              {/* Simulator */}
              <div className="lg:col-span-5 bg-slate-900 border-2 border-rose-500/30 rounded-3xl p-6 shadow-xl space-y-4 text-center">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-bold">
                  <span className="text-rose-400">Scam Alley Simulator:</span>
                  <span className="text-slate-400">Plays: {scamWagersCount}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 uppercase font-bold">Wallet:</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">₹{scamSimWallet}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (scamWagersCount === 0) {
                      playChaChing();
                      setScamWagersCount(1);
                      setScamSimWallet((prev) => prev + 100);
                      setScamMessage('🎉 JACKPOT! Beginner\'s luck doubled your ₹100 wager! (Now you feel lucky...)');
                    } else {
                      playBeep();
                      setScamWagersCount((prev) => prev + 1);
                      setScamSimWallet((prev) => Math.max(0, prev - 100));
                      setScamMessage('🚨 BUSTED! The house wins! You lost your ₹100 wager! That is how the trap works!');
                    }
                  }}
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  Wager ₹100 (Double or Nothing)
                </button>

                {scamMessage && (
                  <div
                    className={`p-3 rounded-2xl border text-xs font-bold ${
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
                  className="text-xs text-slate-400 hover:text-white underline pt-1"
                >
                  Reset Test
                </button>
              </div>
            </motion.div>
          )}

          {/* ===================================================================
              SLIDE 6: QUICK QUIZ
              =================================================================== */}
          {activeTab === 'quiz' && (
            <motion.div
              key="slide-quiz"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Final Check
                </span>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                  Are You Ready to Play?
                </h2>
                <p className="text-sm text-slate-300">
                  Answer these 3 quick questions to check your readiness before the 50-minute clock starts:
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Q1 */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <p className="text-sm font-bold text-white">
                    1. How much starting money does each student receive on their debit card?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['₹100', '₹500', '₹1000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q1: amt.replace('₹', '') }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          quizAnswers.q1 === amt.replace('₹', '')
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q2 */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <p className="text-sm font-bold text-white">
                    2. What happens if a storm hits and you didn&apos;t buy insurance?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'nothing', text: 'Nothing happens' },
                      { id: 'fine150', text: 'You pay ₹150 repair fine' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q2: opt.id }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          quizAnswers.q2 === opt.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Q3 */}
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900 space-y-2">
                  <p className="text-sm font-bold text-white">
                    3. What happens if you scan your card a second time at Scam Alley?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'double', text: 'You double your money again' },
                      { id: 'busted', text: 'You lose your wager (Busted!)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q3: opt.id }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border text-left transition-all ${
                          quizAnswers.q3 === opt.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="text-center pt-2">
                {!quizPassed ? (
                  <button
                    type="button"
                    onClick={handleQuizSubmit}
                    disabled={!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3}
                    className="py-3 px-8 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    Check My Answers
                  </button>
                ) : (
                  <div className="p-6 bg-emerald-950/50 border-2 border-emerald-500 rounded-3xl shadow-lg space-y-3 animate-in zoom-in-95">
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <Award className="w-7 h-7" />
                      <span className="text-xl font-black">All Answers Correct!</span>
                    </div>
                    <p className="text-sm text-emerald-100">
                      You know how to budget your ₹1,000, cash out mutual funds before crashes, protect with insurance, and avoid carnival scams.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/projector"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm uppercase tracking-wider rounded-2xl shadow-md active:scale-95 transition-all"
                      >
                        <span>Start Game // Open Projector</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )}

                {quizSubmitted && !quizPassed && (
                  <p className="text-xs text-rose-400 font-bold mt-2">
                    Review your answers! Remember: Starting money is ₹1,000, storms fine uninsured ₹150, and repeat Scam Alley wagers lose money.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Footer Controls */}
      <footer className="px-6 md:px-12 py-4 border-t border-slate-800 bg-[#111827]/90 backdrop-blur-md z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 scale-125'
                  : 'bg-slate-700 hover:bg-slate-500'
              }`}
              title={tab.label}
            />
          ))}
          <span className="text-xs text-slate-500 ml-2 hidden sm:inline">
            Press [←] or [→] to switch rules
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
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
            >
              <span>Next Rule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              href="/projector"
              target="_blank"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
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
