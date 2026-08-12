const ADRESSE_API_BASE = 'http://localhost:7070/api/adressen';

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});

function initCheckout() {
    const form = document.getElementById('checkout-form');
    if (!form) {
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const addressSelect = document.getElementById('saved-address');
    const saveAddressCheckbox = document.getElementById('save-address');

    if (!userEmail) {
        hideElement(addressSelect?.closest('.address-select-group'));
        hideElement(saveAddressCheckbox?.closest('.save-address-group'));
    } else {
        loadSavedAddresses(userEmail, addressSelect);

        const emailInput = document.getElementById('email');
        if (emailInput && !emailInput.value) {
            emailInput.value = userEmail;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payBtn = form.querySelector('.pay-btn');
        if (payBtn) {
            payBtn.disabled = true;
        }

        try {
            const shouldSave = saveAddressCheckbox && saveAddressCheckbox.checked && userEmail;
            if (shouldSave && !(await saveAddress(userEmail))) {
                return;
            }

            alert('Vielen Dank! Deine Bestellung wurde abgeschlossen.');
            form.reset();
        } finally {
            if (payBtn) {
                payBtn.disabled = false;
            }
        }
    });
}

async function loadSavedAddresses(userEmail, addressSelect) {
    if (!addressSelect) {
        return;
    }

    try {
        const response = await fetch(`${ADRESSE_API_BASE}/${encodeURIComponent(userEmail)}`);

        if (!response.ok) {
            throw new Error('Adressen konnten nicht geladen werden.');
        }

        const adressen = await response.json();

        if (!Array.isArray(adressen) || adressen.length === 0) {
            hideElement(addressSelect.closest('.address-select-group'));
            return;
        }

        adressen.forEach(adresse => {
            const option = document.createElement('option');
            option.value = adresse.adressId;
            option.textContent = `${adresse.vorname} ${adresse.nachname}, ${adresse.strasse}, ${adresse.plz} ${adresse.ort}`;
            option.dataset.adresse = JSON.stringify(adresse);
            addressSelect.appendChild(option);
        });

        addressSelect.addEventListener('change', () => prefillForm(addressSelect));
    } catch (error) {
        console.error('Fehler beim Laden der Adressen:', error);
        hideElement(addressSelect.closest('.address-select-group'));
    }
}

function prefillForm(addressSelect) {
    const selected = addressSelect.selectedOptions[0];
    const adresse = selected?.dataset.adresse ? JSON.parse(selected.dataset.adresse) : null;

    if (!adresse) {
        return;
    }

    const fields = {
        vorname: adresse.vorname,
        nachname: adresse.nachname,
        strasse: adresse.strasse,
        plz: adresse.plz,
        ort: adresse.ort,
        land: adresse.land
    };

    Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input && value !== undefined && value !== null) {
            input.value = value;
        }
    });
}

async function saveAddress(userEmail) {
    const adresse = {
        userEmail: userEmail,
        vorname: document.getElementById('vorname').value.trim(),
        nachname: document.getElementById('nachname').value.trim(),
        strasse: document.getElementById('strasse').value.trim(),
        plz: document.getElementById('plz').value.trim(),
        ort: document.getElementById('ort').value.trim(),
        land: document.getElementById('land').value.trim()
    };

    try {
        const response = await fetch(ADRESSE_API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adresse)
        });

        if (!response.ok) {
            throw new Error('Adresse konnte nicht gespeichert werden.');
        }

        return true;
    } catch (error) {
        console.error('Fehler beim Speichern der Adresse:', error);
        alert('Fehler beim Speichern der Adresse: ' + error.message);
        return false;
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}
