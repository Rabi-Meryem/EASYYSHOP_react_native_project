import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../services/firebaseConfig";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation, route }) {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* ================= FETCH POSTS ================= */
  const fetchPosts = async () => {
    try {
      const res = await fetch("http://192.168.0.115:5000/api/posts");
      const data = await res.json();
      // S'assurer que chaque post a un compteur de commentaires valide
      const updatedPosts = data.posts.map(post => ({
        ...post,
        commentsCount: post.comments?.length || 0
      }));
      setPosts(updatedPosts);
    } catch (err) {
      console.log("Erreur posts :", err);
    }
  };

  useEffect(() => {
    fetchPosts();

    if (route.params?.refresh) {
      fetchPosts();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  /* ================= LIKE ANIMATION ================= */
  const animateLike = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.4,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ================= TOGGLE LIKE ================= */
  const toggleLike = async (postId) => {
    await fetch("http://192.168.0.115:5000/api/posts/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        userId: auth.currentUser.uid,
      }),
    });

    fetchPosts();
  };

  /* ================= FILTER POSTS ================= */
  const filteredPosts =
    filter === "all"
      ? posts
      : posts.filter((p) => p.category === filter);

  /* ================= RENDER POST ================= */
  const renderPost = ({ item }) => {
    const isLiked = item.likes?.includes(auth.currentUser?.uid);

    return (
      <View style={styles.post}>

        {/* ===== POST HEADER ===== */}
        <View style={styles.postHeader}>
          <Image
            source={{ uri: item.userProfilePicture }}
            style={styles.avatar}
          />
          <Text style={styles.ownerName}>{item.username}</Text>
        </View>

        {/* ===== POST IMAGE ===== */}
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.images[0]}` }}
          style={styles.postImage}
        />

        {/* ===== ACTIONS ===== */}
        <View style={styles.actions}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              onPress={() => {
                animateLike();
                toggleLike(item._id);
              }}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={26}
                  color={isLiked ? "red" : "#333"}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Comments", { 
                  postId: item._id, 
                  onCommentAdded: (newCount) => {
                    setPosts(prevPosts => 
                      prevPosts.map(p => 
                        p._id === item._id 
                          ? { ...p, commentsCount: newCount } 
                          : p
                      )
                    );
                    // Rafraîchir les données après un court délai pour s'assurer de la synchronisation
                    setTimeout(fetchPosts, 500);
                  }
                });
              }}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ===== LIKES ===== */}
        <Text style={styles.likesText}>
          {item.likes?.length || 0} likes
        </Text>

        {/* ===== DESCRIPTION ===== */}
        <Text style={styles.description}>
          <Text style={styles.ownerName}>{item.username} </Text>
          {item.description}
        </Text>

        {/* ===== COMMENTS ===== */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Comments", { postId: item._id })
          }
        >
          <Text style={styles.commentText}>
            Voir les {item.commentsCount || 0} commentaires
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {/* ===== HEADER APP ===== */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Ionicons name="shirt-outline" size={28} color="#5CA099" />
          <Text style={styles.logoText}>EASYSHOP</Text>
        </View>
        <TouchableOpacity onPress={() => {
          auth.signOut().then(() => navigation.replace('SignIn'));
        }}>
          <Ionicons name="log-out-outline" size={26} color="#5CA099" />
        </TouchableOpacity>
      </View>

      {/* ===== FILTERS ===== */}
      <View style={styles.filters}>
        {["all", "homme", "femme", "enfant"].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.filterButton,
              filter === cat && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(cat)}
          >
            <Text
              style={[
                styles.filterText,
                filter === cat && styles.filterTextActive,
              ]}
            >
              {cat.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== POSTS ===== */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 10,
  },

  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: {
    marginLeft: 8,
    fontSize: 22,
    fontWeight: "300",
    color: "#5CA099",
    letterSpacing: 2,
  },

  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 15,
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5CA099",
  },

  filterButtonActive: {
    backgroundColor: "#5CA099",
  },

  filterText: {
    color: "#5CA099",
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFF",
  },

  post: {
    marginBottom: 25,
    backgroundColor: "#FFF",
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

  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },

  ownerName: {
    fontWeight: "600",
    color: "#333",
  },

  postImage: {
    width: '100%',
    aspectRatio: 1, // Pour des images carrées
    resizeMode: 'contain', // Pour s'assurer que toute l'image est visible
    backgroundColor: '#f5f5f5',
  },

  actions: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  leftActions: {
    flexDirection: "row",
    width: 70,
    justifyContent: "space-between",
  },

  likesText: {
    fontWeight: "600",
    paddingHorizontal: 10,
  },

  description: {
    paddingHorizontal: 10,
    marginTop: 5,
    color: "#333",
  },

  commentText: {
    paddingHorizontal: 10,
    marginTop: 5,
    color: "#8E8E93",
  },
});
