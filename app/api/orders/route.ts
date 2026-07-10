import { NextRequest, NextResponse } from 'next/server';
import { createOrder, createProduct, generateOrderId, listOrders, listProducts } from '@/lib/db';
import { contractCreateOrder } from '@/lib/contract';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantAddress, title, priceUsdc, type } = body as {
      merchantAddress: string;
      title: string;
      priceUsdc: number;
      type?: 'one_time' | 'permanent';
    };

    if (!merchantAddress || !title || !priceUsdc) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (priceUsdc <= 0) {
      return NextResponse.json({ error: 'Price must be positive' }, { status: 400 });
    }

    const amountStroops = Math.round(priceUsdc * 10_000_000);
    const orderId = generateOrderId();

    const product = await createProduct({ merchantAddress, title, priceUsdc, type });
    await createOrder({ id: orderId, productId: product.id, merchantAddress, amountStroops });

    // Register on-chain (best-effort — don't fail the whole request)
    try {
      await contractCreateOrder(orderId, merchantAddress, amountStroops);
    } catch (err) {
      console.error('Contract create_order failed:', err);
    }

    const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/p/${orderId}`;
    return NextResponse.json({ orderId, checkoutUrl, product });
  } catch (err) {
    console.error('POST /api/orders error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const merchantAddress = req.nextUrl.searchParams.get('merchantAddress');
  if (!merchantAddress) {
    return NextResponse.json({ error: 'merchantAddress required' }, { status: 400 });
  }
  const [orders, products] = await Promise.all([
    listOrders(merchantAddress),
    listProducts(merchantAddress),
  ]);
  // Enrich orders with product title for UI display
  const productMap = new Map(products.map((p) => [p.id, p.title]));
  const enriched = orders.map((o) => ({
    ...o,
    product_title: o.product_id ? (productMap.get(o.product_id) ?? 'Product') : 'Product',
  }));
  return NextResponse.json({ orders: enriched, products });
}
