import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";

const ReportScreen: React.FC = () => {
  const auth = getAuth();
  const navigation = useNavigation<NavigationProp<any>>();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }
      const locationData = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });
    } catch (error) {
      console.error("Location Error:", error);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });
  
      if (!result.canceled && result.assets?.length > 0) {
        setLoading(true);
        const imageUri = result.assets[0].uri;
        
        // Upload to Firebase Storage
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const fileName = `images/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;
        const storageRef = ref(storage, fileName);
        
        // Upload with metadata
        const metadata = {
          contentType: 'image/jpeg',
          customMetadata: {
            createdAt: new Date().toISOString()
          }
        };
  
        await uploadBytes(storageRef, blob, metadata);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log("Image uploaded successfully:", downloadURL);
        setSelectedImage(downloadURL); // Store Firebase URL instead of base64
        Alert.alert("Success", "Image uploaded successfully!");
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const recordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.outputFormat,
      audioEncoder: Audio.RecordingOptionsPresets.HIGH_QUALITY.android.audioEncoder,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
    },
    ios: {
      extension: ".m4a",
      outputFormat: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.outputFormat,
      audioQuality: Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.audioQuality,
      sampleRate: 44100,
      numberOfChannels: 2,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };


  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Microphone access is required.");
        return;
      }
  
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
  
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (error) {
      console.error("Recording Error:", error);
    }
  };
  

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      console.log("Stopping recording...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        Alert.alert("Recording Error", "No audio file found.");
        return;
      }
  
      console.log("Starting upload immediately...");
      setLoading(true);
  
      try {
        // Create blob from URI with proper type
        const response = await fetch(uri);
        const blobData = await response.blob();
        const blob = new Blob([blobData], { type: 'audio/mpeg' });
  
        // Generate unique filename
        const fileName = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.m4a`;
        const storageRef = ref(storage, `recordings/${fileName}`);
  
        // Upload with proper metadata
        const metadata = {
          contentType: 'audio/mpeg',
          customMetadata: {
            createdAt: new Date().toISOString(),
            originalName: fileName
          }
        };
  
        await uploadBytes(storageRef, blob, metadata);
        const downloadURL = await getDownloadURL(storageRef);
        
        console.log("Audio uploaded successfully:", downloadURL);
        setAudioUri(downloadURL);
        Alert.alert("Success", "Audio recorded and uploaded successfully!");
  
      } catch (error: any) {
        console.error("Upload Error Details:", {
          code: error.code,
          message: error.message,
          serverResponse: error.serverResponse
        });
        Alert.alert(
          "Upload Error", 
          `Failed to upload: ${error.message || 'Unknown error'}`
        );
      }
  
    } catch (error: any) {
      console.error("Recording Error:", error);
      Alert.alert("Error", "Failed to stop recording.");
    } finally {
      setLoading(false);
    }
  };
  
  const uploadAudio = async (uri: string) => {
    try {
      console.log("Uploading audio from:", uri);
  
      // Fetch the local file
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Failed to fetch audio file.");
  
      const blob = await response.blob();
      const fileName = `audio_reports/${Date.now()}.m4a`;
      const storageRef = ref(storage, fileName);
  
      // ✅ Use correct contentType "audio/mp4" instead of "audio/m4a"
      const snapshot = await uploadBytes(storageRef, blob, { contentType: "audio/mp4" });
  
      console.log("Upload complete, getting download URL...");
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Audio URL:", downloadURL);
  
      return downloadURL;
    } catch (error) {
      console.error("Audio Upload Error:", error);
      Alert.alert("Upload Error", "Failed to upload audio.");
      return null;
    }
  };
  
  

  // Update submitReport function to use the Firebase URL directly
const submitReport = async () => {
  if (!selectedImage || !severity || !contactNumber || !location) {
    Alert.alert("Error", "Please fill all fields and upload an image.");
    return;
  }
  
  setLoading(true);
  try {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Please login first");
      return;
    }

    let audioUrl = null;
    if (audioUri) {
      audioUrl = audioUri; // Already a Firebase URL
    }

    const reportData = {
      image: selectedImage, // Already a Firebase URL
      severity,
      contact: contactNumber,
      location,
      audio: audioUrl,
      userId: user.uid,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, "reports"), reportData);

    setSelectedImage(null);
    setSeverity("");
    setContactNumber("");
    setAudioUri(null);
    navigation.navigate("Home");
  } catch (error) {
    console.error("Error:", error);
    Alert.alert("Error", "Failed to submit report.");
  } finally {
    setLoading(false);
  }
};
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Report an Accident</Text>
        </View>
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={loading}>
          <Text style={styles.uploadText}>{selectedImage ? "📷 Change Photo" : "📷 Upload Photo"}</Text>
        </TouchableOpacity>
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.preview} resizeMode="cover" />}
        <TextInput placeholder="Severity (High, Medium, Low)" style={styles.input} value={severity} onChangeText={setSeverity} editable={!loading} />
        <TouchableOpacity style={styles.voiceButton} onPress={recording ? stopRecording : startRecording}>
          <Text style={styles.voiceText}>{recording ? "🎙 Stop Recording" : "🎙 Record Voice"}</Text>
        </TouchableOpacity>
        <TextInput placeholder="Contact Number" style={styles.input} keyboardType="phone-pad" value={contactNumber} onChangeText={setContactNumber} editable={!loading} />
        <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={submitReport} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>🚨 Submit Report</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  uploadText: {
    color: "#fff",
    fontWeight: "bold",
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  voiceButton: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  voiceText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#888",
  },
});
