# Beginner's Troubleshooting Guide

## Common Errors & Exact Solutions

When something goes wrong, find your error below and follow the exact steps to fix it.

---

## 🔴 ERROR: "Deployment failed" on Railway

### What You'll See
- Red error message on Railway dashboard
- Deployment shows "Failed"
- Backend not responding

### How to Fix It

**Step 1: Check the Logs**
1. Go to Railway dashboard
2. Click your backend service (Flask app)
3. Click **"Deployments"** tab
4. Click the latest failed deployment
5. Look for **"Logs"** or **"View Logs"** button
6. Click it and read the error message carefully

**Step 2: Most Common Causes**

**If error says "cannot find module" or "ImportError":**
- Your `requirements.txt` is missing a package
- Solution:
  1. Open `server/requirements.txt` in your code editor
  2. Make sure it has `Flask`, `flask-cors`, `SQLAlchemy`, `PyMySQL`
  3. Save the file
  4. Commit and push: 
     ```bash
     git add server/requirements.txt
     git commit -m "fix requirements"
     git push origin main
     ```
  5. Railway will auto-redeploy

**If error says "connection refused" or "Access denied":**
- Your database credentials are wrong
- Solution:
  1. Go to Railway MySQL service
  2. Click **"Variables"** tab
  3. Copy the correct `MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`
  4. Go back to your backend service
  5. Click **"Variables"**
  6. Find and update `DB_HOST`, `DB_USER`, `DB_PASSWORD` with correct values
  7. Click **"Redeploy"**

**If error says "Port already in use":**
- Solution:
  1. Go to backend service **"Variables"**
  2. Find `PORT` variable
  3. Change it from `5000` to `5001`
  4. Click **"Redeploy"**

---

## 🔴 ERROR: "Build failed" on Vercel

### What You'll See
- Vercel shows red "X" on deployment
- Error message mentions build failure
- Frontend URL not working

### How to Fix It

**Step 1: Check Build Logs**
1. Go to vercel.com
2. Click your project
3. Click **"Deployments"** tab
4. Click the failed deployment
5. Look for **"View Build Logs"** button
6. Read the error carefully

**Step 2: Most Common Causes**

**If error mentions "cannot find module":**
- Missing dependencies in `client/package.json`
- Solution:
  1. Open terminal in `client` folder
  2. Run: `npm install`
  3. Commit and push:
     ```bash
     git add client/package-lock.json
     git commit -m "update dependencies"
     git push origin main
     ```

**If error mentions "env variable":**
- Missing `VITE_API_URL` environment variable
- Solution:
  1. Go to Vercel project
  2. Click **"Settings"** tab
  3. Click **"Environment Variables"**
  4. Add new variable: `VITE_API_URL` = `https://[your-backend-url]`
  5. Go to **"Deployments"**
  6. Click **"Redeploy"** button

**If error mentions TypeScript or compilation:**
- Your code has syntax errors
- Solution:
  1. Run locally: `cd client && npm run build`
  2. Read the error message
  3. Fix the error in your code
  4. Commit and push
  5. Vercel will auto-redeploy

---

## 🔴 ERROR: "CORS error" in Browser Console

### What You'll See
In browser Developer Tools (F12 → Console):
```
Access to XMLHttpRequest at 'https://backend-url' from origin 'https://frontend-url' 
has been blocked by CORS policy
```

### How to Fix It

1. Go to Railway dashboard
2. Click your backend service
3. Click **"Variables"**
4. Find the variable **"CORS_ORIGINS"**
5. Check its value:
   - It should be your exact Vercel frontend URL
   - Example: `https://my-project-123abc.vercel.app`
   - Make sure it starts with `https://` (not `http://`)
   - Make sure there's NO trailing slash at the end

6. If the value is wrong:
   - Click on the value field
   - Delete the current value
   - Type the correct value from your Vercel URL
   - Press Enter to save

7. Click **"Redeploy"** button
8. Wait 30-60 seconds
9. Go back to your frontend
10. Press **Ctrl + Shift + R** to force refresh browser cache
11. Check browser console again - error should be gone

---

## 🔴 ERROR: "Connection refused" or API Not Responding

### What You'll See
- Frontend shows error or blank page
- Browser console shows "Connection refused"
- Or when testing `/api/ping`, you get no response

### How to Fix It

**Step 1: Test Backend Directly**
1. Open a new browser tab
2. Go to: `https://[your-backend-url]/api/ping`
3. You should see: `{"status":"ok","message":"pong"}`

**If you DON'T see this:**
- Your backend isn't running
- Go to Railway backend service
- Click **"Deployments"**
- Check the latest deployment has a green checkmark
- If not green:
  - Click **"Redeploy"** button
  - Wait 2-5 minutes
  - Try the ping URL again

**If you STILL can't reach it:**
- Backend may not have deployed successfully
- Check the deployment logs:
  1. Go to Railway backend service
  2. Click **"Deployments"**
  3. Click the latest one
  4. Click **"View Logs"**
  5. Look for errors
  6. Fix errors if any
  7. Click **"Redeploy"**

**Step 2: Check Frontend Variable**
- Go to Vercel project
- Click **"Settings"**
- Click **"Environment Variables"**
- Find `VITE_API_URL`
- Make sure it has your backend URL (not `http://localhost`)
- Click **"Redeploy"**

---

## 🔴 ERROR: "Database connection failed"

### What You'll See
- Backend shows error connecting to database
- Error message mentions "Access denied" or "Connection refused"
- In Railway logs: "MySQL connection failed"

