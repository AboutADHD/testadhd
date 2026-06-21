/**
 * Generates the raster PWA / Apple icons from the brand "focus target" mark.
 * Run with: node scripts/generate-icons.mjs
 *
 * app/icon.svg is the scalable favicon (served by Next directly). The PNG sizes
 * below back the web app manifest and the Apple touch icon.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const FOCUS = (rounded) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4B45D6"/>
      <stop offset="1" stop-color="#3A35B8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="url(#g)"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#ffffff" stroke-width="22" opacity="0.3"/>
  <circle cx="256" cy="256" r="96" fill="none" stroke="#ffffff" stroke-width="22"/>
  <circle cx="256" cy="256" r="40" fill="#F26A4B"/>
</svg>`;

const rounded = Buffer.from(FOCUS(true));
const square = Buffer.from(FOCUS(false));

async function png(svg, size, path) {
  await sharp(svg).resize(size, size).png().toFile(path);
  console.log("✓", path, `${size}x${size}`);
}

await mkdir("public/icons", { recursive: true });

await png(rounded, 192, "public/icons/icon-192.png");
await png(rounded, 512, "public/icons/icon-512.png");
await png(square, 512, "public/icons/icon-maskable-512.png");
await png(square, 180, "app/apple-icon.png");
