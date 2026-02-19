import React from 'react';
import { supabase } from '../supabase';

export default function Header({ onLogin, user, onAdminClick }) {
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const isAdmin = user?.email === 'soomarcode@gmail.com' || user?.user_metadata?.role === 'admin';
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=28a745&color=fff`;

    const [menuActive, setMenuActive] = React.useState(false);

    return (
        <header className="header">
            <div className="header-logo">
                <img src="/images/logo.png" alt="MohamedShiine.com" className="logo-img" />
            </div>

            <button className="mobile-menu-toggle" onClick={() => setMenuActive(!menuActive)}>
                {menuActive ? '✕' : '☰'}
            </button>

            <nav className={`header-nav ${menuActive ? 'active' : ''}`}>
                <a href="#home" onClick={() => setMenuActive(false)}>Home</a>
                <a href="#courses" onClick={() => setMenuActive(false)}>Courses</a>
                <a href="#about" onClick={() => setMenuActive(false)}>About</a>
                {isAdmin && (
                    <button
                        onClick={() => { onAdminClick(); setMenuActive(false); }}
                        style={{ background: '#1e293b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, width: '100%' }}
                    >
                        Admin Panel
                    </button>
                )}
                {user ? (
                    <div className="header-user">
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-dark)' }}>{displayName}</span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#dc3545',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    padding: '4px 0',
                                    textAlign: 'left'
                                }}
                            >
                                Log Out
                            </button>
                        </div>
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #28a745' }}
                        />
                    </div>
                ) : (
                    <button className="btn-login" style={{ width: '100%' }} onClick={() => { onLogin(); setMenuActive(false); }}>Login</button>
                )}
            </nav>
        </header>
    );
}
