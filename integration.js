import { chromium } from "playwright";

import { createServer } from "./server.js";

// Env vars to inject into browser localStorage
const BROWSER_ENV_VARS = ['MISTRAL_API_KEY', 'TEST_PDF_URL'];

const env = process.env;
env.PORT += 1;
createServer(env).listen(env.PORT, runTests);

async function runTests({ PORT, TEST_URL } = env) {
  const args = ["--ignore-certificate-errors"];
  const browser = await chromium.launch({ headless: true, args });
  const page = await browser.newPage();
  const url = TEST_URL || `http://localhost:${PORT}/?test=1`;
  const browserEnv = Object.fromEntries(BROWSER_ENV_VARS.map(k => [k, env[k]]));
  await page.addInitScript(data => {
    for (const [k, v] of Object.entries(data)) localStorage.setItem(k, v);
  }, browserEnv);
  page.on("pageerror", (error) => console.error(error));
  page.on("crash", () => console.error("Page crashed"));
  page.on("console", (msg) => console.log(msg.text()));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // eslint-disable-next-line no-undef
  await page.waitForFunction(() => window.TESTS_DONE === true, { timeout: 60 * 60 * 1000 });
  await browser.close();
  process.exit(0);
}