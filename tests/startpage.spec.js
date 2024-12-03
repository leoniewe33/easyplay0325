const { test, expect } = require('@playwright/test');

const baseURL = 'http://localhost:1234/src/index.html';
const podcastDashUrl = 'http://localhost:1234/src/podcastDash.html';


test.describe('Startseite der Podcast-App', () => {
  test('Prüft, ob der richtige Titel angezeigt wird', async ({ page }) => {
    await page.goto(baseURL);
    const expectedTitle = 'Easy Play';
    const actualTitle = await page.textContent('.header-title');
    expect(actualTitle).toBe(expectedTitle);
  });
});

test.describe('Logo ist animiert beim laden', () => {
  test('Prüfe, ob das Logo animiert beim laden der Webseite', async ({page}) => {
    await page.goto(baseURL);
    
    const loadingAnimation = await page.locator('#loadingAnimation');
    await expect(loadingAnimation).toBeVisible();

    expect(loadingAnimation).not.toBe('none');

    const animationStyle = await loadingAnimation.evaluate((el) =>
      window.getComputedStyle(el).getPropertyValue('display')
    );
  });
});

test.describe('Suche wird sichtbar beim Klicken auf das Search-Icon', () => {
  test('Prüfe, ob das Suchfeld beim Klick auf das Suchlogo auftaucht', async ({page}) => {
    await page.goto(baseURL);

    const searchIcon = page.locator('.search-button');
    const searchField = page.locator('podcast-search');

    await expect(searchField).toBeHidden;

    await searchIcon.click();

    await expect(searchField).toBeVisible;

  });
});

test.describe('Verlinkung von Podcast zu Übersichtsseite', () => {
  test('Prüfe, ob beim Klick auf einen Podcast die Übersicht des Podcasts angezeigt wird', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto(baseURL, { waitUntil: 'load' });

    const podcast = page.locator('#podcast-list');
    
    podcast.click();
    await Promise.all([
      page.waitForURL(podcastDashUrl, { waitUntil: 'load' }),
    ]);

    expect(page.url()).toBe(podcastDashUrl);
  });
});