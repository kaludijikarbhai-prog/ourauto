# 🚗 OurAuto - AI-Powered Vehicle Marketplace

**A production-ready, enterprise-grade car marketplace platform** built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

**Status**: ✅ **70-80% Production Ready** | **Server Running**: http://localhost:3005

---

## 📖 Documentation

**Start here based on what you need:**

| Need | Read |
|------|------|
| **Quick Setup (3 min)** | [QUICKSTART.md](QUICKSTART.md) |
| **Full Implementation Guide** | [COMPLETE_IMPLEMENTATION_GUIDE.md](COMPLETE_IMPLEMENTATION_GUIDE.md) |
| **Setup & Configuration** | [SETUP_AND_CONFIG_GUIDE.md](SETUP_AND_CONFIG_GUIDE.md) |
| **Database Schema** | [COMPLETE_DATABASE_SCHEMA.sql](COMPLETE_DATABASE_SCHEMA.sql) |
| **Business Model Mapping** | See "System Features" below |

---

## 🎯 Key Features

### 👥 User Side Features
- **Sell Your Car**: Create and publish car listings with photos
- **Photo Upload**: Upload multiple car photos to Supabase Storage
- **My Listings**: Manage your active car listings
- **Wishlist**: Save favorite cars for later
- **AI Valuation**: Get estimated car price based on details
- **Chat Requests**: Send masked contact requests to sellers
- **Search & Filter**: Find cars by brand, price, city, fuel type, transmission
- **Car Details**: View detailed car information and inspection availability

### 🚗 Dealer Side Features
- **Dealer Dashboard**: Overview of leads and sales
- **Leads Management**: Track all leads for your cars
- **Status Workflow**: new → contacted → interested → closed
- **Inspection Booking**: Manage inspection requests from buyers
- **Car Listings**: Manage your dealership's inventory
- **Performance Stats**: Track conversion metrics

### 👨‍💼 Admin Features
- **Admin Dashboard**: Platform statistics and monitoring
- **Users Management**: View and manage all users
- **Dealers Management**: Manage dealer accounts
- **Cars Moderation**: Approve, reject, or flag car listings
- **Reports Management**: Handle user reports and complaints
- **Admin Logs**: Track all admin actions
- **Bulk Actions**: Modify multiple items at once

## 📦 Project Structure

```
/workspaces/ourauto
├── app/                      # Next.js App Router
│   ├── home/                # Home marketplace
│   ├── sell/                # Sell car form
│   ├── my-listings/         # User's listings
│   ├── wishlist/            # Wishlist page
│   ├── chat/                # Chat requests
│   ├── valuation/           # AI valuation
│   ├── inspection/          # Booking
│   ├── dealer/              # Dealer pages
│   ├── admin/               # Admin dashboard
│   ├── login/               # Authentication
│   └── dashboard/           # Protected user dashboard
├── lib/
│   ├── auth.ts             # Authentication service
│   ├── user-service.ts     # Car listings & search
│   ├── wishlist-service.ts # Wishlist management
│   ├── chat-service.ts     # Chat & messaging
│   ├── inspection-service.ts # Booking & inspections
│   ├── dealer.ts           # Dealer features
│   ├── admin-service.ts    # Admin functions
│   ├── types.ts            # TypeScript interfaces
│   ├── utils.ts            # Helper functions
│   ├── hooks.ts            # Custom React hooks
│   ├── supabase.ts         # Supabase client
│   └── valuation.ts        # Valuation logic
├── supabase.sql            # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🗄️ Database Schema

### Tables
- **profiles** - User/dealer/admin accounts
- **cars** - Car listings
- **car_images** - Car photos
- **wishlists** - User favorites
- **chat_requests** - Buyer-seller communication
- **inspections** - Inspection bookings
- **dealer_leads** - Dealer lead tracking
- **valuations** - AI valuation history
- **reports** - User reports/complaints
- **admin_logs** - Admin action tracking

### Features
- Row-level security (RLS) for data privacy
- Foreign key constraints with cascade deletes
- Strategic indexes for performance
- Check constraints for data validation

## 🔧 Services & Libraries

### Core Services
- **user-service.ts** - Car listings, search, uploads
- **wishlist-service.ts** - Wishlist management
- **chat-service.ts** - Masked contact requests
- **inspection-service.ts** - Booking system
- **dealer.ts** - Dealer dashboard
- **admin-service.ts** - Admin functions
- **auth.ts** - Phone OTP authentication
- **valuation.ts** - Rule-based valuation

### Utilities & Types
- **types.ts** - 25+ TypeScript interfaces
- **utils.ts** - 30+ helper functions
- **hooks.ts** - 5 custom React hooks

## 🚀 Getting Started

### 1. Setup Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Run Database Schema

In Supabase SQL Editor, run:
```bash
# Copy entire supabase.sql content and execute
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Create Test Accounts

