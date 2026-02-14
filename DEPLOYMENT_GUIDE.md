# PrimeConnect Deployment Guide

This guide ensures a successful deployment of the complete PrimeConnect system (Frontend + Backend).

## 1. Backend Deployment (Node.js/Express)

The backend is configured for deployment on platforms like Render or Railway.

### Steps:
1.  **Push to GitHub**: Ensure your `primeconnect-backend` repository is up to date on GitHub.
2.  **Create Web Service**:
    -   Connect your repository to your hosting provider (e.g., Render).
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.js`
3.  **Environment Variables**:
    Add the following environment variables in your deployment dashboard:
    -   `MONGO_URI`: Your MongoDB connection string.
    -   `JWT_SECRET`: A strong secret key for authentication.
    -   `GRIZZLY_API_KEY`: API key for Grizzly SMS service.
    -   `TERMII_API_KEY` (if used): API key for Termii.
    -   `PORT`: (Optional, usually handled automatically by the platform, e.g., 10000).

### Verification:
-   Once deployed, visit `https://your-backend-url.onrender.com`.
-   You should see a JSON response: `{"message":"PrimeConnect API Gateway Online","status":"active"}`.

## 2. Frontend Deployment (React/Vite)

The dashboard is optimized for Vercel or Netlify.

### Steps:
1.  **Push to GitHub**: Ensure your `primeconnect-dashboard` repository is up to date.
    -   *Note*: We've fixed linting issues to ensure a smooth build.
2.  **Create New Project**:
    -   Import the repository on Vercel/Netlify/Render.
    -   **Framework Preset**: Vite
    -   **Build Command**: `npm run build` (or `vite build`)
    -   **Output Directory**: `dist`
3.  **Environment Variables (CRITICAL)**:
    -   Add `VITE_API_BASE_URL` and set it to your **deployed backend URL** (without trailing slash).
        -   Example: `https://primeconnect-backend.onrender.com`
    -   *Note*: Without this, the dashboard will try to connect to localhost or fail.

## 3. Post-Deployment Verification

1.  Open your deployed Frontend URL.
2.  Check the **Navbar status indicator**:
    -   **Green (Network Stable)**: Connected to backend successfully.
    -   **Red (Gateway Offline)**: Connection failed. Check Console (F12) and your `VITE_API_BASE_URL`.
3.  **Test Features**:
    -   **Login**: Ensure you can log in.
    -   **Wallet**: Check if balance loads.
    -   **SMS Hub**: Try sending a test message.
