import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

export interface Course {
  id: string;
  name: string;
  [key: string]: any;
}

export default function useCourses() {
  const token = (useAuth() ?? {}).token;
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCourses = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/courses/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchCourses(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchCourses]);

  const refetch = () => {
    const ctrl = new AbortController();
    fetchCourses(ctrl.signal);
  };

  return { courses, loading, error, refetch };
}