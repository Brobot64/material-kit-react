import { useState } from 'react';
import { Show, SignIn, useAuth, SignOutButton } from '@clerk/react';

// ----------------------------------------------------------------------
// Temporary local-test page: sign in with Clerk, then call the live Worker's
// /v1/auth/me to confirm the token is verified end-to-end. Route: /clerk-test
// ----------------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787/v1';

export default function ClerkTestPage() {
  const { getToken } = useAuth();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const callAuthMe = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const text = await res.text();
      setResult(`HTTP ${res.status}\n${text}`);
    } catch (err) {
      setResult(`Request error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Clerk → Worker auth test</h1>
      <p>
        API base: <code>{API_URL}</code>
      </p>

      <Show when="signed-out">
        <p>Sign in (or sign up) with Clerk to obtain a session token:</p>
        <SignIn routing="hash" />
      </Show>

      <Show when="signed-in">
        <p>Signed in. Click to call the live API with your Clerk token:</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={callAuthMe} disabled={loading} style={{ padding: '8px 16px' }}>
            {loading ? 'Calling…' : 'GET /v1/auth/me'}
          </button>
          <SignOutButton />
        </div>
        {result && (
          <pre
            style={{
              marginTop: 16,
              padding: 16,
              background: '#0b1021',
              color: '#67e480',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              borderRadius: 8,
            }}
          >
            {result}
          </pre>
        )}
        <p style={{ color: '#888', fontSize: 13, marginTop: 16 }}>
          Expected: <strong>HTTP 403</strong> “No access for this user or business” — the token is
          verified, but no profile exists in D1 yet (created by the Clerk webhook / onboarding).
        </p>
      </Show>
    </div>
  );
}
