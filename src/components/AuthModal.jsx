
import React, { useState } from 'react';
import { supabase } from '../supabase';

const AuthModal = ({ isOpen, onClose, initialView = 'select', onLoginSuccess }) => {
    if (!isOpen) return null;

    // 'select', 'signup', 'login'
    const [view, setView] = useState(initialView);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState(null);
    const [codeSent, setCodeSent] = useState(false);

    // Reset view when closing? handled by parent re-rendering or effect, 
    // but for now simple state is fine.

    // Prevent click propagation to overlay
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    const handleSendCode = async () => {
        if (!email) {
            setError('Please enter your email address first.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;
            setCodeSent(true);
            alert(`Verification code sent to ${email}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);

        if (!verificationCode) {
            setError('Please enter the verification code sent to your email.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // 1. Verify the OTP
            // type: 'magiclink' is correct for signInWithOtp flow
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: verificationCode,
                type: 'magiclink',
            });

            if (verifyError) throw verifyError;

            // 2. If verified, user is logged in. Now set password and metadata.
            if (data.session) {
                const { error: updateError } = await supabase.auth.updateUser({
                    password: password,
                    data: { full_name: fullName }
                });

                if (updateError) throw updateError;

                // Success!
                onLoginSuccess && onLoginSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            if (data.session) {
                onLoginSuccess && onLoginSuccess();
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
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

                        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</p>}
                        {codeSent && <p style={{ color: 'green', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>Code sent! Check your email.</p>}

                        <form className="auth-form" onSubmit={handleSignUp}>
                            <div className="form-group">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group with-action">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    placeholder="Email Address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="button" className="btn-send-code" onClick={handleSendCode} disabled={loading}>
                                    {loading && !codeSent ? 'Sending...' : (codeSent ? 'Resend Code' : 'Send Code')}
                                </button>
                            </div>

                            <div className="form-group">
                                <span className="input-icon">⚙️</span>
                                <input
                                    type="text"
                                    placeholder="Confirmation Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    required={codeSent}
                                />
                            </div>

                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
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

                            <button type="submit" className="btn-auth btn-signup-full" disabled={loading}>
                                {loading && codeSent ? 'Verifying...' : 'Sign Up'}
                            </button>
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

                        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem', marginBottom: '10px' }}>{error}</p>}

                        <form className="auth-form" onSubmit={handleLogin}>
                            <div className="form-group">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    placeholder="Email Address..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <span className="input-icon">🔒</span>
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-auth btn-login-blue width-100" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <p className="modal-footer-text">
                                Don't have an account? <span className="link-login" onClick={() => setView('signup')}>Sign Up</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
