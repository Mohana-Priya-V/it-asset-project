# Deployment Checklist - Copy & Paste Reference

Use this as a quick reference while deploying. Check off each step as you complete it.

---

## STEP 1: GitHub Setup

- [ ] Code committed and pushed to GitHub
- [ ] Repository URL: `https://github.com/USERNAME/it-asset-project`

---

## STEP 2: Railway - MySQL Database

### Create Database
- [ ] Go to https://railway.app
- [ ] Click **"Create New Project"**
- [ ] Click **"MySQL"** from the list
- [ ] Wait for initialization

### Copy Database Credentials
Go to **Variables** tab and copy these values:

```
DB_HOST = ________________________
DB_USER = root
DB_PASSWORD = ________________________
DB_PORT = 3306
DB_NAME = itsm
```

### Initialize Database
- [ ] Run the database initialization:
  ```bash
  mysql -h [DB_HOST] -u [DB_USER] -p[DB_PASSWORD] < server/db_init.sql
  ```
  Replace bracketed values with your actual values (no brackets)

- [ ] If the above doesn't work, use Railway's web interface to run `server/db_init.sql`

---

## STEP 3: Railway - Flask Backend

### Create Backend Service
- [ ] In Railway, click **"New"** or **"+ Add Service"**
- [ ] Click **"GitHub Repo"**
- [ ] Select your GitHub repository: **"it-asset-project"**
- [ ] Select branch: **"main"**
- [ ] Click **"Create"** or **"Deploy"**
- [ ] Wait for detection (should see "Python detected")

### Set Environment Variables
In Railway backend service, go to **Variables** and add these exact variables:

| Key | Value |
|-----|-------|
| DB_HOST | `[paste from above]` |
| DB_USER | `root` |
| DB_PASSWORD | `[paste from above]` |
| DB_PORT | `3306` |
| DB_NAME | `itsm` |
| FLASK_ENV | `production` |
| FLASK_DEBUG | `False` |
| PORT | `5000` |
| SECRET_KEY | `random-string-here-12345` |
| CORS_ORIGINS | `http://localhost:5173` |

- [ ] All 10 variables added
- [ ] Click **"Deploy"** or wait for auto-deployment
- [ ] Check **"Deployments"** - wait for green checkmark

### Get Backend URL
- [ ] Go to backend service **"Settings"** or **"Domains"**
- [ ] Copy your public URL:
  ```
  BACKEND_URL = https://__________________.railway.app
  ```
- [ ] Test it: Open in browser: `https://[your-url]/api/ping`
- [ ] You should see: `{"status":"ok","message":"pong"}`

---

## STEP 4: Vercel - React Frontend

### Create Project on Vercel
- [ ] Go to https://vercel.com
- [ ] Log in with GitHub
- [ ] Click **"Add New"** → **"Project"**
- [ ] Click **"Import Project"**
- [ ] Paste repository URL: `https://github.com/USERNAME/it-asset-project`
- [ ] Press Enter

### Configure Build Settings
- [ ] **Root Directory**: Select **"client"** from dropdown
- [ ] **Build Command**: Should show `npm run build`
- [ ] **Output Directory**: Should show `dist`
- [ ] Click **"Environment Variables"** to expand

### Add Environment Variable
- [ ] In **Key** field: type `VITE_API_URL`
- [ ] In **Value** field: paste `https://[your-backend-url].railway.app`
- [ ] Click **"Add"**
- [ ] Click **"Deploy"**
- [ ] Wait for green checkmark

### Get Frontend URL
- [ ] Copy your Vercel URL:
  ```
  FRONTEND_URL = https://________________.vercel.app
  ```

---

## STEP 5: Update Backend CORS

Now update your backend to allow your frontend:

- [ ] Go back to Railway backend service
- [ ] Click **"Variables"** tab
- [ ] Find **"CORS_ORIGINS"** variable
- [ ] Change its value to: `https://[your-vercel-url].vercel.app`
  - Example: `https://my-project-123.vercel.app`
- [ ] Press Enter to save
- [ ] Click **"Redeploy"** button
- [ ] Wait 1 minute for restart

---

## STEP 6: Final Testing

### Test Backend
- [ ] Open browser
- [ ] Go to: `https://[your-backend-url]/api/ping`
- [ ] See: `{"status":"ok","message":"pong"}` ✅

### Test Frontend Loads
- [ ] Go to: `https://[your-vercel-url].vercel.app`
- [ ] Page loads ✅

### Test No Errors
- [ ] Open **F12** (Developer Tools)
- [ ] Click **"Console"** tab
- [ ] Look for red error messages
- [ ] If NO CORS errors: ✅ You're done!

### If You See CORS Errors
- [ ] Go back to Railway backend
- [ ] Check CORS_ORIGINS matches your Vercel URL exactly
- [ ] Make sure it starts with `https://` (not `http://`)
- [ ] Click Redeploy
- [ ] Wait 1 minute
- [ ] Refresh frontend page (Ctrl+Shift+R)

---

## STEP 7: Verify Everything

Check these boxes:

- [ ] Backend responds to `/api/ping`
- [ ] Frontend loads in your browser
- [ ] No red errors in browser console
- [ ] You can see the dashboard/login page

**If all checked: Your deployment is complete! 🎉**

---

## Saved Values Reference

Copy this section and fill in your actual values for future reference:

```
GITHUB:
Repository URL: ________________________________

RAILWAY - DATABASE:
DB_HOST: ________________________________
DB_USER: root
DB_PASSWORD: ________________________________
DB_PORT: 3306
DB_NAME: itsm

RAILWAY - BACKEND:
Backend URL: ________________________________
Backend Service Name: ________________________

VERCEL - FRONTEND:
Frontend URL: ________________________________
Frontend Project Name: ________________________

IMPORTANT URLS FOR TESTING:
API Ping: https://[backend-url]/api/ping
Debug Connection: https://[backend-url]/api/debug/connection
Frontend: https://[frontend-url]
```

---

## Troubleshooting Quick Links

**Backend not responding?**
→ Check Railway backend logs: Dashboard → Backend Service → Deployments → View Logs

**Frontend won't load?**
→ Check Vercel build logs: vercel.com → Project → Deployments → Latest → View Build Logs

**CORS errors?**
→ Check Railway CORS_ORIGINS variable matches your Vercel URL exactly

**Changes not showing?**
→ Make sure you `git push` to main branch, then wait 2-5 min for auto-deploy

---

## When Deployment is Complete

You'll have:
- ✅ MySQL database running 24/7
- ✅ Flask API running 24/7
- ✅ React frontend accessible globally
- ✅ Everything automatically updated when you push to GitHub

**Your app is now live on the internet!** 🚀

---

Print this page or bookmark it for quick reference!
