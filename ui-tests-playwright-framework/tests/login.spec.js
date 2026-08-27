const { test, expect } = require("@playwright/test");

test("login submits credentials and stores user data", async ({ page }) => {
  await page.route("http://localhost:7070/users/login", async (route) => {
    const postData = route.request().postDataJSON();

    expect(postData.email).toBe("max@example.com");
    expect(postData.password).toBe("secret");

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ username: "Max" })
    });
  });

  // Landing page fetch after redirect should not hit a real backend.
  await page.route("http://localhost:7070/artikel", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.goto("/HTML/loginForm.html");

  await page.fill("#email", "max@example.com");
  await page.fill("#password", "secret");
  await page.getByRole("button", { name: "Anmelden" }).click();

  await expect(page).toHaveURL(/landingpage\.html/);

  const stored = await page.evaluate(() => ({
    username: localStorage.getItem("username"),
    email: localStorage.getItem("userEmail")
  }));

  expect(stored.username).toBe("Max");
  expect(stored.email).toBe("max@example.com");
});

