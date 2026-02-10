# DoodleX Deployment Guide

## ✅ Fixed Issues

1. **TypeScript Configuration**: Added `composite: true` to enable project references
2. **Module Resolution**: Changed to `bundler` for proper workspace imports
3. **Missing Dependencies**: Added bcrypt, jsonwebtoken, cookie-parser, ws packages
4. **Backend Common Package**: Created proper index.ts and configured exports
5. **Import Paths**: Updated to use `@repo/backend-common` instead of `/config` suffix
6. **Turbo Build**: Added `dist/**` to outputs for backend service builds
7. **Security**: Updated Next.js to 15.1.9 and React to 19.0.1 (CVE-2025-55182 patched)

## 🚀 Deployment Steps on Server

### 1. Pull Latest Changes
\`\`\`bash
cd /opt/doodlex
git pull origin main
\`\`\`

### 2. Stop Existing Containers
\`\`\`bash
docker compose -f docker-compose.prod.yml down
\`\`\`

### 3. Update Environment Variables
\`\`\`bash
nano .env
\`\`\`

Ensure these are set:
\`\`\`env
DB_USER=postgres
DB_PASSWORD=your_strong_password_here
DB_NAME=doodlex
DATABASE_URL=postgresql://postgres:your_strong_password_here@postgres:5432/doodlex

JWT_SECRET=your_jwt_secret_here
GOOGLE_API_KEY=your_google_api_key_here

NEXT_PUBLIC_BACKEND_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws

NODE_ENV=production
\`\`\`

### 4. Rebuild Docker Images
\`\`\`bash
docker compose -f docker-compose.prod.yml build --no-cache
\`\`\`

### 5. Start Services
\`\`\`bash
docker compose -f docker-compose.prod.yml up -d
\`\`\`

### 6. Monitor Logs
\`\`\`bash
docker compose -f docker-compose.prod.yml logs -f
\`\`\`

### 7. Verify Services
\`\`\`bash
# Check containers are running
docker compose -f docker-compose.prod.yml ps

# Test frontend
curl https://your-domain.com

# Test backend API
curl https://your-domain.com/api/v1/health

# Check database
docker exec doodlex_postgres pg_isready -U postgres
\`\`\`

## 🔍 Troubleshooting

### If containers fail to start:

1. Check logs for specific service:
\`\`\`bash
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs ws
docker compose -f docker-compose.prod.yml logs frontend
\`\`\`

2. Check disk space:
\`\`\`bash
df -h
\`\`\`

3. Clean Docker cache:
\`\`\`bash
docker system prune -af
\`\`\`

4. Remove volumes and restart:
\`\`\`bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
\`\`\`

### If builds fail:

1. Check if all files are updated:
\`\`\`bash
git log --oneline -5
\`\`\`

2. Ensure .env file has all required variables
3. Check network connectivity for package downloads

## 📝 What Was Fixed

### Backend Services (http-server & ws-server)
- ✅ TypeScript now compiles successfully
- ✅ ES modules properly configured
- ✅ All dependencies installed
- ✅ Project references working correctly

### Frontend (Next.js)
- ✅ Updated to Next.js 15.1.9 (security patch)
- ✅ Updated to React 19.0.1 (security patch)
- ✅ Build pipeline working

### Database
- ✅ PostgreSQL configured correctly
- ✅ Migrations ready to run
- ✅ Prisma client generated

## 🎯 Expected Result

After deployment, all 4 services should be running:

1. **doodlex_postgres** - Database (port 5432)
2. **doodlex_backend** - HTTP API Server (port 3001)
3. **doodlex_ws** - WebSocket Server (port 8080)
4. **doodlex_frontend** - Next.js App (port 3000)

Access your application at: `https://your-domain.com`

## 🔐 Security Notes

- ✅ CVE-2025-55182 (React2Shell) - PATCHED
- Keep .env file secure (never commit to git)
- Use strong passwords for DB_PASSWORD and JWT_SECRET
- Regularly update dependencies

## 📞 Need Help?

If deployment fails:
1. Check container logs
2. Verify .env configuration
3. Ensure DNS is pointing to server
4. Confirm SSL certificates are valid (if using HTTPS)
