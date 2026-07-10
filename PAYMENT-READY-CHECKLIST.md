# ✅ Payment Integration Checklist

## Quick Status Check

### ✅ DONE (Already Complete!)
- [x] Razorpay removed
- [x] Dodo Payments SDK installed
- [x] Backend endpoints created
- [x] API key added to .env
- [x] Documentation created

---

### 📋 TODO (Your Tasks - 12 Minutes Total)

#### Task 1: Create Products (5 min)
- [ ] Go to https://app.dodopayments.com/products
- [ ] Create "Student Plan" - $2.99/month → Copy `price_id`
- [ ] Create "Premium Plan" - $4.99/month → Copy `price_id`
- [ ] Create "Founder Plan" - $14.99/month → Copy `price_id`

**Your Price IDs will look like:** `price_1a2b3c4d5e6f7g8h`

---

#### Task 2: Update .env (1 min)
Open `.env` and replace these 3 lines:

```bash
DODO_PRICE_STUDENT="price_xxxxx"  ← Replace with your Student price_id
DODO_PRICE_PREMIUM="price_xxxxx"  ← Replace with your Premium price_id
DODO_PRICE_FOUNDER="price_xxxxx"  ← Replace with your Founder price_id
```

**Example:**
```bash
DODO_PRICE_STUDENT="price_1a2b3c4d5e6f7g8h"
DODO_PRICE_PREMIUM="price_9i8h7g6f5e4d3c2b"
DODO_PRICE_FOUNDER="price_abcd1234efgh5678"
```

---

#### Task 3: Install (1 min)
```bash
npm install
```

---

#### Task 4: Test (5 min)
```bash
npm run dev
```

1. Visit: http://localhost:3000
2. Click "Upgrade" button
3. Should redirect to Dodo checkout
4. Use test card: **4242 4242 4242 4242**
5. Complete payment
6. Should redirect back to success page

✅ **If this works, you're done!**

---

## 🧪 Test Card Info

**Use these in Dodo Payments checkout:**

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | `12/34` |
| CVC | `123` |
| ZIP | `12345` |
| Name | Your Name |

---

## 🔧 Quick Troubleshooting

### "Product not found"
→ Create products in Dodo dashboard first

### "Invalid price_id"
→ Check you copied the correct ID (starts with `price_`)

### "npm install fails"
→ Delete `node_modules` and try again

### "Bearer token invalid"
→ Already correct in your .env (starts with `DpALgLF_`)

---

## 📍 Current Configuration

Your `.env` file currently has:

```bash
✅ DODO_PAYMENTS_TOKEN="DpALgLF_IDGSvfJV..."
⚠️  DODO_PRICE_STUDENT="price_xxxxx"  ← REPLACE THIS
⚠️  DODO_PRICE_PREMIUM="price_xxxxx"  ← REPLACE THIS
⚠️  DODO_PRICE_FOUNDER="price_xxxxx"  ← REPLACE THIS
```

---

## 🎯 Success Criteria

You're ready when:

- ✅ Test payment completes
- ✅ Redirects to success page
- ✅ Payment appears in Dodo dashboard
- ✅ No errors in console

**Then deploy and go live! 🚀**

---

## 📚 Need Help?

Read in this order:
1. **NEXT-STEPS.md** ← Start here!
2. DODO-QUICKSTART.md
3. DODO-PAYMENTS-SETUP.md

---

## ⏱️ Time Estimate

- Create products: **5 minutes**
- Update .env: **1 minute**
- npm install: **1 minute**
- Test payment: **5 minutes**

**Total: 12 minutes to working payments!**

---

## 🚀 After Testing Works

1. Deploy to Vercel
2. Add webhook in Dodo dashboard
3. Test on production
4. Switch to live mode (when ready)
5. Start making money! 💰

---

## 💡 Pro Tip

**Don't overthink it!** Just:
1. Create 3 products
2. Copy price IDs
3. Update .env
4. Test

**You'll have working global payments in 12 minutes! 🎉**
