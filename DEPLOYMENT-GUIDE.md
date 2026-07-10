# 🚀 Free Deployment Guide - ADHD Doctor App

## 📊 Best Free Hosting Comparison

| Platform | Best For | Free Tier | Backend Support | Verdict |
|----------|----------|-----------|-----------------|---------|
| **Vercel** | React + API | ✅ Best | ✅ Serverless | 🏆 **RECOMMENDED** |
| Railway | Full-stack | ⚠️ Limited | ✅ Node.js | Good |
| AWS Amplify | React | ✅ Good | ⚠️ Complex | Complex |
| Cloudflare | Static | ✅ Excellent | ⚠️ Workers | Limited |

---

## 🏆 Recommended: Vercel (Best Option)

### Why Vercel?
- ✅ **Best free tier** for full-stack apps
- ✅ **Automatic deployments** from GitHub
- ✅ **Serverless functions** (your Node.js backend works!)
- ✅ **Global CDN** - Fast worldwide
- ✅ **Easy environment variables**
- ✅ **Custom domains** for free
- ✅ **HTTPS** included

### Free Tier Limits:
- ✅ Unlimited projects
- ✅ 100 GB bandwidth/month
- ✅ 100 serverless function invocations/day (fine for testing)
- ✅ Unlimited static sites

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Prepare Your Code

#### 1.1 Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 1.2 Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "npm run build"
  }
}
```

---

### Step 2: Sign Up for Vercel

1. Go to: **https://vercel.com/signup**
2. Sign up with **GitHub** (easiest)
3. Authorize Vercel to access your repositories

---

### Step 3: Import Your Project

1. Click **"Add New Project"**
2. Import **"ADHD-AI-Doctor"** repository
3. Vercel will auto-detect it's a Vite project

---

### Step 4: Configure Environment Variables

In Vercel dashboard, add these environment variables:

#### Required Variables:
```
# Clerk Auth (Frontend)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bW9yZS1tb25rZXktNzIuY2xlcmsuYWNjb3VudHMuZGV2JA

# Firebase (Frontend)
VITE_FIREBASE_API_KEY=AIzaSyBLrUwPK8-HdFx9Thfd7_c4GadlqJIzs6M
VITE_FIREBASE_AUTH_DOMAIN=gen-lang-client-0507708242.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0507708242
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0507708242.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=244082406529
VITE_FIREBASE_APP_ID=1:244082406529:web:6de8474f3ab5eb09844980

# Dodo Payments (Backend)
DODO_PAYMENTS_TOKEN=gjTak8cTppFwPlPR.F2ye1lYnUbUDEH6NeuW5F8oOYZl5Y83GMQDUHHvUu-lYgZPP
DODO_PRODUCT_ID=pdt_0NirrSJQFlEwHSDF1I0ni
DODO_WEBHOOK_SECRET=your_webhook_secret_here
DODO_PUBLISHABLE_KEY=pk_snd_00d98d270105488582b957a0c911dc79
DODO_BUSINESS_ID=bus_0Ngt4Ro6u0mqCPOP793oa
```

---

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your app will be live at: `https://adhd-ai-doctor-xxx.vercel.app`

---

### Step 6: Set Up Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS instructions
4. Wait for SSL certificate (automatic)

---

## 🎯 Post-Deployment Checklist

### ✅ Testing
- [ ] Visit your Vercel URL
- [ ] Sign in with Clerk works
- [ ] Complete assessment
- [ ] Results page shows correctly
- [ ] Payment button works (redirects to Dodo)
- [ ] All 4 subscales visible

### ✅ Configuration
- [ ] Update Clerk allowed origins (add Vercel URL)
- [ ] Update Dodo Payments success/cancel URLs
- [ ] Test payment flow end-to-end
- [ ] Check Firestore security rules

### ✅ Production Readiness
- [ ] Switch Dodo Payments to live mode
- [ ] Update API keys to production keys
- [ ] Set up Dodo webhooks with Vercel URL
- [ ] Add custom domain (optional)
- [ ] Set up analytics (optional)

---

## 🔧 Troubleshooting

