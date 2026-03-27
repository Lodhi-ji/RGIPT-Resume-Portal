const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Skip download when PUPPETEER_SKIP_CHROMIUM_DOWNLOAD is set (Render sets this)
  // On Windows server, Chrome is already installed so download is also not needed
  skipDownload: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true',
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
