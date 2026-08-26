(function () {
    const fixture = document.getElementById("fixture");
    const resultsEl = document.getElementById("results");
    const summaryEl = document.getElementById("summary");

    const originalFetch = window.fetch;
    const originalAlert = window.alert;
    const testResults = [];

    function addResult(name, passed, error) {
        const item = document.createElement("li");
        item.className = passed ? "pass" : "fail";
        item.textContent = passed ? "PASS: " + name : "FAIL: " + name + " -> " + error;
        resultsEl.appendChild(item);
        testResults.push({ name: name, passed: passed, error: error || null });
    }

    function assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }

    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message + " (expected: " + expected + ", got: " + actual + ")");
        }
    }

    function tick() {
        return new Promise((resolve) => setTimeout(resolve, 0));
    }

    async function loadScript(relativePath) {
        const script = document.createElement("script");
        script.src = relativePath + "?v=" + Date.now() + Math.random();
        script.async = false;

        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = function () {
                reject(new Error("Could not load script: " + relativePath));
            };
            document.body.appendChild(script);
        });
    }

    function resetFixture(html) {
        fixture.innerHTML = html;
    }

    function resetGlobals() {
        localStorage.clear();
        window.fetch = originalFetch;
        window.alert = originalAlert;
    }

    async function runTest(name, fn) {
        try {
            resetGlobals();
            await fn();
            addResult(name, true);
        } catch (error) {
            console.error("Test failed:", name, error);
            addResult(name, false, error.message);
        }
    }

    async function run() {
        await runTest("artikelAnzeiger: displayArtikel rendert Produktkarte", async function () {
            resetFixture("<div id='products'></div>");
            window.fetch = async function () {
                return { ok: true, json: async function () { return []; } };
            };
            await loadScript("../Javascript/artikelAnzeiger.js");

            window.displayArtikel([
                { artikelId: 11, name: "Test Kaffee", preis: 4.5, bild: "" }
            ]);

            const products = fixture.querySelectorAll(".product");
            assertEqual(products.length, 1, "Eine Produktkarte wird erwartet");
            assert(products[0].textContent.includes("CHF 4.50"), "Preis wird formatiert dargestellt");
            assert(products[0].textContent.includes("In den Warenkorb"), "Button fehlt");
        });

        await runTest("artikelAnzeiger: inDenWarenkorb blockiert ohne Login", async function () {
            resetFixture("<div id='products'></div>");
            let fetchCalls = 0;
            let alertText = "";

            window.fetch = async function () {
                fetchCalls += 1;
                return { ok: true, json: async function () { return {}; } };
            };
            window.alert = function (message) {
                alertText = String(message);
            };

            await loadScript("../Javascript/artikelAnzeiger.js");
            window.inDenWarenkorb(5, 2);
            await tick();

            assertEqual(fetchCalls, 0, "fetch darf ohne Login nicht aufgerufen werden");
            assertEqual(alertText, "Bitte erst einloggen!", "Hinweis fuer Login fehlt");
        });

        await runTest("login: submit sendet JSON an /users/login", async function () {
            resetFixture("" +
                "<form id='loginForm'>" +
                "  <input id='email' type='email'>" +
                "  <input id='password' type='password'>" +
                "  <button type='submit'>Login</button>" +
                "</form>");

            let capturedUrl = "";
            let capturedBody = "";
            let alertText = "";

            window.fetch = async function (url, options) {
                capturedUrl = String(url);
                capturedBody = options && options.body ? String(options.body) : "";
                return {
                    ok: false,
                    json: async function () {
                        return { error: "Invalid credentials" };
                    }
                };
            };

            window.alert = function (message) {
                alertText = String(message);
            };

            await loadScript("../Javascript/login.js");

            document.getElementById("email").value = "max@example.com";
            document.getElementById("password").value = "secret";

            document.getElementById("loginForm").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            await tick();
            await tick();

            assertEqual(capturedUrl, "http://localhost:7070/users/login", "Falscher Login-Endpoint");
            assert(capturedBody.includes("max@example.com"), "Email fehlt im Request-Body");
            assert(capturedBody.includes("secret"), "Passwort fehlt im Request-Body");
            assert(alertText.startsWith("Fehler:"), "Fehler-Alert sollte gezeigt werden");
        });

        await runTest("warenKorbArtikel: renderCart zeigt Login-Hinweis ohne User", async function () {
            resetFixture("" +
                "<div id='cart-items'></div>" +
                "<div id='total-price'></div>" +
                "<a id='checkout-btn' class='button' href='../HTML/checkOut.html'>Checkout</a>");

            await loadScript("../Javascript/warenKorbArtikel.js");
            await window.renderCart();

            const cartText = document.getElementById("cart-items").textContent || "";
            const totalText = document.getElementById("total-price").textContent || "";
            const isDisabled = document.getElementById("checkout-btn").classList.contains("disabled");

            assert(cartText.includes("Bitte einloggen"), "Login-Hinweis fehlt");
            assertEqual(totalText.trim(), "CHF 0.00", "Total sollte 0 sein");
            assert(isDisabled, "Checkout muss deaktiviert sein");
        });

        await runTest("warenKorbArtikel: renderCart berechnet Total korrekt", async function () {
            resetFixture("" +
                "<div id='cart-items'></div>" +
                "<div id='total-price'></div>" +
                "<a id='checkout-btn' class='button disabled' href='../HTML/checkOut.html'>Checkout</a>");

            localStorage.setItem("userEmail", "test@example.com");

            window.fetch = async function (url) {
                assert(url.includes("/api/warenkorb/test%40example.com"), "Warenkorb-URL sollte encoded sein");
                return {
                    ok: true,
                    json: async function () {
                        return [
                            { warenkorbItemId: 1, artikelName: "A", artikelPreis: 2.5, menge: 2, artikelBild: "" },
                            { warenkorbItemId: 2, artikelName: "B", artikelPreis: 3.0, menge: 1, artikelBild: "" }
                        ];
                    }
                };
            };

            await loadScript("../Javascript/warenKorbArtikel.js");
            await window.renderCart();

            const items = fixture.querySelectorAll(".cart-item");
            const totalText = document.getElementById("total-price").textContent || "";
            const isDisabled = document.getElementById("checkout-btn").classList.contains("disabled");

            assertEqual(items.length, 2, "Es sollten 2 Cart-Items gerendert sein");
            assertEqual(totalText.trim(), "CHF 8.00", "Totalpreis sollte 8.00 sein");
            assert(!isDisabled, "Checkout sollte aktiviert sein");
        });

        const passed = testResults.filter(function (r) { return r.passed; }).length;
        const failed = testResults.length - passed;

        summaryEl.textContent = "Finished: " + passed + " passed, " + failed + " failed";
        summaryEl.className = failed === 0 ? "pass" : "fail";

        window.__TEST_RESULTS__ = {
            passed: passed,
            failed: failed,
            total: testResults.length,
            results: testResults
        };
    }

    run();
})();

