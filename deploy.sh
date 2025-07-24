#!/bin/bash

echo "🚀 Preparing CCF Quiz for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy: CCF Quiz - $(date)"

echo "✅ Ready for deployment!"
echo ""
echo "🌟 Next steps:"
echo "1. Push to GitHub: git remote add origin YOUR_REPO_URL && git push -u origin main"
echo "2. Deploy on Render.com or Railway.app"
echo "3. Share your live quiz app!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
