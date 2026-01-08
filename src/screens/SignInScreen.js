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
      console.log("Tentative de connexion Firebase...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Firebase connecté avec succès, UID:", userCredential.user.uid);
      
      const firebaseUid = userCredential.user.uid;
      const apiUrl = "http://192.168.0.115:5000/api/auth/profile";
      
      console.log("🔄 Tentative de récupération du profil utilisateur...");
      console.log("URL de l'API:", apiUrl);
      
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ firebaseUid }),
        });

        console.log("📡 Réponse du serveur reçue, statut:", response.status);
        
        let data;
        try {
          data = await response.json();
          console.log("📋 Données brutes de la réponse:", JSON.stringify(data, null, 2));
        } catch (parseError) {
          console.error("❌ Erreur lors du parsing de la réponse:", parseError);
          throw new Error("La réponse du serveur est invalide");
        }

        if (response.ok) {
          if (data && data.user) {
            console.log("👤 Données utilisateur reçues:", data.user);
            await AsyncStorage.setItem("user", JSON.stringify(data.user));
            console.log("💾 Utilisateur enregistré dans AsyncStorage");
            
            Alert.alert("✅ Connexion réussie !");
            navigation.replace("AppTabs");
          } else {
            console.error("❌ Données utilisateur manquantes dans la réponse");
            Alert.alert("Erreur", "Données utilisateur manquantes");
          }
        } else {
          console.error("❌ Erreur API:", data.message || "Erreur inconnue");
          Alert.alert("Erreur", data.message || "Erreur lors de la connexion");
        }
      } catch (apiError) {
        console.error("❌ Erreur lors de l'appel API:", {
          message: apiError.message,
          stack: apiError.stack,
          name: apiError.name
        });
        throw apiError;
      }
    } catch (err) {
      console.error("❌ Erreur de connexion complète:", {
        message: err.message,
        code: err.code,
        name: err.name
      });
      
      let errorMessage = "Erreur de connexion";
      
      // Gestion des erreurs courantes
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = "Erreur réseau. Vérifiez votre connexion Internet";
      } else if (err.message.includes('Network request failed')) {
        errorMessage = "Impossible de joindre le serveur. Vérifiez votre connexion";
      }
      
      Alert.alert("Erreur", errorMessage);
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
