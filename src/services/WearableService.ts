import AppleHealthKit, {
  HealthValue,
  HealthObserver,
  HKQuantityTypeIdentifier,
} from 'react-native-health';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import type {
  WearableServiceType,
  HealthData,
  WearableDevice,
  HealthMetric,
  Device,
  WearableConnectionState,
  HealthInputOptions
} from '../types/wearable.d.ts';

let AppleHealthKitMock: any;

if (Platform.OS === 'web') {
  AppleHealthKitMock = {
    initHealthKit: () => Promise.resolve(),
    getHeartRateSamples: () => Promise.resolve([
      { startDate: new Date(), value: 75, endDate: new Date() },
      { startDate: new Date(), value: 72, endDate: new Date() },
      { startDate: new Date(), value: 78, endDate: new Date() },
    ]),
    getSleepSamples: () => Promise.resolve([
      { 
        startDate: new Date(), 
        endDate: new Date(),
        value: 'INBED',
        sourceId: 'mock',
        sourceName: 'Mock Data'
      }
    ]),
  };
}

const HEALTH_PERMISSIONS = {
  permissions: {
    read: [
      HKQuantityTypeIdentifier.HeartRate,
      HKQuantityTypeIdentifier.StepCount,
      HKQuantityTypeIdentifier.DistanceWalkingRunning,
      HKQuantityTypeIdentifier.ActiveEnergyBurned,
    ],
    write: [],
  },
};

class WearableService implements WearableServiceType {
  private isInitialized = false;
  private observers = new Map<string, HealthObserver>();
  private bleManager: BleManager | null = null;
  private connectionState: WearableConnectionState = {
    isConnected: false,
    isScanning: false,
    device: null,
    error: null
  };

  async initialize(): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        await AppleHealthKit.initHealthKit(HEALTH_PERMISSIONS);
        this.isInitialized = true;
      } catch (error) {
        throw new Error(`Failed to initialize HealthKit: ${error}`);
      }
    } else if (Platform.OS === 'web') {
      await AppleHealthKitMock.initHealthKit();
      this.isInitialized = true;
    } else {
      this.bleManager = new BleManager();
      this.isInitialized = true;
    }
  }

  async startScan(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('WearableService not initialized');
    }
    this.connectionState.isScanning = true;
    if (this.bleManager) {
      await this.bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          this.connectionState.error = error.message;
          return;
        }
        // Handle found device
      });
    }
  }

  async stopScan(): Promise<void> {
    if (this.bleManager) {
      this.bleManager.stopDeviceScan();
    }
    this.connectionState.isScanning = false;
  }

  async connect(deviceId: string): Promise<void> {
    if (!this.bleManager) {
      throw new Error('BLE Manager not initialized');
    }
    try {
      const device = await this.bleManager.connectToDevice(deviceId);
      this.connectionState.device = {
        id: device.id,
        name: device.name || 'Unknown Device',
        manufacturer: 'Unknown',
        batteryLevel: 100,
        lastSync: Date.now()
      };
      this.connectionState.isConnected = true;
    } catch (error) {
      throw new Error(`Failed to connect: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectionState.device && this.bleManager) {
      await this.bleManager.cancelDeviceConnection(this.connectionState.device.id);
      this.connectionState.isConnected = false;
      this.connectionState.device = null;
    }
  }

  async startMonitoring(callback: (data: HealthData) => void): Promise<void> {
    if (Platform.OS === 'ios') {
      // Start monitoring various health metrics
      this.observeHealthMetric('heartRate', (data) => {
        callback({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          value: data.value,
          type: HKQuantityTypeIdentifier.HeartRate
        });
      });
    } else if (Platform.OS === 'web') {
      const mockData = AppleHealthKitMock.getHeartRateSamples();
      callback(mockData);
    }
  }

  async stopMonitoring(): Promise<void> {
    // Cleanup observers
    this.observers.forEach((observer) => {
      if (Platform.OS === 'ios') {
        AppleHealthKit.stopObservingQuantity(observer);
      }
    });
    this.observers.clear();
  }

  observeHealthMetric(metric: HealthMetric, callback: (data: HealthValue) => void): void {
    if (Platform.OS === 'ios') {
      const quantityType = this.getQuantityTypeForMetric(metric);
      AppleHealthKit.observeQuantity(quantityType, callback);
    }
  }

  async getHealthData(metric: HealthMetric, options: HealthInputOptions): Promise<HealthData[]> {
    if (Platform.OS === 'ios') {
      const quantityType = this.getQuantityTypeForMetric(metric);
      return new Promise((resolve, reject) => {
        AppleHealthKit.queryQuantityData(
          { ...options, type: quantityType },
          (error: string, results: HealthData[]) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          }
        );
      });
    } else if (Platform.OS === 'web') {
      if (metric === 'heartRate') {
        return AppleHealthKitMock.getHeartRateSamples();
      } else if (metric === 'sleep') {
        return AppleHealthKitMock.getSleepSamples();
      }
    }
    return [];
  }

  async getConnectedDevices(): Promise<WearableDevice[]> {
    if (this.connectionState.device) {
      return [this.connectionState.device];
    }
    return [];
  }

  getConnectionState(): WearableConnectionState {
    return this.connectionState;
  }

  private getQuantityTypeForMetric(metric: HealthMetric): HKQuantityTypeIdentifier {
    switch (metric) {
      case 'heartRate':
        return HKQuantityTypeIdentifier.HeartRate;
      case 'steps':
        return HKQuantityTypeIdentifier.StepCount;
      case 'distance':
        return HKQuantityTypeIdentifier.DistanceWalkingRunning;
      case 'calories':
        return HKQuantityTypeIdentifier.ActiveEnergyBurned;
      default:
        throw new Error(`Unsupported metric: ${metric}`);
    }
  }
}

export default new WearableService();
