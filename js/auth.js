// Authentication logic for Spartans X Account Analytics Dashboard

// Global variable for password hash
let AUTH_CONFIG = null;

// Load authentication configuration
async function loadAuthConfig() {
    try {
        const response = await fetch('./auth-hash.json');
        if (response.ok) {
            AUTH_CONFIG = await response.json();
        } else {
            // Fallback for local development
            AUTH_CONFIG = {
                password: '7a5f202b5352d5503125bef209a462fe60950ecdc8bc9df2e3b506fe44beca93' // fallback hash
            };
        }
    } catch (error) {
        // Fallback for local development
        AUTH_CONFIG = {
            password: '7a5f202b5352d5503125bef209a462fe60950ecdc8bc9df2e3b506fe44beca93' // fallback hash
        };
    }
    return AUTH_CONFIG;
}

// SHA-256 hashing function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Check if user is already authenticated
function checkAuth() {
    const authData = sessionStorage.getItem('auth');
    if (authData) {
        const auth = JSON.parse(authData);
        if (auth.authenticated && auth.timestamp > Date.now() - 3600000) { // 1 hour session
            return auth;
        }
    }
    return null;
}

// Redirect to dashboard if already authenticated
if (window.location.pathname.endsWith('/') || window.location.pathname.includes('index.html')) {
    const auth = checkAuth();
    if (auth) {
        window.location.href = 'main.html';
    }
}

// Handle login form submission
document.addEventListener('DOMContentLoaded', async function() {
    // Load auth config on page load
    await loadAuthConfig();

    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
            passwordInput.classList.remove('error');

            // Get password and hash it
            const password = passwordInput.value;
            const hashedPassword = await sha256(password);

            // Ensure auth config is loaded
            if (!AUTH_CONFIG) {
                await loadAuthConfig();
            }

            // Check against stored hash
            let authenticated = false;

            if (hashedPassword === AUTH_CONFIG.password) {
                authenticated = true;
            }

            if (authenticated) {
                // Store authentication in session
                const authData = {
                    authenticated: true,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('auth', JSON.stringify(authData));

                // Add success animation
                loginForm.classList.add('success');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'main.html';
                }, 500);
            } else {
                // Show error
                errorMessage.textContent = 'Invalid password. Please try again.';
                errorMessage.classList.add('show');
                passwordInput.classList.add('error');

                // Shake animation
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            }
        });

        // Clear error on input
        passwordInput.addEventListener('input', function() {
            errorMessage.classList.remove('show');
            passwordInput.classList.remove('error');
        });
    }
});

// Logout function
function logout() {
    sessionStorage.removeItem('auth');
    window.location.href = 'login.html';
}

// Export functions for use in dashboard
if (typeof window !== 'undefined') {
    window.authUtils = {
        checkAuth,
        logout,
        sha256
    };
}