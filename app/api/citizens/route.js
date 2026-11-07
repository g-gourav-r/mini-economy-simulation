import { NextResponse } from 'next/server';
import { Store } from '@/lib/store';

/**
 * POST /api/citizens
 * Request Body: { qrId: string, name: string, startingBalance?: number }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { qrId, name, startingBalance } = body;

    if (!qrId || typeof qrId !== 'string' || !qrId.trim()) {
      return NextResponse.json(
        { success: false, error: 'QR Code ID (qrId) is required.' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Kid's Name (name) is required." },
        { status: 400 }
      );
    }

    const initialAmount = Number(startingBalance) || 1000;
    const result = Store.registerCitizen(qrId, name, initialAmount);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, citizen: result.citizen },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Registered ${result.citizen.name} successfully with ₹${initialAmount} starter capital!`,
        citizen: result.citizen,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error in POST /api/citizens:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * GET /api/citizens?qrId=...
 * Resolves citizen details (liquid balance, mutual fund invested, insurance).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const qrId = searchParams.get('qrId');

    if (!qrId) {
      return NextResponse.json(
        { success: false, error: 'qrId query parameter is required.' },
        { status: 400 }
      );
    }

    const citizen = Store.getCitizenByQr(qrId);

    if (!citizen) {
      return NextResponse.json(
        { success: false, error: 'Citizen not found with this QR ID.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, citizen });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
