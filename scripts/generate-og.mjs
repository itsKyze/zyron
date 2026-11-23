import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const { chromium } = require(
  path.join(ROOT, "apps", "marketing", "node_modules", "@playwright/test"),
);

const TMP_DIR = "/tmp/zyron-captures";

export async function generateOgImage() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 600 },
    deviceScaleFactor: 1,
  });

  const cardImagePath = path.join(TMP_DIR, "dark-stage.png");
  let cardBase64 = "";
  if (fs.existsSync(cardImagePath)) {
    cardBase64 = `data:image/png;base64,${fs.readFileSync(cardImagePath).toString("base64")}`;
  }

  const bgPath = path.join(ROOT, "apps/marketing/public/hero-bg.jpg");
  let bgBase64 = "";
  if (fs.existsSync(bgPath)) {
    bgBase64 = `data:image/jpeg;base64,${fs.readFileSync(bgPath).toString("base64")}`;
  }

  const iconPath = path.join(ROOT, "apps/marketing/public/zyron-icon.png");
  const tightIconPath = path.join(TMP_DIR, "zyron-icon-tight.png");
  if (!fs.existsSync(tightIconPath) && fs.existsSync(iconPath)) {
    try {
      execFileSync("python3", [
        "-c",
        `from PIL import Image; im=Image.open('${iconPath}'); im.crop(im.getbbox()).save('${tightIconPath}')`,
      ]);
    } catch {}
  }
  const effectiveIconPath = fs.existsSync(tightIconPath) ? tightIconPath : iconPath;
  let iconBase64 = "";
  if (fs.existsSync(effectiveIconPath)) {
    iconBase64 = `data:image/png;base64,${fs.readFileSync(effectiveIconPath).toString("base64")}`;
  }

  const claudeSvg = fs.readFileSync(
    path.join(ROOT, "apps/web/public/central-icons-fill/claudeai.svg"),
    "utf8",
  );
  const codexSvg = fs.readFileSync(
    path.join(ROOT, "apps/web/public/central-icons-fill/openai-codex.svg"),
    "utf8",
  );
  const cursorSvg = fs.readFileSync(
    path.join(ROOT, "apps/web/public/central-icons-fill/cursor.svg"),
    "utf8",
  );
  const antigravitySvg = fs.readFileSync(
    path.join(ROOT, "apps/web/public/central-icons-fill/antigravity.svg"),
    "utf8",
  );

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 600px;
    background: #090a0f url('${bgBase64}') center/cover no-repeat;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #f1f3f9;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
  }
  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(10, 12, 18, 0.92) 0%, rgba(10, 12, 18, 0.80) 45%, rgba(10, 12, 18, 0.35) 75%, rgba(10, 12, 18, 0.20) 100%);
    pointer-events: none;
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    padding: 60px 64px;
    position: relative;
    z-index: 10;
  }
  .left-col {
    width: 460px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brand-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand-logo {
    width: 52px;
    height: 52px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
  }
  .brand-name {
    font-size: 38px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: #ffffff;
  }
  .tagline-group {
    margin-top: 24px;
  }
  .tagline {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.35;
    color: #f3f4f8;
    margin-bottom: 12px;
  }
  .sub-tagline {
    font-size: 14px;
    line-height: 1.5;
    color: #9da6b9;
  }
  .badges-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
    max-width: 440px;
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    color: #d1d7e5;
    backdrop-filter: blur(8px);
  }
  .badge svg {
    width: 15px;
    height: 15px;
    fill: currentColor;
    color: #99a5be;
  }
  .badge-stroke svg {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
  }
  .footer-meta {
    font-size: 12px;
    color: #6c768e;
    font-weight: 500;
    letter-spacing: 0.2px;
  }
  .right-col {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
  }
  .card-window {
    width: 630px;
    height: 440px;
    border-radius: 14px;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 8px 24px rgba(0, 0, 0, 0.5);
    background: #101012;
  }
  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top left;
  }
</style>
</head>
<body>
  <div class="bg-overlay"></div>
  <div class="container">
    <div class="left-col">
      <div>
        <div class="brand-header">
          <img src="${iconBase64}" class="brand-logo" alt="Zyron Logo">
          <span class="brand-name">Zyron</span>
        </div>
        <div class="tagline-group">
          <div class="tagline">The local-first workspace & control plane for coding agents.</div>
          <div class="sub-tagline">Run Claude Code, Codex, Cursor, and Antigravity in parallel across Git worktrees and diffs.</div>
        </div>
        <div class="badges-grid">
          <div class="badge">
            ${claudeSvg}
            <span>Claude Code</span>
          </div>
          <div class="badge">
            ${codexSvg}
            <span>Codex</span>
          </div>
          <div class="badge">
            ${cursorSvg}
            <span>Cursor</span>
          </div>
          <div class="badge">
            ${antigravitySvg}
            <span>Antigravity</span>
          </div>
          <div class="badge badge-stroke">
            <svg viewBox="0 0 24 24"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
            <span>Worktrees</span>
          </div>
          <div class="badge badge-stroke">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Multi-Agent</span>
          </div>
        </div>
      </div>
      <div class="footer-meta">
        Open Source · Free · Local-First · https://ai.zyron.site
      </div>
    </div>
    <div class="right-col">
      <div class="card-window">
        <img src="${cardBase64}" class="card-img" alt="Zyron UI">
      </div>
    </div>
  </div>
</body>
</html>`;

  await page.setContent(html);
  await page.waitForTimeout(600);

  const outPath = path.join(ROOT, "apps/marketing/public/og.png");
  await page.screenshot({ path: outPath });
  await browser.close();
  console.log("High-precision HTML/CSS og.png generated successfully at:", outPath);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateOgImage().catch(console.error);
}
