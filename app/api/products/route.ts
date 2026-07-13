import { NextRequest, NextResponse } from 'next/server';
import { createProduct, listProducts } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchantAddress, title, description, priceUsdc, type } = body as {
      merchantAddress: string;
      title: string;
      description?: string;
      priceUsdc: number;
      type?: 'one_time' | 'permanent';
    };

    if (!merchantAddress || !title || !priceUsdc) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (priceUsdc <= 0) {
      return NextResponse.json({ error: 'Price must be positive' }, { status: 400 });
    }

    const product = await createProduct({ merchantAddress, title, description, priceUsdc, type });
    return NextResponse.json({ product });
  } catch (err) {
    console.error('POST /api/products error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
