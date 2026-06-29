'use client';
import { useEffect } from 'react';
export default function Home() {
  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    location.href = t ? '/dashboard' : '/login';
  }, []);
  return <p style={{ padding: 24 }}>Loading…</p>;
}
