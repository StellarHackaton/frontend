"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatRp } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { useToast } from "@/components/ui/Toast";

export function useCreateForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [touched, setTouched] = useState(false);

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
    // one decimal point, digits only
    const cleaned = v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setPrice(cleaned);
  }

  function submit() {
    setTouched(true);
    if (!valid) {
      toast(nameErr || priceErr, "error");
      return;
    }
    toast("Payment link created", "success");
    router.push(`/p/${slugify(name)}`);
  }

  return {
    name,
    setName,
    price,
    onPrice,
    touched,
    nameErr,
    priceErr,
    valid,
    local,
    submit,
    back: () => router.push("/dashboard"),
  };
}
