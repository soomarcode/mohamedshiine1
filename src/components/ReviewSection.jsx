import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const ReviewSection = ({ courseId, user }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('course_reviews')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        setError(null);
        setSuccess(false);

        const reviewData = {
            course_id: courseId,
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
            user_avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email?.split('@')[0]}&background=15803d&color=fff`,
            rating,
            comment
        };

        const { error: submitError } = await supabase
            .from('course_reviews')
            .insert([reviewData]);

        if (submitError) {
            setError('Error submitting review. Please try again.');
            console.error('Submit review error:', submitError);
        } else {
            setSuccess(true);
            setComment('');
            setRating(5);
            fetchReviews();
        }
        setSubmitting(false);
    };

    const renderStars = (count, interactive = false) => {
        return (
            <div className="star-rating" style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <span
                        key={s}
                        onClick={() => interactive && setRating(s)}
                        style={{
                            cursor: interactive ? 'pointer' : 'default',
                            fontSize: interactive ? '24px' : '16px',
                            color: s <= count ? '#fbbf24' : '#e2e8f0',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="reviews-container" style={{ color: '#1a2332' }}>
            <div className="reviews-header" style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 10px 0' }}>Student Reviews</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#15803d' }}>
                        {reviews.length > 0
                            ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
                            : '0.0'
                        }
                    </div>
                    <div>
                        {renderStars(reviews.length > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length) : 0)}
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Based on {reviews.length} reviews</div>
                    </div>
                </div>
            </div>

            {user && (
                <div className="review-form-card" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '40px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Write a Review</h4>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Rating</label>
                            {renderStars(rating, true)}
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Comment</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this course..."
                                required
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.9rem',
                                    resize: 'vertical',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#15803d'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                        </div>
                        {error && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</div>}
                        {success && <div style={{ color: '#10b981', fontSize: '0.85rem', marginBottom: '15px' }}>Review submitted successfully!</div>}
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: '#15803d',
                                color: 'white',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                fontWeight: 700,
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                opacity: submitting ? 0.7 : 1,
                                width: '100%',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseOver={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 4px 12px rgba(21, 128, 61, 0.25)')}
                            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = 'none')}
                        >
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            )}

            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0', color: '#64748b' }}>
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-item" style={{
                            padding: '20px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            gap: '16px'
                        }}>
                            <img
                                src={review.user_avatar}
                                alt={review.user_name}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{review.user_name}</h5>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '8px' }}>
                                    {renderStars(review.rating)}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
