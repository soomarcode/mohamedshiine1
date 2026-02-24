import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AdminPanel = ({ onBack }) => {
    const [view, setView] = useState('courses'); // 'courses', 'lessons', or 'quizzes'
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [isAddingQuiz, setIsAddingQuiz] = useState(false);

    // Course Form state
    const [courseFormData, setCourseFormData] = useState({
        title: '',
        description: '',
        price: 0,
        pricelabel: 'FREE',
        type: 'free',
        image: '',
        buttontext: 'Daawo Bilaash',
        youtube_id: 'dQw4w9WgXcQ'
    });

    // Lesson Form state
    const [lessonFormData, setLessonFormData] = useState({
        title: '',
        duration: '',
        youtube_id: '',
        pdf_link: '',
        resource_link: '',
        order_index: 0
    });

    // Quiz Question Form state
    const [quizFormData, setQuizFormData] = useState({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0
    });

    // Helper to extract YouTube ID from URL
    const extractYouTubeId = (input) => {
        if (!input) return '';
        const trimmed = input.trim();
        const regex = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|watch\?v=|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
        const match = trimmed.match(regex);
        if (match && match[1]) return match[1];
        if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) {
            return trimmed;
        }
        return '';
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('id', { ascending: true });

        if (error) console.error('Error fetching courses:', error);
        else setCourses(data || []);
        setLoading(false);
    };

    const fetchLessons = async (courseId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) console.error('Error fetching lessons:', error);
        else setLessons(data || []);
        setLoading(false);
    };

    const fetchQuiz = async (courseId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('quizzes')
            .select('*')
            .eq('course_id', courseId)
            .order('id', { ascending: true });

        if (error) console.error('Error fetching quiz:', error);
        else setQuizQuestions(data || []);
        setLoading(false);
    };

    const handleCourseInputChange = (e) => {
        const { name, value } = e.target;
        setCourseFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
            ...(name === 'price' ? {
                type: parseFloat(value) > 0 ? 'paid' : 'free',
                pricelabel: parseFloat(value) > 0 ? `$${value}` : 'FREE',
                buttontext: parseFloat(value) > 0 ? 'Faahfaahin' : 'Daawo Bilaash'
            } : {})
        }));
    };

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
            .from('course-images')
            .upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
            .from('course-images')
            .getPublicUrl(filePath);
        return publicUrl;
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = courseFormData.image;
            if (imageFile) imageUrl = await uploadImage(imageFile);
            const { error } = await supabase.from('courses').insert([{
                ...courseFormData,
                image: imageUrl,
                youtube_id: extractYouTubeId(courseFormData.youtube_id)
            }]);
            if (error) throw error;
            alert('Course added!');
            setIsAddingCourse(false);
            setCourseFormData({ title: '', description: '', price: 0, pricelabel: 'FREE', type: 'free', image: '', buttontext: 'Daawo Bilaash', youtube_id: 'dQw4w9WgXcQ' });
            setImageFile(null);
            fetchCourses();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('lessons').insert([{
            ...lessonFormData,
            course_id: selectedCourse.id,
            youtube_id: extractYouTubeId(lessonFormData.youtube_id)
        }]);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Lesson added!');
            setIsAddingLesson(false);
            setLessonFormData({ title: '', duration: '', youtube_id: '', pdf_link: '', resource_link: '', order_index: lessons.length + 1 });
            fetchLessons(selectedCourse.id);
        }
        setLoading(false);
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('quizzes').insert([{
            course_id: selectedCourse.id,
            question: quizFormData.question,
            options: quizFormData.options,
            correct_answer: quizFormData.correct_answer
        }]);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Question added!');
            setQuizFormData({ question: '', options: ['', '', '', ''], correct_answer: 0 });
            fetchQuiz(selectedCourse.id);
        }
        setLoading(false);
    };

    const deleteCourse = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else fetchCourses();
    };

    const deleteLesson = async (id) => {
        if (!window.confirm('Delete this lesson?')) return;
        const { error } = await supabase.from('lessons').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else fetchLessons(selectedCourse.id);
    };

    const deleteQuizQuestion = async (id) => {
        if (!window.confirm('Delete this question?')) return;
        const { error } = await supabase.from('quizzes').delete().eq('id', id);
        if (error) alert('Error: ' + error.message);
        else fetchQuiz(selectedCourse.id);
    };

    const openLessons = (course) => {
        setSelectedCourse(course);
        setView('lessons');
        fetchLessons(course.id);
    };

    const openQuiz = (course) => {
        setSelectedCourse(course);
        setView('quizzes');
        fetchQuiz(course.id);
    };

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <div className="admin-title-group">
                    <h1>
                        {view === 'courses' ? 'Admin Dashboard - Courses' :
                            view === 'lessons' ? `Lessons: ${selectedCourse?.title}` :
                                `Quiz: ${selectedCourse?.title}`}
                    </h1>
                    <button onClick={view === 'courses' ? onBack : () => setView('courses')} className="btn-admin-back">
                        {view === 'courses' ? '← Back to Site' : '← Back to Courses'}
                    </button>
                </div>
                {view === 'courses' ? (
                    <button onClick={() => setIsAddingCourse(true)} className="btn-admin-add">+ Add Course</button>
                ) : view === 'lessons' ? (
                    <button onClick={() => setIsAddingLesson(true)} className="btn-admin-add">+ Add Lesson</button>
                ) : (
                    <button onClick={() => setIsAddingQuiz(true)} className="btn-admin-add">+ Add Question</button>
                )}
            </div>

            {/* Course Form Modal */}
            {isAddingCourse && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>Add New Course</h3>
                        <form onSubmit={handleCourseSubmit} className="admin-form">
                            <input name="title" placeholder="Course Title" onChange={handleCourseInputChange} required />
                            <textarea name="description" placeholder="Description" onChange={handleCourseInputChange} required />
                            <input name="price" type="number" placeholder="Price (0 for Free)" onChange={handleCourseInputChange} required />
                            <div className="admin-form-group">
                                <label>Course Thumbnail</label>
                                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!courseFormData.image} />
                            </div>
                            <input name="youtube_id" placeholder="Promo YouTube ID" onChange={handleCourseInputChange} />
                            <div className="admin-form-actions">
                                <button type="submit" className="btn-admin-save">Save</button>
                                <button type="button" onClick={() => setIsAddingCourse(false)} className="btn-admin-cancel">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Form Modal */}
            {isAddingLesson && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>Add Lesson to {selectedCourse.title}</h3>
                        <form onSubmit={handleLessonSubmit} className="admin-form">
                            <input placeholder="Title" onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })} required />
                            <input placeholder="YouTube ID" onChange={(e) => setLessonFormData({ ...lessonFormData, youtube_id: e.target.value })} required />
                            <input placeholder="Duration" onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })} />
                            <div className="admin-form-actions">
                                <button type="submit" className="btn-admin-save">Save</button>
                                <button type="button" onClick={() => setIsAddingLesson(false)} className="btn-admin-cancel">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quiz Form Modal */}
            {isAddingQuiz && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h3>Add Quiz Question</h3>
                        <form onSubmit={handleQuizSubmit} className="admin-form">
                            <textarea placeholder="Question" value={quizFormData.question} onChange={(e) => setQuizFormData({ ...quizFormData, question: e.target.value })} required />
                            {quizFormData.options.map((opt, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                                    <input type="radio" checked={quizFormData.correct_answer === idx} onChange={() => setQuizFormData({ ...quizFormData, correct_answer: idx })} />
                                    <input placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => {
                                        const newOpts = [...quizFormData.options];
                                        newOpts[idx] = e.target.value;
                                        setQuizFormData({ ...quizFormData, options: newOpts });
                                    }} required style={{ flex: 1 }} />
                                </div>
                            ))}
                            <div className="admin-form-actions">
                                <button type="submit" className="btn-admin-save">Save</button>
                                <button type="button" onClick={() => setIsAddingQuiz(false)} className="btn-admin-cancel">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="admin-table-container">
                {view === 'courses' ? (
                    <table>
                        <thead>
                            <tr><th>Course</th><th>Type</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td>{course.title}</td>
                                    <td>{course.type.toUpperCase()}</td>
                                    <td className="row-actions">
                                        <button onClick={() => openLessons(course)} className="btn-manage">Lessons</button>
                                        <button onClick={() => openQuiz(course)} className="btn-manage" style={{ background: '#ca8a04' }}>Quiz</button>
                                        <button onClick={() => deleteCourse(course.id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : view === 'lessons' ? (
                    <table>
                        <thead>
                            <tr><th>#</th><th>Title</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {lessons.map(lesson => (
                                <tr key={lesson.id}>
                                    <td>{lesson.order_index}</td>
                                    <td>{lesson.title}</td>
                                    <td className="row-actions">
                                        <button onClick={() => deleteLesson(lesson.id)} className="btn-delete">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table>
                        <thead>
                            <tr><th>Question</th><th>Correct</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {quizQuestions.map(q => (
                                <tr key={q.id}>
                                    <td>{q.question}</td>
                                    <td>{q.correct_answer + 1}</td>
                                    <td className="row-actions">
                                        <button onClick={() => deleteQuizQuestion(q.id)} className="btn-delete">Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
