import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Button } from '../components/Button/Button.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Card } from '../components/Card/Card.jsx';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = errors?.length
        ? errors.map((e) => e.message).join(', ')
        : err.response?.data?.message || 'Unable to create account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pc-bg-alt)', padding: 20 }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, fontFamily: 'var(--pc-font-display)' }}>Create your account</h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--pc-text-muted)' }}>Rent numbers, receive SMS codes, top up your wallet.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi" required />
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
          {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
          <Button type="submit" full disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p style={{ marginTop: 20, fontSize: 13.5, color: 'var(--pc-text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--pc-text)' }}>Sign in</Link>
        </p>
      </Card>
    </div>
  );
}

export default Register;
