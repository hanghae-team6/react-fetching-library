/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from 'react';
import { hashKey } from '../utils/utils';

type TQueryKey = unknown[];
type TStatus = 'pending' | 'error' | 'success';

interface UseQueryProps<TData> {
  queryKey: TQueryKey;
  queryFn: () => Promise<TData>;
  staleTime?: number;
}

export interface Query {
  data: unknown;
  queryFn: () => Promise<unknown>;
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

  const queryKeyString = hashKey(queryKey);
  const cachedQueryFn = useCallback(
    cacheStore.get(queryKeyString)?.queryFn || queryFn,
    [queryFn, queryKeyString]
  );

  const initialize = () => {
    setData(null);
    setStatus('pending');
    setError(null);
  };

  const setCacheStore = useCallback(
    (
      queryKey: string,
      data: Query['data'],
      queryFn: Query['queryFn'],
      updatedAt: Query['updatedAt']
    ) => {
      cacheStore.set(queryKey, { data, queryFn, updatedAt });
    },
    []
  );

  const fetchFn = useCallback(
    async (queryFn: Query['queryFn']) => {
      initialize();
      try {
        const res = (await queryFn()) as TData;
        setCacheStore(queryKeyString, res, queryFn, Date.now());
        setData(res);
        setStatus('success');
      } catch (err) {
        setCacheStore(queryKeyString, null, queryFn, Date.now());
        setData(null);
        setError(err as Error);
        setStatus('error');
      }
    },
    [queryKeyString, setCacheStore]
  );

  const invalidateQueries = (queryKey: TQueryKey) => {
    const queryKeyString = JSON.stringify(queryKey);
    const cacehedQueryFn = cacheStore.get(queryKeyString)?.queryFn;
    if (cacehedQueryFn) {
      void fetchFn(cacehedQueryFn);
    }
  };

  const isCached = cacheStore.has(queryKeyString);
  const isStaled =
    Date.now() - (cacheStore.get(queryKeyString)?.updatedAt || Date.now()) >
    staleTime;

  useEffect(() => {
    if (isCached && !isStaled) {
      setData(cacheStore.get(queryKeyString)?.data as TData);
      setStatus('success');
    } else {
      void fetchFn(cachedQueryFn);
    }
  }, [queryKeyString, fetchFn, cachedQueryFn, staleTime]);

  return {
    data,
    error,
    status,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    invalidateQueries,
  };
};

export default useQuery;
