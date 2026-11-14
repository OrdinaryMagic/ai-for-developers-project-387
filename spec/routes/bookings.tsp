import "@typespec/http";

using TypeSpec.Http;

namespace BookingApi;

@route("/bookings")
namespace Bookings {
  @doc("Создать бронирование на свободный слот. Возвращает `Booking` с HTTP 200. Доменные отказы приходят как `DomainError`: `MEETING_TYPE_NOT_FOUND` — 404, `SLOT_TAKEN` — 409, `OUTSIDE_WORKING_HOURS`/`OUTSIDE_WINDOW`/`MISMATCH_STEP` — 422. Слот, который уже начался, не бронируется: `OUTSIDE_WINDOW`. Идемпотентность: повтор того же `slotKey` возвращает `SLOT_TAKEN`.")
  @post
  op create(@body body: CreateBookingRequest):
    | Booking
    | NotFoundDomainErrorResponse
    | ConflictDomainErrorResponse
    | UnprocessableDomainErrorResponse;

  @doc("Список предстоящих бронирований владельца. Без пагинации, ASC по `startsAt`, только будущие.")
  @get
  op list(): Booking[];

  @doc("Отменить бронирование по идентификатору (владелец). Запись удаляется жёстко, слот автоматически снова становится доступным: availability и проверка SLOT_TAKEN считаются по существующим записям. Возвращает HTTP 204 без тела. Если бронирования не существует — в том числе при повторном DELETE того же идентификатора — HTTP 404 с `DomainError` и кодом `BOOKING_NOT_FOUND`. Ограничений по времени нет: владелец — доверенная роль, может удалить любую запись, включая начавшуюся или прошедшую.")
  @delete
  @route("/{id}")
  op del(@path id: string): void | NotFoundDomainErrorResponse;
}
