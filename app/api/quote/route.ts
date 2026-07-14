import { NextRequest, NextResponse } from 'next/server';
import { getPaymentPaths } from '@/lib/stellar';
import { getOrder, getProduct } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  const buyerAddress = req.nextUrl.searchParams.get('buyerAddress');

  if (!orderId || !buyerAddress) {
    return NextResponse.json({ error: 'orderId and buyerAddress required' }, { status: 400 });
  }

  let order = await getOrder(orderId);

  // Fallback: orderId might actually be a product ID (permanent product accessed via /pay/[productId])
  if (!order) {
    const product = await getProduct(orderId);
    if (product) {
      order = {
        id: product.id,
        product_id: product.id,
        merchant_address: product.merchant_address,
        amount_stroops: product.price_stroops,
        status: 'pending',
        asset_paid: null,
        tx_hash: null,
        paid_at: null,
        created_at: product.created_at,
      } as any;
    }
  }

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
