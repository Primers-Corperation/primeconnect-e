import React, { useState } from 'react';
import { markPrimersLinked } from '../lib/primersFollow.js';
import { readPendingLink, clearPendingLink } from '../lib/primersId.js';
import client from '../api/client.js';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button } from '../components/Button/Button.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Card } from '../components/Card/Card.jsx';
import { PrimersIdButton, OrDivider } from '../components/PrimersIdButton.jsx';

export function Login() {
  const { login, updateUser } = useAuth();
  const [pending] = useState(readPendingLink);
  const navigate = useNavigate();
  const [email, setEmail] = useState(pending?.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      if (pending) {
        try {
          const { data } = await client.post('/api/auth/primers/link-ticket', { ticket: pending.ticket });
          updateUser(data.user);
          markPrimersLinked(true);
        } catch {
          // Signed in either way; they can still connect from Settings.
        }
        clearPendingLink();
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pc-bg-alt)', padding: 20 }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--pc-font-display)' }}>Welcome back</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' }}>Sign in to your PrimeConnect account.</p>
        {pending ? (
          <div role="status" style={{ margin: '0 0 20px', padding: '14px 16px', borderRadius: 12, background: 'var(--pc-bg-alt)', fontSize: 14, lineHeight: 1.5 }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>One step to connect your Primers ID</strong>
            You already have a PrimeConnect account with {pending.email}. Enter its password once and we&apos;ll connect your Primers ID, so next time Continue with Primers ID signs you straight in.
          </div>
        ) : (
          <>
            <PrimersIdButton label="Continue with Primers ID" />
            <OrDivider text="or with your PrimeConnect password" />
          </>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
          <Button type="submit" full disabled={loading}>{loading ? 'Signing in…' : pending ? 'Sign in and connect' : 'Sign in'}</Button>
        </form>
        <p style={{ marginTop: 14, fontSize: 13, textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ color: 'var(--pc-text-muted)' }}>Forgot password?</Link>
        </p>
        <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--pc-text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--pc-text)' }}>Create one</Link>
        </p>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--pc-text-muted)' }}>
          <Link to="/privacy" style={{ color: 'var(--pc-text-muted)' }}>Privacy Policy</Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
