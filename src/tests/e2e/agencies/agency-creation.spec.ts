import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.describe("Agency Creation", () => {
  const testAgency = {
    name: `Test Agency ${Date.now()}`,
  };

  test.beforeAll(async () => {
    const latestBuild = findLatestBuild("dist");
    const appInfo = parseElectronApp(latestBuild);
    process.env.CI = "e2e";

    electronApp = await electron.launch({
      args: [appInfo.main],
    });
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test("should open create dialog when clicking add button", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Click add button
    const addButton = page.locator('button:has-text("Add Agency"), button:has-text("Ajouter")');
    await addButton.click();

    // Dialog should be visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
  });

  test("should create agency with name and auto-generated code", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Open create dialog
    const addButton = page.locator('button:has-text("Add Agency"), button:has-text("Ajouter")');
    await addButton.click();

    // Fill name
    const nameInput = page.locator('input[id="name"], input[placeholder*="name" i]');
    await nameInput.fill(testAgency.name);

    // Submit
    const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Enregistrer")');
    await saveButton.click();

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Agency should appear in table
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    await expect(row).toBeVisible();
  });

  test("should show validation error when name is empty", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Open create dialog
    const addButton = page.locator('button:has-text("Add Agency"), button:has-text("Ajouter")');
    await addButton.click();

    // Submit without filling name
    const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Enregistrer")');
    await expect(saveButton).toBeDisabled();
  });
});
