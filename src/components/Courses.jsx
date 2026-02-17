import React, { useState, useMemo } from 'react';
import CourseCard from './CourseCard';

const coursesData = [
    {
        id: 1,
        title: 'E-Commerce Bilow',
        price: 0,
        priceLabel: 'FREE',
        type: 'free',
        description: 'Bilaw ganacsi online. Soo hel product demand leh, Uyuu gurigaa ka bilow iibkaaga WhatsApp iyo Facebook.',
        image: '/images/course-ecommerce.png',
        buttonText: 'Daawo Bilaash',
    },
    {
        id: 2,
        title: 'WhatsApp Ganacsi Mastery',
        price: 0,
        priceLabel: 'FREE',
        type: 'free',
        description: 'Master iibinta WhatsApp — automation, marketing, iyo delivery system.',
        image: '/images/course-whatsapp.png',
        buttonText: 'Daawo Bilaash',
    },
    {
        id: 3,
        title: '4 Product Strategy',
        price: 25,
        priceLabel: '$25',
        type: 'paid',
        description: 'Bilwi Pnoqo Biloma pro buli britoega iyo testing. ka ganacsiyada cusub.',
        image: '/images/course-product.png',
        buttonText: 'Faahfaahin',
    },
];

export default function Courses({ onCourseClick }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredCourses = useMemo(() => {
        return coursesData.filter((course) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'free' && course.type === 'free') ||
                (filter === 'paid' && course.type === 'paid');
            const matchesSearch =
                search === '' ||
                course.title.toLowerCase().includes(search.toLowerCase()) ||
                course.description.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [filter, search]);

    return (
        <section className="courses-wrapper">
            <section className="courses-section" id="courses">
                <h2>Course-yada</h2>
                <div className="courses-controls">
                    <div className="filter-buttons">
                        {['all', 'free', 'paid'].map((f) => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="courses-list">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course.id} {...course} onClick={onCourseClick} />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                            No courses found matching your criteria.
                        </p>
                    )}
                </div>
            </section>
        </section>
    );
}
