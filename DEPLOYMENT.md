# Deployment Guide

This guide outlines the steps to deploy the Multi-Sport Platform to production.

## Prerequisites

- Node.js 18+
- Supabase project
- GitHub repository

## Environment Variables

Ensure the following environment variables are set in your production environment:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build Process

To build the application for production:

```bash
npm run build
```

This command will:
1. Compile TypeScript code
2. Bundle assets using Vite
3. Generate static files in the `dist` directory

## Deploying to Vercel (Recommended)

1. **Connect Repository**: Import your GitHub repository in Vercel.
2. **Configure Project**:
   - Framework Preset: Vite
   - Root Directory: `multi-sport-platform` (if monorepo) or `./`
3. **Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel dashboard.
4. **Deploy**: Click "Deploy".

## Deploying to Netlify

1. **Connect Repository**: Import your GitHub repository in Netlify.
2. **Build Settings**:
   - Base directory: `multi-sport-platform`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment Variables**: Add variables in "Site settings" > "Build & deploy" > "Environment".
4. **Deploy**: Click "Deploy site".

## Verification

After deployment:
1. Verify the application loads correctly.
2. Check the browser console for any errors.
3. Test the Supabase connection by logging in or fetching data.
4. Verify that lazy loading works by navigating to different routes and checking the network tab.
