import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatDate } from '../utils/helpers';

// const API_BASE_URL = "https://vlogsphere.onrender.com/api";
const API_BASE_URL = "http://localhost:3000/api";

const VlogDetail = () => {
    const { id } = useParams();
    const [vlog, setVlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [userInteractions, setUserInteractions] = useState({});

    useEffect(() => {
        loadUserInteractions();
        if (id) {
            fetchVlogDetail(id);
        }
    }, [id]);

    const loadUserInteractions = () => {
        const saved = localStorage.getItem("vlogSphereInteractions");
        if (saved) {
            try {
                setUserInteractions(JSON.parse(saved));
            } catch (error) {
                console.error("Error loading user interactions:", error);
                setUserInteractions({});
            }
        }
    };

    const saveUserInteractions = (interactions) => {
        try {
            localStorage.setItem("vlogSphereInteractions", JSON.stringify(interactions));
        } catch (error) {
            console.error("Error saving user interactions:", error);
        }
    };

    const fetchVlogDetail = async (vlogId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/vlogs/${vlogId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setVlog(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching vlog detail:", error);
            setError(true);
            setLoading(false);
        }
    };

    const handleLike = async () => {
        if (!vlog) return;
        const vlogId = vlog._id || vlog.id;
        const currentInteraction = userInteractions[vlogId];
        let newInteraction = null;
        let isActive = true;

        if (currentInteraction === 'like') {
            newInteraction = null;
            isActive = false;
        } else {
            newInteraction = 'like';
            isActive = true;
        }

        // Optimistic UI update
        const updatedInteractions = { ...userInteractions, [vlogId]: newInteraction };
        setUserInteractions(updatedInteractions);
        saveUserInteractions(updatedInteractions);

        setVlog(prevVlog => {
            let likes = prevVlog.likes || 0;
            let dislikes = prevVlog.dislikes || 0;

            if (currentInteraction === 'like') {
                likes = Math.max(0, likes - 1);
            } else {
                if (currentInteraction === 'dislike') {
                    dislikes = Math.max(0, dislikes - 1);
                }
                likes++;
            }
            return { ...prevVlog, likes, dislikes };
        });

        try {
            await fetch(`${API_BASE_URL}/vlogs/${vlogId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: isActive }),
            });
        } catch (error) {
            console.error("Error updating interaction:", error);
        }
    };

    const handleDislike = async () => {
        if (!vlog) return;
        const vlogId = vlog._id || vlog.id;
        const currentInteraction = userInteractions[vlogId];
        let newInteraction = null;
        let isActive = true;

        if (currentInteraction === 'dislike') {
            newInteraction = null;
            isActive = false;
        } else {
            newInteraction = 'dislike';
            isActive = true;
        }

        // Optimistic UI update
        const updatedInteractions = { ...userInteractions, [vlogId]: newInteraction };
        setUserInteractions(updatedInteractions);
        saveUserInteractions(updatedInteractions);

        setVlog(prevVlog => {
            let likes = prevVlog.likes || 0;
            let dislikes = prevVlog.dislikes || 0;

            if (currentInteraction === 'dislike') {
                dislikes = Math.max(0, dislikes - 1);
            } else {
                if (currentInteraction === 'like') {
                    likes = Math.max(0, likes - 1);
                }
                dislikes++;
            }
            return { ...prevVlog, likes, dislikes };
        });

        try {
            await fetch(`${API_BASE_URL}/vlogs/${vlogId}/dislike`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: isActive }),
            });
        } catch (error) {
            console.error("Error updating interaction:", error);
        }
    };

    if (loading) return <div className="message">Loading vlog details...</div>;
    if (error || !vlog) return <div className="message error">Unable to load vlog details.</div>;

    const vlogId = vlog._id || vlog.id;
    const userInteraction = userInteractions[vlogId];

    return (
        <section className="vlog-detail-section">
            <div className="container">
                <Link to="/" className="back-link">
                    <ArrowLeft size={20} />
                    Back to Vlogs
                </Link>
                <div className="vlog-detail-wrapper">
                    <div className="detail-video-section">
                        <div className="detail-video">
                            <iframe
                                src={vlog.videoUrl}
                                title={vlog.title}
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                    <div className="detail-content-section">
                        <div className="detail-header">
                            <div className="detail-meta-top">
                                <span className="detail-category">{vlog.category}</span>
                                <span className="detail-date">{formatDate(vlog.uploadDate || vlog.createdAt)}</span>
                            </div>
                            <h2 className="detail-title">{vlog.title}</h2>
                            <div className="detail-creator-info">By {vlog.creatorName}</div>
                        </div>

                        <div className="detail-description-container">
                            <p className="detail-description">{vlog.description}</p>
                        </div>

                        <div className="detail-actions">
                            <button
                                className={`detail-action-btn like-btn ${userInteraction === 'like' ? 'active-like' : ''}`}
                                onClick={handleLike}
                            >
                                <ThumbsUp size={24} />
                                <span className="detail-action-count">{vlog.likes || 0}</span>
                            </button>
                            <button
                                className={`detail-action-btn dislike-btn ${userInteraction === 'dislike' ? 'active-dislike' : ''}`}
                                onClick={handleDislike}
                            >
                                <ThumbsDown size={24} />
                                <span className="detail-action-count">{vlog.dislikes || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VlogDetail;
