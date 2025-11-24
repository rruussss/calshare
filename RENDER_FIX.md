# How to Fix Render Build - Step by Step

## The Issue
Render is using Python 3.13 which has compatibility issues. We need to force Python 3.11.

## Solution: Update Build Command

Render doesn't have a "Python Version" setting in the UI, but we can specify it in the build command.

### Steps:

1. **Go to your Render Dashboard**
   - Click on your `calshare` service

2. **Go to Settings Tab**
   - Scroll down to "Build & Deploy" section

3. **Update Build Command**
   Replace the current build command with:
   ```
   pip install --upgrade pip setuptools wheel && python3.11 -m pip install -r requirements.txt
   ```
   
   OR if that doesn't work, try:
   ```
   python3.11 -m venv venv && source venv/bin/activate && pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
   ```

4. **Alternative: Use Environment Variable**
   - Go to "Environment" tab
   - Add environment variable:
     - **Key:** `PYTHON_VERSION`
     - **Value:** `3.11.9`

5. **Save and Redeploy**
   - Click "Save Changes"
   - Go to "Manual Deploy" → "Deploy latest commit"

---

## Alternative: Delete and Recreate Service

If the above doesn't work:

1. **Delete the current service** (Settings → Delete Service)

2. **Create a new Web Service:**
   - Connect same GitHub repo
   - **Build Command:** `pip install --upgrade pip setuptools wheel && pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Environment:** Python 3

3. **Add Environment Variable:**
   - `ANTHROPIC_API_KEY` = your key

4. **The `runtime.txt` file should force Python 3.11**

---

## Check if runtime.txt is Working

After deploying, check the build logs. You should see:
- "Using Python 3.11.x" or similar
- NOT "Using Python 3.13"

If you still see Python 3.13, the build command override should work.

