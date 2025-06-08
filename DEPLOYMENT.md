# Netlify Deployment Guide

## Prerequisites
- Git repository hosted on GitHub, GitLab, or similar
- Netlify account

## Deployment Steps

### 1. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider (GitHub/GitLab)
4. Select this repository

### 2. Build Settings
The build settings should automatically be detected from `netlify.toml`, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 (set in `.nvmrc`)

### 3. Environment Variables
If your app uses environment variables, add them in Netlify:
1. Go to Site settings → Environment variables
2. Add any variables from your `.env` file:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Any other environment variables your app needs

### 4. Domain Configuration
- Your site will get a random Netlify subdomain like `amazing-app-123456.netlify.app`
- You can change this in Site settings → Domain management
- Or connect a custom domain

### 5. Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy your app
3. Future pushes to your main branch will trigger automatic deployments

## Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run web

# Build for production
npm run build
```

## Configuration Files
- `netlify.toml` - Netlify build configuration
- `.nvmrc` - Node.js version specification
- `package.json` - Build scripts and dependencies

## Features Enabled
- Single Page Application (SPA) routing
- Asset optimization and caching
- Security headers
- Automatic HTTPS

## Troubleshooting
- Check the deploy logs in Netlify dashboard
- Ensure all environment variables are set
- Verify build command works locally: `npm run build` 