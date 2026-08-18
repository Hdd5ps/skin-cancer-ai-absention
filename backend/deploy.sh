#!/bin/bash

# Backend Deployment Script for DermaScan AI
# Supports Heroku, Render, and Railway deployment

set -e

echo "=== DermaScan AI Backend Deployment ==="
echo ""
echo "Choose deployment platform:"
echo "1) Heroku (Recommended - Free tier available)"
echo "2) Render (Free tier available)"
echo "3) Railway (Free credits available)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "=== Heroku Deployment ==="
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "Heroku CLI not found. Installing..."
        npm install -g heroku
    fi
    
    # Login to Heroku
    echo "Please login to Heroku:"
    heroku login
    
    # Create Heroku app
    read -p "Enter app name (default: dermascan-ai-backend): " app_name
    app_name=${app_name:-dermascan-ai-backend}
    
    heroku create $app_name
    
    # Set environment variables
    echo "Setting environment variables..."
    heroku config:set SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))") --app $app_name
    heroku config:set API_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(16))") --app $app_name
    heroku config:set API_KEYS=$(python -c "import secrets; print(secrets.token_urlsafe(16))") --app $app_name
    heroku config:set ENVIRONMENT=production --app $app_name
    heroku config:set CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost --app $app_name
    heroku config:set RATE_LIMIT_REQUESTS=50 --app $app_name
    heroku config:set RATE_LIMIT_PERIOD=3600 --app $app_name
    heroku config:set BLUR_THRESHOLD=100.0 --app $app_name
    heroku config:set CONFIDENCE_THRESHOLD=0.80 --app $app_name
    
    # Deploy
    echo "Deploying to Heroku..."
    git init
    git add .
    git commit -m "Deploy DermaScan AI backend to Heroku"
    heroku git:remote -a $app_name
    git push heroku main || git push heroku master
    
    echo "Deployment complete! Your app is available at: https://$app_name.herokuapp.com"
    echo "Test the health endpoint: curl https://$app_name.herokuapp.com/health"
    ;;
    
  2)
    echo "=== Render Deployment ==="
    echo "To deploy to Render:"
    echo "1. Push this code to GitHub"
    echo "2. Go to https://dashboard.render.com"
    echo "3. Create a new Web Service"
    echo "4. Connect your GitHub repository"
    echo "5. Use these settings:"
    echo "   - Root Directory: backend"
    echo "   - Build Command: pip install -r requirements.txt"
    echo "   - Start Command: uvicorn app:app --host 0.0.0.0 --port \$PORT"
    echo "   - Python Version: 3.11.9"
    echo ""
    echo "Set these environment variables in Render dashboard:"
    echo "   - SECRET_KEY: $(python -c "import secrets; print(secrets.token_urlsafe(32))")"
    echo "   - API_KEY: $(python -c "import secrets; print(secrets.token_urlsafe(16))")"
    echo "   - API_KEYS: $(python -c "import secrets; print(secrets.token_urlsafe(16))")"
    echo "   - ENVIRONMENT: production"
    echo "   - CORS_ORIGINS: https://your-frontend-domain.com,capacitor://localhost,http://localhost"
    echo "   - RATE_LIMIT_REQUESTS: 50"
    echo "   - RATE_LIMIT_PERIOD: 3600"
    echo "   - BLUR_THRESHOLD: 100.0"
    echo "   - CONFIDENCE_THRESHOLD: 0.80"
    ;;
    
  3)
    echo "=== Railway Deployment ==="
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    echo "Please login to Railway:"
    railway login
    
    # Initialize Railway project
    echo "Initializing Railway project..."
    railway init
    
    # Set environment variables
    echo "Setting environment variables..."
    railway variables set SECRET_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
    railway variables set API_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(16))")
    railway variables set API_KEYS=$(python -c "import secrets; print(secrets.token_urlsafe(16))")
    railway variables set ENVIRONMENT=production
    railway variables set CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost
    railway variables set RATE_LIMIT_REQUESTS=50
    railway variables set RATE_LIMIT_PERIOD=3600
    railway variables set BLUR_THRESHOLD=100.0
    railway variables set CONFIDENCE_THRESHOLD=0.80
    
    # Deploy
    echo "Deploying to Railway..."
    railway deploy
    
    echo "Deployment complete! Check your Railway dashboard for the URL."
    ;;
    
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "=== Post-Deployment Steps ==="
echo "1. Update your frontend API_URL to point to the deployed backend"
echo "2. Update capacitor.config.ts with the new backend URL"
echo "3. Test the deployment with the health endpoint"
echo "4. Update CORS_ORIGINS with your actual frontend domain"
echo ""
echo "For detailed instructions, see CLOUD_DEPLOYMENT.md"