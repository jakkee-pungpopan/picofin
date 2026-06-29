'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function Users() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const load = (s = '') => api(`/admin/users${s ? `?search=${encodeURIComponent(s)}` : ''}`).then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <><Sidebar /><div className="main">
      <h2>Users</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" />
        <button onClick={() => load(q)}>Search</button>
      </div>
      <table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Accounts</th></tr></thead>
        <tbody>{rows.map((u) => (
          <tr key={u.id}><td>{u.fullName}</td><td>{u.email}</td><td>{u.phone || '-'}</td><td>{u.status}</td><td>{u._count?.accounts ?? 0}</td></tr>
        ))}{rows.length === 0 && <tr><td colSpan={5} style={{ color: '#6B7280' }}>No users</td></tr>}</tbody>
      </table>
    </div></>
  );
}
