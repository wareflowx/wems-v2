import {
  type ElectronApplication,
  _electron as electron,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

let electronApp: ElectronApplication;

test.describe("Agency Editing", () => {
  const timestamp = Date.now();
  const testAgency = {
    name: `Agency To Edit ${timestamp}`,
    newName: `Updated Agency ${timestamp}`,
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

  test("should open edit dialog when clicking edit button", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency to edit
    await createAgency(page, testAgency.name);

    // Click edit
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const editButton = row.locator('button:has(svg), button[aria-label*="edit" i]');
    await editButton.click();

    // Edit dialog should be visible
    const dialog = page.locator('[role="dialog"]:has-text("Edit"), [role="dialog"]:has-text("Modifier")');
    await expect(dialog).toBeVisible();
  });

  test("should pre-fill form with agency data", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency to edit
    await createAgency(page, testAgency.name);

    // Open edit dialog
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const editButton = row.locator('button:has(svg), button[aria-label*="edit" i]');
    await editButton.click();

    // Form should have pre-filled name
    const nameInput = page.locator('input[id="edit-name"], input[id="name"]');
    await expect(nameInput).toHaveValue(testAgency.name);
  });

  test("should update agency name", async () => {
    const page: Page = await electronApp.firstWindow();
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    // Create agency to edit
    await createAgency(page, testAgency.name);

    // Open edit dialog
    const row = page.locator(`table tbody tr:has-text("${testAgency.name}")`);
    const editButton = row.locator('button:has(svg), button[aria-label*="edit" i]');
    await editButton.click();

    // Change name
    const nameInput = page.locator('input[id="edit-name"], input[id="name"]');
    await nameInput.clear();
    await nameInput.fill(testAgency.newName);

    // Submit
    const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Enregistrer")');
    await saveButton.click();

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // New name should appear in table
    const newRow = page.locator(`table tbody tr:has-text("${testAgency.newName}")`);
    await expect(newRow).toBeVisible();
  });
});
