import React, { useState } from 'react';
import Header from './Header'; // Reuse header but customize?

// Mock curriculum data
const lessons = [
    { id: 1, title: 'Bilowga e-commerce ka', duration: '8:15', active: true, completed: false },
    { id: 2, title: 'Suuqa iyo Dhiagaga Target ka', duration: '8:42', active: false, locked: true },
    { id: 3, title: 'Side loo doortaa badeecada', duration: '7:36', active: false, locked: true },
    { id: 4, title: 'Barashada Wordpress ka', duration: '8:06', active: false, locked: true },
    { id: 5, title: 'Qiimaynta iyo Liisgareyta', duration: '9:40', active: false, locked: true },
];

const CoursePlayer = ({ course, onBack }) => {
    const [activeLesson, setActiveLesson] = useState(lessons[0]);

    return (
        <div className="course-player-page">
            {/* Custom Header for Player */}
            <header className="player-header">
                <div className="header-left">
                    <img src="/images/logo.png" alt="Logo" className="player-logo" onClick={onBack} />
                </div>
                <div className="header-right">
                    <span className="user-name">Mohamed</span>
                    <div className="user-avatar">
                        <img src="/images/hero-person.png" alt="User" />
                    </div>
                </div>
            </header>

            <div className="player-container">
                <div className="player-content">
                    <div className="breadcrumbs">
                        <span>Courses</span> / <span>{course.title}</span> / <span className="current">{activeLesson.title}</span>
                    </div>

                    <div className="video-wrapper">
                        <div className="video-placeholder">
                            <span className="badge-free">FREE</span>
                            <img src={course.image} alt="Video Thumbnail" className="video-poster" />
                            <div className="play-button">▶</div>
                            <div className="video-controls">
                                <div className="control-left">
                                    <span>❚❚</span> <span>⏭</span> <span>🔉</span> <span>0:03 / {activeLesson.duration}</span>
                                </div>
                                <div className="control-right">
                                    <span>⚙</span> <span>⛶</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lesson-info">
                        <h2>Casharka {activeLesson.id}: {activeLesson.title}</h2>
                        <p className="enrollment-status">Waxaad hadda si rasmi ah ugu qoran tahay course-kan.</p>

                        <div className="lesson-actions">
                            <button className="btn-mark-complete">✔ Mark Complete</button>
                            <button className="btn-next-lesson">Casharka {activeLesson.id + 1}aad ▶</button>
                        </div>
                    </div>

                    <div className="player-tabs">
                        <div className="tab-section">
                            <h3>Lesson Resources</h3>
                            <ul>
                                <li>📄 PDF Casharka <a href="#">Madabtaliya</a></li>
                                <li>🔗 Linkyada waxtarka leh <a href="#">Madabkaliya</a></li>
                            </ul>
                        </div>

                        <div className="tab-section collapsed">
                            <h3>Course Resources ▼</h3>
                        </div>
                        <div className="tab-section collapsed">
                            <h3>Community ▼</h3>
                        </div>
                    </div>
                </div>

                <div className="player-sidebar">
                    <div className="curriculum-header">
                        <h3>Curriculum</h3>
                        <span className="toggle-icon">▼</span>
                    </div>
                    <div className="course-progress">
                        <span>{course.title}</span>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '0%' }}></div></div>
                        <span className="progress-text">0% COMPLETE</span>
                    </div>
                    <ul className="lesson-list">
                        {lessons.map(lesson => (
                            <li key={lesson.id} className={`lesson-item ${lesson.active ? 'active' : ''} ${lesson.locked ? 'locked' : ''}`}>
                                <span className="lesson-status">
                                    {lesson.active ? '▶' : (lesson.locked ? '🔒' : '○')}
                                </span>
                                <span className="lesson-title">Casharka {lesson.id}: {lesson.title}</span>
                                <span className="lesson-duration">{lesson.duration}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
