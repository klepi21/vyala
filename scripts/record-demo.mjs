/**
 * Records the 20 second product tour used on the landing page.
 * The dev server must already be running on localhost:3000 with the
 * demo practice seeded (scripts/seed-demo.mjs).
 *
 *   node scripts/record-demo.mjs
 *
 * Produces public/demo.mp4 and public/demo-poster.jpg via ffmpeg.
 */
import { chromium } from "playwright";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const BASE = "http://localhost:3000";
const W = 1440;
const H = 900;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const outDir = await mkdtemp(join(tmpdir(), "vyala-rec-"));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: { dir: outDir, size: { width: W, height: H } },
  });
  const page = await context.newPage();

  // Give the cursor something to follow so the tour feels human.
  const move = async (x, y) => {
    await page.mouse.move(x, y, { steps: 22 });
    await wait(180);
  };

  // 1. Dashboard, the numbers that matter
  await page.goto(`${BASE}/demo`, { waitUntil: "networkidle" });
  await wait(2600);

  // 2. Today's schedule
  await move(69, 92);
  await page.click("text=Appointments");
  await page.waitForLoadState("networkidle");
  await wait(2900);

  // 3. Step to the next day and back, showing the day navigation
  await move(617, 61);
  await page.click('a[href*="appointments?date="]:nth-of-type(1)').catch(() => {});
  await wait(1600);

  // 4. Patients list
  await move(55, 119);
  await page.click("text=Patients");
  await page.waitForLoadState("networkidle");
  await wait(2200);

  // 5. Search narrows the list instantly
  await move(583, 61);
  await page.click('input[name="q"]');
  await page.type('input[name="q"]', "Μακρ", { delay: 130 });
  await wait(500);
  await page.keyboard.press("Enter");
  await page.waitForLoadState("networkidle");
  await wait(1900);

  // 6. Open one record and show the clinical history
  const firstRow = page.locator('table a').first();
  if (await firstRow.count()) {
    await firstRow.click();
    await page.waitForLoadState("networkidle");
    await wait(3000);
    await page.mouse.wheel(0, 320);
    await wait(1800);
  }

  // 7. Payments, cash and card side by side
  await move(59, 146);
  await page.click("text=Payments");
  await page.waitForLoadState("networkidle");
  await wait(2600);

  // 8. Invoices to close
  await move(55, 173);
  await page.click("text=Invoices");
  await page.waitForLoadState("networkidle");
  await wait(2600);

  await context.close();
  await browser.close();

  const files = (await readdir(outDir)).filter((f) => f.endsWith(".webm"));
  if (!files.length) throw new Error("Playwright produced no video");
  const webm = join(outDir, files[0]);

  // Transcode to a small, widely supported mp4 and grab a poster frame.
  execFileSync("ffmpeg", [
    "-y", "-i", webm,
    // 0.78x playback keeps the finished tour just under 20 seconds.
    "-vf", "setpts=0.78*PTS,scale=1440:-2,fps=30",
    "-c:v", "libx264", "-preset", "slow", "-crf", "26",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    "public/demo.mp4",
  ], { stdio: "inherit" });

  execFileSync("ffmpeg", [
    "-y", "-i", "public/demo.mp4", "-ss", "00:00:01", "-frames:v", "1",
    "-q:v", "3", "public/demo-poster.jpg",
  ], { stdio: "inherit" });

  await rm(outDir, { recursive: true, force: true });
  console.log("\nWrote public/demo.mp4 and public/demo-poster.jpg");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
