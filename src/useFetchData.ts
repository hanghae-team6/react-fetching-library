import { useState, useEffect } from 'react';

interface FetchDataResponse {
  message: string;
}

interface CacheData {
  data: FetchDataResponse;
  time: number;
}

const cache: { [key: string]: CacheData } = {};

interface UseFetchDataParams {
  queryKey: string;
  queryFn: () => Promise<FetchDataResponse>; // 'queryFn'은 Response 객체를 반환하는 Promise를 반환합니다.
  staleTime: number; // 'staleTime'은 숫자 타입입니다.
}

const useFetchData = ({ queryKey, queryFn, staleTime }: UseFetchDataParams) => {
  const [data, setData] = useState<FetchDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    'pending'
  );
  const [isStale, setIsStale] = useState(false);
  // const [isSuccess, setIsSuccess] = useState<string | null>(null);
  const fetchData = async () => {
    setIsLoading(true);
    setStatus('pending');
    try {
      const cachedData = cache[`${queryKey}`];
      const now = Date.now();
      const isStale = cachedData ? now - cachedData.time > staleTime : true;
      setIsStale(isStale);
      if (cachedData && !isStale) {
        setData(cachedData.data);
      } else {
        const response = await queryFn();
        // const jsonData = (await response.json()) as FetchDataResponse;
        setData(response);
        cache[`${queryKey}`] = {
          data: response,
          time: Date.now(),
        };
      }
      setStatus('success');
    } catch (err) {
      console.log({ err });

      setIsError((err as Error).message);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [queryFn, queryKey, staleTime]);

  return {
    data,
    isLoading,
    isError,
    status,
    isStale,
    refetch: fetchData,
  };
};

export default useFetchData;
