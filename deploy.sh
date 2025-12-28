#!/bin/bash

# Al Safa Global Website - Deployment Script
echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy Al Safa Global website - $(date)"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  No remote repository configured."
    echo "Please run these commands manually:"
    echo "1. Create a repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
    echo "3. Run: git branch -M main"
    echo "4. Run: git push -u origin main"
    echo ""
    echo "Then deploy to Render:"
    echo "1. Go to https://render.com"
    echo "2. New → Blueprint → connect your GitHub repository"
    echo "3. Review service from render.yaml"
    echo "4. Add environment variables"
    echo "5. Deploy!"
    exit 1
fi

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/login with GitHub"
echo "3. Click 'New' → 'Blueprint' and select this repository"
echo "4. Add environment variables:"
echo "   - MONGODB_URI_PROD"
echo "   - JWT_SECRET"
echo "   - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM"
echo "   - CLIENT_URL_PROD"
echo "5. Click 'Apply' to deploy"
echo ""
echo "🎉 Your website will be live at your Render service URL or custom domain"