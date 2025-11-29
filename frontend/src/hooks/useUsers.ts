import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';

export interface UserItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  assignedSections?: string[];
  assignedCourses?: string[];
  [key: string]: any;
}

export default function useUsers() {
  const auth = useAuth() as { token?: string } | null;
  const token = auth?.token;
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        signal
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (err.name !== 'AbortError') setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchUsers(ctrl.signal);
    return () => ctrl.abort();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}