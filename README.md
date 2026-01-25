# PrimeConnect Dashboard

Premium React-based dashboard for gestioning SMS communications and wallet metrics.

## 🚀 Quick Start

1. **Install dependencies**: `npm install`
2. **Setup environment**: Create a `.env` file and add:
   ```env
   VITE_API_BASE_URL=https://primeconnect-backend.onrender.com
   ```
3. **Run local development**: `npm run dev`

## 📦 Deployment Requirements (CRITICAL)

When deploying to **Vercel**, **Render**, or **Netlify**, you MUST set the following Environment Variable in their web dashboard:

| Variable | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://primeconnect-backend.onrender.com` |

*Failure to set this will result in the application trying to connect to localhost or failing to load data.*

## Features
- **Messaging Hub**: Direct Termii integration to send SMS.
- **Finances**: Real-time balance checking and usage visualization.
- **Control Center**: API health monitoring and system diagnostics.
- **Security**: In-memory JWT management (Session lost on refresh for maximum safety).
