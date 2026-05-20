import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import CourseCard from './CourseCard';

export default function Courses({ onCourseClick = () => { }, onPreviewClick = () => { } }) {
    console.log('Courses Component Rendered, props:', { onCourseClick, onPreviewClick });
    const [coursesData, setCoursesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('Error loading courses:', error);
            } else {
                setCoursesData(data || []);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        if (!coursesData) return [];
        return coursesData.filter((course) => {
            const matchesFilter =
                filter === 'all' ||
                (filter === 'free' && course.type === 'free') ||
                (filter === 'paid' && course.type === 'paid');
            const matchesSearch =
                search.trim() === '' ||
                course.title.toLowerCase().includes(search.toLowerCase()) ||
                (course.description && course.description.toLowerCase().includes(search.toLowerCase()));
            return matchesFilter && matchesSearch;
        });
    }, [filter, search, coursesData]);

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
                    <style>{`
                        @keyframes skeleton-shimmer {
                            0% { background-position: -200% 0; }
                            100% { background-position: 200% 0; }
                        }
                        .skeleton-item {
                            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
                            background-size: 200% 100%;
                            animation: skeleton-shimmer 1.5s infinite;
                        }
                    `}</style>
                    {loading ? (
                        Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="course-card skeleton-card" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', background: 'rgba(255,255,255,0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', width: '100%' }}>
                                <div className="skeleton-item" style={{ height: '24px', width: '30%', borderRadius: '12px' }}></div>
                                <div className="skeleton-item" style={{ height: '32px', width: '70%', borderRadius: '6px' }}></div>
                                <div className="skeleton-item" style={{ height: '60px', width: '100%', borderRadius: '8px' }}></div>
                                <div className="skeleton-item" style={{ marginTop: 'auto', height: '48px', width: '120px', borderRadius: '24px' }}></div>
                            </div>
                        ))
                    ) : filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                            <CourseCard key={course.id} {...course} onClick={onCourseClick} onPreview={onPreviewClick} />
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px', width: '100%' }}>
                            No courses found matching your criteria.
                        </p>
                    )}
                </div>
            </section>
        </section>
    );
}
