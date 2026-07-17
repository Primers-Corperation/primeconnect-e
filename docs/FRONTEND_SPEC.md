# PrimeConnect — Product & Frontend Spec

A single reference for the PrimeConnect frontend and the backend endpoints it
relies on. The repo already contains a `frontend/` app; use this to (a) add the
password-reset and history/owned-data flows, and (b) audit the existing
frontend against these routes — do not blindly regenerate over existing work.

## Product

Nigerian platform (amounts in ₦):

- **Wallet** — fund a balance (Paystack) and spend it.
- **SMS / virtual numbers** — rent a number to receive OTPs; send plain SMS.
- **Accounts marketplace** — browse and buy pre-provisioned accounts.

Email/password auth with a 7-day JWT. Look & feel: modern fintech — dark-first
with a light toggle, gradient accent, rounded-2xl cards, mobile-first,
accessible.

## Stack

React 18 + Vite, Tailwind (+ shadcn/ui), React Router v6, TanStack Query,
axios (one instance + interceptors), react-hook-form + zod, sonner toasts,
lucide-react. API base from `VITE_API_BASE_URL` (default `http://localhost:3000`).

## API — existing

Errors are usually `{ status:"error", message, errors?:[{field,message}] }`.

### Auth (public)
- `POST /api/auth/register` `{name,email,password(min6)}` → `201 {status:"success",token,user}`; `400` validation; `409` "Email already registered".
- `POST /api/auth/login` `{email,password}` → `200 {status:"success",token,user}`; `401` "Invalid email or password". (Rate-limited 5/15min → handle 429.)

The `user` object never includes the password hash.

### Auth (protected — `Authorization: Bearer <token>`)
- `GET /api/auth/me` → `{status:"success",user}`.
- `PUT /api/auth/me` `{name?,email?,currentPassword?,newPassword?}` → `{status:"success",user}`; `400` if changing password without/with wrong current password; `409` if email already in use.

### Password reset (public)
- `POST /api/auth/forgot-password` `{email}` → **always** `200 {status:"success",message}` (never reveals whether the email exists). Emails a link to `${FRONTEND_URL}/reset-password?token=…`; token is single-use and expires in 1 hour.
- `POST /api/auth/reset-password` `{token, password(min6)}` → `200 {status:"success",message}`; `400` "Invalid or expired reset token".

### Wallet (protected)
- `GET /api/wallet/balance/:userId` (must equal own `_id`) → `200 {status:"success",balance}`; `403` mismatch; `404` no wallet (treat as ₦0).
- `POST /api/wallet/topup` — Paystack-backed top-up (may return a checkout reference to redirect to).

### Accounts (protected)
- `GET /api/accounts/available` → `{status:"success",accounts:[{_id,service,accountDetails,price,status,createdAt}]}`.
- `POST /api/accounts/purchase` `{accountId}` → `200 {status:"success",account}`; `400` "Insufficient balance"; `404/409` unavailable.

### SMS (protected, rate-limited 10/hr)
- `GET /api/sms/catalog?country=&search=&minPrice=&maxPrice=` → priced service catalog.
- `GET /api/sms/activations` → the user's rented numbers.
- `POST /api/sms/getNumber` `{service,country,maxPrice?,providers?[],exclude?[]}` → `{status:"success",activationId,number}`.
- `POST /api/sms/send` `{phone:/^234\d{10}$/ (e.g. 2348012345678), message:1–160}` → `{success:true,messageId}`.

## API — endpoints to add (so history / owned views show real data)

- `GET /api/wallet/transactions` → `{status:"success",transactions:[{type,amount,description,date}]}` (paginate `?limit&?cursor`). Backend returns `wallet.transactions`, newest first.
- `GET /api/accounts/mine` → `{status:"success",accounts:[...owned...]}` via `Account.find({ userId: req.userId })`.

## Pages / routes

- `/` Landing.
- `/register`, `/login` (login has a "Forgot password?" link).
- `/forgot-password` — email field → forgot-password. **Always** show the same
  "If that email is registered, we've sent a link" confirmation (no branching
  on existence). "Back to login" link.
- `/reset-password` — reads `?token=…`; new-password + confirm (match, min 6,
  zod) → reset-password. Success → toast + redirect `/login`. `400` →
  "link invalid or expired" + link back to `/forgot-password`. Missing token →
  same invalid state.
- `/app` Dashboard — gradient balance card + quick actions; recent activity
  from `/api/wallet/transactions`.
- `/app/wallet` — balance + fund modal (presets ₦500/1k/2k/5k + custom) via
  Paystack; transaction history from `/api/wallet/transactions`.
- `/app/numbers` — rent-number form → result card (number + activationId, copy,
  "waiting for OTP" state); list from `/api/sms/activations`.
- `/app/sms` — send-SMS form (234… helper, live 160-char counter) → toast.
- `/app/marketplace` — grid of available accounts; Buy → confirm → purchase;
  `400` insufficient → prompt to fund. Optional "My accounts" tab from
  `/api/accounts/mine`.
- `/app/settings` — profile (name/email + change password) via `/api/auth/me`.
- `404` page.

## Cross-cutting

- Store JWT + user in localStorage; axios interceptor attaches the Bearer
  token; on `401` clear auth + redirect to `/login`; surface server `message`
  in toasts.
- Mirror backend validation with zod: password ≥ 6, phone `^234\d{10}$`,
  message ≤ 160, top-up amount > 0.
- Protected routes redirect unauthenticated users to `/login`.
- Skeleton loaders, empty states, and ₦ formatting via
  `Intl.NumberFormat('en-NG', { style:'currency', currency:'NGN' })`.
- Reusable: `BalanceCard`, `MoneyInput`, `Field` (error display), `AuthLayout`,
  `AppLayout`, `ProtectedRoute`.

## Env

- Backend: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `RESEND_API_KEY` +
  `EMAIL_FROM` (password-reset & support email via `lib/mailer.js`, using the
  Resend HTTPS API so it works on Vercel), plus the SMS/Paystack keys.
- Frontend: `VITE_API_BASE_URL`.
