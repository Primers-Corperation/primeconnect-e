import React, { useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Button } from '../components/Button/Button.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { updateProfile } from '../api/auth.js';

export function Settings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    const payload = {};
    if (name !== user?.name) payload.name = name;
    if (email !== user?.email) payload.email = email;
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }
    if (Object.keys(payload).length === 0) {
      setNotice('Nothing to update.');
      return;
    }

    setLoading(true);
    try {
      const updated = await updateProfile(payload);
      updateUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      setNotice('Your details were updated.');
    } catch (err) {
      const errors = err.response?.data?.errors;
      setError(
        errors?.length
          ? errors.map((x) => x.message).join(', ')
          : err.response?.data?.message || 'Could not update your details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header style={{ padding: '20px 32px', borderBottom: '1px solid var(--pc-border)' }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: '-.02em' }}>Settings</h1>
        <p style={{ margin: '3px 0 0', fontSize: 13.5, color: 'var(--pc-text-muted)' }}>Update your account details.</p>
      </header>

      <div style={{ flex: 1, padding: '28px 32px' }}>
        <Card padding={24} style={{ maxWidth: 480 }}>
          <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />

            <div style={{ borderTop: '1px solid var(--pc-border)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--pc-text)', marginBottom: 12 }}>Change password</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <TextField label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Leave blank to keep current" />
                <TextField label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
            </div>

            {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
            {notice ? <div style={{ fontSize: 13, color: 'var(--pc-success)' }}>{notice}</div> : null}
            <Button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default Settings;
