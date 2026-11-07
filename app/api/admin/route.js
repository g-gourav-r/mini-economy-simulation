import { NextResponse } from 'next/server';
import { Store } from '@/lib/store';

/**
 * GET /api/admin
 * Returns current session, live game_state, stats, and recent transaction log.
 */
export async function GET() {
  try {
    const data = Store.getStats();
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err) {
    console.error('Error in GET /api/admin:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin
 * Handles Game Master orchestration & session management.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, rate, news, sessionName } = body;

    // 1. Update Market Rate
    if (action === 'update_market') {
      const parsedRate = parseInt(rate, 10);
      if (isNaN(parsedRate)) {
        return NextResponse.json({ success: false, error: 'Valid rate percentage is required.' }, { status: 400 });
      }
      const newsText = news?.trim() || `Market updated by ${parsedRate > 0 ? '+' : ''}${parsedRate}%`;
      const updatedState = Store.updateGameState({
        market_rate: parsedRate,
        news_text: newsText,
      });
      return NextResponse.json({ success: true, gameState: updatedState });
    }

    // 2. Launch 5-Minute Speculative Bubble Cycle
    if (action === 'launch_bubble') {
      const updatedState = Store.launchBubbleCycle(300); // 5 minutes (300s)
      return NextResponse.json({
        success: true,
        message: '5-Minute Speculative Bubble Cycle launched! Countdown running on Projector.',
        gameState: updatedState,
      });
    }

    // 3. Early Burst Bubble / Crash Now
    if (action === 'burst_bubble') {
      const updatedState = Store.burstBubbleCycle();
      return NextResponse.json({
        success: true,
        message: 'Market Bubble Burst! -30% Crash applied across mutual funds.',
        gameState: updatedState,
      });
    }

    // 4. Trigger Storm Calamity
    if (action === 'trigger_calamity') {
      const result = Store.triggerCalamity();
      return NextResponse.json({
        success: true,
        result: {
          uninsured_penalized_count: result.uninsured_penalized_count,
          total_fined_amount: result.total_fined_amount,
        },
        gameState: result.gameState,
      });
    }

    // 5. Resolve Calamity / Clear Skies
    if (action === 'resolve_calamity') {
      const result = Store.resolveCalamity();
      return NextResponse.json({
        success: true,
        gameState: result.gameState,
      });
    }

    // 6. Start New Session
    if (action === 'start_session') {
      const newSession = Store.startNewSession(sessionName);
      return NextResponse.json({
        success: true,
        message: `Started new session: "${newSession.name}"!`,
        session: newSession,
        ...Store.getStats(),
      });
    }

    // 7. Purge Current Session Data
    if (action === 'purge_session') {
      Store.purgeCurrentSessionData();
      return NextResponse.json({
        success: true,
        message: 'Current session data purged successfully!',
        ...Store.getStats(),
      });
    }

    // 8. Purge All Junk Test Data
    if (action === 'purge_all') {
      Store.purgeAllTestData();
      return NextResponse.json({
        success: true,
        message: 'All junk test data purged! Database reset to pristine clean state.',
        ...Store.getStats(),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown admin action.' }, { status: 400 });
  } catch (err) {
    console.error('Error in POST /api/admin:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
