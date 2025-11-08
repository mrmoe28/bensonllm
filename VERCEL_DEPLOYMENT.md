# 🚀 Vercel Deployment Guide

This branch (`benson-vercel-production`) is configured for deployment to Vercel.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Repository pushed to GitHub

## 🎯 Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select the `benson-vercel-production` branch
4. Vercel will auto-detect the Vite configuration
5. Configure environment variables (see below)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## ⚙️ Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

### Required Variables

```
VITE_OLLAMA_URL=https://your-ollama-endpoint.com
```

**Important:** The default `http://localhost:11434` won't work on Vercel. You need:
- A remote Ollama instance (self-hosted or cloud)
- OR switch to a cloud LLM API (OpenAI, Anthropic, etc.)

### Optional Variables

Add any other environment variables your app uses.

## 🛠️ Build Configuration

The following files configure Vercel deployment:

### `vercel.json`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- SPA routing configuration

### `.vercelignore`
- Excludes documentation files
- Excludes `.env` files
- Excludes `server/` directory
- Excludes development files

## ⚠️ Known Limitations

### 1. TTS Server Not Supported

The `server/tts-server.js` Express server will **NOT** work on Vercel because:
- Vercel is serverless (no long-running processes)
- Uses macOS `say` command (not available in Vercel's Linux environment)

**Solutions:**
- **Disable TTS** in production
- **Use Cloud TTS API:**
  - Google Cloud Text-to-Speech
  - Amazon Polly
  - ElevenLabs
  - OpenAI TTS

### 2. Local Ollama Not Supported

The app expects Ollama at `localhost:11434`, which won't work on Vercel.

**Solutions:**
- **Remote Ollama:** Host Ollama on a VPS and configure the URL
- **Cloud LLM APIs:**
  - OpenAI GPT-4
  - Anthropic Claude
  - Google Gemini

## 📦 What's Deployed

### Included:
- React app (all `src/` files)
- Vite build output
- Public assets
- Dependencies

### Excluded (via `.vercelignore`):
- README files
- `.env` files
- `server/` directory (TTS server)
- Documentation
- Development files
- Git history

## 🔧 Post-Deployment Configuration

### 1. Test the Deployment

Visit your Vercel URL and verify:
- ✅ App loads correctly
- ✅ UI renders properly
- ✅ Routing works (refresh on different pages)

### 2. Configure Remote Services

Since local services won't work:

**For Ollama:**
```javascript
// Update VITE_OLLAMA_URL in Vercel to point to remote instance
// Example: https://ollama.yourdomain.com
```

**Disable TTS (if not using cloud TTS):**
- Go to Settings in the app
- Turn off TTS features
- Or implement cloud TTS integration

### 3. Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed

## 🚨 Troubleshooting

### Build Fails

**Error:** TypeScript compilation errors
```bash
# Test build locally first
npm run build
```

**Error:** Missing dependencies
```bash
# Ensure package.json is up to date
npm install
```

### App Loads But Features Don't Work

**Issue:** Ollama connection fails
- Check `VITE_OLLAMA_URL` environment variable
- Ensure remote Ollama instance is accessible
- Check CORS configuration on Ollama server

**Issue:** TTS doesn't work
- Expected behavior on Vercel
- Implement cloud TTS or disable feature

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding/changing variables
- Check Vercel logs for errors

## 📊 Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:
- Function performance
- Visitor analytics
- Error tracking

### Logs

View deployment logs:
```bash
vercel logs [deployment-url]
```

## 🔄 Updates & Redeployment

### Automatic Deployments

Vercel automatically redeploys when you push to the branch:
```bash
git add .
git commit -m "feat: update feature"
git push origin benson-vercel-production
```

### Manual Redeploy

In Vercel Dashboard:
1. Go to Deployments
2. Click "..." → Redeploy

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Contact Vercel Support](https://vercel.com/support)

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel account created
- [ ] Branch `benson-vercel-production` selected
- [ ] Environment variables configured
- [ ] Remote Ollama endpoint or cloud LLM configured
- [ ] TTS disabled or cloud TTS implemented
- [ ] Build succeeds locally (`npm run build`)
- [ ] Deployment successful
- [ ] App tested on Vercel URL
- [ ] Features verified to work

---

**Last Updated:** November 2024
**Branch:** `benson-vercel-production`
**Status:** Ready for deployment 🚀
