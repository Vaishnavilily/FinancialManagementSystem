'use client';
import Link from 'next/link';
import { useAuthUser } from '@/lib/useAuthUser';

export default function TopBar({ title, subtitle }) {
  const { authUser } = useAuthUser();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const avatarLabel = (authUser?.name || authUser?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1>{title}</h1>
        <p>{subtitle || today}</p>
      </div>
      <div className="topbar-right">
        <Link href="/alerts" className="topbar-btn" title="Alerts & Notifications" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </Link>
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <div className="topbar-avatar" title="My Profile">{avatarLabel}</div>
        </Link>
      </div>
    </div>
  );
}