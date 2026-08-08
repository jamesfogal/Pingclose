'use client';
import { useState } from 'react';
import { colors, fontSize } from '@/lib/designTokens';

export default function SetupPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [resendKey, setResendKey] = useState('');
  const [currentKeyMasked, setCurrentKeyMasked] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/audits', {
      headers: { 'x-admin-password': password },
    });
    if (res.ok) {
      setAuthed(true);
      // Load current key
      const r = await fetch('/api/setup', {
        headers: { 'x-admin-password': password },
      });
      const d = await r.json();
      // GET now returns a masked value (PC-SEC8) — display-only, never
      // pre-filled into the editable input, so an unmodified "Save" can't
      // overwrite the real key with the masked placeholder text.
      if (d.resend_api_key) setCurrentKeyMasked(d.resend_api_key);
    } else {
      setError('Wrong password');
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ resend_api_key: resendKey }),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) {
      setSaved(true);
      // Re-fetch so the masked display reflects the key that was just saved
      const r = await fetch('/api/setup', { headers: { 'x-admin-password': password } });
      const fresh = await r.json();
      if (fresh.resend_api_key) setCurrentKeyMasked(fresh.resend_api_key);
      setResendKey('');
    } else {
      setError(d.error || 'Save failed');
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult('');
    const res = await fetch('/api/setup/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
    });
    const d = await res.json();
    setTesting(false);
    setTestResult(d.ok ? '✅ Test email sent — check jim@pingclose.com' : `❌ Failed: ${d.error}`);
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: colors.void,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    color: colors.textPrimary,
    fontSize: `${fontSize.label}px`,
    boxSizing: 'border-box' as const,
  };

  const btnStyle = {
    padding: '12px 32px',
    background: colors.signal,
    color: colors.void,
    fontWeight: 700,
    fontSize: `${fontSize.label}px`,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', background: colors.void, color: colors.textPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: colors.signal }}>PingClose</div>
            <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginTop: '8px' }}>Platform Setup</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: fontSize.label, color: colors.textSecondary, display: 'block', marginBottom: '8px' }}>ADMIN PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={inputStyle}
                autoFocus
              />
            </div>
            {error && <div style={{ color: colors.statusFail, fontSize: fontSize.label, marginBottom: '12px' }}>{error}</div>}
            <button type="submit" style={{ ...btnStyle, width: '100%' }}>Enter Setup</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: colors.void, color: colors.textPrimary, padding: '40px 24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: colors.signal }}>PingClose</div>
          <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginTop: '8px' }}>Platform Setup</div>
        </div>

        {/* Resend API Key */}
        <div style={{ background: colors.surfaceInset, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>Resend API Key</div>
          <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginBottom: '20px' }}>
            Get your key from <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" style={{ color: colors.signal }}>resend.com/api-keys</a> — starts with <code style={{ background: colors.border, padding: '2px 6px', borderRadius: '4px' }}>re_</code>
          </div>
          {currentKeyMasked && (
            <div style={{ fontSize: fontSize.label, color: colors.textSecondary, marginBottom: '16px' }}>
              Current key: <code style={{ background: colors.border, padding: '2px 6px', borderRadius: '4px', color: colors.textSecondary }}>{currentKeyMasked}</code>
            </div>
          )}
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={resendKey}
                onChange={e => setResendKey(e.target.value)}
                placeholder={currentKeyMasked ? 'Enter a new key to replace it' : 're_xxxxxxxxxxxxxxxx'}
                style={inputStyle}
              />
            </div>
            {error && <div style={{ color: colors.statusFail, fontSize: fontSize.label, marginBottom: '12px' }}>{error}</div>}
            {saved && <div style={{ color: colors.signal, fontSize: fontSize.label, marginBottom: '12px' }}>✅ Saved successfully</div>}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" style={btnStyle} disabled={saving}>
                {saving ? 'Saving...' : 'Save Key'}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                style={{ ...btnStyle, background: colors.border, color: colors.textSecondary }}
              >
                {testing ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            {testResult && (
              <div style={{ marginTop: '16px', fontSize: fontSize.label, color: testResult.startsWith('✅') ? colors.signal : colors.statusFail }}>
                {testResult}
              </div>
            )}
          </form>
        </div>

        {/* Status */}
        <div style={{ background: colors.surfaceInset, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: fontSize.label, fontWeight: 700, color: colors.textSecondary, letterSpacing: '0.08em', marginBottom: '16px', textTransform: 'uppercase' }}>Current Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: fontSize.label, color: colors.textSecondary }}>
            <span style={{ color: currentKeyMasked.startsWith('re_') ? colors.signal : colors.statusFail }}>
              {currentKeyMasked.startsWith('re_') ? '✅' : '❌'}
            </span>
            Resend API Key {currentKeyMasked.startsWith('re_') ? 'configured' : 'not set'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href="/admin" style={{ color: colors.textSecondary, fontSize: fontSize.label }}>← Back to Admin</a>
        </div>
      </div>
    </main>
  );
}
