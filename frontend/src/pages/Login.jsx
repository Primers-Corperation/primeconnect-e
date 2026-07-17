import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button } from '../components/Button/Button.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Card } from '../components/Card/Card.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
          <Button type="submit" full disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p style={{ marginTop: 14, fontSize: 13, textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ color: 'var(--pc-text-muted)' }}>Forgot password?</Link>
        </p>
        <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--pc-text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--pc-text)' }}>Create one</Link>
        </p>
      </Card>
    </div>
  );
}

export default Login;
