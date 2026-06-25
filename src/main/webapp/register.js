document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const res = await fetch('http://localhost:7070/users/register', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            window.location.href = 'welcome.html';
        } else {
            const result = await res.json();
            alert('Fehler: ' + (result.message || 'Registrierung fehlgeschlagen'));
        }
    } catch (err) {
        alert('Server nicht erreichbar!');
    }
});