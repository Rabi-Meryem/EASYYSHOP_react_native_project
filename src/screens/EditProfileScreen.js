import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';//sert a ouvrir la galeire 


export default function EditProfileScreen({ navigation, route }) {
  const { user } = route.params;

  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [profileImage, setProfileImage] = useState(user.profilePicture || '');

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l’accès aux photos pour changer l’image');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, 
    });

    if (!result.canceled) {
      setProfileImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // Save updated profile
const handleSave = async () => {
  try {
    
    const res = await fetch('http://192.168.0.115:5000/api/profile/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: user.firebaseUid,
        name: name,
        bio: bio,
        profilePicture:profileImage,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert('Succès', 'Profil mis à jour !');
      navigation.goBack();
    } else {
      Alert.alert('Erreur', data.message);
    }
  } catch (err) {
    console.log('Fetch error:', err);
    Alert.alert('Erreur', 'Erreur réseau ou problème avec l’image');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close-outline" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Modifier Profil</Text>

        <TouchableOpacity onPress={handleSave}>
          <Ionicons name="checkmark-outline" size={28} color="#5CA099" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Image Profile */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}> Nom </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Write something about yourself..."
                multiline
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  scrollContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 40 },
  imageSection: { alignItems: 'center', marginBottom: 40 },
  imageContainer: { position: 'relative', marginBottom: 15 },
  profileImage: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F2F2F7' },
  cameraIconContainer: { position: 'absolute', right: 0, bottom: 5, backgroundColor: '#5CA099', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  changePhotoText: { color: '#5CA099', fontWeight: '600', fontSize: 15 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 25 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9F9F9', borderRadius: 12, paddingHorizontal: 15, height: 55, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#F0F0F0' },
  bioInput: { height: 120, paddingTop: 15, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#5CA099', height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 20, elevation: 5 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