### Issue: Build Fails
**Fix:** Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### Issue: API Routes Don't Work
**Fix:** 
- Verify `vercel.json` routes configuration
- Check serverless function logs
- Ensure environment variables are set

### Issue: Environment Variables Not Working
**Fix:**
- Frontend vars must start with `VITE_`
- Redeploy after adding env vars
- Check spelling and values

### Issue: Payment Flow Breaks
**Fix:**
- Update Dodo success/cancel URLs to Vercel domain
- Example: `https://your-app.vercel.app?payment=success`

---

## 💰 Cost Comparison

### Vercel (Recommended)
- **Free Tier:** Perfect for your app
- **Pro ($20/month):** Only if you exceed limits
- **Usage:** ~1000 users = FREE

### Railway
- **Free:** $5 credit/month (runs out quickly)
- **Paid:** ~$5-10/month minimum
- **Better for:** Heavy backend processing

### AWS Amplify
- **Free Tier:** 1000 build minutes/month
- **Bandwidth:** 15 GB/month free
- **Complex:** Harder to set up

### Cloudflare Pages
- **Free:** Unlimited static sites
- **Workers:** Limited free tier
- **Issue:** Backend needs Workers (complex)

---

## 🎉 Vercel Wins Because:

1. ✅ **Easiest setup** - 5 minutes from GitHub to live
2. ✅ **Best free tier** - No credit card needed
3. ✅ **Serverless functions** - Your Node.js backend works
4. ✅ **Auto-deployments** - Push to GitHub = auto-deploy
5. ✅ **Global CDN** - Fast for users worldwide
6. ✅ **Custom domains** - Free SSL included
7. ✅ **Environment variables** - Easy to manage
8. ✅ **Analytics** - Built-in traffic analytics
9. ✅ **Preview deployments** - Test before going live
10. ✅ **Zero config** - Works out of the box

---

## 📊 Traffic Estimates (Free Tier)

### Vercel Free Tier Limits:
- **100 GB bandwidth/month**
- **~250,000 page views/month** (if each visit = 400 KB)
- **100 serverless function calls/day** for development
- **Your app:** Well within limits for 1000+ users/month

### When to Upgrade:
- **>10,000 users/month** → Consider Pro ($20/month)
- **Heavy API usage** → Monitor function invocations
- **Large assets** → Optimize images

---

## 🔄 Alternative: Railway (Backup Option)

### If Vercel Doesn't Work:

1. **Sign up:** https://railway.app
2. **Connect GitHub:** Import repository
3. **Add services:**
   - Web service (Node.js app)
   - Environment variables
4. **Deploy:** Click deploy

### Railway Pros:
- ✅ Good for Node.js backends
- ✅ Simple dashboard
- ✅ Database hosting included

### Railway Cons:
- ❌ Free tier limited ($5 credit/month)
- ❌ Runs out quickly with traffic
- ❌ Need credit card for free tier

---

## 📝 Quick Start Commands

### Create vercel.json:
```bash
# Already in your project root
```

### Test locally:
```bash
npm run build
npm run preview
```

### Deploy to Vercel:
```bash
# Via dashboard (recommended)
# Or via CLI:
npm i -g vercel
vercel login
vercel --prod
```

---

## 🎯 Next Steps After Deployment

1. **Test Everything:**
   - Sign in, assessment, results, payment
   
2. **Update Third-Party Services:**
   - Clerk: Add Vercel URL to allowed origins
   - Dodo: Update success/cancel redirect URLs
   
3. **Go Live:**
   - Switch to production API keys
   - Share your link!

4. **Monitor:**
   - Check Vercel analytics
   - Monitor Dodo Payments dashboard
   - Track user feedback

---

## 🆘 Need Help?

### Vercel Support:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Twitter: @vercel

### Your App Issues:
- Check build logs in Vercel dashboard
- Inspect browser console (F12)
- Check serverless function logs

---

**Status:** ✅ Ready to Deploy
**Recommended:** Vercel (https://vercel.com)
**Time to Deploy:** ~10 minutes
**Cost:** FREE for your traffic levels

Good luck with your deployment! 🚀
