# IT Asset Project - Quick Reference

## 🚀 Getting Started (Local Development)

### Frontend
```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

### Backend  
```bash
cd server
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Database
```bash
# Create database
mysql -u root -p < server/db_init.sql
```

## 📋 Environment Setup

Copy `.env.example` → `.env` in both `client/` and `server/` folders

Frontend: Set `VITE_API_URL=http://localhost:5000`
Backend: Set database credentials to match your local MySQL

## 🌐 Deploy to Production

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deployment ready"
   git push origin main
   ```

2. **Railway (Backend)**
   - Create project → MySQL → Backend service
   - Set environment variables from ENV_VARIABLES.md
   - Run: `scripts/railway-init-db.sh HOST USER PASSWORD`

3. **Vercel (Frontend)**
   - Import repository → Set `VITE_API_URL` → Deploy

Full guide: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📚 Important Files

- **DEPLOYMENT_GUIDE.md** - Complete deployment walkthrough
- **ENV_VARIABLES.md** - All environment configuration
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment checklist
- **scripts/railway-init-db.sh** - Auto database initialization

## 🔗 Useful Links

- Frontend Docs: [DEPLOYMENT_GUIDE.md#part-3](DEPLOYMENT_GUIDE.md#part-3-deploy-frontend-to-vercel)
- Backend Docs: [DEPLOYMENT_GUIDE.md#part-2](DEPLOYMENT_GUIDE.md#part-2-deploy-backend--database-to-railway)
- Troubleshooting: [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#troubleshooting)

## ✅ Pre-Deployment Checklist

- [ ] Run `npm run build` in client/ → succeeds
- [ ] Run `python app.py` in server/ → no errors
- [ ] Test local API: `curl http://localhost:5000/api/ping`
- [ ] Test frontend login locally
- [ ] All `.env` files are in `.gitignore`
- [ ] Committed to GitHub

## 📞 Quick Troubleshooting

**Frontend can't connect to backend?**
- Check `VITE_API_URL` in Vercel environment
- Verify backend is running
- Check CORS_ORIGINS in Railway backend

**Database connection error?**
- Verify MySQL is running locally
- Check DB credentials in .env
- On Railway: Use Railway MySQL host, not localhost

**Build fails?**
- Check Vercel build logs
- Run `cd client && npm install && npm run build` locally
- Verify package.json exists

See [DEPLOYMENT_GUIDE.md#troubleshooting](DEPLOYMENT_GUIDE.md#troubleshooting) for detailed help.
