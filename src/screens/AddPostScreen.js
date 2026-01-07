import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

export default function AddPostScreen({ navigation }) {
  const [images, setImages] = useState([]);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 🔹 Récupérer l'utilisateur connecté depuis AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (err) {
        console.log("Erreur récupération user:", err.message);
      }
    };
    fetchUser();
  }, []);

  // 📸 Ajouter image (base64)
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].base64]);
    }
  };

  // 📦 Toggle size
  const toggleSize = (size) => {
    setSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  // 🚀 Publier le post
  const handlePublish = async () => {
    if (!user) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return;
    }

    if (!productName || !price || images.length === 0 || !category|| !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    const fullDescription = `
${productName}
Price: ${price} DH
Sizes: ${sizes.join(', ')}
Colors: ${colors}

${description}
    `.trim();
console.log("Description envoyée :", fullDescription);
    try {
      const res = await fetch('http://192.168.0.115:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.firebaseUid,
          username: user.name,
          userProfilePicture: user.profilePicture,
          category,
          images,
          description: fullDescription,
          price,
          sizes,
          colors
        })
      });

      const data = await res.json();
         console.log("Réponse backend :", data);
      if (res.ok) {
        Alert.alert('Succès', 'Post publié avec succès');
        navigation.navigate('Home', { refresh: true });

      } else {
        Alert.alert('Erreur', data.message || 'Publication échouée');
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>Add a Product</Text>

      {/* Images */}
      <ScrollView horizontal style={{ marginBottom: 15 }}>
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: `data:image/jpeg;base64,${img}` }}
            style={styles.image}
          />
        ))}
        <TouchableOpacity style={styles.addImage} onPress={pickImage}>
          <Text style={{ fontSize: 30 }}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Product name */}
      <TextInput
        placeholder="Product name"
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
      />

      {/* Price */}
      <TextInput
        placeholder="Price (DH)"
        style={styles.input}
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      {/* Category */}
      <Text style={styles.label}>Category</Text>
      <View style={styles.row}>
        {['homme', 'femme', 'enfant'].map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryBox, category === cat && styles.selectedCategory]}
            onPress={() => setCategory(cat)}
          >
            <Text>{cat.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sizes */}
      <Text style={styles.label}>Sizes</Text>
      <View style={styles.row}>
        {['S', 'M', 'L', 'XL'].map(size => (
          <TouchableOpacity
            key={size}
            style={[styles.sizeBox, sizes.includes(size) && styles.selectedSize]}
            onPress={() => toggleSize(size)}
          >
            <Text>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Colors */}
      <TextInput
        placeholder="Colors (ex: Red, Blue)"
        style={styles.input}
        value={colors}
        onChangeText={setColors}
      />

      {/* Description */}
      <TextInput
        placeholder="Description"
        style={[styles.input, { height: 100 }]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      {/* Publish */}
      <TouchableOpacity style={styles.publishBtn} onPress={handlePublish}>
        <Text style={styles.publishText}>
          {loading ? 'Publishing...' : 'Publish'}
        </Text>
      </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { 
    padding: 20,
    paddingBottom: 40 // Ajoute un peu d'espace en bas pour le clavier
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  row: { flexDirection: 'row', marginBottom: 15 },
  sizeBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5
  },
  selectedSize: { backgroundColor: '#E0A391' },
  categoryBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginRight: 10,
    borderRadius: 5
  },
  selectedCategory: { backgroundColor: '#E0A391' },
  image: { width: 100, height: 100, marginRight: 10, borderRadius: 8 },
  addImage: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  publishBtn: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    marginTop: 10
  },
  publishText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  }
});
