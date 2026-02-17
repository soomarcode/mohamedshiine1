import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// Mock curriculum data
const lessons = [
    { id: 1, title: 'Bilowga e-commerce ka', duration: '8:15', active: true, completed: false },
    { id: 2, title: 'Suuqa iyo Dhiagaga Target ka', duration: '8:42', active: false, locked: true },
    { id: 3, title: 'Side loo doortaa badeecada', duration: '7:36', active: false, locked: true },
    { id: 4, title: 'Barashada Wordpress ka', duration: '8:06', active: false, locked: true },
    { id: 5, title: 'Qiimaynta iyo Liisgareyta', duration: '9:40', active: false, locked: true },
    { id: 6, title: 'Qabdhismeedka Product ka', duration: '7:45', active: false, locked: true },
    { id: 7, title: 'Suuq geynta Digital ka', duration: '5:58', active: false, locked: true },
    { id: 8, title: 'Maareynta Dalabka iyo Fulinta', duration: '12:52', active: false, locked: true },
    { id: 9, title: 'Adeegsiga Aaladaha AI', duration: '9:15', active: false, locked: true },
];

const CoursePlayer = ({ course, onBack }) => {
    const [activeLesson, setActiveLesson] = useState(lessons[0]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
        });
    }, []);

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=15803d&color=fff`;

    return (
        <div className="course-player-page">
            {/* Custom Header for Player */}
            <header className="player-header">
                <div className="header-left">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="player-logo"
                        onClick={onBack}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
                <div className="header-right">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="user-name" style={{ fontWeight: 500, color: '#1e293b' }}>{displayName}</span>
                        <div className="user-avatar">
                            <img
                                src={avatarUrl}
                                alt={displayName}
                                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #15803d' }}
                            />
                        </div>
                    </div>
                </div>
            </header>

            <div className="player-container">
                <div className="player-content">
                    <div className="breadcrumbs">
                        <span>Courses</span> / <span>{course.title}</span> / <span className="current">{activeLesson.title}</span>
                    </div>

                    <div className="video-wrapper">
                        <span className="badge-free">FREE</span>
                        <img src={course.image} alt="Video Thumbnail" className="video-poster" />

                        <div className="video-controls">
                            <div className="control-left" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>❚❚</span>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>⏭</span>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔉</span>
                                <span style={{ fontSize: '0.9rem' }}>0:03 / {activeLesson.duration}</span>
                            </div>
                            <div className="control-right" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>⚙</span>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>⛶</span>
                            </div>
                        </div>
                    </div>

                    <div className="lesson-info">
                        <h2>Casharka {activeLesson.id}: {activeLesson.title}</h2>
                        <p className="enrollment-status">Waxaad hadda si rasmi ah ugu qoran tahay course-kan.</p>

                        <div className="lesson-actions">
                            <button className="btn-mark-complete">
                                <span>✔</span> Mark Complete
                            </button>
                            <button className="btn-next-lesson">
                                <span>▶</span> Casharka {activeLesson.id + 1}aad
                            </button>
                        </div>
                    </div>

                    <div className="player-accordion">
                        <div className="accordion-item">
                            <div className="accordion-header">
                                Lesson Resources <span>▼</span>
                            </div>
                            <div className="accordion-content">
                                <ul className="resource-list">
                                    <li>💼 PDF Casharka 🔗 <a href="#">Madabtaliya</a></li>
                                    <li>🔗 Linkyada waxtarka leh <a href="#">Madabkaliya</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <div className="accordion-header">
                                Course Resources <span>▼</span>
                            </div>
                        </div>

                        <div className="accordion-item">
                            <div className="accordion-header">
                                Community <span>▼</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="player-sidebar">
                    <div className="sidebar-card">
                        <div className="curriculum-header">
                            <h3>Curriculum</h3>
                            <span className="toggle-icon">▼</span>
                        </div>

                        <div className="course-progress-container">
                            <div className="progress-header">
                                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{course.title}</span>
                                <div className="progress-bar-wrap">
                                    <div className="progress-bar-fill" style={{ width: '0%' }}></div>
                                </div>
                                <span className="progress-status">0% COMPLETE</span>
                            </div>
                        </div>

                        <ul className="lesson-list">
                            {lessons.map(lesson => (
                                <li
                                    key={lesson.id}
                                    className={`lesson-item ${lesson.id === activeLesson.id ? 'active' : ''} ${lesson.locked ? 'locked' : ''}`}
                                    onClick={() => !lesson.locked && setActiveLesson(lesson)}
                                >
                                    <span className="lesson-status">
                                        {lesson.id === activeLesson.id ? '▶' : (lesson.locked ? '🔒' : '○')}
                                    </span>
                                    <div className="lesson-info-row">
                                        <span className="lesson-title-text">Casharka {lesson.id}: {lesson.title}</span>
                                        <span className="lesson-duration">{lesson.duration}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
