# 🚀 Next Steps - You're Almost Ready!

## ✅ What's Done

1. ✅ API key added to `.env`
2. ✅ Dodo Payments SDK installed
3. ✅ Backend endpoints ready
4. ✅ Documentation complete

---

## 📋 What You Need to Do (5 Minutes)

### Step 1: Create Products in Dodo Dashboard (3 min)

**Go to:** https://app.dodopayments.com/products

**Create 3 Subscription Products:**

#### Product 1: Student Plan
```
Name: ADHD Student Premium
Type: Subscription
Price: $2.99 USD
Billing Interval: Monthly
Description: Unlimited assessments + AI coach for students
```
➡️ **Click Save** → Copy the `price_id` (looks like: `price_xxxxxxxxxxxxx`)

---

#### Product 2: Premium Plan
```
Name: ADHD Premium
Type: Subscription
Price: $4.99 USD
Billing Interval: Monthly
Description: Unlimited assessments + AI coach + progress tracking
```
➡️ **Click Save** → Copy the `price_id`

---

#### Product 3: Founder Plan
```
Name: ADHD Founder Premium
Type: Subscription
Price: $14.99 USD
Billing Interval: Monthly
Description: Everything in Premium + team dashboard
```
➡️ **Click Save** → Copy the `price_id`

---

### Step 2: Update .env with Price IDs (1 min)

Open `.env` and replace these lines:

```bash
# Replace xxxxx with your actual price IDs from Step 1
DODO_PRICE_STUDENT="price_xxxxxxxxxxxxx"
DODO_PRICE_PREMIUM="price_xxxxxxxxxxxxx"
DODO_PRICE_FOUNDER="price_xxxxxxxxxxxxx"
```

**Example:**
```bash
DODO_PRICE_STUDENT="price_1a2b3c4d5e6f7g8h9i0j"
DODO_PRICE_PREMIUM="price_9i8h7g6f5e4d3c2b1a0j"
DODO_PRICE_FOUNDER="price_abcd1234efgh5678ijkl"
```

---

### Step 3: Install Dependencies (1 min)

```bash
npm install
```

This installs the `dodopayments` package.

---

### Step 4: Test Locally! (Test payment flow)

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Test Your Payment Integration

### Test the Full Flow:

1. **Sign up** on your app (or use existing account)
2. **Click "Upgrade to Premium"** button
3. **You should redirect** to Dodo Payments checkout
4. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - ZIP: `12345`
5. **Complete payment**
6. **Check if redirected back** to success page
7. **Verify user is marked as paid** in your database

---

## 🔧 If Test Fails

### Issue: "Price ID not found"
**Fix:** Make sure you created products in Dodo dashboard and copied correct `price_id` to `.env`

### Issue: "Bearer token invalid"
**Fix:** Your API key is already set correctly in `.env`. If still failing:
1. Check for extra spaces
2. Verify key starts with `DpALgLF_`
3. Log in to https://app.dodopayments.com and get a fresh key

### Issue: "Cannot redirect to checkout"
**Fix:** Check browser console for errors. Ensure:
```bash
# Frontend .env needs these too:
VITE_DODO_PRICE_STUDENT="price_xxxxx"
VITE_DODO_PRICE_PREMIUM="price_xxxxx"
VITE_DODO_PRICE_FOUNDER="price_xxxxx"
```

---

## 🪝 Setup Webhooks (For Production)

### Local Testing with ngrok:

1. **Install ngrok:** https://ngrok.com/download
2. **Run your server:** `npm run dev`
3. **In new terminal:** `ngrok http 3000`
4. **Copy ngrok URL:** (e.g., `https://abc123.ngrok.io`)
5. **Go to Dodo Dashboard → Webhooks**
6. **Add endpoint:** `https://abc123.ngrok.io/api/webhook/dodo-payments`
7. **Select events:**
   - ✅ payment.succeeded
   - ✅ payment.failed
   - ✅ subscription.created
   - ✅ subscription.cancelled
   - ✅ subscription.updated
8. **Save** and copy webhook secret
9. **Update .env:**
   ```bash
   DODO_WEBHOOK_SECRET="whsec_your_copied_secret"
   ```
10. **Restart server:** Stop and run `npm run dev` again

### Test Webhook:
- Go to Dodo Dashboard → Webhooks
- Click your endpoint
- Click "Send test event"
- Check your terminal logs

