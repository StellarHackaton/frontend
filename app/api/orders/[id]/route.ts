import { NextRequest, NextResponse } from 'next/server';
import { getOrder, getProduct, getMerchant } from '@/lib/db';
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

  // Include product title and merchant info for UI display
  let product_title = 'Product';
  if (order.product_id) {
    const product = await getProduct(order.product_id);
    if (product) product_title = product.title;
  }

  const merchant = await getMerchant(order.merchant_address);
  let product_type: 'one_time' | 'permanent' = 'one_time';
  if (order.product_id) {
    const prod = await getProduct(order.product_id);
    if (prod) product_type = prod.type;
  }

  return NextResponse.json({
    order: {
      ...order,
      product_title,
      product_type,
      merchant_name: merchant?.store_name || null,
      merchant_verified: merchant?.verified ?? false,
    },
  });
}
