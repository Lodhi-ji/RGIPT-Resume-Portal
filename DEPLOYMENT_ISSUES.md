# Common Deployment Issues & Solutions

## 🐌 Slow Deployment Issues

### 1. Puppeteer Downloading Chromium (FIXED)
**Problem:** Puppeteer tries to download 170-300MB Chromium binary
**Solution:** 
- Added `.puppeteerrc.cjs` to skip download
- Added `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` config
- Use system Chromium: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser`

### 2. Large Dependencies
**Current Issues:**
- `puppeteer` (21.5.0) - Heavy package
- `mongoose` (8.0.0) - Large package
- Multiple test dependencies in production

**Solutions:**
```bash
# Move test dependencies to devDependencies (already done)
# Consider puppeteer-core instead of puppeteer (lighter)
```

### 3. Files That Shouldn't Be in Git
**Found in your repo:**
- ❌ PDF files (5 files, ~400KB) - Should be in .gitignore
- ❌ Excel temp file `~$sample-students.xlsx`
- ⚠️ Test files (not critical but unnecessary in production)
- ⚠️ Sample data files

**Fix:** Update .gitignore and remove from git history

### 4. Render Free Tier Limitations
**Known Issues:**
- Limited CPU/RAM during build
- Slower network speeds
- Build timeout (15 minutes max)
- Cold starts after inactivity

## 🚨 Current Deployment Blockers

### If stuck at "Running build command 'npm install'":

**Option 1: Cancel and Retry**
1. Cancel current deployment in Render
2. Push the Puppeteer fixes I just made
3. Redeploy

**Option 2: Check Render Logs**
Look for:
- `Downloading Chromium` - Puppeteer issue
- `ETIMEDOUT` - Network timeout
- `ENOMEM` - Out of memory
- `killed` - Process killed by system

**Option 3: Use Render Blueprint**
The `render.yaml` I created can help Render optimize the build.

## ⚡ Quick Fixes to Try Now

### 1. Add Environment Variable in Render Dashboard
Before deploying, add:
```
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

### 2. Optimize package.json (Alternative)
Replace `puppeteer` with `puppeteer-core`:
```json
"puppeteer-core": "^21.5.0"
```
Then install Chromium separately on Render.

### 3. Use Render's Native Build Pack
In Render dashboard:
- Build Command: `npm ci --only=production`
- This is faster than `npm install`

### 4. Reduce Memory Usage
Add to Render environment variables:
```
NODE_OPTIONS=--max-old-space-size=512
```

## 🔍 Debugging Steps

### Check What's Taking Time:
1. Go to Render Dashboard → Your Service → Logs
2. Look for the last line printed
3. Common culprits:
   - `> puppeteer@21.5.0 install` - Stuck downloading Chromium
   - `npm WARN` - Dependency conflicts
   - No output for 5+ minutes - Likely timeout/hang

### If Deployment Fails:
1. Check if it's a timeout (>15 min)
2. Check memory usage in logs
3. Try deploying with fewer dependencies first

## 💡 Recommended Actions

### Immediate (Do Now):
1. ✅ Push the Puppeteer fixes I created
2. ✅ Add `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true` in Render
3. ✅ Cancel current stuck deployment
4. ✅ Redeploy with new config

### Short-term (After First Deploy):
1. Remove PDF files from git:
   ```bash
   git rm backend/*.pdf
   git commit -m "Remove PDF files from repository"
   ```

2. Update .gitignore to prevent future issues:
   ```
   *.pdf
   *.xlsx
   ~$*
   test-*.js
   ```

3. Consider using `puppeteer-core` instead of full `puppeteer`

### Long-term (Optimization):
1. Move to Render paid tier for better performance
2. Use external storage (S3/Cloudinary) for PDFs
3. Implement caching strategies
4. Consider serverless functions for PDF generation

## 📊 Expected Build Times

### Render Free Tier:
- **Normal:** 2-5 minutes
- **With Puppeteer (downloading):** 10-30 minutes or timeout
- **With fixes:** 2-5 minutes

### What Takes Time:
1. `npm install` - 1-3 minutes
2. Installing native dependencies - 1-2 minutes
3. Puppeteer Chromium download - 5-20 minutes (SKIP THIS!)

## 🎯 Your Current Status

**Problem:** Stuck at `npm install` for 30 minutes
**Likely Cause:** Puppeteer downloading Chromium
**Solution:** Use the fixes I just created

**Next Steps:**
1. Cancel current deployment
2. Commit and push the new files:
   - `backend/package.json` (updated)
   - `backend/.puppeteerrc.cjs` (new)
   - `backend/render.yaml` (new)
3. Add environment variable in Render
4. Redeploy

## 🆘 If Still Stuck

Try this minimal approach:
1. Temporarily remove `puppeteer` from dependencies
2. Deploy successfully
3. Add `puppeteer-core` back
4. Configure to use system Chromium
