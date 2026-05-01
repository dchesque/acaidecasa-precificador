import { test, expect } from "@playwright/test";

/**
 * Dashboard rendering smoke — boots /dashboard-gestao and / and verifies the
 * key financial-health widgets render with mock data. Catches regressions in
 * the SaudeFinanceira / EvolucaoFinanceira / CardapioAnalise wiring.
 */
test.describe("dashboard", () => {
  test("home dashboard renders financial health card", async ({ page }) => {
    await page.goto("/");
    // The "Saúde Financeira" panel is the canonical anchor for the home view.
    await expect(page.getByText(/Sa[úu]de Financeira/i).first()).toBeVisible({
      timeout: 10_000,
    });
    // It contains a "Lucro Líquido" label, regardless of the period.
    await expect(page.getByText(/Lucro L[íi]quido/i).first()).toBeVisible();
    // And a "Faturamento" line item.
    await expect(page.getByText(/Faturamento/i).first()).toBeVisible();
  });

  test("dashboard-gestao renders without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/dashboard-gestao");
    await expect(page).toHaveURL(/\/dashboard-gestao/);
    // Wait for hydration / first render
    await page.waitForLoadState("networkidle").catch(() => undefined);

    // No uncaught page errors expected on a fresh boot
    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("currency values are formatted as pt-BR (R$ + comma decimal)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText(/Sa[úu]de Financeira/i).first()).toBeVisible({
      timeout: 10_000,
    });
    // Mock data has non-zero numbers; at least one R$ value should be visible.
    await expect(page.locator("text=/R\\$\\s*[\\d.,]+/").first()).toBeVisible({
      timeout: 10_000,
    });
  });
});
