"use client";

import { useEffect, useState } from "react";
import { Responsive } from "@/components/Responsive";
import { CheckoutFlow as MobileCheckout } from "@/components/mobile/CheckoutFlow";
import { WebCheckoutFlow } from "@/components/web/WebCheckoutFlow";

export default function ProductCheckoutPage({ params }: { params: { id: string } }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}/checkout`, { method: "POST" })
      .then((r) => r.json())
      .then(({ orderId: id, error: err }) => {
        if (err || !id) { setError(true); return; }
        setOrderId(id);
      })
      .catch(() => setError(true));
  }, [params.id]);

  if (error) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-center">
        <div>
          <div className="text-4xl mb-3">❌</div>
          <div className="font-display text-lg font-bold">Produk tidak ditemukan</div>
          <div className="mt-1 text-sm text-muted">Link ini tidak valid atau sudah dihapus.</div>
        </div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Responsive
      mobile={<MobileCheckout orderId={orderId} />}
      web={<WebCheckoutFlow orderId={orderId} />}
    />
  );
}
