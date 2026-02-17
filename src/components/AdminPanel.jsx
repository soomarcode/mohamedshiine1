import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AdminPanel = ({ onBack }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        priceLabel: 'FREE',
        type: 'free',
        image: '',
        buttonText: 'Daawo Bilaash'
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

        if (error) {
            console.error('Error fetching courses:', error);
        } else {
            setCourses(data || []);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : value,
            // Auto-set type based on price
            ...(name === 'price' ? {
                type: parseFloat(value) > 0 ? 'paid' : 'free',
                priceLabel: parseFloat(value) > 0 ? `$${value}` : 'FREE',
                buttonText: parseFloat(value) > 0 ? 'Faahfaahin' : 'Daawo Bilaash'
            } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase
            .from('courses')
            .insert([formData]);

        if (error) {
            alert('Error adding course: ' + error.message);
        } else {
            alert('Course added successfully!');
            setIsAdding(false);
            setFormData({
                title: '',
                description: '',
                price: 0,
                priceLabel: 'FREE',
                type: 'free',
                image: '',
                buttonText: 'Daawo Bilaash'
            });
            fetchCourses();
        }
        setLoading(false);
    };

    const deleteCourse = async (id) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        const { error } = await supabase
            .from('courses')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            fetchCourses();
        }
    };

    return (
        <div className="admin-panel" style={{ padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>Admin Dashboard</h1>
                    <p style={{ color: '#64748b' }}>Manage your courses and content</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={onBack} className="btn-auth btn-login-blue" style={{ backgroundColor: '#64748b' }}>
                        Back to Site
                    </button>
                    <button onClick={() => setIsAdding(!isAdding)} className="btn-auth btn-signup-green">
                        {isAdding ? 'Cancel' : '+ Add New Course'}
                    </button>
                </div>
            </div>

            {isAdding && (
                <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '20px' }}>Add New Course</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 600 }}>Course Title</label>
                            <input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. E-Commerce Bilow" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 600 }}>Price ($0 for Free)</label>
                            <input name="price" type="number" value={formData.price} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start', gridColumn: 'span 2' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 600 }}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}></textarea>
                        </div>
                        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 600 }}>Image URL</label>
                            <input name="image" value={formData.image} onChange={handleInputChange} placeholder="/images/course-name.png" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div className="form-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <label style={{ marginBottom: '8px', fontWeight: 600 }}>Button Text</label>
                            <input name="buttonText" value={formData.buttonText} onChange={handleInputChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <button type="submit" disabled={loading} className="btn-auth btn-signup-green" style={{ gridColumn: 'span 2', padding: '15px' }}>
                            {loading ? 'Processing...' : 'Save Course to Database'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 20px' }}>Course</th>
                            <th style={{ padding: '16px 20px' }}>Type</th>
                            <th style={{ padding: '16px 20px' }}>Price</th>
                            <th style={{ padding: '16px 20px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && !isAdding ? (
                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>Loading courses...</td></tr>
                        ) : courses.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>No courses found in database.</td></tr>
                        ) : (
                            courses.map(course => (
                                <tr key={course.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{course.description.substring(0, 50)}...</div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: course.type === 'free' ? '#dcfce7' : '#dbeafe',
                                            color: course.type === 'free' ? '#16a34a' : '#2563eb'
                                        }}>
                                            {course.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{course.priceLabel}</td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <button
                                            onClick={() => deleteCourse(course.id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
