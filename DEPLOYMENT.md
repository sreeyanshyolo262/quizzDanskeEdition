# 🚀 Deployment Guide for CCF Quiz

This guide covers multiple ways to deploy your real-time multiplayer quiz app to the internet.

## 📋 Prerequisites

Before deploying, make sure you have:
- [x] Node.js application with Express and Socket.io
- [x] All dependencies in package.json
- [x] Working locally on http://localhost:3000

## 🌟 Recommended: Deploy to Render (Free & Easy)

Render is perfect for Node.js apps with WebSocket support and offers a generous free tier.

### Step 1: Prepare for Deployment

1. **Create a `.gitignore` file** (if not exists):
```
node_modules/
.env
.DS_Store
Thumbs.db
*.log
```

2. **Update package.json** (already done):
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

### Step 2: Deploy to Render

1. **Create GitHub Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CCF Quiz App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ccf-quiz.git
   git push -u origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with GitHub
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `ccf-quiz`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"

3. **Your app will be live at**: `https://ccf-quiz-XXXX.onrender.com`

---

## 🔥 Alternative: Deploy to Railway

Railway is another excellent option with great WebSocket support.

### Steps:
1. Go to [railway.app](https://railway.app)
2. Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js and deploys!

---

## ⚡ Alternative: Deploy to Heroku

**Note**: Heroku removed free tier, but still popular for production apps.

### Steps:
1. Install Heroku CLI
2. Create `Procfile`:
```
web: node server.js
```

3. Deploy:
```bash
heroku create ccf-quiz-app
git push heroku main
```

---

## 🐳 Advanced: Deploy with Docker

### Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

---

## 🔧 Environment Configuration

For production deployment, consider adding these environment variables:

### Create `.env` file:
```env
NODE_ENV=production
PORT=3000
```

### Update `server.js` to use environment variables:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## 📱 Domain Setup (Optional)

After deploying, you can:

1. **Buy a custom domain** (e.g., `sumanasquiz.com`)
2. **Point domain to your deployment**:
   - Render: Add custom domain in dashboard
   - Railway: Configure custom domain
   - Use Cloudflare for DNS management

---

## 🛡️ Production Optimizations

### 1. Enable CORS for production:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000']
}));
```

### 2. Add rate limiting:
```bash
npm install express-rate-limit
```

### 3. Add security headers:
```bash
npm install helmet
```

---

## 🎯 Quick Start (Recommended)

**For fastest deployment, use Render:**

1. Push code to GitHub
2. Connect GitHub to Render
3. Deploy in 5 minutes
4. Share your live app URL!

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Socket.io Deployment Guide](https://socket.io/docs/v4/deployment/)

---

## 🎉 After Deployment

Once deployed, you can:
- Share the live URL with friends and colleagues
- Test multiplayer functionality from different devices
- Show off CCF Quiz to the world!

**Example live URL**: `https://ccf-quiz-abc123.onrender.com`

---

## 🆘 Troubleshooting

### Common Issues:
1. **WebSocket connection fails**: Ensure platform supports WebSockets
2. **App crashes**: Check logs for missing environment variables
3. **Images not uploading**: Verify file upload directory exists

### Check logs:
- **Render**: View logs in dashboard
- **Railway**: Use `railway logs`
- **Heroku**: Use `heroku logs --tail`
