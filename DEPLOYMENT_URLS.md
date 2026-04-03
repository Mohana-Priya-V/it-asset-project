# DEPLOYMENT_URLS.md - Track Your Deployment URLs

Keep this file handy to track your production URLs and credentials during deployment.

## 🔗 Your Production URLs

Once deployed, fill in these values:

### Railway Backend
```
Backend Service URL: https://your-backend-xxxxx.railway.app
Database Host: your-mysqlhost-xxxxx.railway.app
Database Port: 3306
```

### Vercel Frontend
```
Frontend URL: https://your-project.vercel.app
```

---

## 🔑 Database Credentials (from Railway)

```
DB_HOST: ___________________________
DB_USER: ___________________________
DB_PASSWORD: ___________________________
DB_PORT: 3306
DB_NAME: itsm
```

⚠️ **KEEP THIS SECURE** - Don't share these credentials publicly

---

## ✅ Testing URLs

### Health Checks
```bash
# Test backend is alive
curl https://your-backend-xxxxx.railway.app/api/ping

# Test database connection
curl https://your-backend-xxxxx.railway.app/api/debug/connection
```

### User Credentials (for initial testing)
Initially, you'll need to create test users in the database. See DEPLOYMENT_GUIDE.md section on database initialization.

---

## 📋 Environment Variables to Set

### Vercel Frontend Environment
```
VITE_API_URL=https://your-backend-xxxxx.railway.app
```

### Railway Backend Environment
```
DB_HOST=your-mysqlhost-xxxxx.railway.app
DB_PORT=3306
DB_USER=<from Railway>
DB_PASSWORD=<from Railway>
DB_NAME=itsm
FLASK_ENV=production
FLASK_DEBUG=False
PORT=5000
CORS_ORIGINS=https://your-project.vercel.app
SECRET_KEY=<generate: python -c "import secrets; print(secrets.token_hex(32))">
```

---

## 📞 Support Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/YOUR_USERNAME/it-asset-project

---

## 🔄 Redeploy Commands

### Trigger Vercel Redeploy
```bash
git push origin main  # Auto-deploys
# OR manually: Vercel Dashboard → Deployments → Redeploy
```

### Redeploy on Railway
```bash
# Railway auto-deploys on git push
# OR: Railway Dashboard → Service → Deployment History → Redeploy
```

---

## 💾 Backup Information

### Database Backups
- Railway MySQL backups: https://railway.app/dashboard → MySQL service → Data
- Manual backup: `mysqldump -h HOST -u USER -pPASSWORD itsm > backup.sql`

### Code Backup
- GitHub branches: https://github.com/YOUR_USERNAME/it-asset-project

---

## 📊 Monitoring

### Railway Logs
```
Dashboard → Backend Service → Deployments → View Logs
```

### Vercel Logs
```
Dashboard → Project → Deployments → Click latest → View Build Logs
```

### Frontend Network Errors
```
Browser DevTools (F12) → Network tab → Check API calls
```

---

## 🚨 Emergency Rollback

If issues occur:

1. **Frontend Issues**: Vercel Dashboard → Deployments → Previous → Redeploy
2. **Backend Issues**: Railway Dashboard → Service → Deployments → Previous → Redeploy
3. **Database Issues**: Restore from Railway backup

---

## ✨ Post-Deployment Checklist

- [ ] All 3 services deployed (Frontend, Backend, Database)
- [ ] `/api/ping` returns 200
- [ ] `/api/debug/connection` shows database info
- [ ] Frontend loads without errors
- [ ] Can login with test credentials
- [ ] API calls from frontend work
- [ ] CORS errors resolved
- [ ] Database queries respond
- [ ] Logs show no critical errors
- [ ] Performance acceptable (<2s page load)

---

## 📝 Notes

Use this section to track any issues or custom configurations:

```
[Date]: [Issue/Note]
Example: 2026-04-03: Changed CORS to allow subdomain.vercel.app
```

---

**Last Updated**: [Your Deployment Date]
**Status**: 🟢 Ready for Deployment
