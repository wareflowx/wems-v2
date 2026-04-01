import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.describe("Agency Deletion", () => {
  const testAgency = {
    name: `Agency To Delete ${Date.now()}`,
  };

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

  test("should open delete dialog when clicking delete button", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency to delete
    await createAgency(page, testAgency.name);

    // Click delete
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const deleteButton = row.locator('button:has(svg[class*="red"]), button[aria-label*="delete" i]');
    await deleteButton.click();

    // Delete dialog should be visible
    const dialog = page.locator('[role="dialog"]:has-text("Delete"), [role="dialog"]:has-text("Supprimer")');
    await expect(dialog).toBeVisible();
  });

  test("should show agency name in delete confirmation", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency
    await createAgency(page, testAgency.name);

    // Open delete dialog
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const deleteButton = row.locator('button:has(svg[class*="red"]), button[aria-label*="delete" i]');
    await deleteButton.click();

    // Should show agency name in dialog
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.locator(`text=${testAgency.name}`)).toBeVisible();
  });

  test("should delete agency and remove from table", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency
    await createAgency(page, testAgency.name);

    // Delete agency
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const deleteButton = row.locator('button:has(svg[class*="red"]), button[aria-label*="delete" i]');
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = page.locator('[role="dialog"] button:has-text("Delete"), [role="dialog"] button:has-text("Supprimer")');
    await confirmButton.click();

    // Agency should be removed
    await expect(row).not.toBeVisible();
  });
});
