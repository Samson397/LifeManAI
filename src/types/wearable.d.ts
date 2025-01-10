import type { Device, BleManager, Characteristic } from 'react-native-ble-plx';
import type {
  HKQuantityTypeIdentifier,
  HealthValue,
  HealthInputOptions,
  HealthObserver,
} from 'react-native-health';

export type HealthMetric = 'heartRate' | 'steps' | 'distance' | 'calories';

export interface HealthData {
  startDate: string;
  endDate: string;
  value: number;
  type: HKQuantityTypeIdentifier;
}

export interface WearableDevice {
  id: string;
  name: string;
  manufacturer: string;
  batteryLevel: number;
  lastSync: number;
}

export interface WearableConnectionState {
  isConnected: boolean;
  isScanning: boolean;
  device: WearableDevice | null;
  error: string | null;
}

export interface WearableServiceConfig {
  permissions: {
    read: HKQuantityTypeIdentifier[];
    write: HKQuantityTypeIdentifier[];
  };
  updateInterval: number;
}

export interface WearableData {
  heartRate?: number;
  steps?: number;
  calories?: number;
  distance?: number;
  timestamp: number;
}

export interface WearableServiceType {
  initialize(): Promise<void>;
  startScan(): Promise<void>;
  stopScan(): Promise<void>;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  startMonitoring(callback: (data: HealthData) => void): Promise<void>;
  stopMonitoring(): Promise<void>;
  observeHealthMetric(metric: HealthMetric, callback: (data: HealthValue) => void): void;
  getHealthData(metric: HealthMetric, options: HealthInputOptions): Promise<HealthData[]>;
  getConnectedDevices(): Promise<WearableDevice[]>;
  getConnectionState(): WearableConnectionState;
}

export { Device, HealthInputOptions };
