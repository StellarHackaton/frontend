import { NextRequest, NextResponse } from 'next/server';
import { getOrder, markOrderPaid } from '@/lib/db';
import { contractConfirmPayment } from '@/lib/contract';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { txHash, assetCode } = await req.json() as { txHash: string; assetCode?: string };

    if (!txHash) return NextResponse.json({ error: 'txHash required' }, { status: 400 });

    const order = await getOrder(params.id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'paid') return NextResponse.json({ ok: true, already: true });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Order not pending' }, { status: 409 });

    const asset = assetCode ?? 'USDC';
    await markOrderPaid(params.id, asset, txHash);

    try {
      await contractConfirmPayment(params.id, asset, txHash);
    } catch (e) {
      console.warn('confirm/contract: already confirmed or failed:', e);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('/api/orders/[id]/confirm error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
