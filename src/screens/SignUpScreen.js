import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  SafeAreaView,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [role, setRole] = useState("client");
  const [modalVisible, setModalVisible] = useState(false);

  const categories = ["Client", "Propriétaire de store"];

  // Ouvrir la galerie pour choisir une photo
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire !");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log("Firebase User créé :", firebaseUser.uid);

      const response = await fetch("http://192.168.0.115:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid, name, email, profilePicture, role }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Inscription réussie !");
       // navigation.navigate("SignIn");
        navigation.replace("AppTabs");
      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (err) {
      console.log("Erreur signup :", err.message);
      Alert.alert("Erreur", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="shirt-outline" size={50} color="#5CA099" />
          <Text style={styles.logoText}>EASYSHOP</Text>
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Choix photo */}
          <TouchableOpacity style={styles.inputContainer} onPress={pickImage}>
            {profilePicture ? (
              <Image source={{ uri: profilePicture }} style={styles.profileImage} />
            ) : (
              <Text style={styles.inputTextPlaceholder}>Photo de profil (tap to upload)</Text>
            )}
            <Ionicons name="chevron-down" size={18} color="#C7C7CD" />
          </TouchableOpacity>

          {/* Choix catégorie */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setModalVisible(true)}
          >
            <Text style={role ? styles.inputText : styles.inputTextPlaceholder}>
              {role ? role : "Category"}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#C7C7CD" />
          </TouchableOpacity>
        </View>

        {/* Modal pour choisir la catégorie */}
        <Modal transparent visible={modalVisible} animationType="slide">
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalContent}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.modalOption}
                  onPress={() => {
                    setRole(item === "Client" ? "client" : "storeowner");
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Bouton S'inscrire */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.footerText}>
            Déjà un compte ? <Text style={styles.linkBold}>Se connecter</Text>
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, width: '100%' },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    alignItems: 'center'
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 28, fontWeight: '300', color: '#5CA099', letterSpacing: 2, marginTop: 10 },
  form: { width: '100%', marginBottom: 20 },
  input: { height: 50, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, color: '#333' },
  inputContainer: { height: 50, borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputTextPlaceholder: { fontSize: 16, color: '#C7C7CD' },
  inputText: { fontSize: 16, color: '#333' },
  profileImage: { width: 35, height: 35, borderRadius: 18 },
  button: { backgroundColor: '#5CA099', width: '100%', height: 55, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  footerLink: { marginTop: 20 },
  footerText: { color: '#8E8E93', fontSize: 14 },
  linkBold: { color: '#8E8E93', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, alignItems: 'center' },
  modalOption: { width: '100%', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', alignItems: 'center' },
  optionText: { fontSize: 16, color: '#5CA099', fontWeight: '500' },
});
