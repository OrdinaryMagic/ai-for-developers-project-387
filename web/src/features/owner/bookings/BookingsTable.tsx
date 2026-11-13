import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/dateTime";
import { useOwnerTimezone } from "./OwnerTimezoneContext";
import type { Booking } from "./api";

interface BookingsTableProps {
  bookings: Booking[];
  onCancel: (id: string) => Promise<void>;
}

/** Действие отмены одной записи: первый клик — подтверждение, второй — удаление. */
function BookingCancelAction({
  bookingId,
  onCancel,
}: {
  bookingId: string;
  onCancel: (id: string) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        data-testid="booking-cancel-button"
        onClick={() => setConfirming(true)}
      >
        Отменить
      </Button>
    );
  }

  const confirm = async () => {
    setPending(true);
    try {
      await onCancel(bookingId);
    } finally {
      setPending(false);
      setConfirming(false);
    }
  };

  return (
    <div data-testid="booking-cancel-confirm" className="flex items-center gap-2">
      <span className="whitespace-nowrap text-sm">Отменить встречу?</span>
      <Button
        variant="destructive"
        size="sm"
        data-testid="booking-cancel-confirm-yes"
        disabled={pending}
        onClick={confirm}
      >
        Да, отменить
      </Button>
      <Button
        variant="ghost"
        size="sm"
        data-testid="booking-cancel-confirm-no"
        disabled={pending}
        onClick={() => setConfirming(false)}
      >
        Оставить
      </Button>
    </div>
  );
}

export function BookingsTable({ bookings, onCancel }: BookingsTableProps) {
  const { timezone } = useOwnerTimezone();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead data-testid="bookings-table-head-meeting-type">Тип встречи</TableHead>
          <TableHead data-testid="bookings-table-head-guest-name">Гость</TableHead>
          <TableHead data-testid="bookings-table-head-guest-email">Email</TableHead>
          <TableHead data-testid="bookings-table-head-starts-at">Начало</TableHead>
          <TableHead data-testid="bookings-table-head-ends-at">Окончание</TableHead>
          <TableHead data-testid="bookings-table-head-actions">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody data-testid="bookings-table">
        {bookings.map((b) => (
          <TableRow key={b.id} data-testid="booking-row">
            <TableCell data-testid="booking-row-meeting-type">{b.meetingTypeName}</TableCell>
            <TableCell data-testid="booking-row-guest-name">{b.guestName}</TableCell>
            <TableCell data-testid="booking-row-guest-email">{b.guestEmail}</TableCell>
            <TableCell data-testid="booking-row-starts-at">
              {formatDateTime(b.startsAt, timezone)}
            </TableCell>
            <TableCell data-testid="booking-row-ends-at">
              {formatDateTime(b.endsAt, timezone)}
            </TableCell>
            <TableCell>
              <BookingCancelAction bookingId={b.id} onCancel={onCancel} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
