# Al Safa Global Website - Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository
1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect your configuration
5. Add environment variables (see Environment Variables section below)
6. Click "Deploy"

### Step 3: Configure Environment Variables
In your Vercel dashboard, add these environment variables:

**Required Variables:**
- `MONGODB_URI_PROD` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A long, random secret key
- `EMAIL_HOST` - smtp.gmail.com
- `EMAIL_PORT` - 587
- `EMAIL_USER` - Your Gmail address
- `EMAIL_PASS` - Your Gmail app password
- `EMAIL_FROM` - info@alsafaglobal.com

**Optional Variables:**
- `NODE_ENV` - production
- `BCRYPT_SALT_ROUNDS` - 12
- `RATE_LIMIT_WINDOW_MS` - 900000
- `RATE_LIMIT_MAX_REQUESTS` - 100

## 🔧 Alternative Deployment Options

### Netlify Deployment
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Connect GitHub repository
4. Build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
5. Add environment variables in Netlify dashboard

### GitHub Pages
1. Push code to GitHub
2. Go to repository Settings > Pages
3. Source: Deploy from a branch
4. Branch: main, folder: /client
5. Update client/package.json to include homepage

## 📁 Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js
│   ├── models/
│   ├── routes/
│   └── utils/
├── vercel.json            # Vercel configuration
└── package.json           # Root package.json
```

## 🔒 Security Checklist
- [ ] MongoDB Atlas database configured
- [ ] Environment variables set
- [ ] JWT secret is strong and unique
- [ ] Email credentials configured
- [ ] CORS settings updated for production
- [ ] Rate limiting enabled
- [ ] Helmet security headers active

## 🌐 Domain Configuration
After deployment, you can:
1. Add custom domain in Vercel dashboard
2. Configure DNS records
3. Enable HTTPS (automatic with Vercel)

## 📧 Email Setup
1. Enable 2-factor authentication on Gmail
2. Generate app password
3. Use app password in EMAIL_PASS variable
4. Test email functionality

## 🔍 Post-Deployment Testing
- [ ] Homepage loads correctly
- [ ] Contact form works
- [ ] Email notifications sent
- [ ] All pages accessible
- [ ] Mobile responsiveness
- [ ] Performance optimization

## 🛠️ Troubleshooting
- Check Vercel function logs for server errors
- Verify environment variables are set correctly
- Ensure MongoDB Atlas IP whitelist includes Vercel
- Test email configuration locally first

## 📞 Support
For deployment issues, check:
- Vercel documentation
- MongoDB Atlas setup guide
- Gmail SMTP configuration 