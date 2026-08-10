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

    const userData = {
        username: username,
        email: email,
        password: password
    };

    try {
        const res = await fetch('http://localhost:7070/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            window.location.href = 'registrationSucces.html';
        } else {
            const result = await res.json();
            alert('Fehler: ' + (result.error || 'Registrierung fehlgeschlagen'));
        }
    } catch (err) {
        alert('Server nicht erreichbar!');
    }
});