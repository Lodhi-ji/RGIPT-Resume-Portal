const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Skip downloading Chromium only in production - use system Chromium on Render
  skipDownload: process.env.NODE_ENV === 'production',
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
