import CacheService from '../cache/CacheService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

jest.mock('expo-file-system');
const mockedFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('CacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  it('should cache and retrieve data', async () => {
    const testData = { id: 1, name: 'Test' };
    await CacheService.set('test-key', testData);
    
    const cachedData = await CacheService.get('test-key');
    expect(cachedData).toEqual(testData);
  });

  it('should handle expired cache items', async () => {
    const testData = { id: 1, name: 'Test' };
    await CacheService.set('test-key', testData, { duration: -1 }); // Expired immediately
    
    const cachedData = await CacheService.get('test-key');
    expect(cachedData).toBeNull();
  });

  it('should cache assets', async () => {
    const testUrl = 'https://example.com/image.jpg';
    const localPath = 'file://cache-directory/image.jpg';

    mockedFileSystem.downloadAsync.mockResolvedValue({ uri: localPath });
    mockedFileSystem.getInfoAsync.mockResolvedValue({ exists: true });

    const cachedPath = await CacheService.cacheAsset(testUrl);
    expect(cachedPath).toBe(localPath);
    expect(mockedFileSystem.downloadAsync).toHaveBeenCalledWith(testUrl, localPath);
  });

  it('should clean up expired assets', async () => {
    const oldFile = 'oldFile.jpg';
    const newFile = 'newFile.jpg';

    mockedFileSystem.readDirectoryAsync.mockResolvedValue([oldFile, newFile]);
    mockedFileSystem.getInfoAsync.mockImplementation(async (path) => ({
      exists: true,
      modificationTime: path.includes(oldFile) ? 0 : Date.now() / 1000,
    }));

    await CacheService['cleanupAssetCache']();

    expect(mockedFileSystem.deleteAsync).toHaveBeenCalledWith(
      `file://cache-directory/${oldFile}`,
      { idempotent: true }
    );
  });

  it('should invalidate cache items', async () => {
    const testData = { id: 1, name: 'Test' };
    await CacheService.set('test-key', testData);
    
    await CacheService.invalidate('test-key');
    const cachedData = await CacheService.get('test-key');
    expect(cachedData).toBeNull();
  });

  it('should clear all cache', async () => {
    const testData1 = { id: 1, name: 'Test 1' };
    const testData2 = { id: 2, name: 'Test 2' };

    await CacheService.set('test-key-1', testData1);
    await CacheService.set('test-key-2', testData2);

    await CacheService.clear();

    const cachedData1 = await CacheService.get('test-key-1');
    const cachedData2 = await CacheService.get('test-key-2');

    expect(cachedData1).toBeNull();
    expect(cachedData2).toBeNull();
  });
});
