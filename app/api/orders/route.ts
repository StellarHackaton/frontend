import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getProduct, generateOrderId, listOrders, listProducts } from '@/lib/db';
import { contractCreateOrder } from '@/lib/contract';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantAddress, productId } = body as {
      merchantAddress: string;
      productId: string;
    };

    if (!merchantAddress || !productId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const product = await getProduct(productId);
    if (!product || product.merchant_address !== merchantAddress) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const orderId = generateOrderId();
    const amountStroops = product.price_stroops;

    await createOrder({ id: orderId, productId: product.id, merchantAddress, amountStroops });

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
  const productMap = new Map(products.map((p) => [p.id, p.title]));
  const enriched = orders.map((o) => ({
    ...o,
    product_title: o.product_id ? (productMap.get(o.product_id) ?? 'Product') : 'Product',
  }));
  return NextResponse.json({ orders: enriched, products });
}
