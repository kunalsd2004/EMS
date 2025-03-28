// // Import Firebase dependencies
// import { initializeApp } from "firebase/app";
// import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Firebase configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyCayZufgYz74rD5bHgVOuPI8dOFp1D2wvM",
//     authDomain: "ems-app-50d22.firebaseapp.com",
//     projectId: "ems-app-50d22",
//     storageBucket: "ems-app-50d22.firebasestorage.app",   
//     messagingSenderId: "9892898412",
//     appId: "1:9892898412:android:b30c732387022d56685a49"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// // Use getAuth() with React Native Persistence
// const auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage)
// });

// const db = getFirestore(app);
// const storage = getStorage(app);

// export { auth, db, storage };




import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyCayZufgYz74rD5bHgVOuPI8dOFp1D2wvM",
    authDomain: "ems-app-50d22.firebaseapp.com",
    projectId: "ems-app-50d22",
    storageBucket: "ems-app-50d22.firebasestorage.app", // Updated storage bucket
    messagingSenderId: "9892898412",
    appId: "1:9892898412:android:b30c732387022d56685a49"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistence
const auth = getAuth(app);
if (!auth) {
    initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage with explicit bucket configuration
const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`);

// Add storage debug logging
if (__DEV__) {
    console.log('Storage Configuration:', {
        bucket: firebaseConfig.storageBucket,
        fullBucketUrl: `gs://${firebaseConfig.storageBucket}`,
        isInitialized: !!storage,
        supportedAudioFormats: ['audio/mp3']
    });
}

export { auth, db, storage };