import { test, expect, type Page } from "@playwright/test";
import { seedMeetingType } from "./seed-meeting-type";
import { selectBookingSlot, type SelectedBookingSlot } from "./select-booking-slot";

/**
 * C1 / Wave C — отмена бронирования владельцем (спека #13, тикеты #14–#15).
 *
 * Сквозной сценарий по US 1, 3, 6, 7 спеки:
 *   1) гость (context A) записывается на свободный слот;
 *   2) владелец открывает `/admin/bookings`, находит запись и отменяет её
 *      с подтверждением (два клика — защита от случайного удаления);
 *   3) после отмены запись исчезает из списка без перезагрузки;
 *   4) гость (context C) записывается на тот же слот повторно — слот
 *      освободился автоматически, `SLOT_TAKEN` не возникает.
 *
 * Как и в соседних спеках: никакого `page.route` / перехвата трафика —
 * только настоящий браузер по настоящему HTTP через Vite proxy `/api/*`.
 *
 * Стратегия времени: «реальные часы». Каждый spec seed'ит свой MeetingType;
 * email гостя уникален для прогона, чтобы фильтровать свою строку в списке
 * владельца (store живёт весь прогон и содержит записи других specs/retries).
 */

async function openBookingPage(page: Page, meetingTypeId: string): Promise<void> {
  await page.goto("/");
  await expect(page.getByTestId("home-page")).toBeVisible();
  await expect(page.getByTestId("meeting-types-list")).toBeVisible({ timeout: 10_000 });
  await page.getByTestId(`meeting-type-card-${meetingTypeId}`).click();
  await expect(page).toHaveURL(`/book/${meetingTypeId}`);
  await expect(page.getByTestId("book-grid")).toBeVisible({ timeout: 10_000 });
}

test("owner cancels booking on /admin/bookings; guest rebooks the same slot", async ({
  browser,
}) => {
  test.setTimeout(90_000);

  const meetingTypeId = await seedMeetingType({
    name: "Отменяемая консультация",
    description: "Слот для проверки отмены владельцем.",
    durationMinutes: 30,
  });

  const guestEmail = `alice-cancel-${Date.now()}@example.com`;

  // --- Гость A записывается.
  const ctxA = await browser.newContext();
  const pageA = await ctxA.newPage();
  pageA.setDefaultTimeout(10_000);
  await openBookingPage(pageA, meetingTypeId);
  const selection: SelectedBookingSlot = await selectBookingSlot(pageA);
  await pageA.getByTestId("booking-name").fill("Алиса");
  await pageA.getByTestId("booking-email").fill(guestEmail);
  await pageA.getByTestId("booking-submit").click();
  await expect(pageA.getByTestId("booking-success")).toBeVisible({ timeout: 10_000 });

  // --- Владелец отменяет её на /admin/bookings.
  const ctxOwner = await browser.newContext();
  const pageOwner = await ctxOwner.newPage();
  pageOwner.setDefaultTimeout(10_000);
  await pageOwner.goto("/admin/bookings");
  await expect(pageOwner.getByTestId("bookings-page")).toBeVisible();

  const row = pageOwner.getByTestId("booking-row").filter({ hasText: guestEmail }).first();
  await expect(row).toBeVisible({ timeout: 10_000 });
  expect(row).toContainText("Алиса");

  // Первый клик — только подтверждение: запись ещё на месте.
  await row.getByTestId("booking-cancel-button").click();
  await expect(pageOwner.getByTestId("booking-cancel-confirm")).toBeVisible();
  await expect(row).toBeVisible();

  // Подтверждение — запись исчезает без перезагрузки страницы.
  await pageOwner.getByTestId("booking-cancel-confirm-yes").click();
  await expect(pageOwner.getByTestId("booking-row").filter({ hasText: guestEmail })).toHaveCount(0);

  await ctxA.close();
  await ctxOwner.close();

  // --- Гость C записывается на тот же слот: он снова свободен.
  const ctxC = await browser.newContext();
  const pageC = await ctxC.newPage();
  pageC.setDefaultTimeout(10_000);
  await openBookingPage(pageC, meetingTypeId);
  const rebooked = await selectBookingSlot(pageC, selection);
  expect(rebooked.startsAt).toBe(selection.startsAt);
  await pageC.getByTestId("booking-name").fill("Григорий");
  await pageC.getByTestId("booking-email").fill("grigory@example.com");
  await pageC.getByTestId("booking-submit").click();
  await expect(pageC.getByTestId("booking-success")).toBeVisible({ timeout: 10_000 });

  await ctxC.close();
});
