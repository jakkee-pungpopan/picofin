'use client';
import Link from 'next/link';
export default function Sidebar() {
  return (
    <div className="sidebar">
      <h1>◆ NovaBank</h1>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/users">Users</Link>
      <Link href="/transactions">Transactions</Link>
      <Link href="/audit">Audit Logs</Link>
      <a href="#" onClick={() => { localStorage.removeItem('admin_token'); location.href = '/login'; }}>Logout</a>
    </div>
  );
}
