document.addEventListener('DOMContentLoaded', () => {
    initCheckoutPage();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    const addressSelect = document.getElementById('saved-address');
    if (addressSelect) {
        addressSelect.addEventListener('change', handleAddressSelectChange);
    }
});

async function fetchCheckout(path, options = {}) {
    return apiFetch(path, options);
}

async function initCheckoutPage() {
    const userEmail = localStorage.getItem('userEmail');
    const emailInput = document.getElementById('email');

    if (userEmail && emailInput) {
        emailInput.value = userEmail;
    }

    if (!userEmail) return;

    try {
        const response = await fetchCheckout(`/api/adresse/${encodeURIComponent(userEmail)}`);

        if (!(response instanceof Response)) {
            populateAddressDropdown(response);
        } else if (response.status === 401) {
            alert('Bitte logge dich ein, um den Checkout durchzuführen.');
            window.location.href = 'loginForm.html';
        } else {
            console.error('Fehler beim Abrufen der Adressen. Status:', response.status);
        }
    } catch (error) {
        console.error('Netzwerkfehler beim Laden der Adressen:', error);
    }
}

function populateAddressDropdown(adressen) {
    const addressSelect = document.getElementById('saved-address');
    if (!addressSelect || !Array.isArray(adressen)) return;

    addressSelect.innerHTML = '<option value="">Bitte wählen …</option>';

    adressen.forEach(adresse => {
        const option = document.createElement('option');
        option.value = adresse.adressId;
        option.textContent = `${adresse.strasse}, ${adresse.plz} ${adresse.ort} (${adresse.land})`;
        option.dataset.adresse = JSON.stringify(adresse);
        addressSelect.appendChild(option);
    });
}

function handleAddressSelectChange(event) {
    const selectedOption = event.target.selectedOptions[0];
    if (selectedOption && selectedOption.dataset.adresse) {
        const addr = JSON.parse(selectedOption.dataset.adresse);
        document.getElementById('vorname').value = addr.vorname || '';
        document.getElementById('nachname').value = addr.nachname || '';
        document.getElementById('strasse').value = addr.strasse || '';
        document.getElementById('plz').value = addr.plz || '';
        document.getElementById('ort').value = addr.ort || '';
        document.getElementById('land').value = addr.land || '';
    }
}

async function handleCheckoutSubmit(event) {
    event.preventDefault();

    const submitBtn = document.querySelector('.pay-btn');
    const addressSelect = document.getElementById('saved-address');
    const saveAddressCheckbox = document.getElementById('save-address');
    const userEmail = localStorage.getItem('userEmail');

    let addressId = addressSelect ? addressSelect.value : null;

    try {
        if (submitBtn) submitBtn.disabled = true;

        if (!addressId || (saveAddressCheckbox && saveAddressCheckbox.checked)) {
            const adresseRequest = {
                userEmail: userEmail ? userEmail.trim() : '',
                vorname: document.getElementById('vorname').value.trim(),
                nachname: document.getElementById('nachname').value.trim(),
                strasse: document.getElementById('strasse').value.trim(),
                plz: document.getElementById('plz').value.trim(),
                ort: document.getElementById('ort').value.trim(),
                land: document.getElementById('land').value.trim() || 'Schweiz'
            };

            const addrResponse = await fetchCheckout('/api/adresse', {
                method: 'POST',
                request: adresseRequest
            });

            if (!(addrResponse instanceof Response)) {
                addressId = addrResponse.adressId;
            } else {
                alert('Adresse konnte nicht gespeichert werden.');

                if (submitBtn) submitBtn.disabled = false;
                return;
            }
        }

        const parsedAdressId = parseInt(addressId, 10);

        if (isNaN(parsedAdressId)) {
            alert('Bitte wähle eine gültige Adresse aus.');
            if (submitBtn) submitBtn.disabled = false;
            return;
        }

        const checkoutResponse = await fetchCheckout('/api/bestellung/checkout', {
            method: 'POST',
            request: { adressId: parsedAdressId }
        });

        if (!(checkoutResponse instanceof Response)) {
            const checkoutResult = checkoutResponse;
            alert(`Vielen Dank für deine Bestellung! (Bestell-ID: ${checkoutResult.bestellungId})`);
            window.location.href = 'landingpage.html';
        } else if (checkoutResponse.status === 401) {
            alert('Deine Sitzung ist abgelaufen. Bitte logge dich erneut ein.');
            window.location.href = 'loginForm.html';
        } else {
            console.error(`Checkout Fehler (${checkoutResponse.status})`);
            alert('Fehler beim Checkout.');
        }

    } catch (error) {
        console.error('Netzwerk- oder Serverfehler beim Checkout:', error);
        alert('Server nicht erreichbar. Bitte versuche es später erneut.');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}
