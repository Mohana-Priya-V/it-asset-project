# Deployment Checklist

Use this checklist to ensure your project is properly deployed to Vercel and Railway.

## Pre-Deployment

### Code Preparation
- [ ] All code committed to Git
- [ ] Repository pushed to GitHub
- [ ] No sensitive data in commits (check .gitignore)
- [ ] All `.env` files are in `.gitignore`
- [ ] `.env.example` files prepared with placeholders

### Local Testing
- [ ] Frontend builds successfully: `npm run build`
- [ ] Backend starts without errors: `python app.py`
- [ ] Can connect to local database
- [ ] API endpoints respond: test `/api/ping`
- [ ] Frontend connects to backend
- [ ] Login functionality works locally

---

## Railway Setup

### Database Setup
- [ ] Railway account created
- [ ] MySQL service created
- [ ] Database credentials noted
- [ ] `db_init.sql` executed successfully
- [ ] Tables verified in database

### Backend Service Setup
- [ ] Backend service created in Railway
- [ ] GitHub repository connected
- [ ] Python 3.11+ detected
- [ ] Environment variables set:
  - [ ] `DB_HOST` = Railway MySQL host
  - [ ] `DB_PORT` = 3306
  - [ ] `DB_USER` = Railway MySQL user
  - [ ] `DB_PASSWORD` = Railway MySQL password
  - [ ] `DB_NAME` = itsm
  - [ ] `FLASK_ENV` = production
  - [ ] `FLASK_DEBUG` = False
  - [ ] `PORT` = 5000
  - [ ] `CORS_ORIGINS` = (to be updated after Vercel URL)
  - [ ] `SECRET_KEY` = (generated random string)
- [ ] Build completes successfully
- [ ] Service deployed and running
- [ ] Testing: `/api/ping` responds with 200
- [ ] Testing: `/api/debug/connection` shows database info
- [ ] Backend URL noted (e.g., `your-app-backend.railway.app`)

---

## Vercel Setup

### Frontend Service Setup
- [ ] Vercel account created
- [ ] Project created from GitHub repository
- [ ] Build settings detected correctly:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Root Directory: `client`
- [ ] Environment variables set:
  - [ ] `VITE_API_URL` = Railway backend URL
  - [ ] `VITE_DEBUG` = false (optional)
- [ ] Build completes successfully
- [ ] Frontend deployed and accessible
- [ ] Frontend URL noted (e.g., `your-app.vercel.app`)

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Update Railway backend environment variable:
  - [ ] `CORS_ORIGINS` = Vercel frontend URL (e.g., `https://your-app.vercel.app`)
- [ ] Restart backend service in Railway

---

## Testing & Verification

### API Testing
- [ ] Ping endpoint responds: `GET /api/ping`
- [ ] Debug connection works: `GET /api/debug/connection`
- [ ] Database queries execute successfully
- [ ] Authentication endpoints work: `POST /api/auth/login`
- [ ] Asset endpoints work: `GET /api/assets`
- [ ] User endpoints work: `GET /api/users`

### Frontend Testing
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] Can navigate to all pages
- [ ] Login form visible and functional
- [ ] Can submit login credentials
- [ ] Dashboard loads after login
- [ ] Can view assets list
- [ ] Can create/edit/delete assets
- [ ] Can manage users
- [ ] Can assign assets

### Performance Testing
- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 1 second
- [ ] Database queries are responsive
- [ ] No 404 or 500 errors in production logs

---

## Monitoring & Maintenance

### Logs Setup
- [ ] Railway backend logs accessible
- [ ] Vercel frontend logs accessible
- [ ] Log rotation configured (if applicable)
- [ ] Error alerts configured

### Backups
- [ ] Database backups enabled
- [ ] Backup schedule configured
- [ ] Restore process tested
- [ ] Backup location documented

### Security
- [ ] HTTPS enabled on both services (automatic)
- [ ] SECRET_KEY is strong and random
- [ ] Database password is strong
- [ ] No hardcoded secrets in code
- [ ] API rate limiting considered
- [ ] CORS is properly restrictive

### Documentation
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] ENV_VARIABLES.md reviewed
- [ ] Team members given access
- [ ] Emergency contacts documented

---

## Production Readiness

### Code Quality
- [ ] No console.errors in frontend
- [ ] No Python warnings in backend
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm test` and `pytest`
- [ ] No commented-out code blocks
- [ ] Error handling implemented

### Configuration
- [ ] Production database separate from development
- [ ] All environment variables set
- [ ] API base URL correct
- [ ] Database initialization script tested
- [ ] Build artifacts optimized

### Scalability Considerations
- [ ] Database indexes configured
- [ ] Connection pooling enabled
- [ ] Static assets cached
- [ ] API responses optimized
- [ ] Logging levels appropriate

---

## Common Issues & Solutions

### Issue: "Connection refused" on backend startup
- [ ] Verify database credentials in environment variables
- [ ] Check Railway MySQL is running
- [ ] Ensure `DB_HOST` is Railway endpoint (not localhost)
- [ ] Restart backend service

### Issue: CORS errors in frontend
- [ ] Verify `CORS_ORIGINS` includes frontend URL
- [ ] Check exact URL format (https, no trailing slash)
- [ ] Restart backend after changing CORS_ORIGINS
- [ ] Check browser console for exact CORS error message

### Issue: Frontend can't find API
- [ ] Verify `VITE_API_URL` is set in Vercel
- [ ] Check API URL format (no `/api` suffix needed)
- [ ] Test backend URL directly: `curl https://backend-url/api/ping`
- [ ] Check frontend network tab in DevTools

### Issue: Build fails on Vercel
- [ ] Check Vercel build logs for errors
- [ ] Verify `package.json` exists in `client/`
- [ ] Run locally: `cd client && npm install && npm run build`
- [ ] Check for Node version compatibility

---

## Rollback Procedure

If issues arise:

1. **Frontend Issues**
   - [ ] Go to Vercel Deployments
   - [ ] Click previous deployment
   - [ ] Click "Redeploy"

2. **Backend Issues**
   - [ ] Go to Railway Backend service
   - [ ] View deployment history
   - [ ] Restart previous version

3. **Database Issues**
   - [ ] Restore from Railway backup
   - [ ] Re-run `db_init.sql` if needed

---

## Post-Launch

### Daily
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify database connectivity

### Weekly
- [ ] Review user feedback
- [ ] Check security logs
- [ ] Verify backups completed

### Monthly
- [ ] Performance review
- [ ] Dependency updates check
- [ ] Access review

---

**Status**: Ready for deployment
**Last Updated**: April 2026
**Deployment Environment**: Vercel (Frontend) + Railway (Backend + Database)
