'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function Transactions() {
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const load = (s = '') => api(`/admin/transactions${s ? `?search=${encodeURIComponent(s)}` : ''}`).then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  return (
    <><Sidebar /><div className="main">
      <h2>Transactions</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference" />
        <button onClick={() => load(q)}>Search</button>
      </div>
      <table><thead><tr><th>Reference</th><th>Type</th><th>Status</th><th>Amount (THB)</th><th>Date</th></tr></thead>
        <tbody>{rows.map((t) => (
          <tr key={t.id}><td>{t.reference}</td><td>{t.type}</td><td>{t.status}</td>
            <td>฿{t.amount?.toLocaleString()}</td><td>{new Date(t.createdAt).toLocaleString()}</td></tr>
        ))}{rows.length === 0 && <tr><td colSpan={5} style={{ color: '#6B7280' }}>No transactions</td></tr>}</tbody>
      </table>
    </div></>
  );
}
