/**
 * POST /api/products/[id]/checkout
 * For permanent products: create a fresh order session for each buyer.
 * Returns { orderId } which the checkout page uses.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getProduct, createOrder, generateOrderId } from '@/lib/db';
import { contractCreateOrder } from '@/lib/contract';

export const runtime = 'nodejs';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await getProduct(params.id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  if (product.type !== 'permanent') {
    return NextResponse.json({ error: 'Not a permanent product' }, { status: 400 });
  }

  const orderId = generateOrderId();
  await createOrder({
    id: orderId,
    productId: product.id,
    merchantAddress: product.merchant_address,
    amountStroops: product.price_stroops,
  });

  try {
    await contractCreateOrder(orderId, product.merchant_address, product.price_stroops);
  } catch (err) {
    console.error('Contract create_order failed (non-fatal):', err);
  }

  return NextResponse.json({ orderId });
}
