import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

// ...existing code...
export default function useBimesters() {
  const auth = useAuth() as { token?: string } | null;
  const token = auth?.token;
  const [bimesters, setBimesters] = useState<Array<{id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBimesters = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/bimesters/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBimesters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchBimesters(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchBimesters]);

  return { bimesters, loading, error, refetch: fetchBimesters };
}