import React from 'react';

export default function Header({ onLogin, user }) {
    return (
        <header className="header">
            <div className="header-logo">
                <img src="/images/logo.png" alt="MohamedShiine.com" className="logo-img" />
            </div>
            <nav className="header-nav">
                <a href="#home">Home</a>
                <a href="#courses">Courses</a>
                <a href="#about">About</a>
                {user ? (
                    <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                        <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </div>
                ) : (
                    <button className="btn-login" onClick={onLogin}>Login</button>
                )}
            </nav>
        </header>
    );
}
