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
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        console.log("3. Antwort vom Server (Status):", res.status, res.statusText);

        if (res.ok) {
            console.log('Login success');

            const authID = crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36) + Math.random().toString(36).slice(2);
            localStorage.setItem('authID', authID);
            console.log('4. authID generiert und gespeichert:', authID);

            console.log("5. Leite weiter zu landingpage.html");
            window.location.href = '../HTML/landingpage.html';
        } else {
            const result = await res.json();
            console.warn("Server meldet Fehler:", result);
            alert('Fehler: ' + (result.message || 'Login fehlgeschlagen'));
        }
    } catch (err) {
        console.error('Netzwerk-/Serverfehler:', err);
        alert('Server nicht erreichbar!');
    }
});