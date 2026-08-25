document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

async function updateNavigation() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (authButtonsContainer) {
        const username = localStorage.getItem('username');
        if (username) {
            await syncAdminStatus();
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
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    const adminButton = isAdmin
        ? `<a href="../HTML/adminHub.html" class="btn btn-outline-light">
               <i class="bi bi-gear"></i> Admin Bereich
           </a>`
        : '';

    container.innerHTML = `
        ${adminButton}
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

async function syncAdminStatus() {
    try {
        const res = await fetch(`${API_BASE}/users/me`, {
            credentials: 'include'
        });

        if (res.ok) {
            const user = await res.json();
            localStorage.setItem('isAdmin', user.isAdmin === true);
        } else if (res.status === 401) {
            localStorage.setItem('isAdmin', false);
        }
    } catch (err) {
        console.warn('Admin-Status konnte nicht vom Backend geladen werden:', err);
    }
}

async function handleLogout() {
    localStorage.removeItem('username');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');

    try {
        await fetch('http://localhost:7070/users/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (err) {
    }

    window.location.href = 'landingpage.html';
}
