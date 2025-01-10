declare module 'react-native-health' {
  export enum HKQuantityTypeIdentifier {
    HeartRate = 'HKQuantityTypeIdentifierHeartRate',
    StepCount = 'HKQuantityTypeIdentifierStepCount',
    ActiveEnergyBurned = 'HKQuantityTypeIdentifierActiveEnergyBurned',
    DistanceWalkingRunning = 'HKQuantityTypeIdentifierDistanceWalkingRunning',
  }

  export interface HealthInputOptions {
    startDate: string;
    endDate: string;
    type: HKQuantityTypeIdentifier;
    unit?: string;
    ascending?: boolean;
    limit?: number;
  }

  export interface HealthObserver {
    type: HKQuantityTypeIdentifier;
    onChange: (data: any) => void;
  }

  export interface AppleHealthKit {
    initHealthKit(
      permissions: {
        permissions: {
          read: HKQuantityTypeIdentifier[];
          write: HKQuantityTypeIdentifier[];
        };
      },
      callback?: (error: string | null) => void
    ): Promise<void>;

    queryQuantityAggregated(
      options: HealthInputOptions,
      callback: (error: Error | null, results: any[]) => void
    ): void;

    observeQuantity(observer: HealthObserver): void;
    stopObserving(observer: HealthObserver): void;
  }

  const AppleHealthKit: AppleHealthKit;
  export default AppleHealthKit;
}
