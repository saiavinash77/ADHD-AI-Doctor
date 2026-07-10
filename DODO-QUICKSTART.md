# ⚡ Dodo Payments - 5 Minute Setup

## 📋 Checklist

### ☑️ Step 1: Sign Up (2 minutes)
1. Go to: https://app.dodopayments.com/signup
2. Sign up with email
3. Verify email

---

### ☑️ Step 2: Get API Keys (1 minute)
1. Dashboard → Settings → API Keys
2. Copy **Bearer Token** (starts with `dodo_sk_`)
3. Copy **Webhook Secret** (starts with `whsec_`)

---

### ☑️ Step 3: Create Products (2 minutes)

Create 3 subscriptions in Dashboard → Products:

**Student Plan:**
- Price: $2.99/month
- Copy `price_id`

**Premium Plan:**
- Price: $4.99/month
- Copy `price_id`

**Founder Plan:**
- Price: $14.99/month
- Copy `price_id`

---

### ☑️ Step 4: Update .env

```bash
# Open .env file and add:
DODO_PAYMENTS_TOKEN="dodo_sk_your_token_here"
DODO_WEBHOOK_SECRET="whsec_your_secret_here"
DODO_PRICE_STUDENT="price_xxxxx"
DODO_PRICE_PREMIUM="price_xxxxx"
DODO_PRICE_FOUNDER="price_xxxxx"
```

---

### ☑️ Step 5: Install & Test

```bash
npm install
npm run dev
```

Visit http://localhost:3000 and test payment!

---

## 🎉 Done!

You can now accept payments from **100+ countries**!

**Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: `12/34`
- CVC: `123`

---

## 📚 Need More Help?

Read: `DODO-PAYMENTS-SETUP.md` for detailed guide.

---

## 🚨 Production Checklist

Before going live:

- [ ] Create products in Dodo dashboard
- [ ] Get live API keys (after verification)
- [ ] Set webhook URL in Dodo dashboard
- [ ] Update environment variables in Vercel
- [ ] Test with real card (then refund)
- [ ] Switch to live mode

**Support:** support@dodopayments.com
