import "@testing-library/jest-dom/vitest";

import { afterEach, describe, expect, it, vi } from "vitest";
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

type FetchHandler = (url: string, method: string) => Response | Promise<Response>;

function mockFetch(handler: FetchHandler): void {
  vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    const method = (init?.method ?? "GET").toUpperCase();
    const response = handler(url, method);
    return Promise.resolve(response);
  });
}

function mockSuccessApi(bookings: unknown[], timezone = "Europe/Moscow"): void {
  mockFetch((url, method) => {
    if (url === "/api/bookings" && method === "GET") {
      return new Response(JSON.stringify(bookings), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.startsWith("/api/bookings/") && method === "DELETE") {
      return new Response(null, { status: 204 });
    }
    if (url === "/api/config") {
      return new Response(
        JSON.stringify({
          owner: { name: "Owner", timezone },
          windowDays: 14,
          slotStepMinutes: 30,
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: "09:00", end: "18:00" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(JSON.stringify({ message: `Unexpected fetch: ${url}` }), { status: 500 });
  });
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

describe("BookingsPage: отмена бронирования", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("после подтверждения вызывает DELETE и запись исчезает из списка без перезагрузки", async () => {
    mockSuccessApi([ONE_BOOKING]);
    const confirm = vi.fn(() => true);
    vi.stubGlobal("confirm", confirm);

    renderPage();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getAllByTestId("booking-row")).toHaveLength(1);
    });

    await user.click(screen.getByTestId("booking-cancel"));

    expect(confirm).toHaveBeenCalledWith("Отменить это бронирование?");
    await waitFor(() => {
      expect(screen.getByTestId("bookings-empty")).toBeInTheDocument();
    });
    expect(screen.queryAllByTestId("booking-row")).toHaveLength(0);

    const deleteCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([url, init]) =>
        /^\/api\/bookings\/00000000-0000-4000-8000-000000000001$/.test(String(url)) &&
        (init?.method as string | undefined) === "DELETE",
    );
    expect(deleteCalls).toHaveLength(1);
  });

  it("отмена подтверждения — DELETE не вызывается, запись остаётся", async () => {
    mockSuccessApi([ONE_BOOKING]);
    const confirm = vi.fn(() => false);
    vi.stubGlobal("confirm", confirm);

    renderPage();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getAllByTestId("booking-row")).toHaveLength(1);
    });

    await user.click(screen.getByTestId("booking-cancel"));

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId("booking-row")).toHaveLength(1);
    const deleteCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
      ([init]) => (init?.method as string | undefined) === "DELETE",
    );
    expect(deleteCalls).toHaveLength(0);
  });

  it("при отказе DELETE (404) показывает ошибку и запись остаётся", async () => {
    mockFetch((url, method) => {
      if (url === "/api/bookings" && method === "GET") {
        return new Response(JSON.stringify([ONE_BOOKING]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.startsWith("/api/bookings/") && method === "DELETE") {
        return new Response(
          JSON.stringify({
            statusCode: 404,
            code: "BOOKING_NOT_FOUND",
            message: "Запрашиваемое бронирование не найдено.",
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url === "/api/config") {
        return new Response(
          JSON.stringify({
            owner: { name: "Owner", timezone: "Europe/Moscow" },
            windowDays: 14,
            slotStepMinutes: 30,
            workingDays: [1, 2, 3, 4, 5],
            workingHours: { start: "09:00", end: "18:00" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ message: `Unexpected fetch: ${url}` }), { status: 500 });
    });
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );

    renderPage();
    const user = userEvent.setup();
    await waitFor(() => {
      expect(screen.getAllByTestId("booking-row")).toHaveLength(1);
    });

    await user.click(screen.getByTestId("booking-cancel"));

    await waitFor(() => {
      expect(screen.getByTestId("bookings-error")).toBeInTheDocument();
    });
    expect(screen.getByTestId("bookings-error")).toHaveTextContent("cancelBooking: HTTP 404");
    expect(screen.getAllByTestId("booking-row")).toHaveLength(1);
  });
});
