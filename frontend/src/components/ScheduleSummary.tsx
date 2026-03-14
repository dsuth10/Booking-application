import type { SelectedSlot } from "../context/BookingContext";

interface Props {
  selections: SelectedSlot[];
  onRemove: (slotId: number) => void;
}

function ScheduleSummary({ selections, onRemove }: Props): JSX.Element {
  if (!selections.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        As you choose times with teachers, your schedule will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">Your schedule so far</h2>
      <ul className="space-y-2">
        {selections.map((s) => (
          <li
            key={s.slotId}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-slate-900">
                {s.startTime} &mdash; {s.teacherName}
              </p>
              <p className="text-xs text-slate-500">
                {s.subject ?? "Teacher"} · Room {s.room ?? "TBA"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(s.slotId)}
              className="text-xs font-medium text-slate-500 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleSummary;

