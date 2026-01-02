import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    try {
      const email = auth.currentUser?.email;
      const res = await fetch('http://192.168.8.184:5000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);

        // Si c'est un storeowner, récupère ses posts
        if (data.user.role === 'storeowner') {
          const postsRes = await fetch('http://192.168.8.184:5000/api/posts');
          const postsData = await postsRes.json();
          const userPosts = postsData.posts.filter(p => p.userId === data.user._id);
          setPosts(userPosts);
        }
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (err) {
      console.log('Erreur profil:', err.message);
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderGridItem = ({ item }) => (
    <View style={styles.gridItem}>
      <Image source={{ uri: item.images[0] }} style={styles.gridImage} />
    </View>
  );

  if (loading || !user) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Chargement...</Text>;

  const isStoreOwner = user.role === 'storeowner';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View />
        <TouchableOpacity>
          <Ionicons name="bag-handle-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Profil Infos */}
      <View style={styles.profileInfoContainer}>
        <View style={styles.headerRow}>
          <View style={styles.avatarBorder}>
            <Image source={{ uri: user.profilePicture }} style={styles.profileAvatar} />
          </View>

          <View style={styles.statsContainer}>
            {isStoreOwner && <View style={styles.statBox}><Text style={styles.statNumber}>{posts.length}</Text><Text style={styles.statLabel}>Posts</Text></View>}
            <View style={styles.statBox}><Text style={styles.statNumber}>{user.followers?.length || 0}</Text><Text style={styles.statLabel}>Followers</Text></View>
            <View style={styles.statBox}><Text style={styles.statNumber}>{user.followingStores?.length || 0}</Text><Text style={styles.statLabel}>Following</Text></View>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.userNameText}>{user.name.toUpperCase()}</Text>
          {isStoreOwner && user.bio && <Text style={styles.bioText}>{user.bio}</Text>}
        </View>

        {/* Boutons */}
        <View style={styles.actionButtonsRow}>
          {isStoreOwner ? (
            <>
              <TouchableOpacity style={styles.addPostBtn} onPress={() => navigation.navigate('AddPost')}>
                <Text style={styles.addPostText}>ADD A POST</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('EditProfile')}>
                <Text style={styles.editProfileText}>EDIT PROFILE</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.editProfileBtn, { flex: 1 }]} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editProfileText}>EDIT PROFILE</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Grille Posts pour storeowner */}
      {isStoreOwner && posts.length > 0 && (
        <FlatList
          data={posts}
          renderItem={renderGridItem}
          keyExtractor={item => item._id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Tab Navigation Basse */}
      <View style={styles.bottomTab}>
        <TouchableOpacity><Ionicons name="home-outline" size={26} color="#8E8E93" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="search-outline" size={26} color="#8E8E93" /></TouchableOpacity>
        {isStoreOwner && <TouchableOpacity style={styles.centerIcon}><Ionicons name="add-circle" size={30} color="#5CA099" /></TouchableOpacity>}
        <TouchableOpacity><Ionicons name="chatbubble-outline" size={26} color="#8E8E93" /></TouchableOpacity>
        <TouchableOpacity><Ionicons name="person" size={26} color="#333" /></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  profileInfoContainer: { paddingHorizontal: 20, marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarBorder: { padding: 3, borderRadius: 50, borderWidth: 1, borderColor: '#FF8A70' },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginLeft: 20 },
  statBox: { alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statLabel: { fontSize: 12, color: '#8E8E93' },
  bioContainer: { marginTop: 15 },
  userNameText: { fontSize: 18, fontWeight: 'bold', letterSpacing: 1, color: '#333' },
  bioText: { fontSize: 14, color: '#666', marginTop: 5, lineHeight: 18 },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  addPostBtn: { backgroundColor: '#000', flex: 0.48, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  addPostText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  editProfileBtn: { backgroundColor: '#E0A391', flex: 0.48, height: 45, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  editProfileText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  gridContainer: { paddingHorizontal: 2 },
  gridItem: { width: width / 3 - 4, height: width / 3 - 4, margin: 2 },
  gridImage: { width: '100%', height: '100%', borderRadius: 8 },
  bottomTab: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 60, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
  centerIcon: { padding: 5 },
});
