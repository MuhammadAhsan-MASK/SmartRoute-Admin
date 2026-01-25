// Authentication functionality

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const loginBtn = document.querySelector('.btn-login');

    // Show loading state
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    loginBtn.disabled = true;
    errorMessage.style.display = 'none';

    try {
        // Sign in with Firebase
        await auth.signInWithEmailAndPassword(email, password);

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error) {
        // Show error message
        errorMessage.textContent = getErrorMessage(error.code);
        errorMessage.style.display = 'block';

        // Reset button state
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        loginBtn.disabled = false;
    }
});

// Get user-friendly error messages
function getErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
});

// Logout functionality
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Protect dashboard pages
function protectPage() {
    auth.onAuthStateChanged((user) => {
        if (!user && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    });
}

// Call protectPage on dashboard pages
if (!window.location.pathname.includes('index.html')) {
    protectPage();
}
