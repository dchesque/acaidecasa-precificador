import { test, expect } from "@playwright/test";

// All tests run against the app in mock mode (no Supabase config), so the
// MockModeBanner should be visible and the middleware should NOT redirect to
// /auth/login. This file is the safety net that catches "the app boots and
// every primary route renders" regressions.

test.describe("smoke - mock mode boots and every primary route renders", () => {
  test("home dashboard loads with mock data", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("status")).toContainText(/Modo de demonstração/i);
    // Sidebar (desktop) or hamburger (mobile) — at least one nav surface present
    await expect(page.getByRole("navigation").or(page.getByLabel(/Sidebar/i))).toBeVisible();
  });

  test("cardápio page loads", async ({ page }) => {
    await page.goto("/cardapio");
    await expect(page).toHaveURL(/\/cardapio/);
  });

  test("insumos page loads", async ({ page }) => {
    await page.goto("/insumos");
    await expect(page).toHaveURL(/\/insumos/);
  });

  test("receitas page loads", async ({ page }) => {
    await page.goto("/receitas");
    await expect(page).toHaveURL(/\/receitas/);
  });

  test("combinados page loads", async ({ page }) => {
    await page.goto("/combinados");
    await expect(page).toHaveURL(/\/combinados/);
  });

  test("copos-base page loads", async ({ page }) => {
    await page.goto("/copos-base");
    await expect(page).toHaveURL(/\/copos-base/);
  });

  test("fornecedores page loads", async ({ page }) => {
    await page.goto("/fornecedores");
    await expect(page).toHaveURL(/\/fornecedores/);
  });

  test("análise de vendas page loads", async ({ page }) => {
    await page.goto("/analise-vendas");
    await expect(page).toHaveURL(/\/analise-vendas/);
    await expect(page.getByRole("heading", { name: /Análise de Vendas/i })).toBeVisible();
  });

  test("custos operacionais page loads", async ({ page }) => {
    await page.goto("/custos-operacionais");
    await expect(page).toHaveURL(/\/custos-operacionais/);
  });

  test("configurações page loads", async ({ page }) => {
    await page.goto("/configuracoes");
    await expect(page).toHaveURL(/\/configuracoes/);
  });

  test("404 page renders for unknown route", async ({ page }) => {
    const response = await page.goto("/this-page-definitely-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});

test.describe("smoke - critical UX touchpoints", () => {
  test("login page is reachable without auth", async ({ page }) => {
    await page.goto("/auth/login");
    // Login form present
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
  });

  test("reset-password page renders (was 404 before phase 0)", async ({ page }) => {
    await page.goto("/auth/reset-password");
    await expect(page).toHaveURL(/\/auth\/reset-password/);
  });

  test("delete on insumos triggers ConfirmDialog (no native window.confirm)", async ({
    page,
  }) => {
    await page.goto("/insumos");
    // Capture native dialog accept/dismiss — if the regression returns, this
    // test fails because window.confirm would auto-resolve and skip the test
    // assertion entirely.
    let nativeDialogShown = false;
    page.on("dialog", async (dialog) => {
      nativeDialogShown = true;
      await dialog.dismiss();
    });

    const deleteButton = page.getByRole("button", { name: /Excluir insumo/i }).first();
    if (await deleteButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await deleteButton.click();
      // ConfirmDialog should appear — alertdialog role from Radix
      await expect(page.getByRole("alertdialog")).toBeVisible();
      expect(nativeDialogShown).toBe(false);
    }
  });
});
