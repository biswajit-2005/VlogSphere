import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { API_BASE_URL } from '../utils/api';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic Validation
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invalid email or password');
            }

            if (data.token) {
                login(data.token, data.user);
            }

            setSuccess('Login successful! Redirecting...');

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <section className="auth-section">
            <div className="container auth-wrapper">
                <div className="auth-card">
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Login to continue sharing your story</p>

                    {error && (
                        <div className="alert alert-error">
                            <strong>Error:</strong> <span id="errorText">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <strong>Success:</strong> <span id="successText">{success}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <span className="error-message" id="emailError"></span>
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span className="error-message" id="passwordError"></span>
                        </div>

                        <div className="form-checkbox-group" style={{ marginTop: '16px', marginBottom: '24px' }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                name="rememberMe"
                                className="form-checkbox"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                            />
                            <label htmlFor="rememberMe" className="form-checkbox-label">Remember me</label>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block">Login</button>
                    </form>

                    <div className="auth-divider">OR</div>

                    <button id="googleLoginBtn" className="btn btn-google btn-block">
                        Login with Google
                    </button>

                    <div className="auth-footer">
                        Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
