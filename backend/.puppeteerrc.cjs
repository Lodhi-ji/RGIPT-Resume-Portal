const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Always skip download - we use system Chrome/Chromium
  // On Windows server: set PUPPETEER_EXECUTABLE_PATH to Chrome path in .env
  // On Linux/Docker: /usr/bin/chromium or /usr/bin/chromium-browser
  skipDownload: true,
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
