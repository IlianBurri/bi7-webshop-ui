const { test, expect } = require("@playwright/test");

test("cart shows computed total and enables checkout", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("userEmail", "test@example.com");
  });

  await page.route("http://localhost:7070/api/warenkorb/test%40example.com", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { warenkorbItemId: 1, artikelName: "A", artikelPreis: 2.5, menge: 2, artikelBild: "" },
        { warenkorbItemId: 2, artikelName: "B", artikelPreis: 3.0, menge: 1, artikelBild: "" }
      ])
    });
  });

  await page.goto("/HTML/warenkorb.html");

  await expect(page.locator("#cart-items article.cart-item")).toHaveCount(2);
  await expect(page.locator("#total-price")).toHaveText("CHF 8.00");
  await expect(page.locator("#checkout-btn")).not.toHaveClass(/disabled/);
});

test("cart prompts login when there is no stored user", async ({ page }) => {
  await page.goto("/HTML/warenkorb.html");

  await expect(page.locator("#cart-items")).toContainText("Bitte einloggen");
  await expect(page.locator("#total-price")).toHaveText("CHF 0.00");
  await expect(page.locator("#checkout-btn")).toHaveClass(/disabled/);
});

