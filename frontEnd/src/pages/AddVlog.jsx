import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../utils/api';

const AddVlog = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoUrl: '',
        category: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            // localStorage.setItem('redirectAfterLogin', '/add-vlog'); // You can handle this in Login if needed
            navigate('/login');
        }
    }, [navigate]);

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Vlog title is required';
        else if (formData.title.length < 5) newErrors.title = 'Vlog title must be at least 5 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        else if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';

        if (!formData.videoUrl.trim()) newErrors.videoUrl = 'Video URL is required';
        else if (!formData.videoUrl.startsWith('https://')) newErrors.videoUrl = 'Video URL must start with https://';
        else {
            const match = formData.videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
            if (!match || !match[1]) newErrors.videoUrl = 'Please provide a valid YouTube video link';
        }

        if (!formData.category) newErrors.category = 'Please select a category';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for field when user types? optional
    };

    // Internal helper to convert to embed URL
    const getEmbedUrl = (url) => {
        const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/);
        if (match && match[1]) {
            return `https://www.youtube.com/embed/${match[1]}`;
        }
        return url;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');
        setSuccess('');

        if (!validate()) {
            setGeneralError('Please fix the errors above before submitting.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('authToken');
            const vlogData = {
                ...formData,
                videoUrl: getEmbedUrl(formData.videoUrl),
                uploadDate: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vlogData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit vlog');
            }

            setSuccess('Vlog submitted successfully!');
            setFormData({
                title: '',
                description: '',
                videoUrl: '',
                category: ''
            });
            setErrors({});
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setGeneralError(err.message || 'Failed to submit vlog. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="add-vlog-section">
            <div className="container">
                <div className="form-wrapper">
                    <h2 className="form-title">Add New Vlog</h2>
                    <p className="form-description">Share your latest video with the community</p>

                    {success && (
                        <div className="alert alert-success">
                            <strong>Success:</strong> {success}
                        </div>
                    )}

                    {generalError && (
                        <div className="alert alert-error">
                            <strong>Error:</strong> {generalError}
                        </div>
                    )}

                    <form className="vlog-form" onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label htmlFor="vlogTitle" className="form-label">Vlog Title</label>
                            <input
                                type="text"
                                id="vlogTitle"
                                name="title"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter a catchy title"
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Tell us about your vlog..."
                            ></textarea>
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="videoUrl" className="form-label">Video URL (YouTube)</label>
                            <input
                                type="text"
                                id="videoUrl"
                                name="videoUrl"
                                className="form-input"
                                value={formData.videoUrl}
                                onChange={handleChange}
                                placeholder="https://www.youtube.com/watch?v=..."
                            />
                            <span className="form-hint">Paste the full YouTube video link</span>
                            {errors.videoUrl && <span className="error-message">{errors.videoUrl}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="category" className="form-label">Category</label>
                            <select
                                id="category"
                                name="category"
                                className="form-select"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="Travel">Travel</option>
                                <option value="Tech">Tech</option>
                                <option value="Food">Food</option>
                                <option value="Daily">Daily</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Fitness">Fitness</option>
                                <option value="Music">Music</option>
                                <option value="Education">Education</option>
                                <option value="Sports">Sports</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.category && <span className="error-message">{errors.category}</span>}
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Vlog'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate('/')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddVlog;
