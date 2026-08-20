# Cloud Backend Deployment Guide

This guide deploys the FastAPI backend to Render or Railway. The backend is defined by [backend/Procfile](backend/Procfile), which runs `uvicorn app:app --host 0.0.0.0 --port $PORT`, and targets Python 3.11.9 as specified in [backend/runtime.txt](backend/runtime.txt).

## Free Cloud Provider Options

### Option 1: Render (Recommended)
- **Free tier**: Available for a web service
- **SSL**: Automatic HTTPS
- **Configuration**: GitHub-connected deployment with a `backend` root directory
- **Limitations**: 512 MB RAM and spin-down after approximately 15 minutes of inactivity; cold starts reload the model

### Option 2: Railway
- **Free usage**: $5 monthly credit rather than an always-free instance
- **SSL**: Automatic HTTPS
- **Ease of use**: GitHub integration and CLI deployment
- **Limitations**: Usage consumes the monthly credit; a larger or continuously running service may require payment

### Heroku status
Heroku is **no longer free**. Free dynos were removed in November 2022. Heroku remains a paid deployment option, but it is not the recommended free path for this project.

## Fitting PyTorch into 512 MB (CPU-only wheel)

The normal PyTorch package can include CUDA components that are unnecessary for this CPU-only inference service. Those wheels are large and can exceed a 512 MB free-tier memory limit. A CPU-only wheel is substantially smaller, but 512 MB is still tight and this is not a guarantee that every build will fit.

Create a deployment-only requirements file, for example `backend/requirements-cpu.txt`, based on the existing production requirements. Put this at the top of the file, before the PyTorch entries:

```text
--extra-index-url https://download.pytorch.org/whl/cpu
torch==2.6.0
torchvision==0.21.0
```

Copy the remaining inference dependencies from `backend/requirements-production.txt`, omitting its regular `torch` and `torchvision` lines. Keep the versions pinned at `2.6.0` and `0.21.0`. The CPU index must be available to the installer for both packages; alternatively, use the matching `torch==2.6.0+cpu` and `torchvision==0.21.0+cpu` pins if that index resolves them for the selected Python version.

Set the provider's build command to install this file, for example:

```bash
pip install -r requirements-cpu.txt
```

Keep only inference dependencies in this deployment file where possible. If Render still runs out of memory during build or startup, use Railway's credit-based service or a paid tier with more memory. Do not claim that the CPU-only wheel guarantees a successful 512 MB deployment.

## Render Deployment Instructions

### Prerequisites
1. A Render account
2. The repository pushed to GitHub
3. A deployment requirements file such as `backend/requirements-cpu.txt` if using the CPU-only PyTorch path above

