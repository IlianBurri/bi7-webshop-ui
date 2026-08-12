document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

function updateNavigation() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;

    const username = localStorage.getItem('username');
    if (username) {
        renderLoggedInButtons(authButtonsContainer);
    } else {
        renderLoggedOutButtons(authButtonsContainer);
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

    try {
        await fetch('http://localhost:7070/users/logout', {
            method: 'POST'
        });
    } catch (err) {
        // Backend nicht erreichbar – trotzdem lokal abmelden
    }

    window.location.href = 'landingpage.html';
}
