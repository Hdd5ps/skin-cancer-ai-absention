# Cloud Backend Deployment Guide

This guide deploys the FastAPI backend to Render or Railway. The backend is defined by [backend/Procfile](backend/Procfile), which runs `uvicorn app:app --host 0.0.0.0 --port $PORT`, and targets Python 3.11.9 as specified in [backend/runtime.txt](backend/runtime.txt).

## Choosing a Free Hosting Strategy

The full PyTorch backend is difficult to run on a permanent free tier because `torch==2.6.0`, `torchvision==0.21.0`, and OpenCV can exceed 512 MB RAM. Choose between temporary student credits and a durable model-footprint reduction.

### Strategy A — If you HAVE the GitHub Student Developer Pack

The GitHub Student Developer Pack can include cloud credits that make otherwise-paid hosting effectively free while you remain a verified student. These are temporary credits, not a permanent free tier.

- **Heroku**: The Pack provides $13/month in credits for up to 24 months. A Basic dyno at approximately $7/month provides automatic HTTPS and does not sleep, making it the longest predictable runway for this app. The dyno still has 512 MB RAM, so use the CPU-only PyTorch wheel described below; full CUDA-enabled wheels may not fit.
- **Microsoft Azure for Students**: The offer includes a $100 credit and 25+ free services without requiring a credit card. An App Service B1 plan or a suitably configured Container Apps deployment provides approximately 1.75 GB RAM, which is more suitable for the full PyTorch stack. That tier consumes the $100 credit faster, typically over a few months; scale-to-zero options can stretch the credit when the deployment supports them.

For this project, Heroku is the simpler student-credit host and offers the longer stated runway. Plan the ONNX migration in Strategy B before student status or the credit period ends. Heroku and Azure are student-funded options, not free for the general public.

### Strategy B — If you do NOT have the Student Pack (permanent free)

The durable free-tier approach is to remove the dependency that makes the backend too large: export `backend/models/mobilenetv2_calibrated.pth` to ONNX and serve it with `onnxruntime` instead of `torch` and `torchvision`. ONNX Runtime is much smaller than the full PyTorch stack, so the backend is more likely to fit permanently on a 512 MB Render or Railway service.

The conversion must preserve the existing inference behavior:

- Resize input images to `224x224` and apply ImageNet normalization.
- Apply temperature scaling as `logits / 1.1672`, then apply sigmoid as currently implemented.
- Keep the Laplacian-variance blur gate before model inference.

Until the ONNX migration is complete, use the CPU-only PyTorch wheel on Render or Railway and accept that 512 MB remains tight and cold starts occur. ONNX is the recommended long-term answer for both strategies because it removes dependence on expiring student credits and reduces hosting memory pressure.

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
| Heroku | Paid only; no free dynos since November 2022 | Paid plan and resource limits vary; GitHub Student Pack credits may cover it temporarily |
| Microsoft Azure | Paid by default; Azure for Students may provide $100 credit | Student credit expires and is consumed faster on larger plans |

Heroku and Azure are free-for-students-only through the Student Pack offers, not generally free hosting. Paid fallbacks include a larger Render instance, additional Railway usage, or a paid Heroku or Azure service. Choose a plan with enough memory for the model rather than assuming the full PyTorch wheel fits in 512 MB.

## Next Steps

1. Choose Strategy A if you have the GitHub Student Developer Pack, or Strategy B for a permanent free path.
2. Create the CPU-only deployment requirements file for an interim 512 MB deployment, or plan the ONNX migration for the durable solution.
3. Deploy to Render first, use Railway if Render runs out of memory, or use the student-credit host selected in Strategy A.
4. Set the production environment variables.
5. Set `VITE_API_URL` to the deployed `/predict` endpoint and provide `VITE_API_KEY` to the Android CI build.
6. Build and install the phone app, then test health, permissions, image upload, and cold-start behavior.
7. Monitor logs, memory usage, credit expiry, and provider costs.
