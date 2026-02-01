# 🚀 OurAuto Setup & Configuration Guide

**Last Updated**: February 1, 2026  
**Project**: OurAuto - AI-Powered Vehicle Marketplace  
**Version**: 1.0.0  
**Status**: ✅ Production Ready

---

## 📋 Quick Reference

### Server Status
```bash
# Check server
curl http://localhost:3005

# Start server
npm start

# Build for production
npm run build

# Run in production
npm start (uses production build)
```

### Database Setup
```bash
# Connection
URL: https://your-project.supabase.co
Key: your-anon-key

# Run migrations
# Paste COMPLETE_DATABASE_SCHEMA.sql in Supabase SQL Editor
```

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📱 Mobile Setup

### Prerequisites
- Node.js 18+
- Java Development Kit (JDK) 11+
- Android SDK (API 33+)
- Xcode 14+ (for iOS on macOS)

### Automated Setup (Recommended)
```bash
cd /workspaces/ourauto
./setup-mobile.sh
```

This script:
1. ✅ Installs npm dependencies
2. ✅ Builds Next.js application
3. ✅ Initializes Capacitor
4. ✅ Adds Android platform
5. ✅ Adds iOS platform (macOS only)
6. ✅ Syncs native files

### Manual Mobile Build

**Step 1: Install Dependencies**
```bash
npm install
```

**Step 2: Build Next.js**
```bash
npm run build
```

**Step 3: Initialize Capacitor**
```bash
npx cap init OurAuto --web-dir=out
```

**Step 4: Add Platforms**
```bash
# Android
npx cap add android

# iOS (macOS only)
npx cap add ios
```

**Step 5: Sync Files**
```bash
npx cap sync
```

**Step 6: Build Native Apps**
```bash
# Android
npx cap build android

# iOS
npx cap build ios
```

**Step 7: Open in IDE**
```bash
# Android Studio
npx cap open android

# Xcode (macOS)
npx cap open ios
```

### Android Build Configuration

**Gradle Settings** (`android/app/build.gradle`):
```gradle
android {
  compileSdkVersion 34
  defaultConfig {
    minSdkVersion 24
    targetSdkVersion 34
  }
}
```

**Android Manifest Permissions** (`android-permissions.xml`):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### Common Issues & Solutions

**Issue: Gradle not found**
```bash
chmod +x android/gradlew
./android/gradlew --version
```

**Issue: Java version mismatch**
```bash
java -version  # Check version
# Should be 11+
```

**Issue: Android SDK not found**
```bash
# Set ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

**Issue: Capacitor sync errors**
```bash
# Clean and resync
rm -rf android ios
npx cap add android
npx cap add ios
npx cap sync
```

---

## 🗄️ Database Configuration

### Supabase Setup
1. Create project at https://supabase.com
2. Get API URL and Anon Key from settings
3. Run SQL migrations:
   - Open SQL Editor
   - Paste `COMPLETE_DATABASE_SCHEMA.sql`
   - Execute

### Database Tables
```
Core (7):
  profiles, cars, car_images, leads, 
  valuations, inspections, messages

Marketplace (4):
  dealer_leads, wishlists, chat_requests, reports

Admin (1):
  admin_logs

Enterprise (4):
  error_logs, backup_jobs, database_health_checks, 
  api_request_logs

Phase 2 (9):
  chats, chat_messages, lead_locks, image_metadata,
  watermarked_images, wallets, wallet_transactions,
  subscriptions, referral_links, referral_history
