# Quick Deployment Checklist

## ✅ Pre-Deployment Checklist

### Your app is ready to deploy! Here's what's configured:

**Frontend (Vercel):**
- ✅ Build script configured (`npm run build`)
- ✅ Vite configuration ready
- ✅ Environment variable support (`.env.production`)
- ✅ `vercel.json` with SPA routing
- ✅ Security headers configured

**Backend (Render):**
- ✅ Start script configured (`npm start`)
- ✅ CORS configured for production
- ✅ Environment variables documented
- ✅ Health check endpoint (`/api/health`)
- ✅ Error handling middleware
- ✅ Puppeteer support for PDF generation

## 🚀 Quick Deploy Steps

### 1. Backend on Render (Do This First!)
```
1. Go to render.com → New Web Service
2. Connect GitHub repo
3. Root Directory: backend
4. Build: npm install
5. Start: npm start
6. Add environment variables (see DEPLOYMENT_GUIDE.md)
7. Deploy!
8. Copy your backend URL
```

### 2. Frontend on Vercel
```
1. Update frontend/.env.production with backend URL
2. Commit and push to GitHub
3. Go to vercel.com → New Project
4. Import GitHub repo
5. Root Directory: frontend
6. Framework: Vite
7. Add VITE_API_URL environment variable
8. Deploy!
9. Copy your frontend URL
```

### 3. Update Backend CORS
```
1. Go back to Render
2. Add FRONTEND_URL environment variable with Vercel URL
3. Save (auto-redeploys)
```

## 🔑 Required Environment Variables

### Backend (Render)
```env
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<random-32-char-string>
FRONTEND_URL=<your-vercel-url>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<app-password>
PORTAL_URL=<your-vercel-url>
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Frontend (Vercel)
```env
VITE_API_URL=<your-render-url>/api
```

## 🧪 Test After Deployment
- Visit your Vercel URL
- Login with: `priya.sharma@rgipt.ac.in` / `Pass@123`
- Test PDF generation
- Test admin features with: `admin@rgipt.ac.in` / `Admin@RGIPT`

## 📚 Need More Details?
See `DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

## ⚠️ Important Notes
- Render free tier spins down after 15 min inactivity (first request may be slow)
- Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use Gmail App Password for SMTP (not your regular password)
- Whitelist 0.0.0.0/0 in MongoDB Atlas for Render access
