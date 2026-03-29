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
    command: 'php artisan serve --host=127.0.0.1 --port=8000',
    url: 'http://127.0.0.1:8000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:8000',
    headless: true,
    trace: 'retain-on-failure',
  },
  reporter: [['list']],
});
