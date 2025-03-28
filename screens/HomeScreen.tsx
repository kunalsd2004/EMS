import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Image,
  Alert,
  Dimensions 
} from 'react-native';
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface Report {
  id: string;
  severity: string;
  contact: string;
  location: {
    latitude: number;
    longitude: number;
  };
  image: string;
  timestamp: any;
}

const HomeScreen = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("User not logged in");
      return;
    }
  
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef, 
      where("userId", "==", user.uid), 
      orderBy('timestamp', 'desc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsList: Report[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Report[];
      setReports(reportsList);
    }, (error) => {
      console.error("Error fetching reports:", error);
      Alert.alert('Error', 'Failed to fetch reports');
    });
  
    return () => unsubscribe();
  }, []);

  const handleDelete = (reportId: string) => {
    Alert.alert(
      'Remove Report',
      'Are you sure you want to remove this report from your app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setReports((prevReports) => prevReports.filter((report) => report.id !== reportId));
            Alert.alert('Success', 'Report removed successfully');
          }
        }
      ]
    );
  };

  const handleSOS = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required for SOS.');
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({});

      // Fetch the contact number from the user's profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      let contact = 'Not provided';
      if (userDoc.exists()) {
        const userData = userDoc.data();
        contact = userData.contact || 'Not provided';
      }

      const sosData = {
        userId: user.uid,
        email: user.email,
        location: {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        },
        status: "Active",
        timestamp: serverTimestamp(),
        type: "Emergency SOS",
        contact: contact
      };

      await addDoc(collection(db, 'sos_alerts'), sosData);

      Alert.alert(
        'SOS Alert Sent',
        'Emergency services have been notified of your location.'
      );

    } catch (error) {
      console.error('SOS Error:', error);
      Alert.alert('Error', 'Failed to send SOS alert. Please try again.');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image 
          source={require("../assets/logo.png")} 
          style={styles.logo} 
        />
      </View>

      <Text style={styles.title}>My Reports</Text>
      
      {/* SOS Button */}
      <TouchableOpacity 
        style={styles.sosCard}
        onPress={() => {
          Alert.alert(
            'Send SOS Alert',
            'Are you sure you want to send an emergency SOS alert?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Send SOS', onPress: handleSOS, style: 'destructive' }
            ]
          );
        }}
      >
        <View style={styles.sosContent}>
          <Text style={styles.sosTitle}>🚨 SOS Emergency</Text>
          <Text style={styles.sosDescription}>
            Tap here for immediate emergency assistance
          </Text>
        </View>
      </TouchableOpacity>

      {/* Reports List */}
      <View style={styles.reportsContainer}>
        {reports.length === 0 ? (
          <Text style={styles.noReportsText}>No reports available.</Text>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.imageContainer}>
                {report.image && (
                  <Image 
                    source={{ uri: report.image }} 
                    style={styles.reportImage}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(report.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#FF4B4B" />
                </TouchableOpacity>
              </View>
              <View style={styles.reportDetails}>
                <Text style={[styles.severityText, { color: report.severity.toLowerCase() === 'high' ? '#FF4B4B' : '#FF9500' }]}>
                  Severity: {report.severity}
                </Text>
                <Text style={styles.contactText}>Contact: {report.contact}</Text>
                <Text style={styles.locationText}>
                  Location: {report.location.latitude}, {report.location.longitude}
                </Text>
                <Text style={styles.timestampText}>
                  Reported: {formatDate(report.timestamp)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 100,
    height: 50,
    marginLeft: 8,
    marginVertical: 4,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },
  sosCard: { backgroundColor: '#CC0000', margin: 20, borderRadius: 20, padding: 24, alignItems: 'center', elevation: 5 },
  sosContent: { alignItems: 'center', width: '100%' },
  sosTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  sosDescription: { color: '#FFFFFF', fontSize: 16, textAlign: 'center' },
  reportsContainer: { padding: 20 },
  noReportsText: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 20 },
  reportCard: { backgroundColor: '#FFFFFF', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 3 },
  imageContainer: { width: '100%', height: 200, backgroundColor: '#f0f0f0', position: 'relative' },
  reportImage: { width: '100%', height: '100%' },
  deleteButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', borderRadius: 20, padding: 8, elevation: 5 },
  reportDetails: { padding: 15 },
  severityText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  contactText: { fontSize: 16, marginBottom: 6, color: '#333' },
  locationText: { fontSize: 16, marginBottom: 6, color: '#666' },
  timestampText: { fontSize: 14, color: '#888' },
});

export default HomeScreen;