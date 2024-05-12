import { QueryClient } from '@tanstack/react-query';
import { queryKey, sleep } from './utils';
import { waitFor } from '@testing-library/react';

describe('fetchQuery', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    queryClient.mount();
  });

  afterEach(() => {
    queryClient.clear();
    queryClient.unmount();
  });

  test('should not type-error with strict query key', async () => {
    type StrictQueryKey = ['strict', ...ReturnType<typeof queryKey>];
    const key: StrictQueryKey = ['strict', ...queryKey()];

    const fetchFn = () => Promise.resolve('data');

    await expect(
      queryClient.fetchQuery({
        queryKey: key,
        queryFn: fetchFn,
      })
    ).resolves.toEqual('data');
  });

  // https://github.com/tannerlinsley/react-query/issues/652
  test('should not retry by default', async () => {
    const key = queryKey();

    await expect(
      queryClient.fetchQuery({
        queryKey: key,
        queryFn: (): Promise<unknown> => {
          throw new Error('error');
        },
      })
    ).rejects.toEqual(new Error('error'));
  });

  test('should return the cached data on cache hit', async () => {
    const key = queryKey();

    const fetchFn = () => Promise.resolve('data');
    const first = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
    });
    const second = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
    });

    expect(second).toBe(first);
  });

  test('should be able to fetch when garbage collection time is set to 0 and then be removed', async () => {
    const key1 = queryKey();
    const result = await queryClient.fetchQuery({
      queryKey: key1,
      queryFn: async () => {
        await sleep(10);
        return 1;
      },
      gcTime: 0,
    });
    expect(result).toEqual(1);
    await waitFor(() =>
      expect(queryClient.getQueryData(key1)).toEqual(undefined)
    );
  });

  test('should keep a query in cache if garbage collection time is Infinity', async () => {
    const key1 = queryKey();
    const result = await queryClient.fetchQuery({
      queryKey: key1,
      queryFn: async () => {
        await sleep(10);
        return 1;
      },
      gcTime: Infinity,
    });
    const result2 = queryClient.getQueryData(key1);
    expect(result).toEqual(1);
    expect(result2).toEqual(1);
  });

  test('should not force fetch', async () => {
    const key = queryKey();

    queryClient.setQueryData(key, 'og');
    const fetchFn = () => Promise.resolve('new');
    const first = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      initialData: 'initial',
      staleTime: 100,
    });
    expect(first).toBe('og');
  });

  test('should only fetch if the data is older then the given stale time', async () => {
    const key = queryKey();

    let count = 0;
    const fetchFn = () => ++count;

    queryClient.setQueryData(key, count);
    const first = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 100,
    });
    await sleep(11);
    const second = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 10,
    });
    const third = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 10,
    });
    await sleep(11);
    const fourth = await queryClient.fetchQuery({
      queryKey: key,
      queryFn: fetchFn,
      staleTime: 10,
    });
    expect(first).toBe(0);
    expect(second).toBe(1);
    expect(third).toBe(1);
    expect(fourth).toBe(2);
  });
});
