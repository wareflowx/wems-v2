import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.describe("Agency Search", () => {
  const timestamp = Date.now();
  const agencies = [
    { name: `SearchAlpha ${timestamp}`, code: "ALPHA" },
    { name: `SearchBeta ${timestamp}`, code: "BETA" },
    { name: `SearchGamma ${timestamp}`, code: "GAMMA" },
  ];

  async function createAgency(page: Page, name: string): Promise<void> {
    const addButton = page.locator('button:has-text("Add Agency"), button:has-text("Ajouter")');
    await addButton.click();

    const nameInput = page.locator('input[id="name"], input[placeholder*="name" i]');
    await nameInput.fill(name);

    const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Enregistrer")');
    await saveButton.click();

    const row = page.locator(`table tbody tr:has-text("${name}")`);
    await expect(row).toBeVisible();
  }

  test.beforeAll(async () => {
    const latestBuild = findLatestBuild();
    const appInfo = parseElectronApp(latestBuild);
    process.env.CI = "e2e";

    electronApp = await electron.launch({
      args: [appInfo.main],
    });

    // Create test agencies
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    for (const agency of agencies) {
      await createAgency(page, agency.name);
    }
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test("should filter agencies by name", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Search for Alpha
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="recherch"]');
    await searchInput.fill("Alpha");

    // Should only show Alpha
    await expect(page.locator(`table tbody tr:has-text("${agencies[0].name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${agencies[1].name}")`)).not.toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${agencies[2].name}")`)).not.toBeVisible();
  });

  test("should filter agencies by code", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Search for code
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="recherch"]');
    await searchInput.fill("BETA");

    // Should only show Beta
    await expect(page.locator(`table tbody tr:has-text("${agencies[1].name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${agencies[0].name}")`)).not.toBeVisible();
  });

  test("should be case insensitive", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Search with lowercase
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="recherch"]');
    await searchInput.fill("alpha");

    // Should show Alpha
    await expect(page.locator(`table tbody tr:has-text("${agencies[0].name}")`)).toBeVisible();
  });

  test("should show all agencies when search is cleared", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Search first
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="recherch"]');
    await searchInput.fill("Alpha");

    // Clear search
    await searchInput.clear();

    // All should be visible again
    await expect(page.locator(`table tbody tr:has-text("${agencies[0].name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${agencies[1].name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${agencies[2].name}")`)).toBeVisible();
  });
});
