"use client";

import { QRCodeSVG } from "qrcode.react";

export function QrCode({ value, size = 172 }: { value: string; size?: number }) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor="#FFFFFF"
      fgColor="#15161B"
      level="M"
      marginSize={0}
    />
  );
}
