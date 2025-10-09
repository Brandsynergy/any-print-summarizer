# Monetization Setup Guide

## 🚀 Overview
Your app now includes a complete monetization system with:
- **Free Tier**: 2 free standard summaries
- **Premium Tier**: $67 one-time payment for lifetime access
- **Stripe Integration**: Secure payment processing
- **User Authentication**: Account management and usage tracking

## 📋 Environment Variables Required

Add these to your Render environment variables:

```env
# Database (Required)
DATABASE_URL=your_postgresql_connection_string

# NextAuth (Required)
NEXTAUTH_URL=https://your-app-domain.onrender.com
NEXTAUTH_SECRET=your_random_secret_key_here

# Stripe (Required)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# OpenAI (Already configured)
OPENAI_API_KEY=your_existing_openai_key
```

## 🗄️ Database Setup

### Option 1: Render PostgreSQL (Recommended)
1. Go to Render Dashboard
2. Create a new PostgreSQL database
3. Copy the External Database URL
4. Add as `DATABASE_URL` environment variable

### Option 2: External Database
- Use any PostgreSQL provider (Supabase, PlanetScale, etc.)
- Get connection string in format: `postgresql://user:password@host:port/database`

## 💳 Stripe Setup

### 1. Create Stripe Account
- Go to https://stripe.com
- Create account or use existing

### 2. Get API Keys
- Dashboard → Developers → API Keys
- Copy Secret Key and Publishable Key

### 3. Set up Webhook
- Dashboard → Developers → Webhooks
- Add endpoint: `https://your-app.onrender.com/api/stripe/webhook`
- Select events: `checkout.session.completed`
- Copy webhook secret

### 4. Configure Product
The system automatically creates products, but you can customize:
- Price: Currently set to $6700 (=$67.00)
- Original price display: $197.00
- Description: "Lifetime Access to Academic Analysis"

## 🔧 Render Configuration

### Build Command
```bash
npm install && npx prisma generate && npm run build
```

### Start Command  
```bash
npx prisma migrate deploy && npm start
```

### Environment Variables
Set all variables listed in "Environment Variables Required" section above.

## 📊 How It Works

### Free Users
- Get 2 free standard summaries
- Cannot access Academic Analysis mode
- See upgrade prompts when limits reached

### Premium Users (After $67 payment)
- Unlimited standard summaries
- Unlimited academic analysis
- Full access to all features
- Lifetime access (no recurring charges)

### Payment Flow
1. User clicks "Get Lifetime Access"
2. Redirected to Stripe Checkout
3. After payment → Stripe webhook → User upgraded
4. Immediate access to all features

## 🧪 Testing

### Test Mode Setup
1. Use Stripe test keys for development
2. Test card: `4242 4242 4242 4242`
3. Use test webhook endpoint during development

### Production Checklist
- [ ] PostgreSQL database connected
- [ ] All environment variables set
- [ ] Stripe webhook configured
- [ ] Live Stripe keys (not test keys)
- [ ] NEXTAUTH_URL points to production domain

## 🔗 User Journey

1. **First Visit**: User can try 2 free summaries
2. **Limit Reached**: Upgrade prompt shown
3. **Academic Mode**: Requires premium (immediate upgrade prompt)
4. **Payment**: Stripe checkout → instant access
5. **Lifetime Access**: No more limits or charges

## 💰 Revenue Model
- **One-time payment**: $67 (originally $197)
- **66% discount positioning**: Creates urgency
- **Lifetime value**: No recurring costs, high perceived value
- **Conversion triggers**: Limit reached, premium features

## 🚨 Important Notes

1. **Database Required**: App won't work without PostgreSQL
2. **Webhook Critical**: User upgrades won't work without proper webhook
3. **HTTPS Only**: Stripe requires HTTPS in production
4. **Environment Variables**: All must be set before deployment

## 🎯 Next Steps After Setup

1. Test the complete payment flow
2. Verify webhook is receiving events
3. Test user upgrade functionality
4. Monitor usage analytics
5. Consider adding user dashboard for usage stats

Your app is now ready to generate revenue! 🎉