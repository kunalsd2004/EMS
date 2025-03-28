import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Alert {
  id: string;
  type: string;
  status: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  userEmail?: string;
  contact?: string;
  severity?: string;
}

const LiveMapScreen = () => {
  const [markers, setMarkers] = useState<Alert[]>([]);

  useEffect(() => {
    // Listen to reports collection
    const reportsUnsubscribe = onSnapshot(
      query(collection(db, 'reports'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const reportMarkers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'report',
          status: doc.data().status || 'Active',
          timestamp: doc.data().timestamp || { seconds: Date.now() / 1000, nanoseconds: 0 }
        } as Alert));
        
        setMarkers(current => 
          [...current.filter(m => m.type !== 'report'), ...reportMarkers]
        );
      }
    );

    // Listen to SOS alerts collection
    const sosUnsubscribe = onSnapshot(
      query(collection(db, 'sos_alerts'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        const sosMarkers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          type: 'sos',
          status: doc.data().status || 'Active',
          timestamp: doc.data().timestamp || { seconds: Date.now() / 1000, nanoseconds: 0 }
        } as Alert));
        
        setMarkers(current => 
          [...current.filter(m => m.type !== 'sos'), ...sosMarkers]
        );
      }
    );

    return () => {
      reportsUnsubscribe();
      sosUnsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 20,
            longitudeDelta: 20,
          }}
        >
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.location?.latitude || 0,
                longitude: marker.location?.longitude || 0,
              }}
              pinColor={marker.type === 'sos' ? 'red' : 'blue'}
              title={marker.type === 'sos' ? 'SOS Alert' : `Report: ${marker.severity || 'Unknown'}`}
              description={`Status: ${marker.status} - Contact: ${marker.contact || 'N/A'}`}
            />
          ))}
        </MapView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default LiveMapScreen;