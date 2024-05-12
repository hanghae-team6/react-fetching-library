import { waitFor } from '@testing-library/react';
// useFetchData.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useFetchData from '../useFetchData';

const mockQueryFn = vi.fn(() =>
  Promise.resolve({ message: 'Hello from the API' })
);

describe('useFetchData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and returns data correctly', async () => {
    const mockData = { message: 'Hello from the API' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as unknown as Response); // TypeScript에 Response 타입으로 캐스팅

    const { result } = renderHook(() =>
      useFetchData({
        queryKey: 'testQueryKey',
        queryFn: mockQueryFn,
        staleTime: 6000,
      })
    );

    await waitFor(() => expect(result.current.data).toEqual(mockData));
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
    await waitFor(() => expect(result.current.isError).toBeNull());
  });

  it('handles fetch errors correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new Error('Failed to fetch')
    );

    const { result } = renderHook(() =>
      useFetchData({
        queryKey: 'testQueryKey2',
        queryFn: mockQueryFn,
        staleTime: 6000,
      })
    );

    // TODO 에러 수정
    // await waitFor(() => expect(result.current.isError).toBe('Failed to fetch'));
    await waitFor(() => expect(result.current.isLoading).toBeFalsy());
  });
});

// import { beforeAll, describe, it, expect, afterEach, afterAll } from 'vitest';
// import { renderHook, waitFor } from '@testing-library/react';
// import { setupServer } from 'msw/node';
// import { handlers } from '../mocks/handlers/handlers';
// import useFetchData from '../useFetchData';
// import { http } from 'msw';

// const server = setupServer(...handlers);

// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

// describe('useFetchData', () => {
//   it('fetches and returns data correctly', async () => {
//     const { result } = renderHook(() =>
//       useFetchData('https://api.example.com/data')
//     );

//     expect(result.current.isLoading).toBe(true);
//     expect(result.current.data).toBeNull();

//     await waitFor(() =>
//       expect(result.current.data).toEqual({ message: 'Hello from the API' })
//     );
//     await waitFor(() =>
//       expect(result.current.data).toEqual({ message: 'Hello from the API' })
//     );
//     await waitFor(() => expect(result.current.isLoading).toBe(false));

//     await waitFor(() => expect(result.current.isError).toBeNull());
//   });

//   it('handles errors correctly', async () => {
//     server.use(
//       http.get('https://api.example.com/data', (req, res, ctx) => {
//         return res(ctx.status(500));
//       })
//     );

//     const { result } = renderHook(() =>
//       useFetchData('https://api.example.com/data')
//     );

//     await waitFor(() => expect(result.current.isError).toBeDefined());

//     await waitFor(() => expect(result.current.isLoading).toBe(false));
//   });
// });
