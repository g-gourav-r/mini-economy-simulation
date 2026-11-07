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
  Cpu,
  Globe,
  Zap,
  Shield,
  Layers,
  Flame,
  Moon,
  Coins,
  Building2,
  Tv,
  Gamepad2,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProjectorPage() {
  // Theme Mode: Default to Futuristic Cyber-Command Center (Dark), toggleable to Titanium High-Tech (Light)
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Live Game State from Database
  const [gameState, setGameState] = useState({
    weather: 'sunny',
    marketRate: 0,
    news: 'Metropolitan economic grid synchronized. Markets operating under normal parameters.',
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

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null); // { type, title, rate, news, subtext }
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bubbleSecondsRemaining, setBubbleSecondsRemaining] = useState(0);

  // Countdown timer state (seconds)
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

  // Toggle sound
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

  // Trigger Futuristic Emergency Alert with Auto-dismiss
  const triggerPopAlert = (alertData, duration = 8500) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setActiveAlert(alertData);
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, duration);
  };

  // 1. Fetch & Sync Server State
  const syncServerState = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success && data.gameState) {
        const newWeather = data.gameState.weather_status || 'sunny';
        const newRate = Number(data.gameState.market_rate || 0);
        const newNews = data.gameState.news_text || 'Markets operating normally.';

        // Detect Weather Transition: Disaster Triggered
        if (prevWeatherRef.current !== null) {
          if (prevWeatherRef.current !== 'storm' && newWeather === 'storm') {
            playSiren();
            triggerPopAlert({
              type: 'disaster',
              title: 'CRITICAL ATMOSPHERIC ANOMALY // STORM CONTINGENCY',
              news: newNews,
              subtext: 'Uninsured citizens penalized damage surcharge. Disaster protocols deployed.',
            }, 9500);
          } else if (prevWeatherRef.current === 'storm' && newWeather === 'sunny') {
            stopSiren();
            playChaChing();
            triggerPopAlert({
              type: 'calm',
              title: 'ATMOSPHERIC GRID RESTORED // NORMAL CONDITIONS',
              news: 'The storm has cleared. Metropolitan economic sectors have reopened.',
              subtext: 'Citizens can resume regular financial operations safely.',
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
                ? 'SPECULATIVE TECH BUBBLE LAUNCHED // +25% RALLY'
                : 'MARKET MOMENTUM SURGE // INDEX RALLY',
              rate: newRate,
              news: newNews,
              subtext: data.gameState.bubble_active
                ? 'Speculative tech surge active! 5-minute liquidation window running — cash out mutual funds before contraction!'
                : `Mutual funds revalued across Sim-City (+${newRate}%).`,
            }, 8000);
          } else if (newRate < prevMarketRateRef.current) {
            if (prevBubbleActiveRef.current && !data.gameState.bubble_active) {
              playSiren();
            }
            triggerPopAlert({
              type: 'drop',
              title: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? 'TERMINAL BUBBLE BURST // -30% CONTRACTION'
                : 'MARKET CONTRACTION // NEGATIVE DIVERGENCE',
              rate: newRate,
              news: newNews,
              subtext: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? 'Speculative bubble collapsed! Mutual fund portfolios lost -30%. Only citizens who liquidated preserved gains.'
                : `Mutual fund values adjusted downward (${newRate}%).`,
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

        if (data.stats) {
          setStats(data.stats);
        }

        if (data.recentTransactions) {
          setRecentTransactions(data.recentTransactions);
        }
      }
    } catch (err) {
      console.error('Error syncing projector state:', err);
    }
  };

  // 2. Setup Realtime Webhook & Polling Listener
  useEffect(() => {
    syncServerState();

    const channel = supabase
      .channel('projector-futuristic-sync')
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

  // 50:00 Countdown effect
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

  // Sync clock string
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
      className={`w-screen h-screen overflow-hidden flex flex-col select-none transition-colors duration-500 font-sans relative ${
        isDarkMode
          ? 'bg-[#060a12] text-slate-100'
          : 'bg-[#f1f5f9] text-slate-900'
      }`}
    >
      {/* Background Cybernetic Tech Grid Texture */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isDarkMode
            ? 'opacity-[0.14] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]'
            : 'opacity-[0.08] bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]'
        }`}
      />

      {/* Audio Engine */}
      <audio ref={sirenAudioRef} src="/sounds/siren-thunder.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />
      <audio ref={bgmAudioRef} src="/sounds/city-bgm.mp3" preload="auto" loop />

      {/* =========================================================================
          CINEMATIC FUTURISTIC EMERGENCY HUD TAKEOVER
          ========================================================================= */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, scale: 1, backdropFilter: 'blur(8px)' }}
            exit={{ opacity: 0, scale: 0.9, backdropFilter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/60 pointer-events-auto"
          >
            <div
              className={`relative w-full max-w-4xl rounded-2xl p-8 border-2 shadow-2xl overflow-hidden ${
                activeAlert.type === 'disaster'
                  ? 'bg-[#180a0a]/95 border-red-500 text-white shadow-[0_0_60px_rgba(239,68,68,0.35)]'
                  : activeAlert.type === 'surge'
                  ? 'bg-[#081711]/95 border-emerald-500 text-white shadow-[0_0_60px_rgba(16,185,129,0.35)]'
                  : activeAlert.type === 'drop'
                  ? 'bg-[#1a0c10]/95 border-rose-500 text-white shadow-[0_0_60px_rgba(244,63,94,0.35)]'
                  : 'bg-[#081324]/95 border-cyan-400 text-white shadow-[0_0_60px_rgba(6,182,212,0.35)]'
              }`}
            >
              {/* Tech Bracket Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAlert(null);
                }}
                className="absolute top-5 right-5 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-widest uppercase border ${
                    activeAlert.type === 'disaster'
                      ? 'bg-red-950 text-red-400 border-red-700/60'
                      : activeAlert.type === 'surge'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-700/60'
                      : activeAlert.type === 'drop'
                      ? 'bg-rose-950 text-rose-400 border-rose-700/60'
                      : 'bg-cyan-950 text-cyan-400 border-cyan-700/60'
                  }`}
                >
                  SYSTEM TELEMETRY DISPATCH // HIGH PRIORITY
                </span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-tight font-mono text-white/95">
                {activeAlert.title}
              </h2>

              {activeAlert.rate !== undefined && (
                <div className="my-4 flex items-baseline gap-4">
                  <span
                    className={`text-7xl md:text-8xl font-black font-mono tracking-tighter ${
                      activeAlert.rate > 0 ? 'text-emerald-400' : 'text-rose-500'
                    }`}
                  >
                    {activeAlert.rate > 0 ? `+${activeAlert.rate}%` : `${activeAlert.rate}%`}
                  </span>
                  <span className="text-xs uppercase font-mono tracking-widest opacity-70">
                    MARKET INDEX DELTA
                  </span>
                </div>
              )}

              <p className="text-lg md:text-xl font-semibold text-white/90 mt-2 leading-relaxed">
                {activeAlert.news}
              </p>

              {activeAlert.subtext && (
                <p className="text-sm font-mono text-white/70 mt-3 pt-3 border-t border-white/10">
                  DIAGNOSTIC ADVISORY: {activeAlert.subtext}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          1. TOP AEROSPACE HUD BAR (h-[10%])
          ========================================================================= */}
      <header
        className={`h-[10%] px-6 md:px-10 flex items-center justify-between border-b transition-colors duration-500 z-20 ${
          isDarkMode
            ? 'bg-[#090e1a]/95 border-cyan-900/40 backdrop-blur-md'
            : 'bg-white/95 border-slate-200 backdrop-blur-md shadow-xs'
        }`}
      >
        {/* Left Side: Atmospheric HUD */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-mono font-bold tracking-wider ${
              isStorm
                ? 'bg-red-950/60 border-red-500/70 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : isDarkMode
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}
          >
            {isStorm ? (
              <CloudLightning className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <Sun className="w-4 h-4 text-cyan-400" />
            )}
            <div className="leading-tight">
              <span className="text-[9px] uppercase tracking-widest opacity-60 block">
                Atmospheric Grid
              </span>
              <span className="font-black">
                {isStorm ? 'SEVERE STORM WARNING' : 'OPTIMAL // CLEAR SKY'}
              </span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleSound();
            }}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">AUDIO ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">MUTED</span>
              </>
            )}
          </button>

          {/* Futuristic Theme Switcher */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDarkMode(!isDarkMode);
            }}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-cyan-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-blue-700'
            }`}
            title="Toggle Futuristic Display Mode"
          >
            {isDarkMode ? (
              <>
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">CYBER</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">TITANIUM</span>
              </>
            )}
          </button>

          {/* Briefing Instructions Link */}
          <Link
            href="/instructions"
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              isDarkMode
                ? 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-black'
            }`}
            title="Open Pre-Game Interactive Briefing"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">BRIEFING</span>
          </Link>
        </div>

        {/* Center: Bubble Cycle Telemetry or Satellite Uplink Indicator */}
        <div className="flex items-center gap-3">
          {gameState.bubble_active ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="px-5 py-2 rounded-xl border border-rose-500/80 bg-rose-950/70 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center gap-3"
            >
              <Flame className="w-5 h-5 text-rose-400 animate-bounce" />
              <div className="text-left leading-tight">
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-rose-400 block">
                  SPECULATIVE ASSET SURGE (+25%)
                </span>
                <span className="text-sm font-mono font-black text-white">
                  LIQUIDATION WINDOW: {formatBubbleTimer(bubbleSecondsRemaining)}
                </span>
              </div>
            </motion.div>
          ) : (
            <div
              className={`hidden lg:flex items-center gap-2.5 px-4 py-1.5 rounded-xl border font-mono text-xs ${
                isDarkMode
                  ? 'bg-slate-900/50 border-cyan-900/30 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="tracking-widest uppercase font-bold text-[11px]">
                SIM-CITY CENTRAL TELEMETRY HUB // SATELLITE LINK ACTIVE
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Master Chronometer (Clean, Precision Digital Clock) */}
        <div className="flex items-center gap-4">
          <div
            className={`px-5 py-1.5 rounded-xl border flex items-center gap-3 font-mono ${
              isEmergencyTime
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : isDarkMode
                ? 'bg-[#0d1527] border-cyan-500/30 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <Clock className={`w-4 h-4 ${isEmergencyTime ? 'text-red-400 animate-spin' : 'text-cyan-400'}`} />
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 block leading-none">
                SESSION CHRONOMETER
              </span>
              <span className="text-2xl md:text-3xl font-black tracking-tight leading-none">
                {gameState.clock}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN SPLIT TELEMETRY CENTER (h-[80%])
          ========================================================================= */}
      <main className="h-[80%] flex w-full p-4 md:p-6 gap-6 overflow-hidden relative">
        {/* =======================================================================
            LEFT PANEL (55% width): DIGITAL TWIN — SMART CITY VECTOR TELEMETRY
            ======================================================================= */}
        <section
          className={`w-[55%] h-full rounded-2xl border flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-500 ${
            isDarkMode
              ? 'bg-[#0b1220]/90 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-black tracking-widest uppercase">
                DIGITAL TWIN // METROPOLITAN GRID SECTOR
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>NODES SYNCHRONIZED</span>
            </div>
          </div>

          {/* Realistic Futuristic Holographic SVG City Visualization */}
          <div className="flex-1 relative flex items-center justify-center my-4 overflow-hidden">
            <svg
              viewBox="0 0 900 520"
              className="w-full h-full max-h-[460px] transition-transform duration-700"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradients */}
                <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={isDarkMode ? '0.05' : '0.15'} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="buildingCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isStorm ? '#ef4444' : '#06b6d4'} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={isStorm ? '#991b1b' : '#0369a1'} stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="buildingViolet" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isStorm ? '#f43f5e' : '#6366f1'} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={isStorm ? '#881337' : '#3730a3'} stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="buildingEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isStorm ? '#e11d48' : '#10b981'} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={isStorm ? '#9f1239' : '#047857'} stopOpacity="0.3" />
                </linearGradient>

                <linearGradient id="buildingAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={isStorm ? '#dc2626' : '#f59e0b'} stopOpacity="0.85" />
                  <stop offset="100%" stopColor={isStorm ? '#7f1d1d' : '#b45309'} stopOpacity="0.3" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Isometric Ground Grid Lines */}
              <g opacity={isDarkMode ? 0.35 : 0.65}>
                {/* Horizontal perspective lines */}
                <line x1="100" y1="460" x2="800" y2="460" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="160" y1="420" x2="740" y2="420" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="220" y1="380" x2="680" y2="380" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="280" y1="340" x2="620" y2="340" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />

                {/* Isometric angled grid rays */}
                <line x1="450" y1="320" x2="100" y2="480" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="450" y1="320" x2="260" y2="480" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="450" y1="320" x2="450" y2="480" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="450" y1="320" x2="640" y2="480" stroke="#38bdf8" strokeWidth="1.2" />
                <line x1="450" y1="320" x2="800" y2="480" stroke="#38bdf8" strokeWidth="1.2" />
              </g>

              {/* Storm Seismic Alert Rings (Triggered during storm) */}
              {isStorm && (
                <g>
                  <circle cx="450" cy="380" r="140" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 6" opacity="0.6">
                    <animate attributeName="r" values="60;220;60" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.1;0.8" dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="450" cy="380" r="220" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.3">
                    <animate attributeName="r" values="100;300;100" dur="4s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* Data Highway Pathways with Flowing Energy Pulses */}
              <g strokeWidth="2" stroke={isStorm ? '#ef4444' : '#06b6d4'} fill="none">
                <path d="M 170 390 L 320 380 L 450 350 L 590 380 L 730 390" strokeDasharray="6 6" opacity="0.7" />
                <path d="M 320 380 L 450 440 L 590 380" strokeDasharray="4 4" opacity="0.7" />
              </g>

              {/* Realistic Geometric Futuristic Architecture Skyline */}

              {/* Sector 1: Commercial Entertainment Tower (Left) */}
              <g className="transition-all duration-500">
                <polygon points="120,380 180,350 240,380 180,410" fill="url(#buildingViolet)" stroke={isStorm ? '#f43f5e' : '#818cf8'} strokeWidth="1.5" />
                <polygon points="120,380 120,240 180,210 180,350" fill="url(#buildingViolet)" stroke={isStorm ? '#f43f5e' : '#818cf8'} strokeWidth="1.5" />
                <polygon points="180,350 180,210 240,240 240,380" fill="#1e1b4b" stroke={isStorm ? '#f43f5e' : '#818cf8'} strokeWidth="1.5" opacity="0.85" />
                <polygon points="120,240 180,210 240,240 180,270" fill={isStorm ? '#ef4444' : '#a5b4fc'} opacity="0.4" />
                {/* Spire */}
                <line x1="180" y1="210" x2="180" y2="175" stroke={isStorm ? '#ef4444' : '#818cf8'} strokeWidth="2" filter="url(#laserGlow)" />
                <circle cx="180" cy="175" r="3" fill={isStorm ? '#ef4444' : '#38bdf8'} />
              </g>

              {/* Sector 2: Financial Exchange Spire (Center-Left) */}
              <g className="transition-all duration-500">
                <polygon points="260,370 330,335 400,370 330,405" fill="url(#buildingEmerald)" stroke={isStorm ? '#ef4444' : '#34d399'} strokeWidth="1.5" />
                <polygon points="260,370 260,190 330,150 330,335" fill="url(#buildingEmerald)" stroke={isStorm ? '#ef4444' : '#34d399'} strokeWidth="1.5" />
                <polygon points="330,335 330,150 400,190 400,370" fill="#064e3b" stroke={isStorm ? '#ef4444' : '#34d399'} strokeWidth="1.5" opacity="0.85" />
                {/* Sleek Facade Bands */}
                <line x1="260" y1="230" x2="330" y2="190" stroke={isStorm ? '#f87171' : '#6ee7b7'} strokeWidth="1" opacity="0.6" />
                <line x1="260" y1="270" x2="330" y2="230" stroke={isStorm ? '#f87171' : '#6ee7b7'} strokeWidth="1" opacity="0.6" />
                <line x1="260" y1="310" x2="330" y2="270" stroke={isStorm ? '#f87171' : '#6ee7b7'} strokeWidth="1" opacity="0.6" />
                {/* Spire */}
                <line x1="330" y1="150" x2="330" y2="105" stroke={isStorm ? '#ef4444' : '#34d399'} strokeWidth="2.5" filter="url(#laserGlow)" />
                <circle cx="330" cy="105" r="3.5" fill={isStorm ? '#ef4444' : '#10b981'} />
              </g>

              {/* Sector 3: Central Bank Monolith & Vault (Center-Right) */}
              <g className="transition-all duration-500">
                <polygon points="460,380 540,340 620,380 540,420" fill="url(#buildingCyan)" stroke={isStorm ? '#ef4444' : '#38bdf8'} strokeWidth="1.5" />
                <polygon points="460,380 460,160 540,120 540,340" fill="url(#buildingCyan)" stroke={isStorm ? '#ef4444' : '#38bdf8'} strokeWidth="1.5" />
                <polygon points="540,340 540,120 620,160 620,380" fill="#082f49" stroke={isStorm ? '#ef4444' : '#38bdf8'} strokeWidth="1.5" opacity="0.85" />
                {/* Twin Antenna Arrays */}
                <line x1="520" y1="120" x2="520" y2="80" stroke={isStorm ? '#ef4444' : '#38bdf8'} strokeWidth="2" filter="url(#laserGlow)" />
                <line x1="560" y1="120" x2="560" y2="80" stroke={isStorm ? '#ef4444' : '#38bdf8'} strokeWidth="2" filter="url(#laserGlow)" />
                <circle cx="520" cy="80" r="3" fill="#38bdf8" />
                <circle cx="560" cy="80" r="3" fill="#38bdf8" />
              </g>

              {/* Sector 4: Innovation Arcade Complex (Right) */}
              <g className="transition-all duration-500">
                <polygon points="660,390 730,355 800,390 730,425" fill="url(#buildingAmber)" stroke={isStorm ? '#ef4444' : '#fbbf24'} strokeWidth="1.5" />
                <polygon points="660,390 660,250 730,220 730,355" fill="url(#buildingAmber)" stroke={isStorm ? '#ef4444' : '#fbbf24'} strokeWidth="1.5" />
                <polygon points="730,355 730,220 800,250 800,390" fill="#451a03" stroke={isStorm ? '#ef4444' : '#fbbf24'} strokeWidth="1.5" opacity="0.85" />
                <line x1="730" y1="220" x2="730" y2="185" stroke={isStorm ? '#ef4444' : '#fbbf24'} strokeWidth="2" filter="url(#laserGlow)" />
                <circle cx="730" cy="185" r="3" fill="#f59e0b" />
              </g>

              {/* Interactive Futuristic Sector HUD Tags */}
              <g font-family="monospace" font-size="10" fontWeight="bold">
                <text x="180" y="445" textAnchor="middle" fill={isDarkMode ? '#a5b4fc' : '#4f46e5'}>
                  SEC-01: ENTERTAINMENT
                </text>
                <text x="330" y="445" textAnchor="middle" fill={isDarkMode ? '#6ee7b7' : '#059669'}>
                  SEC-02: MUTUAL FUNDS
                </text>
                <text x="540" y="455" textAnchor="middle" fill={isDarkMode ? '#7dd3fc' : '#0284c7'}>
                  SEC-03: CENTRAL BANK
                </text>
                <text x="730" y="455" textAnchor="middle" fill={isDarkMode ? '#fde68a' : '#d97706'}>
                  SEC-04: ARCADE ZONE
                </text>
              </g>
            </svg>
          </div>

          {/* Bottom Diagnostics Strip */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>POWER GRID: 99.8% STABLE</span>
            </span>
            <span className="hidden sm:inline">VELOCITY: REAL-TIME SECURE</span>
            <span className="text-cyan-400">STATUS: NOMINAL</span>
          </div>
        </section>

        {/* =======================================================================
            RIGHT PANEL (45% width): FINANCIAL INTELLIGENCE & MARKET TERMINAL
            ======================================================================= */}
        <section
          className={`w-[45%] h-full rounded-2xl border flex flex-col justify-between p-6 relative overflow-hidden transition-all duration-500 ${
            isDarkMode
              ? 'bg-[#0b1220]/90 border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)]'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-mono font-black tracking-widest uppercase">
                ECONOMIC INTELLIGENCE & MARKET INDEX
              </h2>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                gameState.marketRate > 0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : gameState.marketRate < 0
                  ? 'bg-rose-950 text-rose-300 border-rose-700/60'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {gameState.marketRate > 0 ? 'BULL RALLY' : gameState.marketRate < 0 ? 'CORRECTION' : 'STABILIZED'}
            </span>
          </div>

          {/* Market Index Delta Display & Sparkline Curve */}
          <div className="my-3 p-5 rounded-xl border bg-black/20 flex flex-col justify-between border-white/10 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                  MUTUAL FUND INDEX DELTA
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-5xl md:text-6xl font-black font-mono tracking-tight ${
                      gameState.marketRate > 0
                        ? 'text-emerald-400'
                        : gameState.marketRate < 0
                        ? 'text-rose-500'
                        : 'text-slate-300'
                    }`}
                  >
                    {gameState.marketRate > 0 ? `+${gameState.marketRate}%` : `${gameState.marketRate}%`}
                  </span>
                </div>
              </div>

              {/* Rate Trend Direction Pill */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-1.5 text-xs font-mono font-bold ${
                  gameState.marketRate > 0
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                    : gameState.marketRate < 0
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {gameState.marketRate > 0 ? (
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                ) : gameState.marketRate < 0 ? (
                  <TrendingDown className="w-5 h-5 text-rose-500" />
                ) : (
                  <Activity className="w-5 h-5 text-slate-400" />
                )}
                <span>
                  {gameState.marketRate > 0 ? 'EXPANDING' : gameState.marketRate < 0 ? 'CONTRACTING' : 'NEUTRAL'}
                </span>
              </div>
            </div>

            {/* Realistic Financial Sparkline Graph Curve */}
            <div className="w-full h-16 mt-4 relative">
              <svg viewBox="0 0 400 80" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop
                      offset="0%"
                      stopColor={gameState.marketRate >= 0 ? '#10b981' : '#f43f5e'}
                      stopOpacity="0.4"
                    />
                    <stop
                      offset="100%"
                      stopColor={gameState.marketRate >= 0 ? '#10b981' : '#f43f5e'}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>

                {gameState.marketRate >= 0 ? (
                  <>
                    <polygon
                      points="0,65 50,55 100,58 150,42 200,48 250,30 300,35 350,15 400,20 400,80 0,80"
                      fill="url(#chartGradient)"
                    />
                    <polyline
                      points="0,65 50,55 100,58 150,42 200,48 250,30 300,35 350,15 400,20"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />
                  </>
                ) : (
                  <>
                    <polygon
                      points="0,20 50,25 100,35 150,30 200,48 250,42 300,60 350,55 400,75 400,80 0,80"
                      fill="url(#chartGradient)"
                    />
                    <polyline
                      points="0,20 50,25 100,35 150,30 200,48 250,42 300,60 350,55 400,75"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                    />
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* Global Market Intelligence Dispatch (News Wire) */}
          <div className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-2">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                REGULATORY INTELLIGENCE WIRE // BROADCAST
              </span>
            </div>
            <p className="text-sm md:text-base font-semibold leading-relaxed text-white/90">
              {gameState.news}
            </p>
          </div>

          {/* City Macro Economic Telemetry (3 Real Metrics) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl border border-white/10 bg-black/20 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                MONEY SUPPLY
              </span>
              <span className="text-lg md:text-xl font-mono font-black text-emerald-400">
                ₹{stats.totalMoneySupply}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-black/20 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                MF CAPITAL
              </span>
              <span className="text-lg md:text-xl font-mono font-black text-amber-400">
                ₹{stats.totalMfInvested}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-white/10 bg-black/20 text-center">
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                INSURANCE RATIO
              </span>
              <span className="text-lg md:text-xl font-mono font-black text-cyan-400">
                {insuredPercent}%
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================================
          3. BOTTOM FINANCIAL TICKER TAPE (h-[10%])
          ========================================================================= */}
      <footer
        className={`h-[10%] flex items-center overflow-hidden border-t z-30 transition-colors duration-500 ${
          isDarkMode
            ? 'bg-[#090e1a] border-cyan-900/40 text-slate-200'
            : 'bg-white border-slate-300 text-slate-800 shadow-xs'
        }`}
      >
        {/* Left Fixed Badge */}
        <div
          className={`h-full px-6 md:px-8 flex items-center justify-center font-mono font-black text-xs md:text-sm tracking-widest uppercase shrink-0 border-r ${
            isDarkMode
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
              : 'bg-blue-600 text-white border-blue-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-2.5" />
          <span>LIVE AUDIT FEED</span>
        </div>

        {/* Continuous Streaming Marquee Ticker */}
        <div className="flex-1 overflow-hidden whitespace-nowrap py-2 flex items-center font-mono">
          <div className="animate-marquee inline-block">
            <span className="text-sm md:text-base font-bold tracking-wide">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <span key={tx.id || idx} className="mx-4">
                    <span className="opacity-60 text-xs">[{tx.station}]</span>{' '}
                    <span className="font-black text-white">{tx.citizens?.name || 'Citizen'}</span>:{' '}
                    <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>{' '}
                    <span className="opacity-50 text-xs">({tx.description})</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))
              ) : (
                <span>
                  • ENTERTAINMENT: YOUTUBE STATIONS ACTIVE &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;
                  • TRAVEL ARENA: GOOGLE EARTH TOURS ACCESSIBLE &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;
                  • MUTUAL FUNDS: REAL-TIME DEPOSIT & CASH-OUT LIQUIDATION OPEN &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;
                  • CENTRAL BANK: DEBIT CARD ACTIVATIONS & HOURLY WAGES &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;
                  • ARCADE: MULTIPLAYER GAMING TERMINALS SYNCHRONIZED
                </span>
              )}
              &nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp; 📢 {gameState.news}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
