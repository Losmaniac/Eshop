import { expect, test } from "@playwright/test";

test("add to cart → checkout → confirmation with QR payment", async ({ page }) => {
  await page.goto("/obchod/grilovaci-plat");
  await page.getByText("Ø 800 mm", { exact: true }).click();
  await expect(page.getByText("4 900 Kč").first()).toBeVisible();
  await page.getByRole("button", { name: "Přidat do košíku" }).click();

  const drawer = page.getByRole("dialog", { name: "Košík" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("link", { name: "Grilovací plát na ohniště" })).toBeVisible();
  await drawer.getByRole("link", { name: "Pokračovat k objednávce" }).click();

  await expect(page).toHaveURL(/\/pokladna/);
  await page.getByLabel("Jméno a příjmení").fill("Jan Novák");
  await page.getByLabel("E-mail").fill("jan@example.com");
  await page.getByLabel("Telefon").fill("+420 777 123 456");
  await page.getByText("Kurýr po ČR").click();
  await page.getByLabel("Ulice a číslo popisné").fill("Dlouhá 1");
  await page.getByLabel("Město").fill("Praha");
  await page.getByLabel("PSČ").fill("110 00");
  await page.getByLabel(/Souhlasím s/).check();

  // 4 900 Kč plate + 390 Kč courier (17,8 kg)
  await expect(page.getByText("5 290 Kč")).toBeVisible();
  await page.getByRole("button", { name: "Objednat s povinností platby" }).click();

  await expect(page).toHaveURL(/\/objednavka\/[A-Za-z0-9_-]{20,}$/);
  await expect(page.getByRole("heading", { name: "Děkujeme za objednávku" })).toBeVisible();

  const qr = page.getByTestId("payment-qr");
  await expect(qr.locator("svg")).toBeVisible();
  const spayd = await qr.getAttribute("data-spayd");
  expect(spayd).toMatch(/^SPD\*1\.0\*ACC:CZ6508000000192000145399\*AM:5290\.00\*CC:CZK\*DT:\d{8}\*X-VS:\d{10}\*/);

  const vs = spayd!.match(/X-VS:(\d{10})/)![1];
  await expect(page.getByText(vs).first()).toBeVisible();

  // The cart is emptied after a successful order.
  await page.goto("/kosik");
  await expect(page.locator("main").getByText("Košík je zatím prázdný.")).toBeVisible();
});

test("server rejects manipulated prices and unknown products", async ({ request }) => {
  const base = {
    name: "Test",
    email: "test@example.com",
    phone: "777123456",
    deliveryMethod: "pickup",
    consentTerms: true,
  };
  const manipulated = await request.post("/api/orders", {
    data: { ...base, items: [{ slug: "grilovaci-plat", variantId: "800", quantity: 1, price: 1 }], total: 1 },
  });
  expect(manipulated.ok()).toBe(true);
  const { token } = await manipulated.json();
  const page = await request.get(`/objednavka/${token}`);
  expect(await page.text()).toContain("AM:4900.00");

  const unknown = await request.post("/api/orders", {
    data: { ...base, items: [{ slug: "grilovaci-plat", variantId: "1", quantity: 1 }] },
  });
  expect(unknown.status()).toBe(400);
});
