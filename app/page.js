import Link from 'next/link';
import {
  Building2,
  Smartphone,
  ArrowRight,
  Zap,
  ExternalLink,
  Tv,
  Settings,
  HelpCircle,
} from 'lucide-react';

export default function MobileHomePage() {
  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-100 text-gray-900 flex flex-col font-sans select-none shadow-xl border-x border-gray-200 relative">
      {/* Mobile Header */}
      <header className="p-4 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
          <h1 className="text-base font-black text-gray-900 tracking-tight">
            Mini-Economy Hub
          </h1>
        </div>

        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 gap-3 overflow-y-auto">

        {/* Big Screen Projector Banner */}
        <Link
          href="/projector"
          target="_blank"
          className="group bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white rounded-2xl p-4 shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-sm">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-yellow-300">
                Big Screen Projector
              </span>
            </div>
          </div>
          <ExternalLink className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>

        {/* Interactive Pre-Game Instructions */}
        <Link
          href="/instructions"
          className="group bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl p-4 shadow-md transition-all active:scale-[0.98] flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-white">
                Interactive Instructions
              </span>
              <p className="text-[11px] text-cyan-100 font-semibold mt-0.5">
                Pre-game briefing & interactive quiz for kids
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
        </Link>

        {/* Portals */}
        <div className="flex flex-col gap-2.5 mt-1">

          {/* Volunteer POS */}
          <Link
            href="/pos"
            className="group bg-white hover:border-blue-400 active:scale-[0.98] border border-gray-200 rounded-2xl p-4 shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Volunteer POS Scanner
              </h2>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>

          {/* Bank Desk */}
          <Link
            href="/bank"
            className="group bg-white hover:border-emerald-400 active:scale-[0.98] border border-gray-200 rounded-2xl p-4 shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                Central Bank Desk
              </h2>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>

          {/* Game Master Control */}
          <Link
            href="/admin"
            className="group bg-white hover:border-red-400 active:scale-[0.98] border border-gray-200 rounded-2xl p-4 shadow-sm transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                Game Master Control
              </h2>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all shrink-0" />
          </Link>
        </div>

      </main>
    </div>
  );
}