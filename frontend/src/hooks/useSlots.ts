import { useEffect, useState } from "react";
import client from "../api/client";

export interface SlotDto {
  id: number;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
  is_booked?: boolean;
}

export function useSlots(teacherId: number | null, pollMs = 30000) {
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teacherId) return;

    let cancelled = false;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await client.get(`/teachers/${teacherId}/slots`);
        if (!cancelled) {
          setSlots(response.data.slots ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
            "Could not load time slots.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSlots();
    const interval = window.setInterval(fetchSlots, pollMs);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [teacherId, pollMs]);

  return { slots, loading, error };
}

