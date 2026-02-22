/**
 * Record the Event Horizon intro as a high-quality video using Playwright.
 * Captures the full rendered page — particles, text, chevron, everything.
 *
 * Usage: node scripts/record-intro.mjs
 * Output: ~/Downloads/CB-Media-Event-Horizon-Full.mp4
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import path from 'path';

const VIEWPORT = { width: 1080, height: 1080 };
const DURATION_MS = 40_000; // 40s — full intro + hero text reveal
const OUTPUT_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');

async function main() {
  console.log('Launching browser (GPU-accelerated)...');
  const browser = await chromium.launch({
    headless: false,  // Headed mode — uses real GPU, no color shift
    args: [
      '--enable-webgl',
      '--enable-gpu',
      '--disable-software-rasterizer',
      '--window-position=-2000,-2000',  // Off-screen so it doesn't interfere
    ],
  });

  const rawDir = path.join(OUTPUT_DIR, '_playwright-raw');

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    recordVideo: {
      dir: rawDir,
      size: VIEWPORT,
    },
  });

  const page = await context.newPage();

  console.log('Navigating to intro...');
  await page.goto('http://localhost:3007', { waitUntil: 'domcontentloaded' });

  // Wait for the canvas to appear (WebGL initialized)
  await page.waitForSelector('canvas', { timeout: 15000 });
  console.log('Canvas detected — recording for ' + (DURATION_MS / 1000) + 's...');

  // Let the full intro play out
  await page.waitForTimeout(DURATION_MS);

  console.log('Stopping recording...');
  // Save video path before closing
  const video = page.video();
  await context.close();
  await browser.close();

  // Find the recorded WebM file
  let rawFile = null;
  try {
    const files = readdirSync(rawDir);
    const webm = files.find(f => f.endsWith('.webm'));
    if (webm) rawFile = path.join(rawDir, webm);
  } catch {}

  if (!rawFile) {
    console.error('No recording found in', rawDir);
    process.exit(1);
  }

  console.log('Raw recording:', rawFile);

  // Re-encode with ffmpeg for LinkedIn-ready MP4
  const outputFile = path.join(OUTPUT_DIR, 'CB-Media-Event-Horizon-Full.mp4');
  const ffmpeg = 'C:/Users/Owner/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe';

  console.log('Encoding to MP4 (CRF 18, H.264)...');
  try {
    execSync([
      `"${ffmpeg}"`,
      `-i "${rawFile}"`,
      `-vf "scale=${VIEWPORT.width}:${VIEWPORT.height}:force_original_aspect_ratio=decrease,pad=${VIEWPORT.width}:${VIEWPORT.height}:(ow-iw)/2:(oh-ih)/2:black"`,
      '-c:v libx264',
      '-preset slow',
      '-crf 18',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-r 30',
      '-y',
      `"${outputFile}"`,
    ].join(' '), { stdio: 'inherit' });
    console.log('\nDone! Saved to:', outputFile);
  } catch (e) {
    console.error('ffmpeg encoding failed. Raw file available at:', rawFile);
  }

  // Cleanup raw directory
  try {
    execSync(`rm -rf "${rawDir}"`);
  } catch {}
}

main().catch(console.error);
