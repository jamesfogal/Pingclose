'use client';
import { useState } from 'react';

export default function SetupPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [resendKey, setResendKey] = useState('');
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
      if (d.resend_api_key) setResendKey(d.resend_api_key);
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
    if (d.ok) setSaved(true);
    else setError(d.error || 'Save failed');
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
    background: '#0B0E16',
    border: '1px solid #1F2937',
    borderRadius: '8px',
    color: '#F1F5F9',
    fontSize: '16px',
    boxSizing: 'border-box' as const,
  };

  const btnStyle = {
    padding: '12px 32px',
    background: '#10D9A0',
    color: '#0B0E16',
    fontWeight: 700,
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  };

  if (!authed) {
    return (
      <main style={{ minHeight: '100vh', background: '#0B0E16', color: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#10D9A0' }}>PingClose</div>
            <div style={{ fontSize: '16px', color: '#64748B', marginTop: '8px' }}>Platform Setup</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', color: '#64748B', display: 'block', marginBottom: '8px' }}>ADMIN PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={inputStyle}
                autoFocus
              />
            </div>
            {error && <div style={{ color: '#F87171', fontSize: '14px', marginBottom: '12px' }}>{error}</div>}
            <button type="submit" style={{ ...btnStyle, width: '100%' }}>Enter Setup</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0B0E16', color: '#F1F5F9', padding: '40px 24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10D9A0' }}>PingClose</div>
          <div style={{ fontSize: '16px', color: '#64748B', marginTop: '8px' }}>Platform Setup</div>
        </div>

        {/* Resend API Key */}
        <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>Resend API Key</div>
          <div style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
            Get your key from <a href="https://resend.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#10D9A0' }}>resend.com/api-keys</a> — starts with <code style={{ background: '#1F2937', padding: '2px 6px', borderRadius: '4px' }}>re_</code>
          </div>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={resendKey}
                onChange={e => setResendKey(e.target.value)}
                placeholder="re_xxxxxxxxxxxxxxxx"
                style={inputStyle}
              />
            </div>
            {error && <div style={{ color: '#F87171', fontSize: '14px', marginBottom: '12px' }}>{error}</div>}
            {saved && <div style={{ color: '#10D9A0', fontSize: '14px', marginBottom: '12px' }}>✅ Saved successfully</div>}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="submit" style={btnStyle} disabled={saving}>
                {saving ? 'Saving...' : 'Save Key'}
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing}
                style={{ ...btnStyle, background: '#1E3050', color: '#94A3B8' }}
              >
                {testing ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
            {testResult && (
              <div style={{ marginTop: '16px', fontSize: '15px', color: testResult.startsWith('✅') ? '#10D9A0' : '#F87171' }}>
                {testResult}
              </div>
            )}
          </form>
        </div>

        {/* Status */}
        <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', marginBottom: '16px', textTransform: 'uppercase' }}>Current Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: '#94A3B8' }}>
            <span style={{ color: resendKey.startsWith('re_') ? '#10D9A0' : '#F87171' }}>
              {resendKey.startsWith('re_') ? '✅' : '❌'}
            </span>
            Resend API Key {resendKey.startsWith('re_') ? 'configured' : 'not set'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href="/admin" style={{ color: '#475569', fontSize: '14px' }}>← Back to Admin</a>
        </div>
      </div>
    </main>
  );
}
