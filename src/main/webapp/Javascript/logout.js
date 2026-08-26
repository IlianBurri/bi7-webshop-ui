document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

async function updateNavigation() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (authButtonsContainer) {
        const username = localStorage.getItem('username');
        if (username) {
            renderLoggedInButtons(authButtonsContainer);
        } else {
            renderLoggedOutButtons(authButtonsContainer);
        }
    } else {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

function renderLoggedInButtons(container) {

    container.innerHTML = `
        <button id="logoutBtn" class="btn btn-outline-light">Abmelden</button>
    `;
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function renderLoggedOutButtons(container) {
    container.innerHTML = `
        <a href="../HTML/registerForm.html" class="btn btn-outline-light">Registrieren</a>
        <a href="../HTML/loginForm.html" class="btn btn-light text-primary">Login</a>
    `;
}

async function handleLogout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');

    const adminButtonContainer = document.getElementById('adminButtonContainer');
    if (adminButtonContainer) {
        adminButtonContainer.innerHTML = ``;
    }

    try {
        await fetch('http://localhost:7070/users/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (err) {
    }

    (window.redirectTo || ((url) => {
        window.location.href = url;
    }))('landingpage.html');
}
