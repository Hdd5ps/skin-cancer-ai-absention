# Cloud Backend Deployment Guide

## Free Cloud Provider Options

### Option 1: Heroku (Recommended)
- **Free tier**: Available (with limitations)
- **SSL**: Automatic HTTPS
- **Ease of use**: Very easy deployment
- **Limitations**: 512MB RAM, sleeps after inactivity

### Option 2: Render
- **Free tier**: Available
- **SSL**: Automatic HTTPS
- **Ease of use**: Easy, similar to Heroku
- **Limitations**: 512MB RAM, spins down after inactivity

### Option 3: Railway
- **Free tier**: $5 credit/month
- **SSL**: Automatic HTTPS
- **Ease of use**: Very easy with GitHub integration
- **Limitations**: Credit-based system

## Heroku Deployment Instructions

### Prerequisites
1. Install Heroku CLI: `npm install -g heroku`
2. Heroku account (free)
3. Git repository

### Deployment Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create Heroku App**
   ```bash
   heroku create dermascan-ai-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY=your-production-secret-key-change-this
   heroku config:set API_KEY=your-production-api-key-change-this
   heroku config:set API_KEYS=your-production-api-key-change-this
   heroku config:set ENVIRONMENT=production
   heroku config:set CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost
   heroku config:set RATE_LIMIT_REQUESTS=50
   heroku config:set RATE_LIMIT_PERIOD=3600
   heroku config:set BLUR_THRESHOLD=100.0
   heroku config:set CONFIDENCE_THRESHOLD=0.80
   ```

4. **Deploy Backend**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend deployment"
   heroku git:remote -a dermascan-ai-backend
   git push heroku main
   ```

5. **Build Frontend for Production**
   ```bash
   cd ..
   npm run build
   ```

6. **Verify Deployment**
   ```bash
   heroku open
   # Test health endpoint
   curl https://dermascan-ai-backend.herokuapp.com/health
   ```

## Render Deployment Instructions

### Prerequisites
1. Render account (free)
2. GitHub repository

### Deployment Steps

1. **Push Backend to GitHub**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Backend for Render deployment"
   git remote add origin https://github.com/your-username/backend-repo.git
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to dashboard.render.com
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Root Directory**: `backend`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
     - **Python Version**: 3.11.9

3. **Set Environment Variables** (in Render dashboard)
   - `SECRET_KEY`: your-production-secret-key-change-this
   - `API_KEY`: your-production-api-key-change-this
   - `API_KEYS`: your-production-api-key-change-this
   - `ENVIRONMENT`: production
   - `CORS_ORIGINS`: https://your-frontend-domain.com,capacitor://localhost,http://localhost
   - `RATE_LIMIT_REQUESTS`: 50
   - `RATE_LIMIT_PERIOD`: 3600
   - `BLUR_THRESHOLD`: 100.0
   - `CONFIDENCE_THRESHOLD`: 0.80

4. **Build Frontend for Production**
   ```bash
   npm run build
   ```

## Railway Deployment Instructions

### Prerequisites
1. Railway account
2. GitHub repository

### Deployment Steps

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway Project**
   ```bash
   cd backend
   railway init
   railway up
   ```

3. **Configure Environment Variables**
   ```bash
   railway variables set SECRET_KEY=your-production-secret-key-change-this
   railway variables set API_KEY=your-production-api-key-change-this
   railway variables set API_KEYS=your-production-api-key-change-this
   railway variables set ENVIRONMENT=production
   railway variables set CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost
   railway variables set RATE_LIMIT_REQUESTS=50
   railway variables set RATE_LIMIT_PERIOD=3600
   railway variables set BLUR_THRESHOLD=100.0
   railway variables set CONFIDENCE_THRESHOLD=0.80
   ```

4. **Deploy**
   ```bash
   railway deploy
   ```

5. **Build Frontend for Production**
   ```bash
   npm run build
   ```

## Post-Deployment Configuration

### Update Frontend API URL
Once deployed, update your frontend environment variables:

**For Capacitor (mobile):**
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ... existing config
  server: {
    androidScheme: 'https',
    // Add your deployed backend URL
    url: 'https://your-backend-url.com'
  }
}
```

**For Web:**
```env
# .env.production
VITE_API_URL=https://your-backend-url.com/predict
VITE_API_KEY=your-production-api-key-change-this
```

### Update Capacitor Configuration
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  // ... existing config
  server: {
    androidScheme: 'https',
    // Your deployed backend URL
    url: 'https://your-backend-url.com'
  },
  plugins: {
    // ... existing plugins
  }
}
```

## Security Notes

### Important Security Changes Needed:
1. **Change SECRET_KEY** - Generate a secure random key
2. **Change API_KEY** - Use a strong, unique API key
3. **Add domain-specific CORS** - Only allow your actual domains
4. **Monitor rate limiting** - Adjust based on actual usage
5. **Consider IP whitelisting** - For additional security

### Generate Secure Keys:
```bash
# Generate secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate secure API key
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

## Monitoring and Maintenance

### Health Checks
```bash
# Test health endpoint
curl https://your-backend-url.com/health

# Test prediction endpoint
curl -X POST https://your-backend-url.com/predict \
  -H "X-API-Key: your-api-key" \
  -F "file=@test-image.jpg"
```

### Log Monitoring
- **Heroku**: `heroku logs --tail`
- **Render**: View logs in dashboard
- **Railway**: `railway logs`

## Troubleshooting

### Common Issues:

1. **Memory Limits** - Free tiers have limited RAM
   - Solution: Use model quantization or upgrade to paid tier

2. **Cold Starts** - Free tiers spin down
   - Solution: Use keep-alive scripts or upgrade

3. **Build Failures** - Dependency issues
   - Solution: Check requirements.txt versions

4. **CORS Errors** - Origin not allowed
   - Solution: Update CORS_ORIGINS environment variable

## Cost Estimates

### Free Tier Limitations:
- **Heroku**: 512MB RAM, sleeps after 30min inactivity
- **Render**: 512MB RAM, spins down after 15min inactivity
- **Railway**: $5 credit/month (about 512MB RAM)

### Paid Upgrades (if needed):
- **Heroku Basic**: $5/month (512MB RAM, no sleep)
- **Render Starter**: $7/month (512MB RAM, no sleep)
- **Railway**: $5-10/month (512MB-1GB RAM)

## Next Steps

1. Choose a cloud provider (Heroku recommended for ease of use)
2. Follow the deployment instructions
3. Update frontend API configuration
4. Test the deployed backend
5. Monitor logs and performance
6. Set up monitoring/alerts for production