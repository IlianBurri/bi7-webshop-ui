(function () {
    const fixture = document.getElementById("fixture");
    const summaryEl = document.getElementById("summary");
    const resultsGroupsEl = document.getElementById("results-groups");

    const originalFetch = window.fetch;
    const originalAlert = window.alert;
    const testResults = [];

    const TEST_BILD = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23e2e5ea'/%3E%3Ctext x='150' y='106' font-size='14' fill='%236b7280' text-anchor='middle'%3ETest-Bild%3C/text%3E%3C/svg%3E";

    function addResult(name, passed, error, duration, details) {
        const categoryMatch = name.match(/^([^:]+):\s*(.*)$/);
        testResults.push({
            name: name,
            category: categoryMatch ? categoryMatch[1] : "Allgemein",
            label: categoryMatch ? categoryMatch[2] : name,
            passed: passed,
            error: error ? {message: error.message || String(error), stack: error.stack || null} : null,
            duration: duration != null ? Math.round(duration) : null,
            details: details || null
        });
        updateCounters();
        updateFilterCounts();
        renderResults();
    }

    function updateCounters() {
        const total = testResults.length;
        const passed = testResults.filter(function (r) {
            return r.passed;
        }).length;
        const failed = total - passed;

        document.getElementById("count-total").textContent = total;
        document.getElementById("count-passed").textContent = passed;
        document.getElementById("count-failed").textContent = failed;
        document.getElementById("pass-rate").textContent = total === 0 ? "–" : Math.round(passed / total * 100) + "%";

        const progress = document.getElementById("progress-bar");
        progress.innerHTML = "";
        if (total > 0) {
            const passSegment = document.createElement("span");
            passSegment.className = "seg-pass";
            passSegment.style.width = (passed / total * 100).toFixed(1) + "%";
            progress.appendChild(passSegment);

            if (failed > 0) {
                const failSegment = document.createElement("span");
                failSegment.className = "seg-fail";
                failSegment.style.width = (failed / total * 100).toFixed(1) + "%";
                progress.appendChild(failSegment);
            }
        }
        document.getElementById("progress-label").textContent = total === 0 ? "0%" : Math.round(passed / total * 100) + "%";
    }

    function updateFilterCounts() {
        const total = testResults.length;
        const passed = testResults.filter(function (r) {
            return r.passed;
        }).length;
        const failed = total - passed;

        document.getElementById("tab-all").textContent = total;
        document.getElementById("tab-pass").textContent = passed;
        document.getElementById("tab-fail").textContent = failed;
    }

    let activeFilter = "all";

    function renderResults() {
        const container = resultsGroupsEl;
        container.innerHTML = "";

        const visible = testResults.filter(function (r) {
            return activeFilter === "all" || (activeFilter === "pass" ? r.passed : !r.passed);
        });

        document.getElementById("empty-state").hidden = visible.length > 0;
        document.getElementById("results-hint").textContent = visible.length === testResults.length
            ? ""
            : "Zeige " + visible.length + " von " + testResults.length + " Tests";

        const groups = new Map();
        visible.forEach(function (r) {
            if (!groups.has(r.category)) {
                groups.set(r.category, []);
            }
            groups.get(r.category).push(r);
        });

        groups.forEach(function (items, category) {
            const passedInGroup = items.filter(function (r) {
                return r.passed;
            }).length;

            const section = document.createElement("section");
            section.className = "result-group";

            const header = document.createElement("div");
            header.className = "group-header";

            const title = document.createElement("h3");
            title.textContent = category;

            const chip = document.createElement("span");
            chip.className = "group-chip " + (passedInGroup === items.length ? "ok" : "bad");
            chip.textContent = passedInGroup + " von " + items.length + " bestanden";

            header.append(title, chip);

            const list = document.createElement("ul");
            list.className = "group-results";
            items.forEach(function (r) {
                list.appendChild(buildResultRow(r));
            });

            section.append(header, list);
            container.appendChild(section);
        });
    }

    function buildResultRow(r) {
        const row = document.createElement("li");
        row.className = "result " + (r.passed ? "pass" : "fail");
        row.setAttribute("tabindex", "0");
        row.setAttribute("role", "button");
        row.setAttribute("aria-expanded", "false");
        row.title = "Details anzeigen";

        const indicator = document.createElement("span");
        indicator.className = "indicator";
        indicator.setAttribute("aria-hidden", "true");

        const main = document.createElement("div");
        main.className = "row-main";

        const name = document.createElement("span");
        name.className = "row-name";
        name.textContent = r.label;

        const meta = document.createElement("div");
        meta.className = "row-meta";

        const chip = document.createElement("span");
        chip.className = "status-chip " + (r.passed ? "ok" : "bad");
        chip.textContent = r.passed ? "PASS" : "FAIL";

        const dur = document.createElement("span");
        dur.className = "row-duration";
        dur.textContent = r.duration != null ? formatDuration(r.duration) : "";

        meta.append(chip, dur);
        main.append(name, meta);

        const chevron = document.createElement("span");
        chevron.className = "row-chevron";
        chevron.setAttribute("aria-hidden", "true");
        chevron.textContent = "▾";

        row.append(indicator, main, chevron);

        const infoPanel = document.createElement("div");
        infoPanel.className = "info-panel";
        infoPanel.hidden = true;

        if (r.details) {
            if (r.details.description) {
                infoPanel.appendChild(infoBlock("Was passiert", r.details.description));
            }
            if (r.details.expected) {
                infoPanel.appendChild(infoBlock("Erwartetes Ergebnis", r.details.expected));
            }
        } else {
            infoPanel.appendChild(infoBlock("Hinweis", "Für diesen Test ist keine Beschreibung hinterlegt."));
        }

        if (!r.passed && r.error) {
            const errorBox = document.createElement("div");
            errorBox.className = "error-details";

            const message = document.createElement("div");
            message.className = "error-message";
            message.textContent = r.error.message || String(r.error);
            errorBox.appendChild(message);

            if (r.error.stack) {
                const stack = document.createElement("pre");
                stack.className = "error-stack";
                stack.textContent = r.error.stack;
                errorBox.appendChild(stack);
            }

            infoPanel.appendChild(errorBox);
        }

        row.appendChild(infoPanel);

        row.addEventListener("click", function (event) {
            if (event.target.closest("button")) {
                return;
            }
            toggleDetails();
        });
        row.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleDetails();
            }
        });

        function toggleDetails() {
            const willShow = infoPanel.hidden;
            infoPanel.hidden = !willShow;
            row.classList.toggle("expanded", willShow);
            row.setAttribute("aria-expanded", String(willShow));
        }

        return row;
    }

    function infoBlock(label, text) {
        const block = document.createElement("div");
        block.className = "info-block";

        const labelEl = document.createElement("div");
        labelEl.className = "info-label";
        labelEl.textContent = label;

        const textEl = document.createElement("p");
        textEl.className = "info-text";
        textEl.textContent = text;

        block.append(labelEl, textEl);
        return block;
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

    async function runTest(name, details, fn) {
        const startedAt = performance.now();
        document.getElementById("summary-status").textContent = "Läuft: " + name;
        document.getElementById("running-index").textContent = testResults.length + 1;
        try {
            resetGlobals();
            await fn();
            addResult(name, true, null, performance.now() - startedAt, details);
        } catch (error) {
            console.error("Test failed:", name, error);
            addResult(name, false, error, performance.now() - startedAt, details);
        }
    }

    let startTime = null;
    let elapsedTimer = null;

    function startElapsedTimer() {
        startTime = performance.now();
        elapsedTimer = setInterval(function () {
            document.getElementById("elapsed").textContent = formatDuration(performance.now() - startTime);
        }, 100);
    }

    function stopElapsedTimer() {
        if (elapsedTimer) {
            clearInterval(elapsedTimer);
            elapsedTimer = null;
        }
        if (startTime != null) {
            document.getElementById("elapsed").textContent = formatDuration(performance.now() - startTime);
        }
    }

    function formatDuration(ms) {
        if (ms < 1000) {
            return ms.toFixed(0) + " ms";
        }
        return (ms / 1000).toFixed(2) + " s";
    }

    document.getElementById("filter-tabs").addEventListener("click", function (event) {
        const button = event.target.closest(".filter-tab");
        if (!button) {
            return;
        }
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".filter-tab").forEach(function (tab) {
            tab.classList.toggle("active", tab === button);
        });
        renderResults();
    });

    document.getElementById("fixture-toggle").addEventListener("click", function () {
        const wrap = document.getElementById("fixture-wrap");
        const expanded = wrap.hidden;
        wrap.hidden = !expanded;
        this.setAttribute("aria-expanded", String(expanded));
        this.querySelector(".chevron").textContent = expanded ? "▾" : "▸";
    });

    document.getElementById("rerun-btn").addEventListener("click", function () {
        window.location.reload();
    });

    document.getElementById("copy-btn").addEventListener("click", function () {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            alert("Kopieren wird in diesem Browser nicht unterstützt.");
            return;
        }
        const payload = JSON.stringify({
            generatedAt: new Date().toISOString(),
            total: testResults.length,
            passed: testResults.filter(function (r) {
                return r.passed;
            }).length,
            failed: testResults.filter(function (r) {
                return !r.passed;
            }).length,
            results: testResults.map(function (r) {
                return {
                    name: r.name,
                    category: r.category,
                    passed: r.passed,
                    duration: r.duration,
                    error: r.error ? r.error.message : null
                };
            })
        }, null, 2);
        navigator.clipboard.writeText(payload).then(function () {
            const button = document.getElementById("copy-btn");
            button.textContent = "Kopiert";
            setTimeout(function () {
                button.textContent = "Ergebnisse exportieren";
            }, 1600);
        }).catch(function () {
            alert("Kopieren fehlgeschlagen – bitte manuell kopieren.");
        });
    });

    document.getElementById("run-timestamp").textContent = new Date().toLocaleString("de-CH");

    async function run() {
        startElapsedTimer();

        await runTest("artikelAnzeiger: displayArtikel rendert Produktkarte", {
            description: "Ruft displayArtikel() mit einer Beispiel-Produktliste auf (1 Artikel: 'Test Kaffee', CHF 4.50) und prüft das gerenderte DOM im Container #products.",
            expected: "Genau 1 Element mit der Klasse .product wird erzeugt. Es zeigt den formatierten Preis 'CHF 4.50' und enthält einen Button 'In den Warenkorb'."
        }, async function () {
            resetFixture("<div id='products'></div>");
            window.fetch = async function () {
                return {
                    ok: true, json: async function () {
                        return [];
                    }
                };
            };
            await loadScript("../Javascript/artikelAnzeiger.js");

            window.displayArtikel([
                {artikelId: 11, name: "Test Kaffee", preis: 4.5, bild: TEST_BILD}
            ]);

            const products = fixture.querySelectorAll(".product");
            assertEqual(products.length, 1, "Eine Produktkarte wird erwartet");
            assert(products[0].textContent.includes("CHF 4.50"), "Preis wird formatiert dargestellt");
            assert(products[0].textContent.includes("In den Warenkorb"), "Button fehlt");
        });

        await runTest("artikelAnzeiger: inDenWarenkorb blockiert ohne Login", {
            description: "Ruft inDenWarenkorb(5, 2) auf, während niemand eingeloggt ist (kein userEmail im localStorage).",
            expected: "Es wird KEIN fetch-Request gesendet (fetchCalls === 0) und stattdessen per alert() der Hinweis 'Bitte erst einloggen!' angezeigt."
        }, async function () {
            resetFixture("<div id='products'></div>");
            let fetchCalls = 0;
            let alertText = "";

            window.fetch = async function () {
                fetchCalls += 1;
                return {
                    ok: true, json: async function () {
                        return {};
                    }
                };
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

        await runTest("login: submit sendet JSON an /users/login", {
            description: "Füllt das Login-Formular mit E-Mail und Passwort aus und löst das submit-Event aus; ein gemocktes fetch fängt die Anfrage ab.",
            expected: "Ein POST an 'http://localhost:7070/users/login' wird gesendet, dessen Body die E-Mail und das Passwort enthält. Bei Fehler zeigt der Server-Alert eine Meldung, die mit 'Fehler:' beginnt."
        }, async function () {
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
                        return {error: "Invalid credentials"};
                    }
                };
            };

            window.alert = function (message) {
                alertText = String(message);
            };

            await loadScript("../Javascript/login.js");

            document.getElementById("email").value = "max@example.com";
            document.getElementById("password").value = "secret";

            document.getElementById("loginForm").dispatchEvent(new Event("submit", {bubbles: true, cancelable: true}));
            await tick();
            await tick();

            assertEqual(capturedUrl, "http://localhost:7070/users/login", "Falscher Login-Endpoint");
            assert(capturedBody.includes("max@example.com"), "Email fehlt im Request-Body");
            assert(capturedBody.includes("secret"), "Passwort fehlt im Request-Body");
            assert(alertText.startsWith("Fehler:"), "Fehler-Alert sollte gezeigt werden");
        });

        await runTest("warenKorbArtikel: renderCart zeigt Login-Hinweis ohne User", {
            description: "Ruft renderCart() auf, während niemand eingeloggt ist (kein userEmail im localStorage).",
            expected: "Der Warenkorb zeigt 'Bitte einloggen', das Total steht auf 'CHF 0.00' und der Checkout-Button ist deaktiviert (Klasse .disabled)."
        }, async function () {
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

        await runTest("warenKorbArtikel: renderCart berechnet Total korrekt", {
            description: "Simuliert einen eingeloggten Benutzer (userEmail) und mockt die fetch-Antwort mit 2 Warenkorb-Artikeln (2× CHF 2.50 und 1× CHF 3.00).",
            expected: "Es werden 2 .cart-item-Elemente gerendert, das Total zeigt 'CHF 8.00' und der Checkout-Button ist aktiviert. Die fetch-URL enthält die URL-encodierte E-Mail."
        }, async function () {
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
                            {warenkorbItemId: 1, artikelName: "A", artikelPreis: 2.5, menge: 2, artikelBild: TEST_BILD},
                            {warenkorbItemId: 2, artikelName: "B", artikelPreis: 3.0, menge: 1, artikelBild: TEST_BILD}
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


        await runTest("logout: updateNavigation zeigt Login/Registrieren wenn ausgeloggt", {
            description: "Ruft updateNavigation() auf, ohne dass ein Benutzer eingeloggt ist.",
            expected: "Im Container #authButtons erscheinen die Links 'Login' und 'Registrieren'."
        }, async function () {
            resetFixture("<div id='authButtons'></div>");
            await loadScript("../Javascript/logout.js");

            await window.updateNavigation();

            const html = document.getElementById("authButtons").innerHTML;
            assert(html.includes("Login"), "Login-Link fehlt");
            assert(html.includes("Registrieren"), "Registrieren-Link fehlt");
        });

        await runTest("logout: updateNavigation zeigt Abmelden-Button wenn eingeloggt", {
            description: "Setzt einen Benutzer (username im localStorage) und ruft updateNavigation() auf.",
            expected: "Es wird ein Abmelden-Button (#logoutBtn) gerendert und der Text 'Abmelden' ist sichtbar."
        }, async function () {
            resetFixture("<div id='authButtons'></div>");
            localStorage.setItem("username", "Max Muster");
            await loadScript("../Javascript/logout.js");

            await window.updateNavigation();

            const container = document.getElementById("authButtons");
            const logoutBtn = document.getElementById("logoutBtn");
            assert(logoutBtn !== null, "Abmelden-Button fehlt");
            assert(container.textContent.includes("Abmelden"), "Abmelden-Text fehlt");
        });

        await runTest("logout: handleLogout leert localStorage und ruft POST /users/logout auf", {
            description: "Setzt Benutzerdaten (username, userEmail, isAdmin) und ruft handleLogout() mit gemocktem fetch und redirectTo() auf.",
            expected: "Ein POST an 'http://localhost:7070/users/logout' wird gesendet. Danach sind username, userEmail und isAdmin aus dem localStorage entfernt, der Admin-Button-Container ist leer und die Weiterleitung auf 'landingpage.html' erfolgt."
        }, async function () {
            resetFixture("<div id='adminButtonContainer'>vorher</div>");
            localStorage.setItem("username", "Max Muster");
            localStorage.setItem("userEmail", "max@example.com");
            localStorage.setItem("isAdmin", "true");

            let capturedUrl = "";
            let capturedMethod = "";
            let capturedRedirect = "";

            window.fetch = async function (url, options) {
                capturedUrl = String(url);
                capturedMethod = options && options.method ? options.method : "";
                return {
                    ok: true, json: async function () {
                        return {};
                    }
                };
            };
            window.redirectTo = function (url) {
                capturedRedirect = url;
            };

            await loadScript("../Javascript/logout.js");
            await window.handleLogout();

            assertEqual(capturedUrl, "http://localhost:7070/users/logout", "Falscher Logout-Endpoint");
            assertEqual(capturedMethod, "POST", "Logout muss per POST erfolgen");
            assertEqual(localStorage.getItem("username"), null, "username muss geleert werden");
            assertEqual(localStorage.getItem("userEmail"), null, "userEmail muss geleert werden");
            assertEqual(localStorage.getItem("isAdmin"), null, "isAdmin muss geleert werden");
            assertEqual(document.getElementById("adminButtonContainer").innerHTML, "", "Admin-Button muss entfernt werden");
            assertEqual(capturedRedirect, "landingpage.html", "Redirect nach Logout fehlt");
        });



        function fixtureAdminForm() {
            return "" +
                "<form id='adminForm'>" +
                "  <input id='artikelName'>" +
                "  <input id='artikelPreis'>" +
                "  <input id='artikelBild'>" +
                "  <p id='nameError'></p>" +
                "  <p id='preisError'></p>" +
                "  <p id='bildError'></p>" +
                "  <p id='formStatus'></p>" +
                "</form>";
        }

        await runTest("adminHub: leerer Name blockiert das Absenden", {
            description: "Füllt das Admin-Formular mit einem leeren Artikelnamen (nur Leerzeichen) und ruft handleSubmit() auf.",
            expected: "Es wird KEIN fetch-Request gesendet und im Feld #nameError erscheint eine Fehlermeldung."
        }, async function () {
            resetFixture(fixtureAdminForm());
            let fetchCalls = 0;
            window.fetch = async function () {
                fetchCalls += 1;
                return {ok: true, json: async () => ({})};
            };

            await loadScript("../Javascript/adminHub.js");

            document.getElementById("artikelName").value = "   ";
            document.getElementById("artikelPreis").value = "10";
            document.getElementById("artikelBild").value = "https://example.com/bild.jpg";

            await window.handleSubmit({
                preventDefault: () => {
                }
            });

            assertEqual(fetchCalls, 0, "Bei ungültigem Namen darf kein Request gesendet werden");
            assert(document.getElementById("nameError").textContent.length > 0, "Name-Fehlermeldung fehlt");
        });

        await runTest("adminHub: negativer Preis blockiert das Absenden", {
            description: "Füllt das Admin-Formular mit einem negativen Preis (-5) und ruft handleSubmit() auf.",
            expected: "Es wird KEIN fetch-Request gesendet und im Feld #preisError erscheint eine Fehlermeldung."
        }, async function () {
            resetFixture(fixtureAdminForm());
            let fetchCalls = 0;
            window.fetch = async function () {
                fetchCalls += 1;
                return {ok: true, json: async () => ({})};
            };

            await loadScript("../Javascript/adminHub.js");

            document.getElementById("artikelName").value = "Testartikel";
            document.getElementById("artikelPreis").value = "-5";
            document.getElementById("artikelBild").value = "https://example.com/bild.jpg";

            await window.handleSubmit({
                preventDefault: () => {
                }
            });

            assertEqual(fetchCalls, 0, "Bei negativem Preis darf kein Request gesendet werden");
            assert(document.getElementById("preisError").textContent.length > 0, "Preis-Fehlermeldung fehlt");
        });

        await runTest("adminHub: ungültige Bild-URL blockiert das Absenden", {
            description: "Füllt das Admin-Formular mit einer ungültigen Bild-URL ('javascript:alert(1)') und ruft handleSubmit() auf.",
            expected: "Es wird KEIN fetch-Request gesendet und im Feld #bildError erscheint eine Fehlermeldung."
        }, async function () {
            resetFixture(fixtureAdminForm());
            let fetchCalls = 0;
            window.fetch = async function () {
                fetchCalls += 1;
                return {ok: true, json: async () => ({})};
            };

            await loadScript("../Javascript/adminHub.js");

            document.getElementById("artikelName").value = "Testartikel";
            document.getElementById("artikelPreis").value = "10";
            document.getElementById("artikelBild").value = "javascript:alert(1)";

            await window.handleSubmit({
                preventDefault: () => {
                }
            });

            assertEqual(fetchCalls, 0, "Bei ungültiger Bild-URL darf kein Request gesendet werden");
            assert(document.getElementById("bildError").textContent.length > 0, "Bild-Fehlermeldung fehlt");
        });

        await runTest("adminHub: erfolgreicher Submit sendet POST und leert das Formular", {
            description: "Füllt das Admin-Formular mit gültigen Werten und ruft handleSubmit() mit gemocktem fetch auf.",
            expected: "Ein POST an 'http://localhost:7070/artikel' wird mit dem Artikel im Request-Body gesendet. Danach werden die Eingabefelder geleert und eine Erfolgsmeldung (mit 'erfolgreich') angezeigt."
        }, async function () {
            resetFixture(fixtureAdminForm());
            let capturedUrl = "";
            let capturedBody = "";

            window.fetch = async function (url, options) {
                capturedUrl = String(url);
                capturedBody = options.body;
                return {
                    ok: true,
                    json: async () => ({
                        artikelId: 1,
                        name: "Testartikel",
                        preis: 10,
                        bild: "https://example.com/bild.jpg"
                    })
                };
            };

            await loadScript("../Javascript/adminHub.js");

            document.getElementById("artikelName").value = "Testartikel";
            document.getElementById("artikelPreis").value = "10.00";
            document.getElementById("artikelBild").value = "https://example.com/bild.jpg";

            await window.handleSubmit({
                preventDefault: () => {
                }
            });

            assertEqual(capturedUrl, "http://localhost:7070/artikel", "Falscher Endpoint");
            assert(capturedBody.includes("Testartikel"), "Name fehlt im Request-Body");
            assertEqual(document.getElementById("artikelName").value, "", "Name-Feld muss geleert werden");
            assert(document.getElementById("formStatus").textContent.includes("erfolgreich"), "Erfolgsmeldung fehlt");
        });

        await runTest("warenKorbArtikel: Mengenänderung sendet PUT und lädt Warenkorb neu", {
            description: "Ruft changeQuantity(1, 3) mit eingeloggtem Benutzer und gemocktem fetch auf.",
            expected: "Ein PUT an '/api/warenkorb/item/1?menge=3' wird gesendet und danach der Warenkorb neu geladen (renderCart → mindestens 2 fetch-Aufrufe)."
        }, async function () {
            resetFixture("" +
                "<div id='cart-items'></div>" +
                "<div id='total-price'></div>" +
                "<a id='checkout-btn' class='button disabled' href='../HTML/checkOut.html'>Checkout</a>");

            localStorage.setItem("userEmail", "test@example.com");

            let putUrl = "";
            let callCount = 0;

            window.fetch = async function (url, options) {
                callCount += 1;
                if (options && options.method === "PUT") {
                    putUrl = String(url);
                    return {ok: true, json: async () => ({})};
                }
                // Aufruf durch renderCart() danach
                return {
                    ok: true,
                    json: async () => ([
                        {warenkorbItemId: 1, artikelName: "A", artikelPreis: 2.5, menge: 3, artikelBild: TEST_BILD}
                    ])
                };
            };

            await loadScript("../Javascript/warenKorbArtikel.js");
            await window.changeQuantity(1, 3);

            assert(putUrl.includes("/api/warenkorb/item/1"), "Falsche URL für Mengenänderung");
            assert(putUrl.includes("menge=3"), "Neue Menge fehlt in der URL");
            assert(callCount >= 2, "Warenkorb muss nach der Änderung neu geladen werden (renderCart)");
        });

        await runTest("warenKorbArtikel: Entfernen sendet DELETE und lädt Warenkorb neu", {
            description: "Ruft removeFromCart(7) mit gemocktem fetch auf.",
            expected: "Ein DELETE an '/api/warenkorb/item/7' wird gesendet."
        }, async function () {
            resetFixture("" +
                "<div id='cart-items'></div>" +
                "<div id='total-price'></div>" +
                "<a id='checkout-btn' class='button' href='../HTML/checkOut.html'>Checkout</a>");

            localStorage.setItem("userEmail", "test@example.com");

            let deleteUrl = "";
            let deleteMethod = "";

            window.fetch = async function (url, options) {
                if (options && options.method === "DELETE") {
                    deleteUrl = String(url);
                    deleteMethod = options.method;
                    return {ok: true, json: async () => ({})};
                }
                return {ok: true, json: async () => ([])};
            };

            await loadScript("../Javascript/warenKorbArtikel.js");
            await window.removeFromCart(7);

            assertEqual(deleteMethod, "DELETE", "Entfernen muss per DELETE erfolgen");
            assert(deleteUrl.includes("/api/warenkorb/item/7"), "Falsche URL zum Entfernen");
        });

        await runTest("artikelAnzeiger: Artikelname wird nicht als HTML interpretiert (XSS)", {
            description: "Regressions-Test für eine aktuell VORHANDENE Lücke: displayArtikel() baut den Artikelnamen per innerHTML ein, ohne HTML zu escapen. Der Test übergibt einen bösartigen Namen mit onerror-Handler.",
            expected: "Der onerror-Handler darf NICHT ausgeführt werden (window.__xssAusgeloest === false). Hinweis: Der Test schlägt aktuell beabsichtigt fehl, bis das Escaping im Code behoben ist."
        }, async function () {
            resetFixture("<div id='products'></div>");
            await loadScript("../Javascript/artikelAnzeiger.js");

            const bösartigerName = "<img src=x onerror=\"window.__xssAusgeloest = true\">";
            window.__xssAusgeloest = false;

            window.displayArtikel([
                {artikelId: 1, name: bösartigerName, preis: 9.99, bild: TEST_BILD}
            ]);

            await tick();

            assertEqual(window.__xssAusgeloest, false,
                "Der Artikelname darf keinen Script-/Event-Handler-Code ausführen können");
        });

        await runTest("artikelAnzeiger: leere Artikelliste zeigt Hinweis", {
            description: "Ruft displayArtikel([]) mit einer leeren Artikel-Liste auf.",
            expected: "Im Container #products erscheint der Hinweis 'Keine Artikel verfügbar'."
        }, async function () {
            resetFixture("<div id='products'></div>");
            await loadScript("../Javascript/artikelAnzeiger.js");

            window.displayArtikel([]);

            const text = document.getElementById("products").textContent;
            assert(text.includes("Keine Artikel verfügbar"), "Hinweis bei leerer Liste fehlt");
        });

        await runTest("artikelAnzeiger: mehrere Artikel werden alle gerendert", {
            description: "Ruft displayArtikel() mit 3 Artikeln auf.",
            expected: "Es werden 3 Produktkarten (.product) im Container #products gerendert."
        }, async function () {
            resetFixture("<div id='products'></div>");
            await loadScript("../Javascript/artikelAnzeiger.js");

            window.displayArtikel([
                {artikelId: 1, name: "Artikel A", preis: 1.5, bild: TEST_BILD},
                {artikelId: 2, name: "Artikel B", preis: 2.5, bild: TEST_BILD},
                {artikelId: 3, name: "Artikel C", preis: 3.5, bild: TEST_BILD}
            ]);

            const products = document.querySelectorAll("#products .product");
            assertEqual(products.length, 3, "Es sollten 3 Produktkarten gerendert werden");
        });

        const passed = testResults.filter(function (r) {
            return r.passed;
        }).length;
        const failed = testResults.length - passed;

        const statusEl = document.getElementById("summary-status");
        summaryEl.classList.remove("running");
        summaryEl.classList.toggle("pass", failed === 0);
        summaryEl.classList.toggle("fail", failed > 0);
        statusEl.textContent = "Finished: " + passed + " passed, " + failed + " failed";

        stopElapsedTimer();
        updateCounters();
        updateFilterCounts();

        window.__TEST_RESULTS__ = {
            passed: passed,
            failed: failed,
            total: testResults.length,
            results: testResults.map(function (r) {
                return {
                    name: r.name,
                    category: r.category,
                    passed: r.passed,
                    duration: r.duration,
                    error: r.error ? r.error.message : null
                };
            })
        };
    }


    run();
})();

