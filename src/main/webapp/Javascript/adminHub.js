const ADMIN_API_BASE = 'http://localhost:7070';

const MAX_NAME_LAENGE = 255;
const MIN_PREIS = 0.01;
const MAX_PREIS = 99999999.99;
const MAX_BILD_LAENGE = 500;

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('adminForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});

async function handleSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById('artikelName');
    const preisInput = document.getElementById('artikelPreis');
    const bildInput = document.getElementById('artikelBild');

    const nameFehler = validateName(nameInput.value);
    const preisFehler = validatePreis(preisInput.value);
    const bildFehler = validateBild(bildInput.value);

    showError('nameError', nameFehler, nameInput);
    showError('preisError', preisFehler, preisInput);
    showError('bildError', bildFehler, bildInput);

    if (nameFehler || preisFehler || bildFehler) {
        setStatus('Bitte korrigiere die markierten Felder.', 'error');
        return;
    }

    const artikel = {
        name: nameInput.value.trim(),
        preis: Math.round(Number(preisInput.value) * 100) / 100,
        bild: bildInput.value.trim()
    };

    try {
        const res = await fetch(`${ADMIN_API_BASE}/artikel`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(artikel)
        });

        if (!res.ok) {
            if (res.status === 403) {
                clearAuthState();
                setStatus('Sitzung abgelaufen oder keine Berechtigung. Bitte erneut als Admin einloggen.', 'error');
                (window.redirectTo || ((url) => {
                    window.location.href = url;
                }))('loginForm.html');
                return;
            }
            throw new Error('Backend-Antwort nicht ok: ' + res.status);
        }

        setStatus('Artikel erfolgreich hinzugefügt!', 'success');
        nameInput.value = '';
        preisInput.value = '';
        bildInput.value = '';
        nameInput.classList.remove('is-invalid');
        preisInput.classList.remove('is-invalid');
        bildInput.classList.remove('is-invalid');
    } catch (err) {
        console.error('Fehler beim Hinzufügen des Artikels:', err);
        setStatus('Artikel konnte nicht hinzugefügt werden. Läuft das Backend?', 'error');
    }
}

function validateName(name) {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return 'Bitte gib einen Artikelnamen ein.';
    }
    if (trimmed.length > MAX_NAME_LAENGE) {
        return `Der Name darf höchstens ${MAX_NAME_LAENGE} Zeichen lang sein.`;
    }
    return null;
}

function validatePreis(preis) {
    if (preis.trim() === '' || isNaN(preis)) {
        return 'Bitte gib einen gültigen Preis ein.';
    }

    const wert = Number(preis);
    if (wert < MIN_PREIS) {
        return `Der Preis muss mindestens ${MIN_PREIS.toFixed(2)} betragen (0 oder negativ ist nicht erlaubt).`;
    }
    if (wert > MAX_PREIS) {
        return `Der Preis darf maximal ${MAX_PREIS.toLocaleString('de-CH')} betragen.`;
    }

    const nachkommastellen = (preis.trim().split('.')[1] || '').length;
    if (nachkommastellen > 2) {
        return 'Der Preis darf höchstens 2 Nachkommastellen haben.';
    }

    return null;
}

function validateBild(bild) {
    const trimmed = bild.trim();
    if (trimmed.length === 0) {
        return 'Bitte gib eine Bildadresse an.';
    }
    if (trimmed.length > MAX_BILD_LAENGE) {
        return `Die Bildadresse darf höchstens ${MAX_BILD_LAENGE} Zeichen lang sein.`;
    }

    try {
        const url = new URL(trimmed);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return 'Die Bildadresse muss mit http:// oder https:// beginnen.';
        }
    } catch (err) {
        return 'Bitte gib eine gültige Bildadresse an (z. B. https://example.com/bild.jpg).';
    }

    return null;
}

function showError(errorElementId, message, input) {
    const errorElement = document.getElementById(errorElementId);
    if (errorElement) {
        errorElement.textContent = message || '';
    }
    if (input) {
        input.classList.toggle('is-invalid', Boolean(message));
    }
}

function setStatus(message, type) {
    const statusElement = document.getElementById('formStatus');
    if (!statusElement) return;

    statusElement.textContent = message;
    statusElement.classList.remove('success', 'error');
    if (type) {
        statusElement.classList.add(type);
    }
    window.handleSubmit = handleSubmit;
}
