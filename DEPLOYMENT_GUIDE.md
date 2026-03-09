# Deployment Guide

## Prerequisites
- GitHub account with this repository
- Vercel account (for frontend)
- Render account (for backend)
- MongoDB Atlas account (for database)

## Backend Deployment on Render

### Step 1: Prepare MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user with password
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Get your connection string (replace `<password>` with actual password)

### Step 2: Deploy Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `rgipt-resume-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_string_here_min_32_chars
   JWT_EXPIRE=7d
   
   # SMTP Configuration (for email features)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@rgipt.ac.in
   
   # Portal Configuration
   PORTAL_URL=https://your-frontend-app.vercel.app
   SUPPORT_EMAIL=support@rgipt.ac.in
   INSTITUTION_NAME=RGIPT
   
   # Frontend URL (will be updated after Vercel deployment)
   FRONTEND_URL=https://your-frontend-app.vercel.app
   
   # Puppeteer Configuration for Render
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://rgipt-resume-backend.onrender.com`)

### Step 3: Seed Database (Optional)
After backend is deployed, you can seed the database:
1. Go to Render Dashboard → Your Service → Shell
2. Run: `npm run seed`

## Frontend Deployment on Vercel

### Step 1: Update Environment Variables
1. Update `frontend/.env.production` with your Render backend URL:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

2. Commit and push changes:
   ```bash
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push origin main
   ```

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-app.onrender.com/api
   ```

6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your frontend URL (e.g., `https://rgipt-resume-portal.vercel.app`)

### Step 3: Update Backend CORS Settings
1. Go back to Render Dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```
3. Save changes (this will trigger a redeploy)

## Post-Deployment Steps

### 1. Test the Application
- Visit your Vercel frontend URL
- Try logging in with demo credentials:
  - Student: `priya.sharma@rgipt.ac.in` / `Pass@123`
  - Admin: `admin@rgipt.ac.in` / `Admin@RGIPT`

### 2. Configure Custom Domain (Optional)
**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records as instructed

### 3. Enable HTTPS
Both Vercel and Render provide automatic HTTPS certificates.

### 4. Monitor Your Application
**Render:**
- View logs in Dashboard → Logs
- Monitor metrics in Dashboard → Metrics

**Vercel:**
- View deployment logs in Dashboard → Deployments
- Monitor analytics in Dashboard → Analytics

## Important Notes

### Free Tier Limitations
**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 750 hours/month free (enough for one service)

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Security Checklist
- ✅ Change JWT_SECRET to a strong random string
- ✅ Use strong MongoDB password
- ✅ Configure SMTP with app-specific password
- ✅ Whitelist only necessary IPs in MongoDB (or use 0.0.0.0/0 for Render)
- ✅ Enable 2FA on all accounts (GitHub, Vercel, Render, MongoDB)

### Email Configuration
For Gmail SMTP:
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: Google Account → Security → 2-Step Verification → App passwords
3. Use the generated password in `SMTP_PASSWORD`

### Troubleshooting

**Backend Issues:**
- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set
- Check if Puppeteer is working (for PDF generation)

**Frontend Issues:**
- Check browser console for errors
- Verify API URL is correct
- Check CORS settings on backend
- Clear browser cache and try again

**PDF Generation Issues:**
- Render free tier may have issues with Puppeteer
- Consider upgrading to paid tier for better performance
- Check `PUPPETEER_EXECUTABLE_PATH` is set correctly

## Updating Your Application

### Backend Updates
1. Push changes to GitHub
2. Render will automatically redeploy

### Frontend Updates
1. Push changes to GitHub
2. Vercel will automatically redeploy

### Manual Redeploy
**Render:** Dashboard → Service → Manual Deploy → Deploy latest commit
**Vercel:** Dashboard → Deployments → Redeploy

## Support
For issues, check:
- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/

## Demo Credentials
After deployment, users can test with:
- **Student**: priya.sharma@rgipt.ac.in / Pass@123
- **Admin**: admin@rgipt.ac.in / Admin@RGIPT
