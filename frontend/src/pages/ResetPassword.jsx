import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth.js';
import { Button } from '../components/Button/Button.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Card } from '../components/Card/Card.jsx';

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pc-bg-alt)', padding: 20 }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 400 }}>{children}</Card>
    </div>
  );
}

const titleStyle = { margin: '0 0 4px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--pc-font-display)' };
const subStyle = { margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' };

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Shell>
        <h1 style={titleStyle}>Invalid link</h1>
        <p style={subStyle}>This password reset link is missing its token or is invalid.</p>
        <Link to="/forgot-password" style={{ color: 'var(--pc-text)', fontSize: 13.5 }}>Request a new link</Link>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <h1 style={titleStyle}>Password reset</h1>
        <p style={subStyle}>Your password has been updated. Redirecting you to sign in…</p>
        <Link to="/login" style={{ color: 'var(--pc-text)', fontSize: 13.5 }}>Sign in now</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 style={titleStyle}>Set a new password</h1>
      <p style={subStyle}>Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <TextField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
        <TextField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" required />
        {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
        <Button type="submit" full disabled={loading}>{loading ? 'Saving…' : 'Reset password'}</Button>
      </form>
      <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--pc-text-muted)' }}>
        <Link to="/login" style={{ color: 'var(--pc-text)' }}>Back to sign in</Link>
      </p>
    </Shell>
  );
}

export default ResetPassword;
