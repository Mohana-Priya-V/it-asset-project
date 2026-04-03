# Deployment Guide - IT Asset Project

This document provides step-by-step instructions for deploying the IT Asset Project to Vercel (frontend) and Railway (backend + database).

## Project Architecture

- **Frontend**: React + Vite → Vercel
- **Backend**: Flask + Python → Railway
- **Database**: MySQL → Railway

---

## Prerequisites

Before starting, ensure you have:

1. **GitHub Account** - For connecting repositories
2. **Vercel Account** - https://vercel.com (free tier available)
3. **Railway Account** - https://railway.app (free tier available)
4. **Git** - For version control

---

## Part 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd it-asset-project
git init
git add .
git commit -m "Initial commit: deployment-ready configuration"
git branch -M main
```

### 1.2 Push to GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/it-asset-project.git
git push -u origin main
```

---

## Part 2: Deploy Backend & Database to Railway

### Step 2.1: Create Railway Project

1. Go to https://railway.app
2. Click **"Create New Project"**
3. Select **"MySQL"** from the service list
4. A MySQL database will be created automatically

### Step 2.2: Add Flask Backend Service

1. In the Railway project, click **"New Service"**
2. Select **"Empty Service"**
3. Name it: `backend` or `flask-app`
4. Connect it to your GitHub repository

### Step 2.3: Configure Backend Service

#### Environment Variables

In Railway dashboard for the backend service, add these variables:

```
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
DB_HOST={your-mysql-host}
DB_PORT=3306
DB_USER=root
DB_PASSWORD={your-mysql-password}
DB_NAME=itsm
CORS_ORIGINS=https://your-vercel-frontend.vercel.app
SECRET_KEY={generate-random-string-here}
```

**Get MySQL credentials from Railway:**
- Go to the MySQL service variables tab
- Copy the `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLHOST` values
- Set `DB_NAME=itsm`

#### Start Command

Railway should detect your Python app automatically. If not:
- Start Command: `python app.py`
- Root Directory: `server`

#### Build Command (if needed)

```
pip install -r requirements.txt
```

### Step 2.4: Initialize Database

1. Go to the MySQL service in Railway
2. Click the **"Connect"** tab
3. Use the provided connection string to run the database initialization

```bash
# Using the command line connection provided by Railway
mysql -h{host} -u{user} -p{password} < server/db_init.sql
```

Or you can manually run the SQL from [server/db_init.sql](../server/db_init.sql) using a MySQL client.

### Step 2.5: Test Backend

Once deployed, test the API:

```bash
curl https://{your-railway-backend-url}.railway.app/api/ping
```

You should see: `{"status": "ok", "message": "pong"}`

---

## Part 3: Deploy Frontend to Vercel

### Step 3.1: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Select your GitHub repository (`it-asset-project`)
4. Vercel will auto-detect it as a Vite project

### Step 3.2: Configure Build Settings

Vercel should detect these automatically:

- **Framework**: Vite
- **Build Command**: `npm run build` (from client folder)
- **Output Directory**: `client/dist`
- **Install Command**: `npm install`

If not auto-detected, set them manually:
1. Click **"Settings"** → **"Build & Development Settings"**
2. Configure Root Directory: `client`
3. Framework: `Vite`

### Step 3.3: Set Environment Variables

In Vercel project settings, add environment variables:

```
VITE_API_URL=https://{your-railway-backend-url}.railway.app
```

Get your Railway backend URL from:
- Railway Dashboard → Backend Service → Domains tab

### Step 3.4: Deploy

Vercel will automatically deploy on push to main branch. You can also manually trigger:

1. Click the **"Deployments"** tab
2. Click **"Redeploy"** on the latest commit

---

## Part 4: Verify Deployment

### 4.1 Test Backend API

```bash
# Replace with your Railway URL
curl https://your-backend.railway.app/api/ping
curl https://your-backend.railway.app/api/debug/connection
```

### 4.2 Test Frontend

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Open browser DevTools (F12)
3. Check the Console for any API errors
4. Try logging in (test with the database data)

