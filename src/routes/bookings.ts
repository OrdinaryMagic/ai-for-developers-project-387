import { Type, type Static } from "@sinclair/typebox";
import type { FastifyPluginAsync } from "fastify";
import type { BookingStore } from "../store/booking-store.js";
import type { Clock } from "../app.js";
import { makeDomainError } from "../errors/domain-errors.js";

/** Тело `POST /bookings`. Соответствует `CreateBookingRequest` в спеке. */
const CreateBookingDto = Type.Object({
  meetingTypeId: Type.String(),
  startsAt: Type.String({ format: "date-time" }),
  guestName: Type.String({ minLength: 1, maxLength: 120 }),
  guestEmail: Type.String({ minLength: 3, maxLength: 254, format: "email" }),
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

  /** `DELETE /bookings/{id}` — отмена бронирования владельцем (жёсткое удаление). */
  app.delete<{ Params: { id: string } }>("/bookings/:id", async (req, reply) => {
    const deleted = await store.delete(req.params.id);
    if (!deleted) {
      reply.code(404);
      return makeDomainError(
        "BOOKING_NOT_FOUND",
        `Бронирование ${req.params.id} не найдено (или уже удалено).`,
      );
    }
    return reply.code(204).send();
  });
};

export default bookingsRoutes;
