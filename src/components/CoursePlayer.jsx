import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';


const CoursePlayer = ({ course, onBack }) => {
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);

            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Fetch REAL lessons for this course from Supabase
            const { data: lessonsData, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', course.id)
                .order('order_index', { ascending: true });

            if (error) {
                console.error('Error fetching lessons:', error);
                setLessons([]);
                setActiveLesson(null);
            } else if (lessonsData && lessonsData.length > 0) {
                setLessons(lessonsData);
                setActiveLesson(lessonsData[0]);
            } else {
                // If no lessons exist in DB for this course yet, clear state
                setLessons([]);
                setActiveLesson(null);
            }

            setLoading(false);
        };

        loadInitialData();
    }, [course.id]);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=15803d&color=fff`;

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>Soo raraya...</div>;
    }

    return (
        <div className="course-player-page">
            <header className="player-header">
                <div className="header-left">
                    <img src="/images/logo.png" alt="Logo" className="player-logo" onClick={onBack} style={{ cursor: 'pointer' }} />
                </div>
                <div className="header-right">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="user-name" style={{ fontWeight: 500 }}>{displayName}</span>
                        <div className="user-avatar">
                            <img src={avatarUrl} alt={displayName} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #15803d' }} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="player-container">
                <div className="player-content">
                    <div className="breadcrumbs">
                        <span>Courses</span> / <span>{course.title}</span> / <span className="current">{activeLesson?.title}</span>
                    </div>

                    <div className="video-wrapper">
                        <span className="badge-free">{course.type === 'free' ? 'FREE' : 'PAID'}</span>
                        {activeLesson ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${activeLesson.youtube_id}?rel=0&modestbranding=1`}
                                title={activeLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                style={{ border: 'none', borderRadius: '12px' }}
                            ></iframe>
                        ) : (
                            <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Video looma helin</div>
                        )}
                    </div>

                    <div className="lesson-info">
                        <h2>{activeLesson?.title}</h2>
                        <p className="enrollment-status">Waxaad hadda si rasmi ah ugu qoran tahay course-kan.</p>

                        <div className="lesson-actions">
                            <button className="btn-mark-complete"><span>✔</span> Mark Complete</button>
                            <button className="btn-next-lesson"><span>▶</span> Next Lesson</button>
                        </div>
                    </div>

                    <div className="player-accordion">
                        <div className="accordion-item">
                            <div className="accordion-header">Lesson Resources <span>▼</span></div>
                            <div className="accordion-content">
                                <ul className="resource-list">
                                    {activeLesson?.pdf_link ? (
                                        <li>💼 PDF Casharka: <a href={activeLesson.pdf_link} target="_blank" rel="noreferrer">Soo rago PDF</a></li>
                                    ) : (
                                        <li style={{ color: '#94a3b8' }}>PDF looma helin casharkaan.</li>
                                    )}
                                    {activeLesson?.resource_link && (
                                        <li>🔗 Link-iga waxtarka leh: <a href={activeLesson.resource_link} target="_blank" rel="noreferrer">Booqo halkan</a></li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="accordion-item">
                            <div className="accordion-header">Course Resources <span>▼</span></div>
                        </div>
                        <div className="accordion-item">
                            <div className="accordion-header">Community <span>▼</span></div>
                        </div>
                    </div>
                </div>

                <div className="player-sidebar">
                    <div className="sidebar-card">
                        <div className="curriculum-header">
                            <h3>Curriculum</h3>
                            <span>▼</span>
                        </div>
                        <div className="course-progress-container">
                            <div className="progress-header">
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{course.title}</span>
                                <div className="progress-bar-wrap">
                                    <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                                </div>
                                <span className="progress-status">0% COMPLETE</span>
                            </div>
                        </div>
                        <ul className="lesson-list">
                            {lessons.map((lesson, index) => (
                                <li
                                    key={lesson.id}
                                    className={`lesson-item ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                                    onClick={() => setActiveLesson(lesson)}
                                >
                                    <span className="lesson-status">{activeLesson?.id === lesson.id ? '▶' : (index + 1)}</span>
                                    <div className="lesson-info-row">
                                        <span className="lesson-title-text">{lesson.title}</span>
                                        <span className="lesson-duration">{lesson.duration || '0:00'}</span>
                                    </div>
                                </li>
                            ))}
                            {lessons.length === 0 && (
                                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748b' }}>
                                    <p style={{ fontWeight: 600 }}>No lessons added yet.</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>Check back soon!</p>
                                </div>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
