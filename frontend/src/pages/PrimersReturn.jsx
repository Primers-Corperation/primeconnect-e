import React, { useEffect, useRef, useState } from 'react';
import { markPrimersLinked } from '../lib/primersFollow.js';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { Card } from '../components/Card/Card.jsx';
import { finishPrimersSignIn } from '../lib/primersId.js';
import client from '../api/client.js';

// Where Primers ID sends people back with a one-time code (to sign in, or to connect from Settings).
export function PrimersReturn() {
  const { signInWithToken, updateUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [back, setBack] = useState('/login');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // a code works once
    ran.current = true;
    (async () => {
      let mode = 'signin';
      try {
        const r = finishPrimersSignIn();
        mode = r.mode;
        if (mode === 'link') {
          const { data } = await client.post('/api/auth/primers/link', { code: r.code, verifier: r.verifier });
          updateUser(data.user);
        } else {
          const { data } = await client.post('/api/auth/primers', { code: r.code, verifier: r.verifier });
          signInWithToken(data.token, data.user);
        }
        markPrimersLinked(true);
        navigate(r.returnTo, { replace: true });
      } catch (err) {
        setBack(mode === 'link' ? '/settings' : '/login');
        setError(err.response?.data?.message || err.message || "Couldn't sign you in");
      }
    })();
  }, [navigate, signInWithToken, updateUser]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--pc-bg-alt)', padding: 20 }}>
      <Card padding={32} style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        {error ? (
          <>
            <p style={{ fontWeight: 700, margin: 0 }}>That didn&apos;t finish</p>
            <p style={{ fontSize: 14, color: 'var(--pc-text-muted)' }}>{error}</p>
            <Link to={back} style={{ color: 'var(--pc-text)', fontWeight: 600 }}>Go back</Link>
          </>
        ) : (
          <p style={{ fontSize: 14, color: 'var(--pc-text-muted)', margin: 0 }}>Connecting with Primers ID…</p>
        )}
      </Card>
    </div>
  );
}

export default PrimersReturn;
