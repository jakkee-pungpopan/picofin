'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) { location.href = '/login'; return; }
    api('/admin/dashboard').then(setD).catch((e) => setErr(e.message));
  }, []);
  return (
    <><Sidebar /><div className="main">
      <h2>Dashboard Summary</h2>
      {err && <p className="err">{err}</p>}
      {!d ? <p>Loading…</p> : (
        <div className="cards">
          <div className="card"><div className="label">Total Users</div><div className="value">{d.users}</div></div>
          <div className="card"><div className="label">Total Accounts</div><div className="value">{d.accounts}</div></div>
          <div className="card"><div className="label">Transactions</div><div className="value">{d.transactions}</div></div>
          <div className="card"><div className="label">Total Volume (THB)</div><div className="value">฿{d.totalVolumeTHB?.toLocaleString()}</div></div>
        </div>
      )}
    </div></>
  );
}
