import React from 'react';
import { supabase } from '../supabase';

export default function Header({ onLogin, user, onAdminClick }) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const isAdmin = user?.email === 'soomarcode@gmail.com' || user?.user_metadata?.role === 'admin';
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=28a745&color=fff`;

    return (
        <header className="header">
            <div className="header-logo">
                <img src="/images/logo.png" alt="MohamedShiine.com" className="logo-img" />
            </div>
            <nav className="header-nav">
                <a href="#home">Home</a>
                <a href="#courses">Courses</a>
                <a href="#about">About</a>
                {isAdmin && (
                    <button
                        onClick={onAdminClick}
                        style={{ background: '#1e293b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Admin
                    </button>
                )}
                {user ? (
                    <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{displayName}</span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#dc3545',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    padding: 0,
                                    textAlign: 'right'
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #28a745' }}
                        />
                    </div>
                ) : (
                    <button className="btn-login" onClick={onLogin}>Login</button>
                )}
            </nav>
        </header>
    );
}
