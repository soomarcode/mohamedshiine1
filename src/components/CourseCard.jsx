import React from 'react';

export default function CourseCard(props) {
    const { id, title, price, pricelabel, description, image, buttontext, type, onClick } = props;
    const isFree = type === 'free';

    // Create a clean course object to pass back
    const courseData = { id, title, price, pricelabel, description, image, buttontext, type };

    return (
        <div className="course-card" onClick={() => onClick(courseData)} style={{ cursor: 'pointer' }}>
            <div className="course-card-content">
                <div className="course-card-header">
                    <span className={`price-badge ${isFree ? 'free' : 'paid'}`}>
                        {pricelabel}
                    </span>
                    <h3>{title}</h3>
                </div>
                <p>{description}</p>
                <div className="course-card-footer">
                    <button className={`btn-course ${isFree ? 'free' : 'paid'}`} onClick={(e) => { e.stopPropagation(); onClick(courseData); }}>
                        Daawo
                    </button>
                    {!isFree && (
                        <button className="btn-preview" onClick={(e) => {
                            e.stopPropagation();
                            if (props.onPreview) {
                                props.onPreview(courseData);
                            } else {
                                console.warn('onPreview prop missing in CourseCard');
                            }
                        }}>
                            Preview
                        </button>
                    )}
                </div>
            </div>
            <div className="course-card-image">
                <img src={image} alt={title} />
            </div>
        </div>
    );
}
