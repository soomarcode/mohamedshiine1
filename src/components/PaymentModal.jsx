import React, { useState } from 'react';

const PaymentModal = ({ course, isOpen, onClose, onComplete }) => {
    if (!isOpen || !course) return null;

    const [paymentMethod, setPaymentMethod] = useState('evc'); // evc, edahab, stripe
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate payment processing delay (e.g., waiting for USSD popup)
        setTimeout(() => {
            setIsProcessing(false);
            onComplete();
        }, 2000); // 2 seconds delay
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="payment-header">
                    <h2>{course.title} — <span className="highlight-price">${course.price}</span></h2>
                    <p>Hel access buuxa + dhammaan casharada + resources</p>
                </div>

                <div className="payment-body">
                    {/* Left: Methods */}
                    <div className="payment-methods">
                        <h3>Dooro habka lacag Bixinta</h3>

                        <div
                            className={`payment-option ${paymentMethod === 'evc' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('evc')}
                        >
                            <div className="radio-circle">{paymentMethod === 'evc' && '✔'}</div>
                            <span className="method-icon evc-icon">EVC</span>
                            <span className="method-name">EVC Plus</span>
                        </div>

                        <div
                            className={`payment-option ${paymentMethod === 'edahab' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('edahab')}
                        >
                            <div className="radio-circle">{paymentMethod === 'edahab' && '✔'}</div>
                            <span className="method-icon edahab-icon">Edahab</span>
                            <span className="method-name">Edahab</span>
                        </div>

                        <div
                            className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                            onClick={() => setPaymentMethod('stripe')}
                        >
                            <div className="radio-circle">{paymentMethod === 'stripe' && '✔'}</div>
                            <span className="method-icon stripe-icon">💳</span>
                            <span className="method-name">Stripe</span>
                            <div className="card-icons">
                                <span>VISA</span> <span>MC</span>
                            </div>
                        </div>

                        <p className="powered-by">Powered by <strong>MOBILEWALL™</strong></p>
                    </div>

                    {/* Right: Summary */}
                    <div className="payment-summary">
                        <div className="summary-card">
                            <img src={course.image} alt={course.title} className="summary-img" />
                            <h4>{course.title}</h4>
                            <div className="price-tag">${course.price}</div>

                            <ul className="benefits-list">
                                <li>✔ Lifetime Access</li>
                                <li>✔ Certificate Included</li>
                                <li>🔒 Secure Payment</li>
                            </ul>

                            <button className="btn-continue" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Continue'}
                            </button>
                            <p className="footer-secure">Secure payment powered by <strong>stripe</strong></p>
                        </div>
                    </div>
                </div>

                <div className="payment-footer-warning">
                    <div className="unlock-banner">
                        <span className="lock-icon">🔒</span>
                        <div>
                            <strong>Unlock the full course to access all premium lessons.</strong>
                            <ul className="mini-benefits">
                                <li>✓ Access 4 premium lessons</li>
                                <li>✓ Downloadable resources and worksheets</li>
                                <li>✓ Practical product strategy tips</li>
                            </ul>
                            <button className="btn-unlock-full" onClick={onComplete}>Unlock Full Course</button>
                        </div>
                    </div>
                    <p className="guarantee-text">⊕ 30-Day Money Back Guarantee</p>
                </div>

            </div>
        </div>
    );
};

export default PaymentModal;
