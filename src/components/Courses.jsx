import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase';
import CourseCard from './CourseCard';

export default function Courses({ onCourseClick }) {
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