### 4.3 Check Logs

**Railway Logs:**
- Go to your service → **"Deployments"** → Click latest → **"View Logs"**

**Vercel Logs:**
- Go to project → **"Deployments"** → Click latest → **"View"** → **"View Build Logs"**

---

## Part 5: Update Frontend API Base URL

After deploying to Railway, update your frontend environment:

### Option 1: Using Vercel Dashboard

1. Go to Vercel Project Settings
2. Environment Variables
3. Update `VITE_API_URL` to your Railway backend URL

### Option 2: Using Git

Update [client/.env.example](../client/.env.example):

```
VITE_API_URL=https://your-railway-backend.railway.app
```

Then push:

```bash
git add client/.env.example
git commit -m "Update API URL for production"
git push origin main
```

---

## Part 6: Database Backups & Maintenance

### MySQL Backups on Railway

Railway provides automated backups. To access:

1. Go to MySQL service
2. Click **"Data"** tab
3. Download backups if available

### Manual Backup

```bash
# Export database
mysqldump -h{host} -u{user} -p{password} itsm > backup.sql

# Import database
mysql -h{host} -u{user} -p{password} itsm < backup.sql
```

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Error**: CORS error or 404 in browser console

**Solution**:
1. Verify `VITE_API_URL` is set correctly in Vercel environment
2. Check CORS_ORIGINS in Railway backend matches your Vercel URL
3. Ensure Flask is running: `curl https://your-backend.railway.app/api/ping`

### Issue: Database connection fails

**Error**: `Connection refused` or `Access denied for user`

**Solution**:
1. Verify MySQL is running on Railway
2. Check DB credentials match in environment variables
3. Ensure `DB_HOST` is the private Railway hostname (not localhost)

### Issue: Build fails on Vercel

**Error**: `npm ERR!` or build errors

**Solution**:
1. Check Vercel build logs
2. Verify `package.json` and `node_modules` exist
3. Run locally: `cd client && npm install && npm run build`

### Issue: 500 errors on backend

**Error**: Server error responses

**Solution**:
1. Check Railway backend logs
2. Verify all environment variables are set
3. Test database connection: visit `/api/debug/connection`

---

## Production Checklist

Before going live:

- [ ] Database initialized with `db_init.sql`
- [ ] Backend environment variables set (DB credentials, FLASK_ENV=production, CORS_ORIGINS)
- [ ] Frontend environment variables set (VITE_API_URL pointing to Railway backend)
- [ ] Backend CORS allows frontend domain
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled (automatic on Railway & Vercel)
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test file uploads (if applicable)
- [ ] Monitor logs for errors

---

## Scaling & Advanced Configuration

### Railway: Enable Auto-scaling

1. Go to Backend service settings
2. Enable **"Autoscaling"** (paid feature)
3. Set min/max replicas

### Railway: Custom Domain

1. Go to Backend service → **"Settings"**
2. Add custom domain
3. Configure DNS records

### Vercel: Custom Domain

1. Go to Project Settings → **"Domains"**
2. Add your domain
3. Update DNS accordingly

---

## Quick Reference Commands

```bash
# Local development
cd client && npm run dev              # Start frontend
cd server && python app.py            # Start backend

# Build frontend
cd client && npm run build

# Test API
curl http://localhost:5000/api/ping

# Deploy (git push triggers automatic deployment)
git push origin main
```

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Flask Docs**: https://flask.palletsprojects.com
- **React Docs**: https://react.dev
- **MySQL Docs**: https://dev.mysql.com/doc

---

## Security Notes

1. **Never commit `.env` files** - Only commit `.env.example`
2. **Generate secure SECRET_KEY** for Flask:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
3. **Use strong database passwords** - Railway generates these for you
4. **Enable HTTPS** - Both Railway and Vercel provide automatic SSL
5. **Rotate credentials regularly**
6. **Monitor access logs** for suspicious activity

---

Last Updated: April 2026
