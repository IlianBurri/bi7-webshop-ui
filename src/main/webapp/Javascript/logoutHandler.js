document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

async function updateNavigation() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;

    try {
        const res = await fetch('http://localhost:7070/users/me', {
            method: 'GET',
            credentials: 'include'
        });

        if (res.ok) {
            authButtonsContainer.innerHTML = `
                <button id="logoutBtn" class="btn btn-outline-light">Abmelden</button>  
            `;
            document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        } else {
            renderLoggedOutButtons(authButtonsContainer);
        }
    } catch (err) {
        renderLoggedOutButtons(authButtonsContainer);
    }
}

function renderLoggedOutButtons(container) {
    container.innerHTML = `
        <a href="../HTML/registerForm.html" class="btn btn-outline-light">Registrieren</a>
        <a href="../HTML/loginForm.html" class="btn btn-light text-primary">Login</a>
    `;
}

async function handleLogout() {
    try {
        await fetch('http://localhost:7070/users/logout', {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'landingpage.html';
    } catch (err) {
        window.location.href = 'landingpage.html';
    }
}