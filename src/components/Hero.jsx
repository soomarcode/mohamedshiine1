import React from 'react';

export default function Hero() {
    const scrollToCourses = () => {
        const el = document.getElementById('courses');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero" id="home">
            <div className="hero-bg">
                <img src="/images/hero-bg.png" alt="City skyline" />
            </div>
            <div className="hero-content">
                <div className="hero-text">
                    <p className="hero-subtitle">
                        Isaradiye <span className="arrow">→</span>
                    </p>
                    <h1>
                        Noqo Digital <span>Founder</span>
                    </h1>
                    <p>
                        Guusha Digital Ganacsiga Bilow —<br />
                        Qofkii Hore Buuxa!
                    </p>
                    <button className="btn-cta" onClick={scrollToCourses}>
                        Eeg Course-yada
                    </button>
                </div>
                <div className="hero-image">
                    <img src="/images/hero-person.png" alt="Mohamed Shiine" />
                </div>
            </div>
        </section>
    );
}
