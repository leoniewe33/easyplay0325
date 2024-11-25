// @ts-check
const { test, expect } = require('@playwright/test');

// Test 1: Prüft den Seitentitel
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Erwartet, dass der Titel "Playwright" enthält
  await expect(page).toHaveTitle(/Playwright/);
});

// Test 2: Prüft den "Get started"-Link
test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Klickt auf den "Get started"-Link
  await page.getByRole('link', { name: 'Get started' }).click();

  // Erwartet eine Überschrift mit dem Namen "Installation"
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});

// Test 3: Wechselt in den Light-Mode und überprüft die Hintergrundfarbe des nav-Elements
test('switch to light mode and verify nav background color', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Klickt auf den Navbar-Toggle-Button, um das Menü aufzuklappen
  await page.locator('.navbar__toggle.clean-btn').click();

  // Klickt auf den Button, um in den Light-Mode zu wechseln
  await page.getByTitle('Switch between dark and light mode (currently dark mode)').click();

  // Überprüft, ob die Hintergrundfarbe des nav-Elements korrekt ist
  const navBackgroundColor = await page.locator('nav').evaluate(
    (nav) => window.getComputedStyle(nav).backgroundColor
  );
  expect(navBackgroundColor).toBe('rgb(255, 255, 255)');
});