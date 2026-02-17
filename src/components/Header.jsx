import React from 'react';

export default function Header() {
    return (
        <header className="header">
            <div className="header-logo">
                <img src="/images/logo.png" alt="MohamedShiine.com" className="logo-img" />
            </div>
            <nav className="header-nav">
                <a href="#home">Home</a>
                <a href="#courses">Courses</a>
                <a href="#about">About</a>
                <button className="btn-login">Login</button>
            </nav>
        </header>
    );
}
