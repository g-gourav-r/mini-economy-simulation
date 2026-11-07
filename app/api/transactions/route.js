import { NextResponse } from 'next/server';
import { Store } from '@/lib/store';

/**
 * POST /api/transactions
 * Request Body:
 * {
 *   qrId: string,
 *   station: string,
 *   amount?: number,
 *   description?: string,
 *   actionType?: 'standard' | 'scam_wager' | 'mf_invest' | 'mf_withdraw',
 *   wager?: number,
 *   withdrawMode?: 'half' | 'all'
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { qrId, station, amount, description, actionType, wager, withdrawMode } = body;

    if (!qrId || typeof qrId !== 'string' || !qrId.trim()) {
      return NextResponse.json(
        { success: false, error: 'qrId is required to identify the citizen.' },
        { status: 400 }
      );
    }

    const cleanQrId = qrId.trim();
    const citizen = Store.getCitizenByQr(cleanQrId);

    if (!citizen) {
      return NextResponse.json(
        {
          success: false,
          error: `Card not found! No kid is registered with QR: "${cleanQrId}". Register at Central Bank first.`,
        },
        { status: 404 }
      );
    }

    // =========================================================================
    // SPECIAL HANDLER: MUTUAL FUND INVEST & WITHDRAW
    // =========================================================================
    if (actionType === 'mf_invest') {
      const investAmount = Number(amount) || 200;
      const res = Store.investMutualFund(cleanQrId, investAmount);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Invested ₹${investAmount} in Mutual Funds!`,
        newBalance: res.newBalance,
        mfInvested: res.investedAmount,
        citizen: res.citizen,
      });
    }

    if (actionType === 'mf_withdraw') {
      const mode = withdrawMode === 'half' ? 'half' : 'all';
      const res = Store.withdrawMutualFund(cleanQrId, mode);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Cashed out ₹${res.withdrawnAmount} from Mutual Funds to Liquid Wallet!`,
        newBalance: res.newBalance,
        mfInvested: res.investedAmount,
        withdrawnAmount: res.withdrawnAmount,
        citizen: res.citizen,
      });
    }

    // =========================================================================
    // SPECIAL HANDLER: SCAM ALLEY RIGGED WAGER (1st scan DOUBLES, 2nd+ BUSTS)
    // =========================================================================
    if (actionType === 'scam_wager' || station === 'Scam' && wager) {
      const wagerAmount = Math.abs(Number(wager || amount || 100));
      const playCount = Store.getScamPlayCount(citizen.id);

      if (playCount === 0) {
        // First Time: Hook them! Double the wager!
        const res = Store.processTransaction(
          cleanQrId,
          'Scam',
          wagerAmount,
          `🎉 Scam Alley: Beginner's Luck Double! (Won ₹${wagerAmount})`
        );
        return NextResponse.json({
          success: true,
          scamResult: 'win',
          message: `🎉 JACKPOT! Beginner's Luck! You doubled your ₹${wagerAmount} wager!`,
          amount: wagerAmount,
          newBalance: res.newBalance,
          citizen: res.citizen,
        });
      } else {
        // Second Time or Beyond: BUST! Cut their money!
        if (citizen.balance < wagerAmount) {
          return NextResponse.json({
            success: false,
            error: `You don't even have ₹${wagerAmount} to wager!`,
          }, { status: 400 });
        }

        const res = Store.processTransaction(
          cleanQrId,
          'Scam',
          -wagerAmount,
          `🚨 Scam Alley: The House Always Wins! (Lost ₹${wagerAmount})`
        );
        return NextResponse.json({
          success: true,
          scamResult: 'bust',
          message: `🚨 BUSTED! The house always wins! You lost your ₹${wagerAmount} wager!`,
          amount: -wagerAmount,
          newBalance: res.newBalance,
          citizen: res.citizen,
        });
      }
    }

    // =========================================================================
    // STANDARD TRANSACTION HANDLER
    // =========================================================================
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount === 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be a non-zero integer.' },
        { status: 400 }
      );
    }

    const cleanStation = station?.trim() || 'Retail';
    const cleanDescription = description?.trim() || `${cleanStation} transaction`;

    const res = Store.processTransaction(cleanQrId, cleanStation, numericAmount, cleanDescription);

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: numericAmount < 0 ? `Charged ₹${Math.abs(numericAmount)}` : `Added ₹${numericAmount}`,
      citizenId: res.citizen.id,
      citizenName: res.citizen.name,
      newBalance: res.newBalance,
      transaction: res.transaction,
      citizen: res.citizen,
    });
  } catch (err) {
    console.error('Error in POST /api/transactions:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
