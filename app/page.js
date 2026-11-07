import Link from 'next/link';
import {
  Building2,
  Smartphone,
  ArrowRight,
  Tv,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MobileHomePage() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans select-none shadow-sm border-x border-neutral-200 relative">
      {/* Mobile Header */}
      <header className="p-4 bg-white border-b border-neutral-200 sticky top-0 z-20 flex items-center justify-between">
        <h1 className="text-base font-bold text-neutral-900 tracking-tight">
          Mini-Economy Hub
        </h1>

        <Badge variant="secondary" className="flex items-center gap-1.5 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Active Session</span>
        </Badge>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">

        {/* Big Screen Projector Banner */}
        <Link
          href="/projector"
          target="_blank"
          className="group block"
        >
          <Card className="hover:border-neutral-400 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                  <Tv className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">
                    Big Screen Projector
                  </span>
                  <span className="text-xs text-neutral-500">
                    Leaderboard, market graph & news ticker
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-900 transition-all shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Interactive Pre-Game Instructions */}
        <Link
          href="/instructions"
          className="group block"
        >
          <Card className="hover:border-neutral-400 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-900 block">
                    Student Orientation & Rules
                  </span>
                  <span className="text-xs text-neutral-500">
                    Interactive briefing & readiness quiz
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-900 transition-all shrink-0" />
            </CardContent>
          </Card>
        </Link>

        {/* Portals */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-1">
            Station Terminals
          </span>

          {/* Volunteer POS */}
          <Link
            href="/pos"
            className="group block"
          >
            <Card className="hover:border-neutral-400 transition-colors">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Volunteer POS Terminal
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Card scanner & transactions
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-900 transition-all shrink-0" />
              </CardContent>
            </Card>
          </Link>

          {/* Bank Desk */}
          <Link
            href="/bank"
            className="group block"
          >
            <Card className="hover:border-neutral-400 transition-colors">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Central Bank Desk
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Card registration & initial grants
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-900 transition-all shrink-0" />
              </CardContent>
            </Card>
          </Link>

          {/* Game Master Control */}
          <Link
            href="/admin"
            className="group block"
          >
            <Card className="hover:border-neutral-400 transition-colors">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Game Master Controls
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Market cycles, disasters & live logs
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 group-hover:text-neutral-900 transition-all shrink-0" />
              </CardContent>
            </Card>
          </Link>
        </div>

      </main>
    </div>
  );
}
