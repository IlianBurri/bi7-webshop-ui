document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        email: document.getElementById('emailLogin').value,
        password: document.getElementById('passwordLogin').value
    };

    try {
        const res = await fetch('http://localhost:7070/users/login', {
            method: 'POST',
            credentials: "include", // critical for session cookie
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            // window.location.href = 'welcome.html';
            const sessionId = res.headers.get('sessionId')
            console.log('Got sessionId: ', sessionId);
        } else {
            const result = await res.json();
            alert('Fehler: ' + (result.message || 'Login fehlgeschlagen'));
        }
    } catch (err) {
        alert('Server nicht erreichbar! ', err);
    }
});
