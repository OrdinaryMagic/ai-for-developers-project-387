# 2026-11-14 — issue #9 «Отмена бронирования» (spec #13, tickets #14+#15)

`@implement-spec`-прогон по спеке #13 «Отмена бронирования владельцем (DELETE /bookings/{id})» (арбитр приёмки) на интеграционной ветке `opencode/issue9-20261114120655` (base `main`). Task graph: #14 (API, без блокеров) → #15 (UI, blocked by #14) — реализованы последовательно.

## Что сделано

- **#14 API** (`c67735d`): `DELETE /bookings/{id}` в `spec/routes/bookings.tsp` (204 без тела, 404 `DomainError`), новый код ошибки `BOOKING_NOT_FOUND` в `spec/models/errors.tsp`; route + `BookingStore.delete()` под тем же `AsyncLock`; регенерация `openapi.yaml`/`web/src/api/sdk.ts` командами `mise run spec` / `mise run gen:sdk`; inject-тесты (204 + исчезновение из списка + слот вернулся в availability + повторный POST успешен; 404; повторный DELETE → 404).
- **#15 UI** (`6b4ef5d`): `cancelBooking()` в feature-API (через сгенерированный `bookingsDel`, без ручных fetch/URL/типов), действие «Отменить» в `BookingsTable` с `window.confirm`-подтверждением на странице, обновление списка без перезагрузки; компонентные тесты `BookingsPage-cancel.test.tsx` (подтверждение/отказ диалога/404-ошибка); Playwright e2e `owner-cancel-booking.spec.ts`: гость записался → владелец отменил на `/admin/bookings` → гость перезаписался на тот же слот.
- **Глоссарий** (тот же коммит, что #15): статья «Отмена бронирования (владельцем)» + `BOOKING_NOT_FOUND` в списке Domain Error. PR #12 (brief) был закрыт без мержа, поэтому термин в GLOSSARY не попал ранее — добавлен здесь, как предписывала спека #13 («дополнить после мержа»).

## Non-obvious drift

- **Новый код ошибки `BOOKING_NOT_FOUND`** — спека требовала «404 по образцу других ответов на несуществующие сущности», но существующие 404 использовали `MEETING_TYPE_NOT_FOUND`, семантически не подходящий для Booking. Введён отдельный код в enum (контракт меняем через TypeSpec — канонический путь). Волна обновлений exhaustive-маппингов: `web/src/features/guest/book/BookingForm.tsx` и `web/src/features/owner/event-types/types.ts` (TS2741 при первом коммите поймал pre-commit `tsc`).
- **Подтверждение в UI — `window.confirm`**, а не shadcn `AlertDialog`: в `web/src/components/ui/` alert-dialog не установлен, спека не требовала конкретный компонент («confirmation-диалог»), выбор — минимальный диф. Для e2e — стандартный `page.on("dialog", d => d.accept())`.

## Code review findings

- Отдельный skill `code-review` недоступен в этом окружении — ручной ревью диффа `main..HEAD`: контракт только через TypeSpec/generated артефакты, удаление под локом, UI без ручных fetch/URL/типов вне SDK, e2e без подмены трафика — нарушений не найдено.
- Мелочь, не чинено: при ошибке отмены сообщение показывается под лейблом «Не удалось загрузить бронирования: …» (переиспользован `bookings-error` state) — допустимо для v1, отдельный error-стейт при необходимости добавит следующий тикет.

## Trace

- Коммиты: `c67735d` (#14), `6b4ef5d` (#15) на `opencode/issue9-20261114120655`; PR создаётся /oc-инфраструктурой автоматически из этой ветки (PR #12 был закрыт без мержа — это был brief-коммит триажа, не реализация).
- Тикеты #14/#15 закроются при merge PR (в bodies коммитов `Closes #14/#15`); спека #13 и root #9 — арбитр приёмки, закрываются мейнтейнером.
- **Gate**: per-ticket — backend `vitest` (23 файла/336 тестов), web unit (21 файл/109 тестов), pre-commit hk (gitleaks/oxlint/oxfmt/tsc web+backend); финальный — полный `make check` зелёный (backend 336 + web 109 + Playwright 3 specs, включая новый).

## Open follow-ups

- Отмена гостем и повторная запись (cancel/reschedule) — out of scope v1 (GLOSSARY).
- Отдельный error-стейт для отмены (косметика UI) — по желанию.
