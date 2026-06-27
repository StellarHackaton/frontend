import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '@/lib/db';
import { contractGetStatus } from '@/lib/contract';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Reconcile with chain if DB says pending
  if (order.status === 'pending') {
    try {
      const chainStatus = await contractGetStatus(params.id);
      if (chainStatus === 'Paid') order.status = 'paid';
      else if (chainStatus === 'Expired') order.status = 'expired';
    } catch { /* chain read failed — return DB status */ }
  }

  return NextResponse.json({ order });
}
