import type { SlotDto } from "../hooks/useSlots";
import type { SelectedSlot } from "../context/BookingContext";

interface Props {
  teacherId: number;
  teacherName: string;
  subject?: string;
  room?: string;
  slots: SlotDto[];
  selectedStartTimes: string[];
  onSelect: (selection: SelectedSlot) => void;
}

function SlotPicker({
  teacherId,
  teacherName,
  subject,
  room,
  slots,
  selectedStartTimes,
  onSelect,
}: Props): JSX.Element {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isBooked = slot.is_booked || slot.is_blocked;
        const isConflict = selectedStartTimes.includes(slot.start_time);

        const disabled = isBooked || isConflict;

        let bg = "bg-emerald-100 hover:bg-emerald-200 text-emerald-900";
        if (isBooked) {
          bg = "bg-slate-100 text-slate-400 cursor-not-allowed";
        } else if (isConflict) {
          bg = "bg-amber-100 text-amber-700 cursor-not-allowed";
        }

        return (
          <button
            key={slot.id}
            type="button"
            disabled={disabled}
            onClick={() =>
              onSelect({
                teacherId,
                teacherName,
                subject,
                room,
                slotId: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
              })
            }
            className={`px-2 py-1.5 rounded-md text-xs font-medium border border-slate-200 ${bg} disabled:opacity-70`}
          >
            {slot.start_time}
          </button>
        );
      })}
    </div>
  );
}

export default SlotPicker;

