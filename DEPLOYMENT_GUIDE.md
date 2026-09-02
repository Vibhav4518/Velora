# Velora E-Commerce Production Deployment Guide

This guide provides step-by-step instructions for pushing your repository to GitHub and deploying both the **Django REST Backend** and **React Vite Frontend** on **Render** and **Vercel**.

---

## 1. Pushing to GitHub

### Step 1.1: Create a New GitHub Repository
1. Go to [GitHub](https://github.com/new).
2. Set Repository Name to `velora` (or your preferred name).
3. Set visibility to **Public** or **Private**.
4. **Do NOT** initialize with a README, `.gitignore`, or license (we already created them locally).
5. Click **Create repository**.

### Step 1.2: Add Remote Origin and Push Branches
Run the following commands in your local terminal:

```bash
# Add your GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/velora.git

# Push main branch
git push -u origin main

# Push production branch
git push -u origin production
```

---

## 2. Option A: Full Stack Deployment on Render (Recommended)

Render can host both your Django Backend, PostgreSQL Database, and React Frontend seamlessly using the provided `render.yaml` Blueprint or manually via the dashboard.

### Method 1: Using Render Blueprint (Fastest)
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository `velora`.
4. Render will automatically detect `render.yaml` and prompt you to create:
   - **velora-postgres** (PostgreSQL Database)
   - **velora-backend** (Python Web Service)
   - **velora-frontend** (Static Site)
5. Click **Apply**. Render will provision all resources automatically!

---

### Method 2: Manual Setup on Render

#### Step A: Create PostgreSQL Database
1. Go to Render Dashboard -> **New +** -> **PostgreSQL**.
2. **Name**: `velora-postgres`
3. **Database**: `velora_db`
4. **User**: `velora_user`
5. Select **Free** tier.
6. Click **Create Database**. Copy the **Internal Database URL** once created.

#### Step B: Deploy Django Backend Web Service
1. Go to Render Dashboard -> **New +** -> **Web Service**.
2. Connect your GitHub repository and select the `production` branch.
3. Configure settings:
   - **Name**: `velora-backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`
4. Add **Environment Variables**:
   - `PYTHON_VERSION`: `3.11.0`
   - `DJANGO_SETTINGS_MODULE`: `config.settings.production`
   - `DEBUG`: `False`
   - `SECRET_KEY`: *(Click Generate or paste a strong random string)*
   - `DATABASE_URL`: *(Paste your PostgreSQL Connection String)*
   - `ALLOWED_HOSTS`: `velora-backend.onrender.com,.onrender.com`
   - `CSRF_TRUSTED_ORIGINS`: `https://velora-backend.onrender.com,https://velora-frontend.onrender.com`
5. Click **Create Web Service**.

#### Step C: Deploy React Frontend Static Site
1. Go to Render Dashboard -> **New +** -> **Static Site**.
2. Connect your GitHub repository and select the `production` branch.
3. Configure settings:
   - **Name**: `velora-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Rewrite Rule under **Redirects/Rewrites**:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://velora-backend.onrender.com`
6. Click **Create Static Site**.

---

## 3. Option B: Hybrid Deployment (Backend on Render + Frontend on Vercel)

Vercel offers ultra-fast global CDN hosting for React static single-page apps.

### Step 3.1: Deploy Backend on Render
Follow **Method 2 Step A & B** above to deploy the Django backend service on Render. Note down your backend service URL (e.g. `https://velora-backend.onrender.com`).

### Step 3.2: Deploy Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `velora`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and choose `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables**:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://velora-backend.onrender.com` (Your Render backend URL)
6. Click **Deploy**.
7. Once deployed, copy your Vercel URL (e.g., `https://velora-frontend.vercel.app`).
8. Return to Render -> `velora-backend` -> **Environment Variables** and ensure:
   - `CSRF_TRUSTED_ORIGINS`: `https://velora-frontend.vercel.app`
   - `ALLOWED_HOSTS`: `.onrender.com,.vercel.app`

---

## 4. Post-Deployment Verification & Admin Creation

Once your backend is live:

1. **Create Django Admin Superuser**:
   On Render: Go to `velora-backend` -> **Shell** tab and run:
   ```bash
   python manage.py createsuperuser
   ```
2. **Access Admin Panel**:
   Open `https://<YOUR_BACKEND_URL>/admin/` in your browser.
3. **Verify DRF API Specs**:
   Open `https://<YOUR_BACKEND_URL>/api/schema/swagger-ui/` to test live endpoints.
