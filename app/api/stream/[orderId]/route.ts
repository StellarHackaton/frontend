import { NextRequest } from 'next/server';
import { getOrder, markOrderPaid } from '@/lib/db';
import { findMatchingPayment } from '@/lib/stellar';
import { contractConfirmPayment } from '@/lib/contract';

export const runtime = 'nodejs';

const POLL_MS = 3_000;
const TIMEOUT_MS = 10 * 60 * 1000;

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;
  const order = await getOrder(orderId);
  if (!order) return new Response('Order not found', { status: 404 });

  // Already paid — respond immediately
  if (order.status === 'paid') {
    const body = `data: ${JSON.stringify({ type: 'paid', txHash: order.tx_hash, assetPaid: order.asset_paid })}\n\n`;
    return new Response(body, { headers: sseHeaders() });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: object) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)); }
        catch {}
      };

      const heartbeat = setInterval(() => send({ type: 'ping' }), 20_000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(heartbeat);
        clearInterval(poller);
        try { controller.close(); } catch {}
      });

      const poller = setInterval(async () => {
        if (closed) return;
        try {
          const match = await findMatchingPayment(
            order.merchant_address,
            order.amount_stroops,
            orderId
          );
          if (!match) return;

          clearInterval(poller);
          clearInterval(heartbeat);

          try {
            await contractConfirmPayment(orderId, match.assetCode, match.txHash);
          } catch (err) {
            console.error('confirm_payment error (may already be confirmed):', err);
          }

          await markOrderPaid(orderId, match.assetCode, match.txHash);
          send({ type: 'paid', txHash: match.txHash, assetPaid: match.assetCode });
          closed = true;
          try { controller.close(); } catch {}
        } catch (err) {
          console.error('SSE poll error:', err);
        }
      }, POLL_MS);

      setTimeout(() => {
        if (!closed) {
          clearInterval(poller);
          clearInterval(heartbeat);
          send({ type: 'timeout' });
          closed = true;
          try { controller.close(); } catch {}
        }
      }, TIMEOUT_MS);
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}

function sseHeaders(): HeadersInit {
  return {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  };
}
