const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Skip downloading Chromium - use system Chromium on Render
  skipDownload: true,
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
