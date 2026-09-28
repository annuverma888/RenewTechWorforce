# RenewTech Workforce — Production Deployment Guide

A step-by-step, beginner-friendly guide to deploying the **RenewTech Workforce** platform to production:
- **Backend API:** [Render](https://render.com) (Node.js + Express)
- **Frontend SPA:** [Vercel](https://vercel.com) (React 18 + Vite)
- **Authentication:** [Firebase Authentication](https://console.firebase.google.com) (Google OAuth & Email/Password)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) (Managed Cloud Database)

---

## 1. GitHub Setup

1. Initialize Git in the project root if not already done:
   ```bash
   git init
   git add .
   git commit -m "feat: prepare RenewTech Workforce for production deployment"
   ```

2. Create a new repository on [GitHub](https://github.com/new) (e.g. `renewtech-workforce`).
   - Keep it **Private** or **Public**.

3. Link your local repo and push:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/renewtech-workforce.git
   git branch -M main
   git push -u origin main
   ```

> **Note:** `.gitignore` files are already configured to protect your `.env` files, `node_modules`, and build artifacts from being committed.

---

## 2. Database Setup (MongoDB Atlas)

If you are currently running MongoDB locally (`mongodb://127.0.0.1:27017/renewtech`), you need a free cloud MongoDB instance for production:

1. Sign up / log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Shared Cluster**.
3. Under **Database Access**, create a database user (e.g., `renewtech_user`) and a secure password.
4. Under **Network Access**, click **Add IP Address** → choose **Allow Access From Anywhere** (`0.0.0.0/0`) so Render servers can connect.
5. In your Cluster, click **Connect** → **Drivers** (Node.js) → copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/renewtech?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your database user password and save this URI for your Render environment variables.

---

## 3. Backend Deployment on Render

### Method A: Connect Web Service Manually

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select your GitHub repository: `renewtech-workforce`.
4. Configure the service settings:
   - **Name:** `renewtech-backend` (or your choice)
   - **Region:** Choose the region closest to your users (e.g., Singapore, Frankfurt, Oregon)
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
5. Configure **Environment Variables** (under *Environment Variables* section):

   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `5000` | Port used by Express (Render assigns this) |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_super_strong_random_jwt_secret` | 32+ character random string for token security |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (set after deploying frontend or update afterwards) |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Secondary alias for frontend origin |

6. Under **Advanced Settings**, set **Health Check Path** to:
   ```
   /api/health
   ```
7. Click **Deploy Web Service**.
8. Once deployment finishes, Render will provide your public backend URL, for example:
   ```
   https://renewtech-backend.onrender.com
   ```
9. Verify the backend health in your browser:
   - Open `https://renewtech-backend.onrender.com/` → should return `{ "success": true, "status": "healthy" }`
   - Open `https://renewtech-backend.onrender.com/api/health` → should return `{ "success": true, "status": "healthy" }`

*(Optional)* If you prefer using Render Blueprints, the repository includes a ready-to-use [render.yaml](file:///c:/Users/annu3/OneDrive/Desktop/RenewTechWorforce/render.yaml) file.

---

## 4. Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `renewtech-workforce`.
4. In the project configuration screen:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client` *(Crucial: do not leave as root)*
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
   - **Install Command:** `npm install` (default)
5. Expand **Environment Variables** and add:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://renewtech-backend.onrender.com` | Your Render backend URL from Step 3 (no trailing slash) |
   | `VITE_FIREBASE_API_KEY` | `AIzaSy...` | From your Firebase Console |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `enernexa.firebaseapp.com` | From your Firebase Console |
   | `VITE_FIREBASE_PROJECT_ID` | `enernexa` | From your Firebase Console |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `enernexa.firebasestorage.app` | From your Firebase Console |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `392493323636` | From your Firebase Console |
   | `VITE_FIREBASE_APP_ID` | `1:392493323636:web:...` | From your Firebase Console |
   | `VITE_FIREBASE_MEASUREMENT_ID` | `G-TQ8KNQKSWF` | Optional analytics ID |

6. Click **Deploy**.
7. Once deployment completes, Vercel gives you your production URL, for example:
   ```
   https://renewtech-workforce.vercel.app
   ```

---

## 5. Firebase Authorized Domains (Critical for Google Login)

Google Sign-In will reject authentication from unauthorized domains with an `auth/unauthorized-domain` error. You must authorize your Vercel domain:

1. Open [Firebase Console](https://console.firebase.google.com).
2. Select your project: **enernexa** (or your active Firebase project).
3. In the left navigation, go to **Build** → **Authentication**.
4. Click the **Settings** tab at the top.
5. In the left sub-menu, click **Authorized domains**.
6. Click **Add domain**.
7. Enter your Vercel domain (without `https://`):
   - Example: `renewtech-workforce.vercel.app`
   - (If you use a custom domain, e.g. `renewtech.com`, add that as well).
8. Click **Done**.

---

## 6. Update Backend CORS with Vercel Domain

Now that you have your Vercel domain (e.g. `https://renewtech-workforce.vercel.app`):

1. Go back to your [Render Dashboard](https://dashboard.render.com).
2. Open your `renewtech-backend` service → **Environment**.
3. Update `CLIENT_URL` and `FRONTEND_URL` to your actual Vercel URL:
   ```
   CLIENT_URL=https://renewtech-workforce.vercel.app
   FRONTEND_URL=https://renewtech-workforce.vercel.app
   ```
4. Render will automatically redeploy with the updated environment.

> **Note:** The backend CORS configuration also automatically permits requests from `*.vercel.app` preview deployments and development `localhost` ports.

---

## 7. How to Test Production

Once deployed, run through this quick checklist:

### A. Health Check
- Open `https://YOUR-BACKEND.onrender.com/` → returns `{ success: true, status: "healthy" }`.
- Open `https://YOUR-BACKEND.onrender.com/api/health` → returns 200 OK.

### B. Authentication
- Open `https://YOUR-FRONTEND.vercel.app/`
- Click **Sign In**
- Test **Google Sign-In**: should prompt Google account selection, detect or assign role, and redirect to the dashboard.
- Test **Log Out**: clears session and redirects cleanly.

### C. Client-Side Routing (SPA)
- Navigate to `/technician/dashboard` or `/projects`
- Press browser refresh (F5).
- The page must reload directly without returning a 404 error (handled by `client/vercel.json`).

### D. Skill Passport & Dynamic QR Code
- Log in as a technician and navigate to **Skill Passport** (`/technician/skill-passport`).
- Verify the QR Code:
  - Check the URL encoded in the QR code: it should point to `https://YOUR-FRONTEND.vercel.app/verify/skill-passport/<id>`, NOT `localhost`.
  - Click **Copy Verification Link** and paste it into an incognito window: the public verification page should open with verified credentials and badges without requiring login.

### E. Live Camera QR Scanner
- On the Skill Passport card, click **Scan QR Code**.
- When prompted, grant browser camera permissions.
- The live camera viewfinder will stream frames and detect RenewTech Skill Passport QR codes, instantly navigating to the verification page.

---

## 8. Troubleshooting Common Production Errors

| Error | Root Cause | Solution |
| :--- | :--- | :--- |
| `auth/unauthorized-domain` | Vercel domain not whitelisted in Firebase | Add domain to Firebase Console → Authentication → Settings → Authorized domains. |
| `CORS error` in browser console | Backend does not recognize frontend origin | Ensure `CLIENT_URL` on Render matches your exact Vercel frontend URL (including `https://`). |
| `404 Not Found` on page refresh | Vercel trying to find static HTML file for client route | Ensure `client/vercel.json` contains the rewrite rule pointing `/(.*)` to `/index.html`. |
| `Render free tier takes 30s on first load` | Render free instances spin down after 15 min of inactivity | Normal on Render free tier. Use an external uptime monitor (e.g. UptimeRobot) pinging `/api/health` every 10 min to keep it warm. |
| `Camera permission denied` in QR Scanner | Browser camera permission blocked | Click the camera icon in browser address bar and select "Always allow". On iOS Safari, use HTTPS. |
| `Database connection error` on Render | MongoDB Atlas IP whitelist blocking Render | In MongoDB Atlas → Network Access, ensure `0.0.0.0/0` (Allow from anywhere) is active. |

---

## 9. Summary of Production Settings

```
Frontend (Vercel):
  - Root Directory: client
  - Build Command: npm run build
  - Output Directory: dist
  - Rewrites: vercel.json (SPA catch-all)

Backend (Render):
  - Root Directory: server
  - Build Command: npm install
  - Start Command: node server.js
  - Health Check: /api/health
```
