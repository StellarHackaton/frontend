"use client";

import { QRCodeSVG } from "qrcode.react";
import { useLang } from "@/lib/i18n";

export function QrCode({ value, size = 172 }: { value: string; size?: number }) {
  const { t } = useLang();
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#FFFFFF"
      fgColor="#15161B"
      level="M"
      marginSize={0}
      role="img"
      title={t("product.qrLabel")}
    />
  );
}
