# LifeMate AI

A React Native mobile application that serves as your personal AI companion, helping you track emotions, manage health data, and provide personalized support.

## Features

- Real-time emotion tracking using facial analysis
- Health data integration with Apple HealthKit
- Bluetooth device connectivity
- Personalized AI companion
- Secure authentication and data storage

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn
- iOS: XCode 14 or later
- Android: Android Studio and SDK
- CocoaPods (for iOS)

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/lifemate-ai.git
cd lifemate-ai
\`\`\`

2. Install dependencies:
\`\`\`bash
yarn install
\`\`\`

3. iOS Setup:
\`\`\`bash
cd ios
pod install
cd ..
\`\`\`

4. Start the Metro bundler:
\`\`\`bash
yarn start
\`\`\`

5. Run the app:
\`\`\`bash
# iOS
yarn ios

# Android
yarn android
\`\`\`

## Project Structure

\`\`\`
src/
  ├── components/      # Reusable UI components
  ├── context/         # React Context providers
  ├── navigation/      # Navigation configuration
  ├── screens/         # Screen components
  │   ├── auth/       # Authentication screens
  │   └── main/       # Main app screens
  ├── services/        # API and native services
  ├── theme/          # Theme configuration
  └── utils/          # Utility functions
\`\`\`

## Built With

- React Native
- TypeScript
- React Navigation
- React Native Vision Camera
- React Native BLE PLX
- React Native Health
- Firebase
- OpenAI API

## License

This project is licensed under the MIT License - see the LICENSE file for details.
