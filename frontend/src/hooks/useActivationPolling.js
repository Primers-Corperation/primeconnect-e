import { useEffect, useRef } from 'react';
import { getActivationStatus } from '../api/sms.js';

// While any activation in the list is 'pending', polls each one's real
// status every ~8s and merges updates back through setActivations. Stops
// automatically once nothing is pending, and only re-subscribes the
// interval when that pending/not-pending state actually flips (not on
// every single poll update), so it doesn't churn.
export function useActivationPolling(activations, setActivations) {
  const activationsRef = useRef(activations);
  activationsRef.current = activations;

  const hasPending = activations.some((a) => a.status === 'pending');

  useEffect(() => {
    if (!hasPending) return undefined;
    const interval = setInterval(async () => {
      const pending = activationsRef.current.filter((a) => a.status === 'pending');
      for (const a of pending) {
        try {
          const updated = await getActivationStatus(a._id);
          setActivations((prev) => prev.map((x) => (x._id === a._id ? updated : x)));
        } catch {
          // transient error — retry next tick
        }
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [hasPending, setActivations]);
}
