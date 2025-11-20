# Deployment Guide

Complete guide for deploying Multi-Sport Competition to production.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Build & Optimization](#build--optimization)
5. [Deployment Platforms](#deployment-platforms)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing: `npm run test`
- [ ] Linter clean: `npm run lint`
- [ ] No console errors in browser
- [ ] Error boundaries tested
- [ ] Build succeeds: `npm run build`

### Database

- [ ] Production Supabase project created
- [ ] All migrations applied (V2 schema)
- [ ] Row Level Security (RLS) policies enabled
- [ ] Backup strategy configured
- [ ] Database indexes created

### Environment

- [ ] `.env.production` configured
- [ ] API keys secured (not in git)
- [ ] CORS configured for production domain
- [ ] Rate limiting configured (Supabase)

### Assets

- [ ] Images optimized (compressed)
- [ ] Fonts loaded efficiently
- [ ] Icons included
- [ ] Favicon set

### Performance

- [ ] Lighthouse score > 90
- [ ] Code splitting verified
- [ ] Lazy loading implemented
- [ ] Bundle size < 500KB (initial)

### SEO

- [ ] Meta tags configured
- [ ] robots.txt present
- [ ] Sitemap generated
- [ ] Open Graph images set
- [ ] Canonical URLs configured

---

## Environment Configuration

### 1. Create Environment Files

Create `.env.production` in `multi-sport-competition/`:

```env
# Supabase Production
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# App Configuration
VITE_APP_NAME=Multi-Sport Competition
VITE_APP_URL=https://yourdomain.com
VITE_APP_ENV=production

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Error Tracking (optional)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 2. Verify Environment Variables

```bash
cd multi-sport-competition
npm run build
```

Check that all `import.meta.env.VITE_*` variables are replaced in build.

---

## Database Setup

### 1. Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose region closest to your users
4. Set strong database password (save securely)
5. Wait for project to initialize (~2 minutes)

### 2. Apply Database Schema

Run SQL scripts in order:

**Step 1**: Base schema
```bash
# Copy contents of TOURNAMENTS_V2_SCHEMA.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

**Step 2**: Migration (if migrating from V1)
```bash
# Copy contents of MIGRATION_TOURNAMENTS_V2.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

**Step 3**: Verify tables created
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

Expected tables:
- `tournaments`
- `tournament_players`
- `tournament_matches`
- `tournament_rounds`
- `profiles` (existing)
- `competitions` (existing)
- etc.

### 3. Configure Row Level Security

Verify RLS enabled on all tables:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

All should show `rowsecurity = true`.

### 4. Create Indexes (Performance)

```sql
-- Tournament queries
CREATE INDEX idx_tournaments_url_code ON tournaments(unique_url_code);
CREATE INDEX idx_tournaments_owner ON tournaments(owner_id);
CREATE INDEX idx_tournaments_created ON tournaments(created_at DESC);

-- Player queries
CREATE INDEX idx_players_tournament ON tournament_players(tournament_id);
CREATE INDEX idx_players_seed ON tournament_players(tournament_id, seed);

-- Match queries
CREATE INDEX idx_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_matches_round ON tournament_matches(tournament_id, round_number);
CREATE INDEX idx_matches_status ON tournament_matches(status);

-- Round queries
CREATE INDEX idx_rounds_tournament ON tournament_rounds(tournament_id);
```

### 5. Configure Storage

Storage already configured in Sprint 1, but verify:

1. Supabase Dashboard → Storage
2. Check `competition-files` bucket exists
3. Verify policies:
   - Authenticated users can upload
   - Public read access (for PDFs/images)

---

## Build & Optimization

### 1. Production Build

```bash
cd multi-sport-competition
npm run build
```

**Output**: `dist/` directory

### 2. Verify Build

```bash
npm run preview
```

Open `http://localhost:4173` and test:
- [ ] All pages load
- [ ] Images display
- [ ] API calls work (with production Supabase)
- [ ] No console errors

### 3. Analyze Bundle Size

```bash
npm run build -- --mode analyze
```

Or manually check `dist/assets/`:
- Initial chunk: < 500KB
- Lazy chunks: < 200KB each

### 4. Optimize Further (Optional)

**Image Optimization**:
```bash
npm install -D vite-plugin-image-optimizer
```

**Compression**:
```bash
npm install -D vite-plugin-compression
```

Add to `vite.config.js`:
```javascript
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotli' })
  ]
})
```

---

## Deployment Platforms

### Option 1: Vercel (Recommended)

**Why**: Zero config, global CDN, automatic HTTPS, free tier

**Steps**:

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
cd multi-sport-competition
vercel
```

4. **Configure Project**:
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

5. **Set Environment Variables**:
```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

6. **Deploy to Production**:
```bash
vercel --prod
```

**Custom Domain** (optional):
```bash
vercel domains add yourdomain.com
```

---

### Option 2: Netlify

**Why**: Similar to Vercel, generous free tier, easy rollbacks

**Steps**:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Initialize**:
```bash
cd multi-sport-competition
netlify init
```

4. **Configure**:
- Build command: `npm run build`
- Publish directory: `dist`

5. **Set Environment Variables**:
```bash
netlify env:set VITE_SUPABASE_URL "https://yourproject.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your_key"
```

6. **Deploy**:
```bash
netlify deploy --prod
```

**Create `netlify.toml`**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: AWS Amplify

**Why**: Full AWS integration, scalable, CloudFront CDN

**Steps**:

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect GitHub repository
4. Configure build settings:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd multi-sport-competition
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: multi-sport-competition/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

5. Add environment variables in Amplify console
6. Deploy

---

### Option 4: Self-Hosted (Docker)

**Why**: Full control, any VPS/server

**Create `Dockerfile`**:
```dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY multi-sport-competition/package*.json ./
RUN npm ci
COPY multi-sport-competition/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `nginx.conf`**:
```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Build & Run**:
```bash
docker build -t multi-sport-competition .
docker run -p 80:80 multi-sport-competition
```

**Docker Compose** (with env):
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
    restart: unless-stopped
```

---

## Post-Deployment

### 1. DNS Configuration

**A Record** (for root domain):
```
Type: A
Name: @
Value: [Vercel/Netlify IP]
TTL: Auto
```

**CNAME** (for www):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto
```

**Verify**:
```bash
dig yourdomain.com
```

### 2. HTTPS Setup

Most platforms (Vercel, Netlify) auto-provision SSL via Let's Encrypt.

**Self-hosted**: Use Certbot
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 3. Configure Supabase CORS

1. Supabase Dashboard → Settings → API
2. Add allowed origins:
```
https://yourdomain.com
https://www.yourdomain.com
```

### 4. Test Production

- [ ] Visit `https://yourdomain.com`
- [ ] Create test tournament
- [ ] Share tournament (QR code)
- [ ] Export PDF
- [ ] Test on mobile device
- [ ] Check all pages load
- [ ] Verify realtime updates work

### 5. Submit to Search Engines

**Google**:
```bash
curl "https://www.google.com/ping?sitemap=https://yourdomain.com/sitemap.xml"
```

**Bing**:
Submit via [Bing Webmaster Tools](https://www.bing.com/webmasters)

---

## Monitoring & Maintenance

### Analytics

**Google Analytics**:
1. Create GA4 property
2. Add tracking ID to `.env.production`
3. Install gtag:
```bash
npm install @gtag/react
```

**Plausible** (privacy-friendly alternative):
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Error Tracking

**Sentry**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configure** (`src/main.jsx`):
```javascript
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0,
})
```

### Uptime Monitoring

**UptimeRobot** (free):
1. Add monitor for `https://yourdomain.com`
2. Set check interval: 5 minutes
3. Alert via email/SMS

**Pingdom**, **StatusCake**, etc. also work well.

### Database Backups

**Supabase**:
- Daily automatic backups (included)
- Point-in-time recovery (paid plans)

**Manual Backup**:
```bash
pg_dump -h db.yourproject.supabase.co -U postgres -d postgres > backup.sql
```

### Performance Monitoring

**Lighthouse CI**:
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=https://yourdomain.com
```

**Target Scores**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

---

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails

**Solution**:
1. Check Node version: `node -v` (need 18+)
2. Clear cache: `rm -rf node_modules package-lock.json && npm install`
3. Check for TypeScript errors: `npm run lint`

### Environment Variables Not Working

**Issue**: Variables undefined in production

**Solution**:
1. Verify prefix: Must be `VITE_*`
2. Check platform settings (Vercel/Netlify dashboard)
3. Rebuild: `vercel --prod` or `netlify deploy --prod`

### 404 on Refresh

**Issue**: Page works on first load, 404 on refresh

**Solution**: Configure SPA fallback
- **Vercel**: Auto-configured
- **Netlify**: Add `_redirects`:
```
/*    /index.html   200
```
- **Nginx**: Use `try_files $uri /index.html`

### CORS Errors

**Issue**: API calls blocked by CORS

**Solution**:
1. Supabase Dashboard → Settings → API
2. Add production domain to allowed origins
3. Include `https://` protocol

### Slow Loading

**Issue**: Initial load > 3 seconds

**Solution**:
1. Enable compression (Brotli)
2. Lazy load routes
3. Optimize images (WebP format)
4. Use CDN for assets
5. Check bundle size: `npm run build -- --mode analyze`

### Realtime Not Working

**Issue**: Live updates don't appear

**Solution**:
1. Verify Supabase Realtime enabled (Settings → API)
2. Check RLS policies allow SELECT
3. Test subscription in Supabase Dashboard
4. Check browser console for errors

---

## Continuous Deployment (CI/CD)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./multi-sport-competition
        run: npm ci

      - name: Run tests
        working-directory: ./multi-sport-competition
        run: npm test

      - name: Build
        working-directory: ./multi-sport-competition
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: ./multi-sport-competition
```

---

## Security Checklist

- [ ] HTTPS enabled (force redirect HTTP → HTTPS)
- [ ] Supabase RLS policies tested
- [ ] API keys not in client code (only `ANON` key)
- [ ] Rate limiting enabled (Supabase)
- [ ] Input validation on all forms
- [ ] XSS protection (React auto-escapes)
- [ ] CSRF tokens (handled by Supabase)
- [ ] Content Security Policy (CSP) headers
- [ ] No sensitive data in localStorage

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Time to Interactive | < 3.5s | TBD |
| Total Blocking Time | < 200ms | TBD |
| Cumulative Layout Shift | < 0.1 | TBD |

Measure with: `npm run build && lighthouse http://localhost:4173 --view`

---

## Rollback Plan

### Vercel
```bash
vercel rollback
```

### Netlify
```bash
netlify rollback
```

### Manual
1. Keep previous build artifacts
2. Redeploy old `dist/` folder
3. Or revert git commit and redeploy

---

## Support

- **Documentation**: [TOURNAMENTS_V2_IMPLEMENTATION_GUIDE.md](./TOURNAMENTS_V2_IMPLEMENTATION_GUIDE.md)
- **User Guide**: [USER_GUIDE.md](./USER_GUIDE.md)
- **Sprint Recaps**: SPRINT_1-4_RECAP.md
- **Issues**: GitHub Issues
- **Email**: support@yourdomain.com

---

**Version**: 2.0.0
**Last Updated**: January 2025
