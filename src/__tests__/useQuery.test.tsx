import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';
import useQuery from '../hooks/useQuery';
import { mockURL, mockResponse, ResponseType } from './mocks/handlers';

const fetchFn = async (url: string) => {
  const response = await fetch(url);
  return (await response.json()) as ResponseType;
};

describe('DataComponent', () => {
  it('query', async () => {
    const queryKey = 'test1';

    function Page() {
      const { data } = useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchFn(mockURL[queryKey]),
      });

      return (
        <div>
          <h1>{data ? data.content : 'loading...'}</h1>
        </div>
      );
    }
    render(<Page />);

    expect(screen.getByText('loading...')).toBeTruthy();
    await screen.findByText(mockResponse[queryKey].content);
  });

  it('queries', async () => {
    function Page() {
      const { data: firstData } = useQuery({
        queryKey: ['test2'],
        queryFn: () => fetchFn(mockURL['test2']),
        staleTime: 1000,
      });
      const { data: secondData } = useQuery({
        queryKey: ['test3'],
        queryFn: () => fetchFn(mockURL['test3']),
        staleTime: 2000,
      });

      return (
        <div>
          <h1>{firstData ? firstData.content : 'loading...'}</h1>
          <h1>{secondData ? secondData.content : 'loading...'}</h1>
        </div>
      );
    }

    render(<Page />);

    await screen.findByText(mockResponse['test2'].content);
    await screen.findByText(mockResponse['test3'].content);
  });

  it('status', async () => {
    const queryKey = 'test1';
    function Page() {
      const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchFn(mockURL[queryKey]),
        staleTime: 0,
      });

      return (
        <div>
          <h1>{isLoading ? 'loading' : data?.content}</h1>
          <h1>{isError ? 'error' : ''}</h1>
          <h1>{isSuccess ? 'success' : ''}</h1>
        </div>
      );
    }
    render(<Page />);

    expect(screen.getByText('loading')).toBeTruthy();
    await screen.findByText(mockResponse[queryKey].content);
    await screen.findByText('success');
  });
  it('cached', async () => {
    const queryKey = 'test1';
    function Page() {
      const { data, isLoading, isError, isSuccess } = useQuery({
        queryKey: [queryKey],
        queryFn: () => fetchFn(mockURL[queryKey]),
        staleTime: 1000,
      });

      return (
        <div>
          <h1>{isLoading ? 'loading' : data?.content}</h1>
          <h1>{isError ? 'error' : ''}</h1>
          <h1>{isSuccess ? 'success' : ''}</h1>
        </div>
      );
    }
    render(<Page />);

    await screen.findByText(mockResponse[queryKey].content);
    await screen.findByText('success');
  });
});
