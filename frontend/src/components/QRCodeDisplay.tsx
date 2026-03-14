import { useEffect, useState } from "react";

interface Props {
  eventId: number;
}

function QRCodeDisplay({ eventId }: Props): JSX.Element {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    setUrl(`/api/admin/events/${eventId}/qrcode`);
  }, [eventId]);

  if (!url) return <></>;

  const link = window.location.origin + `/?code=EVENTCODE`;

  return (
    <div className="space-y-2">
      <img src={url} alt="Event QR code" className="h-48 w-48 rounded-lg border border-slate-200" />
      <p className="text-xs text-slate-500">Scan to open the parent booking page for this event.</p>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
        }}
        className="inline-flex items-center rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Copy booking link
      </button>
    </div>
  );
}

export default QRCodeDisplay;

