import { test, expect } from "@playwright/test";
import { AgenciesPage } from "./pages/agencies-page";

test.describe("Agency Filters", () => {
  const activeAgency = { name: `Active Agency ${Date.now()}`, isActive: true };
  const inactiveAgency = { name: `Inactive Agency ${Date.now()}`, isActive: false };

  test.beforeEach(async ({ page }) => {
    await page.goto("/#/agencies");
    await page.waitForLoadState("networkidle");

    const agenciesPage = new AgenciesPage(page);

    // Create active agency
    await agenciesPage.clickAddButton();
    await agenciesPage.fillAgencyName(activeAgency.name);
    await agenciesPage.submitCreateDialog();
    await expect(agenciesPage.getAgencyRow(activeAgency.name)).toBeVisible();

    // Create inactive agency
    await agenciesPage.clickAddButton();
    await agenciesPage.fillAgencyName(inactiveAgency.name);
    await agenciesPage.toggleIsActive();
    await agenciesPage.submitCreateDialog();
    await expect(agenciesPage.getAgencyRow(inactiveAgency.name)).toBeVisible();
  });

  test("should show all agencies when status filter is 'all'", async ({ page }) => {
    const agenciesPage = new AgenciesPage(page);

    // Both should be visible initially
    await expect(agenciesPage.getAgencyRow(activeAgency.name)).toBeVisible();
    await expect(agenciesPage.getAgencyRow(inactiveAgency.name)).toBeVisible();
  });

  test("should filter to show only active agencies", async ({ page }) => {
    const agenciesPage = new AgenciesPage(page);

    // Select active filter (depending on UI implementation)
    // This could be a dropdown, tabs, or buttons
    const activeFilter = page.locator('button:has-text("Active"), [role="option"]:has-text("Active")');
    if (await activeFilter.isVisible()) {
      await activeFilter.click();
    }

    // Should show active, hide inactive
    await expect(agenciesPage.getAgencyRow(activeAgency.name)).toBeVisible();
    await expect(agenciesPage.getAgencyRow(inactiveAgency.name)).not.toBeVisible();
  });

  test("should filter to show only inactive agencies", async ({ page }) => {
    const agenciesPage = new AgenciesPage(page);

    // Select inactive filter
    const inactiveFilter = page.locator('button:has-text("Inactive"), [role="option"]:has-text("Inactive")');
    if (await inactiveFilter.isVisible()) {
      await inactiveFilter.click();
    }

    // Should show inactive, hide active
    await expect(agenciesPage.getAgencyRow(inactiveAgency.name)).toBeVisible();
    await expect(agenciesPage.getAgencyRow(activeAgency.name)).not.toBeVisible();
  });

  test("should update metrics when filtering", async ({ page }) => {
    const agenciesPage = new AgenciesPage(page);

    // Get initial counts
    const totalBefore = await agenciesPage.getMetricValue("Total");
    const activeBefore = await agenciesPage.getMetricValue("Active");
    const inactiveBefore = await agenciesPage.getMetricValue("Inactive");

    // Filter to active only
    const activeFilter = page.locator('button:has-text("Active"), [role="option"]:has-text("Active")');
    if (await activeFilter.isVisible()) {
      await activeFilter.click();
    }

    // Active count should equal total in filtered view
    const activeAfter = await agenciesPage.getMetricValue("Active");
    expect(activeAfter).toBeGreaterThan(0);

    // Inactive should not be visible in filtered count
    const inactiveAfter = await agenciesPage.getMetricValue("Inactive");
    expect(inactiveAfter).toBe(0);
  });
});
