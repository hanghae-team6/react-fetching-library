import { useState, useEffect, useCallback } from 'react';
import { hashKey } from '../utils/utils';

type UseQueryParam<T> = {
  queryKey: unknown[];
  queryFn: (params?: unknown) => Promise<T>;
  staleTime?: number;
};

type Query<T> = {
  data: T;
  updatedAt: number;
};

const cacheStore = new Map<string, Query<unknown>>();

export function useQuery<T>(params: UseQueryParam<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'error' | 'success'>(
    'pending'
  );

  const { queryKey, queryFn, staleTime = 1000 } = params;

  const queryKeyString = hashKey(queryKey);

  const setCacheStore = useCallback(
    (data: T) => {
      cacheStore.set(queryKeyString, { data, updatedAt: Date.now() });
    },
    [queryKeyString]
  );

  const fetchFn = useCallback(
    function () {
      queryFn()
        .then(response => {
          setData(response);
          setIsSuccess(true);
          setStatus('success');
          setCacheStore(response);
        })
        .catch(err => {
          console.error(err);
          setIsError(true);
          setStatus('error');
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [queryFn, setCacheStore]
  );

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    setIsSuccess(false);

    const now = Date.now();

    const cachedQuery = cacheStore.get(queryKeyString) as Query<T> | undefined;
    const isStaled = cachedQuery
      ? now - cachedQuery.updatedAt > staleTime
      : false;

    if (cachedQuery && !isStaled) {
      setData(cachedQuery.data);
      setStatus('success');
    } else {
      fetchFn();
    }
  }, [queryKeyString, fetchFn, staleTime]);

  return { data, isSuccess, isLoading, isError, status };
}
