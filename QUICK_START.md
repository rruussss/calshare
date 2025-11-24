# Quick Start - Deploy to Render.com

## Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CalShare app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/calshare.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Render

1. **Sign up/Login:** Go to [render.com](https://render.com) and sign up (free)

2. **Create Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your `calshare` repository

3. **Configure:**
   - **Name:** `calshare` (or your choice)
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan:** Free (or paid if you prefer)

4. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** Your Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com))

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for build
   - Your app will be live! 🎉

## Step 3: Access Your App

Your app will be available at:
`https://calshare.onrender.com` (or your custom name)

**Note:** Free tier apps spin down after 15 min inactivity. First request may take ~30 seconds.

## Optional: Custom Domain

1. Go to Settings → Custom Domain
2. Add your domain
3. Follow DNS instructions

---

## Alternative: Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add `ANTHROPIC_API_KEY` environment variable
5. Deploy!

Railway auto-detects the `Procfile` and deploys automatically.

---

## Troubleshooting

**Build fails?**
- Check that all files are committed to GitHub
- Verify `requirements.txt` is in the root
- Check build logs in Render dashboard

**App won't start?**
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check logs for error messages
- Ensure database can be created (SQLite should work)

**OCR not working?**
- This is expected - Tesseract isn't installed on Render
- App still works for ICS files, text files, and manual entry
- Use Dockerfile if you need OCR (see DEPLOYMENT.md)

---

## Next Steps

- Set up a custom domain
- Monitor usage in Render dashboard
- Consider upgrading if you need more resources
- See `DEPLOYMENT.md` for advanced options

