import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { BookingsPage } from "./index";
import { OwnerTimezoneProvider } from "./OwnerTimezoneContext";

const ONE_BOOKING = {
  id: "00000000-0000-4000-8000-000000000001",
  meetingTypeId: "00000000-0000-4000-8000-000000000002",
  meetingTypeName: "Intro 30m",
  guestName: "Alice",
  guestEmail: "alice@example.test",
  startsAt: "2026-12-01T09:00:00+03:00",
  endsAt: "2026-12-01T09:30:00+03:00",
};

type FetchCall = { url: string; method: string };

/**
 * Мокает fetch на границе SDK-URL: GET /api/bookings отдаёт текущий список,
 * DELETE /api/bookings/{id} — 204 и снимает запись из списка (как настоящий
 * бэкенд после жёсткого удаления). Все остальные запросы — reject.
 */
function mockFetch(bookings: unknown[], timezone = "Europe/Moscow"): FetchCall[] {
  let current: unknown[] = [...bookings];
  const calls: FetchCall[] = [];
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    const method = (
      init?.method ?? (input instanceof Request ? input.method : "GET")
    ).toUpperCase();
    calls.push({ url, method });
    if (url === "/api/bookings" && method === "GET") {
      return Promise.resolve(
        new Response(JSON.stringify(current), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
    if (url.startsWith("/api/bookings/") && method === "DELETE") {
      const id = url.slice("/api/bookings/".length);
      current = current.filter((b) => (b as { id?: string }).id !== id);
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (url === "/api/config") {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            owner: { name: "Owner", timezone },
            windowDays: 14,
            slotStepMinutes: 30,
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: "09:00", end: "18:00" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    }
    return Promise.reject(new Error(`Unexpected fetch: ${method} ${url}`));
  });
  return calls;
}

function renderPage(): void {
  render(
    <MemoryRouter>
      <OwnerTimezoneProvider>
        <BookingsPage />
      </OwnerTimezoneProvider>
    </MemoryRouter>,
  );
}

describe("BookingsPage (cancel action)", () => {
  beforeEach(() => {
    mockFetch([ONE_BOOKING]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("у каждой записи есть действие отмены и колонка «Действия»", async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("bookings-table")).toBeInTheDocument();
    });
    expect(screen.getByTestId("bookings-table-head-actions")).toBeInTheDocument();
    expect(screen.getByTestId("booking-cancel-button")).toBeInTheDocument();
    expect(screen.queryByTestId("booking-cancel-confirm")).not.toBeInTheDocument();
  });

  it("первый клик запрашивает подтверждение; «Оставить» не удаляет запись", async () => {
    const user = userEvent.setup();
    const calls = mockFetch([ONE_BOOKING]);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("booking-cancel-button")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("booking-cancel-button"));

    expect(screen.getByTestId("booking-cancel-confirm")).toBeInTheDocument();

    await user.click(screen.getByTestId("booking-cancel-confirm-no"));

    expect(screen.queryByTestId("booking-cancel-confirm")).not.toBeInTheDocument();
    expect(screen.getByTestId("booking-row")).toBeInTheDocument();
    expect(calls.filter((c) => c.method === "DELETE")).toEqual([]);
  });

  it("после подтверждения запись исчезает из списка без перезагрузки", async () => {
    const user = userEvent.setup();
    const calls = mockFetch([ONE_BOOKING]);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId("booking-cancel-button")).toBeInTheDocument();
    });
    await user.click(screen.getByTestId("booking-cancel-button"));
    await user.click(screen.getByTestId("booking-cancel-confirm-yes"));

    await waitFor(() => {
      expect(screen.queryByTestId("booking-row")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("bookings-empty")).toHaveTextContent("Нет предстоящих встреч");

    const deletes = calls.filter((c) => c.method === "DELETE");
    expect(deletes).toEqual([
      { url: "/api/bookings/00000000-0000-4000-8000-000000000001", method: "DELETE" },
    ]);
  });
});
