'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function ProjectorPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [gameState, setGameState] = useState({
    weather: 'sunny',
    marketRate: 0,
    news: 'Welcome to Sim-City. Markets are open and trading is active.',
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
  const [activeAlert, setActiveAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [bubbleSecondsRemaining, setBubbleSecondsRemaining] = useState(0);

  const [secondsRemaining, setSecondsRemaining] = useState(50 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const sirenAudioRef = useRef(null);
  const chaChingAudioRef = useRef(null);
  const bgmAudioRef = useRef(null);

  const prevWeatherRef = useRef(null);
  const prevMarketRateRef = useRef(null);
  const prevBubbleActiveRef = useRef(null);
  const alertTimeoutRef = useRef(null);

  const isStorm = gameState.weather === 'storm';
  const isEmergencyTime = secondsRemaining <= 5 * 60;

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

  const triggerPopAlert = (alertData, duration = 8000) => {
    if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    setActiveAlert(alertData);
    alertTimeoutRef.current = setTimeout(() => {
      setActiveAlert(null);
    }, duration);
  };

  const syncServerState = async () => {
    try {
      const res = await fetch('/api/admin');
      const data = await res.json();
      if (data.success && data.gameState) {
        const newWeather = data.gameState.weather_status || 'sunny';
        const newRate = Number(data.gameState.market_rate || 0);
        const newNews = data.gameState.news_text || 'Markets operating normally.';

        if (prevWeatherRef.current !== null) {
          if (prevWeatherRef.current !== 'storm' && newWeather === 'storm') {
            playSiren();
            triggerPopAlert({
              type: 'disaster',
              title: 'Severe Storm Alert',
              news: newNews,
              subtext: 'Uninsured citizens have been fined Rs 150 for property damage. Insured citizens paid Rs 0.',
            }, 9000);
          } else if (prevWeatherRef.current === 'storm' && newWeather === 'sunny') {
            stopSiren();
            playChaChing();
            triggerPopAlert({
              type: 'calm',
              title: 'Storm Cleared',
              news: 'Skies are clear across Sim-City. All stations and trading are back to normal.',
              subtext: 'Citizens can resume regular financial operations safely.',
            }, 7000);
          }
        }

        if (prevMarketRateRef.current !== null && prevMarketRateRef.current !== newRate) {
          if (newRate > prevMarketRateRef.current) {
            playChaChing();
            triggerPopAlert({
              type: 'surge',
              title: data.gameState.bubble_active
                ? '5-Minute Tech Surge Launched (+25%)'
                : 'Market Surge Alert',
              rate: newRate,
              news: newNews,
              subtext: data.gameState.bubble_active
                ? '5-minute countdown running. Cash out mutual funds before the bubble bursts.'
                : `Mutual funds revalued across Sim-City (+${newRate}%).`,
            }, 8000);
          } else if (newRate < prevMarketRateRef.current) {
            if (prevBubbleActiveRef.current && !data.gameState.bubble_active) {
              playSiren();
            }
            triggerPopAlert({
              type: 'drop',
              title: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? '5-Minute Bubble Burst (-30%)'
                : 'Market Correction Alert',
              rate: newRate,
              news: newNews,
              subtext: prevBubbleActiveRef.current && !data.gameState.bubble_active
                ? 'The tech bubble has collapsed. Held units lost 30%. Liquidated funds preserved gains.'
                : `Mutual funds adjusted downward (${newRate}%).`,
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

  useEffect(() => {
    syncServerState();

    const channel = supabase
      .channel('projector-shadcn-sync')
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
      className={`w-screen h-screen overflow-hidden flex flex-col select-none transition-colors duration-200 font-sans relative ${
        isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <audio ref={sirenAudioRef} src="/sounds/siren-thunder.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />
      <audio ref={bgmAudioRef} src="/sounds/city-bgm.mp3" preload="auto" loop />

      {/* POP-UP EVENT ALERT MODAL (shadcn Card style, zero emoji clutter) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm pointer-events-auto"
          >
            <Card
              className={`w-full max-w-2xl border-2 shadow-2xl p-6 text-center ${
                activeAlert.type === 'disaster' || activeAlert.type === 'drop'
                  ? 'border-red-600 bg-[#160d11]'
                  : activeAlert.type === 'surge'
                  ? 'border-emerald-600 bg-[#0d1712]'
                  : 'border-blue-600 bg-[#0d1422]'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <Badge
                  variant={
                    activeAlert.type === 'disaster' || activeAlert.type === 'drop'
                      ? 'danger'
                      : activeAlert.type === 'surge'
                      ? 'success'
                      : 'default'
                  }
                  className="uppercase tracking-wider px-3 py-1 font-mono text-xs"
                >
                  {activeAlert.title}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveAlert(null)}
                  className="h-8 px-2 text-slate-400 hover:text-white"
                >
                  Dismiss
                </Button>
              </div>

              {activeAlert.rate !== undefined && (
                <div className="my-3 font-mono font-bold text-6xl tracking-tight">
                  <span className={activeAlert.rate > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {activeAlert.rate > 0 ? `+${activeAlert.rate}%` : `${activeAlert.rate}%`}
                  </span>
                </div>
              )}

              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                {activeAlert.news}
              </h2>

              {activeAlert.subtext && (
                <p className="text-sm text-slate-300 mt-2 font-normal">
                  {activeAlert.subtext}
                </p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER HUD (h-[10%]) */}
      <header
        className={`h-[10%] px-6 md:px-8 flex items-center justify-between border-b transition-colors z-20 ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight">
              Sim-City Economy
            </h1>
            <Badge variant="success" className="text-[10px] px-2 py-0.5">
              Live
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-5 bg-slate-700" />

          <Badge
            variant={isStorm ? 'danger' : 'outline'}
            className="text-xs font-medium"
          >
            {isStorm ? 'Storm Warning (Uninsured fined ₹150)' : 'Clear Weather'}
          </Badge>
        </div>

        {gameState.bubble_active && (
          <div className="flex items-center gap-2">
            <Badge variant="danger" className="text-xs px-3 py-1 font-mono animate-pulse">
              5-Min Tech Surge (+25%): {formatBubbleTimer(bubbleSecondsRemaining)} remaining to cash out
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSound}
            className="text-xs h-8"
          >
            {soundEnabled ? 'Audio On' : 'Muted'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="text-xs h-8"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>

          <Button variant="default" size="sm" asChild className="text-xs h-8">
            <Link href="/instructions" target="_blank">
              Rules
            </Link>
          </Button>

          <div
            className={`px-3 py-1 rounded-md border font-mono font-bold text-lg ${
              isEmergencyTime
                ? 'bg-red-600 border-red-500 text-white animate-pulse'
                : isDarkMode
                ? 'bg-slate-900 border-slate-700 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {gameState.clock}
          </div>
        </div>
      </header>

      {/* MAIN SCREEN (h-[80%]) */}
      <main className="h-[80%] flex w-full p-4 md:p-6 gap-5 overflow-hidden">
        {/* LEFT COLUMN: FINANCIAL MARKET & MACRO (40% width) */}
        <section className="w-[40%] h-full flex flex-col justify-between gap-4">
          <Card className={isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Mutual Fund Index</CardTitle>
                <CardDescription className="text-xs">Dynamic market return rate</CardDescription>
              </div>
              <Badge
                variant={
                  gameState.marketRate > 0
                    ? 'success'
                    : gameState.marketRate < 0
                    ? 'danger'
                    : 'outline'
                }
                className="font-mono text-xs"
              >
                {gameState.marketRate > 0 ? 'Bull Market' : gameState.marketRate < 0 ? 'Market Dip' : 'Stable'}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <div className="my-2 flex items-baseline justify-between">
                <div>
                  <span
                    className={`text-6xl font-mono font-bold tracking-tight ${
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

                <div className="w-36 h-12">
                  <svg viewBox="0 0 150 50" className="w-full h-full" preserveAspectRatio="none">
                    {gameState.marketRate >= 0 ? (
                      <polyline
                        points="0,40 30,35 60,25 90,30 120,15 150,10"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                      />
                    ) : (
                      <polyline
                        points="0,10 30,15 60,25 90,20 120,38 150,45"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="2.5"
                      />
                    )}
                  </svg>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                Invested citizens gain or lose value based on this rate. Cash out at the MF station to lock in profits.
              </p>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  City Market News
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">Broadcast</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <p className="text-base font-semibold text-white leading-snug">
                &ldquo;{gameState.news}&rdquo;
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-3">
            <Card className={`p-3 text-center ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-medium text-slate-400 block mb-0.5">
                Total Cash
              </span>
              <span className="text-lg font-mono font-bold text-emerald-400">
                ₹{stats.totalMoneySupply}
              </span>
            </Card>

            <Card className={`p-3 text-center ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-medium text-slate-400 block mb-0.5">
                Fund Capital
              </span>
              <span className="text-lg font-mono font-bold text-amber-400">
                ₹{stats.totalMfInvested}
              </span>
            </Card>

            <Card className={`p-3 text-center ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-[10px] uppercase font-medium text-slate-400 block mb-0.5">
                Insured
              </span>
              <span className="text-lg font-mono font-bold text-cyan-400">
                {insuredPercent}%
              </span>
            </Card>
          </div>
        </section>

        {/* RIGHT COLUMN: STATIONS & LIVE CITIZEN LEADERBOARD (60% width) */}
        <section className="w-[60%] h-full flex flex-col justify-between gap-4">
          {/* Active Experiential Stations Grid */}
          <Card className={isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                  Experiential Stations
                </CardTitle>
                <CardDescription className="text-xs">Laptop-based services and activities</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Entertainment</span>
                    <Badge variant="outline" className="text-[9px]">₹100 - ₹200</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">YouTube video and song requests on station laptop.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Travel Arena</span>
                    <Badge variant="outline" className="text-[9px]">₹100 - ₹300</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">3D Google Earth country flyovers and tours.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Arcade Zone</span>
                    <Badge variant="outline" className="text-[9px]">₹100 / +₹200</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Browser minigames with high-score cash prize.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Mutual Funds</span>
                    <Badge variant="outline" className="text-[9px]">Invest / Cash Out</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Deposit liquid cash or liquidate 50%/100% units.</p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">Central Bank & Insurance</span>
                    <Badge variant="outline" className="text-[9px]">Wages & Insurance</Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Collect +₹300 hourly wages, buy -₹150 storm insurance, and card onboarding.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Citizen Leaderboard using shadcn Table */}
          <Card className={`flex-1 flex flex-col justify-between overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-semibold uppercase tracking-wider">
                  Citizen Leaderboard
                </CardTitle>
                <CardDescription className="text-xs">Top citizens ranked by total net worth</CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {topCitizens.length} Active
              </Badge>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 overflow-y-auto">
              {topCitizens.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <p className="text-sm font-medium text-slate-300">No citizens registered in this batch yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    As volunteers scan cards at the Bank Desk, top portfolios will update automatically.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="w-12 text-slate-400 font-mono text-xs">Rank</TableHead>
                      <TableHead className="text-slate-400 text-xs">Citizen</TableHead>
                      <TableHead className="text-right text-slate-400 text-xs font-mono">Cash</TableHead>
                      <TableHead className="text-right text-slate-400 text-xs font-mono">Mutual Funds</TableHead>
                      <TableHead className="text-right text-emerald-400 text-xs font-mono font-bold">Net Worth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topCitizens.map((citizen, idx) => (
                      <TableRow key={citizen.id || idx} className="border-slate-800/60">
                        <TableCell className="font-mono text-xs font-bold">
                          <Badge variant={idx === 0 ? 'default' : 'secondary'} className="px-1.5 py-0 text-[10px]">
                            {idx + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs text-white">
                          <span>{citizen.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            {citizen.qr_id} {citizen.has_insurance && '• Insured'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-slate-300">
                          ₹{citizen.balance}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs text-amber-400">
                          ₹{citizen.mf_invested}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-bold text-emerald-400">
                          ₹{citizen.netWorth}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* BOTTOM FOOTER: AUDIT TICKER TAPE (h-[10%]) */}
      <footer
        className={`h-[10%] flex items-center overflow-hidden border-t z-30 transition-colors ${
          isDarkMode ? 'bg-[#0d1322] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="h-full px-5 flex items-center justify-center font-bold text-xs uppercase tracking-wider shrink-0 border-r border-slate-800 bg-slate-800 text-slate-200">
          Live Activity
        </div>

        <div className="flex-1 overflow-hidden whitespace-nowrap py-2 flex items-center font-mono">
          <div className="animate-marquee inline-block">
            <span className="text-xs md:text-sm tracking-wide">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx, idx) => (
                  <span key={tx.id || idx} className="mx-4">
                    <span className="text-slate-400 font-normal">[{tx.station}]</span>{' '}
                    <span className="font-bold text-white">{tx.citizens?.name || 'Citizen'}</span>:{' '}
                    <span className={tx.amount > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {tx.amount > 0 ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                    </span>{' '}
                    <span className="text-slate-500 text-xs">({tx.description})</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))
              ) : (
                <span>
                  [Entertainment] YouTube station active &nbsp;&nbsp;•&nbsp;&nbsp;
                  [Travel] 3D Google Earth tours open &nbsp;&nbsp;•&nbsp;&nbsp;
                  [Mutual Funds] Deposit and cash out available &nbsp;&nbsp;•&nbsp;&nbsp;
                  [Central Bank] Hourly wages and insurance desk active &nbsp;&nbsp;•&nbsp;&nbsp;
                  [Arcade] Minigame challenges ready
                </span>
              )}
              &nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp; {gameState.news}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
