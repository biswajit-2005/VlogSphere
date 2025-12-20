/**
 * addVlog.js - Add Vlog Page Logic for VlogSphere
 * Handles form validation and submission
 */

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const addVlogForm = document.getElementById('addVlogForm');
const creatorNameInput = document.getElementById('creatorName');
const vlogTitleInput = document.getElementById('vlogTitle');
const descriptionInput = document.getElementById('description');
const videoUrlInput = document.getElementById('videoUrl');
const categorySelect = document.getElementById('category');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Error message elements
const creatorNameError = document.getElementById('creatorNameError');
const vlogTitleError = document.getElementById('vlogTitleError');
const descriptionError = document.getElementById('descriptionError');
const videoUrlError = document.getElementById('videoUrlError');
const categoryError = document.getElementById('categoryError');

/**
 * Initialize the form
 */
const init = () => {
    setupFormValidation();
    addVlogForm.addEventListener('submit', handleSubmit);
};

/**
 * Setup real-time form validation
 */
const setupFormValidation = () => {
    creatorNameInput.addEventListener('blur', () => validateCreatorName());
    vlogTitleInput.addEventListener('blur', () => validateVlogTitle());
    descriptionInput.addEventListener('blur', () => validateDescription());
    videoUrlInput.addEventListener('blur', () => validateVideoUrl());
    categorySelect.addEventListener('change', () => validateCategory());
};

/**
 * Validate creator name
 * @returns {boolean} - Validation result
 */
const validateCreatorName = () => {
    const value = creatorNameInput.value.trim();
    
    if (value === '') {
        showFieldError(creatorNameError, 'Creator name is required');
        return false;
    }
    
    if (value.length < 2) {
        showFieldError(creatorNameError, 'Creator name must be at least 2 characters');
        return false;
    }
    
    hideFieldError(creatorNameError);
    return true;
};

/**
 * Validate vlog title
 * @returns {boolean} - Validation result
 */
const validateVlogTitle = () => {
    const value = vlogTitleInput.value.trim();
    
    if (value === '') {
        showFieldError(vlogTitleError, 'Vlog title is required');
        return false;
    }
    
    if (value.length < 5) {
        showFieldError(vlogTitleError, 'Vlog title must be at least 5 characters');
        return false;
    }
    
    hideFieldError(vlogTitleError);
    return true;
};

/**
 * Validate description
 * @returns {boolean} - Validation result
 */
const validateDescription = () => {
    const value = descriptionInput.value.trim();
    
    if (value === '') {
        showFieldError(descriptionError, 'Description is required');
        return false;
    }
    
    if (value.length < 10) {
        showFieldError(descriptionError, 'Description must be at least 10 characters');
        return false;
    }
    
    hideFieldError(descriptionError);
    return true;
};

/**
 * Validate video URL
 * @returns {boolean} - Validation result
 */
const validateVideoUrl = () => {
    const value = videoUrlInput.value.trim();
    
    if (value === '') {
        showFieldError(videoUrlError, 'Video URL is required');
        return false;
    }
    
    if (!value.startsWith('https://')) {
        showFieldError(videoUrlError, 'Video URL must start with https://');
        return false;
    }
    
    // Validate YouTube embed URL format
    const youtubeEmbedPattern = /^https:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/;
    if (!youtubeEmbedPattern.test(value)) {
        showFieldError(videoUrlError, 'Please provide a valid YouTube embed URL (https://www.youtube.com/embed/...)');
        return false;
    }
    
    hideFieldError(videoUrlError);
    return true;
};

/**
 * Validate category
 * @returns {boolean} - Validation result
 */
const validateCategory = () => {
    const value = categorySelect.value;
    
    if (value === '') {
        showFieldError(categoryError, 'Please select a category');
        return false;
    }
    
    hideFieldError(categoryError);
    return true;
};

/**
 * Show field error
 * @param {HTMLElement} element - Error message element
 * @param {string} message - Error message
 */
const showFieldError = (element, message) => {
    element.textContent = message;
    element.style.display = 'block';
};

/**
 * Hide field error
 * @param {HTMLElement} element - Error message element
 */
const hideFieldError = (element) => {
    element.textContent = '';
    element.style.display = 'none';
};

/**
 * Validate entire form
 * @returns {boolean} - Validation result
 */
const validateForm = () => {
    const isCreatorNameValid = validateCreatorName();
    const isVlogTitleValid = validateVlogTitle();
    const isDescriptionValid = validateDescription();
    const isVideoUrlValid = validateVideoUrl();
    const isCategoryValid = validateCategory();
    
    return isCreatorNameValid && isVlogTitleValid && isDescriptionValid && isVideoUrlValid && isCategoryValid;
};

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hide previous messages
    hideMessages();
    
    // Validate form
    if (!validateForm()) {
        showError('Please fix the errors above before submitting.');
        return;
    }
    
    // Prepare form data
    const vlogData = {
        creatorName: creatorNameInput.value.trim(),
        title: vlogTitleInput.value.trim(),
        description: descriptionInput.value.trim(),
        videoUrl: videoUrlInput.value.trim(),
        category: categorySelect.value,
        uploadDate: new Date().toISOString()
    };
    
    // Submit vlog
    await submitVlog(vlogData);
};

/**
 * Submit vlog to backend API
 * @param {Object} vlogData - Vlog data object
 */
const submitVlog = async (vlogData) => {
    try {
        // Disable submit button
        setSubmitButtonState(true);
        
        const response = await fetch(`${API_BASE_URL}/vlogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(vlogData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit vlog');
        }
        
        const result = await response.json();
        
        // Show success message
        showSuccess();
        
        // Clear form
        clearForm();
        
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Re-enable submit button
        setSubmitButtonState(false);
        
        // Optionally redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting vlog:', error);
        showError(error.message || 'Failed to submit vlog. Please try again.');
        setSubmitButtonState(false);
    }
};

/**
 * Set submit button state
 * @param {boolean} disabled - Whether button should be disabled
 */
const setSubmitButtonState = (disabled) => {
    submitBtn.disabled = disabled;
    submitBtn.textContent = disabled ? 'Submitting...' : 'Submit Vlog';
};

/**
 * Show success message
 */
const showSuccess = () => {
    successMessage.classList.remove('hidden');
    errorMessage.classList.add('hidden');
};

/**
 * Show error message
 * @param {string} message - Error message
 */
const showError = (message) => {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
    successMessage.classList.add('hidden');
};

/**
 * Hide all messages
 */
const hideMessages = () => {
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
};

/**
 * Clear form fields
 */
const clearForm = () => {
    addVlogForm.reset();
    
    // Clear all error messages
    hideFieldError(creatorNameError);
    hideFieldError(vlogTitleError);
    hideFieldError(descriptionError);
    hideFieldError(videoUrlError);
    hideFieldError(categoryError);
};

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', init);
