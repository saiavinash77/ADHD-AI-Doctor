# 🚀 Complete Vercel Setup Guide

## 📋 Step 1: Build & Output Settings

When importing your project in Vercel, configure these settings:

### Framework Preset
```
Vite
```

### Build Command
```
npm run build
```

### Output Directory
```
dist
```

### Install Command
```
npm install
```

### Development Command (optional)
```
npm run dev
```

---

## 📋 Step 2: Root Directory

```
./
```
(Leave as default - it's the root of your repository)

---

## 🔐 Step 3: Environment Variables

**Copy and paste these ONE BY ONE** in Vercel:

### Variable 1:
**Name:** `VITE_CLERK_PUBLISHABLE_KEY`  
**Value:** `pk_test_bW9yZS1tb25rZXktNzIuY2xlcmsuYWNjb3VudHMuZGV2JA`

### Variable 2:
**Name:** `VITE_FIREBASE_API_KEY`  
**Value:** `AIzaSyBLrUwPK8-HdFx9Thfd7_c4GadlqJIzs6M`

### Variable 3:
**Name:** `VITE_FIREBASE_AUTH_DOMAIN`  
**Value:** `gen-lang-client-0507708242.firebaseapp.com`

### Variable 4:
**Name:** `VITE_FIREBASE_PROJECT_ID`  
**Value:** `gen-lang-client-0507708242`

### Variable 5:
**Name:** `VITE_FIREBASE_STORAGE_BUCKET`  
**Value:** `gen-lang-client-0507708242.firebasestorage.app`

### Variable 6:
**Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`  
**Value:** `244082406529`

### Variable 7:
**Name:** `VITE_FIREBASE_APP_ID`  
**Value:** `1:244082406529:web:6de8474f3ab5eb09844980`

### Variable 8:
**Name:** `DODO_PAYMENTS_TOKEN`  
**Value:** `gjTak8cTppFwPlPR.F2ye1lYnUbUDEH6NeuW5F8oOYZl5Y83GMQDUHHvUu-lYgZPP`

### Variable 9:
**Name:** `DODO_PRODUCT_ID`  
**Value:** `pdt_0NirrSJQFlEwHSDF1I0ni`

### Variable 10:
**Name:** `DODO_WEBHOOK_SECRET`  
**Value:** `your_webhook_secret_here`

### Variable 11:
**Name:** `DODO_PUBLISHABLE_KEY`  
**Value:** `pk_snd_00d98d270105488582b957a0c911dc79`

### Variable 12:
**Name:** `DODO_BUSINESS_ID`  
**Value:** `bus_0Ngt4Ro6u0mqCPOP793oa`

### Variable 13:
**Name:** `NODE_ENV`  
**Value:** `production`

---

## 🎯 Quick Copy Format (Alternative Method)

If Vercel supports bulk import, use this format:

```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_bW9yZS1tb25rZXktNzIuY2xlcmsuYWNjb3VudHMuZGV2JA"
VITE_FIREBASE_API_KEY="AIzaSyBLrUwPK8-HdFx9Thfd7_c4GadlqJIzs6M"
VITE_FIREBASE_AUTH_DOMAIN="gen-lang-client-0507708242.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="gen-lang-client-0507708242"
VITE_FIREBASE_STORAGE_BUCKET="gen-lang-client-0507708242.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="244082406529"
VITE_FIREBASE_APP_ID="1:244082406529:web:6de8474f3ab5eb09844980"
DODO_PAYMENTS_TOKEN="gjTak8cTppFwPlPR.F2ye1lYnUbUDEH6NeuW5F8oOYZl5Y83GMQDUHHvUu-lYgZPP"
DODO_PRODUCT_ID="pdt_0NirrSJQFlEwHSDF1I0ni"
DODO_WEBHOOK_SECRET="your_webhook_secret_here"
DODO_PUBLISHABLE_KEY="pk_snd_00d98d270105488582b957a0c911dc79"
DODO_BUSINESS_ID="bus_0Ngt4Ro6u0mqCPOP793oa"
NODE_ENV="production"
```

---

## 📱 Complete Step-by-Step Deployment

### 1. Go to Vercel
https://vercel.com/new

### 2. Import Repository
- Click "Continue with GitHub"
- Select: **ADHD-AI-Doctor**
- Click "Import"

### 3. Configure Project

#### Project Name (optional):
```
adhd-doctor
```

#### Framework Preset:
```
Vite
```

#### Root Directory:
```
./
```

#### Build Settings:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Environment Variables
Click **"Environment Variables"** and add all 13 variables listed above.

**Pro Tip:** Select "Production, Preview, and Development" for each variable.

### 5. Click Deploy!
Wait 2-3 minutes for deployment to complete.

---

## ✅ Post-Deployment Checklist

### 1. Test Your App
- [ ] Visit your Vercel URL (e.g., `https://adhd-doctor.vercel.app`)
- [ ] Sign in with Clerk
- [ ] Complete assessment
- [ ] Check results page shows all 4 subscales
- [ ] Click payment button

### 2. Update Clerk
1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to: **Settings** → **Domains**
4. Click "Add domain"
5. Enter your Vercel URL: `https://adhd-doctor.vercel.app`
6. Save

### 3. Update Dodo Payments
1. Go to: https://app.dodopayments.com
2. Go to your product settings
3. Update success URL to: `https://adhd-doctor.vercel.app?payment=success`
4. Update cancel URL to: `https://adhd-doctor.vercel.app?payment=cancelled`

### 4. Test Payment Flow
- [ ] Complete assessment on live site
- [ ] Click "Pay $2.49 Securely"
- [ ] Verify Dodo checkout opens
- [ ] Complete test payment
- [ ] Verify redirect back works

---

## 🔧 Troubleshooting

### Build Fails?

**Check Build Logs:**
1. Go to Vercel Dashboard
2. Click on your deployment
3. Click "Building" or "Logs"
4. Look for error messages

**Common Issues:**
- Missing environment variables → Add all 13 variables
- Wrong build command → Use `npm run build`
- Wrong output directory → Use `dist`

### App Shows White Screen?

**Check:**
1. Browser console (F12) for errors
2. All environment variables are added
3. No typos in variable names
4. Variables are set for "Production"

**Fix:**
- Redeploy from Vercel dashboard
- Clear browser cache (Ctrl+Shift+R)

### API Routes Don't Work?

**Check:**
1. `vercel.json` file exists in repository
2. Routes configuration is correct
3. Serverless function logs in Vercel

**Fix:**
- Verify `vercel.json` is pushed to GitHub
- Check function logs for errors

### Environment Variables Not Working?

**Important:**
- Frontend variables MUST start with `VITE_`
- Backend variables should NOT have `VITE_` prefix
- Redeploy after adding/changing variables

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ Build completes without errors  
✅ App loads at Vercel URL  
✅ Sign in works  
✅ Assessment works  
✅ Results page shows correctly  
✅ All 4 subscales visible  
✅ Payment button redirects to Dodo  

---

## 📊 Monitoring

### Vercel Dashboard:
- **Analytics:** Page views, visitors, performance
- **Deployments:** View all deployments and logs
- **Functions:** Monitor API calls and errors
- **Logs:** Real-time application logs

### Access at:
```
https://vercel.com/dashboard
```

---

## 🔄 Auto-Deployments

**Every time you push to GitHub:**
1. Vercel automatically detects changes
2. Builds your app
3. Deploys to production
4. Updates your live URL

**No manual redeployment needed!** 🎉

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain:

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel: Settings → Domains
3. Click "Add"
4. Enter your domain: `adhdtest.com`
5. Follow DNS instructions
6. Wait 10-60 minutes for DNS propagation
7. SSL automatically configured ✅

**Example domains:**
- `adhdtest.com`
- `adhdscreening.app`
- `focusassessment.com`

---

## 💰 Pricing

### Vercel Free Tier:
- ✅ **Bandwidth:** 100 GB/month
- ✅ **Builds:** 6,000 build minutes/month
- ✅ **Serverless Functions:** 100 GB-hours
- ✅ **Invocations:** 1 million/month
- ✅ **Custom Domains:** Unlimited
- ✅ **Team Members:** 1

### Your App Usage:
- **Est. Users/Month:** Up to 10,000 ✅
- **Cost:** **$0/month** ✅

### Upgrade to Pro ($20/month) when:
- More than 10,000 users/month
- Need advanced analytics
- Need team collaboration

---

## 📞 Support

### Vercel Support:
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Support: support@vercel.com

### Issues with Your App:
- Check Vercel deployment logs
- Check browser console (F12)
- Review environment variables
- Check serverless function logs

---

## 🎯 Summary

**Total Setup Time:** 10 minutes  
**Difficulty:** Easy ⭐  
**Cost:** FREE  
**Result:** Professional app deployed globally ✅

---

**Ready to deploy?** Go to https://vercel.com/new and follow this guide! 🚀
