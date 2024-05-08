import { useEffect, useState, useCallback } from 'react';

type TQueryKey = unknown[];
type TStatus = 'pending' | 'error' | 'success';

interface UseQueryProps<TData> {
  queryKey: TQueryKey;
  queryFn: () => Promise<TData>;
  staleTime?: number;
}

interface Query {
  data: unknown;
  updatedAt: number;
}

const cacheStore = new Map<string, Query>();

const useQuery = <TData>({
  queryKey,
  queryFn,
  staleTime = 1000,
}: UseQueryProps<TData>) => {
  const [data, setData] = useState<TData | null>(null);
  const [status, setStatus] = useState<TStatus>('pending');
  const [error, setError] = useState<Error | null>(null);

  const queryKeyString = JSON.stringify(queryKey);

  const setCacheStore = useCallback(
    (data: TData) => {
      cacheStore.set(queryKeyString, { data, updatedAt: Date.now() });
    },
    [queryKeyString]
  );

  const fetchFn = useCallback(async () => {
    try {
      const res = await queryFn();
      setData(res);
      setStatus('success');
      setCacheStore(res);
    } catch (err) {
      setError(err as Error);
      setStatus('error');
    }
  }, [queryFn, setCacheStore]);

  useEffect(() => {
    const now = Date.now();

    const isCached = cacheStore.has(queryKeyString);
    const isStaled =
      now - (cacheStore.get(queryKeyString)?.updatedAt || now) > staleTime;

    if (isCached && !isStaled) {
      setData(cacheStore.get(queryKeyString)?.data as TData);
      setStatus('success');
    } else {
      void fetchFn();
    }
  }, [queryKeyString, fetchFn, staleTime]);

  return {
    data,
    error,
    status,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
  };
};

export default useQuery;
