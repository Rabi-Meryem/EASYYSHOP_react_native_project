import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const handleSignIn = async () => {
    try {
      // 1️⃣ Connexion Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase connecté :",userCredential.user.uid);
      const firebaseUid = userCredential.user.uid; 
      // 2️⃣ Récupérer le profil depuis MongoDB
      const response = await fetch("http://192.168.0.115:5000/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseUid }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Connexion réussie !");
        console.log("Profil utilisateur :", data.user);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
         navigation.replace("AppTabs"); 

      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (err) {
      console.log("Erreur login :", err.message);
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
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {/* Bouton login */}
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          {/* Footer */}
          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.footerText}>
              Pas de compte ? <Text style={styles.linkBold}>S'inscrire</Text>
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
    paddingVertical: 20
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 28, fontWeight: '300', color: '#5CA099', letterSpacing: 3 },
  form: { width: '100%', marginBottom: 20 },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  inputContainer: {
    height: 55,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputActive: { borderColor: '#5CA099' },
  placeholderText: { color: '#C7C7CD', fontSize: 16 },
  inputText: { color: '#333', fontSize: 16, fontWeight: '500' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 30,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 20, color: '#333' },
  modalOption: {
    width: '100%',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  optionText: { fontSize: 18, color: '#5CA099', fontWeight: '500' },
  button: {
    backgroundColor: '#5CA099',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  footerLink: { marginTop: 25 },
  footerText: { color: '#8E8E93', fontSize: 14 },
  linkBold: { color: '#8E8E93', fontWeight: 'bold' },
});
