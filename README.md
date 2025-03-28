# EMS-APP (Emergency Management System Mobile Application)

## Overview
EMS-APP is a mobile application designed to provide quick and efficient emergency response capabilities. It enables users to report accidents, send SOS alerts, and manage emergency situations through an intuitive mobile interface. The app works in conjunction with the EMS Dashboard to provide a complete emergency management solution.

## Key Features

### 1. Emergency SOS System
- **One-Tap Emergency Alert**
  - Instant emergency notification
  - Real-time location sharing
  - Priority-based alert system
  - Automatic contact information sharing

- **Location Services**
  - Precise GPS tracking
  - Offline location caching
  - Background location updates
  - Geofencing capabilities

### 2. Accident Reporting
- **Multimedia Support**
  - Photo capture and upload
  - Voice recording capability
  - Video recording (optional)
  - File attachment support

- **Report Details**
  - Severity classification (High/Medium/Low)
  - Location tagging
  - Description field
  - Contact information
  - Timestamp recording

### 3. User Profile Management
- **Personal Information**
  - Profile creation and editing
  - Contact details management
  - Emergency contacts
  - Medical information (optional)

- **Activity Tracking**
  - Report history
  - Emergency response history
  - Location history
  - Activity certificates

### 4. Real-time Updates
- **Push Notifications**
  - Emergency alerts
  - Report status updates
  - System notifications
  - Location-based alerts

## Technical Details

### Technology Stack
- **Framework:** React Native with Expo
- **State Management:** React Context API
- **Navigation:** React Navigation
- **Authentication:** Firebase Auth
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Location Services:** Expo Location
- **Media Handling:** Expo Image Picker, Expo AV
- **Push Notifications:** Expo Notifications

### System Requirements
- iOS 13.0 or later
- Android 6.0 (API level 23) or later
- Expo Go app (for development)
- Stable internet connection
- Camera and microphone permissions
- Location services enabled

## Getting Started

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
cd EMS-APP2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
EXPO_FIREBASE_API_KEY=your_api_key
EXPO_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_FIREBASE_PROJECT_ID=your_project_id
EXPO_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_FIREBASE_APP_ID=your_app_id
EXPO_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Start the development server:
```bash
expo start
```

### Building for Production
```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

## Project Structure
```
EMS-APP2/
├── src/
│   ├── screens/      # Application screens
│   ├── components/   # Reusable components
│   ├── navigation/   # Navigation configuration
│   ├── services/     # API and service functions
│   ├── utils/        # Utility functions
│   ├── hooks/        # Custom React hooks
│   ├── context/      # React context providers
│   └── assets/       # Images, fonts, etc.
├── app.json         # Expo configuration
└── package.json     # Project dependencies
```

## Available Scripts
- `expo start` - Starts the development server
- `expo start --android` - Starts Android development
- `expo start --ios` - Starts iOS development
- `expo start --web` - Starts web development
- `expo build:android` - Builds Android APK/IPA
- `expo build:ios` - Builds iOS app
- `expo eject` - Ejects from Expo

## Security Features
- End-to-end encryption for sensitive data
- Secure authentication flow
- Biometric authentication support
- Secure storage for credentials
- Regular security updates
- Privacy-focused data handling

## Best Practices
- Follow React Native best practices
- Implement proper error handling
- Use TypeScript for type safety
- Regular code reviews
- Maintain consistent code style
- Write unit tests for critical components
- Optimize app performance
- Handle offline scenarios

## Troubleshooting
Common issues and solutions:
1. **Location Services**
   - Check device permissions
   - Verify GPS is enabled
   - Clear location cache if needed

2. **Media Upload Issues**
   - Check storage permissions
   - Verify file size limits
   - Ensure stable internet connection

3. **Authentication Problems**
   - Clear app cache
   - Verify Firebase configuration
   - Check network connectivity

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support
For technical support:
- Email: support@ems-app.com
- Documentation: [docs-url]
- Issue Tracker: [issues-url]