**User Account:**
- Email: user@test.com
- Password: 123456

**Dealer Account:**
- Email: dealer@test.com
- Password: 123456

**Admin Account:**
- Email: admin@test.com
- Password: 123456
- (Manually set role to 'admin' in Supabase)

## 📝 Key API Functions

### User Services
```typescript
createCarListing(input)
uploadCarImages(carId, files)
getUserListings()
searchCars(params)
addToWishlist(carId)
removeFromWishlist(carId)
sendChatRequest(carId)
bookInspection(input)
```

### Dealer Services
```typescript
getDealerLeads()
updateLeadStatus(leadId, status)
getLeadStats()
```

### Admin Services
```typescript
getAllUsers(page)
getAllCars(page)
getAllReports(page)
setCarStatus(carId, status)
resolveReport(reportId, status)
getAdminStats()
```

## 🔐 Security Features

- **Authentication**: Phone OTP via Supabase Auth
- **Row-Level Security**: Users can only access their data
- **Phone Masking**: Buyers and sellers see masked phone numbers
- **Admin Verification**: Admin-only pages check authorization
- **Ownership Validation**: Users can only edit/delete their own content

## ✅ Build Status

✓ TypeScript compilation successful
✓ All services implemented
✓ Database schema complete
✓ All pages functional

## 📄 License

MIT

---

**Built with ❤️ for the Indian automotive market**
│   ├── chat/                # Messaging system
│   ├── inspection-booking/  # Inspection scheduling
│   ├── ai-valuation/        # AI pricing
│   └── admin-panel/         # System administration
├── components/              # Reusable React components
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # TailwindCSS configuration
├── postcss.config.js        # PostCSS configuration
└── next.config.js           # Next.js configuration
```

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Package Manager:** npm

## 🎯 Core Modules

### 1. **Auth** (`modules/auth/`)
User authentication system with login, signup, and session management.
- Types: User, AuthError
- Services: signUp, signIn, signOut, getCurrentUser

### 2. **Dealer Dashboard** (`modules/dealer-dashboard/`)
Management panel for vehicle dealers.
- Types: DealerProfile, DealerStats
- Services: getDealerProfile, createDealerProfile, getDealerStats

### 3. **Car Listing** (`modules/car-listing/`)
Complete vehicle listing system for buyers and sellers.
- Types: CarListing, ListingFilter
- Services: getListings, getListingById, createListing, updateListing, deleteListing

### 4. **Chat System** (`modules/chat/`)
Real-time messaging between platform users.
- Types: ChatMessage, Conversation, UnreadCount
- Services: getConversations, getMessages, sendMessage, createConversation

### 5. **Inspection Booking** (`modules/inspection-booking/`)
Schedule and manage vehicle inspections.
- Types: InspectionBooking, InspectionReport, Inspector
- Services: bookInspection, getBooking, submitReport, updateBookingStatus

### 6. **AI Valuation** (`modules/ai-valuation/`)
AI-powered vehicle price estimation.
- Types: ValuationRequest, ValuationResult, ValuationFactor
- Services: getValuation, createValuation, getListingValuation

### 7. **Admin Panel** (`modules/admin-panel/`)
System administration and moderation tools.
- Types: AdminUser, ModerationAction, SystemStats
- Services: getSystemStats, getVerificationRequests, createModerationAction

## 🚀 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📋 Supabase Setup

Create the following tables in your Supabase project:

### Core Tables
- `users` - User profiles
- `dealer_profiles` - Dealer information
- `car_listings` - Vehicle listings
- `conversations` - Chat conversations
- `chat_messages` - Chat messages
- `inspection_bookings` - Inspection bookings
- `inspection_reports` - Inspection reports
- `valuations` - Vehicle valuations
- `moderation_actions` - Admin moderation logs
- `dealer_verification_requests` - Verification workflow

## 🔐 Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=         # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Your Supabase anon key
```

## 📝 Best Practices

- **TypeScript:** All modules use strict TypeScript with full type safety
- **Path Aliases:** Use `@/*` imports for cleaner code
- **Modular Design:** Each feature is self-contained with its own types and services
- **Error Handling:** Comprehensive error handling in all services
- **No Extra Dependencies:** Minimal dependencies, clean and scalable codebase

## 🤝 Contributing

1. Create a new branch for each feature
2. Follow the module structure for new features
3. Maintain TypeScript strict mode
4. Use TailwindCSS for styling (no extra CSS libraries)

## 📄 License

MIT

---

Built with ❤️ for the OurAuto team
