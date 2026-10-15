document.addEventListener('DOMContentLoaded', () => {
    setCheckoutButtonState(false);
    renderCart();
    updateAdmin();

    async function updateAdmin() {
        const adminButtonContainer = document.getElementById('adminButtonContainer');
        if (adminButtonContainer) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (isAdmin === 'true') {

                const adminButton = `<a href="../HTML/adminHub.html" class="btn btn-outline-light">
                                            <i class="bi bi-gear"></i> Admin Bereich</a>`;
                adminButtonContainer.innerHTML = `${adminButton}`;
            } else {
                adminButtonContainer.innerHTML = ``;
            }
        }
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            if (checkoutBtn.classList.contains('disabled')) {
                e.preventDefault();
            }
        });
    }
});

async function fetchCart(path, options = {}) {
    const response = await apiFetch(path, options);
    if (response instanceof Response) {
        throw new Error(`Warenkorb-Anfrage fehlgeschlagen (${response.status}).`);
    }
    return response;
}

function setCheckoutButtonState(enabled) {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;

    if (enabled) {
        checkoutBtn.classList.remove('disabled');
        checkoutBtn.removeAttribute('aria-disabled');
        checkoutBtn.removeAttribute('tabindex');
    }
        else {
            checkoutBtn.classList.add('disabled');
            checkoutBtn.setAttribute('aria-disabled', 'true');
            checkoutBtn.setAttribute('tabindex', '-1');
        }
    }

async function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalPriceEl = document.getElementById('total-price');

    if (!cartContainer || !totalPriceEl) {
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        cartContainer.innerText = 'Bitte einloggen';
        totalPriceEl.innerText = 'CHF 0.00';
        setCheckoutButtonState(false);
        return;
    }

    try {
        const cart = await fetchCart(`/api/warenkorb/${encodeURIComponent(userEmail)}`);

        cartContainer.innerHTML = '';

        if (cart.length === 0) {

            cartContainer.innerHTML = '<p>Dein Warenkorb ist aktuell leer.</p>';
            totalPriceEl.innerText = 'CHF 0.00';
            setCheckoutButtonState(false);
            return;
        }

        setCheckoutButtonState(true);
        let total = 0;

        cart.forEach(item => {
            const preis = Number(item.artikelPreis) || 0;
            const menge = Number(item.menge) || 1;
            total += preis * menge;

            const bildPfad = item.artikelBild ? item.artikelBild : 'https://via.placeholder.com/300x200?text=Kein+Bild';

            const itemElement = document.createElement('article');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${bildPfad}" alt="${item.artikelName}" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Bild+Fehler';">
                <div class="cart-item-details">
                    <h3>${item.artikelName}</h3>
                    <p class="price">CHF ${preis.toFixed(2)}</p>
                </div>
            `;

            const quantityControls = document.createElement('div');
            quantityControls.className = 'quantity-controls';
            quantityControls.title = 'Menge anpassen';

            const minusButton = document.createElement('button');
            minusButton.type = 'button';
            minusButton.className = 'quantity-btn';
            minusButton.textContent = '−';
            minusButton.disabled = menge <= 1;
            minusButton.setAttribute('aria-label', 'Menge verringern');
            minusButton.addEventListener('click', () => changeQuantity(item.warenkorbItemId, menge - 1));

            const quantityValue = document.createElement('span');
            quantityValue.className = 'quantity-value';
            quantityValue.textContent = menge;

            const plusButton = document.createElement('button');
            plusButton.type = 'button';
            plusButton.className = 'quantity-btn';
            plusButton.textContent = '+';
            plusButton.disabled = menge >= 99;
            plusButton.setAttribute('aria-label', 'Menge erhöhen');
            plusButton.addEventListener('click', () => changeQuantity(item.warenkorbItemId, menge + 1));

            quantityControls.append(minusButton, quantityValue, plusButton);

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-btn';
            removeButton.textContent = 'Entfernen';
            removeButton.addEventListener('click', () => removeFromCart(item.warenkorbItemId));

            itemElement.appendChild(quantityControls);
            itemElement.appendChild(removeButton);
            cartContainer.appendChild(itemElement);
        });

        totalPriceEl.innerText = `CHF ${total.toFixed(2)}`;
    } catch (error) {
        console.error('Fehler beim Laden des Warenkorbs:', error);
        cartContainer.innerHTML = '<p>Fehler beim Laden des Warenkorbs.</p>';
        totalPriceEl.innerText = 'CHF 0.00';
        setCheckoutButtonState(false);
    }
}

async function changeQuantity(warenkorbItemId, menge) {
    if (menge < 1) {
        return;
    }

    try {
        await fetchCart(`/api/warenkorb/item/${encodeURIComponent(warenkorbItemId)}`, {
            method: 'PUT',
            body: JSON.stringify({ menge })
        });

        await renderCart();
    } catch (error) {
        console.error('Fehler beim Ändern der Menge:', error);
    }
}

async function removeFromCart(warenkorbItemId) {
    try {
        await fetchCart(`/api/warenkorb/item/${encodeURIComponent(warenkorbItemId)}`, {
            method: 'DELETE'
        });

        await renderCart();
    } catch (error) {
        console.error('Fehler beim Entfernen aus dem Warenkorb:', error);
    }
}
