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
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================
      FETCH PROFILE
  ===================== */
  const fetchUserProfile = async () => {
    try {
      const firebaseUid = auth.currentUser?.uid;

      const res = await fetch('http://192.168.0.115:5000/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);

        if (data.user.role === 'storeowner') {
          const postsRes = await fetch('http://192.168.0.115:5000/api/posts');
          const postsData = await postsRes.json();
          const userPosts = postsData.posts.filter(
            p => p.userId === firebaseUid
          );
          setPosts(userPosts);
        }
      } else {
        Alert.alert('Erreur', data.message);
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUserProfile);
    return unsubscribe;
  }, [navigation]);

  /* =====================
      NAVIGATION BUTTONS
  ===================== */
  const goToAddPost = () => navigation.navigate('AddPost');
  const goToEditProfile = () => navigation.navigate('EditProfile', { user });
  const goToSavedPosts = () => navigation.navigate('SavedPosts');

  /* =====================
      LIKE / UNLIKE
  ===================== */
  const toggleLike = async (post) => {
    try {
      const res = await fetch('http://192.168.0.115:5000/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          userId: user.firebaseUid
        }),
      });

      if (res.ok) {
        setPosts(prev =>
          prev.map(p =>
            p._id === post._id
              ? {
                  ...p,
                  likes: p.likes.includes(user.firebaseUid)
                    ? p.likes.filter(l => l !== user.firebaseUid)
                    : [...p.likes, user.firebaseUid]
                }
              : p
          )
        );
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  /* =====================
      COMMENTS (➡ CommentScreen)
  ===================== */
  const openComments = (post) => {
    navigation.navigate('Comments', {
      postId: post._id,
    });
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.images[0]}` }}
        style={styles.postImage}
      />

      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={() => toggleLike(item)} style={styles.actionBtn}>
          <Ionicons
            name={item.likes.includes(user.firebaseUid) ? 'heart' : 'heart-outline'}
            size={22}
            color="#E91E63"
          />
          <Text style={styles.actionText}>{item.likes.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => openComments(item)} style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={22} color="#333" />
          <Text style={styles.actionText}>{item.comments.length}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading || !user) {
    return <Text style={{ marginTop: 50, textAlign: 'center' }}>Chargement...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* EN-TÊTE AVEC NOM D'UTILISATEUR */}
      <View style={styles.topHeader}>
        <Text style={styles.topHeaderText}>{user.name}</Text>
      </View>

      <ScrollView>
        {/* PROFILE HEADER */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.headerRow}>
            <Image source={{ uri: user.profilePicture }} style={styles.profileAvatar} />

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{posts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.followers?.length || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{user.followingStores?.length || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.userNameText}>{user.name}</Text>
          {user.bio && <Text style={styles.bioText}>{user.bio}</Text>}

          {/* BUTTONS */}
          <View style={styles.buttonsRow}>
            {user.role === 'storeowner' && (
              <>
                <TouchableOpacity style={styles.actionButton} onPress={goToAddPost}>
                  <Text style={styles.buttonText}>Ajouter un Post</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.editProfileButton} onPress={goToEditProfile}>
                  <Text style={styles.editProfileText}>Modifer Profil</Text>
                </TouchableOpacity>
              </>
            )}

            {user.role === 'client' && (
              <>
                <TouchableOpacity style={styles.outlineButton} onPress={goToEditProfile}>
                  <Text style={styles.editProfileText}>Modifier Profil</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.outlineButton} onPress={goToSavedPosts}>
                  <Text>Enregistrement</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={item => item._id}
          scrollEnabled={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* =====================
      STYLES
===================== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topHeader: {
    paddingTop: 35,  // Augmenté pour déplacer le contenu plus bas
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    // Ajout d'une ombre légère pour une meilleure séparation visuelle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10, // Pour s'assurer que l'en-tête reste au-dessus du contenu défilant
  },
  topHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileInfoContainer: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  statsContainer: { flexDirection: 'row', flex: 1, justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statNumber: { fontWeight: 'bold', fontSize: 16 },
  statLabel: { fontSize: 12, color: '#100101ff' },

  userNameText: { marginTop: 10, fontSize: 18, fontWeight: 'bold' },
  bioText: { color: '#666', marginTop: 5 },

  buttonsRow: { flexDirection: 'row', marginTop: 20, gap: 10, justifyContent: 'space-between' },

  actionButton: {
    backgroundColor: '#5CA099',
    padding: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center'
  },

  buttonText: { color: '#fff', fontWeight: '600' },

  outlineButton: {
    backgroundColor: '#5CA099',
    padding: 10,
    paddingHorizontal: 28,
    borderRadius: 8
  },

  editProfileButton: {
    backgroundColor: '#5CA099',
    padding: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },

  editProfileText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Styles pour les posts
  postContainer: {
    marginBottom: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1, // Pour des images carrées
    resizeMode: 'contain', // Pour s'assurer que toute l'image est visible
    backgroundColor: '#f5f5f5',
  },
  description: {
    padding: 12,
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row',
    marginRight: 25,
    alignItems: 'center',
    padding: 5,
  },
  actionText: {
    marginLeft: 5,
    color: '#333',
    fontSize: 14,
  },
});
