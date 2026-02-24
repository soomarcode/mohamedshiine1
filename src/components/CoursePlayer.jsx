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
    const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'quiz'

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
                        <span>Courses</span> / <span>{course.title}</span> / <span className="current">{activeLesson?.title || 'Cashar lama helin'}</span>
                    </div>

                    <div className="video-wrapper">
                        <span className="badge-free">{course.type === 'free' ? 'FREE' : 'PAID'}</span>
                        {activeLesson ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${extractYouTubeId(activeLesson.youtube_id)}?rel=0&modestbranding=1`}
                                title={activeLesson.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                style={{ border: 'none', borderRadius: '12px' }}
                            ></iframe>
                        ) : (
                            <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#000', borderRadius: '12px' }}>
                                Video looma helin casharkaan
                            </div>
                        )}
                    </div>

                    <div className="player-tabs">
                        <button
                            className={`player-tab ${activeTab === 'lessons' ? 'active' : ''}`}
                            onClick={() => setActiveTab('lessons')}
                        >
                            Lessons
                        </button>
                        {quizQuestions.length > 0 && (
                            <button
                                className={`player-tab ${activeTab === 'quiz' ? 'active' : ''}`}
                                onClick={() => setActiveTab('quiz')}
                            >
                                Quiz
                            </button>
                        )}
                    </div>

                    <div className="tab-content" style={{ marginTop: '20px' }}>
                        {activeTab === 'lessons' ? (
                            <>
                                <h2>{activeLesson?.title || 'No active lesson'}</h2>
                                <p className="enrollment-status" style={{ marginBottom: '20px', color: '#64748b' }}>
                                    {isPreviewMode
                                        ? 'Waxaad hadda ku jirtaa Preview mode. Is qor si aad u hesho koorsada oo dhan.'
                                        : 'Waxaad hadda si rasmi ah ugu qoran tahay course-kan.'}
                                </p>

                                <div className="lesson-actions">
                                    {isPreviewMode ? (
                                        <button className="btn-enroll-now" onClick={onEnroll}>
                                            Enroll Now (${course.price})
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                className={`btn-mark-complete ${completedLessons.includes(activeLesson?.id) ? 'completed' : ''}`}
                                                onClick={handleMarkComplete}
                                                disabled={!activeLesson || completedLessons.includes(activeLesson?.id)}
                                            >
                                                <span>{completedLessons.includes(activeLesson?.id) ? '✔ Completed' : '✔ Mark Complete'}</span>
                                            </button>
                                            <button
                                                className="btn-next-lesson"
                                                onClick={handleNextLesson}
                                                disabled={!activeLesson || lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                                            >
                                                <span>🎥 Casharka {(lessons.findIndex(l => l.id === activeLesson?.id) + 2)}aad</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
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
                                    <div className="progress-bar-fill" style={{ width: `${currentProgress}%` }}></div>
                                </div>
                                <span className="progress-status">{currentProgress}% COMPLETE</span>
                            </div>
                        </div>
                        <ul className="lesson-list">
                            {lessons.map((lesson, index) => {
                                const isActive = activeLesson?.id === lesson.id;
                                const isCompleted = completedLessons.includes(lesson.id);
                                const isLocked = isPreviewMode && index > 0; // Only first lesson unlocked in preview

                                return (
                                    <li
                                        key={lesson.id}
                                        className={`lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'is-completed' : ''} ${isLocked ? 'locked' : ''}`}
                                        onClick={() => isLocked ? onEnroll() : setActiveLesson(lesson)}
                                    >
                                        <span className="lesson-status">
                                            {isCompleted ? '✔' : (isActive ? '▶' : (isLocked ? '🔒' : (index + 1)))}
                                        </span>
                                        <div className="lesson-info-row">
                                            <span className="lesson-title-text">{lesson.title}</span>
                                            <span className="lesson-duration">{lesson.duration || '0:00'}</span>
                                        </div>
                                    </li>
                                );
                            })}
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
