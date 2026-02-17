import React from 'react';

export default function FeaturesBar() {
    return (
        <div className="features-bar">
            <div className="feature-item">
                <div className="feature-icon green">✓</div>
                <span>Practical</span>
            </div>
            <div className="feature-item">
                <div className="feature-icon blue">📜</div>
                <span>Certificate</span>
            </div>
            <div className="feature-item">
                <div className="feature-icon blue">👥</div>
                <span>Community</span>
            </div>
        </div>
    );
}
