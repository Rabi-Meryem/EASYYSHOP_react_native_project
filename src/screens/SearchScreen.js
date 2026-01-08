import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from "../services/firebaseConfig";

// Exemple de données de test (à remplacer par l'API réelle)
const MOCK_USERS = [
  {
    id: '1',
    name: 'Jean Dupont',
    username: 'jeandupont',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    isStore: false
  },
  {
    id: '2',
    name: 'Boutique Fashion',
    username: 'fashion_shop',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    isStore: true
  },
  // Ajoutez plus d'utilisateurs de test si nécessaire
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Fonction de recherche
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulation d'un appel API
      // Remplacez cette partie par un véritable appel à votre API
      const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      setSearchResults(data.users || MOCK_USERS);
      
      // Mettre à jour les recherches récentes
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      // En cas d'erreur, utiliser les données de test
      setSearchResults(MOCK_USERS.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase())
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour afficher un utilisateur
  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => {
        // Navigation vers le profil de l'utilisateur ou de la boutique
        if (item.isStore) {
          navigation.navigate('StoreProfile', { storeId: item.id });
        } else {
          navigation.navigate('UserProfile', { userId: item.id });
        }
      }}
    >
      <Image 
        source={{ uri: item.avatar }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
      {item.isStore && (
        <View style={styles.storeBadge}>
          <Ionicons name="storefront" size={16} color="#5CA099" />
          <Text style={styles.storeText}>Boutique</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Afficher les recherches récentes ou les résultats
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5CA099" />
        </View>
      );
    }

    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
        </View>
      );
    }

    if (searchQuery) {
      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.resultsList}
        />
      );
    }

    // Afficher les recherches récentes
    if (recentSearches.length > 0) {
      return (
        <View style={styles.recentSearches}>
          <Text style={styles.sectionTitle}>Recherches récentes</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.recentSearchItem}
              onPress={() => {
                setSearchQuery(search);
                handleSearch(search);
              }}
            >
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.recentSearchText}>{search}</Text>
              <Ionicons 
                name="close" 
                size={20} 
                color="#999" 
                style={styles.closeIcon}
                onPress={(e) => {
                  e.stopPropagation();
                  setRecentSearches(prev => prev.filter((_, i) => i !== index));
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // État initial
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={50} color="#ccc" />
        <Text style={styles.emptyText}>Recherchez des utilisateurs ou des boutiques</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des utilisateurs ou des boutiques..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contenu */}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  resultsList: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  username: {
    color: '#666',
    marginTop: 2,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  storeText: {
    marginLeft: 4,
    color: '#5CA099',
    fontSize: 12,
    fontWeight: '500',
  },
  recentSearches: {
    padding: 15,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    fontSize: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recentSearchText: {
    marginLeft: 10,
    color: '#333',
    flex: 1,
  },
  closeIcon: {
    padding: 5,
  },
});
