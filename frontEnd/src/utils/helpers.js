export const formatDate = (date) => {
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return "Today";
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
    } else {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return dateObj.toLocaleDateString("en-US", options);
    }
};

export const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength).trim() + "...";
};
