const { test, expect } = require("@playwright/test");

test("checkout can submit and shows success alert", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("userEmail", "test@example.com");
  });

  await page.route("http://localhost:7070/api/adressen?email=test%40example.com", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/HTML/checkOut.html", { waitUntil: "domcontentloaded" });

  await page.fill("#vorname", "Max");
  await page.fill("#nachname", "Muster");
  await page.fill("#strasse", "Bahnhofstrasse 1");
  await page.fill("#plz", "8001");
  await page.fill("#ort", "Zuerich");
  await page.fill("#land", "Schweiz");
  await page.fill("#email", "max@example.com");

  await page.fill("#karteninhaber", "Max Muster");
  await page.fill("#kartennummer", "4242424242424242");
  await page.fill("#ablauf", "12/30");
  await page.fill("#cvc", "123");

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Jetzt bezahlen" }).click({ force: true });
  await expect.poll(() => dialogMessage).toBe("Vielen Dank! Deine Bestellung wurde abgeschlossen.");
});



