import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { formatDate, truncateText } from '../utils/helpers';

const VlogCard = ({ vlog, onLike, onDislike, userInteraction }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/vlog/${vlog._id || vlog.id}`);
    };

    const handleLikeClick = (e) => {
        e.stopPropagation();
        onLike(vlog._id || vlog.id);
    };

    const handleDislikeClick = (e) => {
        e.stopPropagation();
        onDislike(vlog._id || vlog.id);
    };

    const likesCount = vlog.likes || 0;
    const dislikesCount = vlog.dislikes || 0;

    return (
        <div className="vlog-card" onClick={handleCardClick}>
            <div className="vlog-video">
                <iframe
                    src={vlog.videoUrl}
                    title={vlog.title}
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>
            <div className="vlog-content">
                <span className="vlog-category">{vlog.category}</span>
                <h3 className="vlog-title">{vlog.title}</h3>
                <div className="vlog-description-container">
                    <p className="vlog-description">
                        {truncateText(vlog.description, 120)}
                    </p>
                </div>
                <div className="vlog-meta">
                    <span className="vlog-creator">By {vlog.creatorName}</span>
                    <span className="vlog-date">
                        {formatDate(vlog.uploadDate || vlog.createdAt)}
                    </span>
                </div>
            </div>
            <div className="vlog-actions">
                <button
                    className={`action-btn like-btn ${userInteraction === 'like' ? 'active-like' : ''}`}
                    onClick={handleLikeClick}
                >
                    <ThumbsUp size={18} />
                    <span className="action-count like-count">{likesCount}</span>
                </button>
                <button
                    className={`action-btn dislike-btn ${userInteraction === 'dislike' ? 'active-dislike' : ''}`}
                    onClick={handleDislikeClick}
                >
                    <ThumbsDown size={18} />
                    <span className="action-count dislike-count">{dislikesCount}</span>
                </button>
            </div>
        </div>
    );
};

export default VlogCard;
