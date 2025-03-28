import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      throw new Error('Permission not granted for notifications');
    }

    // Get the token
    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Configure notifications for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    // Save the token to Firestore
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmToken: token,
      });
    }

    return token;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

export const configurePushNotifications = () => {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Listen for notification responses
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    
    // Handle notification click based on type
    if (data?.type === 'ACCIDENT_ALERT') {
      // Navigate to map view or specific screen
      // You'll need to implement this based on your navigation setup
    }
  });
}; 