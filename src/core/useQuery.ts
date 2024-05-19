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
  const { queryKey, queryFn, staleTime = 1000 } = params;
  const queryKeyString = hashKey(queryKey);

  const cachedQuery = cacheStore.get(queryKeyString) as Query<T> | undefined;
  const isStaled = cachedQuery
    ? Date.now() - cachedQuery.updatedAt > staleTime
    : true;

  const [data, setData] = useState<T | null>(
    cachedQuery && !isStaled ? cachedQuery.data : null
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(
    cachedQuery && !isStaled ? true : false
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    cachedQuery && !isStaled ? false : true
  );
  const [isError, setIsError] = useState<boolean>(false);
  const [status, setStatus] = useState<'pending' | 'error' | 'success'>(
    cachedQuery && !isStaled ? 'success' : 'pending'
  );

  const setCacheStore = useCallback(
    (data: T) => {
      cacheStore.set(queryKeyString, { data, updatedAt: Date.now() });
    },
    [queryKeyString]
  );

  const fetchFn = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
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
  }, [queryFn, setCacheStore]);

  useEffect(() => {
    if (cachedQuery && !isStaled) {
      setData(cachedQuery.data);
      setIsSuccess(true);
      setStatus('success');
      setIsLoading(false);
    } else {
      fetchFn();
    }
  }, [queryKeyString, fetchFn, cachedQuery, isStaled]);

  return { data, isSuccess, isLoading, isError, status };
}
