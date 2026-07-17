import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth.js';
import { Button } from '../components/Button/Button.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Card } from '../components/Card/Card.jsx';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pc-bg-alt)', padding: 20 }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 400 }}>
        {submitted ? (
          <>
            <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--pc-font-display)' }}>Check your email</h1>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' }}>
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password. The link expires in 1 hour.
            </p>
            <Link to="/login" style={{ color: 'var(--pc-text)', fontSize: 13.5 }}>Back to sign in</Link>
          </>
        ) : (
          <>
            <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--pc-font-display)' }}>Forgot password</h1>
            <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
              <Button type="submit" full disabled={loading}>{loading ? 'Sending…' : 'Send reset link'}</Button>
            </form>
            <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--pc-text-muted)' }}>
              Remembered it? <Link to="/login" style={{ color: 'var(--pc-text)' }}>Sign in</Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

export default ForgotPassword;
