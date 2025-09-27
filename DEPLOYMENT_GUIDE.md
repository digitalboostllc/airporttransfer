# 🚀 Venboo Deployment Guide - Vercel + Supabase

## 📋 **Overview**
This guide will help you deploy Venboo to production using:
- **Vercel** for hosting the Next.js application
- **Supabase** for the PostgreSQL database

---

## 🗄️ **Step 1: Set Up Supabase Database**

### **1.1 Create Database Tables**
You have the Supabase database but need to create the tables:

```bash
# First, update your local environment to use Supabase
cp .env.production .env.local

# Generate Prisma client
npx prisma generate

# Push database schema to Supabase (creates all tables)
npx prisma db push

# Check if tables were created
npx prisma studio
```

### **1.2 Seed Database with Initial Data**
```bash
# Create and run the seed script
npx prisma db seed
```

If the seed command doesn't work, run the TypeScript file directly:
```bash
npx ts-node prisma/seed.ts
```

---

## 🌐 **Step 2: Deploy to Vercel**

### **2.1 Install Vercel CLI**
```bash
npm i -g vercel
```

### **2.2 Deploy the Application**
```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - What's your project's name? venboo
# - In which directory is your code located? ./
# - Want to override settings? No
```

### **2.3 Set Environment Variables in Vercel**

Go to your Vercel dashboard and add these environment variables:

**Required Variables:**
```
DATABASE_URL=postgres://postgres.deqlxqoshpodwpyzpfcc:JoppjgaZrqWHwnjg@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
POSTGRES_PRISMA_URL=postgres://postgres.deqlxqoshpodwpyzpfcc:JoppjgaZrqWHwnjg@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
SUPABASE_URL=https://deqlxqoshpodwpyzpfcc.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://deqlxqoshpodwpyzpfcc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcWx4cW9zaHBvZHdweXpwZmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQ4NDcsImV4cCI6MjA3NDU3MDg0N30.38bkiU_dfHoa6-ljyR1zkZPWK-Tu_NmR37ImZlm3NdQ
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlcWx4cW9zaHBvZHdweXpwZmNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTQ4NDcsImV4cCI6MjA3NDU3MDg0N30.38bkiU_dfHoa6-ljyR1zkZPWK-Tu_NmR37ImZlm3NdQ
JWT_SECRET=your-super-secure-production-jwt-secret-make-it-random-and-long
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBdVdX0zg3OmqJdnFkQcK3L_Ov9qQiXHSM
```

---

## 🔧 **Step 3: Update Package.json for Deployment**

Add deployment scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate",
    "db:migrate": "prisma db push",
    "db:seed": "prisma db seed"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## 🧪 **Step 4: Test Your Deployment**

### **4.1 Local Testing with Production Database**
```bash
# Test locally with Supabase database
npm run dev

# Try these features:
# - User registration
# - Login
# - Car browsing
# - Booking creation
# - Admin dashboard
```

### **4.2 Production Testing**
Once deployed to Vercel, test:
1. Visit your Vercel URL
2. Register a new account
3. Browse cars
4. Create a booking
5. Test admin features

---

## 🔍 **Step 5: Verify Database**

Check your Supabase dashboard to ensure:
- ✅ All tables are created
- ✅ Users can register
- ✅ Bookings are saved
- ✅ Data relationships work

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Table doesn't exist" errors**
```bash
# Solution: Push schema again
npx prisma db push --force-reset
```

### **Issue 2: "Prisma Client not generated"**
```bash
# Solution: Generate client
npx prisma generate
```

### **Issue 3: Environment variables not working**
- Check Vercel dashboard environment variables
- Ensure all required variables are set
- Redeploy after adding variables

### **Issue 4: Database connection errors**
- Verify DATABASE_URL is correct
- Check Supabase database is running
- Ensure connection limits aren't exceeded

---

## 📊 **Final Deployment Checklist**

- [ ] Supabase database created
- [ ] Database tables created via `prisma db push`
- [ ] Database seeded with initial data
- [ ] Environment variables set in Vercel
- [ ] Application deployed to Vercel
- [ ] Production URL accessible
- [ ] User registration works
- [ ] Booking system functional
- [ ] Admin dashboard accessible

---

## 🎯 **Next Steps**

1. **Custom Domain** - Add your domain to Vercel
2. **SSL Certificate** - Vercel provides automatic HTTPS
3. **Monitoring** - Set up error tracking (Sentry)
4. **Analytics** - Add Google Analytics
5. **Performance** - Monitor Core Web Vitals

---

Your Venboo platform will be fully deployed and ready for production use! 🚗✨
