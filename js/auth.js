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

// Check if user is already logged in and redirect to dashboard
auth.onAuthStateChanged((user) => {
    const isLoginPage = window.location.pathname.includes('index.html') ||
        window.location.pathname.endsWith('/');

    if (user && isLoginPage) {
        // User is logged in and on login page, redirect to dashboard
        window.location.href = 'dashboard.html';
    } else if (!user && !isLoginPage) {
        // User is not logged in and trying to access dashboard, redirect to login
        window.location.href = 'index.html';
    } else if (user && !isLoginPage) {
        // User is logged in and on a dashboard page, update admin info
        updateAdminInfo(user);
    }
});

// Update admin information in the UI
function updateAdminInfo(user) {
    const adminEmail = document.getElementById('adminEmail');
    const adminName = document.getElementById('adminName');

    if (adminEmail && user) {
        adminEmail.textContent = user.email;
    }

    if (adminName && user) {
        // Extract name from email (before @)
        const name = user.email.split('@')[0];
        adminName.textContent = name.charAt(0).toUpperCase() + name.slice(1);
    }
}

// Logout functionality
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.signOut().then(() => {
            // Clear any cached data
            sessionStorage.clear();
            localStorage.removeItem('rememberMe');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        });
    }
}

// Protect dashboard pages - this is called immediately on page load
function protectPage() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged((user) => {
            const isLoginPage = window.location.pathname.includes('index.html') ||
                window.location.pathname.endsWith('/');

            if (!user && !isLoginPage) {
                // Not authenticated and not on login page
                window.location.href = 'index.html';
                reject('Not authenticated');
            } else {
                resolve(user);
            }
        });
    });
}

// Call protectPage on dashboard pages
const isLoginPage = window.location.pathname.includes('index.html') ||
    window.location.pathname.endsWith('/');

if (!isLoginPage) {
    protectPage().catch(() => {
        console.log('Redirecting to login...');
    });
}
