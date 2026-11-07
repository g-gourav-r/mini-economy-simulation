'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react';

const TABS = [
  { id: 'card', label: '1. Debit Card' },
  { id: 'rewards', label: '2. Experience Stores' },
  { id: 'mf', label: '3. Mutual Funds' },
  { id: 'disaster', label: '4. Storms & Insurance' },
  { id: 'scam', label: '5. Scam Alley' },
  { id: 'quiz', label: '6. Readiness Quiz' },
];

export default function InstructionsPage() {
  const [activeTab, setActiveTab] = useState('card');
  const [soundEnabled, setSoundEnabled] = useState(true);

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
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      <audio ref={beepAudioRef} src="/sounds/beep.mp3" preload="auto" />
      <audio ref={chaChingAudioRef} src="/sounds/cha-ching.mp3" preload="auto" />

      {/* Top Header */}
      <header className="px-6 md:px-10 py-3.5 border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="h-8 text-xs">
            <Link href="/" className="flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub</span>
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Sim-City Student Briefing</h1>
              <Badge variant="outline" className="text-[10px]">5-Minute Guide</Badge>
            </div>
            <span className="text-xs text-slate-400">Rules and interactive simulators before starting</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-xs h-8"
          >
            {soundEnabled ? 'Audio On' : 'Muted'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="text-xs h-8"
          >
            Fullscreen
          </Button>

          <Button variant="default" size="sm" asChild className="text-xs h-8">
            <Link href="/projector" target="_blank">
              Launch Projector
            </Link>
          </Button>
        </div>
      </header>

      {/* Navigation Tabs Bar using shadcn Tabs */}
      <div className="px-6 md:px-10 py-3 border-b border-slate-800 bg-[#0d1322]/50 z-20 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`text-xs h-8 whitespace-nowrap cursor-pointer ${
                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center z-10">
        <AnimatePresence mode="wait">
          {/* TAB 1: YOUR DEBIT CARD */}
          {activeTab === 'card' && (
            <motion.div
              key="tab-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                  Step 1: Your Digital Card
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  You start with <span className="text-emerald-400">₹1,000</span> on your Debit Card
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Every student receives a card printed with a unique QR code. There is no cash in Sim-City — your card is your digital account. Station volunteers will scan it with phone cameras to onboard you, process purchases, and pay wages.
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Keep your card safe:</strong> It holds your liquid balance and tracks your mutual fund holdings.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Instant confirmation:</strong> Scanners beep on detection and play a chime when the balance updates.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Goal:</strong> Manage your spending, invest during market rallies, buy storm insurance, and aim for the top net worth at 50 minutes.</span>
                  </div>
                </div>
              </div>

              {/* Card Simulator */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-[#0f172a] border-slate-800 text-center">
                  <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
                    <Badge variant="outline" className="text-xs">Student Debit Card</Badge>
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  </CardHeader>

                  <div className="my-6">
                    <div className="w-24 h-24 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                      <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">
                        QR-101
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 mt-2 block">
                      Card ID: CARD-101 • Aarav Sharma
                    </span>
                  </div>

                  <Card className="p-3 bg-slate-900 border-slate-800 flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-slate-400">Wallet Balance:</span>
                    <span className="text-2xl font-mono font-bold text-emerald-400">
                      ₹{cardSimBalance}
                    </span>
                  </Card>

                  <Button
                    variant="default"
                    onClick={() => {
                      playBeep();
                      setCardSimScanned(true);
                      setTimeout(() => {
                        playChaChing();
                        setCardSimBalance((prev) => (prev > 200 ? prev - 100 : 1000));
                        setCardSimScanned(false);
                      }, 500);
                    }}
                    className="w-full"
                  >
                    {cardSimScanned ? 'Scanner Reading...' : 'Simulate Scan (-₹100)'}
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 2: EXPERIENTIAL STORES */}
          {activeTab === 'rewards' && (
            <motion.div
              key="tab-rewards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-5"
            >
              <div>
                <Badge variant="outline" className="text-rose-400 border-rose-500/30">
                  Step 2: Experiential Rewards
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                  Spend your money on real laptop activities
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  There are no physical items to buy. Station volunteers have laptops to fulfill your requests:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card
                  onClick={() => {
                    setActiveReward('Entertainment');
                    if (rewardWallet >= 200) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 200);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    activeReward === 'Entertainment'
                      ? 'border-blue-500 bg-[#0f172a]'
                      : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-sm font-semibold">Entertainment</CardTitle>
                    <Badge variant="outline" className="text-[10px]">₹100 - ₹200</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Request any YouTube song or music video to play on the station laptop.
                  </CardDescription>
                </Card>

                <Card
                  onClick={() => {
                    setActiveReward('Travel');
                    if (rewardWallet >= 100) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 100);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    activeReward === 'Travel'
                      ? 'border-blue-500 bg-[#0f172a]'
                      : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-sm font-semibold">Travel Arena</CardTitle>
                    <Badge variant="outline" className="text-[10px]">₹100 - ₹300</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Choose any country, city, or landmark for a 3D Google Earth flyover.
                  </CardDescription>
                </Card>

                <Card
                  onClick={() => {
                    setActiveReward('Arcade');
                    if (rewardWallet >= 100) {
                      playChaChing();
                      setRewardWallet((prev) => prev - 100);
                    }
                  }}
                  className={`p-4 cursor-pointer transition-all ${
                    activeReward === 'Arcade'
                      ? 'border-blue-500 bg-[#0f172a]'
                      : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-sm font-semibold">Arcade Zone</CardTitle>
                    <Badge variant="outline" className="text-[10px]">₹100 / +₹200</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Play 5-minute browser minigames. Beat the high score to win +₹200 bounty!
                  </CardDescription>
                </Card>
              </div>

              <Card className="p-4 bg-[#0f172a] border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {activeReward
                    ? `Tested purchase at ${activeReward}. Balance deducted.`
                    : 'Click any card above to simulate spending.'}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-400">Wallet:</span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    ₹{rewardWallet}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRewardWallet(1000);
                      setActiveReward(null);
                    }}
                    className="h-7 px-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 3: MUTUAL FUNDS & BUBBLE */}
          {activeTab === 'mf' && (
            <motion.div
              key="tab-mf"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                  Step 3: Investments & Liquidation
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Invest in Mutual Funds — and Cash Out before crashes
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Deposit liquid cash into Mutual Funds at the MF station. When markets rally (+10%, +25%), your units gain value automatically.
                </p>

                <Card className="p-4 bg-amber-950/20 border-amber-500/30">
                  <span className="text-xs font-bold text-amber-300 block mb-1">
                    The 5-Minute Bubble Rule:
                  </span>
                  <p className="text-xs text-amber-100 leading-relaxed">
                    When the Game Master launches a 5-Minute Bubble (+25%), the Projector starts a countdown from 05:00. You must visit the MF station to cash out (liquidate) your units before 00:00. If you hold through 00:00, the bubble bursts with a -30% crash.
                  </p>
                </Card>
              </div>

              {/* MF Simulator */}
              <div className="lg:col-span-5">
                <Card className="p-5 bg-[#0f172a] border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">Investment Simulator</span>
                    <Badge variant={simMarketDelta >= 0 ? 'success' : 'danger'} className="text-[10px]">
                      {simMarketDelta >= 0 ? `+${simMarketDelta}%` : `${simMarketDelta}%`}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Wallet Cash</span>
                      <span className="text-xl font-mono font-bold text-emerald-400">₹{simLiquidWallet}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Mutual Funds</span>
                      <span className="text-xl font-mono font-bold text-amber-400">₹{simMfAmount}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => {
                        playChaChing();
                        setSimMarketDelta(25);
                        setSimMfAmount((prev) => Math.round(prev * 1.25));
                        setSimHistory((prev) => ['+25% Bubble surge. ₹300 grew to ₹375.', ...prev.slice(0, 1)]);
                      }}
                      className="w-full text-xs h-8"
                    >
                      1. Trigger +25% Bubble Surge
                    </Button>

                    <Button
                      variant="warning"
                      size="sm"
                      disabled={simMfAmount <= 0}
                      onClick={() => {
                        playChaChing();
                        setSimLiquidWallet((prev) => prev + simMfAmount);
                        setSimHistory((prev) => [`Cashed out ₹${simMfAmount} to wallet. Protected from crash.`, ...prev.slice(0, 1)]);
                        setSimMfAmount(0);
                      }}
                      className="w-full text-xs h-8 text-black font-bold"
                    >
                      2. Cash Out 100% (Lock Profits)
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        playBeep();
                        setSimMarketDelta(-30);
                        setSimMfAmount((prev) => Math.round(prev * 0.7));
                        setSimHistory((prev) => ['-30% Bubble burst. Held units lost value.', ...prev.slice(0, 1)]);
                      }}
                      className="w-full text-xs h-8"
                    >
                      3. Trigger -30% Bubble Crash
                    </Button>
                  </div>

                  <div className="p-2 rounded bg-slate-900 text-[11px] text-slate-400">
                    {simHistory[0]}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 4: STORMS & INSURANCE */}
          {activeTab === 'disaster' && (
            <motion.div
              key="tab-disaster"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="outline" className="text-rose-400 border-rose-500/30">
                  Step 4: Risk Protection
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Severe storms trigger a ₹150 fine — unless insured
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The Game Master can trigger a storm calamity during the event. When thunder sounds and the projector screen turns red:
                </p>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Card className="p-3 bg-red-950/20 border-red-500/30">
                    <span className="text-xs font-semibold text-rose-400 block uppercase">Uninsured Citizen</span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">-₹150</p>
                    <p className="text-xs text-slate-400 mt-1">Deducted directly from wallet balance.</p>
                  </Card>

                  <Card className="p-3 bg-emerald-950/20 border-emerald-500/30">
                    <span className="text-xs font-semibold text-emerald-400 block uppercase">Insured Citizen</span>
                    <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">₹0 Fine</p>
                    <p className="text-xs text-slate-400 mt-1">100% covered. Insurance pays for all damage.</p>
                  </Card>
                </div>

                <p className="text-xs text-slate-400">
                  Storm insurance costs <strong>₹150 one-time</strong> at the Central Bank desk.
                </p>
              </div>

              {/* Simulator */}
              <div className="lg:col-span-5">
                <Card className="p-5 bg-[#0f172a] border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">Insurance Test</span>
                    <Badge variant={hasInsurance ? 'success' : 'outline'} className="text-[10px]">
                      {hasInsurance ? 'Insured' : 'Unprotected'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Wallet Balance:</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">₹{disasterWallet}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={hasInsurance ? 'secondary' : 'success'}
                      size="sm"
                      onClick={() => {
                        if (!hasInsurance && disasterWallet >= 150) {
                          playChaChing();
                          setHasInsurance(true);
                          setDisasterWallet((prev) => prev - 150);
                          setDisasterOutcome('Purchased insurance (-₹150). You are protected.');
                        }
                      }}
                      className="flex-1 text-xs h-8"
                    >
                      {hasInsurance ? 'Insured' : 'Buy Insurance (-₹150)'}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        playBeep();
                        if (hasInsurance) {
                          playChaChing();
                          setDisasterOutcome('Storm hit. You had insurance: ₹0 fine deducted.');
                        } else {
                          setDisasterWallet((prev) => Math.max(0, prev - 150));
                          setDisasterOutcome('Storm hit. Uninsured: -₹150 fine deducted.');
                        }
                      }}
                      className="flex-1 text-xs h-8"
                    >
                      Trigger Storm
                    </Button>
                  </div>

                  {disasterOutcome && (
                    <p className="p-2 rounded bg-slate-900 text-xs text-slate-300 text-center">
                      {disasterOutcome}
                    </p>
                  )}
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SCAM ALLEY */}
          {activeTab === 'scam' && (
            <motion.div
              key="tab-scam"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <Badge variant="outline" className="text-rose-400 border-rose-500/30">
                  Step 5: Avoiding Traps
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                  Scam Alley is a rigged carnival game
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  In Scam Alley, you are offered a &ldquo;Double or Nothing&rdquo; wager. Here is how it functions:
                </p>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400 block mb-0.5">1. The Hook (First Play):</strong>
                    You win and double your money (+₹100). This encourages you to play again.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-rose-400 block mb-0.5">2. The Trap (Second Play & Beyond):</strong>
                    The scanner recognizes your card and you lose your wager (-₹100).
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-blue-400 block mb-0.5">3. The Civic Choice (+₹100):</strong>
                    Students who report Scam Alley earn a +₹100 reporting bounty.
                  </div>
                </div>
              </div>

              {/* Simulator */}
              <div className="lg:col-span-5">
                <Card className="p-5 bg-[#0f172a] border-slate-800 space-y-3 text-center">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800">
                    <span className="font-semibold text-slate-300">Trap Simulator</span>
                    <Badge variant="outline" className="text-[10px]">Plays: {scamWagersCount}</Badge>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400">Wallet:</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">₹{scamSimWallet}</span>
                  </div>

                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (scamWagersCount === 0) {
                        playChaChing();
                        setScamWagersCount(1);
                        setScamSimWallet((prev) => prev + 100);
                        setScamMessage('Beginner\'s luck. You doubled your ₹100 wager.');
                      } else {
                        playBeep();
                        setScamWagersCount((prev) => prev + 1);
                        setScamSimWallet((prev) => Math.max(0, prev - 100));
                        setScamMessage('Busted. The house wins. You lost your ₹100 wager.');
                      }
                    }}
                    className="w-full text-xs h-9"
                  >
                    Wager ₹100 (Double or Nothing)
                  </Button>

                  {scamMessage && (
                    <p className="p-2 rounded bg-slate-900 text-xs text-slate-300">
                      {scamMessage}
                    </p>
                  )}

                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setScamWagersCount(0);
                      setScamSimWallet(1000);
                      setScamMessage(null);
                    }}
                    className="text-xs text-slate-400 h-6"
                  >
                    Reset test
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* TAB 6: QUICK QUIZ */}
          {activeTab === 'quiz' && (
            <motion.div
              key="tab-quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto space-y-5"
            >
              <div className="text-center space-y-1">
                <Badge variant="outline" className="text-xs">Final Check</Badge>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Readiness Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Answer 3 quick questions before starting the simulation:
                </p>
              </div>

              <div className="space-y-3">
                <Card className="p-3.5 bg-[#0f172a] border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-white">
                    1. How much starting money does each student receive on their debit card?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {['₹100', '₹500', '₹1000'].map((amt) => (
                      <Button
                        key={amt}
                        variant={quizAnswers.q1 === amt.replace('₹', '') ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q1: amt.replace('₹', '') }))}
                        className="text-xs h-8"
                      >
                        {amt}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-3.5 bg-[#0f172a] border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-white">
                    2. What happens if a storm hits and you did not buy insurance?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'nothing', text: 'Nothing happens' },
                      { id: 'fine150', text: 'You pay ₹150 damage fine' },
                    ].map((opt) => (
                      <Button
                        key={opt.id}
                        variant={quizAnswers.q2 === opt.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q2: opt.id }))}
                        className="text-xs h-8"
                      >
                        {opt.text}
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-3.5 bg-[#0f172a] border-slate-800 space-y-2">
                  <p className="text-xs font-semibold text-white">
                    3. What happens if you scan your card a second time at Scam Alley?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'double', text: 'You double your money again' },
                      { id: 'busted', text: 'You lose your wager (Busted)' },
                    ].map((opt) => (
                      <Button
                        key={opt.id}
                        variant={quizAnswers.q3 === opt.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuizAnswers((p) => ({ ...p, q3: opt.id }))}
                        className="text-xs h-8"
                      >
                        {opt.text}
                      </Button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="text-center pt-1">
                {!quizPassed ? (
                  <Button
                    variant="default"
                    onClick={handleQuizSubmit}
                    disabled={!quizAnswers.q1 || !quizAnswers.q2 || !quizAnswers.q3}
                    className="px-6"
                  >
                    Check Answers
                  </Button>
                ) : (
                  <Card className="p-5 bg-emerald-950/40 border-emerald-500/50 space-y-2">
                    <p className="text-sm font-bold text-emerald-300">All Answers Correct</p>
                    <p className="text-xs text-emerald-100">
                      You are ready to manage your capital, invest in mutual funds, and protect against storms.
                    </p>
                    <div className="pt-2">
                      <Button variant="success" size="sm" asChild>
                        <Link href="/projector" target="_blank">
                          Start Game // Open Projector
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )}

                {quizSubmitted && !quizPassed && (
                  <p className="text-xs text-rose-400 mt-2">
                    Review your answers: Starting balance is ₹1,000, storms fine uninsured ₹150, and repeat wagers at Scam Alley lose money.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="px-6 md:px-10 py-3 border-t border-slate-800 bg-[#0d1322]/90 backdrop-blur-md z-20 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          Use [←] or [→] arrow keys to switch rules
        </span>

        <div className="flex items-center gap-2">
          {activeTab !== 'card' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(TABS[idx - 1].id);
              }}
              className="text-xs h-8"
            >
              Back
            </Button>
          )}

          {activeTab !== 'quiz' ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                const idx = TABS.findIndex((t) => t.id === activeTab);
                if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
              }}
              className="text-xs h-8"
            >
              Next Rule
            </Button>
          ) : (
            <Button variant="success" size="sm" asChild className="text-xs h-8">
              <Link href="/projector" target="_blank">
                Open Projector
              </Link>
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
