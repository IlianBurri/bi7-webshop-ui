


// Variante Mit Bootsrap

/*
document.addEventListener('DOMContentLoaded', function() {
    fetchArtikel();
});

function fetchArtikel() {
    fetch('http://localhost:7070/artikel', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }

    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerk-Antwort war nicht ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(artikelListe => {
            displayArtikel(artikelListe);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Artikel:', error);
            const container = document.getElementById('artikel-container');
            if (container) {
                container.innerHTML = `
                <div class="container mb-5">
                    <div class="alert alert-danger" role="alert">
                        Fehler beim Laden der Artikel. Bitte stelle sicher, dass das Backend läuft.
                    </div>
                </div>`;
            }
        });
}

function displayArtikel(artikelListe) {
    const container = document.getElementById('artikel-container');
    if (!container) return;

    container.innerHTML = '';

    const outerContainer = document.createElement('div');
    outerContainer.classList.add('container', 'mb-5');

    const row = document.createElement('div');
    row.classList.add('row', 'g-4');

    if (artikelListe.length === 0) {
        row.innerHTML = '<div class="col-12"><p class="text-muted">Keine Artikel verfügbar.</p></div>';
    } else {
        artikelListe.forEach(artikel => {
            const col = document.createElement('div');
            col.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3');

            const bildPfad = artikel.bild ? artikel.bild : 'https://via.placeholder.com/300x200?text=Kein+Bild';

            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0">
                    <img src="${bildPfad}"
                         class="card-img-top p-3"
                         alt="${artikel.name}"
                         style="height: 180px; object-fit: contain;"
                         onerror="this.src='https://via.placeholder.com/300x200?text=Bild+Fehler'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold fs-6">${artikel.name}</h5>
                        <p class="card-text text-primary fs-4 fw-semibold mt-auto mb-3">
                            CHF ${Number(artikel.preis).toFixed(2)}
                        </p>
                        <button class="btn btn-outline-primary w-100 mt-2" onclick="inDenWarenkorb(${artikel.artikelId})">
                            <i class="bi bi-cart-plus"></i> In den Warenkorb
                        </button>
                    </div>
                </div>
            `;
            row.appendChild(col);
        });
    }

    outerContainer.appendChild(row);
    container.appendChild(outerContainer);
}

function inDenWarenkorb(artikelId) {
    console.log('Artikel zum Warenkorb hinzugefügt:', artikelId);
    // TODO: Warenkorb-Logik hinzufügen
}*/

//Variante ohne Bootsrap

document.addEventListener('DOMContentLoaded', function() {
    fetchArtikel();
});


function fetchArtikel() {

    fetch('http://localhost:7070/artikel', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

        .then(response => {

            if (!response.ok) {
                throw new Error('Netzwerk-Antwort war nicht ok: ' + response.statusText);
            }

            return response.json();

        })

        .then(artikelListe => {

            displayArtikel(artikelListe);

        })

        .catch(error => {

            console.error('Fehler beim Laden der Artikel:', error);

            const container = document.getElementById('products');

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



function displayArtikel(artikelListe) {

    const container = document.getElementById('products');

    if (!container) return;


    // Alte Produkte entfernen
    container.innerHTML = "";


    // Keine Artikel vorhanden
    if (artikelListe.length === 0) {

        container.innerHTML = `
            <p class="empty-message">
                Keine Artikel verfügbar.
            </p>
        `;

        return;
    }


    // Für jeden Artikel eine Kachel erstellen
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

            <h3>
                ${artikel.name}
            </h3>

            <p>
                CHF ${Number(artikel.preis).toFixed(2)}
            </p>

            <button onclick="inDenWarenkorb(${artikel.artikelId})">
                In den Warenkorb
            </button>

        `;


        container.appendChild(product);

    });

}



function inDenWarenkorb(artikelId) {

    console.log('Artikel zum Warenkorb hinzugefügt:', artikelId);

}







