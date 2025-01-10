import ApiClient from '../api/ApiClient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should make successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockedAxios.create.mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: mockData }),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any);

    const response = await ApiClient.get('/test');
    expect(response).toEqual(mockData);
  });

  it('should handle authentication error', async () => {
    const mockError = {
      response: { status: 401 },
      config: { url: '/test' },
    };

    mockedAxios.create.mockReturnValue({
      get: jest.fn().mockRejectedValue(mockError),
      post: jest.fn().mockRejectedValue(mockError),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as any);

    await expect(ApiClient.get('/test')).rejects.toThrow();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('should retry failed requests', async () => {
    const mockError = {
      response: { status: 500 },
      config: { url: '/test', retry: 0 },
    };

    const mockSuccess = { data: { success: true } };
    const mockAxios = {
      get: jest.fn()
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxios as any);

    const response = await ApiClient.get('/test');
    expect(response).toEqual(mockSuccess.data);
    expect(mockAxios.get).toHaveBeenCalledTimes(3);
  });

  it('should respect rate limiting', async () => {
    const mockSuccess = { data: { success: true } };
    const mockAxios = {
      get: jest.fn().mockResolvedValue(mockSuccess),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxios as any);

    // Make multiple requests quickly
    const requests = Array(70).fill(null).map(() => ApiClient.get('/test'));
    
    await expect(Promise.all(requests)).rejects.toThrow('Rate limit exceeded');
  });
});
