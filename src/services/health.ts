import AppleHealthKit, {
  HealthInputOptions,
  HealthKitPermissions,
} from 'react-native-health';

const PERMS = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Sleep,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.BloodPressureDiastolic,
      AppleHealthKit.Constants.Permissions.BloodPressureSystolic,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.Sleep,
    ],
  },
} as HealthKitPermissions;

export const initializeHealthKit = () => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(PERMS, (error: string) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(true);
    });
  });
};

export const getHeartRateData = (options: HealthInputOptions) => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateSamples(
      options,
      (error: string, results: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      }
    );
  });
};

export const getStepsData = (options: HealthInputOptions) => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getDailyStepCountSamples(
      options,
      (error: string, results: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(results);
      }
    );
  });
};

export const getSleepData = (options: HealthInputOptions) => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(options, (error: string, results: any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};

export default {
  initializeHealthKit,
  getHeartRateData,
  getStepsData,
  getSleepData,
};
