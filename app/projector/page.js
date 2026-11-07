'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CloudLightning,
  TrendingUp,
  TrendingDown,
  Sun,
  ShieldAlert,
  AlertTriangle,
  X,
  Radio,
  Activity,
  Globe,
  Zap,
  Shield,
  Flame,
  Coins,
  Building2,
  Tv,
  Gamepad2,
  HelpCircle,
  Trophy,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProjectorPage() {
  // Theme: Dark (Default high-contrast event broadcast) / Light (Cleanroom white)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Live Game State from Database
  const [gameState, setGameState] = useState({
    weather: 'sunny',
    marketRate: 0,
    news: 'Welcome to Sim-City! Markets are open and trading is active.',
    clock: '50:00',
    bubble_active: false,
    bubble_ends_at: null,
  });

  const [stats, setStats] = useState({
    totalCitizens: 0,
    insuredCount: 0,
    uninsuredCount: 0,
    totalMoneySupply: 0,
    totalMfInvested: 0,
  });

  const [topCitizens, setTopCitizens] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null); // { type, title, rate, news, subtext }
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bubbleSecondsRemaining, setBubbleSecondsRemaining] = useState(0);

  // 50:00 Master Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Audio References
  const sirenAudioRef = useRef(null);
  const chaChingAudioRef = useRef(null);
  const bgmAudioRef = useRef(null);

  // Previous State References to Detect Transitions
  const prevWeatherRef = useRef(null);
  const prevMarketRateRef = useRef(null);
  const prevBubbleActiveRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  const isStorm = gameState.weather === 'storm';
  const isEmergencyTime = secondsRemaining <= 5 * 60;

  // Sound Helpers
  const playSiren = () => {
    if (sirenAudioRef.current) {
      sirenAudioRef.current.currentTime = 0;
      sirenAudioRef.current.play().catch(() => {});
    }
  };

  const stopSiren = () => {
    if (sirenAudioRef.current) {
      sirenAudioRef.current.pause();
      sirenAudioRef.current.currentTime = 0;
    }
  };

  const playChaChing = () => {
    if (chaChingAudioRef.current) {
      chaChingAudioRef.current.currentTime = 0;
      chaChingAudioRef.current.play().catch(() => {});
    }
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    if (nextVal) {
      playChaChing();
    } else {
      stopSiren();
      if (bgmAudioRef.current) bgmAudioRef.current.pause();
    }
  };

  // High-impact event alert banner
  const triggerPopAlert = (alertData, duration = 8500) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setActiveAlert(alertData);
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, duration);
  };

  // Sync state from server
  const syncServerState = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success && data.gameState) {
        const newWeather = data.gameState.weather_status || 'sunny';
        const newRate = Number(data.gameState.market_rate || 0);
        const newNews = data.gameState.news_text || 'Markets operating normally.';

        // Detect Weather Transition
        if (prevWeatherRef.current !== null) {
          if (prevWeatherRef.current !== 'storm' && newWeather === 'storm') {
            playSiren();
            triggerPopAlert({
              type: 'disaster',
              title: '⛈️ SEVERE STORM HAS HIT SIM-CITY!',
              news: newNews,
              subtext: 'Uninsured citizens have been fined ₹150 for repair damages. Insured citizens paid ₹0.',
            }, 9500);
          } else if (prevWeatherRef.current === 'storm' && newWeather === 'sunny') {
            stopSiren();
            playChaChing();
            triggerPopAlert({
              type: 'calm',
              title: '☀️ THE STORM HAS CLEARED!',
              news: 'Skies are clear across Sim-City. All stations and trading are back to normal.',
              subtext: 'Citizens can resume regular financial activity safely.',
            }, 7000);
          }
        }

        // Detect Market Rate Change
        if (prevMarketRateRef.current !== null && prevMarketRateRef.current !== newRate) {
          if (newRate > prevMarketRateRef.current) {
            playChaChing();
            triggerPopAlert({
              type: 'surge',
              title: data.gameState.bubble_active
                ? '🚀 5-MINUTE TECH BUBBLE LAUNCHED (+25%)!'
                : '📈 MARKET SURGE ALERT!',
              rate: newRate,
              news: newNews,
              subtext: data.gameState.bubble_active
                ? '5-minute countdown is running! Cash out your mutual funds before the bubble bursts!'
                : `Mutual funds gained value across the city (+${newRate}%).`,
            }, 8000);
          } else if (newRate < prevMarketRateRef.current) {
            if (prevBubbleActiveRef.current && !data.gameState.bubble_active) {
              playSiren();
            }
            triggerPopAlert({
              type: 'drop',
              title: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? '💥 THE 5-MINUTE BUBBLE HAS BURST (-30%)!'
                : '📉 MARKET CORRECTION ALERT',
              rate: newRate,
              news: newNews,
              subtext: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? 'Speculative tech collapsed! Kids who cashed out in time kept their profits, while held funds dropped -30%.'
                : `Mutual funds took a dip (${newRate}%).`,
            }, 8500);
          }
        }

        prevWeatherRef.current = newWeather;
        prevMarketRateRef.current = newRate;
        prevBubbleActiveRef.current = Boolean(data.gameState.bubble_active);

        setGameState((prev) => ({
          ...prev,
          weather: newWeather,
          marketRate: newRate,
          news: newNews,
          bubble_active: Boolean(data.gameState.bubble_active),
          bubble_ends_at: data.gameState.bubble_ends_at || null,
        }));

        if (data.stats) setStats(data.stats);
        if (data.topCitizens) setTopCitizens(data.topCitizens);
        if (data.recentTransactions) setRecentTransactions(data.recentTransactions);
      }
    } catch (err) {
      console.error('Error syncing projector state:', err);
    }
  };

  // Realtime subscription + polling backup
  useEffect(() => {
    syncServerState();

    const channel = supabase
      .channel('projector-human-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state' },
        () => syncServerState()
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        () => syncServerState()
      )
      .subscribe();

    const interval = setInterval(syncServerState, 1500);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  // 50:00 Master Clock Timer
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    const clockStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    setGameState((prev) => ({ ...prev, clock: clockStr }));
  }, [secondsRemaining]);

  // 5-Minute Bubble countdown effect
  useEffect(() => {
    if (!gameState.bubble_active || !gameState.bubble_ends_at) {
      setBubbleSecondsRemaining(0);
      return;
    }

    const updateRemaining = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(gameState.bubble_ends_at).getTime() - Date.now()) / 1000)
      );
      setBubbleSecondsRemaining(diff);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [gameState.bubble_active, gameState.bubble_ends_at]);

  const formatBubbleTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const insuredPercent =
    stats.totalCitizens > 0
      ? Math.round((stats.insuredCount / stats.totalCitizens) * 100)
      : 100;

  return (
    <div
      onClick={() => {
        if (!soundEnabled) setSoundEnabled(true);
      }}
      className={`w-screen h-screen overflow-hidden flex flex-col select-none transition-colors duration-300 font-sans relative ${
        isDarkMode
          ? 'bg-[#0b0f19] text-slate-100'
          : 'bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Audio Engine */}
      <audio ref={sirenAudioRef} src="/sounds/siren-thunder.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />
      <audio ref={bgmAudioRef} src="/sounds/city-bgm.mp3" preload="auto" loop />

      {/* =========================================================================
          EVENT POP-UP ALERT MODAL (Disasters, Surges, Bubble Bursts)
          ========================================================================= */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <div
              className={`relative w-full max-w-3xl rounded-3xl p-8 border-4 shadow-2xl text-center overflow-hidden ${
                activeAlert.type === 'disaster'
                  ? 'bg-rose-950 border-rose-500 text-white shadow-[0_0_80px_rgba(244,63,94,0.4)]'
                  : activeAlert.type === 'surge'
                  ? 'bg-emerald-950 border-emerald-500 text-white shadow-[0_0_80px_rgba(16,185,129,0.4)]'
                  : activeAlert.type === 'drop'
                  ? 'bg-rose-950 border-red-500 text-white shadow-[0_0_80px_rgba(239,68,68,0.4)]'
                  : 'bg-blue-950 border-blue-400 text-white shadow-[0_0_80px_rgba(59,130,246,0.4)]'
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAlert(null);
                }}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 mb-3">
                {activeAlert.title}
              </span>

              {activeAlert.rate !== undefined && (
                <div className="my-2">
                  <span
                    className={`text-7xl md:text-8xl font-black font-mono tracking-tight leading-none ${
                      activeAlert.rate > 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {activeAlert.rate > 0 ? `+${activeAlert.rate}%` : `${activeAlert.rate}%`}
                  </span>
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2 max-w-xl mx-auto leading-snug">
                {activeAlert.news}
              </h2>

              {activeAlert.subtext && (
                <p className="text-base text-white/85 font-medium mt-3 max-w-lg mx-auto">
                  {activeAlert.subtext}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          1. TOP BAR: STATUS HUD & MASTER CLOCK (h-[11%])
          ========================================================================= */}
      <header
        className={`h-[11%] px-6 md:px-10 flex items-center justify-between border-b transition-colors z-20 ${
          isDarkMode
            ? 'bg-[#111827] border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        {/* Left Side: Brand & Weather Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-black tracking-tight leading-none">
                  Sim-City Economy
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Event
                </span>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Live Simulation Dashboard
              </span>
            </div>
          </div>

          {/* Weather Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              isStorm
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                : isDarkMode
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-300'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            {isStorm ? (
              <>
                <CloudLightning className="w-4 h-4 text-rose-400" />
                <span>Storm Warning (Uninsured fined ₹150)</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Sunny & Clear</span>
              </>
            )}
          </div>
        </div>

        {/* Center: 5-Minute Bubble Countdown Banner */}
        {gameState.bubble_active && (
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="px-5 py-2 rounded-2xl bg-rose-600 text-white font-bold text-xs md:text-sm flex items-center gap-2.5 shadow-lg"
          >
            <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span>
              5-Min Tech Surge (+25%):{' '}
              <strong className="font-mono text-base font-black text-yellow-200">
                {formatBubbleTimer(bubbleSecondsRemaining)}
              </strong>{' '}
              left to Cash Out!
            </span>
          </motion.div>
        )}

        {/* Right Side: Controls & Big Master Timer */}
        <div className="flex items-center gap-3">
          {/* Audio toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDarkMode(!isDarkMode);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Briefing Instructions Link */}
          <Link
            href="/instructions"
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rules</span>
          </Link>

          {/* Master 50:00 Countdown Clock */}
          <div
            className={`px-5 py-1.5 rounded-2xl border-2 flex items-center gap-2.5 font-mono ${
              isEmergencyTime
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-400" />
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">
                Time Left
              </span>
              <span className="text-2xl font-black tracking-tight leading-none mt-0.5">
                {gameState.clock}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN STAGE (h-[79%]): BALANCED & HUMAN-CRAFTED 2-COLUMN LAYOUT
          ========================================================================= */}
      <main className="h-[79%] flex w-full p-4 md:p-6 gap-6 overflow-hidden">
        {/* =======================================================================
            LEFT COLUMN (42% width): THE MARKET PULSE & BREAKING NEWS
            ======================================================================= */}
        <section className="w-[42%] h-full flex flex-col justify-between gap-4">
          {/* Main Market Rate Card */}
          <div
            className={`p-6 rounded-3xl border transition-all shadow-sm flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-extrabold uppercase tracking-wider">
                  Mutual Fund Market Rate
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${
                  gameState.marketRate > 0
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : gameState.marketRate < 0
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                }`}
              >
                {gameState.marketRate > 0 ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Bull Market</span>
                  </>
                ) : gameState.marketRate < 0 ? (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Market Dip</span>
                  </>
                ) : (
                  <span>Stable</span>
                )}
              </span>
            </div>

            {/* Massive Rate Number & Trend Curve */}
            <div className="my-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase">
                  Current Return Delta
                </span>
                <span
                  className={`text-6xl md:text-7xl font-black font-mono tracking-tight ${
                    gameState.marketRate > 0
                      ? 'text-emerald-400'
                      : gameState.marketRate < 0
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {gameState.marketRate > 0 ? `+${gameState.marketRate}%` : `${gameState.marketRate}%`}
                </span>
              </div>

              {/* Smooth Clean Area Sparkline Chart */}
              <div className="w-48 h-20">
                <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="humanChartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop
                        offset="0%"
                        stopColor={gameState.marketRate >= 0 ? '#10b981' : '#f43f5e'}
                        stopOpacity="0.3"
                      />
                      <stop
                        offset="100%"
                        stopColor={gameState.marketRate >= 0 ? '#10b981' : '#f43f5e'}
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  {gameState.marketRate >= 0 ? (
                    <>
                      <polygon points="0,60 40,55 80,45 120,50 160,25 200,15 200,80 0,80" fill="url(#humanChartGrad)" />
                      <polyline points="0,60 40,55 80,45 120,50 160,25 200,15" fill="none" stroke="#10b981" strokeWidth="3" />
                    </>
                  ) : (
                    <>
                      <polygon points="0,20 40,30 80,40 120,35 160,60 200,75 200,80 0,80" fill="url(#humanChartGrad)" />
                      <polyline points="0,20 40,30 80,40 120,35 160,60 200,75" fill="none" stroke="#f43f5e" strokeWidth="3" />
                    </>
                  )}
                </svg>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Citizens invested in Mutual Funds gain or lose portfolio value based on this rate. Remember to cash out profits before any market drop!
            </p>
          </div>

          {/* Breaking News Card */}
          <div
            className={`p-5 rounded-3xl border transition-all shadow-sm flex flex-col justify-between ${
              isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>City News Flash</span>
            </div>
            <p className="text-lg md:text-xl font-extrabold text-white leading-snug">
              &ldquo;{gameState.news}&rdquo;
            </p>
            <span className="text-xs text-slate-400 mt-2 block font-medium">
              Listen to the Game Master & watch the screen for flash events.
            </span>
          </div>

          {/* Economy at a Glance (3 Cards) */}
          <div className="grid grid-cols-3 gap-3">
            <div
              className={`p-4 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">
                Money Supply
              </span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ₹{stats.totalMoneySupply}
              </span>
            </div>

            <div
              className={`p-4 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">
                Invested in Funds
              </span>
              <span className="text-xl font-black font-mono text-amber-400">
                ₹{stats.totalMfInvested}
              </span>
            </div>

            <div
              className={`p-4 rounded-2xl border text-center ${
                isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">
                Insured Citizens
              </span>
              <span className="text-xl font-black font-mono text-cyan-400">
                {insuredPercent}%
              </span>
            </div>
          </div>
        </section>

        {/* =======================================================================
            RIGHT COLUMN (58% width): EXPERIENTIAL STATIONS & LIVE LEADERBOARD
            ======================================================================= */}
        <section className="w-[58%] h-full flex flex-col justify-between gap-4">
          {/* Active Experiential Stations Guide */}
          <div
            className={`p-5 rounded-3xl border transition-all shadow-sm ${
              isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/40 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  Active Stations & Experiential Rewards
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Visit station laptops to spend or earn
              </span>
            </div>

            {/* 5 Experiential Store Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {/* 1. YouTube */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Tv className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-white">Entertainment</span>
                </div>
                <p className="text-[11px] text-slate-300">Play requested YouTube songs & videos on laptop.</p>
                <span className="text-[10px] font-mono text-rose-400 font-bold mt-2">Cost: ₹100 - ₹200</span>
              </div>

              {/* 2. Travel */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-white">Travel Arena</span>
                </div>
                <p className="text-[11px] text-slate-300">Google Earth 3D flyovers of chosen countries.</p>
                <span className="text-[10px] font-mono text-sky-400 font-bold mt-2">Cost: ₹100 - ₹300</span>
              </div>

              {/* 3. Arcade */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-white">Arcade Zone</span>
                </div>
                <p className="text-[11px] text-slate-300">Play 1v1 browser minigames. Beat high score!</p>
                <span className="text-[10px] font-mono text-purple-400 font-bold mt-2">Win: +₹200 Bounty</span>
              </div>

              {/* 4. Mutual Funds */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-white">Mutual Funds</span>
                </div>
                <p className="text-[11px] text-slate-300">Deposit units when markets rise. Cash out to profit.</p>
                <span className="text-[10px] font-mono text-amber-400 font-bold mt-2">Cash Out: 50% or 100%</span>
              </div>

              {/* 5. Central Bank */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between col-span-2 md:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-white">Central Bank & Insurance Desk</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Collect Hourly Wages (+₹300) • Buy Storm Insurance (-₹150) • Debit Card Activations.
                </p>
                <span className="text-[10px] font-mono text-emerald-400 font-bold mt-2">Wage: +₹300 | Protects against ₹150 storm damage</span>
              </div>
            </div>
          </div>

          {/* Live Citizen Leaderboard (Top Net Worth) */}
          <div
            className={`flex-1 p-5 rounded-3xl border transition-all shadow-sm flex flex-col justify-between overflow-hidden ${
              isDarkMode ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/40 mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider">
                  City Leaderboard — Top Citizen Portfolios
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Ranked by Total Net Worth (Cash + MF)
              </span>
            </div>

            {/* Leaderboard Table / Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {topCitizens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Users className="w-8 h-8 text-slate-500 mb-2 opacity-60" />
                  <p className="text-sm font-bold text-slate-300">No citizens registered yet in this session</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Volunteers are scanning debit cards at the Central Bank desk. Your rank will appear here!
                  </p>
                </div>
              ) : (
                topCitizens.map((citizen, idx) => (
                  <div
                    key={citizen.id || idx}
                    className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-black shadow-sm'
                            : idx === 1
                            ? 'bg-slate-300 text-black'
                            : idx === 2
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white leading-tight">
                          {citizen.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {citizen.qr_id} {citizen.has_insurance && '• 🛡️ Insured'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                          Wallet / MF
                        </span>
                        <span className="text-xs font-mono text-slate-300">
                          ₹{citizen.balance} + ₹{citizen.mf_invested}
                        </span>
                      </div>

                      <div className="pl-3 border-l border-slate-700/60">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block leading-none">
                          Net Worth
                        </span>
                        <span className="text-lg font-black font-mono text-emerald-400">
                          ₹{citizen.netWorth}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          3. BOTTOM LIVE TRANSACTION TICKER (h-[10%])
          ========================================================================= */}
      <footer
        className={`h-[10%] flex items-center overflow-hidden border-t z-30 transition-colors ${
          isDarkMode ? 'bg-[#0f172a] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="h-full px-6 flex items-center justify-center font-extrabold text-xs tracking-wider uppercase shrink-0 border-r border-slate-800 bg-blue-600 text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2" />
          <span>Live Activity</span>
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap py-2 flex items-center font-medium">
          <div className="animate-marquee inline-block">
            <span className="text-sm tracking-wide">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <span key={tx.id || idx} className="mx-4">
                    <span className="font-bold text-white">{tx.citizens?.name || 'Citizen'}</span>:{' '}
                    <span className={tx.amount > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>{' '}
                    <span className="opacity-70 text-xs">({tx.description})</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))
              ) : (
                <span>
                  • 📺 ENTERTAINMENT: Request any YouTube video on laptop &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  • 🌍 TRAVEL ARENA: Explore 3D Google Earth tours &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  • 📈 MUTUAL FUNDS: Deposit and cash out your gains &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  • 🏛️ CENTRAL BANK: Collect ₹300 hourly wages and buy storm insurance &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  • 🎮 ARCADE ZONE: 1v1 minigame battles
                </span>
              )}
              &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; 📢 {gameState.news}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
