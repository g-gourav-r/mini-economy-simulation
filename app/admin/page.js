'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  TrendingUp,
  TrendingDown,
  CloudLightning,
  Sun,
  ShieldAlert,
  Activity,
  Users,
  Wallet,
  Clock,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowLeft,
  FolderPlus,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [session, setSession] = useState({
    id: 'SESSION-DEFAULT',
    name: 'General Session',
  });
  const [gameState, setGameState] = useState({
    market_rate: 0,
    weather_status: 'sunny',
    news_text: 'Welcome to the Mini-Economy! Markets are open.',
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
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calamityArmed, setCalamityArmed] = useState(false);
  const [customRate, setCustomRate] = useState(10);
  const [customNews, setCustomNews] = useState('');
  const [statusNotification, setStatusNotification] = useState(null);

  // Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

  // Bubble countdown remaining seconds
  const [bubbleSecondsRemaining, setBubbleSecondsRemaining] = useState(0);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success) {
        if (data.session) setSession(data.session);
        if (data.gameState) setGameState(data.gameState);
        if (data.stats) setStats(data.stats);
        if (data.recentTransactions) setTransactions(data.recentTransactions);
      }
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    }
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime subscription
    const channel = supabase
      .channel('admin-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_state' },
        (payload) => {
          if (payload.new) {
            setGameState(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // 4-second polling backup
    const interval = setInterval(fetchData, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  // Bubble countdown timer updater
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
      if (diff === 0 && gameState.bubble_active) {
        // Auto-refresh when bubble timer expires
        setTimeout(fetchData, 1000);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [gameState.bubble_active, gameState.bubble_ends_at]);

  // Update Market Rate & News
  const handleMarketUpdate = async (rate, news) => {
    setIsLoading(true);
    setStatusNotification(null);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_market',
          rate,
          news,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification({
          type: 'success',
          message: `Market updated to ${rate > 0 ? '+' : ''}${rate}%. Citizens' investments adjusted!`,
        });
        fetchData();
      } else {
        setStatusNotification({ type: 'error', message: data.error || 'Failed to update market.' });
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Network error communicating with server.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Launch 5-Minute Speculative Bubble Cycle
  const handleLaunchBubble = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'launch_bubble' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification({
          type: 'success',
          message: '🚀 5-Minute Bubble Cycle launched! Projector is counting down from 05:00!',
        });
        fetchData();
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Failed to launch bubble cycle.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Early Burst Bubble
  const handleBurstBubble = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'burst_bubble' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification({
          type: 'storm',
          message: '💥 Bubble burst early! Market plunged -30% and mutual funds crashed!',
        });
        fetchData();
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Failed to burst bubble.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Calamity (Double-click safety logic)
  const handleCalamityClick = async () => {
    if (!calamityArmed) {
      setCalamityArmed(true);
      setTimeout(() => setCalamityArmed(false), 6000);
      return;
    }

    setIsLoading(true);
    setCalamityArmed(false);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_calamity' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification({
          type: 'storm',
          message: `⚡ DISASTER TRIGGERED! Fined ${data.result.uninsured_penalized_count} uninsured citizens (₹${data.result.total_fined_amount} total).`,
        });
        fetchData();
      } else {
        setStatusNotification({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Failed to trigger calamity.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Sunshine / Resolve Calamity
  const handleResolveCalamity = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve_calamity' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotification({
          type: 'success',
          message: '☀️ Storm cleared! Sunny skies restored to the city.',
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Start New Session
  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_session',
          sessionName: newSessionName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSession(data.session);
        setIsSessionModalOpen(false);
        setNewSessionName('');
        setStatusNotification({
          type: 'success',
          message: `Started new session "${data.session.name}"! Clean slate ready.`,
        });
        fetchData();
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Failed to start session.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Purge All Junk Test Data
  const handlePurgeAll = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge_all' }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPurgeModalOpen(false);
        setStatusNotification({
          type: 'success',
          message: 'All junk test data purged! Database reset to pristine state.',
        });
        fetchData();
      }
    } catch (err) {
      setStatusNotification({ type: 'error', message: 'Failed to purge database.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBubbleTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Hub</span>
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 leading-tight">
                Game Master Control
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-gray-500">Active Batch:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                  {session.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSessionModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Batch</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPurgeModalOpen(true)}
              className="px-3 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Purge Junk Data</span>
            </button>

            <Link
              href="/projector"
              target="_blank"
              className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Projector</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            <button
              type="button"
              onClick={fetchData}
              className="p-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-gray-600 hover:text-gray-900 transition-colors shadow-xs cursor-pointer active:scale-95"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Alert Notification Toast */}
        {statusNotification && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-sm font-semibold transition-all shadow-sm ${
              statusNotification.type === 'storm'
                ? 'bg-red-50 border-red-200 text-red-800'
                : statusNotification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span>{statusNotification.message}</span>
            <button
              type="button"
              onClick={() => setStatusNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Citizens
            </span>
            <p className="text-2xl font-black text-gray-900 mt-1 font-mono">
              {stats.totalCitizens}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              Money Supply
            </span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
              ₹ {stats.totalMoneySupply}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              MF Invested Volume
            </span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
              ₹ {stats.totalMfInvested}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
              {gameState.weather_status === 'storm' ? (
                <CloudLightning className="w-3.5 h-3.5 text-red-600 animate-bounce" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              )}
              Weather
            </span>
            <p
              className={`text-2xl font-black mt-1 uppercase tracking-tight ${
                gameState.weather_status === 'storm' ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              {gameState.weather_status}
            </p>
          </div>
        </div>

        {/* 5-MINUTE SPECULATIVE BUBBLE CYCLE CARD */}
        <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-indigo-600" />
                <h2 className="text-lg font-black text-gray-900">
                  5-Minute Speculative Bubble Cycle
                </h2>
                {gameState.bubble_active && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white animate-pulse">
                    ACTIVE PEAK
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl font-medium">
                Launches a breaking +25% tech surge. Broadcasts news alert to Projector, runs a 5:00 countdown, and automatically bursts at 00:00 with a -30% crash. Kids who cash out before the burst keep their profits!
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {gameState.bubble_active ? (
                <div className="flex items-center gap-3">
                  <div className="bg-white border-2 border-indigo-300 rounded-xl px-4 py-2 text-center shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-gray-500 block">
                      Auto-Burst In
                    </span>
                    <span className="text-2xl font-black font-mono text-indigo-700">
                      {formatBubbleTimer(bubbleSecondsRemaining)}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleBurstBubble}
                    className="py-3 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#991b1b] active:translate-y-1 active:shadow-none cursor-pointer"
                  >
                    💥 Burst Now (-30%)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleLaunchBubble}
                  className="py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_4px_0_#3730a3] active:translate-y-1 active:shadow-none cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Launch 5-Min Bubble Cycle (+25%)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Control Grid (Sections 1 & 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section 1: Market Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-gray-900">Market Controls</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Current Rate:</span>
                  <span
                    className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                      gameState.market_rate > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : gameState.market_rate < 0
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {gameState.market_rate > 0 ? `+${gameState.market_rate}%` : `${gameState.market_rate}%`}
                  </span>
                </div>
              </div>

              {/* Market Preset Trigger Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      10,
                      '🐂 BULL RUN: City Index Fund rallies +10%! All Mutual Funds gain value!'
                    )
                  }
                  className="p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <TrendingUp className="w-5 h-5 mb-1 text-emerald-600" />
                  <span className="text-sm font-black">+10% Bull</span>
                  <span className="text-[10px] opacity-80">Rally</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      20,
                      '🚀 HISTORIC SURGE: Green energy boom spikes Mutual Funds by +20%!'
                    )
                  }
                  className="p-3.5 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 mb-1 text-cyan-600" />
                  <span className="text-sm font-black">+20% Surge</span>
                  <span className="text-[10px] opacity-80">Mega Boom</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      -5,
                      '📉 MARKET DIP: Supply chain slowdown drops Mutual Funds by -5%.'
                    )
                  }
                  className="p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <TrendingDown className="w-5 h-5 mb-1 text-amber-600" />
                  <span className="text-sm font-black">-5% Dip</span>
                  <span className="text-[10px] opacity-80">Correction</span>
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      -15,
                      '💥 MARKET CRASH: Tech bubble deflates! Mutual Funds plummet -15%!'
                    )
                  }
                  className="p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold flex flex-col items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
                >
                  <Zap className="w-5 h-5 mb-1 text-rose-600" />
                  <span className="text-sm font-black">-15% Crash</span>
                  <span className="text-[10px] opacity-80">Panic Sale</span>
                </button>
              </div>

              {/* Custom Market Adjustment & News Broadcast */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Broadcast Custom Market Event
                </span>
                <div className="flex gap-3">
                  <div className="w-28 shrink-0">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Rate %</label>
                    <input
                      type="number"
                      value={customRate}
                      onChange={(e) => setCustomRate(parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Headline News Broadcast</label>
                    <input
                      type="text"
                      placeholder="e.g. Electric Vehicle manufacturer reports record profits!"
                      value={customNews}
                      onChange={(e) => setCustomNews(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleMarketUpdate(customRate, customNews)}
                  className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer active:scale-95"
                >
                  Publish Market Change & Update Kid Portfolios
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Calamity Controls (5 Cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-gray-900">Disaster & Calamity</h2>
                </div>
                <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  Two-Click Safety
                </span>
              </div>

              {/* Massive Warning-Striped Disaster Button */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCalamityClick}
                  className={`w-full py-6 px-6 rounded-2xl font-black text-lg uppercase tracking-wider text-white shadow-xl transition-all cursor-pointer relative overflow-hidden select-none active:scale-[0.98] ${
                    calamityArmed
                      ? 'bg-red-600 animate-pulse border-4 border-red-800'
                      : 'bg-red-600 hover:bg-red-700 border-2 border-red-700 shadow-[0_5px_0_#991b1b]'
                  }`}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                    <CloudLightning className="w-7 h-7" />
                    <span>
                      {calamityArmed
                        ? '⚠️ CONFIRM DISASTER TRIGGER!'
                        : 'TRIGGER STORM DISASTER'}
                    </span>
                    <span className="text-[11px] font-semibold opacity-90 tracking-normal normal-case">
                      {calamityArmed
                        ? 'CLICK AGAIN TO EXECUTE (6s TIMEOUT)'
                        : 'Deducts damage fine from Uninsured Citizens'}
                    </span>
                  </div>
                </button>

                {/* Restore Sunshine Button */}
                {gameState.weather_status === 'storm' && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResolveCalamity}
                    className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_3px_0_#059669] active:translate-y-1 active:shadow-none cursor-pointer"
                  >
                    <Sun className="w-4 h-4" />
                    <span>Resolve Storm & Restore Sunny Skies</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
              <span>Uninsured:</span>
              <strong className="text-red-600 font-mono text-xs">{stats.uninsuredCount} Citizens</strong>
            </div>
          </div>
        </div>

        {/* Section 3: Live Feed Table (Recent 15 Transactions) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Live Transaction Feed</h2>
            </div>
            <span className="text-xs text-gray-500">Auto-updates in real time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Time</th>
                  <th className="py-3 px-4">Citizen</th>
                  <th className="py-3 px-4">Station</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 rounded-r-lg">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      No transactions recorded yet in this batch. Volunteers are scanning debit cards...
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isDebit = tx.amount < 0;
                    const date = new Date(tx.created_at);
                    const timeStr = date.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {timeStr}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-gray-900">
                            {tx.citizens?.name || 'Citizen'}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400">
                            {tx.citizens?.qr_id || tx.citizen_id?.slice(0, 8)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                              tx.station === 'Entertainment'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : tx.station === 'Travel'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : tx.station === 'Scam'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : tx.station === 'MF'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : tx.station === 'Arcade'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : tx.station === 'Calamity'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {tx.station}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm">
                          <span className={isDebit ? 'text-rose-600' : 'text-emerald-600'}>
                            {isDebit ? `-₹ ${Math.abs(tx.amount)}` : `+₹ ${tx.amount}`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {tx.description}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal 1: Start New Session */}
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <FolderPlus className="w-5 h-5" />
                <h3 className="text-lg font-black text-gray-900">Start New Batch / Session</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Creates a clean, isolated session for a new group of students (e.g. &ldquo;Batch 2 - Grade 8A&rdquo;). Previous session records remain safely archived.
              </p>

              <form onSubmit={handleStartSession} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Batch / Class Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Batch 2 - Grade 8B"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSessionModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Create & Switch Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Purge Junk Test Data */}
        {isPurgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 mb-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-black text-gray-900">Purge Junk Test Data</h3>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                This will wipe out all temporary test citizens, test transactions, and reset the database state to pristine zero for the upcoming live simulation.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handlePurgeAll}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Confirm Full Purge
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
