# 🎯 Stripe Integration Setup Guide

## ✅ **Local Development - COMPLETED**

Your Stripe integration is now working perfectly in local development!

### **✅ Environment Variables Set:**
```bash
STRIPE_PUBLISHABLE_KEY="pk_test_51SCgIDERGAiqIL6dN2S4D30xYY6MqrU3R1sXOdPcFt7zRV96wTS6vNxObvoXFmC2RGUlIZ57HzxmqIG8AJURhWQa00mrNsSmKQ"
STRIPE_SECRET_KEY="sk_test_51SCgIDERGAiqIL6dSc1a0gTG1c4BLR0cHEJvcE42a2LsMWRVy889J6HCDYACl9MVo2ieB5ucyysuUDc7HA3xV40m00G3Ob2Q5S"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51SCgIDERGAiqIL6dN2S4D30xYY6MqrU3R1sXOdPcFt7zRV96wTS6vNxObvoXFmC2RGUlIZ57HzxmqIG8AJURhWQa00mrNsSmKQ"
```

### **✅ Integration Test Results:**
- 🔗 **API Connection**: ✅ Working  
- 💳 **Payment Intents**: ✅ Working
- 👤 **Customer Management**: ✅ Working
- 🔧 **Environment Variables**: ✅ Configured
- 🧪 **Test Mode**: ✅ Active (safe for development)

---

## 🚀 **Vercel Production Setup**

To make payments work in your deployed Vercel app, add the same environment variables:

### **1. Go to Vercel Dashboard:**
1. Visit: https://vercel.com/dashboard
2. Click on your `airporttransfer` project
3. Go to **Settings** tab
4. Click **Environment Variables**

### **2. Add These Variables:**

**Variable 1:**
- **Name**: `STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_51SCgIDERGAiqIL6dN2S4D30xYY6MqrU3R1sXOdPcFt7zRV96wTS6vNxObvoXFmC2RGUlIZ57HzxmqIG8AJURhWQa00mrNsSmKQ`
- **Environment**: Production, Preview, Development

**Variable 2:**
- **Name**: `STRIPE_SECRET_KEY`  
- **Value**: `sk_test_51SCgIDERGAiqIL6dSc1a0gTG1c4BLR0cHEJvcE42a2LsMWRVy889J6HCDYACl9MVo2ieB5ucyysuUDc7HA3xV40m00G3Ob2Q5S`
- **Environment**: Production, Preview, Development

**Variable 3:**
- **Name**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_51SCgIDERGAiqIL6dN2S4D30xYY6MqrU3R1sXOdPcFt7zRV96wTS6vNxObvoXFmC2RGUlIZ57HzxmqIG8AJURhWQa00mrNsSmKQ`
- **Environment**: Production, Preview, Development

### **3. Redeploy:**
After adding the variables, redeploy your app (or it will auto-deploy from your next git push).

---

## 💳 **Test Payment Cards**

Use these **Stripe test cards** for testing (no real money):

### **✅ Successful Payments:**
- **Visa**: `4242 4242 4242 4242`
- **Visa (debit)**: `4000 0566 5566 5556`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### **❌ Failed Payments (for testing):**
- **Generic decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **Card expired**: `4000 0000 0000 0069`

### **Card Details:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any ZIP code (e.g., 12345)

---

## 🎯 **What You Can Test**

### **✅ Booking Payments:**
1. Go to `/cars` page
2. Select a car and click "Book Now"
3. Fill booking details
4. Enter test card details
5. Complete payment (no real money charged)

### **✅ Payment Features:**
- 💳 **Payment Intents**: Create secure payment sessions
- 👤 **Customer Management**: Save customer details
- 🔒 **Security**: PCI-compliant payment processing
- 🌍 **Currency**: MAD (Moroccan Dirham) supported
- 📱 **Mobile**: Responsive payment forms

---

## 🔧 **Development Tools**

### **Test Stripe Integration:**
```bash
npx tsx scripts/test-stripe.ts
```

### **View Stripe Dashboard:**
Visit your Stripe dashboard to see test payments: https://dashboard.stripe.com/test/payments

---

## 🎉 **You're All Set!**

Your Stripe integration is ready for:
- ✅ **Local development** testing
- ✅ **Production deployment** (after adding Vercel env vars)
- ✅ **End-to-end payment flows**
- ✅ **Test card transactions**
- ✅ **Customer management**

**No real money will be charged - these are test keys!** 🧪✨
