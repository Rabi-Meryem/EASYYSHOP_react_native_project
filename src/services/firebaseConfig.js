import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp9lCwttkbYxS2gHQQ5V0IrcjEXOS-QLc",
  authDomain: "easyshop-da665.firebaseapp.com",
  projectId: "easyshop-da665",
  storageBucket: "easyshop-da665.firebasestorage.app",
  messagingSenderId: "862981589236",
  appId: "1:862981589236:web:a212fbdedfac8cdfdd76a1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Auth avec persistance sur AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// API URL
export const API_URL = "http://192.168.194.151:5000/api";

// Fonctions posts
export const getPosts = () => fetch(`${API_URL}/posts`).then(res => res.json());
export const likePost = (postId, userId) =>
  fetch(`${API_URL}/posts/${postId}/like`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId}) });
export const commentPost = (postId, userId, text) =>
  fetch(`${API_URL}/posts/${postId}/comment`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId, text}) });
export const savePost = (postId, userId) =>
  fetch(`${API_URL}/posts/${postId}/save`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({userId}) });
