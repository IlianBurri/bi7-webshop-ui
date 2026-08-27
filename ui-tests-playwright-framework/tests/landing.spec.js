const { test, expect } = require("@playwright/test");

test("landing page renders products from API", async ({ page }) => {
  await page.route("http://localhost:7070/artikel", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { artikelId: 1, name: "Kaffee", preis: 5.5, bild: "" },
        { artikelId: 2, name: "Tee", preis: 4.0, bild: "" }
      ])
    });
  });

  await page.goto("/HTML/landingpage.html", { waitUntil: "domcontentloaded" });

  await expect(page.locator("#products article.product")).toHaveCount(2);
  await expect(page.locator("#products article.product h3").first()).toHaveText("Kaffee");
  await expect(page.locator("#products article.product").first()).toContainText("CHF 5.50");
  await expect(page.getByRole("button", { name: "In den Warenkorb" }).first()).toBeVisible();
});

test("add-to-cart shows login alert when user is not logged in", async ({ page }) => {
  await page.route("http://localhost:7070/artikel", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([{ artikelId: 1, name: "Kaffee", preis: 5.5, bild: "" }])
    });
  });

  await page.goto("/HTML/landingpage.html", { waitUntil: "domcontentloaded" });

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "In den Warenkorb" }).first().click({ force: true });
  await expect.poll(() => dialogMessage).toBe("Bitte erst einloggen!");
});



