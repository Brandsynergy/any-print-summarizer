# 🚀 Deployment Guide

This guide covers deploying your Any Print Summarizer app to both **Vercel** and **Render.com**.

## 📋 Prerequisites

1. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Account**: Either Vercel or Render.com account

## 🌟 Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- ✅ Built specifically for Next.js
- ✅ Automatic deployments from Git
- ✅ Edge functions for better performance
- ✅ Easy environment variable management

### Steps:

1. **Push your code to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/in with your Git provider
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   MAX_FILE_SIZE=10485760
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Automatic Updates
Every time you push to your main branch, Vercel will automatically redeploy!

---

## 🎯 Option 2: Deploy to Render.com

### Why Render?
- ✅ Full server environment (not serverless)
- ✅ Easy to use
- ✅ Good free tier
- ✅ Persistent file system if needed

### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/in with GitHub
   - Click "New +" → "Web Service"
   - Connect your repository

3. **Configure the Service**
   - **Name**: `any-print-summarizer`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Set Environment Variables**
   In the Environment section, add:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   MAX_FILE_SIZE=10485760
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment
   - Your app will be live at `https://your-app.onrender.com`

---

## 🔧 Post-Deployment Checklist

### Test These Features:
- [ ] Image upload works
- [ ] OCR text extraction works
- [ ] AI summarization works
- [ ] Book detection and search works
- [ ] PDF download works
- [ ] Responsive design on mobile

### Performance Optimizations:
- [ ] Images load properly
- [ ] API responses are fast
- [ ] Error handling works correctly
- [ ] Loading states show properly

---

## 🚨 Common Issues & Solutions

### Issue: "API key not configured"
**Solution**: Make sure `OPENAI_API_KEY` is set in your deployment environment variables.

### Issue: "Upload failed" or timeout errors
**Solutions**:
- Check file size limits (currently 10MB)
- Increase function timeout in `vercel.json`
- Use smaller images for testing

### Issue: OCR not working in production
**Solution**: This is normal - OCR runs client-side using Tesseract.js, which may take longer on some devices.

### Issue: PDF generation not working
**Solution**: PDF generation is client-side using jsPDF. Make sure JavaScript is enabled in the browser.

---

## 🔄 Updating Your Deployment

### For Vercel:
```bash
git add .
git commit -m "Update app"
git push origin main
```
Auto-deploys! ✨

### For Render:
```bash
git add .
git commit -m "Update app"
git push origin main
```
Then click "Manual Deploy" in Render dashboard, or enable auto-deploy.

---

## 📊 Monitoring & Logs

### Vercel:
- View logs in Vercel dashboard → Functions tab
- Monitor performance in Analytics

### Render:
- View logs in Render dashboard → Logs tab
- Monitor service health in Metrics

---

## 💡 Tips for Production

1. **Monitor API Usage**: Keep an eye on OpenAI API usage and costs
2. **Set Usage Limits**: Consider adding rate limiting for heavy usage
3. **Error Tracking**: Consider adding error tracking (Sentry, etc.)
4. **Backups**: Keep your Git repository as your source of truth
5. **Performance**: Monitor load times and optimize images

---

## 🆘 Need Help?

1. Check the browser console for JavaScript errors
2. Check deployment logs in your platform dashboard
3. Test with a simple, clear image first
4. Make sure all environment variables are set correctly

---

**Your Any Print Summarizer is ready for the world! 🌟**