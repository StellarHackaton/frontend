import { NextRequest, NextResponse } from 'next/server';
import { buildPaymentXdr } from '@/lib/stellar';
import { getOrder } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, buyerAddress, sendAssetCode, sendAssetIssuer = null, sendMax, path = [] } =
      body as {
        orderId: string;
        buyerAddress: string;
        sendAssetCode: string;
        sendAssetIssuer?: string | null;
        sendMax: string;
        path?: Array<{ assetCode: string; assetIssuer: string | null }>;
      };

    if (!orderId || !buyerAddress || !sendAssetCode || !sendMax) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not pending', status: order.status }, { status: 409 });
    }

    const destAmountUsdc = (order.amount_stroops / 10_000_000).toFixed(7);
    const xdr = await buildPaymentXdr({
      buyerAddress,
      merchantAddress: order.merchant_address,
      sendAssetCode,
      sendAssetIssuer,
      sendMax,
      destAmountUsdc,
      path,
      memoText: orderId,
    });

    return NextResponse.json({ xdr, orderId, destAmountUsdc, memoText: orderId });
  } catch (err) {
    console.error('POST /api/tx/pay error:', err);
    return NextResponse.json({ error: 'Failed to build transaction' }, { status: 500 });
  }
}
