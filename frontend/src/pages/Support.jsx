import React, { useState } from 'react';
import { AppShell } from '../components/AppShell.jsx';
import { Card } from '../components/Card/Card.jsx';
import { TextField } from '../components/TextField/TextField.jsx';
import { Button } from '../components/Button/Button.jsx';
import { reportIssue } from '../api/support.js';

export function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!subject.trim() || !message.trim()) {
      setError('Please fill in both a subject and a message.');
      return;
    }
    setLoading(true);
    try {
      const confirmation = await reportIssue({ subject: subject.trim(), message: message.trim() });
      setSuccess(confirmation || 'Your report has been sent.');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send your report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <header className="pc-page-header" style={{}}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0 }}>Help & support</h1>
          <p style={{ margin: "4px 0 0" }}>Report an issue and we'll get back to you by email.</p>
        </div>
      </header>

      <div className="pc-page-body pc-page-enter" style={{ maxWidth: 520 }}>
        <Card padding={24}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Didn't receive my SMS code" />
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--pc-text-muted)', marginBottom: 7 }}>Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe what happened, including any relevant number or transaction…"
                rows={6}
                style={{
                  width: '100%', resize: 'vertical', background: 'var(--pc-surface-2)',
                  border: '1px solid var(--pc-border-strong)', borderRadius: 'var(--pc-radius-md)',
                  padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', color: 'var(--pc-text)',
                }}
              />
            </label>
            {error ? <div style={{ fontSize: 13, color: 'var(--pc-danger)' }}>{error}</div> : null}
            {success ? <div style={{ fontSize: 13, color: 'var(--pc-success)' }}>{success}</div> : null}
            <Button type="submit" full disabled={loading}>{loading ? 'Sending…' : 'Send report'}</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

export default Support;
