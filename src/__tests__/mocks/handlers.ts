import { http, HttpResponse } from 'msw';

export interface ResponseType {
  id: string;
  content: string;
}

const baseURL = 'https://example.com';

export const mockURL = {
  test1: `${baseURL}/test1`,
  test2: `${baseURL}/test2`,
  test3: `${baseURL}/test3`,
};

export const mockResponse = {
  test1: {
    id: '1',
    content: 'test1',
  },
  test2: {
    id: '2',
    content: 'test2',
  },
  test3: {
    id: '3',
    content: 'test3',
  },
};

export const handlers = [
  http.get(mockURL.test1, () => {
    return HttpResponse.json(mockResponse.test1);
  }),
  http.get(mockURL.test2, () => {
    return HttpResponse.json(mockResponse.test2);
  }),
  http.get(mockURL.test3, () => {
    return HttpResponse.json(mockResponse.test3);
  }),
];
