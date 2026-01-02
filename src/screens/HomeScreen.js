import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../services/firebaseConfig";

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
  fetch("http://192.168.8.184:5000/api/posts")
    .then(res => res.json())
    .then(data => {
      setPosts(data.posts || []);
    })
    .catch(err => console.log(err));
}, []);


  const filteredPosts = posts.filter(post => filter === "all" || post.category === filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      {/* Header */}
<View style={styles.header}>
  <View style={styles.logoRow}>
    <Ionicons name="shirt-outline" size={28} color="#5CA099" />
    <Text style={styles.logoText}>EASYSHOP</Text>
  </View>

  <Ionicons name="notifications-outline" size={28} color="#5CA099" />
</View>

      {/* Filtrage */}
      <View style={styles.filters}>
        {["all", "homme", "femme", "enfant"].map(cat => (
          <TouchableOpacity key={cat} style={styles.filterButton} onPress={() => setFilter(cat)}>
            <Text style={styles.filterText}>{cat.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Publications */}
      <FlatList
        data={filteredPosts}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            {/* Header publication */}
            <View style={styles.postHeader}>
              <Image source={{ uri: item.ownerProfilePicture }} style={styles.avatar} />
              <Text style={styles.ownerName}>{item.ownerName}</Text>
            </View>

            {/* Images (scroll horizontal) */}
            <ScrollView horizontal pagingEnabled>
              {item.images.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.postImage} />
              ))}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              <View style={styles.leftActions}>
                <TouchableOpacity>{/* Like icon */}<Ionicons name="heart-outline" size={25} /></TouchableOpacity>
                <TouchableOpacity>{/* Comment icon */}<Ionicons name="chatbubble-outline" size={25} /></TouchableOpacity>
              </View>
              <TouchableOpacity>{/* Save icon */}<Ionicons name="bookmark-outline" size={25} /></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center",paddingHorizontal: 15, marginTop: 20,  },
  filters: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10  , marginTop: 20, marginBottom: 10 },
  filterButton: { padding: 8, borderRadius: 20, borderWidth: 1, borderColor: "#5CA099" },
  filterText: { color: "#5CA099", fontWeight: "600" },
  post: { marginBottom: 20, borderRadius: 15, overflow: "hidden", backgroundColor: "#F9F9F9" },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 10 },
  avatar: { width: 35, height: 35, borderRadius: 17.5, marginRight: 10 },
  ownerName: { fontWeight: "600", color: "#333" },
  postImage: { width: 300, height: 300, marginHorizontal: 5, borderRadius: 10 },
  actions: { flexDirection: "row", justifyContent: "space-between", padding: 10 },
  leftActions: { flexDirection: "row", width: 80, justifyContent: "space-between" },
  logoRow: {flexDirection: "row",alignItems: "center"},
  logoText: {marginLeft: 8,fontSize: 22, fontWeight: "300",color: "#5CA099",letterSpacing: 2,},

});
