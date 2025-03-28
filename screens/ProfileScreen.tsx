import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView, 
  Image,
  PermissionsAndroid, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Certificate from '../components/Certificate';

type RootStackParamList = {
  Login: undefined;
};

interface UserProfile {
  name: string;
  contact: string;
  address: string;
  email: string;
}

const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    contact: '',
    address: '',
    email: auth.currentUser?.email || ''
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Add this function to request permissions
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "App needs access to storage to save the certificate",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const loadData = async () => {
      await requestStoragePermission();
      await fetchUserProfile();
      await checkReportStatus();
    };
    loadData();
  }, []);

  const fetchUserProfile = async () => {
    if (!auth.currentUser) {
      navigation.navigate('Login');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        setProfile({
          ...docSnap.data() as UserProfile,
          email: auth.currentUser.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(
        'Error',
        'Unable to load profile. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkReportStatus = async () => {
    if (!auth.currentUser) return;
    
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('userId', '==', auth.currentUser.uid),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      const hasSubmittedReport = !querySnapshot.empty;
      console.log('Report submitted:', hasSubmittedReport);
      setReportSubmitted(hasSubmittedReport);
      
      if (hasSubmittedReport) {
        // Ensure we have the user's name for the certificate
        if (!profile.name) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setProfile(prev => ({
              ...prev,
              name: userDoc.data().name || ''
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error checking report status:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;

    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      
      await setDoc(userDocRef, {
        ...profile,
        updatedAt: new Date()
      }, { merge: true });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4B8C" />
      </View>
    );
  }

  console.log('Report Submitted:', reportSubmitted);
  console.log('Profile Name:', profile.name);
  console.log('Profile:', profile);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo and Header */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('../assets/logo.png')} // Update the path to your logo
            style={styles.logo}
          />
          <Text style={styles.header}>Profile</Text>
        </View>

        {reportSubmitted && profile.name && (
          <View style={styles.certificateWrapper}>
            <Text style={styles.certificateTitle}>Your Certificate</Text>
            <Certificate 
              userName={profile.name}
              date={new Date().toLocaleDateString()}
            />
          </View>
        )}

        <View style={styles.profileContainer}>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            placeholder="Name"
            placeholderTextColor="#8E8E93"
            value={profile.name}
            onChangeText={(text) => setProfile({ ...profile, name: text })}
            editable={isEditing}
          />
          
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            placeholder="Contact Number"
            placeholderTextColor="#8E8E93"
            keyboardType="phone-pad"
            value={profile.contact}
            onChangeText={(text) => setProfile({ ...profile, contact: text })}
            editable={isEditing}
          />
          
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Email"
            placeholderTextColor="#8E8E93"
            value={profile.email}
            editable={false}
          />
          
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            placeholder="Address"
            placeholderTextColor="#8E8E93"
            value={profile.address}
            onChangeText={(text) => setProfile({ ...profile, address: text })}
            editable={isEditing}
            multiline
          />
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Save Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  certificateWrapper: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  certificateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    resizeMode: 'contain',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  profileContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#FF4B8C',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  certificateContainer: {
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ProfileScreen;