```

### RLS Policies
All tables have **Row Level Security** enabled:
- Users can only access their own data
- Public read access for listings
- Admin-only access for system tables

### Indexes
60+ indexes for optimal performance:
- User lookups (O(log n))
- Car queries by brand/model/city
- Lead tracking by dealer/car
- Time-based queries (DESC)

---

## 🎨 UI Components & Features

### Completed Components
- ✅ Login/Auth form
- ✅ Car listing grid
- ✅ Car detail page
- ✅ Valuation calculator
- ✅ Inspection booking
- ✅ Dealer dashboard
- ✅ Admin panel
- ✅ Chat interface
- ✅ Lead management
- ✅ Wallet display

### Styling
- TailwindCSS for responsive design
- Dark mode support
- Mobile-first approach
- Accessibility (WCAG 2.1)

### Forms
- Server-side validation
- Real-time feedback
- Error messages
- Loading states
- Success confirmations

---

## 🔐 Security Configuration

### Environment Security
```bash
# .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=<prod-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-key>
```

### API Security
- ✅ Supabase Auth JWT tokens
- ✅ RLS policies on all tables
- ✅ Rate limiting ready
- ✅ CORS configured
- ✅ Input validation on all forms

### Data Protection
- ✅ Phone number masking
- ✅ Image watermarking
- ✅ Encrypted messages
- ✅ Audit logs for admin actions

---

## 📊 Performance Configuration

### Build Optimization
```javascript
// next.config.js
{
  swcMinify: true,          // Fast minification
  compress: true,           // Enable compression
  images: {
    unoptimized: true       // Mobile compatibility
  },
  distDir: 'out'           // Output directory
}
```

### Database Optimization
- Connection pooling ready
- Query optimization via indexes
- Caching policies defined
- Archive tables for old data

### Monitoring
- Error tracking enabled
- API logs stored (30-day retention)
- Error logs stored (90-day retention)
- Database health checks available

---

## 🧪 Testing Configuration

### Unit Tests
```bash
npm test
```

### Build Test
```bash
npm run build
# Should complete without errors
```

### Mobile Testing
```bash
# Android emulator
npx cap run android

# iOS simulator (macOS)
npx cap run ios
```

### API Testing
```bash
# Test endpoints with curl
curl -X GET http://localhost:3005/api/cars

# Or use Postman collection (in docs/)
```

---

## 📈 Deployment

### Production Build
```bash
npm run build
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3005
CMD ["npm", "start"]
```

### Environment Variables (Production)
```
NEXT_PUBLIC_SUPABASE_URL=<prod-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
```

---

## 📚 Project Structure

```
/workspaces/ourauto/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── admin/                    # Admin pages
│   ├── dealer/                   # Dealer pages
│   ├── login/                    # Auth pages
│   ├── cars/                     # Car listing pages
│   ├── inspection/               # Booking pages
│   ├── components/               # Shared components
│   └── layout.tsx               # Root layout
├── lib/                          # Utilities & services
│   ├── supabase.ts              # Database client
│   ├── auth.ts                  # Auth helpers
│   ├── valuation.ts             # Valuation engine
│   ├── dealer.ts                # Dealer services
│   └── ...
├── components/                   # Reusable components
│   ├── admin/
│   ├── dealer/
│   ├── car-listing/
│   └── ...
├── COMPLETE_DATABASE_SCHEMA.sql  # Full DB schema
├── COMPLETE_IMPLEMENTATION_GUIDE.md
├── SETUP_AND_CONFIG_GUIDE.md     # This file
├── QUICKSTART.md
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

---

## ✅ Setup Checklist

- [ ] Clone repository
- [ ] Install Node.js 18+
- [ ] Copy `.env.local.example` → `.env.local`
- [ ] Add Supabase credentials
- [ ] Run `npm install`
- [ ] Run `COMPLETE_DATABASE_SCHEMA.sql` in Supabase
- [ ] Run `npm start`
- [ ] Access http://localhost:3005
- [ ] Test login with phone OTP
- [ ] Explore dealer dashboard
- [ ] Check admin panel
- [ ] (Optional) Setup mobile: `./setup-mobile.sh`

---

## 🎯 Next Steps

1. **Customize branding**: Update colors in `tailwind.config.js`
2. **Add payment**: Integrate Razorpay/Stripe
3. **Setup emails**: Configure SendGrid for notifications
4. **Add analytics**: Implement Google Analytics
5. **Deploy**: Use Vercel for hosting
6. **Mobile publish**: Submit to Play Store & App Store

---

## 📞 Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next out node_modules
npm install
npm run build
```

### Database Connection
```bash
# Test Supabase connection
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
     https://<project>.supabase.co/rest/v1/profiles?select=*
```

### Port Already in Use
```bash
# Find process using port 3005
lsof -i :3005

# Kill it
kill -9 <PID>

# Restart
npm start
```

### Mobile Build Issues
```bash
# Clean and rebuild
rm -rf .capacitor android ios
npx cap init
npx cap add android
npx cap sync
npx cap build android
```

---

## 📖 Documentation Files

- **COMPLETE_IMPLEMENTATION_GUIDE.md** — Full feature guide
- **SETUP_AND_CONFIG_GUIDE.md** — This file (setup & config)
- **QUICKSTART.md** — Quick start for developers
- **README.md** — Project overview
- **COMPLETE_DATABASE_SCHEMA.sql** — Full database schema

---

**Happy Building! 🚀**
