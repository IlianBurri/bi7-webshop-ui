document.addEventListener('DOMContentLoaded', function() {
    fetchArtikel();
});

function fetchArtikel() {
    const container = document.getElementById('products');

    if (container) {
        container.innerHTML = '<div class="spinner"></div>';
    }

    fetchArtikelListe(['http://localhost:7070/artikel', '/api/artikel'])
        .then(response => {
            displayArtikel(response);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Artikel:', error);

            if (container) {
                container.innerHTML = `
                <p class="error-message">
                    Fehler beim Laden der Artikel.
                    Bitte stelle sicher, dass das Backend läuft.
                </p>
            `;
            }
        });
}

async function fetchArtikelListe(endpoints) {
    let lastError = null;

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                lastError = new Error('Netzwerk-Antwort war nicht ok: ' + response.statusText);
                continue;
            }

            return await response.json();
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError ?? new Error('Artikel konnten nicht geladen werden.');
}

function displayArtikel(artikelListe) {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = "";

    if (artikelListe.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                Keine Artikel verfügbar.
            </p>
        `;
        return;
    }

    artikelListe.forEach(artikel => {
        const product = document.createElement("article");
        product.classList.add("product");

        const bildPfad = artikel.bild
            ? artikel.bild
            : "https://via.placeholder.com/300x200?text=Kein+Bild";

        product.innerHTML = `
            <img 
                src="${bildPfad}" 
                alt="${artikel.name}"
                onerror="this.src='https://via.placeholder.com/300x200?text=Bild+Fehler'"
            >
            <h3>${artikel.name}</h3>
            <p>CHF ${Number(artikel.preis).toFixed(2)}</p>
        `;

        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.step = '1';
        quantityInput.value = '1';
        quantityInput.className = 'quantity-input';
        quantityInput.setAttribute('aria-label', 'Menge');

        const button = document.createElement('button');
        button.textContent = 'In den Warenkorb';
        button.addEventListener('click', () => {
            const menge = parseInt(quantityInput.value, 10) || 1;
            inDenWarenkorb(artikel.artikelId, menge);
        });

        const quantityRow = document.createElement('div');
        quantityRow.className = 'quantity-row';
        quantityRow.appendChild(quantityInput);
        quantityRow.appendChild(button);

        product.appendChild(quantityRow);

        container.appendChild(product);
    });
}

function inDenWarenkorb(artikelId, menge = 1) {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        alert('Bitte erst einloggen!');
        return;
    }

    fetch(`http://localhost:7070/api/warenkorb/add?email=${encodeURIComponent(userEmail)}&artikelId=${encodeURIComponent(artikelId)}&menge=${encodeURIComponent(menge)}`, {
        method: 'POST'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Artikel konnte nicht hinzugefügt werden.');
            }

            alert('Artikel hinzugefügt!');
        })
        .catch(error => {
            console.error('Fehler beim Hinzufügen zum Warenkorb:', error);
        });
}
