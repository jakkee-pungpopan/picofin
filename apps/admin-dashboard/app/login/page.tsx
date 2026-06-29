'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('admin@novabank.local');
  const [password, setPassword] = useState('Admin@123');
  const [err, setErr] = useState('');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    try {
      const res = await api('/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      localStorage.setItem('admin_token', res.accessToken);
      location.href = '/dashboard';
    } catch (e: any) { setErr(e.message); }
  };
  return (
    <div className="login-wrap">
      <h2 style={{ color: '#1B2A6B' }}>NovaBank Admin</h2>
      <form onSubmit={submit}>
        <input style={{ width: '100%', marginBottom: 12 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input style={{ width: '100%', marginBottom: 12 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button style={{ width: '100%' }} type="submit">Login</button>
        {err && <p className="err">{err}</p>}
      </form>
    </div>
  );
}
