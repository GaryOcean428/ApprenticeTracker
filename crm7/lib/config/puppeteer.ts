import puppeteer, { type Browser } from 'puppeteer';
import { logger } from '@/lib/logger';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });
    } catch (error) {
      logger.error('Failed to launch browser:', { error });
      throw error;
    }
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    try {
      await browser.close();
      browser = null;
    } catch (error) {
      logger.error('Failed to close browser:', { error });
      throw error;
    }
  }
}
