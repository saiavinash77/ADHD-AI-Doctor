# 🚀 Deployment Guide - ADHD Doctor App

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **Git** installed
3. **Accounts Setup:**
   - Vercel account (free): https://vercel.com
   - Firebase project (free): https://console.firebase.google.com
   - Razorpay account (for payments): https://razorpay.com

---

## 🔧 Local Setup First

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials from Firebase Console → Project Settings → General

### Step 3: Test Locally
```bash
npm run dev
```
Visit http://localhost:3000

---

## 🌐 Deployment Options

### **Option 1: Vercel (Recommended - Easiest)**

#### A. Deploy Frontend + Backend Together

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Set Environment Variables in Vercel:**
   - Go to your project on vercel.com
   - Settings → Environment Variables
   - Add all variables from `.env`

5. **Deploy to Production:**
```bash
vercel --prod
```

**✅ Done! Your app is live.**

---

### **Option 2: Separate Frontend (Vercel) + Backend (Railway)**

#### Why? If backend needs long-running processes or heavier compute.

#### A. Deploy Frontend to Vercel

1. **Remove server from build:**
   Edit `package.json` scripts:
   ```json
   "scripts": {
     "dev": "vite",
     "build": "vite build",
     "preview": "vite preview"
   }
   ```

2. **Create `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

3. **Deploy:**
```bash
vercel --prod
```

#### B. Deploy Backend to Railway

1. **Create `railway.json`:**
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

2. **Go to railway.app → New Project → Deploy from GitHub**

3. **Set Environment Variables:**
   - Add all `RAZORPAY_*` variables
   - Set `NODE_ENV=production`

4. **Get Railway URL** (e.g., `https://your-app.railway.app`)

5. **Update Frontend:**
   In your frontend code, change API calls from `/api/*` to `https://your-app.railway.app/api/*`

---

### **Option 3: Google Cloud Run (Your Current Setup)**

1. **Install gcloud CLI:**
   https://cloud.google.com/sdk/docs/install

2. **Build Container:**
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/adhd-doctor
```

3. **Deploy:**
```bash
gcloud run deploy adhd-doctor \
  --image gcr.io/YOUR_PROJECT_ID/adhd-doctor \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

4. **Set Environment Variables:**
```bash
gcloud run services update adhd-doctor \
  --set-env-vars RAZORPAY_KEY_ID=your_key,RAZORPAY_KEY_SECRET=your_secret
```

---

## 🔐 Security Checklist Before Deploy

- [ ] `.env` is in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Firebase security rules configured
- [ ] Razorpay webhooks configured (if using)
- [ ] CORS configured correctly for production domain
- [ ] SSL certificate active (Vercel/Railway handle this automatically)

---

## 💰 Estimated Costs

| Service | Free Tier | Paid (if exceeded) |
|---------|-----------|-------------------|
| **Vercel** | 100GB bandwidth/month | $20/month (Pro) |
| **Railway** | $5 credit/month | ~$5-10/month |
| **Firebase** | 50K reads/day, 20K writes/day | ~$1-5/month |
| **Razorpay** | Free setup | 2% transaction fee |

**Total: $0-20/month** depending on traffic.

---

## 📊 Post-Deployment

### Monitor Your App

1. **Vercel Analytics:** Built-in (vercel.com/analytics)
2. **Firebase Console:** Check database usage
3. **Razorpay Dashboard:** Track payments

### Custom Domain (Optional)

1. Buy domain from Namecheap/GoDaddy ($10-15/year)
2. In Vercel → Settings → Domains → Add Custom Domain
3. Update DNS records as instructed

---

## 🐛 Troubleshooting

### "Firebase Auth not working in production"
- Add your production domain to Firebase Console → Authentication → Authorized domains

### "Payment not working"
- Check Razorpay API keys are set in environment variables
- Verify webhook URL is correct in Razorpay dashboard

### "Build failing"
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Need Help?

**Issues found during deployment?** Open an issue or contact me!

---

## 🎉 Success Checklist

- [ ] App deployed and accessible via URL
- [ ] Firebase auth working (sign up/login)
- [ ] Assessments saving to database
- [ ] Payment flow working (test mode)
- [ ] PDF/CSV exports working
- [ ] Mobile responsive
- [ ] SSL certificate active (https://)

**Congratulations! Your ADHD Doctor app is live! 🚀**
