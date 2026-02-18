import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AdminPanel = ({ onBack }) => {
    const [view, setView] = useState('courses'); // 'courses' or 'lessons'
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const [isAddingLesson, setIsAddingLesson] = useState(false);

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

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('courses').insert([courseFormData]);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Course added!');
            setIsAddingCourse(false);
            setCourseFormData({ title: '', description: '', price: 0, pricelabel: 'FREE', type: 'free', image: '', buttontext: 'Daawo Bilaash', youtube_id: '' });
            fetchCourses();
        }
        setLoading(false);
    };

    const handleLessonSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.from('lessons').insert([{ ...lessonFormData, course_id: selectedCourse.id }]);
        if (error) alert('Error: ' + error.message);
        else {
            alert('Lesson added!');
            setIsAddingLesson(false);
            setLessonFormData({ title: '', duration: '', youtube_id: '', pdf_link: '', resource_link: '', order_index: lessons.length + 1 });
            fetchLessons(selectedCourse.id);
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

    const openLessons = (course) => {
        setSelectedCourse(course);
        setView('lessons');
        fetchLessons(course.id);
        setLessonFormData(prev => ({ ...prev, order_index: lessons.length + 1 }));
    };

    return (
        <div className="admin-panel" style={{ padding: '40px 5%', backgroundColor: '#f1f5f9', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: '#1e293b' }}>
                        {view === 'courses' ? 'Admin Dashboard - Courses' : `Lessons: ${selectedCourse?.title}`}
                    </h1>
                    <button onClick={view === 'courses' ? onBack : () => setView('courses')} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                        {view === 'courses' ? '← Back to Site' : '← Back to Courses'}
                    </button>
                </div>
                <button onClick={() => view === 'courses' ? setIsAddingCourse(true) : setIsAddingLesson(true)} style={{ background: '#15803d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    {view === 'courses' ? '+ Add New Course' : '+ Add New Lesson'}
                </button>
            </div>

            {/* Course Form Modal */}
            {isAddingCourse && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3>Add New Course</h3>
                        <form onSubmit={handleCourseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input name="title" placeholder="Course Title" onChange={handleCourseInputChange} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <textarea name="description" placeholder="Description" onChange={handleCourseInputChange} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="price" type="number" placeholder="Price (0 for Free)" onChange={handleCourseInputChange} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="image" placeholder="Image URL" onChange={handleCourseInputChange} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="youtube_id" placeholder="Main Promo YouTube ID" onChange={handleCourseInputChange} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: 1, background: '#15803d', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Save Course</button>
                                <button type="button" onClick={() => setIsAddingCourse(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lesson Form Modal */}
            {isAddingLesson && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%' }}>
                        <h3>Add New Lesson to {selectedCourse.title}</h3>
                        <form onSubmit={handleLessonSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                            <input name="title" placeholder="Lesson Title" onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="youtube_id" placeholder="YouTube Video ID" onChange={(e) => setLessonFormData({ ...lessonFormData, youtube_id: e.target.value })} required style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="duration" placeholder="Duration (e.g. 12:45)" onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="pdf_link" placeholder="PDF Resource Link (Optional)" onChange={(e) => setLessonFormData({ ...lessonFormData, pdf_link: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="resource_link" placeholder="Other Resource Link (Optional)" onChange={(e) => setLessonFormData({ ...lessonFormData, resource_link: e.target.value })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <input name="order_index" type="number" placeholder="Order Index" defaultValue={lessons.length + 1} onChange={(e) => setLessonFormData({ ...lessonFormData, order_index: parseInt(e.target.value) })} style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: 1, background: '#15803d', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Save Lesson</button>
                                <button type="button" onClick={() => setIsAddingLesson(false)} style={{ flex: 1, background: '#e2e8f0', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Tables */}
            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                {view === 'courses' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Course</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ hide: '15px', padding: '15px' }}>
                                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {course.id}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: course.type === 'free' ? '#dcfce7' : '#dbeafe', color: course.type === 'free' ? '#16a34a' : '#2563eb' }}>{course.type.toUpperCase()}</span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <button onClick={() => openLessons(course)} style={{ background: '#1e293b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '8px', cursor: 'pointer' }}>Manage Lessons</button>
                                        <button onClick={() => deleteCourse(course.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>#</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Lesson Title</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>YouTube ID</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map(lesson => (
                                <tr key={lesson.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '15px' }}>{lesson.order_index}</td>
                                    <td style={{ padding: '15px' }}>{lesson.title}</td>
                                    <td style={{ padding: '15px', color: '#64748b' }}>{lesson.youtube_id}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button onClick={() => deleteLesson(lesson.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}>Remove</button>
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
