console.log("!!! JS-Datei wurde erfolgreich geladen !!!");
console.log("Formular-Element gefunden:", document.getElementById('loginForm'));

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("1. Submit-Event ausgelöst!");

    const userData = {
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value
    };
    console.log("2. Daten vor dem Senden:", userData);

    try {
        const res = await fetch('http://localhost:7070/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        console.log("3. Antwort vom Server (Status):", res.status, res.statusText);

        if (res.ok) {
            const json = await res.json();
            console.log('Login-Antwort:', json);

            if (json.status === 'info') {
                alert(json.error);
                window.location.href = '../HTML/landingpage.html';
                return;
            }

            const username  = json.username;
            localStorage.setItem('username', username);
            localStorage.setItem('userEmail', userData.email);
            console.log('4. username:', username, 'email:', userData.email);
            console.log("5. Leite weiter zu landingpage.html");
            window.location.href = '../HTML/landingpage.html';

        } else {
            const result = await res.json();
            console.warn("Server meldet Fehler:", result);
            alert('Fehler: ' + (result.error || 'Login fehlgeschlagen'));
        }
    } catch (err) {
        console.error('Netzwerk-/Serverfehler:', err);
        alert('Server nicht erreichbar!');
    }
});