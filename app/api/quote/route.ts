import { NextRequest, NextResponse } from 'next/server';
import { getPaymentPaths } from '@/lib/stellar';
import { getOrder } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const buyerAddress = req.nextUrl.searchParams.get('buyerAddress');

  if (!orderId || !buyerAddress) {
    return NextResponse.json({ error: 'orderId and buyerAddress required' }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.status !== 'pending') {
    return NextResponse.json({ error: 'Order is not pending', status: order.status }, { status: 409 });
  }

  const destAmountUsdc = (order.amount_stroops / 10_000_000).toFixed(7);

  try {
    const options = await getPaymentPaths(buyerAddress, destAmountUsdc);
    return NextResponse.json({ options, destAmountUsdc });
  } catch (err) {
    console.error('GET /api/quote error:', err);
    return NextResponse.json({ error: 'Path-finding failed' }, { status: 502 });
  }
}
