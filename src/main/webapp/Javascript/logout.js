document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
});

async function updateNavigation() {
    const authButtonsContainer = document.getElementById('authButtons');
    if (!authButtonsContainer) return;

    const username = localStorage.getItem('username');
    if (username == undefined) {
        // Gast-Mode
        console.log("Gast-Mode username: ", username);
        renderLoggedOutButtons(authButtonsContainer);
    } else {
        // User-Mode
        console.log("User-Mode username: ", username);
        renderLoggedInButtons(authButtonsContainer);
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
    try {
        await fetch('http://localhost:7070/users/logout', {
            method: 'POST'
        });
        window.location.href = 'landingpage.html';
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        console.log("logout ok")
    } catch (err) {
        window.location.href = 'landingpage.html';
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
    }
}
