import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const CoursePlayer = ({ course, onBack, isPreviewMode, onEnroll }) => {
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [showQuizResults, setShowQuizResults] = useState(false);
    const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' or 'quiz'

    // Helper to extract YouTube ID from URL
    const extractYouTubeId = (input) => {
        if (!input) return '';
        const trimmed = input.trim();
        const regex = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|watch\?v=|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
        const match = trimmed.match(regex);
        if (match && match[1]) return match[1];
        if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) return trimmed;
        return '';
    };

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);

            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // Fetch REAL lessons for this course
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
                setLessons([]);
                setActiveLesson(null);
            }

            // Fetch Quiz Questions
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('course_id', course.id)
                .order('id', { ascending: true });

            if (!quizError && quizData) {
                setQuizQuestions(quizData);
            }

            // Load completion status from local storage for now (or Supabase if table exists)
            const savedProgress = localStorage.getItem(`course_progress_${course.id}`);
            if (savedProgress) {
                setCompletedLessons(JSON.parse(savedProgress));
            }

            setLoading(false);
        };

        loadInitialData();
    }, [course.id]);

    const handleMarkComplete = () => {
        if (!activeLesson) return;

        const newCompleted = [...completedLessons];
        if (!newCompleted.includes(activeLesson.id)) {
            newCompleted.push(activeLesson.id);
            setCompletedLessons(newCompleted);
            localStorage.setItem(`course_progress_${course.id}`, JSON.stringify(newCompleted));
        }
    };

    const handleNextLesson = () => {
        if (!activeLesson) return;
        const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
        if (currentIndex < lessons.length - 1) {
            setActiveLesson(lessons[currentIndex + 1]);
        }
    };

    const calculateProgress = () => {
        if (lessons.length === 0) return 0;
        return Math.round((completedLessons.length / lessons.length) * 100);
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';
    const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${displayName}&background=15803d&color=fff`;

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>Soo raraya...</div>;
    }

    const currentProgress = calculateProgress();

    return (
        <div className="course-player-page">
            <header className="player-header">
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button className="btn-player-back" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        <span>Back</span>
                    </button>
                    <div className="v-divider" style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
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
                        <span>Courses</span> / <span className="current">{activeLesson?.title || 'Cashar lama helin'}</span>
                    </div>

                    <div className="video-wrapper">
                        <span className="badge-free">{course.type === 'free' ? 'FREE' : 'PAID'}</span>
                        {activeLesson ? (
                            <div className="youtube-player-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${extractYouTubeId(activeLesson.youtube_id)}?rel=0&modestbranding=1&showinfo=0&autohide=1&controls=1`}
                                    title={activeLesson.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    style={{ border: 'none', borderRadius: '12px' }}
                                ></iframe>
                                {/* Overlay to block 'Watch on YouTube' button */}
                                <div className="youtube-overlay-blocker"></div>
                            </div>
                        ) : (
                            <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#000', borderRadius: '12px' }}>
                                Video looma helin casharkaan
                            </div>
                        )}
                    </div>

                    {quizQuestions.length > 0 && (
                        <div className="player-tabs">
                            <button
                                className={`player-tab ${activeTab === 'curriculum' ? 'active' : ''}`}
                                onClick={() => setActiveTab('curriculum')}
                            >
                                Curriculum
                            </button>
                            <button
                                className={`player-tab ${activeTab === 'quiz' ? 'active' : ''}`}
                                onClick={() => setActiveTab('quiz')}
                            >
                                Quiz
                            </button>
                        </div>
                    )}

                    <div className="tab-content" style={{ marginTop: '20px' }}>
                        {activeTab === 'curriculum' ? (
                            <div className="curriculum-view">
                                <div className="curriculum-layout-split" style={{ display: 'flex', gap: '30px' }}>
                                    <section className="full-curriculum-list" style={{ flex: '1' }}>
                                        <div className="section-header-unified" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1a2332' }}>Course Content</h3>
                                                <div className="mini-progress-pill" style={{ background: '#f0fdf4', padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800, color: '#15803d', border: '1px solid #dcfce7' }}>
                                                    {calculateProgress()}%
                                                </div>
                                            </div>

                                            <div className="compact-header-actions" style={{ display: 'flex', gap: '8px' }}>
                                                {isPreviewMode && course.price > 0 ? (
                                                    <button
                                                        className="btn-enroll-now"
                                                        style={{
                                                            padding: '6px 14px',
                                                            fontSize: '0.75rem',
                                                            background: '#22c55e',
                                                            color: 'white',
                                                            borderRadius: '6px',
                                                            fontWeight: 700,
                                                            border: 'none',
                                                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={onEnroll}
                                                    >
                                                        Enroll Now (${course.price})
                                                    </button>
                                                ) : !isPreviewMode && (
                                                    <>
                                                        <button
                                                            className={`btn-mark-complete ${completedLessons.includes(activeLesson?.id) ? 'completed' : ''}`}
                                                            onClick={handleMarkComplete}
                                                            disabled={!activeLesson || completedLessons.includes(activeLesson?.id)}
                                                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                                                        >
                                                            <span>{completedLessons.includes(activeLesson?.id) ? '✔ Done' : '✔ Complete'}</span>
                                                        </button>
                                                        <button
                                                            className="btn-next-lesson"
                                                            onClick={handleNextLesson}
                                                            disabled={!activeLesson || lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                                                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }}
                                                        >
                                                            <span>Next 🎥</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <ul className="lesson-list horizontal-list">
                                            {lessons.map((lesson, index) => {
                                                const isActive = activeLesson?.id === lesson.id;
                                                const isCompleted = completedLessons.includes(lesson.id);
                                                // Only lock paid courses in preview mode, and only after the first lesson
                                                const isLocked = course.type !== 'free' && isPreviewMode && index > 0;

                                                return (
                                                    <li
                                                        key={lesson.id}
                                                        className={`lesson-item-merged ${isActive ? 'active' : ''} ${isCompleted ? 'is-completed' : ''} ${isLocked ? 'locked' : ''}`}
                                                        onClick={() => isLocked ? onEnroll() : setActiveLesson(lesson)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            padding: '14px',
                                                            background: isActive ? 'rgba(34, 197, 94, 0.08)' : 'white',
                                                            border: `1px solid ${isActive ? '#15803d' : '#f1f5f9'}`,
                                                            borderRadius: '10px',
                                                            marginBottom: '8px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            boxShadow: isActive ? '0 2px 4px rgba(34, 197, 94, 0.05)' : 'none'
                                                        }}
                                                    >
                                                        <span className="lesson-status-icon" style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '50%',
                                                            background: isCompleted ? '#22c55e' : (isActive ? '#15803d' : (isLocked ? '#f8fafc' : '#f1f5f9')),
                                                            color: isCompleted || isActive ? 'white' : '#94a3b8',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            flexShrink: 0
                                                        }}>
                                                            {isCompleted ? (
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            ) : isLocked ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                            ) : (
                                                                <span>{index + 1}</span>
                                                            )}
                                                        </span>
                                                        <div className="lesson-info-row" style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <span className="lesson-title-text" style={{
                                                                fontSize: '0.9rem',
                                                                fontWeight: isActive ? 700 : 500,
                                                                color: isActive ? '#064e3b' : '#1a2332'
                                                            }}>
                                                                {lesson.title}
                                                            </span>
                                                            <span className="lesson-duration" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{lesson.duration || '0:00'}</span>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </section>

                                    <div className="sidebar-resources" style={{ width: '300px', flexShrink: 0 }}>
                                        <div className="section-header-unified" style={{ marginBottom: '20px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1a2332' }}>Lesson Resources</h3>
                                        </div>
                                        <div className="resource-box-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {activeLesson?.pdf_link ? (
                                                <div className="resource-item-box" style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>📄</span>
                                                        <div className="resource-text" style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>PDF Document</span>
                                                            <a href={activeLesson.pdf_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>Download PDF</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="resource-empty-info" style={{ textAlign: 'center', padding: '15px', color: '#94a3b8', fontSize: '0.8rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>No PDF available.</div>
                                            )}
                                            {activeLesson?.resource_link && (
                                                <div className="resource-item-box" style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '1.2rem' }}>🔗</span>
                                                        <div className="resource-text" style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>External Link</span>
                                                            <a href={activeLesson.resource_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 700, textDecoration: 'none' }}>Visit Resource</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="quiz-container">
                                {showQuizResults ? (
                                    <div className="quiz-results" style={{ textAlign: 'center', padding: '30px', background: 'white', borderRadius: '12px' }}>
                                        <h3>Natiijada Quiz-ka</h3>
                                        <div className="score-display" style={{ fontSize: '3rem', fontWeight: 'bold', color: '#15803d', margin: '20px 0' }}>
                                            {Object.keys(userAnswers).filter(id => {
                                                const q = quizQuestions.find(qq => qq.id === parseInt(id));
                                                return q?.correct_answer === userAnswers[id];
                                            }).length} / {quizQuestions.length}
                                        </div>
                                        <button className="btn-enroll-now" onClick={() => { setShowQuizResults(false); setUserAnswers({}); }}>Mar kale isku day</button>
                                    </div>
                                ) : (
                                    <div className="quiz-questions">
                                        {quizQuestions.map((q, idx) => (
                                            <div key={q.id} className="quiz-question-item" style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '15px' }}>
                                                <h4 style={{ marginBottom: '15px' }}>{idx + 1}. {q.question}</h4>
                                                <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {Array.isArray(q.options) && q.options.map((opt, oIdx) => (
                                                        <label key={oIdx} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px',
                                                            padding: '12px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            background: userAnswers[q.id] === oIdx ? '#f0fdf4' : 'transparent',
                                                            borderColor: userAnswers[q.id] === oIdx ? '#15803d' : '#e2e8f0'
                                                        }}>
                                                            <input
                                                                type="radio"
                                                                name={`q-${q.id}`}
                                                                checked={userAnswers[q.id] === oIdx}
                                                                onChange={() => setUserAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                                            />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            className="btn-enroll-now"
                                            style={{ marginTop: '20px', width: '100%' }}
                                            onClick={() => setShowQuizResults(true)}
                                            disabled={Object.keys(userAnswers).length < quizQuestions.length}
                                        >
                                            Submit Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
