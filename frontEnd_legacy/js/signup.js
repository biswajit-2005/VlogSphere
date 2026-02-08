// Sign Up Form Handler
document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const googleSignupBtn = document.getElementById("googleSignupBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  //const API_BASE_URL = "https://vlogsphere.onrender.com/api";
  const API_BASE_URL = "http://localhost:3000/api";
  // Form validation and submission
  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Clear previous messages
      errorMessage.classList.add("hidden");
      successMessage.classList.add("hidden");

      // Get form values
      const name = document.getElementById("name").value.trim();
      const role = document.getElementById("role").value;
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validation
      let isValid = true;

      // Name validation
      if (name.length < 2) {
        showError("nameError", "Name must be at least 2 characters");
        isValid = false;
      } else {
        clearError("nameError");
      }

      // Role validation
      if (!role) {
        showError("roleError", "Please select a role");
        isValid = false;
      } else {
        clearError("roleError");
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("emailError", "Please enter a valid email address");
        isValid = false;
      } else {
        clearError("emailError");
      }

      // Password validation
      if (password.length < 6) {
        showError("passwordError", "Password must be at least 6 characters");
        isValid = false;
      } else {
        clearError("passwordError");
      }

      // Confirm password validation
      if (password !== confirmPassword) {
        showError("confirmPasswordError", "Passwords do not match");
        isValid = false;
      } else {
        clearError("confirmPasswordError");
      }

      if (!isValid) {
        return;
      }

      // Submit form data
      try {
        const userData = {
          name: name,
          role: role,
          email: email,
          password: password,
        };

        // Send to backend (adjust API endpoint as needed)
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        // const data = await response.json();
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.message || "Failed to create account");
        // }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to create account");
        }

        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Success
        successMessage.classList.remove("hidden");
        signupForm.reset();

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } catch (error) {
        document.getElementById("errorText").textContent =
          error.message || "Something went wrong. Please try again.";
        errorMessage.classList.remove("hidden");
      }
    });
  }

  // Google Sign-Up Handler
  if (googleSignupBtn) {
    googleSignupBtn.addEventListener("click", function () {
      // Initialize Google Sign-In
      google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", // Replace with your Google Client ID
        callback: handleGoogleSignup,
      });

      // Trigger the One Tap UI or redirect to Google login
      google.accounts.id.renderButton(googleSignupBtn, {
        type: "standard",
        size: "large",
        text: "signup_with",
      });
    });
  }

  // Handle Google Sign-Up Response
  function handleGoogleSignup(response) {
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
          .join(""),
      );

      const tokenData = JSON.parse(jsonPayload);

      // Send to backend
      submitGoogleSignup({
        name: tokenData.name,
        email: tokenData.email,
        googleId: tokenData.sub,
      });
    }
  }

  // Submit Google Sign-Up Data to Backend
  async function submitGoogleSignup(userData) {
    try {
      errorMessage.classList.add("hidden");

      const response = await fetch("/api/auth/google-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to create account with Google",
        );
      }

      // Success
      successMessage.classList.remove("hidden");

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      document.getElementById("errorText").textContent =
        error.message || "Failed to sign up with Google. Please try again.";
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
