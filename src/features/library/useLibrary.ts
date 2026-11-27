import { useCallback, useEffect, useState } from "react";
import { toMessage } from "../../shared/errors";
import { listReady, type Recording } from "../../storage/recordingsRepository";

export function useLibrary() {
  const [items, setItems] = useState<Recording[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    return listReady().then(
      (recordings) => {
        setItems(recordings);
        setError(null);
      },
      (cause) => setError(toMessage(cause)),
    );
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, error, reload };
}
