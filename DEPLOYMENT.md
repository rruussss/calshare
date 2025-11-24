# Deployment Guide

This guide covers deploying CalShare to various hosting platforms.

## Recommended Platforms

### 🚀 Render.com (Recommended - Free Tier Available)

**Why Render?**
- Free tier with 750 hours/month
- Automatic HTTPS
- Easy GitHub integration
- Built-in environment variable management
- Supports Python/Flask out of the box

**Steps:**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/calshare.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** calshare (or your choice)
     - **Environment:** Python 3
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - Add environment variables:
     - `ANTHROPIC_API_KEY` - Your Anthropic API key
     - `SECRET_KEY` - A random secret key (optional, auto-generated if not set)
   - Click "Create Web Service"

3. **Your app will be live at:** `https://calshare.onrender.com` (or your custom domain)

**Note:** Render's free tier spins down after 15 minutes of inactivity. First request after spin-down may take ~30 seconds.

---

### 🚂 Railway (Alternative - Free Trial)

**Why Railway?**
- $5 free credit monthly
- Fast deployments
- Great developer experience

**Steps:**

1. Push to GitHub (same as above)

2. **Deploy on Railway:**
   - Go to [railway.app](https://railway.app) and sign up
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Python
   - Add environment variables:
     - `ANTHROPIC_API_KEY`
   - Deploy!

**Note:** Railway uses the `Procfile` automatically.

---

### ☁️ Fly.io (Alternative)

**Why Fly.io?**
- Free tier available
- Global edge network
- Great for scaling

**Steps:**

1. Install Fly CLI: https://fly.io/docs/getting-started/installing-flyctl/

2. **Deploy:**
   ```bash
   fly launch
   # Follow prompts, select your app name
   fly secrets set ANTHROPIC_API_KEY=your-key-here
   fly deploy
   ```

---

## Important Notes

### Tesseract OCR

**⚠️ OCR features require Tesseract to be installed on the server.**

Most cloud platforms don't have Tesseract pre-installed. Options:

1. **Use without OCR:** The app will still work for:
   - ICS files (direct parsing)
   - Text files (AI parsing)
   - Manual entry
   - OCR will just return empty text (AI can still work with images via vision)

2. **Add Tesseract (Render):**
   - Add a build script or use a Dockerfile
   - See `Dockerfile` example below

3. **Use alternative OCR service:** Consider using cloud OCR APIs instead

### Database

The app uses SQLite by default, which works for:
- ✅ Small to medium traffic
- ✅ Single server deployments
- ✅ Development/testing

For production with high traffic, consider:
- PostgreSQL (Render offers free PostgreSQL)
- Update `app.py` to use PostgreSQL connection string

### Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key (required for AI features)

Optional:
- `SECRET_KEY` - Flask secret key (auto-generated if not set)
- `PORT` - Server port (auto-detected on most platforms)
- `DATABASE_URL` - Database connection string (defaults to SQLite)

---

## Docker Deployment (Advanced)

If you need Tesseract OCR, use Docker:

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

# Install Tesseract OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -c "from app import init_db; init_db()"

EXPOSE 5000

CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:5000"]
```

Then deploy to:
- Render (supports Docker)
- Railway (supports Docker)
- Fly.io (supports Docker)
- AWS ECS, Google Cloud Run, etc.

---

## Custom Domain

All platforms support custom domains:

1. **Render:** Settings → Custom Domain
2. **Railway:** Settings → Domains
3. **Fly.io:** `fly domains add yourdomain.com`

---

## Monitoring & Logs

- **Render:** Dashboard → Logs tab
- **Railway:** Deployments → View logs
- **Fly.io:** `fly logs`

---

## Troubleshooting

**App won't start:**
- Check logs for errors
- Verify `ANTHROPIC_API_KEY` is set
- Ensure all dependencies are in `requirements.txt`

**OCR not working:**
- Tesseract not installed (expected on most platforms)
- App will still work, just without OCR

**Database errors:**
- SQLite file permissions
- Consider switching to PostgreSQL for production

**Build fails:**
- Check Python version (3.8+)
- Verify all dependencies are compatible

---

## Cost Comparison

| Platform | Free Tier | Paid Starts At |
|----------|-----------|----------------|
| Render   | 750 hrs/month | $7/month |
| Railway  | $5 credit/month | Pay-as-you-go |
| Fly.io   | 3 shared VMs | ~$5/month |
| Heroku   | None (discontinued) | $7/month |

**Recommendation:** Start with Render.com for the easiest deployment experience.

