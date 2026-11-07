'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  FolderPlus,
  Trash2,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function AdminDashboardPage() {
  const [session, setSession] = useState({
    id: 'SESSION-DEFAULT',
    name: 'General Session',
  });
  const [gameState, setGameState] = useState({
    market_rate: 0,
    weather_status: 'sunny',
    news_text: 'Welcome to the Mini-Economy. Markets are open.',
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
          message: `Market updated to ${rate > 0 ? '+' : ''}${rate}%. Citizens' investments adjusted.`,
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
          message: '5-Minute Bubble Cycle launched. Countdown is active on the Projector.',
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
          message: 'Bubble burst early. Market plunged -30% and mutual funds crashed.',
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
          message: `Storm disaster triggered. Fined ${data.result.uninsured_penalized_count} uninsured citizens (₹${data.result.total_fined_amount} total).`,
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
          message: 'Storm resolved. Clear conditions restored across the city.',
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
          message: `Started new session "${data.session.name}". Fresh state ready.`,
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
          message: 'All test data purged. Database reset to clean state.',
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header & Navigation */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="flex items-center gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Hub</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-neutral-900 leading-tight">
                Game Master Control
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-neutral-500 font-medium">Active Batch:</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {session.name}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsSessionModalOpen(true)}
              className="flex items-center gap-1.5"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Batch</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPurgeModalOpen(true)}
              className="border-neutral-300 text-neutral-700 hover:text-neutral-900 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-neutral-500" />
              <span>Purge Test Data</span>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/projector" target="_blank" className="flex items-center gap-1.5">
                <span>Projector</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              title="Refresh"
              className="text-neutral-600 hover:text-neutral-900"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Alert Notification */}
        {statusNotification && (
          <Alert
            variant={
              statusNotification.type === 'error' || statusNotification.type === 'storm'
                ? 'destructive'
                : 'default'
            }
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {statusNotification.type === 'error' || statusNotification.type === 'storm' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <AlertDescription className="font-medium text-sm">
                {statusNotification.message}
              </AlertDescription>
            </div>
            <button
              type="button"
              onClick={() => setStatusNotification(null)}
              className="text-xs opacity-60 hover:opacity-100 p-1 ml-4"
            >
              Close
            </button>
          </Alert>
        )}

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase font-medium text-neutral-500 tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-neutral-600" />
                Citizens
              </span>
              <p className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                {stats.totalCitizens}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase font-medium text-neutral-500 tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                Money Supply
              </span>
              <p className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                ₹ {stats.totalMoneySupply}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase font-medium text-neutral-500 tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-neutral-600" />
                Mutual Funds Invested
              </span>
              <p className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                ₹ {stats.totalMfInvested}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <span className="text-xs uppercase font-medium text-neutral-500 tracking-wider flex items-center gap-1.5">
                {gameState.weather_status === 'storm' ? (
                  <CloudLightning className="w-3.5 h-3.5 text-amber-600" />
                ) : (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                )}
                Conditions
              </span>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={gameState.weather_status === 'storm' ? 'destructive' : 'secondary'}
                  className="text-xs uppercase font-semibold"
                >
                  {gameState.weather_status === 'storm' ? 'Storm Disaster' : 'Clear & Stable'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Speculative Bubble Cycle Card */}
        <Card className="border-neutral-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-neutral-700" />
                  <CardTitle className="text-base font-bold text-neutral-900">
                    5-Minute Speculative Bubble Cycle
                  </CardTitle>
                  {gameState.bubble_active && (
                    <Badge variant="destructive" className="font-semibold text-xs">
                      Active Cycle
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-neutral-600 mt-1 max-w-2xl">
                  Simulates a rapid market boom (+25%) with a 5-minute countdown on the main screen, followed by an automatic market correction (-30%). Citizens who withdraw beforehand retain their earnings.
                </CardDescription>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {gameState.bubble_active ? (
                  <div className="flex items-center gap-3">
                    <div className="border border-neutral-200 bg-neutral-50 rounded-lg px-3 py-1.5 text-center">
                      <span className="text-[10px] font-medium uppercase text-neutral-500 block">
                        Correction In
                      </span>
                      <span className="text-xl font-bold font-mono text-neutral-900">
                        {formatBubbleTimer(bubbleSecondsRemaining)}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isLoading}
                      onClick={handleBurstBubble}
                    >
                      Burst Bubble Now (-30%)
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    disabled={isLoading}
                    onClick={handleLaunchBubble}
                    className="flex items-center gap-1.5"
                  >
                    <span>Launch 5-Min Bubble Cycle (+25%)</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Control Grid (Market & Calamity) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Market Controls */}
          <Card className="lg:col-span-7 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-neutral-700" />
                  <CardTitle className="text-base font-bold">Market Controls</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Current Yield:</span>
                  <Badge
                    variant={
                      gameState.market_rate > 0
                        ? 'default'
                        : gameState.market_rate < 0
                        ? 'destructive'
                        : 'secondary'
                    }
                    className="font-mono text-xs font-semibold"
                  >
                    {gameState.market_rate > 0
                      ? `+${gameState.market_rate}%`
                      : `${gameState.market_rate}%`}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      10,
                      'Market Bull Run: Index Fund rallies +10%. All Mutual Funds gain value.'
                    )
                  }
                  className="h-auto py-3 flex flex-col items-center justify-center text-center hover:bg-neutral-50"
                >
                  <TrendingUp className="w-4 h-4 mb-1 text-emerald-600" />
                  <span className="text-xs font-bold text-neutral-900">+10% Rally</span>
                  <span className="text-[10px] text-neutral-500">Bull Market</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      20,
                      'Tech Sector Surge: Green energy boom spikes Mutual Funds by +20%.'
                    )
                  }
                  className="h-auto py-3 flex flex-col items-center justify-center text-center hover:bg-neutral-50"
                >
                  <TrendingUp className="w-4 h-4 mb-1 text-blue-600" />
                  <span className="text-xs font-bold text-neutral-900">+20% Surge</span>
                  <span className="text-[10px] text-neutral-500">Growth Boom</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      -5,
                      'Market Dip: Supply chain slowdown drops Mutual Funds by -5%.'
                    )
                  }
                  className="h-auto py-3 flex flex-col items-center justify-center text-center hover:bg-neutral-50"
                >
                  <TrendingDown className="w-4 h-4 mb-1 text-amber-600" />
                  <span className="text-xs font-bold text-neutral-900">-5% Dip</span>
                  <span className="text-[10px] text-neutral-500">Correction</span>
                </Button>

                <Button
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    handleMarketUpdate(
                      -15,
                      'Market Plunge: Tech bubble deflates. Mutual Funds decline -15%.'
                    )
                  }
                  className="h-auto py-3 flex flex-col items-center justify-center text-center hover:bg-neutral-50"
                >
                  <TrendingDown className="w-4 h-4 mb-1 text-rose-600" />
                  <span className="text-xs font-bold text-neutral-900">-15% Plunge</span>
                  <span className="text-[10px] text-neutral-500">Downturn</span>
                </Button>
              </div>

              {/* Custom Adjustment & News Broadcast */}
              <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200 space-y-3">
                <span className="text-xs font-medium text-neutral-600 block">
                  Broadcast Custom Market Event
                </span>
                <div className="flex gap-2.5">
                  <div className="w-24 shrink-0">
                    <label className="text-[11px] font-medium text-neutral-500 block mb-1">
                      Rate (%)
                    </label>
                    <Input
                      type="number"
                      value={customRate}
                      onChange={(e) => setCustomRate(parseInt(e.target.value, 10))}
                      className="h-9 font-mono text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[11px] font-medium text-neutral-500 block mb-1">
                      News Broadcast Headline
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Electric Vehicle manufacturer reports record earnings."
                      value={customNews}
                      onChange={(e) => setCustomNews(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={isLoading}
                  onClick={() => handleMarketUpdate(customRate, customNews)}
                  className="w-full"
                >
                  Publish Market Change & Revalue Portfolios
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calamity Controls */}
          <Card className="lg:col-span-5 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-neutral-700" />
                  <CardTitle className="text-base font-bold">Disaster Simulation</CardTitle>
                </div>
                <Badge variant="outline" className="text-xs font-medium">
                  Two-Step Confirmation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  variant={calamityArmed ? 'destructive' : 'default'}
                  disabled={isLoading}
                  onClick={handleCalamityClick}
                  className="w-full py-6 flex flex-col items-center justify-center gap-1 text-center h-auto"
                >
                  <CloudLightning className="w-5 h-5" />
                  <span className="font-bold text-sm">
                    {calamityArmed ? 'Confirm Disaster Trigger' : 'Trigger Storm Disaster'}
                  </span>
                  <span className="text-[11px] font-normal opacity-80">
                    {calamityArmed
                      ? 'Click again within 6 seconds to execute'
                      : 'Applies penalty to uninsured citizens'}
                  </span>
                </Button>

                {gameState.weather_status === 'storm' && (
                  <Button
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleResolveCalamity}
                    className="w-full flex items-center justify-center gap-2 text-xs font-semibold"
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Resolve Disaster & Restore Clear Skies</span>
                  </Button>
                )}
              </div>

              <Separator />

              <div className="text-xs text-neutral-500 flex items-center justify-between">
                <span>Uninsured Citizens:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {stats.uninsuredCount} of {stats.totalCitizens}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Transaction Feed Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-neutral-700" />
                <CardTitle className="text-base font-bold">Live Transaction Log</CardTitle>
              </div>
              <span className="text-xs text-neutral-500">Auto-updates in real time</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px]">Time</TableHead>
                    <TableHead>Citizen</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-neutral-500 text-xs">
                        No transactions recorded yet in this batch.
                      </TableCell>
                    </TableRow>
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
                        <TableRow key={tx.id}>
                          <TableCell className="font-mono text-xs text-neutral-500 flex items-center gap-1.5 py-3">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {timeStr}
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-neutral-900 text-xs">
                              {tx.citizens?.name || 'Citizen'}
                            </p>
                            <p className="text-[10px] font-mono text-neutral-400">
                              {tx.citizens?.qr_id || tx.citizen_id?.slice(0, 8)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-medium">
                              {tx.station}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono font-bold text-xs">
                            <span className={isDebit ? 'text-neutral-900' : 'text-emerald-600'}>
                              {isDebit ? `-₹ ${Math.abs(tx.amount)}` : `+₹ ${tx.amount}`}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-neutral-600">
                            {tx.description}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal 1: Start New Session */}
        {isSessionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <Card className="max-w-md w-full shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-4 h-4 text-neutral-700" />
                  <CardTitle className="text-base font-bold">Start New Batch / Session</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Creates an isolated session for a new group of students. Previous session records remain archived.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStartSession} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Batch or Class Name
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Batch 2 - Grade 8B"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSessionModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={isLoading}>
                      Create Session
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal 2: Purge Junk Test Data */}
        {isPurgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <Card className="max-w-md w-full shadow-xl border-neutral-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-neutral-700" />
                  <CardTitle className="text-base font-bold">Purge Test Data</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  This action clears temporary test citizens and transactions, returning the session to an empty initial state.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPurgeModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                    onClick={handlePurgeAll}
                  >
                    Confirm Purge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
