# Car Rental Marketplace - Deployment Guide

## Overview

This guide walks you through deploying the Car Rental Marketplace application with a PostgreSQL database. The application supports both direct PostgreSQL connections and Supabase for rapid deployment.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ or Supabase account
- Google Maps API key
- Domain name (for production)

## Database Setup

### Option 1: Supabase (Recommended for Quick Start)

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note your project URL and API keys
   ```

2. **Run Database Schema**
   - Open Supabase Dashboard → SQL Editor
   - Copy and paste contents of `database/schema.sql`
   - Execute the SQL

3. **Add Sample Data** (Optional)
   - In SQL Editor, run `database/sample-data.sql`
   - This adds sample agencies, cars, and locations

4. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

### Option 2: Self-Hosted PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   brew services start postgresql
   
   # Docker
   docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:14
   ```

2. **Create Database**
   ```sql
   createdb car_rental_marketplace
   ```

3. **Run Schema**
   ```bash
   psql -d car_rental_marketplace -f database/schema.sql
   psql -d car_rental_marketplace -f database/sample-data.sql
   ```

4. **Configure Environment**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/car_rental_marketplace
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

## Application Setup

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Add Required Dependencies

If using Supabase, install the client:
```bash
npm install @supabase/supabase-js
```

For future payment integration:
```bash
npm install stripe @stripe/stripe-js
```

For email notifications:
```bash
npm install @sendgrid/mail
# or
npm install nodemailer
```

### 3. Environment Configuration

Copy the environment template and configure:
```bash
cp .env.example .env.local
```

**Required Variables:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - For address input and mapping
- Database credentials (Supabase or PostgreSQL)

**Optional Variables:**
- Payment processing (Stripe)
- Email service (SendGrid/SMTP)
- SMS service (Twilio)
- File storage (AWS S3/Cloudinary)

### 4. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Prepare for Deployment**
   ```bash
   npm run build
   npm run start # Test production build locally
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Ensure they're set for Production, Preview, and Development

4. **Custom Domain** (Optional)
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed

### Option 2: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   
   CMD ["npm", "start"]
   ```

2. **Docker Compose** (with PostgreSQL)
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/car_rental
         - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
       depends_on:
         - db
   
     db:
       image: postgres:14
       environment:
         - POSTGRES_DB=car_rental
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./database/schema.sql:/docker-entrypoint-initdb.d/1-schema.sql
         - ./database/sample-data.sql:/docker-entrypoint-initdb.d/2-data.sql
   
   volumes:
     postgres_data:
   ```

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Option 3: VPS Deployment

1. **Server Setup** (Ubuntu 22.04)
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Setup**
   ```bash
   # Clone your repository
   git clone your-repo-url
   cd car-rental-marketplace
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "car-rental" -- start
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Database Migrations

For production deployments, consider using database migration tools:

### Using Prisma (Optional)
```bash
npm install prisma @prisma/client
npx prisma init
# Configure schema.prisma based on our SQL schema
npx prisma migrate dev
```

### Manual Migrations
Create versioned migration files:
```sql
-- migrations/001_initial_schema.sql
-- migrations/002_add_pricing_rules.sql
-- etc.
```

## Monitoring and Maintenance

### 1. Health Checks
```bash
# Add to your package.json
"scripts": {
  "health": "curl -f http://localhost:3000/api/health || exit 1"
}
```

### 2. Backup Strategy
```bash
# Automated PostgreSQL backups
pg_dump car_rental_marketplace > backup_$(date +%Y%m%d_%H%M%S).sql

# For Supabase, use their backup features
```

### 3. Monitoring
Consider integrating:
- **Uptime monitoring**: Pingdom, UptimeRobot
- **Error tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Performance**: Vercel Analytics, New Relic

### 4. Log Management
```bash
# PM2 logs
pm2 logs car-rental

# Docker logs
docker-compose logs -f app
```

## Scaling Considerations

### Database Optimization
1. **Indexes**: Ensure proper indexes for search queries
2. **Connection Pooling**: Use PgBouncer for PostgreSQL
3. **Read Replicas**: For high-traffic scenarios
4. **Caching**: Redis for frequently accessed data

### Application Scaling
1. **CDN**: Use Vercel Edge Network or CloudFlare
2. **Image Optimization**: Next.js Image component + CDN
3. **API Rate Limiting**: Implement rate limiting for APIs
4. **Horizontal Scaling**: Multiple app instances behind load balancer

## Security Checklist

### Database Security
- [ ] Strong passwords and restricted access
- [ ] SSL/TLS connections enabled
- [ ] Row Level Security (RLS) configured
- [ ] Regular security updates
- [ ] Database firewall rules

### Application Security
- [ ] Environment variables properly secured
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Input validation and sanitization
- [ ] Rate limiting implemented
- [ ] Security headers configured

### Google Maps API Security
- [ ] API key restricted to your domain
- [ ] Billing limits set
- [ ] Usage monitoring enabled

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run build
   
   # Check linting
   npm run lint
   ```

2. **Database Connection Issues**
   ```bash
   # Test connection
   psql $DATABASE_URL -c "SELECT version();"
   
   # Check Supabase status
   curl -I https://your-project.supabase.co
   ```

3. **Environment Variables**
   ```bash
   # Verify variables are loaded
   node -e "console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)"
   ```

4. **Google Maps API Issues**
   - Check API key restrictions
   - Verify billing is enabled
   - Check quotas and usage limits

### Support

For deployment issues:
1. Check the application logs
2. Verify environment variables
3. Test database connectivity
4. Confirm all required services are running

## Post-Deployment Tasks

1. **Test Core Functionality**
   - [ ] Homepage loads correctly
   - [ ] Service switching works
   - [ ] Car search returns results
   - [ ] Car details page displays
   - [ ] Booking form submits successfully
   - [ ] Google Maps integration works

2. **SEO Setup**
   - [ ] Add sitemap.xml
   - [ ] Configure robots.txt
   - [ ] Set up Google Search Console
   - [ ] Add meta tags and descriptions

3. **Analytics**
   - [ ] Google Analytics setup
   - [ ] Conversion tracking configured
   - [ ] User behavior monitoring

4. **Performance Optimization**
   - [ ] Lighthouse audit (aim for 90+ scores)
   - [ ] Image optimization verified
   - [ ] Core Web Vitals optimized

Your Car Rental Marketplace is now ready for production! 🚗✨
