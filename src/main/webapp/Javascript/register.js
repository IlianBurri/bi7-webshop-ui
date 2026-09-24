document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!username) {
        alert('Bitte gib einen Benutzernamen ein.');
        return;
    }

    if (password.length < 6) {
        alert('Das Passwort muss mindestens 6 Zeichen lang sein.');
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        alert('Bitte gib eine gültige E-Mail-Adresse ein.');
        return;
    }

    const registerRequest = new RegisterBenutzerRequest(
        username,
        email,
        password
    );

    try {
        const res = await apiFetch('/users/register', { method: 'POST', request: registerRequest });

        if (!(res instanceof Response)) {
            window.location.href = 'registrationSucces.html';
        } else {
            alert('Fehler: ' + await apiErrorMessage(res, 'Registrierung fehlgeschlagen'));
        }
    } catch (err) {
        alert('Server nicht erreichbar!');
    }
});
