import React from 'react';

export default function CourseCard({ title, price, priceLabel, description, image, buttonText, type, onClick }) {
    const isFree = type === 'free';

    return (
        <div className="course-card">
            <div className="course-card-content">
                <div className="course-card-header">
                    <span className={`price-badge ${isFree ? 'free' : 'paid'}`}>
                        {priceLabel}
                    </span>
                    <h3>{title}</h3>
                </div>
                <p>{description}</p>
                <button className={`btn-course ${isFree ? 'free' : 'paid'}`} onClick={onClick}>
                    {buttonText}
                </button>
            </div>
            <div className="course-card-image">
                <img src={image} alt={title} />
            </div>
        </div>
    );
}
