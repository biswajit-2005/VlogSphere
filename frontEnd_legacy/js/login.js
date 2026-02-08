// Login Form Handler
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const googleLoginBtn = document.getElementById("googleLoginBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  //const API_BASE_URL = "https://vlogsphere.onrender.com/api";
  const API_BASE_URL = "http://localhost:3000/api";
  // Form validation and submission
  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous messages
      errorMessage.classList.add("hidden");
      successMessage.classList.add("hidden");

      // Get form values
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const rememberMe = document.getElementById("rememberMe").checked;

      // Validation
      let isValid = true;

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("emailError", "Please enter a valid email address");
        isValid = false;
      } else {
        clearError("emailError");
      }

      // Password validation
      if (password.length === 0) {
        showError("passwordError", "Password is required");
        isValid = false;
      } else {
        clearError("passwordError");
      }

      if (!isValid) {
        return;
      }

      // Submit form data
      try {
        const userData = {
          email: email,
          password: password,
          rememberMe: rememberMe,
        };

        // Send to backend (adjust API endpoint as needed)
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Invalid email or password");
        }

        const data = await response.json();

        // Store token if provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // Success
        successMessage.classList.remove("hidden");
        loginForm.reset();

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } catch (error) {
        document.getElementById("errorText").textContent =
          error.message || "Something went wrong. Please try again.";
        errorMessage.classList.remove("hidden");
      }
    });
  }

  // Google Login Handler
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function () {
      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
        callback: handleGoogleLogin,
      });

      // Trigger the One Tap UI or redirect to Google login
      google.accounts.id.renderButton(googleLoginBtn, {
        type: "standard",
        size: "large",
        text: "signin_with",
      });
    });
  }

  // Handle Google Login Response
  function handleGoogleLogin(response) {
    if (response.credential) {
      // Decode the JWT token to get user info
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const tokenData = JSON.parse(jsonPayload);

      // Send to backend
      submitGoogleLogin({
        email: tokenData.email,
        googleId: tokenData.sub,
        name: tokenData.name,
      });
    }
  }

  // Submit Google Login Data to Backend
  async function submitGoogleLogin(userData) {
    try {
      errorMessage.classList.add("hidden");

      const response = await fetch("/api/auth/google-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to log in with Google");
      }

      const data = await response.json();

      // Store token if provided
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      // Success
      successMessage.classList.remove("hidden");

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      document.getElementById("errorText").textContent =
        error.message || "Failed to log in with Google. Please try again.";
      errorMessage.classList.remove("hidden");
    }
  }

  // Helper functions
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = "";
    }
  }
});