---

## 🚀 Deploy to Production

Once local testing works:

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables in Vercel:**
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Add all variables from `.env`:
     ```
     DODO_PAYMENTS_TOKEN=...
     DODO_WEBHOOK_SECRET=...
     DODO_PRICE_STUDENT=...
     DODO_PRICE_PREMIUM=...
     DODO_PRICE_FOUNDER=...
     VITE_DODO_PRICE_STUDENT=...
     VITE_DODO_PRICE_PREMIUM=...
     VITE_DODO_PRICE_FOUNDER=...
     ```

3. **Add Production Webhook:**
   - Dodo Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhook/dodo-payments`
   - Select same events as local
   - Save

4. **Test on Production:**
   - Visit your live site
   - Try upgrade flow
   - Use test card
   - Verify payment works!

---

## 📊 Monitor Payments

### Dodo Dashboard:
- **Payments:** https://app.dodopayments.com/payments
- **Subscriptions:** https://app.dodopayments.com/subscriptions
- **Customers:** https://app.dodopayments.com/customers
- **Webhooks:** https://app.dodopayments.com/webhooks

**Check these regularly!**

---

## 💡 Pro Tips

1. **Test Mode First:** Always test in test mode before going live
2. **Monitor Webhooks:** Check webhook logs in Dodo dashboard
3. **Handle Failures:** Implement retry logic for failed payments
4. **Email Receipts:** Dodo sends automatic receipts to customers
5. **Refunds:** Can issue refunds directly from Dodo dashboard

---

## 🎯 Going Live (When Ready)

To accept real payments:

1. **Complete Business Verification:**
   - Dodo Dashboard → Settings → Business Info
   - Provide business details
   - Connect bank account

2. **Switch to Live Mode:**
   - Get live API key from dashboard
   - Update `.env` with live key
   - Update products (create in live mode)
   - Deploy to production

3. **Test with Real Card:**
   - Use your own card
   - Make a test purchase
   - Verify it works
   - **Issue refund** to yourself

4. **Launch! 🚀**

---

## ✅ Current Status

- [x] API key added
- [x] Backend configured
- [ ] Products created in Dodo dashboard
- [ ] Price IDs added to .env
- [ ] Dependencies installed (`npm install`)
- [ ] Local testing completed
- [ ] Webhooks configured
- [ ] Deployed to production
- [ ] Live mode enabled

---

## 🎉 When Everything Works

You'll be able to:
- ✅ Accept payments from 100+ countries
- ✅ Automatically create subscriptions
- ✅ Handle renewals automatically
- ✅ Receive payouts to your bank
- ✅ Issue refunds when needed
- ✅ Track all payments in dashboard

---

## 📞 Need Help?

**Issues with Dodo Payments:**
- Email: support@dodopayments.com
- Docs: https://docs.dodopayments.com

**Integration Issues:**
- Check: `DODO-PAYMENTS-SETUP.md`
- Check: `RAZORPAY-TO-DODO-MIGRATION.md`

---

## 🚀 Your Action Plan (Right Now!)

### Today (30 minutes):
1. ☑️ Create 3 products in Dodo dashboard (done above)
2. ☑️ Update .env with price IDs
3. ☑️ Run `npm install`
4. ☑️ Run `npm run dev`
5. ☑️ Test payment with test card

### Tomorrow:
6. ☑️ Setup ngrok for webhook testing
7. ☑️ Test webhook events
8. ☑️ Fix any issues

### This Week:
9. ☑️ Deploy to Vercel
10. ☑️ Test on production
11. ☑️ Go live!
12. ☑️ Make your first sale! 💰

---

## 🎯 Success Metrics

**When you see these, you're done:**

- ✅ Test payment completes successfully
- ✅ User redirects to success page
- ✅ Database updates user as "paid"
- ✅ Payment shows in Dodo dashboard
- ✅ Webhook events received
- ✅ Real payment works (test & refund)

**Then you're ready to make money! 🚀💰**

---

## 💪 You Got This!

Everything is set up. Just:
1. Create 3 products (5 min)
2. Add price IDs to .env (1 min)
3. Run npm install (1 min)
4. Test! (5 min)

**Total: 12 minutes to accepting global payments!**

**Go do it! 🎉**
