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
    const [imageFile, setImageFile] = useState(null);

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

    // Helper to extract YouTube ID from URL
    const extractYouTubeId = (input) => {
        if (!input) return '';
        const trimmed = input.trim();
        // Regex to match the 11-character video ID
        const regex = /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|watch\?v=|shorts\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/i;
        const match = trimmed.match(regex);
        if (match && match[1]) return match[1];

        // Fallback: if it looks like a raw ID already
        if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) {
            return trimmed;
        }
        return ''; // Return empty if invalid to avoid breaking layout
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

        const { error: uploadError, data } = await supabase.storage
            .from('course-images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

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

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

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
        const cleanedLessonData = {
            ...lessonFormData,
            course_id: selectedCourse.id,
            youtube_id: extractYouTubeId(lessonFormData.youtube_id)
        };
        const { error } = await supabase.from('lessons').insert([cleanedLessonData]);
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
        <div className="admin-panel">
            {/* Header */}
            <div className="admin-header">
                <div className="admin-title-group">
                    <h1>
                        {view === 'courses' ? 'Admin Dashboard - Courses' : `Lessons: ${selectedCourse?.title}`}
                    </h1>
                    <button onClick={view === 'courses' ? onBack : () => setView('courses')} className="btn-admin-back">
                        {view === 'courses' ? '← Back to Site' : '← Back to Courses'}
                    </button>
                </div>
                <button onClick={() => view === 'courses' ? setIsAddingCourse(true) : setIsAddingLesson(true)} className="btn-admin-add">
                    {view === 'courses' ? '+ Add New Course' : '+ Add New Lesson'}
                </button>
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
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    required={!courseFormData.image}
                                />
                                {imageFile && <p className="file-status">Selected: {imageFile.name}</p>}
                            </div>
                            <input name="youtube_id" placeholder="Main Promo YouTube ID" onChange={handleCourseInputChange} />
                            <div className="admin-form-actions">
                                <button type="submit" className="btn-admin-save">Save Course</button>
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
                        <h3>Add New Lesson to {selectedCourse.title}</h3>
                        <form onSubmit={handleLessonSubmit} className="admin-form">
                            <input name="title" placeholder="Lesson Title" onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })} required />
                            <input name="youtube_id" placeholder="YouTube Video ID" onChange={(e) => setLessonFormData({ ...lessonFormData, youtube_id: e.target.value })} required />
                            <input name="duration" placeholder="Duration (e.g. 12:45)" onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })} />
                            <input name="pdf_link" placeholder="PDF Resource Link (Optional)" onChange={(e) => setLessonFormData({ ...lessonFormData, pdf_link: e.target.value })} />
                            <input name="resource_link" placeholder="Other Resource Link (Optional)" onChange={(e) => setLessonFormData({ ...lessonFormData, resource_link: e.target.value })} />
                            <input name="order_index" type="number" placeholder="Order Index" defaultValue={lessons.length + 1} onChange={(e) => setLessonFormData({ ...lessonFormData, order_index: parseInt(e.target.value) })} />
                            <div className="admin-form-actions">
                                <button type="submit" className="btn-admin-save">Save Lesson</button>
                                <button type="button" onClick={() => setIsAddingLesson(false)} className="btn-admin-cancel">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Content Tables */}
            <div className="admin-table-container">
                {view === 'courses' ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.id}>
                                    <td>
                                        <div className="row-title">{course.title}</div>
                                        <div className="row-subtitle">ID: {course.id}</div>
                                    </td>
                                    <td>
                                        <span className={`badge-type ${course.type}`}>{course.type.toUpperCase()}</span>
                                    </td>
                                    <td className="row-actions">
                                        <button onClick={() => openLessons(course)} className="btn-manage">Manage</button>
                                        <button onClick={() => deleteCourse(course.id)} className="btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Lesson Title</th>
                                <th>YouTube ID</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map(lesson => (
                                <tr key={lesson.id}>
                                    <td>{lesson.order_index}</td>
                                    <td>{lesson.title}</td>
                                    <td className="cell-muted">{lesson.youtube_id}</td>
                                    <td className="row-actions">
                                        <button onClick={() => deleteLesson(lesson.id)} className="btn-delete">Remove</button>
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
