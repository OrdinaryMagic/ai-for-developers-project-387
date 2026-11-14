import { test, expect } from "@playwright/test";
import { seedMeetingType } from "./seed-meeting-type";
import { selectBookingSlot } from "./select-booking-slot";

/**
 * Спека #13 / тикет #15: владелец отменяет бронирование на странице
 * «Бронирования» (`/admin/bookings`), после чего слот снова становится
 * доступным гостю.
 *
 * Путь (спека #13, Testing Decisions → E2E-сшив):
 *   1) гость записывается на первый доступный слот;
 *   2) владелец открывает `/admin/bookings`, жмёт «Отменить» в строке
 *      своего гостя и подтверждает действие в диалоге;
 *   3) запись исчезает из списка без перезагрузки;
 *   4) гость повторно записывается на тот же слот (тот же день/время) —
 *      слот освобождён жёстким удалением, `SLOT_TAKEN` не возникает.
 *
 * Тот же запрет на подмену трафика, что и в остальных e2e: только
 * реальный HTTP. `workers: 1` — спеки идут последовательно, каждый
 * spec seed'ит свой MeetingType; конфликт по слоту исключён отбором
 * первого доступного слота из настоящей сетки.
 */
test("owner cancels booking on /admin/bookings; guest rebooks the freed slot", async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);

  const meetingTypeId = await seedMeetingType({
    name: "Отменяемая консультация",
    description: "Слот для проверки отмены владельцем.",
    durationMinutes: 30,
  });

  // --- Гость записывается на первый доступный слот.
  const ctxGuest = await browser.newContext();
  const guestPage = await ctxGuest.newPage();
  guestPage.setDefaultTimeout(10_000);
  await guestPage.goto("/");
  await expect(guestPage.getByTestId("meeting-types-list")).toBeVisible({ timeout: 10_000 });
  await guestPage.getByTestId(`meeting-type-card-${meetingTypeId}`).click();
  await expect(guestPage).toHaveURL(`/book/${meetingTypeId}`);
  await expect(guestPage.getByTestId("book-grid")).toBeVisible({ timeout: 10_000 });

  const selection = await selectBookingSlot(guestPage);
  await guestPage.getByTestId("booking-name").fill("Иван Отмена");
  await guestPage.getByTestId("booking-email").fill("cancel@example.com");
  await guestPage.getByTestId("booking-submit").click();
  await expect(guestPage.getByTestId("booking-success")).toBeVisible({ timeout: 10_000 });
  await ctxGuest.close();

  // --- Владелец отменяет запись со страницы «Бронирования».
  await page.goto("/admin/bookings");
  await expect(page.getByTestId("bookings-table")).toBeVisible({ timeout: 10_000 });

  const row = page.getByTestId("booking-row").filter({ hasText: "Иван Отмена" });
  await expect(row).toHaveCount(1);

  // Подтверждение запрашивается до удаления — принимаем диалог.
  page.on("dialog", (dialog) => dialog.accept());
  await row.getByTestId("booking-cancel").click();

  // Запись исчезает из списка без перезагрузки страницы.
  await expect(row).toHaveCount(0);

  // --- Гость повторно записывается на освобождённый слот.
  const ctxRebook = await browser.newContext();
  const rebookPage = await ctxRebook.newPage();
  rebookPage.setDefaultTimeout(10_000);
  await rebookPage.goto(`/book/${meetingTypeId}`);
  await expect(rebookPage.getByTestId("book-grid")).toBeVisible({ timeout: 10_000 });

  // Тот же день и то же время: слот освобождён жёстким удалением.
  const rebookSelection = await selectBookingSlot(rebookPage, selection);
  expect(rebookSelection).toEqual(selection);

  await rebookPage.getByTestId("booking-name").fill("Иван Отмена");
  await rebookPage.getByTestId("booking-email").fill("cancel@example.com");
  await rebookPage.getByTestId("booking-submit").click();
  await expect(rebookPage.getByTestId("booking-success")).toBeVisible({ timeout: 10_000 });
  await ctxRebook.close();
});