### How to Fix It

**Step 1: Verify Database is Running**
1. Go to Railway MySQL service (not the backend)
2. You should see a green indicator
3. If red or disabled, click a restart/redeploy button

**Step 2: Verify Backend Credentials**
1. Go to Railway MySQL service
2. Click **"Variables"**
3. Copy the values:
   - `MYSQLHOST`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

4. Go to your backend service
5. Click **"Variables"**
6. Click each of these and verify they match:
   - `DB_HOST` = `MYSQLHOST` value
   - `DB_USER` = `MYSQLUSER` value (should be `root`)
   - `DB_PASSWORD` = `MYSQLPASSWORD` value
   - `DB_PORT` = `3306`
   - `DB_NAME` = `itsm`

7. If any are wrong, update them
8. Click **"Redeploy"**

**Step 3: Test Connection**
1. Go to your backend URL
2. Visit: `https://[your-backend-url]/api/debug/connection`
3. If you see database information, it's connected! ✅
4. If you see error, check credentials again

---

## 🔴 ERROR: "I don't see my latest code changes"

### What You'll See
- You made code changes
- Pushed to GitHub
- But the website still shows old content

### How to Fix It

**Step 1: Verify You Pushed to GitHub**
1. Open terminal in your project folder
2. Run: `git status`
3. If there are uncommitted changes:
   ```bash
   git add .
   git commit -m "my changes"
   git push origin main
   ```

**Step 2: Clear Browser Cache**
1. Press **Ctrl + Shift + Delete** on Windows
   - Or **Command + Shift + Delete** on Mac
2. Select "All time"
3. Check "Cookies and other site data"
4. Click "Clear data"
5. Refresh your website

**Step 3: Force Refresh**
1. Go to your website
2. Press **Ctrl + Shift + R** (force refresh)
3. This bypasses cache and loads fresh from server

**Step 4: Check Deployment Status**
- **For Vercel:**
  1. Go to vercel.com
  2. Click your project
  3. Click **"Deployments"**
  4. Latest should have a green checkmark
  5. If showing progress, wait for it to complete

- **For Railway:**
  1. Go to Railway dashboard
  2. Click backend service
  3. Click **"Deployments"**
  4. Latest should have green checkmark
  5. If showing progress, wait for it to complete

---

## 🟡 WARNING: "Slow Response Times"

### What You'll See
- Website takes 5+ seconds to load
- API calls take 10+ seconds
- Page is very sluggish

### Why This Happens
- Free tier services need warm-up time
- First request after inactive period is slow
- This is normal!

### How to Handle It
- Don't worry, this is normal for free hosting
- After first request, subsequent ones will be faster
- Website will perform better during peak usage times

---

## 🟡 WARNING: "502 Bad Gateway" Error

### What You'll See
```
502 Bad Gateway
The server returned an invalid or incomplete response.
```

### How to Fix It

This usually means the backend crashed or is restarting:

1. Go to Railway backend service
2. Click **"Deployments"**
3. Check if latest deployment is running
4. Click **"View Logs"** to see what happened
5. If there's an error, fix it:
   - Update code
   - Commit and push
   - Railway will auto-redeploy

6. While waiting, refresh your frontend
7. After 1-2 minutes, try again

---

## 🟡 WARNING: "502 Bad Gateway" from Railway MySQL

### What You'll See
```
Error: Connection to MySQL failed
```

### How to Fix It

1. Go to Railway project
2. Click MySQL service
3. Check it has green status indicator
4. If not green:
   - Click **"Settings"**
   - Look for restart/redeploy option
   - Click it
   - Wait 1-2 minutes

5. Go back to backend service
6. Click **"Redeploy"**
7. Wait for completion

---

## ✅ Everything Working but Want to Add Features

### After Deployment, to Add New Features:

1. Make changes to your code locally
2. Test locally (run `npm run dev` for frontend, `python app.py` for backend)
3. Commit and push:
   ```bash
   git add .
   git commit -m "describe your changes"
   git push origin main
   ```
4. Vercel and Railway automatically redeploy
5. Changes go live in 2-5 minutes

---

## 🆘 Still Can't Fix It?

**Try These Steps:**

1. **Check all Environment Variables**
   - Railway backend: verify DB_HOST, DB_USER, DB_PASSWORD, CORS_ORIGINS
   - Vercel frontend: verify VITE_API_URL
   - All should have values (not blank)

2. **Verify Database Exists**
   - Connect to Railway MySQL
   - Run: `USE itsm;`
   - Run: `SHOW TABLES;`
   - You should see tables like: users, assets, departments, etc.

3. **Check Git Status**
   ```bash
   git status
   # Should show "nothing to commit, working tree clean"
   # If not, run:
   git add .
   git commit -m "fix"
   git push origin main
   ```

4. **Manual Redeploy Everything**
   - Railway backend: Click Redeploy
   - Railway MySQL: Click Redeploy
   - Vercel: Click Redeploy
   - Wait 5 minutes
   - Test again

5. **Read the Actual Error Logs**
   - Don't guess - read the error message carefully
   - Usually the error message tells you exactly what's wrong
   - Google the error message if you don't understand it

---

## 📞 When to Get Help

If none of these work:
1. Take a screenshot of the error
2. Write down:
   - What you did
   - What error you saw
   - Where you saw it (browser console, Railway logs, Vercel logs)
3. Share this information with someone who can help
4. Ask on: Stack Overflow, Reddit r/learnprogramming, Discord communities

**Good luck! You've got this! 🚀**
