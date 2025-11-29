import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

export interface Alumno {
  id: string;
  nombre: string;
  apellido?: string;
  dni?: string;
  grado?: string;
  [key: string]: any;
}

export default function useAlumnos() {
  const auth = useAuth() as { token?: string } | null;
  const token = auth?.token;
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlumnos = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/alumnos/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAlumnos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchAlumnos(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchAlumnos]);

  const refetch = () => {
    const ctrl = new AbortController();
    fetchAlumnos(ctrl.signal);
  };

  return { alumnos, loading, error, refetch };
}