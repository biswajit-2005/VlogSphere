/**
 * main.js - Home Page Logic for VlogSphere
 * Handles fetching vlogs, search, and category filtering
 */

// API Configuration
const API_BASE_URL = "http://localhost:5000/api";

// DOM Elements
const vlogsContainer = document.getElementById("vlogsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const loadingMessage = document.getElementById("loadingMessage");
const emptyMessage = document.getElementById("emptyMessage");
const errorMessage = document.getElementById("errorMessage");

// State Management
let allVlogs = [];
let filteredVlogs = [];
let userInteractions = {}; // Store user likes/dislikes locally

/**
 * Initialize the application
 */
const init = () => {
  loadUserInteractions();
  fetchVlogs();
  setupEventListeners();
};

/**
 * Setup event listeners for search and filter
 */
const setupEventListeners = () => {
  // Real-time search
  searchInput.addEventListener("input", handleSearch);

  // Category filter
  categoryFilter.addEventListener("change", handleCategoryFilter);
};

/**
 * Fetch vlogs from the backend API
 */
const fetchVlogs = async () => {
  try {
    showLoading();

    const response = await fetch(`${API_BASE_URL}/vlogs`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    allVlogs = data;
    filteredVlogs = allVlogs;

    hideLoading();
    displayVlogs(filteredVlogs);
  } catch (error) {
    console.error("Error fetching vlogs:", error);
    hideLoading();
    showError();
  }
};

/**
 * Display vlogs in the grid
 * @param {Array} vlogs - Array of vlog objects
 */
const displayVlogs = (vlogs) => {
  // Clear existing content
  vlogsContainer.innerHTML = "";

  // Show empty message if no vlogs
  if (vlogs.length === 0) {
    showEmpty();
    return;
  }

  hideEmpty();

  // Create and append vlog cards
  vlogs.forEach((vlog) => {
    const vlogCard = createVlogCard(vlog);
    vlogsContainer.appendChild(vlogCard);
  });
};

/**
 * Create a vlog card element
 * @param {Object} vlog - Vlog object
 * @returns {HTMLElement} - Vlog card element
 */
const createVlogCard = (vlog) => {
  // Create card container
  const card = document.createElement("div");
  card.className = "vlog-card";

  // Format date
  const formattedDate = formatDate(
    vlog.uploadDate || vlog.createdAt || new Date()
  );

  // Truncate description
  const truncatedDescription = truncateText(vlog.description, 120);

  // Get like/dislike counts (default to 0 if not provided)
  const likesCount = vlog.likes || 0;
  const dislikesCount = vlog.dislikes || 0;

  // Check if user has interacted with this vlog
  const userInteraction = userInteractions[vlog._id || vlog.id] || null;

  // Build card HTML
  card.innerHTML = `
        <div class="vlog-video">
            <iframe 
                src="${vlog.videoUrl}" 
                title="${vlog.title}"
                allowfullscreen
                loading="lazy"
            ></iframe>
        </div>
        <div class="vlog-content">
            <span class="vlog-category">${vlog.category}</span>
            <h3 class="vlog-title">${escapeHtml(vlog.title)}</h3>
            <p class="vlog-description">${escapeHtml(truncatedDescription)}</p>
            <div class="vlog-meta">
                <span class="vlog-creator">By ${escapeHtml(
                  vlog.creatorName
                )}</span>
                <span class="vlog-date">${formattedDate}</span>
            </div>
        </div>
        <div class="vlog-actions">
            <button class="action-btn like-btn ${
              userInteraction === "like" ? "active-like" : ""
            }" data-vlog-id="${vlog._id || vlog.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
                <span class="action-count like-count">${likesCount}</span>
            </button>
            <button class="action-btn dislike-btn ${
              userInteraction === "dislike" ? "active-dislike" : ""
            }" data-vlog-id="${vlog._id || vlog.id}">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
                <span class="action-count dislike-count">${dislikesCount}</span>
            </button>
        </div>
    `;

  // Add event listeners for like/dislike buttons
  const likeBtn = card.querySelector(".like-btn");
  const dislikeBtn = card.querySelector(".dislike-btn");

  likeBtn.addEventListener("click", () =>
    handleLike(vlog._id || vlog.id, likeBtn, dislikeBtn)
  );
  dislikeBtn.addEventListener("click", () =>
    handleDislike(vlog._id || vlog.id, likeBtn, dislikeBtn)
  );

  return card;
};

/**
 * Handle search input
 */
const handleSearch = () => {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  // Apply both search and category filter
  filteredVlogs = allVlogs.filter((vlog) => {
    const matchesSearch = vlog.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || vlog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  displayVlogs(filteredVlogs);
};

/**
 * Handle category filter change
 */
const handleCategoryFilter = () => {
  const selectedCategory = categoryFilter.value;
  const searchTerm = searchInput.value.toLowerCase().trim();

  // Apply both search and category filter
  filteredVlogs = allVlogs.filter((vlog) => {
    const matchesSearch =
      searchTerm === "" || vlog.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || vlog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  displayVlogs(filteredVlogs);
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
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

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
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
  emptyMessage.classList.add("hidden");
  errorMessage.classList.add("hidden");
  vlogsContainer.innerHTML = "";
};

/**
 * Hide loading message
 */
const hideLoading = () => {
  loadingMessage.classList.add("hidden");
};

/**
 * Show empty message
 */
const showEmpty = () => {
  emptyMessage.classList.remove("hidden");
  errorMessage.classList.add("hidden");
};

/**
 * Hide empty message
 */
const hideEmpty = () => {
  emptyMessage.classList.add("hidden");
};

/**
 * Show error message
 */
const showError = () => {
  errorMessage.classList.remove("hidden");
  emptyMessage.classList.add("hidden");
};

/**
 * Handle like button click
 * @param {string} vlogId - Vlog ID
 * @param {HTMLElement} likeBtn - Like button element
 * @param {HTMLElement} dislikeBtn - Dislike button element
 */
const handleLike = async (vlogId, likeBtn, dislikeBtn) => {
  const currentInteraction = userInteractions[vlogId];
  const likeCount = likeBtn.querySelector(".like-count");
  const dislikeCount = dislikeBtn.querySelector(".dislike-count");

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

/**
 * Handle dislike button click
 * @param {string} vlogId - Vlog ID
 * @param {HTMLElement} likeBtn - Like button element
 * @param {HTMLElement} dislikeBtn - Dislike button element
 */
const handleDislike = async (vlogId, likeBtn, dislikeBtn) => {
  const currentInteraction = userInteractions[vlogId];
  const likeCount = likeBtn.querySelector(".like-count");
  const dislikeCount = dislikeBtn.querySelector(".dislike-count");

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

/**
 * Update vlog interaction on backend
 * @param {string} vlogId - Vlog ID
 * @param {string} type - 'like' or 'dislike'
 * @param {boolean} isActive - Whether the interaction is active
 */
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
