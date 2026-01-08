import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../services/firebaseConfig";


export default function CommentScreen({ route, navigation }) {
  const { postId } = route.params;
  const currentUser = auth.currentUser;
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const flatListRef = useRef(null);

  /* ================= BACKEND ================= */

  const fetchComments = async () => {
    try {
      const res = await fetch("http://192.168.0.115:5000/api/posts");
      const data = await res.json();
      const post = data.posts.find((p) => p._id === postId);
      
      // Vérifier et formater les commentaires pour s'assurer qu'ils ont les bons champs
      const formattedComments = (post?.comments || []).map(comment => ({
        ...comment,
        // S'assurer que les champs ont des valeurs par défaut si manquants
        userProfilePicture: comment.userProfilePicture || comment.userAvatar || '',
        username: comment.username || 'Utilisateur inconnu'
      }));
      
      console.log('Formatted comments:', formattedComments);
      setComments(formattedComments);
    } catch (err) {
      console.log("Erreur fetchComments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

 

const sendComment = async () => {
  if (!text.trim()) return;

  try {
    const res = await fetch("http://192.168.0.115:5000/api/posts/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId,
        userId: currentUser.uid,
        text,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log("Erreur sendComment:", res.status, data.message);
      return;
    }

    // ✅ mettre à jour le champ texte et les commentaires locaux
    setText("");
    setComments(data.comments);

    // ✅ fermer le clavier
    Keyboard.dismiss();

    // ✅ optionnel : informer HomeScreen / ProfilScreen pour incrémenter le compteur
    if (route.params?.onCommentAdded) {
      route.params.onCommentAdded(data.commentsCount); // renvoie le nouveau nombre
    }

    

  } catch (err) {
    console.log("Erreur sendComment:", err);
  }
};

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch("http://192.168.0.115:5000/api/posts/delete-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          commentId,
          userId: currentUser.uid,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.log("Erreur deleteComment:", response.status, data.message);
        return;
      }
      
      // Mettre à jour les commentaires locaux
      setComments(data.comments);
      
      // Mettre à jour le compteur de commentaires dans l'écran précédent (HomeScreen)
      if (route.params?.onCommentAdded) {
        route.params.onCommentAdded(data.commentsCount);
      }
    } catch (err) {
      console.log("Erreur deleteComment:", err);
    }
  };

  /* ================= UI ================= */

  const renderItem = ({ item }) => {
    console.log('Comment item:', item); 
    return (
      <View style={styles.commentRow}>
        <Image 
          source={item.userProfilePicture ? { uri: item.userProfilePicture } : require('../assets/default-avatar.png')} 
          style={styles.userProfileImage} 
          defaultSource={require('../assets/default-avatar.png')}
        />
        
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUserName}>{item.username || 'Utilisateur inconnu'}</Text>
            {item.userId === currentUser?.uid && (
              <TouchableOpacity 
                onPress={() => deleteComment(item._id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={16} color="#d32f2f" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Commentaire</Text>
        <Ionicons name="ellipsis-horizontal" size={22} color="#333" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 90}
      >
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* INPUT STICKY */}
        <View style={styles.inputBar}>
          <Image
            source={{ uri: currentUser.photoURL }}
            style={styles.currentUserImage}
          />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Add a comment..."
            placeholderTextColor="#8E8E93"
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity style={styles.postButton} onPress={sendComment}>
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "android" ? 25 : 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  commentRow: { 
    flexDirection: "row", 
    alignItems: "flex-start", 
    marginBottom: 15,
    paddingHorizontal: 12,
  },
  commentContent: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 10,
    marginRight: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: { 
    fontWeight: "600", 
    fontSize: 14, 
    color: "#333",
    marginRight: 8,
  },
  commentText: { 
    fontSize: 15, 
    color: "#333",
    lineHeight: 20,
  },
  userProfileImage: { 
    width: 36, 
    height: 36, 
    borderRadius: 18,
    backgroundColor: '#e1e1e1',
  },
  deleteButton: {
    padding: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
    backgroundColor: "#fff",
  },
  currentUserImage: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, maxHeight: 100, color: "#333" },
  postButton: { backgroundColor: "#5CA099", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8, marginLeft: 10 },
  postButtonText: { color: "#fff", fontWeight: "bold" },
});