### Create the web service
1. Open [dashboard.render.com](https://dashboard.render.com).
2. Select **New +** and then **Web Service**.
3. Connect the GitHub repository.
4. Configure the service with:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements-cpu.txt` when using the CPU-only file, or `pip install -r requirements.txt` if you intentionally use the existing full-wheel requirements
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: `3.11.9`

The CPU-only requirements file is preferred for the free tier. If it is named `requirements.txt` in your deployment branch, use `pip install -r requirements.txt` as the Build Command.

### Environment variables
Add these in the Render dashboard. Replace placeholder secrets and domains with production values.

```text
SECRET_KEY=your-production-secret-key
API_KEY=your-production-api-key
API_KEYS=your-production-api-key
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_PERIOD=3600
BLUR_THRESHOLD=100.0
CONFIDENCE_THRESHOLD=0.80
```

Keep both `capacitor://localhost` and `http://localhost` in `CORS_ORIGINS` so the mobile app and local development client can call the API.

### Verify the service

After the first deploy, note the Render URL and test it:

```bash
curl https://your-backend.onrender.com/health
curl -X POST https://your-backend.onrender.com/predict \
  -H "X-API-Key: your-production-api-key" \
  -F "file=@test-image.jpg"
```

## Railway Deployment Instructions

Railway is the alternative when Render's 512 MB limit is too tight. It provides a $5 monthly usage credit; monitor usage in the Railway dashboard.

### CLI deployment

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

Configure the service to use the same deployment settings:

- **Root Directory**: `backend` when configuring from the repository dashboard
- **Build Command**: `pip install -r requirements-cpu.txt` for the CPU-only file
- **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Python Version**: `3.11.9`

Set the same environment variables listed in the Render section. With the CLI:

```bash
railway variables set SECRET_KEY=your-production-secret-key
railway variables set API_KEY=your-production-api-key
railway variables set API_KEYS=your-production-api-key
railway variables set ENVIRONMENT=production
railway variables set CORS_ORIGINS=https://your-frontend-domain.com,capacitor://localhost,http://localhost
railway variables set RATE_LIMIT_REQUESTS=50
railway variables set RATE_LIMIT_PERIOD=3600
railway variables set BLUR_THRESHOLD=100.0
railway variables set CONFIDENCE_THRESHOLD=0.80
railway deploy
```

## Post-Deployment Configuration

### Point the frontend at the deployed API

The frontend reads `VITE_API_URL` at build time. Include the `/predict` path in the value:

```env
VITE_API_URL=https://your-backend.onrender.com/predict
VITE_API_KEY=your-production-api-key
```

For a Railway deployment, substitute its public HTTPS URL. These values must be present when the Android GitHub Actions build runs; setting them only in a local `.env.production` file will not configure the CI-built APK. Add them as the appropriate repository or environment secrets/variables used by the Android workflow, and pass them into the frontend build.

For local web builds, place the same values in `.env.production` before running `pnpm build`. The mobile app should use the deployed API URL rather than `localhost`.

### Capacitor configuration

`capacitor.config.ts` controls the app's web server scheme and should remain HTTPS-compatible. The API endpoint itself is configured through `VITE_API_URL`:

```typescript
server: {
  androidScheme: 'https'
}
```

## Security Notes

1. Generate a unique production `SECRET_KEY`.
2. Generate strong, unique `API_KEY` and `API_KEYS` values.
3. Restrict `CORS_ORIGINS` to actual production domains while retaining `capacitor://localhost` and `http://localhost` when those clients are required.
4. Monitor rate limiting and adjust it based on real usage.
5. Do not commit production secrets to the repository.

Generate keys with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
python -c "import secrets; print(secrets.token_urlsafe(16))"
```

## Monitoring and Maintenance

### Health and prediction checks

```bash
curl https://your-backend-url.com/health
curl -X POST https://your-backend-url.com/predict \
  -H "X-API-Key: your-api-key" \
  -F "file=@test-image.jpg"
```

### Logs
- **Render**: View service logs in the dashboard
- **Railway**: `railway logs`
- **Heroku paid deployment**: `heroku logs --tail`

## Troubleshooting

### Memory limits
Free tiers have limited RAM. First try the CPU-only PyTorch requirements file and keep only inference dependencies. The CPU-only wheel is smaller than the default package, but 512 MB remains tight. If the build or model startup still exceeds the limit, use Railway's $5 credit, a paid Render tier, or another service with more memory.

### Cold starts
Render free services spin down after inactivity. The first request afterward can be slow while the container wakes and reloads the model. Railway may also be slow while a service starts. Do not treat a slow first request as a model failure.

### Build failures
Confirm that Python is `3.11.9`, the build command points to the intended requirements file, and the CPU PyTorch index is reachable. Check the provider build logs for the package that failed.

### CORS errors
Update `CORS_ORIGINS` with the exact web origin and retain `capacitor://localhost,http://localhost` for the mobile and local clients.

### API errors
Confirm that `VITE_API_URL` includes `/predict`, `VITE_API_KEY` matches `API_KEY` or `API_KEYS`, and the deployed `/health` endpoint responds before testing an image upload.

## Cost Estimates

| Provider | Free or entry-level model | Main limitation |
| --- | --- | --- |
| Render | Free web service | 512 MB RAM and spin-down after about 15 minutes |
| Railway | $5 monthly usage credit | Credit is consumed by runtime and resources |
| Heroku | Paid only; no free dynos since November 2022 | Paid plan and resource limits vary |

Paid fallbacks include a larger Render instance, additional Railway usage, or a paid Heroku dyno. Choose a plan with enough memory for the model rather than assuming the full PyTorch wheel fits in 512 MB.

## Next Steps

1. Create the CPU-only deployment requirements file if targeting a 512 MB free tier.
2. Deploy to Render first, or use Railway if Render runs out of memory.
3. Set the production environment variables.
4. Set `VITE_API_URL` to the deployed `/predict` endpoint and provide `VITE_API_KEY` to the Android CI build.
5. Build and install the phone app, then test health, permissions, image upload, and cold-start behavior.
6. Monitor logs, memory usage, and provider costs.
