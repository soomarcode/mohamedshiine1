import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, initialView = 'select', onLoginSuccess }) => {
    if (!isOpen) return null;

    // 'select', 'signup', 'login'
    const [view, setView] = useState(initialView);

    // Reset view when closing? handled by parent re-rendering or effect, 
    // but for now simple state is fine.

    // Prevent click propagation to overlay
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <img src="/images/logo.png" alt="MohamedShiine.com" className="modal-logo" />
                </div>

                {view === 'select' && (
                    <div className="modal-body select-view">
                        <h2 className="modal-title">
                            Sign Up to Get <span className="highlight-green">Free Access!</span>
                        </h2>
                        <p className="modal-subtitle">
                            Isdiiwangali ama gal si aad uga faa'idaysato caqabadka FREE-ga ah.
                        </p>

                        <div className="auth-options">
                            <div className="auth-option-header">Sameew Account Cusub</div>
                            <button className="btn-auth btn-signup-green" onClick={() => setView('signup')}>
                                Sign Up
                            </button>

                            <div className="auth-divider">OR</div>

                            <button className="btn-auth btn-login-blue" onClick={() => setView('login')}>
                                Login
                            </button>
                        </div>

                        <p className="modal-footer-text">
                            Do you already have an account? <span className="link-login" onClick={() => setView('login')}>Login</span>
                        </p>
                    </div>
                )}

                {view === 'signup' && (
                    <div className="modal-body signup-view">
                        <h2 className="modal-title">Sign Up for <span className="highlight-green">Free</span></h2>
                        <p className="modal-subtitle">Abuur account, hel koorsooyinka FREE-ga ah!</p>

                        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onLoginSuccess && onLoginSuccess(); }}>
                            <div className="form-group">
                                <span className="input-icon">👤</span>
                                <input type="text" placeholder="Full Name" />
                            </div>

                            <div className="form-group with-action">
                                <span className="input-icon">✉️</span>
                                <input type="email" placeholder="Email Address..." />
                                <button type="button" className="btn-send-code">Send Code</button>
                            </div>

                            <div className="form-group">
                                <span className="input-icon">⚙️</span>
                                <input type="text" placeholder="Confirmation Code" />
                            </div>

                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input type="password" placeholder="Password" />
                            </div>

                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input type="password" placeholder="Confirm Password" />
                            </div>

                            <div className="form-group">
                                <span className="input-icon">📍</span>
                                <select defaultValue="">
                                    <option value="" disabled>City</option>
                                    <option value="mogadishu">Mogadishu</option>
                                    <option value="hargeisa">Hargeisa</option>
                                    <option value="global">Other</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>

                            <button type="submit" className="btn-auth btn-signup-full">Sign Up</button>
                        </form>

                        <div className="modal-footer-wrapper">
                            <p className="modal-footer-text small">
                                Waxaad horey ugu abuuran tahay account? <span className="link-login" onClick={() => setView('login')}>Login</span>
                            </p>
                            <p className="modal-terms">
                                By signing up, i accept the <span className="highlight-green">Terms</span> and <span className="highlight-green">Privacy Policy</span>.
                            </p>
                        </div>
                    </div>
                )}

                {view === 'login' && (
                    <div className="modal-body login-view">
                        <h2 className="modal-title">Welcome Back!</h2>
                        <p className="modal-subtitle">Gal akoonkaaga si aad u sii wadato.</p>

                        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onLoginSuccess && onLoginSuccess(); }}>
                            <div className="form-group">
                                <span className="input-icon">✉️</span>
                                <input type="email" placeholder="Email Address..." />
                            </div>
                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input type="password" placeholder="Password" />
                            </div>
                            <button type="submit" className="btn-auth btn-login-blue width-100">Login</button>
                        </form>

                        <p className="modal-footer-text">
                            Don't have an account? <span className="link-login" onClick={() => setView('signup')}>Sign Up</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
