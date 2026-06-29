'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';

export default function Audit() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { api('/admin/audit-logs').then(setRows).catch(() => {}); }, []);
  return (
    <><Sidebar /><div className="main">
      <h2>Audit Logs</h2>
      <table><thead><tr><th>Actor</th><th>Action</th><th>Entity</th><th>IP</th><th>Date</th></tr></thead>
        <tbody>{rows.map((a) => (
          <tr key={a.id}><td>{a.actorType}:{a.actorId?.slice(0, 8) || '-'}</td><td>{a.action}</td>
            <td>{a.entity || '-'}</td><td>{a.ip || '-'}</td><td>{new Date(a.createdAt).toLocaleString()}</td></tr>
        ))}{rows.length === 0 && <tr><td colSpan={5} style={{ color: '#6B7280' }}>No logs</td></tr>}</tbody>
      </table>
    </div></>
  );
}
