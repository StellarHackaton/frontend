import sharp from "sharp";
import { mkdirSync } from "fs";

const B = "brand-src";
mkdirSync("public/icons", { recursive: true });
mkdirSync("public/logo", { recursive: true });
mkdirSync("app", { recursive: true });

const trim = (f) => sharp(f).trim({ threshold: 12 });

async function run() {
  // App icon (rounded indigo tile, white mark) — trim white margin to the tile.
  const tile = await trim(`${B}/app-icon-src.png`).png().toBuffer();
  const sq = (size, out) =>
    sharp(tile).resize(size, size, { fit: "cover" }).png().toFile(out);

  await sq(512, "app/icon.png");
  await sq(180, "app/apple-icon.png");
  await sq(192, "public/icons/icon-192.png");
  await sq(512, "public/icons/icon-512.png");
  await sq(512, "public/icons/maskable-512.png");
  await sq(32, "public/icons/favicon-32.png");

  // Logos — trim whitespace, keep aspect, cap height.
  const logo = (src, out, h) =>
    trim(src).resize({ height: h }).png().toFile(out);
  await logo(`${B}/wordmark-src.png`, "public/logo/wordmark.png", 120);
  await logo(`${B}/mark-src.png`, "public/logo/mark.png", 256);
  await logo(`${B}/lockup-src.png`, "public/logo/lockup.png", 120);

  // OG image — fit to 1200x630.
  await sharp(`${B}/og-src.png`)
    .resize(1200, 630, { fit: "cover" })
    .png()
    .toFile("app/opengraph-image.png");

  console.log("assets generated");
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
