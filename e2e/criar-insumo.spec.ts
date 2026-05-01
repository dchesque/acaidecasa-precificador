import { test, expect } from "@playwright/test";

/**
 * Insumo CRUD flow — exercises the InsumoModal stepper end-to-end against the
 * mock-mode app. The form has 3 steps (Informações Básicas → Categoria/Unidade
 * → Fornecedores), so the test walks through each Next, then verifies the new
 * insumo appears in the table.
 *
 * Why mock mode: without Supabase the optimistic dispatch lands in the
 * AppContext immediately, so the table updates in the same tick.
 */
test("user creates a new insumo through the multi-step modal", async ({ page }) => {
  await page.goto("/insumos");
  await expect(page).toHaveURL(/\/insumos/);

  // Open the create modal — the page header has a "Novo Insumo" / "Adicionar"
  // button. We accept either copy.
  const createButton = page
    .getByRole("button", { name: /Novo Insumo|Adicionar Insumo|\+ Insumo/i })
    .first();
  await createButton.click();

  // The BaseModal renders into a Radix Dialog
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();

  const uniqueName = `Açaí Polpa E2E ${Date.now()}`;

  // Step 1: Informações Básicas
  await modal.getByLabel(/Nome/i).first().fill(uniqueName);
  await modal
    .getByLabel(/Descri[çc][ãa]o/i)
    .first()
    .fill("Polpa de açaí premium importada para teste E2E");
  await modal.getByRole("button", { name: /Próximo|Avançar|Continuar/i }).click();

  // Step 2: Categoria + Unidade — pick the first option from each Select
  // The Radix selects expose role=combobox triggers
  const selects = modal.getByRole("combobox");
  const firstSelect = selects.first();
  await firstSelect.click();
  // First option in the listbox
  await page.getByRole("option").first().click();
  // Wait for the listbox to close before opening the next one
  await page.keyboard.press("Escape").catch(() => undefined);

  const secondSelect = selects.nth(1);
  if (await secondSelect.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await secondSelect.click();
    await page.getByRole("option").first().click();
  }

  await modal.getByRole("button", { name: /Próximo|Avançar|Continuar/i }).click();

  // Step 3: Fornecedores — skipping the supplier add and submitting (the mock
  // happily persists an insumo without suppliers; the cost-per-unit just stays
  // at 0). The submit copy is "Salvar" or "Criar Insumo".
  const submit = modal.getByRole("button", { name: /Salvar|Criar Insumo/i }).first();
  await submit.click();

  // Modal should close
  await expect(modal).not.toBeVisible({ timeout: 10_000 });

  // The new insumo shows up in the table — search for the unique name we used
  await expect(page.getByText(uniqueName).first()).toBeVisible({ timeout: 10_000 });
});
