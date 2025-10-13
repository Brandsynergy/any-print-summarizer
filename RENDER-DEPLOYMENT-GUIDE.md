# 🚀 Render Deployment Guide - Monetization Ready

Your Any Print Summarizer app is now ready for deployment to Render with full monetization features!

## 📋 Pre-Deployment Checklist

✅ Stripe API keys ready  
✅ Database schema configured  
✅ Payment webhook routes set up  
✅ NextAuth authentication ready  
✅ render.yaml updated with all environment variables  

## 🛠️ Step-by-Step Deployment

### 1. Push Your Code to Git

```bash
git add .
git commit -m "Ready for Render deployment with monetization"
git push origin main
```

### 2. Set Up PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "PostgreSQL"
3. Configure database:
   - **Name**: `any-print-summarizer-db`
   - **Database**: `any_print_summarizer`
   - **User**: `any_print_user`
   - **Region**: Choose closest to you
   - **Plan**: Free (or Starter for production)
4. Click "Create Database"
5. **IMPORTANT**: Copy the "External Database URL" - you'll need this!

### 3. Create Web Service on Render

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - **Name**: `any-print-summarizer`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm start`
   - **Plan**: Free (or Starter for production)

### 4. Set Environment Variables

In the Render dashboard, go to your web service → Environment tab and add:

#### Required Environment Variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
# ^ Use the External Database URL from step 2

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth
NEXTAUTH_SECRET=your_random_secret_key_here_min_32_chars
# ^ Generate with: openssl rand -base64 32

# Stripe (LIVE KEYS for production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# App Configuration
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

#### Auto-Generated Variables (already configured):
- `NEXT_PUBLIC_APP_URL` - Auto-generated from service URL
- `NEXTAUTH_URL` - Auto-generated from service URL

### 5. Generate NEXTAUTH_SECRET

Run this command locally to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the result and use it as your `NEXTAUTH_SECRET`.

### 6. Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-app-name.onrender.com/api/stripe/webhook`
   - Replace `your-app-name` with your actual Render service name
4. **Events to send**: Select `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_`) 
7. Use this as your `STRIPE_WEBHOOK_SECRET` environment variable

### 7. Deploy!

1. Click "Create Web Service" (if not already done)
2. Wait for deployment (5-10 minutes)
3. Your app will be live at: `https://your-app-name.onrender.com`

## 🧪 Testing Your Deployment

### 1. Test Basic Functionality
- [ ] Upload an image
- [ ] Extract text works
- [ ] AI summarization works
- [ ] PDF generation works

### 2. Test Monetization Features
- [ ] User can access 2 free summaries
- [ ] Upgrade prompt appears after limit
- [ ] Academic mode requires premium
- [ ] Stripe checkout works
- [ ] Webhook processes payment
- [ ] User gets premium access after payment

### 3. Test Payment Flow
1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future date for expiry
3. Any 3-digit CVC
4. Any billing details

## 🔧 Production Settings

### Switch to Live Stripe Keys
When ready for real payments:
1. In Stripe Dashboard, toggle from "Test" to "Live" mode
2. Get your live API keys
3. Update environment variables in Render:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
4. Update webhook endpoint to use live keys

### Database Backup
- Render provides automatic backups for paid plans
- For critical data, consider additional backup solutions

## 💰 Revenue Model Summary

- **Free Tier**: 2 standard summaries
- **Premium**: $67 one-time payment (originally $197)
- **Features**: Unlimited summaries + Academic Analysis
- **Payment**: Stripe secure checkout
- **Access**: Immediate lifetime access after payment

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if DATABASE_URL is correctly set
echo $DATABASE_URL
```

### Stripe Webhook Issues
- Verify webhook URL matches your Render URL exactly
- Check webhook secret is correct
- View webhook logs in Stripe Dashboard

### Build Failures
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure PostgreSQL database is running

### User Not Getting Premium Access
1. Check Render logs for webhook errors
2. Verify webhook events are being received
3. Check database for payment records

## 📊 Monitoring

### Render Dashboard
- View logs: Logs tab
- Monitor performance: Metrics tab
- Check uptime: Events tab

### Stripe Dashboard
- Payment analytics
- Webhook delivery logs
- Customer management

## 🎯 Post-Deployment

1. **Test thoroughly** - Try the complete user journey
2. **Monitor logs** - Watch for any errors in first 24 hours
3. **Marketing** - Share your deployed app!
4. **Analytics** - Consider adding usage tracking
5. **Support** - Set up user support system

---

## 🔗 Important URLs After Deployment

- **Your App**: `https://your-app-name.onrender.com`
- **Stripe Webhook**: `https://your-app-name.onrender.com/api/stripe/webhook`
- **Render Dashboard**: `https://dashboard.render.com`
- **Stripe Dashboard**: `https://dashboard.stripe.com`

---

**🎉 Congratulations! Your monetized Any Print Summarizer is now live and ready to generate revenue!**

Need help? Check the troubleshooting section above or review the deployment logs in your Render dashboard.