import { NextRequest, NextResponse } from 'next/server';
import { getProduct, updateProduct, deleteProduct } from '@/lib/db';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { merchantAddress, title, description, priceUsdc } = await req.json();
  if (!merchantAddress) return NextResponse.json({ error: 'Missing merchantAddress' }, { status: 400 });

  const product = await getProduct(params.id);
  if (!product || product.merchant_address !== merchantAddress) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await updateProduct(params.id, merchantAddress, { title, description, priceUsdc });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { merchantAddress } = await req.json();
  if (!merchantAddress) return NextResponse.json({ error: 'Missing merchantAddress' }, { status: 400 });

  const product = await getProduct(params.id);
  if (!product || product.merchant_address !== merchantAddress) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await deleteProduct(params.id, merchantAddress);
  return NextResponse.json({ ok: true });
}
