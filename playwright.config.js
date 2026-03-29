import { defineConfig } from '@playwright/test';
import { config as loadDotenv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

const e2eEnvPath = path.resolve(process.cwd(), '.env.e2e.local');
if (fs.existsSync(e2eEnvPath)) {
  loadDotenv({ path: e2eEnvPath });
}

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173/resources/js/app.js',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:8001',
    headless: true,
    trace: 'retain-on-failure',
  },
  reporter: [['list']],
});
