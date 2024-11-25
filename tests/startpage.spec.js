const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:8000/src/index.html';

test.describe('Startseite der Podcast-App', () => {
  test('Prüft, ob der richtige Titel angezeigt wird', async ({ page }) => {
    await page.goto(baseURL);
    const expectedTitle = 'Easy Play';
    const actualTitle = await page.textContent('.header-title');
    expect(actualTitle).toBe(expectedTitle);
  });
});