"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRp } from "@/lib/format";
import { useWalletContext } from "@/lib/wallet-context";
import { useToast } from "@/components/ui/Toast";

export function useCreateForm() {
  const router = useRouter();
  const toast = useToast();
  const { address } = useWalletContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<"one_time" | "permanent">("one_time");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const priceNum = parseFloat(price);
  const nameErr = name.trim() === "" ? "Give your product a name." : "";
  const priceErr = !price.trim()
    ? "Set a price."
    : !(priceNum > 0)
    ? "Price must be more than 0."
    : "";
  const valid = !nameErr && !priceErr;
  const local = priceNum > 0 ? formatRp(priceNum) : "";

  function onPrice(v: string) {
    const cleaned = v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setPrice(cleaned);
  }

  async function submit() {
    setTouched(true);
    if (!valid) {
      toast(nameErr || priceErr, "error");
      return;
    }
    if (!address) {
      toast("Connect your wallet first.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantAddress: address,
          title: name.trim(),
          description: description.trim(),
          priceUsdc: priceNum,
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menyimpan produk");
      toast("Produk berhasil ditambahkan", "success");
      router.push("/products");
    } catch (err: any) {
      toast(err.message ?? "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    name,
    setName,
    description,
    setDescription,
    price,
    onPrice,
    type,
    setType,
    touched,
    nameErr,
    priceErr,
    valid,
    local,
    submitting,
    submit,
    back: () => router.push("/dashboard"),
  };
}
