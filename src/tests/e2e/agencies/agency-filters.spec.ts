import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.describe("Agency Filters", () => {
  const timestamp = Date.now();
  const activeAgency = { name: `Active Agency ${timestamp}` };
  const inactiveAgency = { name: `Inactive Agency ${timestamp}` };

  async function createAgency(page: Page, name: string, isActive: boolean = true): Promise<void> {
    const addButton = page.locator('button:has-text("Add Agency"), button:has-text("Ajouter")');
    await addButton.click();

    const nameInput = page.locator('input[id="name"], input[placeholder*="name" i]');
    await nameInput.fill(name);

    // Toggle isActive if we want inactive
    if (!isActive) {
      const toggle = page.locator('input[id="isActive"], input[type="checkbox"]').first();
      if (await toggle.isVisible()) {
        await toggle.click();
      }
    }

    const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Enregistrer")');
    await saveButton.click();

    const row = page.locator(`table tbody tr:has-text("${name}")`);
    await expect(row).toBeVisible();
  }

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

  test("should show all agencies when status filter is 'all'", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Both should be visible initially
    await expect(page.locator(`table tbody tr:has-text("${activeAgency.name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${inactiveAgency.name}")`)).toBeVisible();
  });

  test("should filter to show only active agencies", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Select active filter (depending on UI implementation)
    // This could be a dropdown, tabs, or buttons
    const activeFilter = page.locator('button:has-text("Active"), [role="option"]:has-text("Active")');
    if (await activeFilter.isVisible()) {
      await activeFilter.click();
    }

    // Should show active, hide inactive
    await expect(page.locator(`table tbody tr:has-text("${activeAgency.name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${inactiveAgency.name}")`)).not.toBeVisible();
  });

  test("should filter to show only inactive agencies", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Select inactive filter
    const inactiveFilter = page.locator('button:has-text("Inactive"), [role="option"]:has-text("Inactive")');
    if (await inactiveFilter.isVisible()) {
      await inactiveFilter.click();
    }

    // Should show inactive, hide active
    await expect(page.locator(`table tbody tr:has-text("${inactiveAgency.name}")`)).toBeVisible();
    await expect(page.locator(`table tbody tr:has-text("${activeAgency.name}")`)).not.toBeVisible();
  });
});
