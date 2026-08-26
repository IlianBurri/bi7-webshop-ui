# UI Smoke Tests (No Framework)

These tests run directly in a real browser and validate core webshop UI behavior with plain JavaScript.

## Files

- `ui-tests.html` - tiny runner page
- `ui-tests.js` - minimal test harness + smoke tests

## What is tested

- Product rendering (`displayArtikel`) from `../Javascript/artikelAnzeiger.js`
- Cart add guard without login (`inDenWarenkorb`)
- Login submit request payload (`../Javascript/login.js`)
- Cart rendering and total calculation (`../Javascript/warenKorbArtikel.js`)

## Run locally

1. Start the web server for this project.
2. Open this URL in a browser:

```text
http://localhost:8080/tests/ui-tests.html
```

You will see pass/fail lines and a summary on the page.

## Optional: headless run

If Chromium is available, run:

```bash
chromium --headless --disable-gpu --virtual-time-budget=4000 --dump-dom \
  http://localhost:8080/tests/ui-tests.html
```

Then check the summary line in the output (`Finished: X passed, Y failed`).

