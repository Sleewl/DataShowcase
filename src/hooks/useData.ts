import { useState, useEffect } from 'react';
import { fetchPlanFactStatus, fetchInstallationData } from '../api/client';

export function usePlanFactStatus() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchPlanFactStatus();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading plan-fact status:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Ошибка при получении данных с сервера'));
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

export function useInstallationData(installationNumber: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchInstallationData(installationNumber);
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading installation data:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Ошибка при получении данных с сервера'));
          setData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [installationNumber]);

  return { data, loading, error };
}