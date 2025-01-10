declare module 'expo-face-detector' {
  export interface Point {
    x: number;
    y: number;
  }

  export interface Face {
    bounds: {
      origin: Point;
      size: {
        width: number;
        height: number;
      };
    };
    rollAngle: number;
    yawAngle: number;
    smilingProbability: number;
    leftEyeOpenProbability: number;
    rightEyeOpenProbability: number;
    leftEarPosition: Point;
    rightEarPosition: Point;
    leftEyePosition: Point;
    rightEyePosition: Point;
    leftCheekPosition: Point;
    rightCheekPosition: Point;
    leftMouthPosition: Point;
    rightMouthPosition: Point;
    bottomMouthPosition: Point;
    noseBasePosition: Point;
    faceID?: string;
  }

  export enum FaceDetectorMode {
    fast = 1,
    accurate = 2,
  }

  export enum FaceDetectorLandmarks {
    none = 1,
    all = 2,
  }

  export enum FaceDetectorClassifications {
    none = 1,
    all = 2,
  }

  export function detectFacesAsync(
    uri: string,
    options?: {
      mode?: FaceDetectorMode;
      detectLandmarks?: FaceDetectorLandmarks;
      runClassifications?: FaceDetectorClassifications;
    }
  ): Promise<{ faces: Face[] }>;
}
