document.addEventListener('DOMContentLoaded', () => {
    updateAdmin();
});

async function updateAdmin() {
    const adminButtonContainer = document.getElementById('adminButtonContainer');
    if (adminButtonContainer) {
        const isAdmin = localStorage.getItem('isAdmin')
        if (isAdmin === 'true') {
            const adminButton = `<a href="../HTML/adminHub.html" class="btn btn-outline-light">
                                            <i class="bi bi-gear"></i> Admin Bereich</a>`;
            adminButtonContainer.innerHTML = `${adminButton}`;
        } else {
            adminButtonContainer.innerHTML = ``;
        }
    }
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const loginRequest = new LoginBenutzerRequest(
        document.getElementById('email').value.trim(),
        document.getElementById('password').value
    );

    try {
        const res = await apiFetch('/users/login', { method: 'POST', request: loginRequest });

        if (!(res instanceof Response)) {
            const loginResponse = res;

            // Dieses If braucht es eigentlich nicht, da der Login-Button nicht mehr verfügbar ist wenn man eingeloggt ist!
            if (loginResponse.status === 'info') {
                alert(loginResponse.error);
                window.location.href = '../HTML/landingpage.html';
                return;
            }

            localStorage.setItem('username', loginResponse.username);
            localStorage.setItem('userEmail', loginRequest.email);
            localStorage.setItem('isAdmin', loginResponse.isAdmin);
            window.location.href = '../HTML/landingpage.html';
        } else {
            alert('Fehler: ' + await apiErrorMessage(res, 'Login fehlgeschlagen'));
        }
    } catch (err) {
        console.error('Netzwerk-/Serverfehler:', err);
        alert('Server nicht erreichbar!');
    }
});
