const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:1234/src/index.html';

test.describe('Startseite der Podcast-App', () => {
  test('Prüft, ob der richtige Titel angezeigt wird', async ({ page }) => {
    await page.goto(baseURL);
    const expectedTitle = 'Easy Play';
    const actualTitle = await page.textContent('.header-title');
    expect(actualTitle).toBe(expectedTitle);
  });
});

test.describe('API Erreichbarkeitstest', () => 
{
  test('Prüft, ob die API von der Webseite erreicht wird', async({page}) =>
  {
    await page.goto(baseURL);
    const buttonExists = await page.locator('input.category-button').count();
    const button = page.locator('input.category-button');
    console.log('Anzahl der gefundenen Buttons:', buttonExists);
    console.log(button);
    await expect(button).toBeVisible();
});
});