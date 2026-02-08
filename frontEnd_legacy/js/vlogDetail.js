/**
 * vlogDetail.js - Vlog Detail Page Logic
 * Handles loading and displaying full vlog details with scrollable content
 */

// API Configuration
//const API_BASE_URL = "https://vlogsphere.onrender.com/api";
const API_BASE_URL = "http://localhost:3000/api";

// DOM Elements
const detailVideoFrame = document.getElementById("detailVideoFrame");
const detailTitle = document.getElementById("detailTitle");
const detailCategory = document.getElementById("detailCategory");
const detailDate = document.getElementById("detailDate");
const detailCreator = document.getElementById("detailCreator");
const detailDescription = document.getElementById("detailDescription");
const detailLikeBtn = document.getElementById("detailLikeBtn");
const detailDislikeBtn = document.getElementById("detailDislikeBtn");
const detailLikeCount = document.getElementById("detailLikeCount");
const detailDislikeCount = document.getElementById("detailDislikeCount");
const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");
const vlogDetailContainer = document.getElementById("vlogDetailContainer");

// State Management
let currentVlog = null;
let userInteractions = {}; // Store user likes/dislikes locally

const init = () => {
  loadUserInteractions();
  const vlogId = getVlogIdFromURL();

  if (!vlogId) {
    showError();
    return;
  }

  fetchVlogDetail(vlogId);
  setupEventListeners();
};

const setupEventListeners = () => {
  detailLikeBtn.addEventListener("click", () =>
    handleLike(
      currentVlog._id || currentVlog.id,
      detailLikeBtn,
      detailDislikeBtn
    )
  );
  detailDislikeBtn.addEventListener("click", () =>
    handleDislike(
      currentVlog._id || currentVlog.id,
      detailLikeBtn,
      detailDislikeBtn
    )
  );
};

/**
 * Get vlog ID from URL parameters
 * @returns {string|null} - Vlog ID or null
 */
const getVlogIdFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

/**
 * Fetch vlog details from API
 * @param {string} vlogId - The ID of the vlog to fetch
 */
const fetchVlogDetail = async (vlogId) => {
  try {
    showLoading();

    const response = await fetch(`${API_BASE_URL}/vlogs/${vlogId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const vlog = await response.json();
    currentVlog = vlog;

    hideLoading();
    displayVlogDetail(vlog);
  } catch (error) {
    console.error("Error fetching vlog detail:", error);
    hideLoading();
    showError();
  }
};

/**
 * Display vlog details on the page
 * @param {Object} vlog - Vlog object
 */
const displayVlogDetail = (vlog) => {
  // Populate video
  detailVideoFrame.src = vlog.videoUrl;

  // Populate title
  detailTitle.textContent = vlog.title;

  // Populate category
  detailCategory.textContent = vlog.category;

  // Populate date
  const formattedDate = formatDate(
    vlog.uploadDate || vlog.createdAt || new Date()
  );
  detailDate.textContent = formattedDate;

  // Populate creator
  detailCreator.textContent = `By ${escapeHtml(vlog.creatorName)}`;

  // Populate full description (not truncated)
  detailDescription.textContent = vlog.description;

  // Get like/dislike counts
  const likesCount = vlog.likes || 0;
  const dislikesCount = vlog.dislikes || 0;

  detailLikeCount.textContent = likesCount;
  detailDislikeCount.textContent = dislikesCount;

  // Check if user has interacted with this vlog
  const vlogId = vlog._id || vlog.id;
  const userInteraction = userInteractions[vlogId] || null;

  // Apply active states if user has interacted
  if (userInteraction === "like") {
    detailLikeBtn.classList.add("active-like");
  } else if (userInteraction === "dislike") {
    detailDislikeBtn.classList.add("active-dislike");
  }

  // Show the container
  vlogDetailContainer.classList.remove("hidden");
};

const formatDate = (date) => {
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

const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Show loading message
 */
const showLoading = () => {
  loadingMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
  vlogDetailContainer.classList.add("hidden");
};

/**
 * Hide loading message
 */
const hideLoading = () => {
  loadingMessage.classList.add("hidden");
};

const showError = () => {
  errorMessage.classList.remove("hidden");
  loadingMessage.classList.add("hidden");
  vlogDetailContainer.classList.add("hidden");
};

const handleLike = async (vlogId, likeBtn, dislikeBtn) => {
  const currentInteraction = userInteractions[vlogId];
  const likeCount = detailLikeCount;
  const dislikeCount = detailDislikeCount;

  let newLikeCount = parseInt(likeCount.textContent);
  let newDislikeCount = parseInt(dislikeCount.textContent);

  if (currentInteraction === "like") {
    // User is removing their like
    newLikeCount--;
    userInteractions[vlogId] = null;
    likeBtn.classList.remove("active-like");
  } else {
    // User is adding a like
    if (currentInteraction === "dislike") {
      // Remove dislike first
      newDislikeCount--;
      dislikeBtn.classList.remove("active-dislike");
    }
    newLikeCount++;
    userInteractions[vlogId] = "like";
    likeBtn.classList.add("active-like");
  }

  // Update UI
  likeCount.textContent = newLikeCount;
  dislikeCount.textContent = newDislikeCount;

  // Save to localStorage
  saveUserInteractions();

  // Send to backend
  await updateVlogInteraction(
    vlogId,
    "like",
    userInteractions[vlogId] === "like"
  );
};

const handleDislike = async (vlogId, likeBtn, dislikeBtn) => {
  const currentInteraction = userInteractions[vlogId];
  const likeCount = detailLikeCount;
  const dislikeCount = detailDislikeCount;

  let newLikeCount = parseInt(likeCount.textContent);
  let newDislikeCount = parseInt(dislikeCount.textContent);

  if (currentInteraction === "dislike") {
    // User is removing their dislike
    newDislikeCount--;
    userInteractions[vlogId] = null;
    dislikeBtn.classList.remove("active-dislike");
  } else {
    // User is adding a dislike
    if (currentInteraction === "like") {
      // Remove like first
      newLikeCount--;
      likeBtn.classList.remove("active-like");
    }
    newDislikeCount++;
    userInteractions[vlogId] = "dislike";
    dislikeBtn.classList.add("active-dislike");
  }

  // Update UI
  likeCount.textContent = newLikeCount;
  dislikeCount.textContent = newDislikeCount;

  // Save to localStorage
  saveUserInteractions();

  // Send to backend
  await updateVlogInteraction(
    vlogId,
    "dislike",
    userInteractions[vlogId] === "dislike"
  );
};

const updateVlogInteraction = async (vlogId, type, isActive) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vlogs/${vlogId}/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ active: isActive }),
    });

    if (!response.ok) {
      console.warn("Failed to update interaction on server");
    }
  } catch (error) {
    console.error("Error updating interaction:", error);
    // Continue anyway - localStorage keeps track locally
  }
};

/**
 * Load user interactions from localStorage
 */
const loadUserInteractions = () => {
  const saved = localStorage.getItem("vlogSphereInteractions");
  if (saved) {
    try {
      userInteractions = JSON.parse(saved);
    } catch (error) {
      console.error("Error loading user interactions:", error);
      userInteractions = {};
    }
  }
};

/**
 * Save user interactions to localStorage
 */
const saveUserInteractions = () => {
  try {
    localStorage.setItem(
      "vlogSphereInteractions",
      JSON.stringify(userInteractions)
    );
  } catch (error) {
    console.error("Error saving user interactions:", error);
  }
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init);
