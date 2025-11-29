import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

export default function useGrades(bimester: string) {
  const auth = useAuth() as { token?: string } | null;
  const token = auth?.token;
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGrades = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/grades/?bimester=${bimester}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Asume que la API devuelve un array con { studentId, courseId, grade }
      const gradeMap: Record<string, number> = {};
      (Array.isArray(data) ? data : []).forEach((item: any) => {
        gradeMap[`${item.studentId}-${item.courseId}`] = item.grade;
      });
      setGrades(gradeMap);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [bimester, token]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchGrades(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchGrades]);

  return { grades, loading, error };
}