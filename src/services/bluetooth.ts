import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

class BluetoothService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);

      return Object.values(result).every(
        (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  async startScan(onDeviceFound: (device: Device) => void): Promise<void> {
    try {
      const state = await this.manager.state();
      
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on');
      }

      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted');
      }

      this.manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (error, device) => {
          if (error) {
            console.error('Scan error:', error);
            return;
          }

          if (device) {
            onDeviceFound(device);
          }
        }
      );
    } catch (error) {
      console.error('Start scan error:', error);
      throw error;
    }
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  async connectToDevice(deviceId: string): Promise<Device> {
    try {
      const device = await this.manager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      return device;
    } catch (error) {
      console.error('Connect error:', error);
      throw error;
    }
  }

  async disconnectDevice(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
    }
  }

  async writeCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    await this.connectedDevice.writeCharacteristicWithResponseForService(
      serviceUUID,
      characteristicUUID,
      value
    );
  }

  async readCharacteristic(
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    const characteristic = await this.connectedDevice.readCharacteristicForService(
      serviceUUID,
      characteristicUUID
    );

    return characteristic.value || '';
  }

  async monitorCharacteristic(
    serviceUUID: string,
    characteristicUUID: string,
    onUpdate: (value: string) => void
  ): Promise<() => void> {
    if (!this.connectedDevice) {
      throw new Error('No device connected');
    }

    return this.connectedDevice.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error('Monitor error:', error);
          return;
        }

        if (characteristic?.value) {
          onUpdate(characteristic.value);
        }
      }
    );
  }

  destroy(): void {
    this.manager.destroy();
  }
}

export default new BluetoothService();
