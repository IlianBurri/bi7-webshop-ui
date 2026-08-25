document.addEventListener('DOMContentLoaded', () => {
    updateAdmin();
});

async function updateAdmin() {
    const adminButtonContainer = document.getElementById('adminButtonContainer');
    if (adminButtonContainer) {
        const isAdmin = localStorage.getItem('isAdmin')
        if (isAdmin === 'true') {
            // Admin-Button erzeugen
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

    const userData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };

    try {
        const res = await fetch('http://localhost:7070/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            const json = await res.json();

            // Dieses If braucht es eigentlich nicht, da der Login-Button nicht mehr verfügbar ist wenn man eingeloggt ist!
            if (json.status === 'info') {
                alert(json.error);
                window.location.href = '../HTML/landingpage.html';
                return;
            }

            localStorage.setItem('username', json.username);
            localStorage.setItem('userEmail', userData.email);
            localStorage.setItem('isAdmin', json.isAdmin);
            window.location.href = '../HTML/landingpage.html';
        } else {
            const result = await res.json();
            alert('Fehler: ' + (result.error || 'Login fehlgeschlagen'));
        }
    } catch (err) {
        console.error('Netzwerk-/Serverfehler:', err);
        alert('Server nicht erreichbar!');
    }
});
