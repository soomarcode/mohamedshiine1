import React, { useState } from 'react';
import { processPayment } from '../services/paymentService';

const PaymentModal = ({ course, isOpen, onClose, onComplete }) => {
    if (!isOpen || !course) return null;

    const [paymentMethod, setPaymentMethod] = useState('evc');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        if (!phoneNumber) {
            alert('Fadlan geli lambarkaaga');
            return;
        }

        setIsProcessing(true);
        const result = await processPayment(paymentMethod, course.price, phoneNumber);

        if (result.success) {
            setIsProcessing(false);
            onComplete();
        } else {
            setIsProcessing(false);
            alert(`Payment Failed: ${result.message}`);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-modal-simple" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="payment-body-simple">
                    <div className="payment-course-info">
                        <div className="payment-thumbnail-wrapper">
                            <img src={course.thumbnail} alt={course.title} className="payment-course-thumbnail" />
                        </div>
                        <p className="course-desc-payment">{course.description}</p>
                        <div className="payment-amount-badge">${course.price}</div>
                    </div>

                    <div className="payment-methods-simple">
                        <h3>Dooro habka lacag bixinta</h3>
                        <div className="payment-options-row">
                            <div
                                className={`payment-option-simple ${paymentMethod === 'evc' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('evc')}
                            >
                                <span className="method-name">EVC Plus</span>
                            </div>

                            <div
                                className={`payment-option-simple ${paymentMethod === 'edahab' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('edahab')}
                            >
                                <span className="method-name">eDahab</span>
                            </div>
                        </div>

                        <div className="mobile-payment-input-simple">
                            <label>Geli Lambarkaaga (EVC ama eDahab)</label>
                            <input
                                type="tel"
                                placeholder="Geli lambarka..."
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <button className="btn-pay-now" onClick={handlePayment} disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>

                        <div className="soomar-pay-branding">
                            <span>Powered by</span>
                            <img src="/images/soomar-pay.png" alt="Soomar Pay" className="soomar-pay-logo" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
