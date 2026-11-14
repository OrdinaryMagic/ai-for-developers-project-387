import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import type { BookingStore } from "../store/booking-store.js";
import { makeDomainError } from "../errors/domain-errors.js";
import type { Clock } from "../app.js";

/** Тело `POST /bookings`. Соответствует `CreateBookingRequest` в спеке. */
const CreateBookingDto = Type.Object({
  meetingTypeId: Type.String(),
  startsAt: Type.String({ format: "date-time" }),
  guestName: Type.String({ minLength: 1, maxLength: 120 }),
  guestEmail: Type.String({ minLength: 3, maxLength: 254, format: "email" }),
});

/** Path-параметр `DELETE /bookings/:id`. Booking Identifier (UUID v4). */
const BookingIdParams = Type.Object({
  id: Type.String(),
});

export const bookingsRoutes: FastifyPluginAsync<{
  store: BookingStore;
  clock: Clock;
}> = async (app, opts) => {
  const { store, clock } = opts;

  app.post(
    "/bookings",
    {
      schema: {
        body: CreateBookingDto,
      },
    },
    async (req, reply) => {
      const body = req.body as Static<typeof CreateBookingDto>;
      const outcome = await store.book(body, { now: clock() });
      if (!outcome.ok) {
        reply.code(outcome.error.statusCode);
        return outcome.error;
      }
      return outcome.booking;
    },
  );

  app.get("/bookings", async () => {
    const list = await store.list(clock());
    return list;
  });

  app.delete(
    "/bookings/:id",
    {
      schema: {
        params: BookingIdParams,
      },
    },
    async (req, reply) => {
      const { id } = req.params as Static<typeof BookingIdParams>;
      const deleted = await store.delete(id);
      if (!deleted) {
        reply.code(404);
        return makeDomainError("BOOKING_NOT_FOUND");
      }
      reply.code(204);
      return undefined;
    },
  );
};

export default bookingsRoutes;
